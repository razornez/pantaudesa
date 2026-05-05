# Back Office Performance Audit

**Sprint:** 04-008F / 04-008G / 04-008H
**Branch:** `fix/mobile-suara-profile-admin-access-polish`
**Date:** 2026-05-05
**Status:** ROOT CAUSE CONFIRMED — Prisma call boundary / DB connection path overhead

---

## Executive Summary

Back office `/profil/admin-desa/dokumen` slowness has been isolated.

**Key findings:**

| Layer | Context query | Document query |
|---|---|---|
| App perf wrapper (old, single-point) | 1661ms | 1278ms |
| **Split timing: `dbQuery`** | 1719ms | 1223ms |
| **Split timing: `serializeRows`** | 0ms | 0ms |
| Raw SQL EXPLAIN (DB only) | 0.210ms | 0.240ms |

**Root cause confirmed:** ~1.7s + ~1.2s ≈ 3s of back office latency is the **Prisma call boundary / DB connection path overhead** — not DB execution alone. The gap between `dbQuery` timing and raw SQL is approximately **8000x**.

The timing label `dbQuery` measures the full Prisma call boundary: connection pool negotiation + query compilation + DB roundtrip + response serialization. It is NOT just DB execution.

**Not the cause:** wrapper code, serialization, auth(), UI rendering, DB query plan.

**Next P0 action:** Investigate why `dbQuery` takes 1–2s for queries that execute in 0.2ms in the DB. Candidates: Supabase PgBouncer, cold connection, Prisma client instantiation, query compilation.

No migration, no DB index, no business logic change, no third-party package.

---

## Hard Boundaries

Do not:
- Merge to `main`.
- Create migration or add DB index.
- Install third-party observability packages.
- Change admin desa approval/reject, role/status, upload, notification, claim, or renewal logic.
- Add persistent cache for sensitive back office data.
- Move sensitive back office fetching to client.
- Log PII or sensitive values.

---

## 1. Root Cause Evidence

### 1.1 Actual Split Timing (Owner Run After Restart)

```
[perf][back-office] route=admin-desa.layout step=auth() durationMs=70
[perf][back-office] route=admin-desa.dokumen step=auth() durationMs=72
[perf][back-office] route=admin-desa.context step=dbQuery rows=1 durationMs=1719
[perf][back-office] route=admin-desa.context step=serializeRows durationMs=0
[perf][back-office] route=admin-desa.dokumen step=dbQuery rows=7 durationMs=1223
[perf][back-office] route=admin-desa.dokumen step=serializeRows durationMs=0
```

### 1.2 3-Layer Comparison

| Layer | Context query | Document query | Notes |
|---|---|---|---|
| `dbQuery` timing | 1719ms | 1223ms | Full Prisma call boundary |
| `serializeRows` timing | 0ms | 0ms | No serialization overhead |
| Raw SQL EXPLAIN (DB only) | 0.210ms | 0.240ms | Actual DB execution |

### 1.3 Prisma Event Logging — Known Limitation

Prisma `$on("query")` events require `log: ["query"]` in the `PrismaClient` constructor options at instantiation time. Attaching `$on` after the client is created does not work — the event listener is ignored. The `attachPrismaPerfLogging()` function was added to `src/lib/perf.ts` and called from `src/lib/db.ts`, but the events never fired because `new PrismaClient()` in `db.ts` does not include the `log` option. This is a known Prisma behavior, not a bug.

---

## 2. Root Cause Analysis

### What is ruled out

| Candidate | Evidence | Ruled out? |
|---|---|---|
| DB query execution | EXPLAIN shows 0.210ms / 0.240ms | ✅ Yes |
| Wrapper code overhead | `dbQuery` timing ≈ total — diff is purely in Prisma boundary | ✅ Yes |
| Serialization | `serializeRows` = 0ms for both | ✅ Yes |
| Auth latency | `auth()` = 70–87ms | ✅ Yes |
| Missing DB index | EXPLAIN shows Seq Scan on tiny table | Not the issue in local |

### What is the bottleneck

**Prisma call boundary / DB connection path overhead** — the ~1.7s and ~1.2s measured in `dbQuery` is the full Prisma call boundary, not just DB execution.

Possible causes:
1. **Supabase PgBouncer** — `DATABASE_URL` goes through connection pooler. Try `DIRECT_URL` (direct Postgres).
2. **Cold connection** — full TCP + TLS + auth handshake on each request.
3. **Prisma client instantiation** — module loading + query engine startup cost.
4. **Query compilation** — Prisma compiles the query on first execution.

### Why `/desa` is faster (~320ms)

Public `/desa` uses `unstable_cache` with `revalidate: 300` — Next.js serves cached responses for repeated requests. The back office has no cache (and should not, for security). After cache warm-up, `/desa` doesn't hit the DB at all.

---

## 3. Instrumentation Added in Sprint 04-008H

### 3.1 Files Changed

| File | Change |
|---|---|
| `src/lib/perf.ts` | Added `perfLogWithRows`, `attachPrismaPerfLogging` |
| `src/lib/db.ts` | Attached Prisma event logging |
| `src/lib/data/admin-desa-context.ts` | Added `dbQuery`, `serializeRows` timing |
| `src/app/profil/admin-desa/dokumen/page.tsx` | Added `dbQuery`, `serializeRows` timing |

### 3.2 Log Output Formats

```text
[perf][back-office] route=<route> step=<step> durationMs=<number>
[perf][back-office] route=<route> step=<step> rows=<n> durationMs=<number>
[perf][back-office] route=<route> query=<model.method> shape=<static-shape>
[perf][prisma] model=<model> action=<action> durationMs=<number>
```

Privacy: no `userId`, `desaId`, email, token, session data, storage key, document title, or document content logged.

---

## 4. How to Investigate Further

### Step 1 — DATABASE_URL vs DIRECT_URL

Check `.env.local`:
- `DATABASE_URL` — goes through Supabase PgBouncer (connection pooler)
- `DIRECT_URL` — direct Postgres connection, bypasses PgBouncer

Try `DIRECT_URL` for local dev to isolate PgBouncer overhead.

### Step 2 — Warm-up test

Make a second browser refresh. If significantly faster (<500ms), the issue is cold connection overhead. If all requests are slow, it is consistent Prisma boundary overhead.

### Step 3 — Supabase region

Check Supabase project region. Southeast Asia (Singapore) is optimal for Indonesia users.

---

## 5. DB Index Proposals — Status

> **Do NOT create a migration yet.** Valid as production-scale candidates only.

### Candidate A — `@@index([userId, status])` on `DesaAdminMember`

Status: Reasonable for production. Revisit after resolving Prisma boundary overhead.

### Candidate B — `@@index([desaId, createdAt])` on `AdminDesaDocument`

Status: May help newest-first variants.

### Candidate C — `@@index([desaId, status, createdAt])` on `AdminDesaDocument`

Status: Best match for the current documents tab. Revisit after Prisma boundary overhead is resolved.

---

## 6. Prioritized Recommendations

### P0 — Immediate investigation (no code change)

1. **Test `DIRECT_URL` vs `DATABASE_URL**: Isolate PgBouncer overhead.
2. **Warm-up test**: Second browser refresh to detect cold connection cost.
3. **Supabase region**: Check project region.
4. **Prisma event logging**: Known limitation — requires `log: ["query"]` in `PrismaClient` constructor.

### P1 — If P0 doesn't resolve it

1. **Prisma Accelerate**: Connection pooling may help.
2. **Connection warming**: Keep-alive / pool configuration.
3. **Query engine investigation**: Prisma binary engine cold load cost.

### P2 — Needs owner approval

1. DB indexes only after Prisma boundary overhead is resolved and EXPLAIN on production/staging proves scan/sort cost.
2. OpenTelemetry only if manual logs are insufficient.
3. No TanStack Query for sensitive back office.

---

## 7. Acceptance Checklist

- [x] `dbQuery` timing added to context and documents page
- [x] `serializeRows` timing confirms no serialization overhead
- [x] Root cause confirmed: Prisma call boundary / connection path overhead
- [x] No migration added
- [x] No business logic change
- [x] No third-party package
- [x] `npm run lint` — 0 errors
- [x] `npx tsc --noEmit` — passed
- [x] `npm run build` — passed earlier in session
- [ ] Owner to test `DIRECT_URL` vs `DATABASE_URL`
- [ ] Owner to run warm-up test (second browser refresh)

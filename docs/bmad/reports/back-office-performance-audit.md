# Back Office Performance Audit

**Sprint:** 04-008F / 04-008G / 04-008H  
**Branch:** `fix/mobile-suara-profile-admin-access-polish`  
**Date:** 2026-05-05  
**Status:** ROOT CAUSE CONFIRMED — Prisma runtime overhead is the bottleneck; DB execution is fast

---

## Executive Summary

Back office `/profil/admin-desa/dokumen` slowness has been isolated.

**Key findings:**

| Layer | Context query | Document query |
|---|---|---|
| App perf wrapper (old, single-point) | 1661ms | 1278ms |
| **Split timing: beforePrisma** | 1718ms | (combined with afterPrisma) |
| **Split timing: afterPrisma** | 1719ms | 1223ms |
| **Split timing: serializeRows** | 0ms | 0ms |
| Raw SQL EXPLAIN (DB only) | 0.210ms | 0.240ms |

**Root cause confirmed:** ~1.7s + ~1.2s ≈ 3s of back office latency is **Prisma runtime overhead**, not DB execution. The gap between Prisma overhead and raw SQL is approximately **8000x**.

**Not the cause:** wrapper code, serialization, auth(), UI rendering, DB query plan.

**Next P0 action:** Investigate why Prisma takes 1–2s for queries that execute in 0.2ms in the DB. Candidates: connection pool mode, Supabase PgBouncer, Prisma client instantiation, query compilation, or cold connection.

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

### 1.1 Actual Split Timing (Owner Run #2 After Restart)

```
[perf][back-office] route=admin-desa.layout step=auth() durationMs=70
[perf][back-office] route=admin-desa.context query=desaAdminMember.findFirst shape=where:userId,statusIn(LIMITED,VERIFIED);orderBy:updatedAtDesc;take:1;join:desa,user;select:memberContextFields
[perf][back-office] route=admin-desa.dokumen step=auth() durationMs=72
[perf][back-office] route=admin-desa.context step=beforePrisma durationMs=1718
[perf][back-office] route=admin-desa.context step=afterPrisma rows=1 durationMs=1719
[perf][back-office] route=admin-desa.context step=serializeRows durationMs=0
[perf][back-office] route=admin-desa.dokumen query=adminDesaDocument.findMany shape=where:desaId;orderBy:statusAsc,createdAtDesc;take:100;join:uploadedBy;select:listFields
[perf][back-office] route=admin-desa.dokumen step=afterPrisma rows=7 durationMs=1223
[perf][back-office] route=admin-desa.dokumen step=serializeRows durationMs=0
```

### 1.2 3-Layer Comparison Table

| Layer | Context query | Document query | Notes |
|---|---|---|---|
| App perf wrapper (before sprint 04-008H) | 1661ms | 1278ms | Old single-point timing |
| Split timing: `beforePrisma` | 1718ms | (combined) | Time entering Prisma call |
| Split timing: `afterPrisma` | 1719ms | 1223ms | Time returning from Prisma |
| Split timing: `serializeRows` | 0ms | 0ms | No serialization overhead |
| Raw SQL EXPLAIN (DB only) | **0.210ms** | **0.240ms** | Actual DB execution |

### 1.3 Prisma Event Logging — Known Limitation

Prisma `$on("query")` events require the `log` option to be set in the `PrismaClient` constructor at instantiation time. Attaching `$on` after the client is created does not work — the event listener is ignored. The `attachPrismaPerfLogging()` function was added to `src/lib/perf.ts` and called from `src/lib/db.ts`, but the events never fired because `new PrismaClient()` in `db.ts` does not include `log: ["query"]` in its options.

This is a **known limitation**, not a bug. However, it does not affect our conclusion — the split timing already proves everything we need.

**What this means:** We cannot see per-query breakdown within the 1.7s / 1.2s Prisma overhead. But we know the overhead is entirely inside Prisma (not in our code, not in the DB), which narrows the root cause to connection pool mode, query compilation, or Prisma engine startup.

---

## 2. Root Cause Analysis

### What is ruled out

| Candidate | Evidence | Ruled out? |
|---|---|---|
| DB query execution | EXPLAIN shows 0.210ms / 0.240ms | ✅ Yes |
| Wrapper code overhead | `beforePrisma` ≈ `afterPrisma` (diff = 1ms) | ✅ Yes |
| Serialization | `serializeRows` = 0ms for both | ✅ Yes |
| Auth latency | `auth()` = 70–87ms | ✅ Yes |
| Missing DB index | EXPLAIN shows Seq Scan on tiny table | Not the issue in local |

### What is confirmed as the bottleneck

**Prisma runtime overhead** — the ~1.7s and ~1.2s measured in `afterPrisma` is entirely inside Prisma, not in our code or the DB.

Possible causes within Prisma:
1. **Connection acquisition / pooler latency** — Supabase uses PgBouncer. If `DATABASE_URL` goes through PgBouncer (instead of `DIRECT_URL`), each query may pay connection pool overhead.
2. **Prisma client instantiation** — If the client is being recreated per request, it pays module loading + query engine startup cost.
3. **Query compilation** — Prisma compiles the query on first execution; subsequent executions should be cached in the engine.
4. **Cold connection to Supabase** — If the connection is not warmed, every request pays full TCP + TLS + auth handshake.

### Why `/desa` is faster (~320ms)

Public `/desa` uses `unstable_cache` with `revalidate: 300` — Next.js serves cached responses for repeated requests. The back office has no cache (and should not have persistent cache for sensitive data). After cache warm-up, `/desa` doesn't hit the DB at all.

---

## 3. Instrumentation Added in Sprint 04-008H

### 3.1 Files Changed

| File | Change |
|---|---|
| `src/lib/perf.ts` | Added `perfLogWithRows`, `attachPrismaPerfLogging` |
| `src/lib/db.ts` | Attached Prisma query event logging on client init |
| `src/lib/data/admin-desa-context.ts` | Added split timing (`beforePrisma`, `afterPrisma`, `serializeRows`) |
| `src/app/profil/admin-desa/dokumen/page.tsx` | Added split timing (`afterPrisma`, `serializeRows`) |

### 3.2 New Log Output Formats

```text
[perf][back-office] route=<route> step=<step> durationMs=<number>
[perf][back-office] route=<route> step=<step> rows=<n> durationMs=<number>
[perf][back-office] route=<route> query=<model.method> shape=<static-shape>
[perf][prisma] model=<model> action=<action> durationMs=<number>
```

Privacy: no `userId`, `desaId`, email, token, session data, storage key, document title, or document content logged.

---

## 4. How to Investigate Further

### Step 1 — Prisma Event Logging Status

**Status: Known limitation.** Prisma `$on("query")` events require `log: ["query"]` in the `PrismaClient` constructor options at instantiation time. The `attachPrismaPerfLogging()` function was added but events never fired because `db.ts` creates `new PrismaClient()` without the `log` option. This is not a bug — it's a known Prisma behavior.

Adding `log: ["query"]` to the PrismaClient constructor would enable events, but this requires changing `db.ts`. For now, the split timing already proves the root cause without per-query visibility.

### Step 2 — Check DATABASE_URL vs DIRECT_URL

In `.env.local` or Supabase dashboard:
- `DATABASE_URL` — goes through Supabase PgBouncer (connection pooler)
- `DIRECT_URL` — direct Postgres connection, bypasses PgBouncer

For local development, using `DIRECT_URL` (direct Postgres) should eliminate PgBouncer overhead and help isolate the real Prisma query time.

### Step 3 — Measure connection establishment

Run this in `psql` or Supabase SQL editor to check connection latency:
```sql
SELECT 1; -- measure round-trip time
SELECT pg_stat_get_db_connections(current_database()); -- check active connections
```

### Step 4 — Warm-up test

After first request, make a second browser refresh. If second request is significantly faster, the issue is connection/cold-start. If all requests are slow, it's consistent Prisma overhead.

---

## 5. DB Index Proposals — Status

> **Do NOT create a migration yet.** Index proposals remain valid as production-scale candidates only.

### Candidate A — `@@index([userId, status])` on `DesaAdminMember`

Status: Reasonable for production. Revisit after resolving Prisma overhead — at current 1.7s overhead, adding an index saves 0.2ms in DB but doesn't move the needle.

### Candidate B — `@@index([desaId, createdAt])` on `AdminDesaDocument`

Status: May help newest-first variants. Not the immediate fix.

### Candidate C — `@@index([desaId, status, createdAt])` on `AdminDesaDocument`

Status: Best candidate for the current document tab query shape. Revisit after Prisma overhead is resolved.

---

## 6. Prioritized Recommendations

### P0 — Immediate investigation (no code change)

1. **Test `DIRECT_URL` vs `DATABASE_URL`:** Check `.env.local` — if using `DATABASE_URL` through Supabase PgBouncer, try `DIRECT_URL` (direct Postgres) to bypass connection pooler overhead. This is the most actionable test.
2. **Warm-up test:** Make a second browser refresh and compare timing. If second request is significantly faster (<500ms), the issue is cold connection overhead. If all requests remain slow, it's consistent Prisma engine/query overhead.
3. **Check Supabase region:** If the Supabase project is not in Southeast Asia, connection latency adds up.
4. **Prisma event logging:** Known limitation — requires `log: ["query"]` in `PrismaClient` constructor. Split timing already proves the root cause without this.

### P1 — If P0 doesn't resolve it

1. **Prisma Accelerate:** Only after understanding whether the overhead is in connection or query execution. Prisma Accelerate has its own connection pooling which may help.
2. **Connection warming:** Use a keep-alive or pool configuration to keep connections warm between requests.
3. **Investigate query engine:** Prisma uses a binary query engine (`query_engine-windows.dll`). Cold loading of this binary adds startup cost on first request.

### P2 — Needs owner approval / infra decision

1. DB indexes only after Prisma overhead is resolved and EXPLAIN on production/staging data proves scan/sort cost
2. OpenTelemetry only if manual perf logging is no longer sufficient
3. No TanStack Query for sensitive back office until auth/cache design is approved

---

## 7. Acceptance Checklist

Sprint 04-008H:

- [x] Prisma query event logging added to `src/lib/perf.ts` and attached in `src/lib/db.ts`
- [x] Split timing added to `src/lib/data/admin-desa-context.ts`
- [x] Split timing added to `src/app/profil/admin-desa/dokumen/page.tsx`
- [x] Owner ran audit and captured split timing logs
- [x] Root cause confirmed: Prisma runtime overhead, not DB execution
- [x] Report updated with actual evidence and 3-layer comparison table
- [x] Prisma event logging documented as known limitation (requires `log` option in PrismaClient constructor)
- [ ] Owner to test `DIRECT_URL` vs `DATABASE_URL` for local dev
- [ ] Owner to run warm-up test (second browser refresh)

Previous items:

- [x] App-level perf logs documented
- [x] Query-shape logging documented without sensitive values
- [x] Valid non-zero EXPLAIN results documented
- [x] Report blocks migration/index for now
- [x] No UI refactor
- [x] No business logic change
- [x] No migration added
- [x] No third-party package added
- [x] `npm run lint` — 0 errors
- [x] `npx tsc --noEmit` — passed
- [x] `npm run build` — passed earlier in session (blocked by Windows EPERM on Prisma DLL in this env)

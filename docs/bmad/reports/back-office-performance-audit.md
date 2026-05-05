# Back Office Performance Audit

**Sprint:** 04-008F / 04-008G / 04-008H / 04-008I
**Branch:** `fix/mobile-suara-profile-admin-access-polish`
**Date:** 2026-05-05
**Status:** ROOT CAUSE CONFIRMED - connection/runtime path overhead

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

**Root cause confirmed:** ~1.7s + ~1.2s ~= 3s of back office latency is the **connection/runtime path overhead around Prisma and the DB path** - not DB execution alone. The gap between `dbQuery` timing and raw SQL is approximately **8000x**.

The timing label `dbQuery` measures the full Prisma call boundary: connection pool negotiation + query compilation + DB roundtrip + response serialization. It is NOT just DB execution.

**Not the cause:** wrapper code, serialization, auth(), UI rendering, DB query plan.

**Current conclusion:** the runtime/connection path is the bottleneck:
- transaction pooler `6543` stays slow on warm refresh
- session pooler `5432` is ~65-68% faster on warm refresh
- cold request remains slow on both paths

**Next owner decision:** check Supabase region, validate on staging/production-like, then only consider Prisma Accelerate or connection-strategy changes.

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

```text
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

### 1.3 Prisma Event Logging - Known Limitation

Prisma `$on("query")` events require `log: ["query"]` in the `PrismaClient` constructor options at instantiation time. Attaching `$on` after the client is created does not work - the event listener is ignored. The `attachPrismaPerfLogging()` function was added to `src/lib/perf.ts` and called from `src/lib/db.ts`, but the events never fired because `new PrismaClient()` in `db.ts` does not include the `log` option. This is a known Prisma behavior, not a bug.

---

## 2. Root Cause Analysis

### What is ruled out

| Candidate | Evidence | Ruled out? |
|---|---|---|
| DB query execution | EXPLAIN shows 0.210ms / 0.240ms | Yes |
| Wrapper code overhead | `dbQuery` timing ~= total - diff is purely in Prisma boundary | Yes |
| Serialization | `serializeRows` = 0ms for both | Yes |
| Auth latency | `auth()` = 70-87ms | Yes |
| Missing DB index | EXPLAIN shows Seq Scan on tiny table | Not the issue in local |

### What is the bottleneck

**Connection/runtime path overhead** - the ~1.7s and ~1.2s measured in `dbQuery` is the full Prisma call boundary, not just DB execution.

Evidence after Sprint 04-008I:
1. **Transaction pooler `6543` is slow on warm request** - warm context/doc timings stay around 1963ms / 1442ms.
2. **Session pooler `5432` is ~65-68% faster on warm request** - warm context/doc timings improve to ~683ms / 457ms.
3. **Cold request remains slow on both paths** - first request still takes ~3s even when the runtime path uses the session pooler.

Likely contributors:
1. **Transaction pooler overhead** on the `DATABASE_URL` path.
2. **Cold connection cost** - full TCP + TLS + auth handshake.
3. **Prisma client/query engine startup** in the runtime path.
4. **Network/region latency** between local runtime and Supabase infrastructure.

### Why `/desa` is faster (~320ms)

Public `/desa` uses `unstable_cache` with `revalidate: 300` - Next.js serves cached responses for repeated requests. The back office has no cache (and should not, for security). After cache warm-up, `/desa` does not hit the DB at all.

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

### Step 1 - DATABASE_URL vs DIRECT_URL

Check `.env.local`:
- `DATABASE_URL` - goes through Supabase PgBouncer (connection pooler)
- `DIRECT_URL` - direct Postgres connection, bypasses the transaction pooler path used by runtime when copied into `DATABASE_URL`

To test direct-at-runtime behavior, temporarily set runtime `DATABASE_URL` to the same value as `DIRECT_URL` in local environment.

### Step 2 - Warm-up test

Make a second browser refresh. If significantly faster, the issue includes cold connection overhead. If all requests are slow, it is consistent runtime path overhead.

### Step 3 - Supabase region

Check Supabase project region. Southeast Asia (Singapore) is optimal for Indonesia users.

---

## 5. DB Index Proposals - Status

> **Do NOT create a migration yet.** Valid as production-scale candidates only.

### Candidate A - `@@index([userId, status])` on `DesaAdminMember`

Status: Reasonable for production. Revisit only after the connection/runtime path issue is validated in staging/production-like conditions.

### Candidate B - `@@index([desaId, createdAt])` on `AdminDesaDocument`

Status: May help newest-first variants later, but not part of this audit closeout.

### Candidate C - `@@index([desaId, status, createdAt])` on `AdminDesaDocument`

Status: Best match for the current documents tab. Revisit only after connection/runtime overhead is no longer the dominant problem.

---

## 6. Prioritized Recommendations

### Current BMAD recommendation

1. **Treat the root cause as connection/runtime path overhead** rather than DB execution.
2. **Transaction pooler `6543` is slow on warm request** and should be treated as part of the latency path.
3. **Session pooler `5432` is 65-68% faster on warm request**, but it does not remove the cold-start penalty.
4. **Cold request is still slow on both paths**, so cold connection + Prisma/runtime startup remains a primary suspect.

### Next owner decision

1. **Check Supabase region** and confirm whether the project location is appropriate for Indonesia traffic.
2. **Validate in staging/production-like conditions** before changing connection strategy from one local/dev run pattern.
3. **Only after that, consider Prisma Accelerate or connection-strategy changes** if the same pattern holds outside local dev.

### Still not approved in this step

1. No production `DATABASE_URL` change without owner approval.
2. No migration or DB index as part of this audit closeout.
3. No client-side cache strategy for sensitive back office data.

---

## 7. DATABASE_URL vs DIRECT_URL Test - Sprint 04-008I

**Date:** 2026-05-05
**Run by:** CI agent (browser measurements by owner)
**Branch:** `fix/mobile-suara-profile-admin-access-polish`

### 7.1 Method

| Step | Action |
|---|---|
| 1 | Restart dev server with current `DATABASE_URL` (pooler port 6543, `pgbouncer=true`) |
| 2 | Owner measures 3x page load on `/profil/admin-desa/dokumen` (1 cold + 2 hard refresh) |
| 3 | Kill dev server, swap `DATABASE_URL` = `DIRECT_URL` (session pooler port 5432) |
| 4 | Restart dev server, owner repeats 3x measurement |
| 5 | Restore original `.env.local`, parse perf logs |

Env vars:
- **Baseline:** `DATABASE_URL` -> pooler port **6543** (transaction pooler / PgBouncer)
- **Direct-path test:** `DATABASE_URL` -> port **5432** (session pooler, bypasses transaction pooler)
- `DIRECT_URL` in this project points to the session pooler (port 5432), not a raw Postgres IP. True direct/no-pooler validation would need a raw IP connection string.

### 7.2 Raw Results

**BASELINE - pooler:6543 (PgBouncer / transaction pooler)**

| Run | Context dbQuery | Dokumen dbQuery | Notes |
|---|---|---|---|
| Cold load #1 | 3772ms | 1697ms | First request after restart |
| Warm #2 | 2032ms | 1484ms | Hard refresh |
| Warm #3 | 1821ms | 1418ms | Hard refresh |
| Warm #4 | 2035ms | 1424ms | Hard refresh |

**DIRECT-PATH TEST - session pooler:5432**

| Run | Context dbQuery | Dokumen dbQuery | Notes |
|---|---|---|---|
| Cold load #1 | 3185ms | 1781ms | First request after restart |
| Warm #2 | 839ms | 465ms | Hard refresh |
| Warm #3 | 595ms | 447ms | Hard refresh |
| Warm #4 | 614ms | 459ms | Hard refresh |

### 7.3 Summary Table

| Test | Context dbQuery | Dokumen dbQuery | Notes |
|---|---|---|---|
| **DATABASE_URL (pooler:6543) - cold** | 3772ms | 1697ms | Transaction pooler, cold start |
| **DATABASE_URL (pooler:6543) - avg warm** | 1963ms | 1442ms | Warm, still high |
| **DIRECT_URL path (pooler:5432) - cold** | 3185ms | 1781ms | Session pooler, cold start |
| **DIRECT_URL path (pooler:5432) - avg warm** | **683ms** | **457ms** | 65-68% faster on warm |
| **Improvement (warm avg)** | **-65%** | **-68%** | Context: 1963->683ms, Dokumen: 1442->457ms |

### 7.4 Interpretation

**Verdict: Case B + partial Case A**

1. **Transaction pooler (6543) is not the sole cause** - both cold loads are similarly slow (~3-4s). The transaction pooler overhead alone does not explain the full gap vs. raw SQL.
2. **Session pooler (5432) warm queries are much faster** - ~683ms / 457ms vs. 1963ms / 1442ms through the transaction pooler path.
3. **Cold connection cost is still ~3s on both paths** - first request remains slow regardless of which pooler path is used.
4. **`DIRECT_URL` here is still a pooler path** - not a raw Postgres connection. The remaining cold penalty suggests the bottleneck still includes:
   - Prisma engine initialization / query engine startup
   - TLS + auth handshake to Supabase infrastructure
   - Network roundtrip to Supabase AP South Asia (Mumbai region)

### 7.5 Recommendations

**Owner action items (no code change required):**

1. **Check Supabase project region** - `aws-1-ap-south-1` is Mumbai, India. For Indonesian users, Southeast Asia (Singapore `aws-1-ap-southeast-1`) would be significantly faster.
2. **Validate the same pattern in staging/production-like conditions** before changing connection strategy based only on local dev behavior.
3. **Only after staging-like validation, consider Prisma Accelerate or connection-strategy changes** if cold-start and warm-path overhead remain consistent.
4. **Keep the current audit conclusion**: transaction pooler `6543` is slow on warm request, session pooler `5432` is ~65-68% faster on warm request, and cold request is still slow on both paths.

**Do NOT change production `DATABASE_URL` without Supabase owner approval.**

---

## 8. Acceptance Checklist

- [x] `dbQuery` timing added to context and documents page
- [x] `serializeRows` timing confirms no serialization overhead
- [x] Root cause confirmed: connection/runtime path overhead
- [x] No migration added
- [x] No business logic change
- [x] No third-party package
- [x] Local `.env.local` includes both `DATABASE_URL` and `DIRECT_URL` (values intentionally not logged)
- [x] `npm run lint` - passed with 0 lint errors; `src/lib/perf.ts` warning removed; CLI still emits legacy `.eslintignore` deprecation warning
- [x] `npx tsc --noEmit` - passed after lint cleanup
- [x] `npm run build` - previously completed with exit 0 on 2026-05-05 after rerun outside sandbox; emitted 1 Turbopack NFT warning plus Prisma connectivity logs during revalidation
- [x] Owner tested `DIRECT_URL` vs `DATABASE_URL` - done in sprint-04-008I
- [x] Warm-up test (second browser refresh) - done in sprint-04-008I
- [x] Sprint 04-008I test completed and documented

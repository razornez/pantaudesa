# Back Office Performance Audit

**Sprint:** 04-008F / 04-008G / 04-008H / 04-008I / 04-008J
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

**Next owner decision:** confirm the Mumbai region as the current baseline, validate the same pattern in staging/production-like runtime, then prioritize connection/pooler review before any region migration or Prisma Accelerate decision.

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

## 8. Infra Region Runtime Validation - Sprint 04-008J

### 8.1 Current Supabase Region Statement

The currently active shared Supabase runtime is detected on host alias `aws-1-ap-south-1.pooler.supabase.com`, which maps to **AWS ap-south-1 / Mumbai, India**.

This matches:

- the active runtime host alias used by local env for `DATABASE_URL` and `DIRECT_URL`
- the shared host documented in `docs/engineering/47-sprint-03-shared-supabase-migration-apply-report.md`
- the earlier separation from the temporary validation DB host `aws-1-ap-northeast-1.pooler.supabase.com`

Conclusion:

1. **Supabase is currently in ap-south-1 / Mumbai.**
2. **This is not the temporary validation DB region.**
3. **Mumbai is functional, but it is not the closest major AWS region for Indonesia-facing traffic.**

### 8.2 Why Local Dev Is Not Enough For A Production Decision

The local audit is strong enough to prove that the current bottleneck is in the connection/runtime path, but it is **not** enough to justify a production infra change by itself.

Reasons:

1. Local dev includes **Next dev server overhead** that does not represent production serving behavior.
2. Local measurements include **machine-specific cold start and module reload cost**.
3. Local results include **developer network variability** that may exaggerate or distort geographic latency.
4. The current evidence proves a **directional pattern**, but it does not isolate how much of the production experience is caused by:
   - region distance
   - connection/pooler behavior
   - Prisma startup/runtime cost
   - deployment cold-start behavior

Therefore, **staging or production-like validation is the next evidence gate** before any owner decision changes live infra.

### 8.3 Owner Option Comparison

| Option | Expected benefit | Main risk/cost | What it solves well | What it does not prove/solve | Owner recommendation |
|---|---|---|---|---|---|
| Stay in Mumbai (`ap-south-1`) | Zero migration risk, zero data-move effort, safest immediate operations | Keeps longer network distance for Indonesia users | Stability while gathering better evidence | Does not reduce regional roundtrip by itself | **Valid as the current short-term default** until staging/production-like evidence is collected |
| Migrate to Singapore (`ap-southeast-1`) | Best geography for Indonesia traffic, likely lower roundtrip and TLS/auth travel time | Highest operational risk; requires infra/data migration planning and execution | Solves regional distance better than any app-layer tweak | Does not by itself prove whether pooler/runtime overhead is still the dominant bottleneck | **Do not do first**; evaluate only if production-like validation still suggests region distance materially contributes after runtime factors are isolated |
| Prisma Accelerate | May improve connection management and help when connection/runtime overhead remains material | Added infra/vendor complexity and ongoing cost | Useful when connection orchestration is the recurring bottleneck | Can mask root-cause uncertainty if adopted too early; not a proof that region is wrong | **Not first-line**; consider only after staging/production-like validation confirms the same pattern outside local dev |
| Tune connection/pooler strategy | Lowest-risk technical lever; directly matches current evidence that warm session-style path is much faster than transaction pooler path | May not fix cold-start penalty completely; still needs careful runtime validation | Best fit for the warm-path gap already observed in Sprint 04-008I | Does not remove region distance by itself and does not guarantee cold-start improvement | **Best next technical candidate** if staging/production-like validation reproduces the same warm-path pattern |

### 8.4 Recommended Owner Sequence

1. **Keep the current Supabase region as-is for now** and explicitly treat `ap-south-1 / Mumbai` as the current production baseline.
2. **Do not change production `DATABASE_URL` yet.**
3. **Validate the same route in staging or production-like runtime** and record cold-hit vs warm-hit behavior on `/profil/admin-desa/dokumen`.
4. **If the warm-path gap still points to pooler behavior, review connection/pooler strategy first** because that is the lowest-risk lever and best matches current evidence.
5. **If production-like validation still shows meaningful geographic/network drag after runtime factors are isolated, evaluate a Singapore migration next.**
6. **Only after those checks, consider Prisma Accelerate** if connection/runtime overhead remains material and operationally hard to solve with the current path.

### 8.5 Explicit Non-Recommendations In This Audit Step

1. **No migration or DB index work** as a fix for this decision point.
2. **No production `DATABASE_URL` change** based only on local dev measurements.
3. **No region migration** based only on the current local audit.
4. **No Prisma Accelerate adoption** as the first reaction before staging/production-like validation.

## 9. Production-like Latency Validation - Sprint 04-008K

### 9.1 Method

- Local production mode using `npm run build` + `npm run start`
- Target route: `/profil/admin-desa/dokumen`
- Authentication: QA admin login via existing `/api/auth/login` + NextAuth callback flow
- Measurements: cold #1, warm #2, warm #3, warm #4
- Runtime path A: normal `DATABASE_URL` from local env
- Runtime path B: temporary process-only override `DATABASE_URL = DIRECT_URL`
- No secrets, DB URLs, or host credentials written into the report

### 9.2 Results

| Runtime path | Run | Context dbQuery | Dokumen dbQuery | Notes |
|---|---|---:|---:|---|
| DATABASE_URL normal | Cold #1 | 3862ms | 1408ms | local production mode |
| DATABASE_URL normal | Warm #2 | 2007ms | 1397ms | local production mode |
| DATABASE_URL normal | Warm #3 | 1926ms | 1371ms | local production mode |
| DATABASE_URL normal | Warm #4 | 1827ms | 1390ms | local production mode |
| DIRECT_URL as runtime DATABASE_URL | Cold #1 | 3351ms | 780ms | local production mode |
| DIRECT_URL as runtime DATABASE_URL | Warm #2 | 663ms | 415ms | local production mode |
| DIRECT_URL as runtime DATABASE_URL | Warm #3 | 786ms | 411ms | local production mode |
| DIRECT_URL as runtime DATABASE_URL | Warm #4 | 848ms | 395ms | local production mode |

Warm-path averages:

- `DATABASE_URL` normal: context **1920ms**, dokumen **1386ms**
- `DIRECT_URL` as runtime `DATABASE_URL`: context **766ms**, dokumen **407ms**
- warm improvement from session-pooler runtime path: context about **60% faster**, dokumen about **71% faster**

### 9.3 Interpretation

Local production mode **reproduces the same core pattern as Sprint 04-008I**.

1. **Production-like local mode is not much faster than Next dev on the DB path.**
   The normal `DATABASE_URL` path stayed slow on warm request at roughly `1.8-2.0s` for context and `1.37-1.40s` for dokumen, which is close to the dev-mode pattern.
2. **Warm session-pooler runtime path remains materially faster.**
   Using `DIRECT_URL` as runtime `DATABASE_URL` still improves warm requests substantially, down to roughly `663-848ms` for context and `395-415ms` for dokumen.
3. **Cold-start remains dominant on both runtime paths.**
   Cold request stayed high at `3862ms / 1408ms` on the normal path and `3351ms / 780ms` on the session-pooler runtime path.
4. **Serialization is still not a meaningful contributor.**
   `serializeRows` stayed at `0-1ms`.
5. **Staging/preview validation was not available in this run.**
   No existing preview/staging URL was present in local repo context, and this task does not authorize creating a new deployment just for measurement.

Interpretation case:

- **Case B**: session-pooler runtime path is still materially faster on warm request.
- **Case C**: cold request remains slow while warm session-pooler behavior becomes more acceptable.
- The result also supports the broader production-like concern from **Case D** on the normal runtime path, because warm normal-path latency remains high even outside Next dev mode.

### 9.4 Owner Recommendation

1. **Keep the current owner decision order from Sprint 04-008J.**
2. **Connection/pooler strategy review remains the first technical candidate** because the production-like local run reproduced the same warm-path gap seen in Sprint 04-008I.
3. **Do not change production `DATABASE_URL` in this step.**
4. **Treat cold-start/runtime startup as a parallel concern** because cold request remains slow on both paths even when the warm path improves.
5. **Validate deployed staging/preview runtime next when available.**
6. **Only after deployed validation, evaluate Singapore migration or Prisma Accelerate** if connection/runtime overhead still remains materially high.

## 10. Connection Strategy Fix Rollout - Sprint 04-008M

### 10.1 Status

- **Blocked: no staging/preview access**

This run did not have usable staging/preview environment access.

Observed blockers:

1. No local `.vercel/project.json` mapping was present in the repo.
2. Vercel access available in this session returned **zero teams**, so there was no confirmed project/environment target to update.
3. This task does not authorize a production fallback, so rollout execution stopped at the runbook/documentation boundary.

### 10.2 Candidate Fix

Staging/preview runtime `DATABASE_URL` should use the session-pooler path that was materially faster in local production validation.

Local production evidence still supporting that candidate:

- normal warm `DATABASE_URL`: context about **1920ms**, dokumen about **1386ms**
- session-pooler runtime warm path: context about **766ms**, dokumen about **407ms**

### 10.3 Results

| Environment | Runtime path | Run | Context dbQuery | Dokumen dbQuery | Notes |
|---|---|---|---:|---:|---|
| staging/preview | baseline | cold #1 | blocked | blocked | no environment access in this run |
| staging/preview | baseline | warm avg | blocked | blocked | no environment access in this run |
| staging/preview | session-pooler candidate | cold #1 | blocked | blocked | no environment access in this run |
| staging/preview | session-pooler candidate | warm avg | blocked | blocked | no environment access in this run |

### 10.4 Owner Steps

The staging rollout runbook is prepared here:

`docs/bmad/runbooks/back-office-connection-strategy-staging-rollout.md`

Owner or operator should execute these steps next:

1. Open the existing staging/preview project env settings.
2. Record the current staging/preview `DATABASE_URL` privately for rollback.
3. Measure baseline on `/profil/admin-desa/dokumen`:
   - cold #1
   - warm #2
   - warm #3
   - warm #4
4. Change **staging/preview only** runtime `DATABASE_URL` to the session-pooler path currently represented by `DIRECT_URL`.
5. Redeploy/restart staging/preview runtime.
6. Verify:
   - QA admin login still works
   - `/profil/admin-desa/dokumen` renders
   - document list appears
   - upload UI loads
7. Measure candidate timing:
   - cold #1
   - warm #2
   - warm #3
   - warm #4
8. If auth or rendering breaks, rollback immediately.
9. Only after staging/preview evidence exists should an owner-approved production rollout task be opened.

### 10.5 Recommendation

This run falls under **Case D** from the task rules.

- **No production change** should be made in this task.
- The session-pooler runtime path remains the best first fix candidate based on local production evidence.
- The next required step is staging/preview execution using the prepared runbook, either by the owner or by a future agent run with staging/preview access.

### 10.6 Guardrails

- No production `DATABASE_URL` change in this task.
- No migration/index/schema change.
- No secret committed.

## 11. Fast Path Preview Candidate - Sprint 04-008O

Implemented branch-preview-only Prisma datasource selection:

- Vercel Preview on `fix/mobile-suara-profile-admin-access-polish` uses `DIRECT_URL` as Prisma runtime datasource.
- Production keeps `DATABASE_URL`.
- No Vercel env edit required.
- No production env change.

Next measurement:

- open the Vercel Preview deployment for this branch
- test `/profil/admin-desa/dokumen`
- compare cold/warm timing against 04-008K target

## 12. Acceptance Checklist

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
- [x] Local production mode baseline timings recorded - done in sprint-04-008K
- [x] Local production mode session-pooler runtime timings recorded - done in sprint-04-008K
- [x] Staging/preview availability documented - not available in this run
- [x] Staging rollout runbook created - done in sprint-04-008M
- [x] Main audit report records blocked staging/preview rollout status - done in sprint-04-008M
- [x] Branch-preview-only Prisma datasource candidate implemented - done in sprint-04-008O

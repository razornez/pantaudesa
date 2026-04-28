# PantauDesa BMAD-lite Sprint Status

Date: 2026-04-29
Status: sprint-03-closeout-ready
Prepared-by: Rangga / BMAD-lite orchestration

## Current sprint

Sprint 03 — Data Foundation

## Sprint goal

Move PantauDesa into DB-first displayed data mode so performance and behavior can be tested against database-backed reads, while preserving clear trust labels and blocking false verification.

Updated Owner goal:

- all displayed data should come from DB;
- current hardcoded/dummy displayed data should be inserted into DB as mock/demo records;
- UI should not silently read hardcoded fallback data if DB is unavailable;
- dummy/mock fields must be clearly marked, e.g. `Rp1 M (mock)`;
- no `verified` status;
- no official numeric APBDes extraction;
- voices/comments/replies/votes/helpfuls should also be DB-backed;
- loading/caching/performance should be acceptable for DB-backed pages.

## Current active task

- `docs/bmad/tasks/sprint-03-005-user-friendly-empty-loading-performance.md`

## Current task status

`ACCEPTED_FOR_SPRINT_03_CLOSEOUT`

Why:

- Owner confirmed Ujang/Asep work is safe;
- Rangga reviewed commit `43f564acfb0d98502289ef5423c5b2e9912888e4` against Sprint 03-005;
- route skeletons were added;
- public read caching/revalidation was added;
- source/freshness info was added;
- redundant demo badges were reduced;
- QA was reported passing by Ujang;
- guardrails were respected.

Review file:

- `docs/bmad/reviews/sprint-03-005-rangga-review.md`

## Completed Sprint 03 work

1. UI trust cleanup accepted/mostly closed.
2. Shared Supabase migration applied.
3. Demo seed Option A reported QA pass.
4. Hybrid DB + mock flagging implemented.
5. DB-first displayed data batch completed:
   - displayed data moved to DB-first reads,
   - hardcoded/mock displayed data seeded into DB as demo/mock rows,
   - voice/comment/reply/vote/helpful examples moved into DB,
   - no silent hardcoded fallback for displayed datasets.
6. Sprint 03-005 UX/performance closeout completed:
   - loading skeletons for DB-backed routes,
   - 5-minute cache/revalidation for public desa list/detail reads,
   - detail voice preview optimized,
   - user-facing technical DB/fallback/hardcoded copy removed,
   - source/freshness summaries added,
   - redundant demo badges reduced.

## Latest accepted technical commit

- `43f564acfb0d98502289ef5423c5b2e9912888e4` — `fix(perf): add db-first loading and source freshness`

Reported QA in commit:

- `npx prisma validate`: PASS
- `npx tsc --noEmit`: PASS
- `npm run test`: PASS
- `npm run build`: PASS
- route checks: PASS

Reported performance note:

- `/desa` warm route around 256ms after cache;
- detail pages show skeleton immediately;
- warm detail server responses around 1.1s on remote DB.

## Known risks to carry forward

- Remote Supabase cold reads can still take several seconds.
- Build still emits pre-existing Turbopack NFT trace warning around Prisma route import.
- Next dev logs still show unexpected ResolveMetadata root span warning.
- Cache invalidation is broad (`desa-public`) and may need refinement when Sprint 04 source review/admin workflow exists.

## Recommended next step

Prepare Sprint 03 closeout decision for Iwan/Owner:

- close Sprint 03, or
- open a focused Sprint 03 rework only if Owner finds visual/runtime issues, or
- move to Sprint 04 Source Review Workflow planning.

## Blocked / not next without new gate

Do not proceed yet to:

- `verified` activation,
- official numeric APBDes extraction,
- scraper/scheduler,
- Risk Radar / Score Orb,
- new dependency,
- destructive migration commands,
- full production data import beyond approved mock/demo DB-first batch.

## Status board

| Item | Status | Notes |
|---|---|---|
| UI trust cleanup | ACCEPTED / mostly closed | Product UI cycle completed with tracker acceptance. |
| Shared Supabase migration | APPLIED | Report 47. |
| Demo seed Option A | REPORTED_QA_PASS | Report 51. |
| Hybrid DB + mock flagging | IMPLEMENTED | Superseded by DB-first all displayed data goal. |
| DB-first all displayed data batch | COMPLETED | Commit `5ccc8fbe...`; all displayed data moved DB-first with demo/mock rows. |
| Loading/caching/source closeout | ACCEPTED_FOR_SPRINT_03_CLOSEOUT | Commit `43f564ac...`; Rangga review complete. |
| Runtime DB connection check | ABSORBED | Covered by larger DB-first and performance batches. |
| Service layer hardening | PARTIALLY COVERED | Cache/detail reads improved; deeper observability can move to future if needed. |
| Source review workflow | FUTURE SPRINT 04 CANDIDATE | Not opened. |
| Verified / official numeric extraction | BLOCKED | Needs future governance. |

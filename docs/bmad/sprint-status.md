# PantauDesa BMAD-lite Sprint Status

Date: 2026-04-29
Status: sprint-04-public-ui-closeout-reviewed
Prepared-by: Rangga / BMAD-lite orchestration

## Current sprint

Sprint 04 — Public UI/UX Closeout + Automated Source/Admin Planning

## Current sprint context

Sprint 03 Data Foundation is technically closeout-ready. Sprint 04 has started with public UI/UX closeout feedback before opening heavier admin/source automation implementation.

## Current active task

- `docs/bmad/tasks/sprint-04-001-public-ui-ux-closeout-feedback-batch.md`

## Current task status

`ACCEPTED_WITH_NOTED_BLOCKERS`

Why:

- Owner approved Ujang work before Rangga review;
- Rangga reviewed commits:
  - `8240468dbf969d84b21ad53f2afffcc8d081c145` — `fix(ui): close public sprint 04 feedback`
  - `91b4775e418a8cbdccb3072847c0054e2efd321f` — `fix(home): show priority rank four and five`
- homepage simplification/panduan migration/mobile polish completed;
- desa detail identity/source/docs/panduan/suara sections polished;
- bandingkan mobile layout stacked;
- suara warga labels are dynamic and DB-backed reply write path was added;
- DB-derived region filters were reported;
- QA and targeted lint were reported passing;
- guardrails were respected.

Review file:

- `docs/bmad/reviews/sprint-04-001-rangga-review.md`

## Latest reviewed technical commits

- `8240468dbf969d84b21ad53f2afffcc8d081c145`
- `91b4775e418a8cbdccb3072847c0054e2efd321f`

## Sprint 04-001 known blockers / carry-forward

1. `Perangkat` DB-backed dummy remains blocked because current schema has no `Perangkat` model/table.
2. Full lint still fails due to old lint debt outside this batch.
3. `Bandingkan` still uses existing comparison dataset; this batch only fixed requested mobile layout.
4. Build still emits pre-existing Turbopack NFT trace warning around Prisma route import.
5. Homepage priority now shows 5 items after Owner-approved follow-up, superseding the original 3-item instruction.

## Completed Sprint 03 work retained

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

## Sprint 04 planning docs

- `docs/bmad/plans/sprint-04-automated-source-review-admin-claim-plan.md`

Current status:

- DRAFT_FOR_OWNER_REVIEW
- Implementation gate not opened.

## Recommended next step

Ask Owner/Iwan whether to:

1. accept Sprint 04-001 and proceed to next Sprint 04 planning gate;
2. open a small rework for visual/runtime issues discovered by Owner;
3. prepare next task file for source/admin/AI workflow only after explicit gate.

## Blocked / not next without new gate

Do not proceed yet to:

- `verified` activation for data values,
- official numeric APBDes extraction,
- scraper/scheduler,
- Risk Radar / Score Orb,
- new dependency,
- destructive migration commands,
- admin desa claim implementation,
- AI source review implementation,
- schema/migration for Perangkat or admin claims.

## Status board

| Item | Status | Notes |
|---|---|---|
| UI trust cleanup | ACCEPTED / mostly closed | Product UI cycle completed with tracker acceptance. |
| Shared Supabase migration | APPLIED | Report 47. |
| Demo seed Option A | REPORTED_QA_PASS | Report 51. |
| DB-first all displayed data batch | COMPLETED | Commit `5ccc8fbe...`; all displayed data moved DB-first with demo/mock rows. |
| Loading/caching/source closeout | ACCEPTED_FOR_SPRINT_03_CLOSEOUT | Commit `43f564ac...`; Rangga review complete. |
| Sprint 04-001 public UI closeout | ACCEPTED_WITH_NOTED_BLOCKERS | Commits `8240468...` and `91b4775...`; review complete. |
| Perangkat DB data | BLOCKED_PENDING_SCHEMA_GATE | No current model/table. |
| Source/admin/AI workflow | DRAFT_PLAN_ONLY | Not opened for implementation. |
| Verified / official numeric extraction | BLOCKED | Needs future governance. |

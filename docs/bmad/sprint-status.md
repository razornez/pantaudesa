# PantauDesa BMAD-lite Sprint Status

Date: 2026-04-29
Status: sprint-04-schema-foundation-reviewed
Prepared-by: Rangga / BMAD-lite orchestration

## Current sprint

Sprint 04 — Public UI/UX Closeout + Automated Source/Admin Planning

## Current sprint context

Sprint 03 Data Foundation is technically closeout-ready. Sprint 04 has completed public UI/UX closeout and now has schema/data foundations for Perangkat Desa, admin claim safety, audit, fake report, document attachment metadata, and AI review result storage.

## Current active task

- `docs/bmad/tasks/sprint-04-002-schema-data-foundation-admin-perangkat-batch.md`

## Current task status

`ACCEPTED_FOR_NEXT_SPRINT_04_GATE`

Why:

- Rangga reviewed commit `b6491b4c91c2e9134ffa124390ad97f5c0c03eb3` against Sprint 04-002;
- migration `20260429062507_sprint_04_schema_data_foundation` is non-destructive based on reviewed diff;
- schema foundations were added:
  - `PerangkatDesa`,
  - `DesaAdminClaim`,
  - `DesaAdminMember`,
  - `DesaAdminInvite`,
  - `AdminClaimAudit`,
  - `FakeAdminReport`,
  - `DokumenAttachment`,
  - `AIReviewResult`;
- perangkat demo seed wrote 124 rows;
- desa detail read path includes DB-backed perangkat rows;
- QA was reported passing;
- guardrails were respected.

Review file:

- `docs/bmad/reviews/sprint-04-002-rangga-review.md`

## Latest reviewed technical commit

- `b6491b4c91c2e9134ffa124390ad97f5c0c03eb3` — `feat(schema): add sprint 04 admin and perangkat foundations`

Reported QA:

- `npx prisma validate`: PASS
- `npx prisma generate`: PASS
- `npx tsc --noEmit`: PASS
- `npm run test`: PASS
- `npm run build`: PASS
- `npx prisma migrate status`: PASS

## Sprint 04-002 carry-forward risks

1. Admin claim, invite, fake report, upload, and AI review tables are foundation only; UI/service enforcement is not implemented yet.
2. Max 5 admin per desa rule must be enforced in future service logic.
3. Perangkat content is demo/mock until a real source-backed workflow exists.
4. `AdminClaimAudit.eventType` is string-based; future tasks should define shared constants.
5. `DokumenAttachment.uploadedById` is metadata-only without a Prisma relation to `User`; future upload service should decide whether to keep loose metadata or add relation.

## Completed Sprint 04 work

### Sprint 04-001 public UI closeout

Status: `ACCEPTED_WITH_NOTED_BLOCKERS`

Reviewed commits:

- `8240468dbf969d84b21ad53f2afffcc8d081c145`
- `91b4775e418a8cbdccb3072847c0054e2efd321f`

Review file:

- `docs/bmad/reviews/sprint-04-001-rangga-review.md`

Notes:

- homepage simplification/panduan migration/mobile polish completed;
- detail desa identity/source/docs/panduan/suara sections polished;
- bandingkan mobile layout stacked;
- suara warga labels are dynamic and DB-backed reply write path was added;
- DB-derived region filters were reported;
- perangkat blocker from 04-001 is resolved at schema/data foundation level by 04-002.

### Sprint 04-002 schema/data foundation

Status: `ACCEPTED_FOR_NEXT_SPRINT_04_GATE`

Reviewed commit:

- `b6491b4c91c2e9134ffa124390ad97f5c0c03eb3`

Review file:

- `docs/bmad/reviews/sprint-04-002-rangga-review.md`

## Completed Sprint 03 work retained

1. UI trust cleanup accepted/mostly closed.
2. Shared Supabase migration applied.
3. Demo seed Option A reported QA pass.
4. DB-first displayed data batch completed:
   - displayed data moved to DB-first reads,
   - hardcoded/mock displayed data seeded into DB as demo/mock rows,
   - voice/comment/reply/vote/helpful examples moved into DB,
   - no silent hardcoded fallback for displayed datasets.
5. Sprint 03-005 UX/performance closeout completed:
   - loading skeletons for DB-backed routes,
   - 5-minute cache/revalidation for public desa list/detail reads,
   - detail voice preview optimized,
   - user-facing technical DB/fallback/hardcoded copy removed,
   - source/freshness summaries added,
   - redundant demo badges reduced.

## Sprint 04 planning docs

- `docs/bmad/plans/sprint-04-automated-source-review-admin-claim-plan.md`
- `docs/bmad/plans/sprint-04-schema-data-gap-inventory.md`

Current status:

- Planning docs exist.
- Next implementation gate not opened yet.

## Recommended next step

Ask Owner/Iwan which Sprint 04 gate to open next:

1. Perangkat detail visual/data pass now that DB model exists,
2. Admin claim guided UI from profile,
3. Admin claim service/audit flow,
4. Fake admin report UI/service,
5. Document upload service/storage,
6. AI-assisted source review service.

## Blocked / not next without new gate

Do not proceed yet to:

- `verified` activation for data values,
- official numeric APBDes extraction,
- scraper/scheduler,
- Risk Radar / Score Orb,
- new dependency,
- destructive migration commands,
- admin desa claim UI/service implementation,
- AI source review implementation,
- document upload storage implementation.

## Status board

| Item | Status | Notes |
|---|---|---|
| UI trust cleanup | ACCEPTED / mostly closed | Product UI cycle completed with tracker acceptance. |
| Shared Supabase migration | APPLIED | Report 47. |
| Demo seed Option A | REPORTED_QA_PASS | Report 51. |
| DB-first all displayed data batch | COMPLETED | Commit `5ccc8fbe...`; all displayed data moved DB-first with demo/mock rows. |
| Loading/caching/source closeout | ACCEPTED_FOR_SPRINT_03_CLOSEOUT | Commit `43f564ac...`; Rangga review complete. |
| Sprint 04-001 public UI closeout | ACCEPTED_WITH_NOTED_BLOCKERS | Commits `8240468...` and `91b4775...`; review complete. |
| Sprint 04-002 schema/data foundation | ACCEPTED_FOR_NEXT_SPRINT_04_GATE | Commit `b6491b4...`; review complete. |
| Perangkat DB data | FOUNDATION_READY | Model + demo seed + detail read path added. |
| Source/admin/AI workflow | FOUNDATION_READY_FOR_NEXT_GATE | Schema foundations added; UI/services not opened. |
| Verified / official numeric extraction | BLOCKED | Needs future governance. |

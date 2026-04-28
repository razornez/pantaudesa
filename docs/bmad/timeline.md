# PantauDesa BMAD-lite Timeline

Date: 2026-04-28
Status: active-timeline
Prepared-by: Rangga / BMAD-lite orchestration

## Purpose

This file summarizes past and current PantauDesa work without replacing detailed reports.

For exact evidence, follow the references in each section.

## Phase 1 — UI foundation with mock data

Status: DONE / historical

Summary:

- PantauDesa UI was built with mock/demo data.
- Core areas existed:
  - homepage,
  - Data Desa list,
  - Data Desa detail,
  - Suara Warga,
  - citizen guidance/reporting context.

Important posture:

- mock data kept UI alive while trust/data foundation was not ready.
- demo framing remained important to avoid false official claims.

## Phase 2 — Owner UI/UX trust cleanup

Status: ACCEPTED / closed

Key accepted gates:

### Accessibility and baseline UI

Status: ACCEPTED

Reference:

- `docs/product/14-owner-feedback-ui-ux-visual-todo-tracker.md`

### Status badge system

Status: ACCEPTED

Summary:

- reusable data status badge system created,
- selected important UI locations updated,
- `Terverifikasi` remains disabled/future only.

References:

- `docs/product/18-status-badge-system-report.md`
- `docs/product/19-rangga-status-badge-system-review.md`
- `docs/product/21-status-badge-consistency-sweep-report.md`

### Navigation and Citizen Journey Cleanup

Status: ACCEPTED

Summary:

- homepage search became first citizen action,
- `/suara-warga` route supported,
- Suara Warga copy/loading/empty states improved,
- journey clarified: cari desa → lihat status data → baca sumber/dokumen → tanya/sampaikan suara warga.

References:

- `docs/product/25-navigation-citizen-journey-batch-report.md`
- `docs/product/26-rangga-navigation-citizen-journey-batch-review.md`
- `docs/product/27-rangga-navigation-citizen-journey-owner-visual-pass.md`

### Data Desa + Mobile Readability Closeout

Status: DONE_PENDING_REVIEW / implementation report exists

Summary:

- Data Desa cards kept simpler scan hierarchy,
- mobile readability improved,
- filter/list/card/table controls improved.

Reference:

- `docs/product/28-data-desa-mobile-readability-closeout-report.md`

## Phase 3 — Sprint 03 data foundation

Status: ACTIVE

Goal:

Move from mock-only UI toward database-backed data foundation without breaking trust boundaries.

### Manual discovery: Arjasari 11 desa

Status: REVIEWED

Summary:

- 11 Arjasari desa reviewed for public source/document patterns,
- findings are not verified official data,
- source/document registry approach preferred before numeric extraction.

References:

- `docs/engineering/31-manual-discovery-arjasari-full-11-desa.md`
- `docs/engineering/32-iwan-review-arjasari-full-discovery.md`

### Schema recommendation and approval

Status: APPROVED

Summary:

- Sprint 03 schema approved for:
  - `Desa`,
  - `DataSource`,
  - `AnggaranDesaSummary`,
  - `APBDesItem`,
  - `DokumenPublik`,
  - data/status/source enums.
- raw snapshot/staging/scraper/admin verification deferred.

References:

- `docs/engineering/33-final-sprint-03-schema-recommendation.md`
- `docs/engineering/34-iwan-approval-final-sprint-03-schema-recommendation.md`

### Temporary clean migration validation

Status: VALIDATED

Summary:

- `pantaudesa-dev-migration-validation` used as disposable temp DB for migration validation,
- migrations applied cleanly there,
- shared Supabase remained untouched at this stage.

References:

- `docs/engineering/44-iwan-clean-db-validation-strategy.md`
- `docs/engineering/45-sprint-03-temp-dev-db-validation-report.md`

### Shared Supabase migration apply

Status: APPLIED

Summary:

- baseline resolved,
- Sprint 03 migration deployed to shared Supabase,
- Sprint 03 tables exist in shared Supabase,
- no seed/read path switch happened in that gate.

Reference:

- `docs/engineering/47-sprint-03-shared-supabase-migration-apply-report.md`

### Demo seed Option A

Status: REPORTED_QA_PASS

Summary:

- seed implementation exists for:
  - 11 `Desa`,
  - 14 `DataSource`,
  - 16 `DokumenPublik`,
- no `AnggaranDesaSummary`,
- no `APBDesItem`,
- no numeric APBDes extraction,
- no `verified`.

References:

- `docs/engineering/49-sprint-03-demo-seed-implementation-report.md`
- `docs/engineering/50-sprint-03-demo-seed-execution-approval-plan.md`
- `docs/engineering/50a-iwan-approval-sprint-03-demo-seed-execution-gate.md`
- `docs/engineering/51-sprint-03-demo-seed-execution-report.md`

### Hybrid DB read + mock flagging

Status: ACTIVE / DONE_PENDING_QA

Summary:

- `/desa` attempts DB read first,
- mock fallback remains,
- cards should distinguish:
  - `Dari Database`,
  - `Mock/Hardcoded`,
  - `Angka Demo`,
- current issue: Owner did not see Ancolmekar, likely meaning runtime is still in mock fallback mode.

References:

- `docs/engineering/52-sprint-03-db-read-hybrid-mock-flagging-report.md`
- `docs/bmad/stories/sprint-03-002-db-read-hybrid-mock-flagging.md`

## Current state summary

```text
UI trust cleanup: mostly accepted/closed.
DB schema: applied to shared Supabase.
Seed Option A: reported QA pass.
Hybrid DB read: implemented but QA/runtime connection still needs verification.
Full read path switch: not yet approved.
Numeric APBDes extraction: blocked.
Verified status: blocked.
```

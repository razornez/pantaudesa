# Sprint 05 - Backlog

## Status
READY FOR OWNER REVIEW — backlog slicing only, no implementation in this file.

## Source Inputs
This backlog is based on:

- `docs/engineering/54-sprint-04-performance-closeout-report.md`
- `docs/bmad/reports/back-office-performance-audit.md`
- latest `main` closeout commit: `cf69f0c019183099296b6dca92694a5067803ad7` / `merge: close out sprint 04 performance hardening`

## Sprint 05 Direction
Sprint 04-008 focused on closing the user/admin-desa/internal-admin back-office foundation and performance hardening.

Sprint 05 has two tracks:

1. **P0 Stabilization Track** — finish the performance/read-path follow-ups from Sprint 04 so the app stays usable while data volume grows.
2. **Core Product Track** — start the Data Foundation & Village Data Quality epic so PantauDesa becomes a credible village data management system, not only a document/back-office app.

Sprint 05 should not reopen Sprint 04 as one large audit. Work must be sliced into narrow, reviewable tasks.

## Important Sprint 05 Rules

Do not:

- merge unfinished work to `main`
- change Sprint 04-008 business logic without strong reason and owner approval
- create DB migration/index without evidence and owner approval
- change production `DATABASE_URL`
- install Prisma Accelerate or observability packages without a separate owner decision
- bypass auth/permission for performance
- add persistent cache for sensitive back-office data
- move sensitive back-office fetching to client
- log PII, credentials, document content, DB URLs, or tokens
- show dummy data as if it were real public data
- publish admin-desa input automatically just because it came from an admin desa

Rules for public data:

- public data must come from reviewed/published data
- public pages must not show draft, rejected, in-review, or conflicted data as final data
- admin desa input remains reviewable and rejectable
- if admin desa data conflicts with a more credible source, internal admin may select the more credible source
- if admin desa disagrees, the product should direct them to submit correction/objection through the relevant source/correction flow, not override automatically
- MVP public pages show only the latest published version
- version history remains available for audit/internal review
- important actions must have audit trail

Allowed:

- public read-path server-first cleanup
- public cache review for public data only
- guarded diagnostics behind development or explicit env flags
- docs/runbook updates
- data model proposals without immediate migration
- small, reversible code changes with QA

---

# Track A — P0 Sprint 04 Performance Follow-up

## A-001 — Homepage Read-path Follow-up

**Problem**  
Sprint 04 closeout notes that the homepage still shows slow application-code time under local dev and needs a focused read-path review.

**Goal**  
Split homepage timing so we know whether the cost is from `getDesaListResult()`, aggregation/composition, cache behavior, or render work.

**Scope**

- Inspect homepage route and related data readers.
- Add or reuse guarded perf timings for:
  - homepage route start/end
  - `getDesaListResult()`
  - any homepage aggregation/composition step
  - serialization/mapping if present
- Measure cold and warm local production mode.
- Recommend server-first/cache cleanup only if evidence supports it.

**Out of scope**

- homepage redesign
- DB migration/index
- production env change
- third-party observability package

**Acceptance Criteria**

- homepage timing breakdown documented
- bottleneck classified as query/read, aggregation, render, cache, or inconclusive
- no PII in logs
- `npm run lint`, `npx tsc --noEmit`, `npm run build` recorded

---

## A-002 — Public Page Server-first Cleanup Continuation

**Problem**  
Sprint 04 improved `suara-warga` and `/profil/saya` by reducing client-first initial fetches. Other public surfaces may still wait for unnecessary client fetches or heavy dynamic reads.

**Goal**  
Identify public pages where first meaningful content should be server-provided and cached, then prepare small cleanup slices.

**Candidate surfaces**

- `/`
- `/desa`
- `/desa/[id]`
- `/suara`
- `/suara-warga`
- any public profile/detail pages that still fetch immediately after mount

**Scope**

- Inventory public pages that perform client fetch on mount for first render.
- Separate public-safe data from user/session-sensitive data.
- Convert only public-safe first-render data to server-first reads.
- Use existing cache patterns where appropriate.
- Keep interactive client behavior after first render.

**Out of scope**

- caching back-office or private user data
- moving auth-sensitive data into public cache
- major UI redesign
- route rewrites unrelated to first-render data

**Acceptance Criteria**

- public page inventory documented
- 1–3 small implementation tasks proposed, not one giant refactor
- sensitive/private data boundaries documented
- QA commands recorded for any implemented slice

---

## A-003 — Back-office Warm-path Reduction Follow-up

**Problem**  
The back-office audit proved raw SQL is fast but connection/runtime path and repeated read-path work can still make back-office pages feel slow. Sprint 04 reduced some noise and improved selected warm paths, but remaining follow-ups should be narrow.

**Goal**  
Reduce warm-path cost without changing business logic, auth, permissions, or production DB settings.

**Priority targets**

1. Admin Desa `list-admin`
2. Admin Desa `dokumen`
3. Internal Admin `claims/documents/renewals`
4. Admin Desa shell/layout context reuse

**Scope**

- Confirm current warm timings after Sprint 04 closeout.
- Keep or refine request-level dedupe where safe.
- Remove remaining eager prefetch only where it creates measurable noise.
- Ensure pages do not duplicate `auth()` / context work unnecessarily.
- Validate branch-preview fast-path candidate if a Preview deployment is available.

**Out of scope**

- production `DATABASE_URL` change
- Prisma Accelerate
- region migration
- DB index/migration
- business-flow changes: approval/reject, admin role/status, upload, notification, claim verification, renewal

**Acceptance Criteria**

- before/after timing table for target pages
- no business logic diff
- mobile back-office layout remains intact
- QA commands recorded

---

## A-004 — Windows Local Runtime / Build Stability

**Problem**  
Sprint 04 closeout notes intermittent Windows local `EPERM` / `spawn EPERM` issues and Prisma lock/build operational problems. These issues slow the team and can be mistaken for source regressions.

**Goal**  
Separate Windows local operational failures from actual app/build failures and create a reliable local DX runbook.

**Scope**

- Collect exact failure signatures:
  - `EPERM`
  - `spawn EPERM`
  - Prisma query engine / DLL lock issues
  - Turbopack NFT warnings if still present
- Identify safe cleanup steps:
  - stop Node/Next processes
  - clear `.next` only when safe
  - regenerate Prisma client only when needed
  - restart terminal/IDE when lock persists
- Document recommended commands for Windows.
- Do not hide real build failures as Windows-only noise.

**Out of scope**

- package manager migration
- dependency upgrade batch
- Prisma version upgrade unless separately approved

**Acceptance Criteria**

- Windows build/runtime runbook exists
- known operational failures classified
- QA guidance explains pass/fail vs blocked

---

## A-005 — Perf Trace Lifecycle / Guarded Diagnostics Decision

**Problem**  
Sprint 04 kept useful guarded instrumentation but also removed temporary debug endpoints. Sprint 05 needs to decide which traces remain as standard diagnostics and which should be retired.

**Goal**  
Make perf diagnostics boring, safe, and intentional.

**Scope**

- Inventory current perf logs in:
  - `src/lib/perf.ts`
  - admin-desa routes/data readers
  - internal-admin routes/data readers
  - public suara/desa detail reads
  - homepage if A-001 adds tracing
- Classify each trace:
  - keep permanently guarded
  - keep temporarily until task closure
  - remove now
- Ensure all retained logs are gated by development mode or explicit env flag.
- Ensure no log emits PII, document content, DB URL, token, or raw query params.

**Out of scope**

- OpenTelemetry adoption
- external observability vendor
- exposing debug endpoints

**Acceptance Criteria**

- trace inventory documented
- removal/keep list agreed in BMAD
- no long-lived production-facing debug endpoint
- QA commands recorded if code changes occur

---

## A-006 — Back-office Connection Strategy Decision Gate

**Problem**  
The back-office audit found transaction-pooler/runtime overhead and a faster session-pooler warm path. However, production env changes remain blocked until safe validation exists.

**Goal**  
Turn connection strategy into an owner decision only after deployed evidence exists.

**Scope**

- Validate branch-preview fast-path candidate if Preview deployment is available.
- Compare cold/warm target route timing against Sprint 04-008K local production baseline.
- Prepare go/no-go recommendation for:
  - production `DATABASE_URL` strategy change
  - Prisma Accelerate evaluation
  - Supabase Singapore migration evaluation

**Out of scope**

- changing production `DATABASE_URL` inside this task
- Prisma Accelerate install
- region migration
- DB index/migration

**Acceptance Criteria**

- deployed evidence exists or blocker is documented
- production rollout task is created only if owner approves
- no secrets exposed

---

# Track B — EPIC: Data Foundation & Village Data Quality

## Epic Context
Sprint 05 should strengthen PantauDesa's data foundation so the system does not only display documents or manual input. The platform needs to manage village data with source tracking, review status, versioning, audit trail, conflict resolution, and a credible publish flow.

## Epic Goal
Turn PantauDesa into a village data management system that can:

1. collect village data from multiple sources,
2. track data sources,
3. validate and review data,
4. map documents to structured data,
5. resolve data conflicts,
6. store version history,
7. render the latest published version on public pages.

## B-001 — Data Model & Data Source Foundation

**Objective**  
Define the core village data structure so each data value has source, status, confidence, and history.

**Scope**

- Review existing village/desa data models.
- Define MVP village data fields that may be collected and displayed.
- Separate data by source:
  - system/internal
  - village document
  - admin desa
  - public/official source
  - citizen voice
  - manual internal-admin input
- Prepare structure where data is not only `value`, but also source metadata.

**Expected output**

- Draft model/ERD or Prisma proposal.
- MVP village data field list.
- Data category mapping:
  - Profil desa
  - Wilayah
  - Demografi
  - Pemerintahan desa
  - Dokumen publik
  - Anggaran
  - Fasilitas
  - Potensi desa
  - Kontak/kanal resmi
- Metadata field proposal:
  - `sourceId`
  - `sourceType`
  - `confidence`
  - `reviewStatus`
  - `publishedVersion`
  - `createdBy`
  - `reviewedBy`
  - `createdAt`
  - `updatedAt`

**Acceptance Criteria**

- MVP village data field list exists.
- Clear separation between data value and source metadata.
- No migration before owner review if schema change is large.

---

## B-002 — Data Source Registry

**Objective**  
Create a source registry concept so every important village data point can be traced to its origin.

**Scope**

- Propose `DataSource` model/concept.
- Every important data item should be traceable to:
  - uploaded document
  - admin desa input
  - future scraping/public API
  - manual internal-admin input
  - government/official source
  - citizen voice if relevant
- Store source metadata:
  - source type
  - source URL/file reference
  - uploader/inputter
  - source date
  - confidence/credibility
  - review status
  - internal-admin note

**Suggested `sourceType`**

- `DOCUMENT_UPLOAD`
- `ADMIN_DESA_INPUT`
- `INTERNAL_ADMIN_INPUT`
- `OFFICIAL_WEBSITE`
- `GOVERNMENT_SOURCE`
- `CITIZEN_VOICE`
- `SYSTEM_GENERATED`

**Expected output**

- `DataSource` proposal.
- Relationship proposal between `DataSource` and village data.
- Initial source priority rules.

**Acceptance Criteria**

- Each important data point can be traced to its source.
- Sources have status and confidence/credibility.
- Admin desa data is not automatically final/published.

---

## B-003 — Village Data Versioning

**Objective**  
Store village data change history so every change is auditable and public pages only show the latest published version.

**Scope**

- Propose versioning concept for village data.
- Each update creates a new version.
- Old versions are not deleted.
- Public pages only display latest published version.
- Internal admin can inspect change history.
- Admin desa can see if their input was rejected or replaced by a more credible source.

**Suggested fields**

- `villageId` / `desaId`
- `versionNumber`
- `status`: `DRAFT` / `IN_REVIEW` / `PUBLISHED` / `REJECTED` / `ARCHIVED`
- `sourceId`
- `dataSnapshot` JSON
- `changedFields` JSON
- `reviewNote`
- `rejectionReason`
- `publishedAt`
- `reviewedBy`
- `createdAt`
- `updatedAt`

**Acceptance Criteria**

- Data version concept exists.
- Latest published can be distinguished from draft/rejected.
- History remains stored.
- No hard delete for old versions.

---

## B-004 — Document-to-Data Mapping Pipeline

**Objective**  
Define the flow for turning uploaded village documents into structured data that is reviewed before publish.

**Existing context**  
In Sprint 04-008, admin desa can upload documents. Documents go into processing and internal-admin review. AI mapping can help draft data, but internal admin remains final reviewer.

**Target flow**

```text
Upload document -> processing -> AI mapping draft -> internal admin review -> approve/publish data version -> public page
```

**Scope**

- Map documents to MVP village data fields.
- AI may create draft mapping.
- Internal admin remains final decision maker.
- Failed mapping must have clear reason.
- Data conflict enters conflict review.
- AI result must not auto-publish.

**Statuses**

- `PROCESSING`
- `AI_DRAFT_READY`
- `NEEDS_REVIEW`
- `PUBLISHED`
- `FAILED`
- `REJECTED`

**Acceptance Criteria**

- Documents can produce structured data drafts.
- AI mapping result does not auto-publish.
- Internal admin can approve/reject/correct mapping.
- Failure reason is clear.
- Published data creates a new version.

---

## B-005 — Data Conflict Resolution

**Objective**  
Handle conflicting data from multiple sources so PantauDesa chooses the most credible data.

**Business rule**  
Admin desa can be wrong. If admin desa data is inaccurate, internal admin may reject it and choose a more trusted source. If admin desa disagrees, direct them to submit correction/objection to the relevant source or correction flow.

**Scope**

- Detect conflicts:
  - different values for the same field
  - different sources
  - different source dates
  - different confidence levels
- Define conflict statuses:
  - `NO_CONFLICT`
  - `CONFLICT_DETECTED`
  - `UNDER_REVIEW`
  - `RESOLVED`
  - `REJECTED`
- Internal admin can choose the data to use.
- Rejection must include clear reason.
- Store the reason for selected source/value.

**Acceptance Criteria**

- Conflicting data is not auto-published.
- Internal admin can select the most valid source.
- Conflict resolution reason is stored.
- Admin desa receives clear information if their input is rejected.

---

## B-006 — Public Data Completeness & Quality

**Objective**  
Track village data completeness and prevent public pages from showing fake/dummy data.

**Scope**

- Calculate data completeness per village.
- Mark empty fields.
- Show honest empty states when data is unavailable.
- Prioritize important fields for completion.
- Define initial data quality rules:
  - required field
  - number validation
  - date validation
  - URL validation
  - source is required
  - time-sensitive data should not be too stale

**Initial completeness categories**

- Profil desa
- Lokasi/wilayah
- Demografi
- Pemerintahan desa
- Dokumen
- Anggaran
- Fasilitas
- Potensi
- Kontak/kanal resmi

**Acceptance Criteria**

- Data completeness indicator exists.
- Empty state is honest and clear.
- Public data only comes from valid/reviewed sources.
- No dummy data appears as real public data.

---

## B-007 — Internal Data Review Queue

**Objective**  
Create a focused internal-admin work queue for data review. This is not a large analytics dashboard.

**Scope**

Internal admin can see:

- newly submitted data
- AI mapping results
- data conflicts
- data needing approve/reject
- data ready to publish
- failed mapping data

Filters:

- source type
- status
- desa
- confidence
- conflict status
- created date

**Acceptance Criteria**

- Internal admin has a clear data work queue.
- Internal admin can approve/reject data.
- Internal admin can see source and reason.
- Internal admin can review draft mapping before publish.
- No large analytics dashboard required.

---

## B-008 — Data Audit Trail

**Objective**  
Record every important action related to village data.

**Scope**

Audit trail for:

- create data
- update data
- approve data
- reject data
- publish data
- archive data
- resolve conflict
- AI mapping result
- manual internal-admin override

Audit metadata:

- `actorId`
- `actorRole`
- `action`
- `targetType`
- `targetId`
- `beforeSnapshot`
- `afterSnapshot`
- `reason`
- `ipAddress` if available
- `location` if available
- `userAgent` if available
- `createdAt`

**Acceptance Criteria**

- Important actions are recorded.
- Audit trail is not hard-deleted casually.
- Internal admin can trace changes.
- Data version and audit log can be cross-referenced.

---

## B-009 — Public Village Data Rendering

**Objective**  
Public village pages render only the latest published village data version.

**Scope**

- Read latest published village data version.
- Render public data by category.
- Show data source if needed.
- Do not show draft/in-review/rejected data.
- Show honest empty state if data is incomplete.
- Do not show conflicted data as final.

**Rules**

- Public page only uses `PUBLISHED` data.
- If a newer version exists but is not published, public page still uses latest valid published version.
- If data conflicts exist, show latest valid published data or empty state, depending on case.

**Acceptance Criteria**

- Public page does not use dummy data.
- Rendered data can be traced to source/version.
- Latest published data renders consistently.
- Draft/rejected data does not leak to public pages.

---

## B-010 — Data Quality Rules

**Objective**  
Define validation rules so manual input and AI mapping cannot publish arbitrary data.

**Scope**

- Define rules per field:
  - type
  - required/optional
  - min/max
  - format
  - stale threshold if relevant
  - allowed source type
- Validate admin desa input.
- Validate AI mapping result.
- Validate internal-admin input.
- Provide clear error messages.

**Examples**

- `jumlahPenduduk` must be a positive number.
- `websiteUrl` must be a valid URL.
- `tahunData` must be a valid year.
- contact email must be a valid email.
- budget data must have year and source document.

**Acceptance Criteria**

- Data quality rule list exists.
- Validation applies at least in review/mapping flow.
- Error messages are clear and actionable.

---

## B-011 — QA Seed Data for Data Workflow

**Objective**  
Prepare QA data to test the Sprint 05 data workflow end-to-end.

**Scope**

Seed data for:

- village with complete data
- village with empty data
- village with conflicting data
- document with successful mapping
- document with failed mapping
- rejected admin desa input
- old and new published versions
- QA-only government/official source
- sample audit trail

**Rules**

- Seed data must be clearly marked as QA.
- Seed data must not appear as real production data.
- Seed data should be database-backed, not hardcoded UI.
- Test accounts/roles may be added only if needed.

**Acceptance Criteria**

- QA can test all important statuses.
- Seed data comes from DB, not hardcoded UI.
- QA-only data is clearly identifiable.

---

## B-012 — QA, Regression, and Documentation

**Objective**  
Verify the data foundation flow without regressing Sprint 04-008 admin flows.

**Scope**

- Test upload document -> mapping -> review -> publish.
- Test conflict resolution.
- Test versioning.
- Test public latest published rendering.
- Test rejection reason.
- Test audit trail.
- Test empty state.
- Test mobile back office.
- Update BMAD reports.

**Required checks**

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npx prisma generate`
- Playwright if available

**Acceptance Criteria**

- No regression to existing admin desa/internal-admin flows.
- Public data does not leak draft/rejected data.
- Audit trail records important actions.
- Versioning works.
- BMAD documentation updated.

---

# Recommended Sprint 05 Execution Order

## Pre-Sprint 05 Blocker / Gate

Before full Data Foundation execution, keep the Sprint 04-008 performance conclusion visible:

- Back-office raw SQL is not the bottleneck.
- Connection/runtime path remains the known performance risk.
- No DB migration/index should be added for back-office performance without new evidence.
- Branch-preview fast-path candidate may be validated if preview is available.
- If data workflow expands back-office volume, warm-path performance must be watched.

This does not block model/design tasks, but it should block large back-office workflow rollout if pages return to 5–10s loads.

## Batch 0 — Stabilization From Sprint 04

1. A-001 Homepage Read-path Follow-up
2. A-005 Perf Trace Lifecycle / Guarded Diagnostics Decision
3. A-003 Back-office Warm-path Reduction Follow-up
4. A-004 Windows Local Runtime / Build Stability
5. A-006 Connection Strategy Decision Gate only if Preview/Staging evidence becomes available

## Batch 1 — Data Foundation

1. B-001 Data Model & Data Source Foundation
2. B-002 Data Source Registry
3. B-010 Data Quality Rules

## Batch 2 — Versioning & Audit

1. B-003 Village Data Versioning
2. B-008 Data Audit Trail

## Batch 3 — Mapping & Review

1. B-004 Document-to-Data Mapping Pipeline
2. B-005 Data Conflict Resolution
3. B-007 Internal Data Review Queue

## Batch 4 — Public Rendering

1. B-006 Public Data Completeness & Quality
2. B-009 Public Village Data Rendering
3. A-002 Public Page Server-first Cleanup Continuation where it overlaps public data rendering

## Batch 5 — QA

1. B-011 QA Seed Data for Data Workflow
2. B-012 QA, Regression, and Documentation

## Not Recommended For Sprint 05 Start

- Starting with DB indexes for back-office performance. Current evidence does not support this as the primary fix.
- Starting with Prisma Accelerate. It may be useful later, but not before deployed validation.
- Starting with Supabase region migration. Too risky without staging/production-like evidence.
- Starting with a large analytics dashboard. Sprint 05 needs work queues and data review, not a broad analytics product.
- Publishing AI-mapped data automatically. Internal admin remains final reviewer.
- Treating admin desa input as automatically credible.

## Handoff Prompt For Ujang

```text
Ujang, pull main and read:

- docs/engineering/54-sprint-04-performance-closeout-report.md
- docs/bmad/reports/back-office-performance-audit.md
- docs/bmad/tasks/sprint-05-000-performance-follow-up-backlog.md

Sprint 05 has two tracks:
1. P0 stabilization/performance follow-up from Sprint 04.
2. Data Foundation & Village Data Quality.

Start with B-001 Data Model & Data Source Foundation, but keep A-001/A-005 visible if performance tracing is needed before implementation.

Do not ask for a new decision unless a hard blocker appears. Keep scope narrow, no migration/index without owner review, no production DATABASE_URL change, no package install, no sensitive-data logging, and no public dummy data.

Output: BMAD task/report update + QA + guardrails.
```

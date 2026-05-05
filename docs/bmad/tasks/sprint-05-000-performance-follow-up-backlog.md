# Sprint 05 - Prioritized Backlog

## Status
READY FOR OWNER REVIEW — ordered backlog only, no implementation in this file.

## Source Inputs
This backlog is based on:

- `docs/engineering/54-sprint-04-performance-closeout-report.md`
- `docs/bmad/reports/back-office-performance-audit.md`
- latest `main` closeout commit: `cf69f0c019183099296b6dca92694a5067803ad7` / `merge: close out sprint 04 performance hardening`

## Sprint 05 Direction
Sprint 05 has two goals:

1. Keep PantauDesa fast and stable enough for larger data workflows.
2. Start the **Data Foundation & Village Data Quality** epic in the right dependency order.

Sprint 05 must not become one large refactor. Each task should be narrow, reviewable, and able to finish independently.

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
- if admin desa disagrees, direct them to correction/objection flow, not automatic override
- MVP public pages show only the latest published version
- version history remains available for audit/internal review
- important actions must have audit trail

---

# Priority Map

## P0 — Must do before heavy Sprint 05 implementation

These reduce risk before new data workflows add more back-office volume.

| Order | Task | Why first | Blocks |
|---:|---|---|---|
| 1 | S05-001 Perf Trace Lifecycle / Guarded Diagnostics Decision | Prevents noisy/unsafe tracing before more perf work | safer diagnostics for all later perf tasks |
| 2 | S05-002 Homepage Read-path Follow-up | Homepage is the next public performance unknown from Sprint 04 closeout | informs public read-path cleanup |
| 3 | S05-003 Windows Local Runtime / Build Stability | Prevents false build/runtime regressions during Sprint 05 | improves QA reliability |
| 4 | S05-004 Back-office Warm-path Watch | Ensures new data workflow will not worsen 5–10s back-office loads | gate before large internal queues |

## P1 — Data foundation design, no migration yet

These are schema/product architecture tasks and should be finished before implementation.

| Order | Task | Why here | Blocks |
|---:|---|---|---|
| 5 | S05-005 MVP Village Data Field Catalog | Defines what data Sprint 05 manages | all data model work |
| 6 | S05-006 Data Source Registry Proposal | Defines traceable source identity and source credibility | versioning, conflict, mapping |
| 7 | S05-007 Data Quality Rules Proposal | Defines valid data before review/publish | mapping, review, public rendering |
| 8 | S05-008 Village Data Versioning Proposal | Defines draft/review/published history | public rendering, audit trail |
| 9 | S05-009 Data Audit Trail Proposal | Defines required logging for important actions | mapping/review/publish implementation |

## P2 — Workflow implementation planning

These depend on P1 outputs. Do not implement before the foundation is accepted.

| Order | Task | Depends on | Blocks |
|---:|---|---|---|
| 10 | S05-010 Document-to-Data Mapping Pipeline Plan | S05-005, S05-006, S05-007, S05-008, S05-009 | review queue, conflict handling |
| 11 | S05-011 Data Conflict Resolution Plan | S05-006, S05-007, S05-008, S05-009 | public data correctness |
| 12 | S05-012 Internal Data Review Queue Plan | S05-010, S05-011 | internal-admin execution UX |

## P3 — Public rendering and QA

These should happen after data states, versions, source rules, and review workflow are clear.

| Order | Task | Depends on | Blocks |
|---:|---|---|---|
| 13 | S05-013 Public Data Completeness & Quality UX | S05-005, S05-007, S05-008 | public village rendering |
| 14 | S05-014 Public Village Data Rendering | S05-008, S05-011, S05-013 | public release readiness |
| 15 | S05-015 Public Page Server-first Cleanup Continuation | S05-014 where data pages overlap | public performance polish |
| 16 | S05-016 QA Seed Data for Data Workflow | S05-010, S05-011, S05-014 | regression testing |
| 17 | S05-017 QA, Regression, and Documentation | all implementation tasks | sprint closeout |

## P4 — Owner decision only

| Order | Task | When to do |
|---:|---|---|
| 18 | S05-018 Back-office Connection Strategy Decision Gate | only if Preview/Staging evidence becomes available |

---

# Ordered Sprint 05 Task Details

## S05-001 — Perf Trace Lifecycle / Guarded Diagnostics Decision

**Priority:** P0  
**Type:** docs + small cleanup if needed  
**Dependency:** none

**Goal**  
Decide which Sprint 04 perf traces remain as guarded diagnostics and which should be removed before Sprint 05 adds more work.

**Scope**

- Inventory current perf logs in:
  - `src/lib/perf.ts`
  - admin-desa routes/data readers
  - internal-admin routes/data readers
  - public suara/desa detail reads
  - homepage if later tracing is added
- Classify each trace:
  - keep permanently guarded
  - keep temporarily until task closure
  - remove now
- Ensure retained logs are gated by development mode or explicit env flag.
- Ensure no log emits PII, document content, DB URL, token, or raw query params.

**Acceptance Criteria**

- trace inventory documented
- removal/keep list agreed in BMAD
- no long-lived production-facing debug endpoint
- QA commands recorded if code changes occur

---

## S05-002 — Homepage Read-path Follow-up

**Priority:** P0  
**Type:** instrumentation + evidence  
**Dependency:** S05-001 recommended

**Goal**  
Split homepage timing so we know whether the cost is from `getDesaListResult()`, aggregation/composition, cache behavior, or render work.

**Scope**

- Inspect homepage route and related data readers.
- Add/reuse guarded perf timings for:
  - homepage route start/end
  - `getDesaListResult()`
  - homepage aggregation/composition
  - serialization/mapping if present
- Measure cold and warm local production mode.
- Recommend server-first/cache cleanup only if evidence supports it.

**Acceptance Criteria**

- homepage timing breakdown documented
- bottleneck classified as query/read, aggregation, render, cache, or inconclusive
- no PII in logs
- `npm run lint`, `npx tsc --noEmit`, `npm run build` recorded

---

## S05-003 — Windows Local Runtime / Build Stability

**Priority:** P0  
**Type:** DX/runbook  
**Dependency:** none

**Goal**  
Separate Windows local operational failures from actual app/build failures and create a reliable local DX runbook.

**Scope**

- Collect/classify exact failure signatures:
  - `EPERM`
  - `spawn EPERM`
  - Prisma query engine / DLL lock issues
  - Turbopack NFT warnings if still present
- Document safe cleanup steps:
  - stop Node/Next processes
  - clear `.next` only when safe
  - regenerate Prisma client only when needed
  - restart terminal/IDE when locks persist
- Do not hide real build failures as Windows-only noise.

**Acceptance Criteria**

- Windows build/runtime runbook exists
- known operational failures classified
- QA guidance explains pass/fail vs blocked

---

## S05-004 — Back-office Warm-path Watch

**Priority:** P0  
**Type:** measurement + small safe cleanup only  
**Dependency:** S05-001 recommended

**Goal**  
Keep back-office warm-path cost visible before new Sprint 05 data workflows add more internal admin load.

**Priority targets**

1. Admin Desa `list-admin`
2. Admin Desa `dokumen`
3. Internal Admin `claims/documents/renewals`
4. Admin Desa shell/layout context reuse

**Scope**

- Confirm current warm timings after Sprint 04 closeout.
- Keep/refine request-level dedupe where safe.
- Remove eager prefetch only where measurable noise remains.
- Ensure pages do not duplicate `auth()` / context work unnecessarily.

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

## S05-005 — MVP Village Data Field Catalog

**Priority:** P1  
**Type:** product/data design  
**Dependency:** none

**Goal**  
Define exactly which village data fields Sprint 05 will manage first.

**Scope**

- Review existing village/desa data models.
- Define MVP fields by category:
  - Profil desa
  - Wilayah
  - Demografi
  - Pemerintahan desa
  - Dokumen publik
  - Anggaran
  - Fasilitas
  - Potensi desa
  - Kontak/kanal resmi
- Mark each field as public/private, required/optional, and time-sensitive/non-time-sensitive.
- Define which fields are allowed in MVP public rendering.

**Acceptance Criteria**

- MVP village data field list exists
- each field has category, visibility, required/optional, and owner/reviewer note
- no migration in this task

---

## S05-006 — Data Source Registry Proposal

**Priority:** P1  
**Type:** data model proposal  
**Dependency:** S05-005

**Goal**  
Create a source registry concept so every important village data point can be traced to its origin.

**Scope**

- Propose `DataSource` model/concept.
- Support source origins:
  - uploaded document
  - admin desa input
  - manual internal-admin input
  - official website
  - government source
  - citizen voice if relevant
  - system-generated source
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

**Acceptance Criteria**

- `DataSource` proposal exists
- relationship proposal between `DataSource` and village data exists
- initial source priority rules exist
- admin desa data is not automatically final/published

---

## S05-007 — Data Quality Rules Proposal

**Priority:** P1  
**Type:** validation design  
**Dependency:** S05-005, S05-006

**Goal**  
Define validation rules so manual input and AI mapping cannot publish arbitrary data.

**Scope**

- Define rules per MVP field:
  - type
  - required/optional
  - min/max
  - format
  - stale threshold if relevant
  - allowed source type
- Cover admin desa input, AI mapping result, and internal-admin input.
- Define clear error message style.

**Examples**

- `jumlahPenduduk` must be a positive number.
- `websiteUrl` must be a valid URL.
- `tahunData` must be a valid year.
- contact email must be a valid email.
- budget data must have year and source document.

**Acceptance Criteria**

- data quality rule list exists
- invalid data behavior is defined
- error messages are clear and actionable

---

## S05-008 — Village Data Versioning Proposal

**Priority:** P1  
**Type:** data model proposal  
**Dependency:** S05-005, S05-006

**Goal**  
Store village data change history so every change is auditable and public pages only show the latest published version.

**Scope**

- Propose versioning concept for village data.
- Every update creates a new version.
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

- data version concept exists
- latest published can be distinguished from draft/rejected
- history remains stored
- no hard delete for old versions

---

## S05-009 — Data Audit Trail Proposal

**Priority:** P1  
**Type:** data governance proposal  
**Dependency:** S05-006, S05-008

**Goal**  
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

- important actions are recorded in proposal
- audit trail is not hard-deleted casually
- data version and audit log can be cross-referenced

---

## S05-010 — Document-to-Data Mapping Pipeline Plan

**Priority:** P2  
**Type:** workflow design  
**Dependency:** S05-005, S05-006, S05-007, S05-008, S05-009

**Goal**  
Define the flow for turning uploaded village documents into structured data that is reviewed before publish.

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

- documents can produce structured data drafts in the plan
- AI mapping result does not auto-publish
- internal-admin review/correction is defined
- published data creates a new version

---

## S05-011 — Data Conflict Resolution Plan

**Priority:** P2  
**Type:** workflow/business rule design  
**Dependency:** S05-006, S05-007, S05-008, S05-009

**Goal**  
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

- conflicting data is not auto-published
- internal admin can select the most valid source
- conflict resolution reason is stored
- admin desa receives clear information if their input is rejected

---

## S05-012 — Internal Data Review Queue Plan

**Priority:** P2  
**Type:** internal-admin UX/workflow design  
**Dependency:** S05-010, S05-011

**Goal**  
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

- internal admin has a clear data work queue plan
- approve/reject paths are defined
- source and reason visibility is defined
- no large analytics dashboard required

---

## S05-013 — Public Data Completeness & Quality UX

**Priority:** P3  
**Type:** public UX/data quality design  
**Dependency:** S05-005, S05-007, S05-008

**Goal**  
Track village data completeness and prevent public pages from showing fake/dummy data.

**Scope**

- Calculate data completeness per village.
- Mark empty fields.
- Show honest empty states when data is unavailable.
- Prioritize important fields for completion.

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

- data completeness indicator is defined
- empty state is honest and clear
- public data only comes from valid/reviewed sources
- no dummy data appears as real public data

---

## S05-014 — Public Village Data Rendering

**Priority:** P3  
**Type:** public rendering implementation plan / implementation if approved  
**Dependency:** S05-008, S05-011, S05-013

**Goal**  
Public village pages render only the latest published village data version.

**Scope**

- Read latest published village data version.
- Render public data by category.
- Show data source if needed.
- Do not show draft/in-review/rejected data.
- Show honest empty state if data is incomplete.
- Do not show conflicted data as final.

**Rules**

- public page only uses `PUBLISHED` data
- if a newer version exists but is not published, public page still uses latest valid published version
- if data conflicts exist, show latest valid published data or empty state, depending on case

**Acceptance Criteria**

- public page does not use dummy data
- rendered data can be traced to source/version
- latest published data renders consistently
- draft/rejected data does not leak to public pages

---

## S05-015 — Public Page Server-first Cleanup Continuation

**Priority:** P3  
**Type:** public performance cleanup  
**Dependency:** S05-014 where public village data overlaps

**Goal**  
Continue Sprint 04 server-first/cached treatment for public surfaces that still depend on client-first or heavy dynamic reads.

**Candidate surfaces**

- `/`
- `/desa`
- `/desa/[id]`
- `/suara`
- `/suara-warga`
- any public profile/detail pages that fetch immediately after mount

**Scope**

- Inventory public pages that perform client fetch on mount for first render.
- Separate public-safe data from user/session-sensitive data.
- Convert only public-safe first-render data to server-first reads.
- Use existing cache patterns where appropriate.
- Keep interactive client behavior after first render.

**Acceptance Criteria**

- public page inventory documented
- 1–3 small implementation tasks proposed or completed
- sensitive/private data boundaries documented
- QA commands recorded for any implementation

---

## S05-016 — QA Seed Data for Data Workflow

**Priority:** P3  
**Type:** QA data plan / seed implementation if approved  
**Dependency:** S05-010, S05-011, S05-014

**Goal**  
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

- seed data must be clearly marked as QA
- seed data must not appear as real production data
- seed data should be database-backed, not hardcoded UI
- test accounts/roles may be added only if needed

**Acceptance Criteria**

- QA can test all important statuses
- seed data comes from DB, not hardcoded UI
- QA-only data is clearly identifiable

---

## S05-017 — QA, Regression, and Documentation

**Priority:** P3  
**Type:** QA closeout  
**Dependency:** all implementation tasks

**Goal**  
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

- no regression to existing admin desa/internal-admin flows
- public data does not leak draft/rejected data
- audit trail records important actions
- versioning works
- BMAD documentation updated

---

## S05-018 — Back-office Connection Strategy Decision Gate

**Priority:** P4  
**Type:** owner decision gate  
**Dependency:** Preview/Staging evidence availability

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

# Execution Rules By Dependency

## Start here

Start with **S05-001**, then **S05-002** and **S05-003**. These do not depend on the data model.

## Do not start implementation before these are accepted

Do not implement mapping/review/public data rendering until these are owner-reviewed:

1. S05-005 MVP Village Data Field Catalog
2. S05-006 Data Source Registry Proposal
3. S05-007 Data Quality Rules Proposal
4. S05-008 Village Data Versioning Proposal
5. S05-009 Data Audit Trail Proposal

## Do not start public rendering before conflict rules exist

S05-014 Public Village Data Rendering depends on S05-011 Conflict Resolution Plan. Public pages must not leak draft, rejected, or conflicted data.

## Do not start QA seed data before workflow statuses are clear

S05-016 QA Seed Data depends on S05-010/S05-011/S05-014 so seed cases match actual statuses and public rendering rules.

---

# Recommended Execution Order

1. S05-001 Perf Trace Lifecycle / Guarded Diagnostics Decision
2. S05-002 Homepage Read-path Follow-up
3. S05-003 Windows Local Runtime / Build Stability
4. S05-004 Back-office Warm-path Watch
5. S05-005 MVP Village Data Field Catalog
6. S05-006 Data Source Registry Proposal
7. S05-007 Data Quality Rules Proposal
8. S05-008 Village Data Versioning Proposal
9. S05-009 Data Audit Trail Proposal
10. S05-010 Document-to-Data Mapping Pipeline Plan
11. S05-011 Data Conflict Resolution Plan
12. S05-012 Internal Data Review Queue Plan
13. S05-013 Public Data Completeness & Quality UX
14. S05-014 Public Village Data Rendering
15. S05-015 Public Page Server-first Cleanup Continuation
16. S05-016 QA Seed Data for Data Workflow
17. S05-017 QA, Regression, and Documentation
18. S05-018 Back-office Connection Strategy Decision Gate, only if Preview/Staging evidence becomes available

## Not Recommended For Sprint 05 Start

- Starting with DB indexes for back-office performance. Current evidence does not support this as the primary fix.
- Starting with Prisma Accelerate. It may be useful later, but not before deployed validation.
- Starting with Supabase region migration. Too risky without staging/production-like evidence.
- Starting with a large analytics dashboard. Sprint 05 needs work queues and data review, not a broad analytics product.
- Publishing AI-mapped data automatically. Internal admin remains final reviewer.
- Treating admin desa input as automatically credible.
- Starting public rendering before version/source/conflict rules are designed.

# Handoff Prompt For Ujang

```text
Ujang, pull main and read:

- docs/engineering/54-sprint-04-performance-closeout-report.md
- docs/bmad/reports/back-office-performance-audit.md
- docs/bmad/tasks/sprint-05-000-performance-follow-up-backlog.md

Sprint 05 backlog is now ordered by priority and dependency.

Start from:
S05-001 Perf Trace Lifecycle / Guarded Diagnostics Decision

Then continue in numeric order unless the task explicitly says it is blocked by missing evidence/access.

Do not ask for a new decision unless a hard blocker appears. Keep scope narrow, no migration/index without owner review, no production DATABASE_URL change, no package install, no sensitive-data logging, and no public dummy data.

Output: BMAD task/report update + QA + guardrails.
```

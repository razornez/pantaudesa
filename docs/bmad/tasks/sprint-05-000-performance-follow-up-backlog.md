# Sprint 05 - Final Execution Backlog

## Status
FINALIZED FOR SPRINT PLANNING — do not execute until owner gives the handoff.

## Source Inputs
This backlog is based on:

- `docs/engineering/54-sprint-04-performance-closeout-report.md`
- `docs/bmad/reports/back-office-performance-audit.md`
- current `main` code and Prisma schema
- existing Sprint 04-008 Admin Desa / Internal Admin document flow

## Sprint 05 Theme
Sprint 05 is a single sprint with one product direction:

> Upgrade PantauDesa from a document/back-office workflow into a credible village data management foundation with source tracking, review, versioning, audit trail, mapping, diff/conflict handling, and latest-published public rendering.

Sprint 05 must reuse the existing Sprint 04-008 flow. Do not rewrite from zero.

Existing foundations to respect:

- `AdminDesaDocument` already stores uploaded document metadata, status, `aiMappingStatus`, and `aiMappingResult`.
- Admin Desa LIMITED uploads document.
- Admin Desa VERIFIED approves LIMITED-uploaded document into `PROCESSING`.
- Internal Admin reviews, publishes, or marks failed.
- Existing `draft-mapping` route currently creates manual mapping draft.
- Existing `publish` route can apply mapping fields to `Desa` and write audit metadata.
- Existing `DataSource` model exists and should be upgraded/reused where possible.
- Existing `AdminClaimAudit` exists but is claim/admin-flow oriented; Sprint 05 needs general village data audit coverage.

## Business Rules Finalized For Sprint 05

### Source priority

Initial trust order:

1. Official village/government website or official public source.
2. Partner government/province source if PantauDesa has cooperation/data access.
3. Admin Desa direct submission.
4. Internal admin manual input, but it should still reference a source when possible.
5. Citizen voice is a signal/report only, not final source of truth.

### Publish authority

- Only Internal Admin can publish final village data to public pages.
- AI mapping must never auto-publish.
- Public pages show only latest `PUBLISHED` data.

### Admin Desa document authority

- Admin Desa VERIFIED may approve or reject/return documents uploaded by Admin Desa LIMITED before they enter internal processing.
- This is not the same as final data publish authority.
- Internal Admin remains final reviewer/publisher for public village data.

### Correction flow

- Admin Desa can submit correction/upload replacement when data is wrong.
- If Admin Desa disagrees with a more trusted source, the correction should be handled as a source/correction workflow, not automatic override.

### Public data rules

- Do not show draft, rejected, in-review, or conflicted data as final public data.
- Do not use dummy data as public real data.
- Use honest empty states when reviewed/published data is unavailable.

## Global Guardrails

Do not:

- merge unfinished work to `main`
- change Sprint 04-008 business logic without strong reason and owner approval
- change production `DATABASE_URL`
- install paid/complex third-party tooling without owner approval
- bypass auth/permission for performance
- add persistent cache for sensitive back-office data
- move sensitive back-office fetching to client
- log PII, credentials, document content, DB URLs, tokens, or storage keys
- auto-publish AI/admin-desa data
- hard-delete data versions or audit logs

Schema/migration rule:

- Schema proposals are allowed.
- Draft migrations are allowed only if explicitly marked as proposal/dev-only.
- Do not apply production/shared DB migration until owner review and approval.
- Existing temp migration work can be reviewed as input, but not blindly applied.

Third-party/library rule:

- Free/open-source libraries may be evaluated for extraction, mapping, diff, and observability.
- Before adopting a package, verify license, maintenance, bundle/runtime fit, Vercel compatibility, Windows local compatibility, and security risk.
- Prefer adapter boundaries so libraries/providers can be replaced later.

---

# Priority Map

## P0 — Sprint setup and risk reduction

| Order | Task | Why first | Blocks |
|---:|---|---|---|
| 1 | S05-001 Observability Strategy & OTel Spike | Manual source logs are not enough for traffic/cold/warm/RSC tracing | monitoring decision for Sprint 05 |
| 2 | S05-002 Homepage/Public Read-path Monitoring | Homepage/public routes need real trace visibility, not only console logs | public read-path cleanup |
| 3 | S05-003 Type Safety Cleanup for Mapping/Perf Runtime | Auto mapping needs safe JSON/file/AI result boundaries | mapping, diff, publish safety |

## P1 — Product/data governance foundation

| Order | Task | Why here | Blocks |
|---:|---|---|---|
| 4 | S05-004 Data Governance & Permission Matrix | Locks source priority, publish authority, admin desa verified authority | all data workflow tasks |
| 5 | S05-005 MVP Village Data Field Catalog | Defines what fields Sprint 05 manages | source/version/quality/mapping |
| 6 | S05-006 Data Source Registry Upgrade Plan | Reuses/upgrades existing `DataSource` for traceability | versioning, diff, conflict |
| 7 | S05-007 Data Quality Rules | Defines valid data before review/publish | mapping and public rendering |
| 8 | S05-008 Village Data Versioning Proposal | Prevents direct overwrite of public data without history | public latest rendering |
| 9 | S05-009 General Data Audit Trail Proposal | Makes important data actions traceable | publish/conflict/manual override |

## P2 — Core workflow MVP

| Order | Task | Depends on | Blocks |
|---:|---|---|---|
| 10 | S05-010 Document Intake & Auto Mapping Adapter | S05-004 to S05-009 | diff/review workbench |
| 11 | S05-011 Structured Value Diff / Conflict Engine | S05-005 to S05-010 | review and public correctness |
| 12 | S05-012 Internal Data Review Workbench | S05-010, S05-011 | publish/reject workflow |

## P3 — Public output and QA

| Order | Task | Depends on | Blocks |
|---:|---|---|---|
| 13 | S05-013 Public Data Completeness & Empty State | S05-005, S05-007, S05-008 | public rendering UX |
| 14 | S05-014 Public Latest Published Rendering | S05-008, S05-011, S05-013 | public release readiness |
| 15 | S05-015 QA Seed Data for Data Workflow | S05-010 to S05-014 | regression testing |
| 16 | S05-016 QA, Regression, and Documentation | all Sprint 05 implementation tasks | sprint closeout |

## Explicitly excluded from active Sprint 05

- Back-office Warm-path Watch is excluded from active Sprint 05 unless a clear regression appears.
- Back-office connection strategy/production `DATABASE_URL` decision is excluded unless deployed Preview/Staging evidence becomes available.
- Large analytics dashboard is excluded. Sprint 05 needs work queues and review workflows.

---

# Ordered Sprint 05 Task Details

## S05-001 — Observability Strategy & OTel Spike

**Priority:** P0  
**Type:** spike + architecture decision  
**Dependency:** none

**Goal**  
Decide how PantauDesa will observe real route/server performance beyond source-code console logs.

**Rationale**  
Sprint 04 showed console perf logs are useful but not enough. Sprint 05 needs visibility into request traces, route timings, server spans, cold/warm behavior, and public/back-office read paths.

**Scope**

- Evaluate OpenTelemetry for Next.js as the primary instrumentation path.
- Evaluate a low-cost/free backend option such as New Relic, Sentry Performance, Vercel Observability, Grafana/OTel collector, or another viable provider.
- Do not assume current free tier details; verify before adoption.
- Compare options by:
  - free tier availability
  - ease of setup
  - Vercel compatibility
  - Next.js route/server span support
  - DB/request trace usefulness
  - whether Codex/Claude can inspect exported traces/logs from reports or artifacts
  - risk of leaking sensitive data
- Recommend one minimal path for Sprint 05.

**Out of scope**

- paid Datadog/New Relic adoption without owner approval
- broad observability platform migration
- logging secrets or raw DB URLs

**Acceptance Criteria**

- observability recommendation exists
- OTel feasibility is documented
- provider choice or defer decision is documented
- no third-party package installed unless owner approves within the task
- no sensitive data logged

---

## S05-002 — Homepage/Public Read-path Monitoring

**Priority:** P0  
**Type:** instrumentation + evidence  
**Dependency:** S05-001 recommended

**Goal**  
Measure homepage and key public route read paths using the selected observability approach, with guarded source-code logs only as fallback.

**Scope**

- Target routes:
  - `/`
  - `/desa`
  - `/desa/[id]`
  - `/suara-warga` if relevant
- Trace or measure:
  - route start/end
  - `getDesaListResult()`
  - homepage aggregation/composition
  - public cache hit/miss behavior where visible
  - serialization/mapping if present
- Record cold/warm local production mode if deployed traces are unavailable.

**Acceptance Criteria**

- homepage/public timing breakdown exists
- bottleneck classified as query/read, aggregation, render, cache, network/runtime, or inconclusive
- no PII in traces/logs
- QA commands recorded if code changes occur

---

## S05-003 — Type Safety Cleanup for Mapping/Perf Runtime

**Priority:** P0  
**Type:** code cleanup + safety  
**Dependency:** none

**Goal**  
Make runtime boundaries safer before auto mapping handles file extraction, JSON, AI results, and diff payloads.

**Important interpretation**  
Do not blindly remove all `unknown`. `unknown` is acceptable at external boundaries if it is narrowed safely. The target is unsafe `unknown`/`any` usage, weak casts, and untyped JSON payloads that can leak into publish/update logic.

**Scope**

- Review mapping/perf/runtime files, especially:
  - `src/lib/admin-claim/ai-mapping.ts`
  - internal-admin document publish/draft mapping routes
  - perf/Prisma event helper payloads
  - JSON parsing around `aiMappingResult`
- Replace unsafe casts with explicit guards or typed validators.
- Define stable types for mapping draft/result/diff payload.
- Keep behavior unchanged unless a type bug is found.

**Out of scope**

- business logic changes
- schema change
- AI provider integration

**Acceptance Criteria**

- unsafe type boundaries documented/fixed
- no broad `as any` or weak `unknown` cast in mapping publish path without guard
- `npm run lint`, `npx tsc --noEmit`, `npm run build` recorded

---

## S05-004 — Data Governance & Permission Matrix

**Priority:** P1  
**Type:** product/business rules + technical policy  
**Dependency:** none

**Goal**  
Lock the business rules before data model/workflow implementation.

**Scope**

Document the matrix for:

- source priority:
  1. official website/public official source
  2. partner government/province source
  3. admin desa submission
  4. internal admin manual input with source reference
  5. citizen voice as signal only
- role permissions:
  - Internal Admin can publish final village data.
  - Internal Admin can reject final data/mapping and resolve conflicts.
  - Admin Desa VERIFIED can approve/reject or return documents uploaded by Admin Desa LIMITED before internal processing.
  - Admin Desa can submit correction/upload replacement, not directly publish public data.
  - Citizen voice can signal potential issue, not publish data.
- correction flow:
  - upload ulang / submit correction
  - clear rejection reason
  - source/correction trail retained

**Acceptance Criteria**

- permission matrix exists
- source priority exists
- existing Sprint 04-008 document approval flow is respected
- no business logic change in this task unless explicitly scoped

---

## S05-005 — MVP Village Data Field Catalog

**Priority:** P1  
**Type:** product/data design  
**Dependency:** S05-004 recommended

**Goal**  
Define exactly which village data fields Sprint 05 will manage first.

**Scope**

- Review existing `Desa`, `DataSource`, `AnggaranDesaSummary`, `APBDesItem`, `DokumenPublik`, and `PerangkatDesa` models.
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
- Mark each field as:
  - public/private
  - required/optional
  - time-sensitive/non-time-sensitive
  - mappable from document or manual only
  - source required or optional

**Acceptance Criteria**

- MVP village data field list exists
- each field has category, visibility, required/optional, and source requirement
- no migration in this task

---

## S05-006 — Data Source Registry Upgrade Plan

**Priority:** P1  
**Type:** data model proposal  
**Dependency:** S05-004, S05-005

**Goal**  
Upgrade/reuse the existing `DataSource` concept so every important village data point can be traced to its origin.

**Scope**

- Review existing `DataSource` model before proposing new fields.
- Propose whether to extend existing fields or add related source-detail tables.
- Support origins:
  - document upload
  - admin desa input
  - internal admin input
  - official website
  - government/partner source
  - citizen voice signal
  - system generated
- Define source metadata:
  - source type
  - source URL/file reference
  - uploader/inputter
  - source date
  - confidence/credibility
  - review status
  - internal admin note

**Acceptance Criteria**

- source registry upgrade plan exists
- relationship between data source and village data/version is clear
- admin desa source is not automatically final/published
- migration remains proposal only unless owner approves

---

## S05-007 — Data Quality Rules

**Priority:** P1  
**Type:** validation design  
**Dependency:** S05-005, S05-006

**Goal**  
Define validation rules so manual input and auto mapping cannot publish arbitrary data.

**Scope**

- Define rules per MVP field:
  - type
  - required/optional
  - min/max
  - format
  - stale threshold if relevant
  - allowed source type
- Cover:
  - admin desa input
  - extracted/mapped data
  - internal-admin manual input
  - published version validation
- Define user-safe error messages.

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
**Dependency:** S05-005, S05-006, S05-007

**Goal**  
Store village data change history so every change is auditable and public pages only show the latest published version.

**Scope**

- Propose versioning concept for village data.
- Avoid direct overwrite-only publish flow for public data.
- Every update creates a new version or revision record.
- Old versions are not deleted.
- Public pages only display latest `PUBLISHED` version.
- Internal admin can inspect change history.
- Admin desa can see if submitted data was rejected/replaced.

**Suggested fields**

- `desaId`
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

- versioning proposal exists
- latest published can be distinguished from draft/rejected
- no hard delete for old versions
- relationship to existing `Desa` fields is clear

---

## S05-009 — General Data Audit Trail Proposal

**Priority:** P1  
**Type:** data governance proposal  
**Dependency:** S05-004, S05-008

**Goal**  
Define a general audit trail for village data actions, beyond the current admin-claim-oriented audit log.

**Scope**

Audit trail for:

- create data
- update data
- approve data
- reject data
- publish data
- archive data
- resolve conflict
- auto mapping result
- manual internal-admin override
- verified-admin document approve/reject for limited uploads

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

- general data audit proposal exists
- important actions are covered
- audit log is not hard-deleted casually
- data version and audit log can be cross-referenced

---

## S05-010 — Document Intake & Auto Mapping Adapter

**Priority:** P2  
**Type:** implementation plan + MVP implementation if approved  
**Dependency:** S05-004 to S05-009

**Goal**  
Upgrade the existing manual `draft-mapping` flow into an adapter-based intake and auto-mapping draft pipeline.

**Supported MVP inputs**

- TXT
- DOCX
- Excel/XLSX
- PDF text-based
- manual internal-admin paste/input

**Defer**

- scanned PDF OCR
- fully automatic government crawling
- auto-publish
- complex semantic conflict resolution without human review

**Candidate free/open-source libraries to evaluate**

- PDF text extraction: `pdf-parse` or `pdfjs-dist`
- DOCX extraction: `mammoth`
- Excel extraction: `xlsx`
- CSV if needed: `papaparse`
- TXT: native parsing

Package adoption must pass license, maintenance, runtime, Windows, Vercel, and security checks.

**Target flow**

```text
source file/input
-> extract text/table
-> normalize to candidate fields
-> validate with data quality rules
-> save mapping draft
-> do not publish automatically
```

**Acceptance Criteria**

- adapter interface is defined
- at least one low-risk input path is proven or planned clearly
- mapping result uses typed payload
- failed extraction/mapping has clear reason
- AI/auto mapping result remains draft only

---

## S05-011 — Structured Value Diff / Conflict Engine

**Priority:** P2  
**Type:** implementation plan + MVP implementation if approved  
**Dependency:** S05-005 to S05-010

**Goal**  
Compare incoming mapped values against existing latest published values and identify identical/changed/conflicting fields like a structured git diff.

**Diff statuses**

- `IDENTICAL`
- `NEW_FIELD`
- `UPDATED`
- `CONFLICT`
- `MISSING_IN_NEW_SOURCE`
- `INVALID`

**Scope**

- Compare field-by-field values.
- Compare source type/priority.
- Compare source date/freshness when available.
- Compare confidence/quality result.
- Produce review-friendly diff output for internal admin.
- Do not auto-resolve conflict.

**Candidate free/open-source libraries to evaluate**

- `jsondiffpatch`
- `fast-json-patch`
- `deep-diff`

Library adoption must remain replaceable behind internal adapter/helper.

**Acceptance Criteria**

- diff payload type is defined
- identical vs changed vs conflict can be shown clearly
- conflict is not auto-published
- reason/context for conflict is retained

---

## S05-012 — Internal Data Review Workbench

**Priority:** P2  
**Type:** internal-admin UX/workflow implementation plan + MVP if approved  
**Dependency:** S05-010, S05-011

**Goal**  
Create a focused internal-admin workbench for mapping drafts, diffs, conflicts, approve/reject, and publish. This is not a large analytics dashboard.

**Scope**

Internal admin can see:

- mapped draft data
- extraction/mapping failure reason
- source metadata
- field-level diff
- conflict status
- approve/publish action
- reject/fail action with reason
- request correction/upload replacement path if applicable

Filters:

- source type
- status
- desa
- confidence/quality status
- conflict status
- created date

**Acceptance Criteria**

- internal admin has clear workbench plan or MVP
- approve/reject/publish paths are defined
- diff and source visibility are defined
- no broad analytics dashboard required
- mobile-friendly back-office standard remains respected

---

## S05-013 — Public Data Completeness & Empty State

**Priority:** P3  
**Type:** public UX/data quality  
**Dependency:** S05-005, S05-007, S05-008

**Goal**  
Track village data completeness and prevent public pages from showing fake/dummy data.

**Scope**

- Calculate completeness per village/category.
- Mark empty fields.
- Show honest empty states when data is unavailable.
- Prioritize important fields for completion.
- Do not expose confusing internal confidence details to public users unless copy is approved.

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

- data completeness indicator is defined or implemented
- empty state is honest and clear
- public data only comes from valid/reviewed/published source
- no dummy data appears as real public data

---

## S05-014 — Public Latest Published Rendering

**Priority:** P3  
**Type:** public rendering implementation plan / implementation if approved  
**Dependency:** S05-008, S05-011, S05-013

**Goal**  
Public village pages render only the latest published village data version.

**Scope**

- Read latest published village data version.
- Render public data by category.
- Show source attribution where useful and understandable.
- Do not show draft/in-review/rejected data.
- Show honest empty state if data is incomplete.
- Do not show conflicted data as final.

**Rules**

- public page only uses `PUBLISHED` data
- if a newer version exists but is not published, public page still uses latest valid published version
- if data conflicts exist, show latest valid published data or empty state, depending on case

**Acceptance Criteria**

- public page does not use dummy data
- rendered data can be traced to source/version internally
- latest published data renders consistently
- draft/rejected/conflicted data does not leak to public pages

---

## S05-015 — QA Seed Data for Data Workflow

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
- rejected/returned limited-admin document
- rejected admin desa submitted correction
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

## S05-016 — QA, Regression, and Documentation

**Priority:** P3  
**Type:** QA closeout  
**Dependency:** all Sprint 05 implementation tasks

**Goal**  
Verify the data foundation flow without regressing Sprint 04-008 admin flows.

**Scope**

- Test limited admin upload -> verified admin approve/reject/return.
- Test document intake -> mapping draft -> diff -> internal review -> publish.
- Test conflict detection and manual resolution path.
- Test versioning.
- Test public latest published rendering.
- Test rejection/failure reason.
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
- public data does not leak draft/rejected/conflicted data
- audit trail records important actions
- versioning works
- BMAD documentation updated

---

# Dependency Rules

## Start here

Start with S05-001 to S05-003. These reduce instrumentation and runtime safety risk before data workflow work.

## Do not start workflow implementation before these are accepted

Do not implement mapping/review/public rendering until these are owner-reviewed:

1. S05-004 Data Governance & Permission Matrix
2. S05-005 MVP Village Data Field Catalog
3. S05-006 Data Source Registry Upgrade Plan
4. S05-007 Data Quality Rules
5. S05-008 Village Data Versioning Proposal
6. S05-009 General Data Audit Trail Proposal

## Do not start public rendering before conflict/diff rules exist

S05-014 Public Latest Published Rendering depends on S05-011 Structured Value Diff / Conflict Engine. Public pages must not leak draft, rejected, or conflicted data.

## Do not start QA seed data before statuses are clear

S05-015 QA Seed Data depends on S05-010/S05-011/S05-014 so seed cases match actual statuses and public rendering rules.

---

# Recommended Execution Order

1. S05-001 Observability Strategy & OTel Spike
2. S05-002 Homepage/Public Read-path Monitoring
3. S05-003 Type Safety Cleanup for Mapping/Perf Runtime
4. S05-004 Data Governance & Permission Matrix
5. S05-005 MVP Village Data Field Catalog
6. S05-006 Data Source Registry Upgrade Plan
7. S05-007 Data Quality Rules
8. S05-008 Village Data Versioning Proposal
9. S05-009 General Data Audit Trail Proposal
10. S05-010 Document Intake & Auto Mapping Adapter
11. S05-011 Structured Value Diff / Conflict Engine
12. S05-012 Internal Data Review Workbench
13. S05-013 Public Data Completeness & Empty State
14. S05-014 Public Latest Published Rendering
15. S05-015 QA Seed Data for Data Workflow
16. S05-016 QA, Regression, and Documentation

## Deferred / Not Recommended For Sprint 05 Start

- Back-office Warm-path Watch unless a clear regression appears.
- Production `DATABASE_URL`/connection strategy decision unless deployed Preview/Staging evidence becomes available.
- DB indexes for back-office performance. Current evidence does not support this as the primary fix.
- Prisma Accelerate as first reaction.
- Supabase region migration.
- Large analytics dashboard.
- Auto-publish AI-mapped data.
- Treating admin desa input as automatically credible.
- Starting public rendering before version/source/diff/conflict rules are designed.

# Handoff Prompt For Ujang — Do Not Use Until Owner Says Start

```text
Ujang, pull main and read:

- docs/engineering/54-sprint-04-performance-closeout-report.md
- docs/bmad/reports/back-office-performance-audit.md
- docs/bmad/tasks/sprint-05-000-performance-follow-up-backlog.md

Sprint 05 is finalized. Start from:

S05-001 Observability Strategy & OTel Spike

Then continue in numeric order unless a task is explicitly blocked.

Important:
- Do not ask for new decisions unless there is a hard blocker.
- No migration/index without owner review.
- No production DATABASE_URL change.
- No paid/complex third-party adoption without owner approval.
- No sensitive-data logging.
- No public dummy data.
- Do not auto-publish AI/admin-desa data.
- Respect existing Sprint 04-008 flow: LIMITED upload -> VERIFIED approve/reject/return -> Internal Admin review/publish/fail.

Output: BMAD task/report update + QA + guardrails.
```

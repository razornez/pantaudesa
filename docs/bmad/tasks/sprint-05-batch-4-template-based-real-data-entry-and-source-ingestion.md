# Sprint 05 Batch 4 - Template-Based Real Data Entry & Source Ingestion

## Status
PLANNED / READY FOR TECHNICAL GROOMING.

## Owner Goal

Batch 4 must start moving PantauDesa toward real public village data, even if each village is not 100% complete yet.

The goal is:

```text
Start showing real, source-backed public data gradually for each desa based on the active detail template.
```

Data completeness can grow step by step. The system must make it easy to fill fields gradually, safely, and with trusted source context.

## Current Direction

Dashboard grooming/enhancement is on hold. Dashboard stays as-is for now.

Batch 4 focuses on:

```text
active template
-> field-based real data entry / ingestion
-> review
-> publish
-> public detail partial real data
```

## Important Product Principle

Do not frame this as free manual input.

Use safer language:

```text
Template-based data submission
Source-backed structured input
Source ingestion
Data candidate
Review candidate
```

Internal admin must not become the source of truth for factual village data.

Allowed data sources include:

- admin desa structured submission,
- trusted document upload,
- official village website,
- government/official source,
- governance source such as Inaproc when relevant,
- source-backed scraping/fetch result,
- other trusted sources approved by owner.

Citizen voice remains signal only, not factual public data.

## Dynamic Planning Rule

This task is allowed to evolve during development.

Owner explicitly allows:

- Ujang/executor to suggest better technical implementation during development,
- owner to enhance or adjust the plan while the task is being developed,
- implementation details to change as long as the main goal remains the same,
- review report to focus on final goal, quality, safety, and QA rather than exact one-to-one adherence to the initial wording.

However, any meaningful change must be documented in the report with:

```text
what changed
why it changed
impact on user flow
impact on data governance
QA performed
```

Do not treat plan evolution as a failure if:

- the goal remains aligned,
- data remains source-backed,
- public render remains safe,
- testing passes,
- the report is honest.

## Mandatory Standards To Read First

```text
docs/bmad/standards/nextjs-engineering-standard.md
docs/bmad/standards/back-office-runtime-resilience-standard.md
docs/bmad/tasks/sprint-05-village-data-source-of-truth-governance-addendum.md
docs/bmad/tasks/sprint-05-village-data-flow-consolidation-14-fixes.md
```

Use existing UI style. Do not do a full visual redesign in this task unless required to make the new flow usable.

## Branch Rule

Preferred:

```text
sprint-05-batch-4-template-based-real-data-entry
```

If owner explicitly asks to push directly to main, follow owner instruction, but state that clearly in the report.

---

# P0 - Effective Template Driven Field Engine

## Goal

The system must generate input/review fields from the effective template used by a desa.

Resolution:

```text
selected desa
-> explicit active template assignment if available
-> DB active default CURRENT_PUBLIC_DETAIL_TEMPLATE
-> fallback constants only if DB/default unavailable
-> visible components
-> active fields
-> source policy / validation metadata
```

## Requirements

- Use or centralize effective template resolver.
- Do not create a separate template logic for Admin Desa, Internal Admin, Intake, Dashboard, and Public Detail.
- Hidden components must not be editable as publishable fields unless explicitly surfaced as hidden/not publishable.
- Outside-template values must not be silently published.
- Current default template must apply to all desa without custom assignment.
- Future per-desa template switching must remain supported.

## Acceptance

- form/review field list follows active template,
- desa without assignment still gets current default template,
- template metadata can explain which template is being used,
- visible fields are consistent across intake/review/public detail.

---

# P1 - Admin Desa Structured Data Submission

## Goal

Admin desa should be able to submit real data field-by-field based on the active template, without being forced to prepare a special document format.

Possible route:

```text
/profil/admin-desa/data-desa
```

or another route suggested by executor if technically cleaner.

## Flow

```text
Admin Desa opens data submission page
-> system resolves desa and active template
-> visible components and fields are shown
-> admin desa fills available values gradually
-> admin desa attaches source/evidence where required
-> submit creates review candidate
-> internal admin reviews/publishes/rejects
-> only published eligible values appear publicly
```

## Requirements

- Admin desa can submit partial data, not all fields at once.
- Submission status should be clear: draft/submitted/in review/rejected/published as applicable.
- Sensitive fields such as budget must require evidence/source.
- Submission should not auto-publish.
- Admin desa should see honest status of submitted data.

## Acceptance

- admin desa can submit at least one source-backed field from template,
- submission enters review flow,
- public detail does not change before publish,
- rejected submission does not render publicly.

---

# P2 - Internal Admin Source-Backed Structured Input

## Goal

Internal admin can create data candidates based on trusted source, without becoming the source of truth.

Possible routes:

```text
/internal-admin/source-ingestion
/internal-admin/intake?mode=source
/internal-admin/village-data?tab=source-ingestion
```

Executor may suggest the most maintainable route.

## Flow

```text
Internal admin selects desa
-> selects source type
-> enters source URL / source note / document reference
-> inputs or maps field values based on template
-> candidate goes to review/publish flow
```

## Requirements

- Internal admin must provide source/evidence context for factual data.
- Internal admin input is metadata/review/source mapping, not source of truth itself.
- Candidate data must keep provenance.
- No source-less factual public value may be created.
- No auto-publish unless explicitly part of final reviewed action with source-backed evidence.

## Acceptance

- internal admin can create review candidate from trusted source context,
- source metadata is stored,
- candidate is reviewable,
- public detail changes only after publish.

---

# P3 - Source Ingestion / Scraping MVP

## Goal

Internal admin can fetch/scrape a trusted source URL and map extracted content to active template fields.

This is an MVP, not a full crawler.

## MVP Scope

```text
1 URL
-> fetch content
-> extract readable text
-> map/suggest fields based on active template
-> show detected values
-> create review candidate
-> publish/reject through review flow
```

## Allowed Source Examples

- official village website,
- official public document page,
- government/governance source,
- Inaproc-style source where relevant,
- other owner-approved source.

## Requirements

- Store sourceUrl/sourceType/fetchedAt.
- Store extracted text or safe snapshot metadata when appropriate.
- Do not store secrets or private tokens.
- Do not auto-publish scraping result.
- If scraping fails, show honest failure reason.
- Do not build large-scale crawler yet.

## Acceptance

- internal admin can run one source ingestion attempt,
- extracted/mapped candidate can enter review,
- failed ingestion is handled cleanly,
- source provenance is preserved.

---

# P4 - Review Candidate Model / Storage Strategy

## Goal

Create a clean way to store data before it becomes public DataDesa.

Executor may propose whether to:

1. extend existing `AdminDesaDocument` / `aiMappingResult` workflow,
2. introduce a dedicated review candidate model,
3. use a hybrid approach for this batch.

## Suggested Concept

```text
ReviewCandidate / DataSubmission
- id
- desaId
- templateId
- sourceEvidenceId or source metadata
- sourceType
- submittedByRole
- submittedByUserId
- status
- createdAt

ReviewCandidateField / DataSubmissionField
- id
- candidateId
- componentId
- fieldStandardId
- fieldKey
- valueText
- validationStatus
- confidence / mappingNote
```

Public data remains:

```text
DataDesa PUBLISHED + isActive
```

## Requirements

- Pre-public data must not leak to public detail.
- All candidates must preserve source/evidence metadata.
- Candidate should be compatible with Step 2 review or a clear successor review surface.
- Avoid schema changes unless needed and approved.
- If schema migration is needed, document the reason, risk, and fallback.

## Acceptance

- there is a clear storage path for structured submission and source ingestion,
- review candidates are not confused with public data,
- report explains chosen storage strategy.

---

# P5 - Unified Review Flow

## Goal

All data entry/ingestion paths should converge into one understandable review/publish flow.

Sources:

```text
internal intake upload
paste text
admin desa structured submission
internal admin source-backed input
source ingestion / scraping result
```

Review should happen in one main surface if possible:

```text
/internal-admin/intake/[documentId]
```

or a suggested successor if the executor can justify it.

## Requirements

- Do not create duplicate publish queues.
- Final publish/reject/fail action must be clear.
- Reviewer can see source, template, field, current value, proposed value, and validation status.
- Outside-template and hidden component values must be visible in review but not publishable.
- Publish action writes final DataDesa or allowed legacy field updates as designed.

## Acceptance

- all paths produce reviewable candidates,
- review flow is not confusing,
- publish/reject/fail works consistently.

---

# P6 - Publish Guard, Validation, And Field Eligibility

## Goal

Only valid, eligible, source-backed values can become public.

## Minimum Validation

```text
URL fields must be valid URLs
email fields must be valid emails
numeric fields must parse as numbers
budget fields must be numeric and non-negative
year fields must be reasonable
source/evidence required for source-sensitive fields
field must exist in active template
component must be visible or publishable by policy
```

## Requirements

- Invalid fields should be shown in review with clear reason.
- Invalid fields must not silently publish.
- Hidden/outside-template fields must not publish.
- If publishing replaces existing source-backed value, conflict signal or review note should be required when feasible.

## Acceptance

- invalid/hidden/outside-template data is blocked or excluded safely,
- user knows why a field was not published,
- audit records published/skipped behavior.

---

# P7 - Partial Real Public Data Render

## Goal

Public detail must start showing real data gradually, without requiring 100% completeness.

## Public Render Rule

Show only values that are:

```text
PUBLISHED
isActive
eligible for effective template
visible component
safe for public
source-backed where required
```

Fallback values from old `Desa` model can keep page alive, but must not be presented as verified/source-backed if they lack evidence.

## Required Public Behavior

- Some fields can be real while others are missing.
- Missing fields should show calm empty states or be hidden based on template policy.
- Do not show dummy as real.
- Do not show draft/rejected/failed/in-review data.

## Acceptance

- public detail can show partial real data,
- source-backed data is distinguishable from fallback/missing,
- page remains consistent and not broken.

---

# P8 - Source Attribution MVP

## Goal

Public readers should understand where important data came from.

## MVP Direction

Start with section-level source attribution, then field-level only where critical or easy.

Examples:

```text
Sumber: Upload Admin Desa · Direview 18 Mei 2026
Sumber: Website resmi desa · Diambil 18 Mei 2026
Sumber: Dokumen APBDes 2024
```

## Rules

Do not expose:

- storage keys,
- private document URLs,
- raw internal audit data,
- internal admin notes,
- reviewer private identity,
- tokens or credentials.

## Acceptance

- at least key public sections show safe source context,
- no sensitive source metadata leaks.

---

# P9 - Completeness / Progress Signal

## Goal

Because data will be filled gradually, internal admin should be able to understand progress per desa/component.

MVP may expose this in existing Data Desa area, dashboard, or internal helper API.

Example:

```text
Desa A: 35% source-backed
Kontak: lengkap
Anggaran: kosong
Dokumen: sebagian
Potensi: lengkap
```

## Requirements

- Progress must be based on effective template field count.
- Source-backed and fallback should be separated.
- Missing should be honest.
- Do not require dashboard enhancement if owner is still grooming dashboard.

## Acceptance

- there is a reliable way to compute progress/completeness,
- report explains where progress is visible or how it is exposed for next UI.

---

# P10 - Audit Trail, Governance, And Notifications

## Goal

All important data actions must be traceable.

Track:

- admin desa submission,
- internal source-backed candidate creation,
- source ingestion run,
- review decision,
- publish,
- reject/fail,
- field skipped because hidden/outside-template/invalid,
- source metadata used.

## Requirements

- audit should clearly show source of data, actor, and decision.
- notifications should be sent where existing notification flow supports it.
- do not expose audit internals publicly.

## Acceptance

- review and publish actions are auditable,
- source provenance is traceable,
- admin desa can understand rejected/failed submission reason.

---

# P11 - Performance, Runtime Resilience, And QA

## Goal

New input/review/public render paths must not make back-office or public detail fragile.

## Required Static QA

```bash
npm run lint
npx tsc --noEmit
npm test
npm run prisma:generate
npm run build
```

## Manual QA

At minimum:

1. Admin desa submits one template-based field with source/evidence.
2. Internal admin reviews and publishes it.
3. Public detail shows that value and source attribution.
4. Admin desa submits invalid data; review blocks or marks invalid clearly.
5. Internal admin creates source-backed candidate from trusted source context.
6. Source ingestion MVP fetches one URL and creates review candidate or honest failure.
7. Hidden component field is not publishable.
8. Outside-template field is not publishable.
9. Rejected/failed candidate does not appear publicly.
10. Desa without explicit template uses current default template.
11. No internal notes/storage keys/private metadata leak publicly.
12. Mobile view for new pages remains usable.

## Playwright

Add/update regression where feasible:

```text
admin desa structured submit -> internal review -> publish -> public detail
invalid field cannot publish
outside-template/hidden component cannot publish
source attribution visible after publish
```

If Playwright cannot cover a scenario, document why.

## Runtime Resilience

Report must mention:

- Prisma-only read paths,
- fallback/degraded behavior if any,
- local runtime result,
- build/runtime blockers if any.

---

# Out Of Scope For This Batch

Do not work on these unless owner explicitly changes direction:

- dashboard grooming/enhancement,
- public `/desa` advanced filter,
- full visual template builder,
- full template CRUD UI,
- large-scale crawler/scraping automation,
- real traffic analytics integration,
- AI recommendation dashboard,
- public comparison dashboard.

Template CRUD can remain next enhancement. Current batch should use existing active/default template and keep architecture ready for future switching.

---

# Required Report

Create/update:

```text
docs/bmad/reports/sprint-05-batch-4-template-based-real-data-entry-and-source-ingestion-report.md
```

Report must include:

1. branch / commit,
2. final implemented flow,
3. any owner/executor plan changes during development,
4. technical suggestions made by executor and whether accepted,
5. template-driven field engine summary,
6. admin desa structured submission summary,
7. internal admin source-backed input summary,
8. source ingestion/scraping MVP summary,
9. review candidate storage strategy,
10. unified review flow summary,
11. publish guard/validation summary,
12. public partial real data render summary,
13. source attribution summary,
14. completeness/progress summary,
15. audit/governance summary,
16. performance/runtime resilience notes,
17. QA results,
18. Playwright results or reason not run,
19. known limitations,
20. owner test checklist,
21. suggested next enhancement.

## Acceptance Criteria

Batch 4 is successful if:

- data real can be submitted gradually based on active template,
- admin desa has a path to submit structured data,
- internal admin has a source-backed input/ingestion path,
- source ingestion MVP exists or is honestly marked partial with reason,
- all candidate data goes through review before public display,
- public detail can show partial real source-backed data,
- invalid/hidden/outside-template/unreviewed data does not leak publicly,
- source attribution is available for important published data,
- audit trail is preserved,
- QA passes or blockers are honestly documented.

## Short Instruction For Executor

```text
Pull latest main. Read and execute docs/bmad/tasks/sprint-05-batch-4-template-based-real-data-entry-and-source-ingestion.md. The plan is allowed to evolve during development: you may suggest better technical implementation, and owner may enhance the plan mid-task. Document any changes in the report. Main goal: start enabling real public data gradually per desa based on active template, through admin desa structured submission, internal source-backed input, and source ingestion MVP, all reviewed before public render. Do not groom dashboard, public filter, or template CRUD unless owner redirects.
```

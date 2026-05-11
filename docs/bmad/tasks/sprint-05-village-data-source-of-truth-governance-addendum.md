# Sprint 05 - Village Data Source of Truth Governance Addendum

## Status
MANDATORY ADDENDUM.

This addendum overrides any previous wording that suggests internal admin can freely create public village data manually.

## Owner Correction

Manual input by internal admin is NOT allowed as a public data source.

Internal admin may review, approve, reject, compare, select source, and publish reviewed data, but internal admin must not invent or manually type operational village data that becomes public without a trusted external/source-backed basis.

Reason:

```text
If public visitors, especially from government institutions, see incorrect village data that was manually created by internal admin, PantauDesa may be exposed to legal/reputation risk for presenting falsified village data.
```

## Source-of-Truth Rule

Every public village data value must be traceable to a trusted source.

Allowed source categories:

1. Government / official public data source.
2. Government partner/province-provided data.
3. Official village website.
4. Trusted public procurement/budget/governance data sources such as Inaproc where relevant.
5. Uploaded trusted document, such as APBDes, official village document, signed/official PDF, government spreadsheet, or similar.
6. Admin desa submission/upload, but still reviewable and rejectable.
7. Citizen voice only as signal, never as direct public source.

Internal admin input is allowed only as:

- review note,
- rejection reason,
- source selection reason,
- conflict resolution reason,
- classification/correction of mapping,
- metadata correction that does not invent source data.

Internal admin input is NOT allowed as:

- source of truth for public village factual data,
- manually typed value that directly becomes public data,
- replacement for missing trusted source.

## Required Data Governance Model

Each template or component must declare acceptable source-of-truth rules.

At minimum, each `VillageDetailTemplate` or `VillageDetailComponent` should be able to define:

```text
allowedSourceTypes
requiredSourceTypes if needed
sourcePriority
requiresEvidence
canUseAdminDesaSubmission
canUseCitizenVoiceSignal
canUseInternalAdminManualInput=false for public value
```

Each `DetailFieldStandard` may further override source requirements per field.

Examples:

```text
Anggaran component
- allowed sources: GOVERNMENT_SOURCE, PROVINCE_PARTNER, OFFICIAL_WEBSITE, TRUSTED_GOVERNANCE_SOURCE, DOCUMENT_UPLOAD
- requires evidence: true
- admin desa upload allowed: yes, but reviewable
- citizen voice: signal only
- internal admin manual value: no

Kontak resmi component
- allowed sources: OFFICIAL_WEBSITE, ADMIN_DESA_SUBMISSION, DOCUMENT_UPLOAD
- requires evidence: recommended
- internal admin manual value: no

Profil/potensi component
- allowed sources: OFFICIAL_WEBSITE, ADMIN_DESA_SUBMISSION, DOCUMENT_UPLOAD, GOVERNMENT_SOURCE
- internal admin manual value: no
```

## Recommended Source Types

Use or align with these source types:

```text
GOVERNMENT_SOURCE
PROVINCE_PARTNER
OFFICIAL_WEBSITE
TRUSTED_GOVERNANCE_SOURCE
DOCUMENT_UPLOAD
ADMIN_DESA_SUBMISSION
CITIZEN_VOICE_SIGNAL
SYSTEM_GENERATED_METADATA
INTERNAL_ADMIN_REVIEW_NOTE
```

Do not use `INTERNAL_ADMIN_INPUT` as a public data source type for factual village data.
If the existing schema has `INTERNAL_ADMIN_INPUT`, limit it to notes/metadata only or rename its semantic meaning in code/report.

## Known Trusted Source Candidates Mentioned In Sprint 05 Discussion

These are source candidates to be collected/registered, not automatically trusted for every field:

```text
https://data.inaproc.id/
```

Other government/open-data sources discovered during Sprint 05 research should be added to the DataSource registry task/report with their usage scope and trust level.

Important: a source being public does not mean every field from it can be published without review. Internal admin still reviews and decides.

## Impact On Current End-to-End Task

Update the end-to-end task and implementation accordingly:

1. Remove manual public data input as a feature.
2. Remove or disable any UI called `Input Data Manual` if it allows typing public values without source evidence.
3. Remove or do not implement `POST /api/internal-admin/village-data/data-desa-rows` for free manual value creation.
4. DataDesa rows should be created from trusted source-backed flows only:
   - intake upload/paste from trusted document/source,
   - admin desa submission/upload,
   - official website/government/inaproc-style source ingestion when implemented,
   - reviewed mapping from source content.
5. Internal admin can edit mapping/correct classification only if original source evidence remains linked.
6. Internal admin can publish/reject only after reviewing source/evidence.

## DataDesa Write Rule

A DataDesa row may be created only when it has at least one source/evidence reference:

```text
sourceId OR sourceUrl OR sourceDocumentId OR sourceRegistryId
```

For MVP, document upload/intake can use uploaded document ID as the source reference.

Rows without a trusted source reference must not be publishable.

## Review/Publish Rule

Internal admin may publish only if:

- value is linked to a trusted source/evidence,
- field source requirements are satisfied,
- component/template source-of-truth policy allows that source type,
- status is IN_REVIEW,
- review decision is recorded,
- audit event is created.

Reject must include reason.

## Public Render Rule

Public village detail page may render only:

```text
DataDesa.status = PUBLISHED
DataDesa.isActive = true
component visible for desa
template active for desa
source/evidence exists and passes field/component policy
```

Never render:

- draft,
- in review,
- rejected,
- archived,
- citizen voice signal as factual data,
- internal-admin-only note as factual public data,
- value without source evidence.

## UI Requirement

Internal Admin Data Desa should focus on:

- source registry,
- source evidence,
- intake/review queue,
- field mapping correction,
- conflict resolution,
- publish/reject decision,
- source-of-truth explanation per component/template.

It must not present manual typing as the primary way to create public village data.

If there is a form, it must be for:

- adding source metadata/URL/document reference,
- review note,
- rejection reason,
- mapping correction with evidence,
- conflict resolution reason.

## Acceptance Criteria

- No manual internal-admin-created factual village value can be published without trusted source evidence.
- Every public value has a traceable source/evidence.
- Each component/template has source-of-truth policy documented or represented in code/data.
- Admin desa input remains reviewable and rejectable.
- Citizen voice remains signal only.
- Internal admin remains final reviewer/publisher, not source inventor.
- Reports and UI copy do not claim manual input is the source of public village data.

## Short Instruction For Asep

```text
Asep, update branch s05-village-data-end-to-end-real-input based on this addendum. Remove/disable manual public data input. DataDesa must be source-backed only. Internal admin can review, correct mapping with evidence, approve/reject, and publish, but must not become the source of truth. Every template/component/field must have source-of-truth policy or at least documented allowed source types. DataDesa publish requires source evidence. Citizen voice is signal only. Update report and QA accordingly.
```

# Sprint 05 - Flexible Data Desa Model & Detail Template Registry

## Status
READY FOR OWNER REVIEW / ARCHITECTURE INPUT.

## Context

Owner proposed a flexible `desa -> data_desa` model so PantauDesa is not locked to a rigid public detail format.

Current concern:

- Public village detail page may change over time.
- Intake mapping should not only map to a small fixed allowlist.
- Admin desa/internal users may upload raw data in many formats.
- The system must understand which public detail fields are filled, empty, covered by uploaded data, or not yet supported.

## Proposed Direction

Use a one-to-many flexible data layer:

```text
Desa
- id
- nama
- websiteOfficial
- core stable identity fields

DataDesa
- id
- desaId
- kategoriData
- deskripsi / label
- value / structuredValueJson
- sourceId / source label
- pipelineStatus
- isActive
- reviewStatus
- confidence
- version/ref metadata
- createdBy/reviewedBy/publishedBy
- timestamps
```

Also add a standard registry for current public detail structure:

```text
DataDesaTemplate / DetailFieldStandard
- id
- sectionKey
- sectionLabel
- fieldKey
- fieldLabel
- expectedValueType
- sourceRequired
- validationRule
- displayOrder
- isActive
- isPublic
- mapsToModel / mapsToPath
- publishTarget
- description
```

## Why This Matters

This makes village data flexible:

- data can be added without constantly changing the `Desa` table,
- data can be removed/deactivated without hard delete,
- public detail format can change by updating the template/standard registry,
- intake/AI mapping can compare uploaded content against current public detail standards,
- admin review can preview how mapping affects the public detail layout,
- future OCR/OpenAI mapping can target template fields dynamically.

## Required Architecture Decisions

### 1. Keep `Desa` as stable identity/core table

`Desa` should keep stable identity and high-usage fields:

- id
- nama
- slug
- kodeDesa if applicable
- core wilayah fields if still needed for fast lookup
- official website if considered stable/core

Do not overload `Desa` with every future public detail field.

### 2. Add flexible `DataDesa` layer

`DataDesa` should represent reviewable village facts/data points.

Suggested fields:

```text
id
inputId/sourceDocumentId/sourceId
desaId
categoryKey
fieldKey
label
valueText
valueNumber
valueDate
valueJson
unit
year
sourceType
sourceLabel
sourceUrl
pipelineStatus: DRAFT / IN_REVIEW / PUBLISHED / REJECTED / ARCHIVED
reviewStatus
confidence
isActive
publishedAt
createdBy
reviewedBy
publishedBy
createdAt
updatedAt
```

Use typed columns where clearly useful, but keep `valueJson` for flexible future data.

### 3. Add detail template / standard registry

This registry becomes the current standard of the public village detail page.

It should answer:

- what data sections exist on the public detail page,
- what fields are expected in each section,
- which fields are required/optional,
- what value type is expected,
- where the value is stored,
- whether the field is currently publishable,
- what validation rule applies,
- how it should be rendered.

When public detail layout changes, update this registry.

### 4. Review UI should preview public detail layout

Internal admin review should ideally preview mapping in a layout that resembles the public village detail page.

It should show:

- current published value,
- incoming draft value,
- final admin decision,
- source,
- confidence,
- status,
- whether the target field is filled or empty,
- whether the uploaded document covers that field,
- whether it is detected but not publishable yet.

This is the target next-level UX.

Mobile requirement:

- must remain usable on small screens such as iPhone 12 mini,
- use compact cards/accordion/stepper,
- do not show a giant dashboard on mobile.

## OpenAI Dynamic Mapping Alignment

OpenAI-assisted mapping should not be hardcoded only to the old allowlist.

When `OPENAI_API_KEY` is available, the system should send:

- extracted text or supported file/image input,
- current `DetailFieldStandard` registry,
- current existing desa values if needed,
- instructions to return structured JSON.

AI output should classify findings into:

```text
knownPublishableFields
knownButNeedsReviewFields
detectedButNotYetPublishable
unknownUsefulFields
warnings
confidence
source/evidence
```

If OpenAI is unavailable, quota-limited, or rate-limited:

- show honest fallback message,
- keep local parser/manual paste available,
- do not block the entire intake flow.

## Guardrails

Do not:

- auto-publish OpenAI/parser/admin-desa output,
- store unsupported data in the wrong model just to make UI look complete,
- show dummy data as real public data,
- hard-delete old data,
- apply shared/production migration without owner approval,
- log full document content, full prompt/response, token, DB URL, storage key, email, or sensitive identifiers.

## Relationship To Existing Sprint 05 Tasks

Primary related tasks:

- S05-005 MVP Village Data Field Catalog
- S05-006 Data Source Registry Upgrade Plan
- S05-007 Data Quality Rules
- S05-008 Village Data Versioning
- S05-010 Document Intake & Auto Mapping Adapter
- S05-011 Structured Value Diff / Conflict Engine
- S05-012 Internal Data Review Workbench
- Batch 3 Fix Pack before Batch 4

## Expected Output

Before implementation/migration:

- ERD proposal for `DataDesa` and `DetailFieldStandard`,
- migration proposal only, not applied to shared/production DB,
- mapping from current public detail page to template fields,
- UI review concept showing public-detail-like preview,
- OpenAI dynamic mapping contract that references the template registry,
- owner approval checkpoint.

## Acceptance Criteria

- flexible one-to-many data model is documented,
- public detail template registry is documented,
- review UI direction is clear and mobile-friendly,
- OpenAI mapping is dynamic and template-aware,
- no production/shared DB migration is applied without approval.

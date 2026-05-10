# Sprint 05 - Flexible Village Detail Template Foundation

## Status
PLANNED - design first, migration after owner review.

## Owner Decision

Owner approved the idea of creating an Internal Admin `Data Desa` center and added an important requirement:

```text
Halaman detail desa harus fleksibel.
Desa A bisa memakai template A.
Desa B bisa memakai template B.
Untuk sekarang, semua desa memakai template detail desa yang sedang berjalan saat ini.
Nanti halaman detail desa dan intake harus membaca dulu desa tersebut memakai template mana.
```

## Purpose

Create the foundation for dynamic village detail pages and intake mapping by introducing a template-based data model.

This is the design foundation before database migration.

## Key Principle

`Desa` should not hardcode every public detail field forever.

Recommended direction:

```text
Desa = core identity
VillageDetailTemplate = layout/field template used by a desa
DetailFieldStandard = fields/sections inside a template
DataDesa = flexible one-to-many data values for a desa
DataSource = source registry for each value
VillageDataVersion = published version/history
DesaDataAuditEvent = audit trail
```

## Current MVP Rule

For now:

```text
All desa use one active default template:
CURRENT_PUBLIC_DETAIL_TEMPLATE
```

This default template should reflect the current public village detail page.

Future support:

```text
Desa A -> Template A
Desa B -> Template B
Desa C -> Template C
```

## Required Model Concepts

### 1. VillageDetailTemplate

Represents a detail-page template/layout.

Suggested fields:

```text
id
key
name
description
version
status: DRAFT / ACTIVE / DEPRECATED / ARCHIVED
isDefault
createdAt
updatedAt
createdById
```

Examples:

```text
CURRENT_PUBLIC_DETAIL_TEMPLATE
ANGGARAN_FOCUSED_TEMPLATE
TOURISM_VILLAGE_TEMPLATE
MINIMAL_PROFILE_TEMPLATE
```

### 2. Desa Template Assignment

Each desa should know which template it uses.

Options:

A. Add field to `Desa`:

```text
detailTemplateId
```

B. Use assignment table:

```text
DesaDetailTemplateAssignment
- id
- desaId
- templateId
- isActive
- assignedAt
- assignedById
- reason
```

Recommended for flexibility:

```text
Use assignment table if template history matters.
Use `Desa.detailTemplateId` if MVP wants simpler implementation.
```

For current MVP, all desa can point to the same default template.

### 3. DetailFieldStandard

Represents fields inside a template.

Suggested fields:

```text
id
templateId
fieldKey
category
sectionKey
sectionLabel
label
description
valueType
isRequired
isPublicVisible
isRepeatable
displayOrder
sectionOrder
validationRulesJson
allowedSourceTypesJson
status: DRAFT / ACTIVE / DEPRECATED / ARCHIVED
createdAt
updatedAt
```

This is the source of truth for:

- public detail page rendering,
- intake coverage,
- OpenAI/local mapping target,
- review form field list,
- empty state generation,
- data quality validation.

### 4. DataDesa

Flexible one-to-many data value table for desa.

Suggested fields:

```text
id
desaId
templateId
fieldStandardId
fieldKey
category
label
valueJson
valueText
sourceId
status: DRAFT / IN_REVIEW / PUBLISHED / REJECTED / ARCHIVED
reviewStatus
confidence
isActive
versionNumber
publishedAt
createdById
reviewedById
createdAt
updatedAt
```

Rules:

- one desa can have many `DataDesa` rows,
- only `PUBLISHED` + `isActive=true` may be rendered publicly,
- draft/rejected/in-review must never leak to public page,
- old versions must not be hard deleted.

### 5. DataSource

Registry for the source of a value.

Source priority must support owner rule:

```text
1. official/government/official website source
2. government/province partner source
3. internal admin input
4. admin desa input
5. document upload depending on document credibility
6. citizen voice as signal only
```

Suggested source types:

```text
OFFICIAL_WEBSITE
GOVERNMENT_SOURCE
PROVINCE_PARTNER
INTERNAL_ADMIN_INPUT
ADMIN_DESA_INPUT
DOCUMENT_UPLOAD
CITIZEN_VOICE
SYSTEM_GENERATED
```

## Internal Admin Menu Direction

Create a new Internal Admin center later:

```text
/internal-admin/village-data
```

Menu label:

```text
Data Desa
```

Recommended tabs:

```text
Overview
Standar Detail
Data per Desa
Review Data
Sumber Data
Konflik
Versi & Audit
```

MVP tabs first:

```text
Standar Detail
Data per Desa
Versi & Audit
```

## How Intake Should Work Later

Before mapping, intake must resolve:

```text
selected desa
-> active detail template for that desa
-> active DetailFieldStandard list
-> current published DataDesa values
-> uploaded document/parser/AI result
-> coverage/diff/validation
```

This makes intake template-aware.

For current MVP:

```text
all desa -> default current public detail template
```

## How Public Village Detail Should Work Later

Before rendering, public detail page must resolve:

```text
desa
-> active detail template
-> active fields in template
-> latest published DataDesa per field
-> render sections in template order
```

For transition/hybrid mode:

- existing hardcoded model fields may continue to render,
- DataDesa can gradually override/add fields,
- no draft/rejected/in-review values may render publicly.

## Template Strategy

### Phase 1 - Single Default Template

- Create default template representing current public detail page.
- Assign all desa to this default template.
- Intake and public detail can begin reading template definition.

### Phase 2 - Template-aware Intake

- Intake uses the desa's active template for coverage/mapping.
- AI/local parser receives active field standards as target.

### Phase 3 - Dynamic Public Detail Rendering

- Public detail renders from template + published DataDesa.
- Existing fields can remain hybrid until fully migrated.

### Phase 4 - Multi-template Support

- Allow different desa to use different templates.
- Example: tourism village, budget-focused village, minimal village profile.

## Migration Strategy Recommendation

Do not run migration until this design is reviewed.

When approved, migration should be planned together with:

```text
VillageDetailTemplate
DetailFieldStandard
DataDesa
DataSource improvements
VillageDataVersion
DesaDataAuditEvent
```

This avoids multiple fragmented migrations.

## Guardrails

Do not:

- auto-publish mapped data,
- expose draft/rejected values publicly,
- hardcode prototype data,
- create duplicate review queues,
- apply migration to shared/production DB without owner approval,
- remove existing public detail behavior until replacement is verified.

## Acceptance Criteria For Design Stage

- Template-based direction is documented.
- Current default template strategy is clear.
- Future per-desa template assignment is supported.
- Intake knows it must read the desa's active template.
- Public detail knows it must read the desa's active template.
- Migration is held until owner approves schema.

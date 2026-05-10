# Sprint 05 - Asep Handoff: Flexible Village Data Admin Center

## Status
READY FOR ASEP EXECUTION AFTER OWNER CONFIRMATION.

## Mandatory Standards

Before coding, read and follow:

```text
docs/bmad/standards/back-office-ui-design-guidelines.md
```

This standard is mandatory for all back-office UI work.

The UI direction must stay consistent with Intake V2:

```text
quiet luxury
clean
calm
premium but simple
soft border
subtle shadow
strong hierarchy
compact but breathable
decision-oriented
technical detail collapsed
clear primary action
mobile-friendly
```

Do not create a feature that looks visually disconnected from Intake V2.

## Related Planning Docs

Read first:

```text
docs/bmad/tasks/sprint-05-flexible-village-detail-template-foundation.md
docs/bmad/tasks/sprint-05-batch-3-db-activation-versioning-audit.md
docs/bmad/tasks/sprint-05-batch-3-intake-v2-full-page-redesign.md
docs/bmad/standards/back-office-ui-design-guidelines.md
```

## Branch Rule

Create a new branch from `main`:

```text
s05-flexible-village-data-admin-center
```

Do not commit directly to `main`.
Do not merge to `main` without owner/Rangga approval.
Do not apply production/shared DB migration without owner approval.

## Goal

Prepare the foundation for flexible, template-aware village detail data management.

The future system must support:

```text
Desa A -> Template A
Desa B -> Template B
Desa C -> Template C
```

For current MVP:

```text
All desa use one active default template:
CURRENT_PUBLIC_DETAIL_TEMPLATE
```

Both Intake and public village detail page must eventually read which template the selected desa uses.

## Product Direction

Create the foundation for a future Internal Admin menu:

```text
/internal-admin/village-data
```

Menu label:

```text
Data Desa
```

This center will manage:

- village detail templates,
- field standards,
- data per desa,
- sources,
- version history,
- audit trail,
- conflicts,
- publish/review status.

## MVP Tabs / Surfaces

For first implementation/proposal, prioritize these tabs:

```text
1. Standar Detail
2. Data per Desa
3. Versi & Audit
```

Later tabs:

```text
Review Data
Sumber Data
Konflik
```

If UI is implemented now, keep it minimal but polished. No ugly placeholder dashboards.

## Required Architecture Direction

Use this conceptual model:

```text
Desa = core identity
VillageDetailTemplate = layout/template used by a desa
DetailFieldStandard = field/section registry inside a template
DataDesa = flexible one-to-many data values for a desa
DataSource = source registry
VillageDataVersion = version/history
DesaDataAuditEvent = audit trail
```

## Required Work

### 1. Audit Existing Data Model And Flow

Inspect existing schema and code paths for:

- `Desa`
- public village detail page
- intake coverage/mapping
- review queue/publish flow
- existing `DataSource` if any
- version/audit fallback helpers
- current detail fields shown on public page

Output:

- what exists today,
- what can be reused,
- what must not be duplicated,
- what must remain hybrid for now.

### 2. Finalize Schema Proposal Before Migration

Do not run migration first.

Prepare a schema proposal for:

- `VillageDetailTemplate`
- `DesaDetailTemplateAssignment` or `Desa.detailTemplateId`
- `DetailFieldStandard`
- `DataDesa`
- `DataSource` improvements if needed
- `VillageDataVersion`
- `DesaDataAuditEvent`

The proposal must explain:

- relations,
- status enums,
- lifecycle,
- publish rules,
- source priority,
- audit/version rules,
- fallback/hybrid strategy,
- how existing public detail remains safe.

### 3. Default Template Strategy

Define and seed/prepare conceptually:

```text
CURRENT_PUBLIC_DETAIL_TEMPLATE
```

This represents the current public village detail page.

All desa should use this template in MVP.

Future support must allow different templates per desa.

### 4. Intake Template Awareness

Plan how Intake should resolve:

```text
selected desa
-> active template
-> active DetailFieldStandard list
-> current published DataDesa values
-> uploaded file/parser/AI result
-> coverage/diff/validation
```

Do not fake this with hardcoded UI data.

### 5. Public Detail Template Awareness

Plan how public detail should resolve:

```text
desa
-> active template
-> active field standards
-> latest published DataDesa per field
-> render by section/order
```

For transition, public detail may stay hybrid:

```text
existing model fields + published DataDesa additions/overrides
```

Draft/in-review/rejected data must never appear publicly.

### 6. Internal Admin UX Direction

If implementing UI surface now, it must follow:

```text
docs/bmad/standards/back-office-ui-design-guidelines.md
```

Important rules:

- no plain ugly admin table dump,
- no scattered cards,
- no redundant surfaces,
- use decision-oriented summary,
- technical details collapsed,
- action placement clear,
- mobile-friendly,
- same vibe as Intake V2.

### 7. No Redundant Components / No Duplicate Flow

Before creating new components:

- check existing internal-admin components,
- reuse Intake V2 patterns where possible,
- remove superseded unused scaffolds,
- do not create a second review queue,
- do not duplicate DTOs already in `src/lib/**`,
- do not create duplicate field standard constants.

If a new component is necessary, document why.

### 8. Zero-Bug Flow Requirement

The flow must be mature before owner test.

No half-baked states such as:

- broken placeholder sections,
- static prototype data,
- wrong CTA state,
- draft/rejected data leaking to public,
- missing empty states,
- double source of truth,
- UI that works desktop but breaks mobile.

If a capability is not ready, show an honest compact fallback/empty state.

## QA Requirements

Minimum required:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If build is blocked by Prisma Windows EPERM, document exact error and whether lint/tsc pass.

### Playwright QA

If Playwright is available in the project, add or run Playwright coverage for critical back-office flows.

Recommended test coverage:

1. Internal admin can open `/internal-admin/intake`.
2. Intake V2 result page renders without static prototype data.
3. Main CTA is visible.
4. Technical detail is collapsed by default.
5. Mobile/narrow viewport does not horizontally scroll.
6. Future `/internal-admin/village-data` shell, if implemented, loads and follows UI standard.
7. Draft/rejected data is not shown as public data.

If Playwright is not configured or cannot run, state why and provide manual QA checklist.

## Required Report

Create/update:

```text
docs/bmad/reports/sprint-05-flexible-village-data-admin-center-report.md
```

Report must include:

1. branch name,
2. files changed,
3. schema proposal summary,
4. template assignment strategy,
5. current default template plan,
6. intake sync plan,
7. public detail sync plan,
8. component reuse/cleanup summary,
9. UI standard compliance note,
10. QA result,
11. Playwright result if available,
12. known limitations,
13. migration recommendation,
14. owner approval points.

## Guardrails

Do not:

- auto-publish mapped data,
- expose draft/rejected/in-review data publicly,
- apply production/shared migration without owner approval,
- hardcode prototype data,
- create duplicate review queues,
- create redundant components,
- ignore `back-office-ui-design-guidelines.md`,
- change auth/permission rules,
- expose secrets/API keys/full DB URLs,
- merge to main without approval.

## Acceptance Criteria

This task is acceptable only if:

- the flexible template-based direction is clear,
- current default template strategy is defined,
- future per-desa template support is possible,
- intake and public detail sync plan is clear,
- no duplicate UI/component/source-of-truth is introduced,
- UI standard is explicitly followed,
- QA is documented,
- Playwright is added/run if available,
- migration is not applied until owner approves the schema.

## Short Instruction For Asep

```text
Asep, pull main lalu baca task ini penuh:
docs/bmad/tasks/sprint-05-flexible-village-data-admin-center-asep-handoff.md

Wajib ikuti:
docs/bmad/standards/back-office-ui-design-guidelines.md

Buat branch:
s05-flexible-village-data-admin-center

Fokus desain foundation Data Desa template-aware dulu. Jangan migration shared/production. Jangan bikin UI yang beda vibe dari Intake V2. Jangan duplikasi komponen/flow. Pastikan QA lengkap, tambah Playwright kalau tersedia. Report wajib jelas sebelum owner review.
```

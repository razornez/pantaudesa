# Back Office Module Standardization - Phase 1

## Status
PLANNED - execute before new dashboard/public filter enhancements.

## Purpose

Clean up and standardize the current back-office modules before adding more features.

This task focuses on structure, maintainability, performance, and consistency for back-office pages first.

## Owner Direction

Owner wants to pause new enhancement work and tidy up messy modules.

Apply the engineering standard introduced in:

```text
commit 9f1776b6d62481d70d8d22bf3dcc47e901524c58
docs/bmad/standards/nextjs-engineering-standard.md
```

Also follow existing back-office UI standard:

```text
docs/bmad/standards/back-office-ui-design-guidelines.md
```

Going forward, every development task must check BMAD standards first before coding.

## Scope - Phase 1 Back Office Only

Initial scope:

```text
src/app/internal-admin/**
src/app/api/internal-admin/**
src/components/internal-admin/**
src/lib/intake/**
src/lib/village-data/**
src/lib/versioning/**
```

Do not refactor unrelated public pages in this phase unless needed to extract shared code safely.

## Required Approach

Do this step by step. Do not rewrite everything at once.

Recommended phases:

```text
Step 1 - Audit and report module problems
Step 2 - Extract types/constants/copy
Step 3 - Extract API clients/hooks/view models
Step 4 - Extract service/repository/policy boundaries where safe
Step 5 - Remove duplicate components/flows
Step 6 - Performance and query cleanup
Step 7 - QA and report
```

## Standards To Apply

### 1. File size and responsibility

Follow line budget:

```text
Ideal: 80-250 lines
Warning: 300 lines
Hard limit: 500 lines
```

Large files must be split into focused modules.

Common extraction targets:

```text
types.ts
constants.ts
copy.ts
schema.ts
mapper.ts
service.ts
repository.ts
policy.ts
api.ts
hooks.ts
client.tsx
modal.tsx
table.tsx
empty-state.tsx
skeleton.tsx
```

### 2. App Router responsibility

`page.tsx` and `route.ts` must stay thin.

Allowed in page:

- auth/session check,
- call server/service function,
- compose UI.

Not allowed:

- long business logic,
- complex Prisma query,
- large mapper/helper blocks.

### 3. UI component responsibility

Client components should not own large API/business logic.

Move:

- fetch wrappers to API client modules,
- stateful reusable logic to hooks,
- business rules to services/policies,
- formatting/mapping to mapper modules,
- repeated user copy to copy modules.

### 4. Type safety

Required:

- no new `any`,
- `unknown` must be narrowed,
- API DTO types explicit,
- component props explicit,
- union types for statuses.

### 5. Data and query performance

Apply:

- `select` over broad `include`,
- pagination for lists,
- no large JSON fields in list views unless needed,
- no N+1 queries,
- request-level dedupe/cache only where safe,
- slow query evidence before proposing index migration.

### 6. Security and governance

Preserve:

- server-side auth,
- server-side permission checks,
- source-of-truth governance,
- no manual internal-admin source of truth,
- strict public render rules,
- no sensitive logging,
- audit trail for sensitive action.

### 7. UI consistency

All touched back-office UI must follow:

```text
docs/bmad/standards/back-office-ui-design-guidelines.md
```

Do not create a feature with different vibe from Intake V2 / quiet luxury direction.

### 8. No duplicate modules

Audit and remove/consolidate duplicated:

- filter components,
- review/publish surfaces,
- history/audit panels,
- status badges,
- empty states,
- DTO/type definitions,
- constants/copy maps,
- route helper functions,
- API fetch wrappers.

Do not remove safe fallback code that is still required for DB outage/local dev.

## High Priority Back-office Files To Audit

Start with these because they recently grew quickly:

```text
src/components/internal-admin/VillageDataCenter.tsx
src/components/internal-admin/IntakeWorkbench.tsx
src/components/internal-admin/AdminDesaFilterBar.tsx
src/components/internal-admin/intake/**
src/app/api/internal-admin/village-data/**
src/app/api/internal-admin/documents/**
src/app/api/internal-admin/intake/**
src/lib/intake/**
src/lib/village-data/**
src/lib/versioning/**
```

## What Not To Do

Do not:

- add new dashboard features in this task,
- add public `/desa` filter in this task,
- build template CRUD,
- change business behavior without explicit note,
- run production/shared DB migration,
- rewrite everything in one giant commit,
- mix unrelated visual redesign with structural refactor unless necessary.

## Expected Deliverables

1. Audit list of problematic modules.
2. Refactor plan split into safe chunks.
3. Refactored modules for agreed Phase 1 scope.
4. Removed duplicate/dead components where safe.
5. No regression to current back-office behavior.
6. Updated report.

## Required Report

Create/update:

```text
docs/bmad/reports/back-office-module-standardization-phase-1-report.md
```

Report must include:

1. branch / commit,
2. standards read,
3. files audited,
4. files refactored,
5. before/after line counts for large files,
6. extracted modules summary,
7. duplicate components removed/consolidated,
8. behavior changes if any,
9. performance notes,
10. QA result,
11. known limitations,
12. suggested next standardization step.

## QA Required

Run and report:

```bash
npm run lint
npx tsc --noEmit
npx prisma generate
npm run build
```

Manual QA minimum:

```text
/internal-admin/village-data
/internal-admin/intake
/internal-admin/documents
modal publish/review flow
activity/audit log
component visibility toggle
public detail page after publish
```

If any QA is blocked, document the exact reason.

## Acceptance Criteria

- Back-office modules follow the Next.js engineering standard better than before.
- Large files are reduced or have documented step-by-step plan.
- No new `any`.
- No duplicate obvious components/flows remain in touched area.
- Back-office UI remains consistent with the design guideline.
- Existing Sprint 05 behavior does not regress.
- Report and QA are complete.

## Short Instruction For Ujang

```text
Ujang, pull latest main. Before new feature work, read docs/bmad/standards/nextjs-engineering-standard.md and docs/bmad/standards/back-office-ui-design-guidelines.md. Then work on docs/bmad/tasks/back-office-module-standardization-phase-1.md. Focus back-office only. Do it step by step if too large. Do not add new dashboard/public filter/template CRUD in this task. Preserve behavior, improve structure, remove duplicates, run QA, and update report.
```

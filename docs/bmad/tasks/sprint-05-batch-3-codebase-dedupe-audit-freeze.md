# Sprint 05 Batch 3 - Codebase Dedupe Audit Freeze

## Status
READY FOR EXECUTION - FREEZE ALL OTHER BATCH 3 WORK.

## Owner Decision

Stop all remaining Sprint 05 Batch 3 implementation tasks temporarily.

Owner suspects the codebase now has duplicate/overlapping functions, APIs, components, hooks, and UI flows due to repeated Batch 3 iterations.

Before continuing P0-2 or any UX polish, audit and remove/merge duplication.

## Working Branch

Continue on:

```text
feat/sprint-05-batch-3-completion-handoff
```

Do not merge to `main`.

## Goal

Find and classify duplicate or overlapping implementation across Sprint 05 Batch 3 and nearby internal-admin/back-office flows.

The goal is to stop wasting time building parallel implementations.

Expected outcome:

```text
one source of truth per function/flow
one review queue source of truth
one intake pipeline path
one history/focus mechanism
no duplicated helper/component/API unless justified
```

## Freeze Rule

Do not start:

- P0-2 preview hero / coverage visualization,
- P0-3 diff redesign,
- P0-4 coverage detail redesign,
- P0-5 action/validation/parser cleanup,
- P0-6 highlight polish,
- review modal polish,
- review queue gallery polish,
- Batch 4.

Until this dedupe audit is complete and reviewed.

## Audit Scope

### 1. Intake workbench code

Check for duplicate/overlapping logic in:

```text
src/components/internal-admin/IntakeWorkbench.tsx
src/components/internal-admin/intake/**
src/lib/intake/**
src/app/api/internal-admin/intake/**
```

Look for duplicated:

- pipeline calls,
- submit-review logic,
- error classification,
- OpenAI fallback handling,
- image/file type detection,
- history loading,
- version history loading,
- field coverage logic,
- diff logic,
- formatting utilities,
- UI copy/constants.

### 2. Review queue / document review flow

Check for overlap between intake history and existing review queue:

```text
src/app/internal-admin/documents/**
src/components/internal-admin/**document**
src/components/internal-admin/**review**
src/app/api/internal-admin/documents/**
src/app/api/internal-admin/intake/history/route.ts
```

Answer:

- Which page is the source of truth for review work items?
- Is `Riwayat Intake` duplicating the review queue?
- Are there two different ways to navigate/review the same `AdminDesaDocument`?
- Is focus/highlight behavior implemented once or multiple times?

### 3. History / audit / versioning

Check overlap among:

```text
AdminClaimAudit
DesaDataAuditEvent / fallback helpers
VillageDataVersion fallback helpers
/api/internal-admin/intake/history
/api/internal-admin/desa-version-history
```

Answer:

- Which table/API is canonical today?
- Which is fallback?
- Which is future/draft only?
- Are any endpoints returning the same information under different names?

### 4. Mapping / diff / field coverage

Check overlap among:

```text
src/lib/admin-claim/ai-mapping.ts
src/lib/intake/auto-mapping.ts
src/lib/intake/openai-mapping.ts
src/lib/intake/detail-field-coverage.ts
src/lib/intake/diff-engine.ts
src/lib/intake/validation.ts
```

Answer:

- Which module owns publishable known fields?
- Which module owns dynamic detected fields?
- Which module owns public detail field registry?
- Are mapping allowlists duplicated?
- Are validation rules duplicated?
- Are field labels duplicated between constants and mapping modules?

### 5. UI components / helpers

Check duplicate components/helpers in:

```text
src/components/internal-admin/**
src/components/admin-desa/**
src/components/**
```

Focus on internal-admin intake/document review components:

- duplicated cards,
- duplicated status badges,
- duplicated collapsible sections,
- duplicated empty states,
- duplicated formatter functions,
- duplicated status label/color maps.

## Required Output Report

Create:

```text
docs/bmad/reports/sprint-05-batch-3-codebase-dedupe-audit-report.md
```

Report must include:

1. Executive summary.
2. List of audited files/folders.
3. Duplicate/overlap findings by severity:
   - Critical: duplicate can cause wrong behavior/data confusion.
   - High: duplicate source of truth or duplicated flow.
   - Medium: duplicate utilities/components causing maintainability risk.
   - Low: naming/copy/constant duplication.
4. Recommended canonical owner for each duplicated area.
5. What should be deleted/merged/reused.
6. What should stay separate and why.
7. Risk if not fixed.
8. Proposed cleanup order.
9. Whether P0-1A is still needed or absorbed into this audit.
10. Short report for Rangga and owner in copy-paste format.

## Implementation Policy

Default for this task is audit/report first.

Allowed code changes only if they are very small and clearly safe:

- remove unused scaffold file,
- remove unused import,
- fix obvious duplicate export,
- add comments marking canonical owner,
- update report/BMAD.

Do not do a large cleanup implementation yet unless owner/Rangga approves the cleanup plan.

## Hard Guardrails

Do not:

- change business logic,
- auto-publish anything,
- change permissions/auth,
- apply migrations,
- change production env,
- remove a flow without confirming replacement,
- start new UX work before audit is reviewed.

## QA

If code changes are made, run:

```bash
npm run lint
npx tsc --noEmit
```

If docs-only, QA can be marked as not required, but state that clearly.

## Final Output Required From Ujang

Return:

1. branch,
2. commit SHA,
3. files changed,
4. summary of audit,
5. duplicate findings by severity,
6. recommended canonical source of truth,
7. cleanup order,
8. whether any safe code cleanup was done,
9. QA result,
10. short report for Rangga and owner ready to copy-paste.

## Acceptance Criteria

- No further Batch 3 feature/UX work starts before this audit is reviewed.
- Duplicate/overlap risk is clearly mapped.
- Owner can decide what to delete/merge/reuse next.
- Review queue, intake history, version history, mapping, diff, and field coverage have clear ownership.

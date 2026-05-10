# Sprint 05 Batch 3 - DB Activation: Versioning & Audit Tables

## Status
PLANNED - execute only after owner approval.

## Purpose

Activate the dedicated database foundation for village data versioning and audit trail carefully, without breaking existing back-office flows.

This task exists because the current fallback-backed versioning/audit path is useful for MVP, but PantauDesa needs real dedicated tables before the data workflow grows.

## Owner Direction

Proceed carefully.

Do not mix this with UI redesign work.

This is a database activation task, not a UI polish task.

## Required Branch Rule

Create a dedicated branch from `main`:

```text
s05-db-activation-versioning-audit
```

Do not commit directly to `main`.
Do not merge to `main` without owner approval.
Do not apply migration to shared/production DB without explicit owner approval.

## Why This Is Sensitive

This task touches Prisma schema and database migration.

Risks if rushed:

- schema changes break runtime,
- migration applies to the wrong database,
- Prisma client is out of sync,
- fallback and dedicated paths diverge,
- draft/rejected data leaks into public flow,
- versioning/audit gives false confidence,
- rollback becomes harder than UI-only changes.

## High-Level Goal

Move from fallback-backed audit/versioning toward dedicated table-backed persistence for:

- village data version history,
- data audit trail,
- future flexible village data layer.

Initial activation target:

```text
VillageDataVersion
DesaDataAuditEvent
```

Future/next target after review:

```text
DataDesa
DetailFieldStandard
DataSource registry improvements
```

## Scope For This Task

### In Scope

1. Review current Prisma schema draft for:
   - `VillageDataVersion`
   - `DesaDataAuditEvent`

2. Check existing code paths:
   - intake submit-review
   - document draft save
   - document publish
   - mark failed
   - desa version history route
   - intake history route
   - fallback persistence helpers

3. Prepare migration safely.

4. Run migration only on a safe local/dev database after verifying env target.

5. Regenerate Prisma client.

6. Make runtime read dedicated tables first, fallback second.

7. Ensure write path records to dedicated tables when available.

8. Keep fallback path intact.

9. Update BMAD report with exact status.

### Out of Scope

Do not implement yet unless owner approves separately:

- public page rendering from `DataDesa`,
- full flexible `DataDesa` write flow,
- DB-backed `DetailFieldStandard` admin UI,
- data source registry UI,
- conflict resolution UI,
- schema changes beyond versioning/audit activation,
- production/shared DB migration.

## Required Safety Checks Before Any Migration

Before running migration, print and verify only safe metadata, never credentials:

```text
NODE_ENV
DATABASE_URL host only
DATABASE_URL port only
DATABASE_URL database name if safe
DIRECT_URL host only
DIRECT_URL port only
current git branch
migration name
```

Do not print:

- password,
- full DB URL,
- API keys,
- tokens,
- secrets.

Add a preflight note in report:

```text
Migration target verified: local/dev only.
No shared/production migration applied.
```

If target cannot be confidently verified as local/dev/safe, stop and report.

## Required Implementation Plan

### Step 1 - Schema Review

Inspect current schema and confirm:

#### `VillageDataVersion` must support:

- `id`
- `desaId`
- `documentId` if applicable
- `versionNumber`
- `status`
- `sourceType` or source reference if already available
- `dataSnapshotJson`
- `changedFieldsJson`
- `reviewNote`
- `rejectionReason`
- `publishedAt`
- `reviewedById`
- `createdById`
- `createdAt`
- `updatedAt`

Recommended status values:

```text
DRAFT
IN_REVIEW
PUBLISHED
REJECTED
ARCHIVED
```

#### `DesaDataAuditEvent` must support:

- `id`
- `actorId`
- `actorRole`
- `action`
- `targetType`
- `targetId`
- `desaId`
- `documentId` if applicable
- `beforeSnapshotJson`
- `afterSnapshotJson`
- `reasonText`
- `metadataJson`
- `ipAddress` if available
- `userAgent` if available
- `createdAt`

Required audit actions:

```text
INTAKE_SUBMITTED
DRAFT_MAPPING_SAVED
DATA_PUBLISHED
DATA_REJECTED
DOCUMENT_FAILED
CONFLICT_RESOLVED
MANUAL_OVERRIDE
```

If current schema draft lacks important fields, propose changes first. Do not migrate incomplete schema silently.

### Step 2 - Migration Plan

Create a migration only after schema review.

Use a clear migration name, for example:

```text
sprint_05_activate_village_versioning_audit
```

Do not run migration against shared/production database.

If Windows Prisma EPERM blocks `prisma generate`, do not keep retrying blindly. Document the exact blocker and recommend running in Linux/CI/clean environment.

### Step 3 - Runtime Write Path

Dedicated table write path should happen for:

- intake submit to review,
- draft mapping save,
- publish final,
- mark failed/rejected.

Rules:

- Write dedicated table when table/client is available.
- If dedicated table write fails due to table missing/connectivity issue, fallback to existing audit path.
- Do not fail the main user flow only because dedicated audit write failed, unless the main data publish itself fails.
- Log/report only safe metadata.

### Step 4 - Runtime Read Path

Read dedicated tables first for:

- version history,
- audit/history panels.

Fallback order:

```text
dedicated table
-> existing AdminClaimAudit/fallback path
-> compact empty state
```

UI must clearly say if it is reading fallback mode.

### Step 5 - Public Data Safety

Public page must not read draft/in-review/rejected data.

Rules:

- only `PUBLISHED` version can be public candidate,
- if no published version exists, keep current public data behavior,
- do not change public page read-path in this task unless owner explicitly approves.

### Step 6 - Tests / Manual Verification

Create or run tests where available.

Manual checks:

1. Submit intake to review.
2. Save draft mapping.
3. Publish from review queue.
4. Mark failed/rejected.
5. Open desa version history.
6. Open intake history.
7. Confirm fallback still works if dedicated table unavailable.
8. Confirm public page does not show draft/rejected data.

## Required QA

Run and report:

```bash
npm run lint
npx tsc --noEmit
npx prisma generate
npm run build
```

If build/generate fails due to Prisma Windows EPERM:

- record exact error,
- state whether lint and tsc pass,
- state whether migration was applied or not,
- do not hide the blocker.

## Required Report Update

Create or update:

```text
docs/bmad/reports/sprint-05-batch-3-db-activation-versioning-audit-report.md
```

Report must include:

1. branch name,
2. migration status,
3. target DB safety verification,
4. schema changes,
5. tables activated,
6. write path behavior,
7. read path behavior,
8. fallback behavior,
9. public data safety confirmation,
10. QA result,
11. blockers,
12. owner approval needed before wider DB apply,
13. rollback consideration,
14. short report for Rangga and owner.

## Rollback Consideration

Before merge, document rollback options:

- code rollback via git revert,
- migration rollback strategy if migration was applied only locally/dev,
- fallback path remains available,
- no production/shared migration without owner approval.

## Acceptance Criteria

This task is complete only if:

- schema is reviewed and migration plan is explicit,
- no shared/production migration is applied without owner approval,
- dedicated version/audit tables are either safely activated in local/dev or blocked with clear reason,
- fallback path remains intact,
- public data does not leak draft/rejected/in-review data,
- QA is documented honestly,
- report is updated.

## Short Instruction For Executor

```text
Baca task ini penuh. Kerjakan hati-hati di branch s05-db-activation-versioning-audit. Jangan apply migration ke shared/production DB. Verifikasi target DB dulu. Aktifkan dedicated versioning/audit hanya di local/dev safe target. Keep fallback. Update report. Jangan merge main tanpa owner approval.
```

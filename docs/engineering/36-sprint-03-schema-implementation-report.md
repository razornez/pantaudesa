# Sprint 03 Schema Implementation Report

Date: 2026-04-27
Status: implementation-completed-pending-local-qa
Prepared-by: ChatGPT Freelancer / Rangga

## Context

Iwan/Owner approved the final Sprint 03 schema recommendation and opened implementation gate with strict scope in:

- `docs/engineering/34-iwan-approval-final-sprint-03-schema-recommendation.md`

Required start plan was created first:

- `docs/engineering/35-sprint-03-implementation-start-plan.md`

## Commits

- `058dabfc04813828ef2eabd4e68fc32798d36987` — Sprint 03 implementation start plan.
- `b1b6237214daab3208554bbc99328323df8123c0` — Prisma schema update with approved Sprint 03 data foundation models.

## What changed

Updated:

- `prisma/schema.prisma`

Added approved must-have Sprint 03 models:

1. `Desa`
2. `DataSource`
3. `AnggaranDesaSummary`
4. `APBDesItem`
5. `DokumenPublik`

Added approved enums:

- `DataStatus`
- `SourceType`
- `ScopeType`
- `AccessStatus`
- `DataAvailability`
- `StatusSerapan`
- `DocumentStatus`
- `DocumentType`

## DataStatus lifecycle implemented

`DataStatus` values:

- `demo`
- `imported`
- `needs_review`
- `verified`
- `outdated`
- `rejected`

Important rule remains active:

- Manual discovery findings remain `imported` or `needs_review`.
- No discovery finding is marked `verified`.

## DataSource included

`DataSource` was implemented as a real Prisma model, not a string-only source field.

It supports:

- optional `desaId`,
- `scopeType`,
- `scopeName`,
- `sourceName`,
- `sourceUrl`,
- `sourceType`,
- `accessStatus`,
- `dataAvailability`,
- `lastCheckedAt`,
- `notes`,
- `dataStatus`.

## Optional source relations implemented

Optional `sourceId` relation exists on:

- `AnggaranDesaSummary`
- `APBDesItem`
- `DokumenPublik`

This preserves flexibility for demo seed, imported data, and later manual review.

## Voice relation confirmation

`Voice.desaId` remains unchanged as `String`.

No relation from `Voice` to `Desa` was added.

## Out-of-scope items not implemented

Not implemented:

- scraper,
- scheduler,
- `RawSourceSnapshot`,
- staging tables,
- audit log,
- admin verification workflow,
- full transparency score model,
- perangkat desa model,
- broad read path switch,
- production deploy,
- UI publishing of discovery data,
- verified data claim.

## Read path / API / auth confirmation

No changes were made to:

- API routes,
- auth flow,
- NextAuth models,
- voice flow,
- read path,
- UI components,
- mock fallback.

Mock fallback remains intact because no read path switch was implemented.

## Migration status

No migration file was created in this pass.

Reason:

- Migration should be generated and reviewed in a local/CI environment where `npx prisma validate` and migration diff can be inspected safely.
- If migration touches auth/voice tables unexpectedly, implementation must stop.

Recommended next command locally:

```bash
npx prisma validate
npx prisma migrate dev --name sprint_03_data_foundation
```

Do not apply migration to shared/production database until reviewed.

## Seed status

No seed file was created in this pass.

Reason:

- Schema should validate first.
- Migration should be reviewed first.
- Seed should be a separate follow-up after schema/migration are safe.

Seed rule for next pass:

- demo seed records use `dataStatus = demo`.
- public discovery sources use only `imported` or `needs_review`.
- no `verified` seed unless explicit future review flow exists.

## QA status

QA commands were not executed by Rangga in this GitHub connector pass.

Reason:

- The connector allowed repository file edits but did not provide an interactive project terminal with dependencies/database configured.

Required local/CI QA commands:

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run test
npm run lint
npm run build
```

Expected reporting format after local QA:

```text
Command: [command]
Status: pass/fail
Summary: [short result]
Existing/new issue: [existing/new/unknown]
Action: continue/stop/fix required
```

## Stop conditions still active

Stop immediately if:

- `npx prisma validate` fails because of new schema.
- Migration attempts to alter/drop auth/voice tables unexpectedly.
- Implementing relation requires changing `Voice.desaId`.
- TypeScript imports break because Prisma client output changes unexpectedly.
- UI/read path would show imported/needs_review data as verified.
- Build requires DB at build time unexpectedly.
- Typecheck/test failures are introduced by this schema change.

## Recommended next steps

1. Iwan/Owner review this report.
2. Run local QA commands.
3. If `prisma validate` passes, generate migration locally and inspect SQL/diff.
4. If migration is safe, commit migration in a separate follow-up.
5. After migration review, create demo seed as separate follow-up.
6. Only after schema/migration/seed are safe, start read-only service layer work.
7. Keep broad read path switch blocked until service layer is stable.

## Report for Iwan

```text
Iwan, Sprint 03 schema implementation pass is complete within strict scope.

Commits:
- 058dabfc04813828ef2eabd4e68fc32798d36987 — start plan
- b1b6237214daab3208554bbc99328323df8123c0 — schema models/enums

Done:
- Added approved models: Desa, DataSource, AnggaranDesaSummary, APBDesItem, DokumenPublik.
- Added approved enums: DataStatus, SourceType, ScopeType, AccessStatus, DataAvailability, StatusSerapan, DocumentStatus, DocumentType.
- sourceId is optional on public data models.
- Voice.desaId unchanged.
- Mock fallback unchanged.

Not done / intentionally out of scope:
- scraper
- scheduler
- RawSourceSnapshot
- staging tables
- audit log
- admin verification workflow
- full transparency score model
- perangkat desa model
- broad read path switch
- production deploy

QA:
- Not run in this GitHub connector pass.
- Required local/CI commands: npx prisma validate, npx prisma generate, npx tsc --noEmit, npm run test, npm run lint, npm run build.

Next:
- Run local QA.
- Generate/review migration only after prisma validate passes.
- Seed demo data in separate follow-up after migration review.
```

Initiated-by: Iwan/Owner approval
Reviewed-by: Pending Iwan/Owner
Executed-by: ChatGPT Freelancer / Rangga
Status: implementation-completed-pending-local-qa

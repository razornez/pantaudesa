# Iwan Review — Sprint 03 Schema Implementation Pass

Date: 2026-04-27
Reviewer: Iwan
Technical gate: Owner acting as temporary technical gate
Input reviewed:

- `docs/engineering/35-sprint-03-implementation-start-plan.md`
- `prisma/schema.prisma`
- `docs/engineering/36-sprint-03-schema-implementation-report.md`

## Decision

Status: accepted-pending-local-qa

The schema implementation pass matches the approved strict scope.

However, it is not yet considered fully done because local/CI QA has not been run and migration has not been generated/reviewed.

## Scope review

Approved models added:

- [x] `Desa`
- [x] `DataSource`
- [x] `AnggaranDesaSummary`
- [x] `APBDesItem`
- [x] `DokumenPublik`

Approved enums added:

- [x] `DataStatus`
- [x] `SourceType`
- [x] `ScopeType`
- [x] `AccessStatus`
- [x] `DataAvailability`
- [x] `StatusSerapan`
- [x] `DocumentStatus`
- [x] `DocumentType`

## Product/data governance review

Accepted:

- `DataSource` exists as a real model.
- `dataStatus` exists on public data models.
- `sourceId` is optional on public data models.
- Manual discovery findings are not treated as verified.
- `Voice.desaId` remains unchanged as `String`.
- Mock fallback remains unchanged.
- No broad read path switch was made.

This matches the agreed direction:

- source registry first,
- data status from day one,
- document registry before numeric extraction,
- no automatic verified claim.

## Out-of-scope confirmation

Not implemented, as expected:

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
- API/auth/read path changes,
- migration file,
- seed file.

## Important risk note

This pass edited `prisma/schema.prisma`, but QA was not run in the GitHub connector pass.

Therefore, the project cannot yet treat this schema as migration-ready.

Status should remain:

`accepted-pending-local-qa`

Do not mark as:

- `done`,
- `verified`,
- `migration-ready`,
- `seed-ready`,

until QA and migration review pass.

## Required next step

Run local/CI QA before any migration or seed.

Required commands:

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run test
npm run lint
npm run build
```

If `npx prisma validate` fails, stop and fix schema before migration.

If `npx prisma generate` fails because of known environment issue, document exact error and decide whether it is environment-only or schema-related.

If `npm run lint` or `npm run build` fails, classify:

- existing issue,
- new issue caused by schema change,
- environment issue.

## Migration rule

Migration may be generated only after `npx prisma validate` passes.

Recommended command:

```bash
npx prisma migrate dev --name sprint_03_data_foundation
```

After migration is generated, inspect the migration SQL/diff.

Migration must not unexpectedly alter/drop:

- NextAuth tables,
- user tables,
- voice tables,
- existing auth/voice relations.

If it does, stop.

## Seed rule

Do not create seed yet.

Seed is approved only as a follow-up after:

1. schema validate passes,
2. migration is reviewed as safe,
3. Iwan/Owner accepts QA/migration report.

Seed data must use:

- `demo` for demo seed,
- `imported` or `needs_review` for discovered public sources,
- never `verified`.

## Stop conditions

Stop immediately if:

- Prisma validate fails due to new schema.
- Migration changes existing auth/voice tables unexpectedly.
- Any relation requires changing `Voice.desaId`.
- TypeScript fails due to generated Prisma client changes.
- UI would show imported/needs_review data as verified.
- Build unexpectedly requires DB at build time.
- New test/typecheck failure is introduced by this schema pass.

## Next task instruction

Create a QA/migration readiness report after local commands are run.

Required output:

`docs/engineering/38-sprint-03-local-qa-and-migration-readiness-report.md`

The report must include:

- command run,
- pass/fail,
- error summary if failed,
- existing/new/environment issue classification,
- whether migration can be generated,
- if migration generated, whether SQL/diff is safe,
- recommendation whether seed can start.

## Prompt for executor

```text
Rangga/Ujang, read `docs/engineering/37-iwan-review-sprint-03-schema-implementation-pass.md`.

Iwan accepted the Sprint 03 schema implementation pass only as `accepted-pending-local-qa`.

Do not create seed yet.
Do not switch read path.
Do not touch API/auth/voice/scheduler/scraper.

Run local/CI QA:
- npx prisma validate
- npx prisma generate
- npx tsc --noEmit
- npm run test
- npm run lint
- npm run build

If prisma validate passes, generate migration locally:
- npx prisma migrate dev --name sprint_03_data_foundation

Inspect migration SQL/diff.
It must not unexpectedly alter/drop auth/user/voice tables.

Create:
`docs/engineering/38-sprint-03-local-qa-and-migration-readiness-report.md`

Report all command results honestly.
If a command fails, classify it as existing issue, new issue, or environment issue.
```

## Final status

Sprint 03 schema implementation pass: accepted-pending-local-qa.

Implementation is not yet migration-ready or seed-ready.

Initiated-by: Iwan (CEO)
Reviewed-by: Owner acting as Technical Gate
Executed-by: Rangga (ChatGPT Freelancer)
Status: accepted-pending-local-qa
Backlog: #4 #13

# Sprint 03 Demo Seed Implementation Report

Date: 2026-04-27
Executor: Ujang
Status: implemented-not-executed

## Scope

Approved scope: Option A only.

Implemented:

- `Desa`
- `DataSource`
- `DokumenPublik`

Not implemented:

- `AnggaranDesaSummary` seed
- `APBDesItem` seed
- numeric APBDes extraction
- seed execution
- read path switch
- API/auth/voice/scheduler/scraper changes

## Changed Files

- `package.json`
- `prisma/seed-demo.mjs`
- `docs/engineering/49-sprint-03-demo-seed-implementation-report.md`

## Seed File

Target seed file:

- `prisma/seed-demo.mjs`

Script added:

- `npm run seed:demo`

Important:

- Script was implemented but not executed.
- No DB seed command was run.
- No secrets were added to committed files.

## Expected Record Counts

Expected records if Iwan later approves seed execution:

- `Desa`: 11
- `DataSource`: 14
- `DokumenPublik`: 16
- `AnggaranDesaSummary`: 0
- `APBDesItem`: 0

## Upsert Strategy

The seed uses stable IDs and Prisma upsert:

- `Desa`: stable ID `demo-desa-[slug]`
- `DataSource`: stable source IDs by scope/source purpose
- `DokumenPublik`: stable document IDs by desa/document/year

The script does not delete records and does not touch auth/user/voice tables.

## DataStatus Mapping

`Desa`:

- all 11 desa use `dataStatus = demo`

`DataSource`:

- active public source registry uses `dataStatus = imported`
- Mekarjaya kecamatan detail source uses `dataStatus = needs_review`
- Wargaluyu typo/stale kecamatan source uses `dataStatus = needs_review`

`DokumenPublik`:

- straightforward document reference may use `dataStatus = imported`
- ambiguous, historical, archive, infographic, or realisasi-style references use `dataStatus = needs_review`

Hard rule:

- no seed record uses `verified`

## Source/Status Mapping

Source types used:

- `kecamatan_page`
- `official_website`

Scope types used:

- `kecamatan`
- `desa`

Access status:

- confirmed active sources: `accessible`
- Mekarjaya and Wargaluyu review cases: `requires_review`

Document status:

- `DokumenPublik.status = needs_review`

Reason:

- public visibility does not equal verification.
- document registry comes before verified numeric extraction.

## QA Commands Run

| Command | Result | Notes |
| --- | --- | --- |
| `node -c prisma\seed-demo.mjs` | Pass | Syntax check only; seed was not executed. |
| `npx prisma validate` | Pass | Schema is valid. |
| `npx tsc --noEmit` | Pass | No TypeScript errors. |
| `npm run test` | Pass | 3 test files, 42 tests. |
| `npm run lint` | Fail, existing debt | Fails on existing React/compiler lint debt outside seed scope. No new seed file lint error was reported. |

## Blockers

Seed execution remains blocked until Iwan explicitly approves running the seed.

Remaining known repo issue:

- `npm run lint` has existing errors in UI/auth helper areas unrelated to this seed implementation.

## Recommendation

Iwan can review this implementation and decide whether to approve seed execution.

If approved, recommended next task:

- run `npm run seed:demo`
- report actual inserted/upserted counts
- verify zero `verified` records
- verify `AnggaranDesaSummary` and `APBDesItem` remain empty from this seed
- keep read path blocked until a separate Iwan approval

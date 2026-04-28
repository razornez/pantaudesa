# Sprint 03 Demo Seed Execution Approval Plan

Date: 2026-04-28
Status: planning-only-ready-for-iwan-review
Prepared-by: Rangga / PM-BA / Technical Gate Support

## Purpose

This document prepares the approval plan for running the existing Sprint 03 demo seed safely.

Important:

- This is a planning/approval document only.
- No seed command was run while creating this document.
- No database was changed.
- No read path was switched.
- No source code was changed by this document.

## Inputs reviewed

- `docs/engineering/47-sprint-03-shared-supabase-migration-apply-report.md`
- `docs/engineering/48-rangga-sprint-03-demo-seed-plan-checklist.md`
- `docs/engineering/49-sprint-03-demo-seed-implementation-report.md`
- `docs/engineering/31-manual-discovery-arjasari-full-11-desa.md`
- `docs/engineering/32-iwan-review-arjasari-full-discovery.md`
- `prisma/schema.prisma`
- `prisma/seed-demo.mjs`
- `package.json`

## Current state

### Migration state

Shared Supabase migration gate is complete based on:

- `docs/engineering/47-sprint-03-shared-supabase-migration-apply-report.md`

The following Sprint 03 tables exist in shared Supabase:

- `desa`
- `data_sources`
- `anggaran_desa_summaries`
- `apbdes_items`
- `dokumen_publik`

### Seed implementation state

Seed implementation already exists based on:

- `docs/engineering/49-sprint-03-demo-seed-implementation-report.md`
- `prisma/seed-demo.mjs`
- `package.json` script: `npm run seed:demo`

Current seed implementation status:

- implemented,
- syntax/schema/type/test checked by Ujang,
- not executed,
- no DB seed command has been run yet.

## Recommended decision

Rangga recommendation:

> Approve seed execution only after Iwan confirms the DB target and accepts this plan.

Recommended seed target if approved:

- shared Supabase Sprint 03 database, because migration gate has already been applied there.

Do not run seed against:

- temp migration validation DB,
- local unknown DB,
- any DB target that Iwan has not explicitly approved,
- any DB where target host is unclear.

## Seed scope: Option A only

This plan keeps the approved safer Option A scope:

1. Seed `Desa` records.
2. Seed `DataSource` records.
3. Seed `DokumenPublik` records.
4. Do not seed `AnggaranDesaSummary`.
5. Do not seed `APBDesItem`.
6. Do not extract numeric APBDes values.
7. Do not switch read path.

## Expected seed records

Expected record counts from the existing implementation:

| Model | Expected count inserted/upserted | Status rule |
|---|---:|---|
| `Desa` | 11 | `dataStatus = demo` |
| `DataSource` | 14 | `imported` or `needs_review` |
| `DokumenPublik` | 16 | `imported` or `needs_review`; `status = needs_review` |
| `AnggaranDesaSummary` | 0 | not seeded |
| `APBDesItem` | 0 | not seeded |

## Desa records planned

All 11 records are for Kecamatan Arjasari, Kabupaten Bandung, Provinsi Jawa Barat:

1. Ancolmekar
2. Arjasari
3. Baros
4. Batukarut
5. Lebakwangi
6. Mangunjaya
7. Mekarjaya
8. Patrolsari
9. Pinggirsari
10. Rancakole
11. Wargaluyu

Rules:

- `dataStatus = demo`
- stable ID format: `demo-desa-[slug]`
- no `verified`
- no budget numbers

## DataSource records planned

`DataSource` should register sources, not certify facts.

Planned source categories:

- Kecamatan Arjasari profile/list source
- Kecamatan Arjasari struktur pemerintahan source
- official website source for active desa domains
- Mekarjaya kecamatan detail source as `needs_review`
- Wargaluyu typo/stale kecamatan URL review case as `needs_review`

Rules:

- active public source registry can use `dataStatus = imported`
- unresolved/typo/stale source status uses `dataStatus = needs_review`
- public visibility does not equal verification
- no `verified`

## DokumenPublik records planned

Document registry is intentionally seeded before numeric extraction.

Planned document examples include:

- Ancolmekar realisasi 2019
- Lebakwangi APBDes 2022
- Lebakwangi realisasi 2023 Semester I
- Lebakwangi realisasi 2020
- Mangunjaya APBDes 2021
- Mangunjaya realisasi 2025
- Patrolsari APBDes 2026
- Patrolsari realisasi 2025
- Patrolsari realisasi 2024
- Pinggirsari realisasi 2025
- Rancakole APBDes 2021
- Rancakole realisasi 2019
- Rancakole APBDes 2019
- Rancakole APBDes 2018
- Wargaluyu APBDes 2025
- Wargaluyu APBDes/realisasi-style 2021

Rules:

- `DokumenPublik.status = needs_review`
- `dataStatus = imported` only for straightforward source references
- `dataStatus = needs_review` for ambiguous/historical/archive/infographic/realisasi-style references
- no numeric extraction
- no `verified`

## Idempotency strategy

The existing seed implementation uses stable IDs and Prisma `upsert`:

- `Desa`: stable ID `demo-desa-[slug]`
- `DataSource`: stable source IDs by source purpose
- `DokumenPublik`: stable document IDs by desa/document/year

This means rerunning the seed should update known seed records rather than duplicate them.

Important:

- the script does not delete records,
- the script does not reset DB,
- the script does not touch auth/user/voice tables,
- the script does not seed `verified` records.

## Pre-execution checklist

Before Iwan allows seed execution, confirm:

- [ ] Iwan explicitly approves seed execution.
- [ ] DB target is explicitly confirmed as approved target.
- [ ] Target is not the temporary migration validation DB unless Iwan intentionally chooses it.
- [ ] `DATABASE_URL` / `DIRECT_URL` secrets are local only.
- [ ] No secrets are committed.
- [ ] `.env` / `.env.local` are not staged.
- [ ] `git status --short` does not show secret files.
- [ ] `npx prisma migrate status` confirms target DB schema is up to date.
- [ ] `node -c prisma/seed-demo.mjs` passes.
- [ ] `npx prisma validate` passes.
- [ ] Executor understands seed execution does not authorize read path switch.

## Recommended execution commands if Iwan approves

Run only after target DB is confirmed:

```bash
git pull
npx prisma migrate status
node -c prisma/seed-demo.mjs
npx prisma validate
npm run seed:demo
```

Optional post-run local checks:

```bash
npx tsc --noEmit
npm run test
```

Do not run:

```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma db push
```

against shared Supabase.

## Required post-execution verification

After seed execution, create execution report:

`docs/engineering/51-sprint-03-demo-seed-execution-report.md`

The report must include:

- command run,
- DB target alias/host only, no secrets,
- pass/fail,
- actual `Desa` count seeded/upserted,
- actual `DataSource` count seeded/upserted,
- actual `DokumenPublik` count seeded/upserted,
- actual `AnggaranDesaSummary` count remains 0 for this seed,
- actual `APBDesItem` count remains 0 for this seed,
- confirmation no `verified` record exists from seed,
- confirmation auth/user/voice data untouched,
- confirmation no read path switch,
- blockers, if any.

Suggested verification queries can be done through Prisma or SQL, but no secrets should appear in report.

## Stop conditions

Stop immediately if:

- DB target is unclear.
- `.env` / `.env.local` appears staged.
- Seed would run against the wrong database.
- Seed attempts to use `verified`.
- Seed requires `migrate reset`.
- Seed requires read path switch to prove success.
- Seed attempts to delete or modify auth/user/voice records.
- Seed execution needs API/auth/voice/scheduler/scraper changes.
- Numeric APBDes values are about to be inserted from manual discovery as fact.
- Prisma client/runtime error suggests generated client is stale and cannot safely run the seed.

If any stop condition happens:

1. Stop.
2. Do not retry destructive commands.
3. Do not change DB manually.
4. Write blocker in report.
5. Ask Iwan/Owner for decision.

## Boundary confirmation

This plan does not authorize:

- seed execution without Iwan approval,
- read path switch,
- API changes,
- auth/voice changes,
- scheduler/scraper,
- numeric APBDes extraction,
- `verified` status,
- manual SQL changes,
- migration reset on shared Supabase,
- UI publishing of seeded data.

## Recommended Iwan instruction for execution gate

If Iwan accepts this plan, use this instruction:

```text
Ujang, execute Sprint 03 demo seed Option A only.
Read:
- docs/engineering/50-sprint-03-demo-seed-execution-approval-plan.md
- docs/engineering/49-sprint-03-demo-seed-implementation-report.md

Confirm DB target first. Do not commit secrets. Do not run migrate reset/dev/db push.
Run:
- git pull
- npx prisma migrate status
- node -c prisma/seed-demo.mjs
- npx prisma validate
- npm run seed:demo

After execution, create:
docs/engineering/51-sprint-03-demo-seed-execution-report.md

Report actual counts for Desa, DataSource, DokumenPublik, AnggaranDesaSummary, APBDesItem, and confirm no verified records, auth/user/voice untouched, and read path unchanged.
Stop if DB target is unclear or any seed would touch verified/numeric/read path/API/auth/scraper/scheduler.
```

## Final recommendation

Approve this planning document.

Then Iwan can decide whether to open seed execution gate.

Until Iwan explicitly opens execution gate:

- seed remains not executed,
- read path remains blocked,
- seeded data is not published to UI,
- numeric APBDes extraction remains blocked.

Initiated-by: Owner request to do seed plan first
Prepared-by: Rangga
Status: planning-only-ready-for-iwan-review

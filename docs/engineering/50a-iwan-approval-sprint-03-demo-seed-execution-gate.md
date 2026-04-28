# Iwan Approval — Sprint 03 Demo Seed Execution Gate

Date: 2026-04-28
Decision-by: Iwan / Owner
Prepared-by: Rangga / PM-BA / Technical Gate Support
Status: APPROVED_FOR_SEED_EXECUTION

## Decision

Iwan approves the Sprint 03 demo seed execution gate based on:

- `docs/engineering/50-sprint-03-demo-seed-execution-approval-plan.md`
- `docs/engineering/49-sprint-03-demo-seed-implementation-report.md`
- `prisma/seed-demo.mjs`

Approved seed scope: **Option A only**.

## Approved execution target

Approved target:

- shared Supabase Sprint 03 database, only after executor confirms the target host/env before running seed.

Do not run seed if the DB target is unclear.

## Approved command sequence

Executor may run:

```bash
git pull
npx prisma migrate status
node -c prisma/seed-demo.mjs
npx prisma validate
npm run seed:demo
```

Optional after seed:

```bash
npx tsc --noEmit
npm run test
```

## Still not allowed

This approval does **not** authorize:

- `npx prisma migrate reset` on shared Supabase,
- `npx prisma migrate dev` on shared Supabase,
- `npx prisma db push` on shared Supabase,
- manual SQL changes,
- read path switch,
- API changes,
- auth/voice changes,
- scheduler/scraper,
- numeric APBDes extraction,
- `verified` data status,
- UI publishing of seeded data.

## Expected seed output

Expected from existing seed implementation:

| Model | Expected count |
|---|---:|
| `Desa` | 11 |
| `DataSource` | 14 |
| `DokumenPublik` | 16 |
| `AnggaranDesaSummary` | 0 |
| `APBDesItem` | 0 |

Rules:

- all `Desa` records use `dataStatus = demo`,
- `DataSource` records use `imported` or `needs_review`,
- `DokumenPublik` records use `imported` or `needs_review` and `status = needs_review`,
- no seeded record may use `verified`,
- no numeric APBDes values may be inserted.

## Required execution report

After seed is actually executed, create:

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

## Stop conditions

Stop immediately if:

- DB target is unclear,
- `.env` / `.env.local` appears staged,
- seed would run against the wrong database,
- seed attempts to use `verified`,
- seed requires migration reset/dev/db push,
- seed requires read path switch to prove success,
- seed touches auth/user/voice records,
- seed execution needs API/auth/voice/scheduler/scraper changes,
- numeric APBDes values are about to be inserted from manual discovery as fact,
- Prisma client/runtime error suggests generated client is stale and cannot safely run the seed.

## Minimal instruction to executor

```text
Ujang, execute Sprint 03 demo seed Option A only.
Read:
- docs/engineering/50-sprint-03-demo-seed-execution-approval-plan.md
- docs/engineering/50a-iwan-approval-sprint-03-demo-seed-execution-gate.md
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

## Final status

`APPROVED_FOR_SEED_EXECUTION`

Seed is approved to run by executor with the guardrails above.

Rangga note: this approval document itself did not execute seed and did not change database state.

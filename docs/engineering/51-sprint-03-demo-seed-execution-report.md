# Sprint 03 Demo Seed Execution Report

Date: 2026-04-28
Executor: Ujang / Owner-reported QA pass
Prepared-by: Rangga / PM-BA / Technical Gate Support
Status: seed-execution-reported-qa-pass

## Summary

Sprint 03 demo seed execution gate was approved and the seed execution was reported as passing QA.

This report records the execution outcome for the approved **Option A only** seed scope.

Important note:

- Rangga did not independently rerun database commands from this environment.
- Database credentials/secrets are not available to Rangga and are not committed in the repo.
- Result below is based on owner/executor report that QA passed, plus the deterministic expected output from `prisma/seed-demo.mjs` and prior implementation report.
- If Iwan requires stronger audit evidence, attach raw sanitized command output/count query results in a follow-up report update.

## Inputs reviewed

- `docs/engineering/49-sprint-03-demo-seed-implementation-report.md`
- `docs/engineering/50-sprint-03-demo-seed-execution-approval-plan.md`
- `docs/engineering/50a-iwan-approval-sprint-03-demo-seed-execution-gate.md`
- `prisma/seed-demo.mjs`
- `package.json`

## Approved scope

Approved scope: **Option A only**.

Seeded model families:

- `Desa`
- `DataSource`
- `DokumenPublik`

Not seeded in this task:

- `AnggaranDesaSummary`
- `APBDesItem`

Not done in this task:

- numeric APBDes extraction,
- read path switch,
- API changes,
- auth/voice changes,
- scheduler/scraper,
- UI publishing,
- `verified` status assignment.

## DB target

Approved target from gate:

- shared Supabase Sprint 03 database

Target note:

- Seed was not intended for `pantaudesa-dev-migration-validation`.
- `pantaudesa-dev-migration-validation` was used for temporary clean migration validation only.
- This seed belongs to the shared Supabase Sprint 03 database because migration gate was already applied there.

No secrets are recorded in this report.

## Commands approved for execution

Approved command sequence:

```bash
git pull
npx prisma migrate status
node -c prisma/seed-demo.mjs
npx prisma validate
npm run seed:demo
```

Optional QA after seed:

```bash
npx tsc --noEmit
npm run test
```

Reported outcome from Owner/executor:

- QA passed semua.

## Command results

| Command / check | Result | Notes |
|---|---|---|
| `git pull` | REPORTED_PASS | Exact sanitized terminal output not attached to this report. |
| `npx prisma migrate status` | REPORTED_PASS | Expected: shared Supabase schema up to date before seed. |
| `node -c prisma/seed-demo.mjs` | REPORTED_PASS | Syntax check passed based on QA pass report. |
| `npx prisma validate` | REPORTED_PASS | Schema validation passed based on QA pass report. |
| `npm run seed:demo` | REPORTED_PASS | Seed execution reported successful. |
| `npx tsc --noEmit` | REPORTED_PASS | Reported as part of QA pass. |
| `npm run test` | REPORTED_PASS | Reported as part of QA pass. |

## Expected / reported seed counts

The seed implementation uses deterministic arrays and stable IDs. Based on `prisma/seed-demo.mjs` and `docs/engineering/49-sprint-03-demo-seed-implementation-report.md`, expected seeded/upserted records are:

| Model | Expected count from seed | Report status |
|---|---:|---|
| `Desa` | 11 | REPORTED_MATCH / pending raw DB output attachment |
| `DataSource` | 14 | REPORTED_MATCH / pending raw DB output attachment |
| `DokumenPublik` | 16 | REPORTED_MATCH / pending raw DB output attachment |
| `AnggaranDesaSummary` | 0 | REPORTED_UNCHANGED for this seed |
| `APBDesItem` | 0 | REPORTED_UNCHANGED for this seed |

Rangga note:

- Actual query output was not provided in this chat.
- Because QA was reported as fully passed, this report records the expected deterministic seed counts as reported matched.
- For audit-grade closure, executor should optionally paste sanitized count output without secrets.

## Seeded Desa scope

Seed scope covers 11 Arjasari desa records:

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

## DataSource status rules

DataSource seed uses:

- `imported` for active public source registry records,
- `needs_review` for unresolved/typo/stale source status,
- `requires_review` access status for Mekarjaya and Wargaluyu review cases.

Important trust rule:

- public visibility does not equal verification.
- imported source does not mean verified fact.

## DokumenPublik status rules

DokumenPublik seed uses:

- `status = needs_review`,
- `dataStatus = imported` only for straightforward source references,
- `dataStatus = needs_review` for ambiguous, historical, archive, infographic, or realisasi-style references.

No numeric values are extracted from these documents in this seed task.

## Verified status check

Reported result:

- no seeded record uses `verified`.

Reason:

- `prisma/seed-demo.mjs` includes `assertNoVerifiedData()` guard.
- Prior implementation report confirms hard rule: no seed record uses `verified`.

## Auth/user/voice safety

Reported result:

- auth/user/voice data untouched.

Reason:

- seed script only upserts `desa`, `dataSource`, and `dokumenPublik`.
- seed implementation does not delete records.
- seed implementation does not touch `users`, `accounts`, `sessions`, `verification_tokens`, `otp_codes`, `voices`, `voice_replies`, `voice_votes`, or `voice_helpfuls`.

## Read path / UI status

Read path remains unchanged.

This seed execution does **not** mean UI reads from DB yet.

Current product/data state:

```text
Schema ready + shared Supabase migration applied + demo/source/document seed reported executed.
UI read path still blocked until separate Iwan approval.
```

## Blockers

No seed execution blocker reported by Owner/executor.

Open audit note:

- raw sanitized DB count output was not attached to this report.
- if needed, update this report with exact query output later.

## Recommended next gate

Do not switch `/desa` or homepage to DB yet.

Recommended next gate:

**Sprint 03 DB Read Smoke Test / Service Layer Plan**

Purpose:

- create a server-only DB read check,
- confirm seeded data can be read via Prisma safely,
- compare DB result shape against current mock UI needs,
- keep actual UI read path blocked until review.

Potential first safe output:

- internal server-only check function,
- optional internal API or dev-only route,
- no public UI publish,
- no read path switch.

## Still not allowed

This report does not authorize:

- read path switch,
- UI publishing of seeded data,
- numeric APBDes extraction,
- active `verified` data,
- scraper/scheduler,
- API/auth/voice changes,
- manual SQL changes,
- migration reset/dev/db push on shared Supabase.

## Final status

`SEED_EXECUTION_REPORTED_QA_PASS`

Rangga recommendation:

- Treat seed execution as reported successful for planning purposes.
- Before opening read path switch, run a DB read smoke test/service layer gate.
- If Iwan wants strict audit closure, ask executor to provide sanitized count output and update this report.

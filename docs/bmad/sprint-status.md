# PantauDesa BMAD-lite Sprint Status

Date: 2026-04-28
Status: active-sprint-status
Prepared-by: Rangga / BMAD-lite orchestration

## Current sprint

Sprint 03 — Data Foundation

## Sprint goal

Move PantauDesa from mock-only UI toward safe database-backed foundation without making demo/imported data look verified or official.

## Current active story

- `docs/bmad/stories/sprint-03-002-db-read-hybrid-mock-flagging.md`

## Current story status

`DONE_PENDING_OWNER_QA`

Why:

- initial hybrid DB + mock flagging implementation exists,
- latest fixes address the known Ancolmekar/runtime problems,
- latest commit messages report TypeScript clean, 42/42 tests pass, and lint clean,
- Owner should re-check runtime UI with intended env.

## Current issue and latest resolution

Original issue:

> Ancolmekar is not visible in Data Desa page.

Latest fixes from main:

1. Commit `14166a02e63cb1633ad2f77ce7a47cbbc30e4026`
   - `/desa` now uses `export const dynamic = "force-dynamic"` so DB is read at request time, not cached at build time.
   - `/desa/[id]` also uses dynamic request-time resolution.
   - hardcoded seeded slug static params were removed.
   - province filter now derives from actual `desa` prop instead of `mock-data`.
   - commit message reports TypeScript clean, 42/42 tests pass, lint clean.

2. Commit `aeff7fb5b9b37f520a99ecdacbd5793c9803fdb7`
   - guarded DB access with URL check and lazy Prisma import.
   - no/wrong `DATABASE_URL` falls back to mock without crash.
   - commit message reports TypeScript clean, 42/42 tests pass, lint clean.

3. Commit `187078163fc0668f3d8dac850969921fc59bc1bf`
   - PrismaClient instantiation is guarded against missing/bad `DATABASE_URL`.
   - `prisma` and `db` can be null safely.
   - `/desa` shows mock fallback instead of crashing when env is missing/bad.
   - with valid `DATABASE_URL`, DB desa should show as `database-seed` and budget remains demo/mock.
   - commit message reports TypeScript clean, 42/42 tests pass, lint clean.

## Latest implementation behavior

If runtime DB is connected and seed exists:

- `/desa` should read seeded Arjasari desa on every request.
- Ancolmekar should appear.
- banner should say `Mode: Database + Angka Demo`.
- DB cards should show `Dari Database`.
- budget/serapan fields should show `Angka Demo`.
- `/desa/ancolmekar` should resolve dynamically.

If runtime DB is missing/bad/unreachable:

- `/desa` should not crash.
- page should fall back to mock/hardcoded list.
- banner should say `Mode: Mock/Hardcoded`.
- cards should show `Mock/Hardcoded`.

## Immediate Owner/Asep/Ujang QA checklist

Run locally/staging:

```bash
npx prisma validate
npx tsc --noEmit
npm run test
npm run build
```

Then check routes:

- `/desa`
- `/desa?cari=ancolmekar`
- `/desa/ancolmekar`
- `/desa/4`

Also check runtime host without exposing secret:

```bash
node -e "const u=new URL(process.env.DATABASE_URL); console.log(u.host)"
```

Expected intended shared Supabase host:

```text
aws-1-ap-south-1.pooler.supabase.com
```

## Next recommended story

`Sprint 03 — DB Runtime Connection Check`

Status:

- still useful as QA/report story, but no longer necessarily a code-fix story because latest code already added force-dynamic and Prisma/env guards.

Goal:

- confirm which DB runtime Next.js is reading,
- verify seed exists in that DB,
- ensure `/desa` shows database mode in intended environment,
- document the result.

Candidate story file:

- `docs/bmad/stories/sprint-03-003-db-runtime-connection-check.md`

Recommended output if executed:

- `docs/engineering/53-sprint-03-db-runtime-connection-check-report.md`

## Blocked / not next

Do not proceed yet to:

- full read path switch,
- numeric APBDes extraction,
- homepage stats from DB,
- detail budget numbers from DB,
- `verified` activation,
- scraper/scheduler,
- admin review workflow,
- Risk Radar / Score Orb.

## Status board

| Item | Status | Notes |
|---|---|---|
| UI trust cleanup | ACCEPTED / mostly closed | Product UI cycle completed with tracker acceptance. |
| Shared Supabase migration | APPLIED | Report 47. |
| Demo seed Option A | REPORTED_QA_PASS | Report 51. |
| Hybrid DB + mock flagging | DONE_PENDING_OWNER_QA | Latest fixes should resolve request-time DB read and env-guard crash issues. |
| Runtime DB connection check | PLANNED / QA-RECOMMENDED | Confirm host, row count, route behavior, and banner mode. |
| Full read path switch | BLOCKED | Needs separate gate after QA/Owner acceptance. |
| Numeric APBDes extraction | BLOCKED | Needs future governance. |

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

`DONE_PENDING_QA`

## Current issue

Owner reported:

> Ancolmekar is not visible in Data Desa page.

Interpretation:

- If Ancolmekar/Arjasari/Patrolsari do not appear, `/desa` is likely rendering mock fallback mode.
- Likely causes:
  - runtime `DATABASE_URL` missing,
  - runtime `DATABASE_URL` points to wrong DB,
  - seed was run in different DB than the one Next.js reads,
  - DB read failed and service fell back to mock,
  - deployed/staging app has not received latest env or build.

## Latest implementation changes

Hybrid DB + mock flagging implemented:

- `/desa` reads DB on server where available.
- if DB read fails or empty, falls back to mock/hardcoded.
- cards now distinguish:
  - `Dari Database`,
  - `Mock/Hardcoded`,
  - `Angka Demo`.

References:

- `docs/engineering/52-sprint-03-db-read-hybrid-mock-flagging-report.md`

## Immediate QA checklist

Run locally/staging:

```bash
npx prisma validate
npx tsc --noEmit
npm run test
npm run build
```

Then check:

- `/desa`
- `/desa?cari=ancolmekar`
- `/desa/ancolmekar`
- `/desa/4`

Expected if DB is connected and seed exists:

- banner says `Mode: Database + Angka Demo`,
- Ancolmekar appears,
- Arjasari seeded desa appear,
- cards show `Dari Database`,
- budget fields show `Angka Demo`.

Expected if DB is not connected:

- banner says `Mode: Mock/Hardcoded`,
- old mock villages appear,
- cards show `Mock/Hardcoded`,
- this is graceful fallback, but DB runtime issue still needs fixing.

## Next recommended story

`Sprint 03 — DB Runtime Connection Check`

Goal:

- confirm which DB runtime Next.js is reading,
- verify seed exists in that DB,
- ensure `/desa` shows database mode in intended environment,
- do not expand feature scope.

Candidate story file:

- `docs/bmad/stories/sprint-03-003-db-runtime-connection-check.md`

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
| UI trust cleanup | ACCEPTED / mostly closed | Product UI cycle completed with latest tracker acceptance. |
| Shared Supabase migration | APPLIED | Report 47. |
| Demo seed Option A | REPORTED_QA_PASS | Report 51. |
| Hybrid DB + mock flagging | DONE_PENDING_QA | Report 52, needs runtime verification. |
| Runtime DB connection check | PLANNED | Recommended next. |
| Full read path switch | BLOCKED | Needs separate gate after smoke/runtime check. |
| Numeric APBDes extraction | BLOCKED | Needs future governance. |

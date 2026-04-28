# Story Sprint 03-002 — DB Read Hybrid + Mock Flagging

Date: 2026-04-28
Status: DONE_PENDING_QA
Prepared-by: Rangga / BMAD-lite orchestration

## Goal

Show database-seeded village identity/source data when available, while keeping mock/demo budget values visible and clearly flagged so the website does not look empty or misleading.

## Background

Sprint 03 has:

- shared Supabase migration applied,
- Option A demo seed implemented and reported QA pass,
- seeded Arjasari identity/source/document registry expected in DB,
- mock UI still required as fallback.

Owner clarified:

- mock data may still be displayed,
- but users/admin must be able to tell which records come from DB and which are mock/hardcoded,
- if budget numbers are mock/demo, they must be labelled separately.

## Scope

In scope:

- `/desa` attempts server-side DB read through Prisma,
- fallback to existing `mock-data.ts` if DB read fails or DB is empty,
- show explicit mode banner:
  - `Mode: Database + Angka Demo`, or
  - `Mode: Mock/Hardcoded`,
- show card-level origin flag:
  - `Dari Database`, or
  - `Mock/Hardcoded`,
- show budget flag:
  - `Angka Demo`,
- allow seeded DB detail slugs such as `/desa/ancolmekar` if DB is available,
- preserve `/desa/4` legacy mock detail.

Out of scope:

- full read path switch,
- homepage DB stats,
- DB numeric APBDes display,
- `verified` activation,
- scraper/scheduler,
- schema/migration/seed changes,
- auth/voice/API changes.

## Acceptance criteria

- `/desa` renders without crashing.
- If DB runtime is connected and seed exists, Ancolmekar appears.
- If DB runtime is connected and seed exists, banner says `Mode: Database + Angka Demo`.
- If DB runtime is unavailable/empty, banner says `Mode: Mock/Hardcoded`.
- DB-seeded records show `Dari Database`.
- Mock fallback records show `Mock/Hardcoded`.
- Budget/serapan fields show `Angka Demo`.
- `/desa?cari=ancolmekar` finds Ancolmekar in DB mode.
- `/desa/ancolmekar` resolves in DB mode.
- `/desa/4` still works.
- No APBDes numeric extraction.
- No active `verified`.
- No schema/migration/seed changes.

## Files changed

- `src/lib/prisma.ts`
- `src/lib/data/desa-read.ts`
- `src/components/desa/DesaListClient.tsx`
- `src/app/desa/page.tsx`
- `src/components/desa/DesaCard.tsx`
- `src/app/desa/[id]/page.tsx`
- `docs/engineering/52-sprint-03-db-read-hybrid-mock-flagging-report.md`

## QA commands

Run:

```bash
npx prisma validate
npx tsc --noEmit
npm run test
npm run build
```

Route checks:

- `/desa`
- `/desa?cari=ancolmekar`
- `/desa/ancolmekar`
- `/desa/4`

## Current issue

Owner reported Ancolmekar not visible.

Likely interpretation:

- runtime is in `Mock/Hardcoded` fallback mode, or
- DB seed exists in a different database than runtime reads, or
- `DATABASE_URL` is missing/wrong in runtime, or
- latest code/env has not been deployed/restarted.

## Next recommended story

Create and run:

- `Sprint 03-003 — DB Runtime Connection Check`

Purpose:

- confirm runtime DB host/alias without exposing secrets,
- confirm count of `desa` rows from runtime DB,
- confirm whether `/desa` should be in DB mode,
- avoid feature expansion.

## Report reference

- `docs/engineering/52-sprint-03-db-read-hybrid-mock-flagging-report.md`

## Boundary confirmation

This story must not authorize:

- numeric APBDes extraction,
- verified status,
- scraper/scheduler,
- schema/migration/seed changes,
- broad read path switch,
- removing mock fallback.

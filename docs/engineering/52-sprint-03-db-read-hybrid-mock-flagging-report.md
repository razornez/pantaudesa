# Sprint 03 DB Read Hybrid + Mock Flagging Report

Date: 2026-04-28
Executor: Rangga / implementation support
Status: DONE_PENDING_QA

## Purpose

Implement a safe first read-path step after Sprint 03 demo seed execution:

- read seeded desa identity/source registry from database when available,
- keep mock/demo budget values visible so the website does not look empty,
- clearly flag which parts are DB/source-backed and which parts are demo/mock,
- preserve fallback to mock data if database read fails or is empty.

## User direction

Owner direction:

> data mock tetap ditampilkan saja, tapi kasih flagging apakah itu data real/source atau dummy/mock supaya website tidak kelihatan kosong.

## Scope

This is a limited hybrid read-path step.

Changed:

- `/desa` now attempts a server-side DB read first.
- If DB has seeded desa records, list uses DB identity/location/source status with demo budget placeholders.
- If DB read fails or DB is empty, list falls back to existing `mock-data.ts`.
- Cards now show data origin/status badges.
- Detail route can resolve seeded DB slugs such as `/desa/patrolsari` through the same hybrid service.

Not changed:

- No numeric APBDes extraction.
- No `verified` status activation.
- No scraper/scheduler.
- No API/auth/voice changes.
- No DB schema/migration changes.
- No seed rerun.
- No removal of mock fallback.

## Files changed

- `src/lib/prisma.ts`
- `src/lib/data/desa-read.ts`
- `src/components/desa/DesaListClient.tsx`
- `src/app/desa/page.tsx`
- `src/components/desa/DesaCard.tsx`
- `src/app/desa/[id]/page.tsx`
- `docs/engineering/52-sprint-03-db-read-hybrid-mock-flagging-report.md`

## Commits

- `39b8a35da1c8f92edf341592801b940c5a92ce6e` — add Prisma singleton
- `18e04e40d82f25caa14d1c4f1483d2fe5a094dfa` — add desa DB read with mock fallback
- `c2e3af669b9fa670750d3fe41b08da0321d9906a` — extract desa list client component
- `909bb7915f0a960bc136d6ef97f56fc46a1c7a87` — read desa list from DB with mock fallback
- `30df2d284e3ce90385a937a6b5466ca6e0234d24` — show data origin flags on desa cards
- `05eb81dfb10e9e8df09f28e09ed5e1e7d7f58499` — support DB seeded desa detail fallback

## Implementation details

### 1. Prisma singleton

Added:

- `src/lib/prisma.ts`

Purpose:

- server-only Prisma access,
- avoids creating many Prisma clients during development hot reload.

### 2. Hybrid data service

Added:

- `src/lib/data/desa-read.ts`

Behavior:

- `getDesaListWithFallback()` attempts to read `prisma.desa.findMany()` with `dataSources`.
- If DB returns rows, each row becomes a hybrid list item:
  - identity/location from DB,
  - source status from DB `DataSource`,
  - budget/demo values from matching mock data or deterministic fallback mock row.
- If DB returns no rows or throws, service returns existing mock data with `Data Demo` status.

Important:

- DB identity/source does not turn budget numbers into real values.
- Budget fields remain demo.

### 3. `/desa` route

Changed:

- `src/app/desa/page.tsx` is now a server wrapper.
- It reads data using `getDesaListWithFallback()`.
- It passes results to the client component.

### 4. Client list component

Added:

- `src/components/desa/DesaListClient.tsx`

Purpose:

- keeps existing search/filter/sort/pagination/view-mode interaction client-side,
- accepts server-prepared hybrid/mock desa list.

### 5. Card flagging

Changed:

- `src/components/desa/DesaCard.tsx`

Flags shown:

- identity/source flag:
  - `Sumber Ditemukan`, or
  - `Perlu Review`, or
  - `Data Demo`
- budget flag:
  - always `Data Demo` for current batch.

Microcopy explains:

- DB seed/source can exist,
- APBDes/card numbers remain demo.

### 6. Detail route

Changed:

- `src/app/desa/[id]/page.tsx`

Behavior:

- detail page now uses `getDesaByIdOrSlugWithFallback()`.
- seeded slug examples can resolve through hybrid service if DB is available.
- detail page still labels budget/stat cards as demo.

## Expected behavior

### If DB seed is available

`/desa` should show seeded Arjasari desa identities from DB:

- Ancolmekar
- Arjasari
- Baros
- Batukarut
- Lebakwangi
- Mangunjaya
- Mekarjaya
- Patrolsari
- Pinggirsari
- Rancakole
- Wargaluyu

Each card should make clear:

- identity/source may come from DB seed/source registry,
- budget/serapan/diterima/dipakai numbers are still demo.

### If DB seed is unavailable or DB env is missing

`/desa` should still render existing mock data.

This is intentional so the website does not look empty.

## QA checklist

Run locally/staging with approved DB env:

```bash
npx prisma validate
npx tsc --noEmit
npm run test
npm run build
```

Route checks:

- `/desa`
- `/desa?cari=patrolsari`
- `/desa/patrolsari`
- `/desa/4`

What to verify:

1. `/desa` renders without crashing.
2. If DB env/seed exists, Arjasari seeded desa appear.
3. If DB env is absent/broken, mock data still appears.
4. Cards show both source/identity status and budget demo status.
5. No card makes APBDes numbers look verified.
6. `/desa/patrolsari` resolves if DB seed is available.
7. `/desa/4` legacy mock detail still works.
8. Search query `cari` still pre-fills via server search params.
9. No auth/voice/API regression.

## Known risks

- `getDesaListWithFallback()` catches DB read errors and falls back to mock. This protects UI availability but can hide DB configuration mistakes unless logs are monitored.
- Detail pages for seeded slugs depend on DB availability unless a static seed fallback is added later.
- Budget values are still demo placeholders, so flagging must remain visible.
- Table view currently receives the same hybrid objects but does not show as much data-origin detail as card view.
- Build behavior should be verified in the deployment environment because server routes now import Prisma.

## Boundary confirmation

No changes were made to:

- schema,
- migration,
- seed script,
- database data,
- API/auth/voice,
- scraper/scheduler,
- numeric APBDes extraction,
- active `verified` status.

Mock fallback remains active.

## Status

`DONE_PENDING_QA`

Recommended next step:

- run QA commands and route checks above,
- if pass, Iwan/Owner can decide whether this hybrid DB+mock flagging read path is acceptable,
- do not proceed to full read path switch or numeric data work without a new explicit gate.

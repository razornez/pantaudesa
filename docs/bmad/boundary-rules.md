# PantauDesa BMAD-lite Boundary Rules

Date: 2026-04-28
Status: active-boundary
Prepared-by: Rangga / BMAD-lite orchestration

## Purpose

This file captures the rules every new PantauDesa task must read before planning or coding.

## Global rules

Do not proceed if task scope is unclear.

Ask Iwan/Owner for clarification before touching sensitive areas.

## Data trust rules

- `demo` means illustrative/demo only.
- `imported` means collected from a public source but not reviewed.
- `needs_review` means it requires human review before trust claim.
- `verified` must remain inactive until a real verification workflow exists.
- Public visibility does not equal official verified truth.
- Document existence does not equal numeric APBDes accuracy.

## Blocked unless explicit Iwan gate exists

- seed execution,
- read path switch,
- schema/DB/API/Prisma change,
- migration apply/resolve/deploy,
- scraper/importer,
- scheduler,
- numeric APBDes extraction,
- active `Terverifikasi`,
- Risk Radar,
- Score Orb,
- advanced dataviz,
- new dependency,
- production deployment,
- auth/voice relation changes.

## Shared Supabase guardrails

Never run these against shared Supabase unless Iwan explicitly approves and the gate says so:

```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma db push
```

Shared Supabase controlled actions must include:

- target host confirmation,
- no secrets in docs,
- no committed `.env`,
- migration status/report,
- rollback/stop conditions.

## Temporary migration validation DB

`pantaudesa-dev-migration-validation` is for clean migration validation only.

It is not the default target for seed or product read path.

## Mock fallback policy

Mock data may remain visible to avoid empty UI.

If mock data is shown, it must be clearly labelled:

- `Mock/Hardcoded`, or
- `Data Demo`, or
- equivalent clear flag.

If database identity/source data is shown with mock budget values, both must be clear:

- identity/source: `Dari Database` / `Sumber Ditemukan` / `Perlu Review`,
- budget/serapan/diterima/dipakai: `Angka Demo`.

## QA minimums

For UI/data read tasks, run or request:

```bash
npx prisma validate
npx tsc --noEmit
npm run test
npm run build
```

For route checks:

- `/desa`
- relevant query route, e.g. `/desa?cari=ancolmekar`
- relevant detail route, e.g. `/desa/ancolmekar`
- legacy detail route, e.g. `/desa/4`

## Report rule

Every implementation gate should end with a report containing:

- tracker/story IDs,
- affected files/routes,
- what changed,
- QA commands and result,
- known risks,
- boundary confirmation,
- next recommended gate.

## Status language

Use explicit statuses:

- `PLANNED`
- `OPEN_FOR_IMPLEMENTATION`
- `IN_PROGRESS`
- `DONE_PENDING_QA`
- `DONE_PENDING_REVIEW`
- `ACCEPTED_FOR_OWNER_REVIEW`
- `ACCEPTED_FOR_TRACKER_UPDATE`
- `ACCEPTED`
- `REWORK`
- `BLOCKED`
- `DEFERRED`

Do not mark `ACCEPTED` without Iwan/Owner approval when required.

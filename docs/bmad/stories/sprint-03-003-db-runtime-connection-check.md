# Story Sprint 03-003 — DB Runtime Connection Check

Date: 2026-04-28
Status: PLANNED
Prepared-by: Rangga / BMAD-lite orchestration

## Goal

Diagnose why seeded Arjasari desa such as Ancolmekar are not visible in `/desa` and confirm whether the Next.js runtime is reading the intended Supabase database.

## Trigger

Owner reported:

> Ancolmekar is not visible in Data Desa page.

This suggests `/desa` is likely rendering mock fallback mode instead of database mode.

## Scope

In scope:

- verify runtime DB env without exposing secrets,
- verify runtime DB host/alias,
- verify seeded row count for `desa`,
- verify if `/desa` banner shows `Mode: Database + Angka Demo`,
- verify if `/desa?cari=ancolmekar` finds Ancolmekar,
- verify if `/desa/ancolmekar` resolves,
- document findings.

Out of scope:

- schema change,
- migration,
- seed rerun unless separately approved,
- read path expansion,
- numeric APBDes extraction,
- verified status,
- scraper/scheduler,
- API/auth/voice changes,
- removing mock fallback.

## Acceptance criteria

- Executor confirms runtime `DATABASE_URL` host/alias without secret.
- Executor confirms whether host is shared Supabase or wrong/temp/local DB.
- Executor confirms `desa` row count from runtime DB.
- Executor confirms if `ancolmekar` exists in runtime DB.
- `/desa` mode banner is observed.
- `/desa?cari=ancolmekar` behavior is observed.
- `/desa/ancolmekar` behavior is observed.
- A short report is created or appended to engineering/BMAD docs.

## Suggested safe commands

PowerShell host check without printing secrets:

```powershell
node -e "const u=new URL(process.env.DATABASE_URL); console.log(u.host)"
```

Prisma validation:

```bash
npx prisma validate
```

Optional count check via a local script or Prisma Studio/query tool, without committing secrets:

```text
Count rows in table `desa`.
Check whether slug `ancolmekar` exists.
```

Do not paste full DATABASE_URL into docs/chat.

## Expected target

If reading shared Supabase, expected host based on prior report:

```text
aws-1-ap-south-1.pooler.supabase.com
```

If host is temp migration validation DB:

```text
aws-1-ap-northeast-1.pooler.supabase.com
```

Temp migration validation DB is not the intended default read target for product runtime.

## Expected results

If runtime DB is correct and seed exists:

- `desa` count should include 11 seeded Arjasari records.
- `ancolmekar` slug should exist.
- `/desa` should show `Mode: Database + Angka Demo`.
- card should show `Dari Database` and `Angka Demo`.

If runtime DB is missing/wrong:

- `/desa` should show `Mode: Mock/Hardcoded`.
- this confirms fallback works but runtime config needs fixing.

## Report output

Recommended output file if this story is executed:

- `docs/engineering/53-sprint-03-db-runtime-connection-check-report.md`

Report should include:

- runtime host alias only,
- row counts,
- route observations,
- pass/fail,
- no secrets,
- no schema/seed/read-path expansion.

## Status

`PLANNED`

Do not execute until Iwan/Owner opens this story/gate explicitly.

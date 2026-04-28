# Story Sprint 03-003 — DB Runtime Connection Check

Date: 2026-04-28
Status: PLANNED_QA_CHECK
Prepared-by: Rangga / BMAD-lite orchestration

## Goal

Confirm whether the Next.js runtime is reading the intended shared Supabase database and whether the latest request-time DB read fixes make seeded Arjasari desa visible.

## Trigger

Owner reported:

> Ancolmekar is not visible in Data Desa page.

Initial interpretation:

- `/desa` was likely rendering mock fallback mode instead of database mode, or static build caching was hiding request-time DB data.

Latest code changes already address likely code-level causes:

- `14166a02e63cb1633ad2f77ce7a47cbbc30e4026` adds request-time DB read with `dynamic = "force-dynamic"` for `/desa` and `/desa/[id]`.
- `187078163fc0668f3d8dac850969921fc59bc1bf` guards PrismaClient instantiation when `DATABASE_URL` is missing/bad so fallback does not crash.

This story is now primarily a QA/diagnostic story, not a broad new feature implementation story.

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
- `/desa/4` legacy detail remains safe.
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

QA:

```bash
npx tsc --noEmit
npm run test
npm run build
```

Optional count check via a local script, Prisma Studio, or safe DB console, without committing secrets:

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
- `/desa/ancolmekar` should resolve.

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

`PLANNED_QA_CHECK`

Iwan/Owner may open this as a small QA report gate if they want formal closure before accepting hybrid DB + mock flagging.

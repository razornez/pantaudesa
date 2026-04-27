# Iwan Decision — Clean DB Validation Strategy for Sprint 03 Migration

Date: 2026-04-27
Reviewer: Iwan
Technical gate: Owner acting as temporary technical gate
Input reviewed: `docs/engineering/43-sprint-03-migration-application-report.md`

## Decision

Use a **temporary Supabase dev project/database** for clean migration validation.

Do not use manual SQL fallback now.

Do not run migration validation against shared Supabase.

## Why

Ujang successfully created migration files:

- `prisma/migrations/0001_baseline_existing_schema/migration.sql`
- `prisma/migrations/0002_sprint_03_data_foundation/migration.sql`

The content review says:

- baseline migration represents existing pre-Sprint-03 auth/user/voice schema,
- Sprint 03 migration only adds approved Sprint 03 enums/tables/indexes/FKs,
- no `DROP`,
- no `TRUNCATE`,
- no `ALTER TABLE` on existing auth/user/voice tables in Sprint 03 migration,
- no `Voice` to `Desa` relation.

But clean DB validation is blocked because:

- Docker is unavailable,
- local Postgres is not running,
- no `LOCAL_DATABASE_URL` exists,
- `.env` points to shared Supabase, which must not be used for reset/dev validation.

Therefore the safest next step is a temporary isolated Supabase dev database.

## Rejected options

## Option 1 — Use shared Supabase for validation

Rejected.

Reason:

- It risks reset/drift/destructive commands on shared data.
- Shared Supabase should only receive controlled deploy after clean validation.

## Option 2 — Manual SQL fallback now

Rejected for now.

Reason:

- Manual SQL can work, but it bypasses the migration validation discipline.
- Use manual SQL only if Prisma deploy path fails after dev DB validation and Iwan explicitly approves fallback.

## Option 3 — Wait for local Docker/Postgres

Acceptable but slower.

Because project is deadline-sensitive, temporary Supabase dev DB is faster and still isolated.

## Approved path

### Step 1 — Owner provides temporary Supabase dev database

Owner should create or provide a temporary Supabase project/database just for migration validation.

Name suggestion:

`pantaudesa-dev-migration-validation`

Provide to Ujang:

- `DATABASE_URL`
- `DIRECT_URL` if needed by Prisma

This database must be disposable.

No real user/public data should be inside.

### Step 2 — Ujang points local env to temporary dev DB only

Ujang must not use shared Supabase URL.

Ujang should create local-only env values and avoid committing secrets.

Do not commit `.env`.

### Step 3 — Validate migrations on temporary dev DB

Run against temporary dev DB:

```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run test
```

If Prisma generate still fails because of local Windows engine DLL lock, run diagnostic:

```bash
npx prisma generate --no-engine
```

But do not claim full generate pass unless normal generate passes.

### Step 4 — Confirm clean DB result

Expected result:

- baseline migration creates existing auth/user/voice schema,
- Sprint 03 migration adds data foundation tables,
- schema validates,
- TypeScript/tests pass,
- no unexpected migration failure.

### Step 5 — Report before touching shared Supabase

Create:

`docs/engineering/45-sprint-03-temp-dev-db-validation-report.md`

Report:

- temp DB used, without secrets,
- commands run,
- pass/fail,
- migration folders applied,
- whether auth/user/voice tables exist after baseline,
- whether Sprint 03 tables exist after second migration,
- whether Prisma generate passed or failed due to environment,
- recommendation whether shared Supabase baseline/deploy may proceed.

### Step 6 — Shared Supabase remains blocked until Iwan reviews report

Do not run against shared Supabase yet:

- `migrate resolve`,
- `migrate deploy`,
- manual SQL,
- seed,
- read path switch.

## Boundary

Allowed now:

- use temporary Supabase dev DB,
- run migration reset/dev on temporary dev DB only,
- create validation report.

Not allowed:

- migrate resolve on shared Supabase,
- migrate deploy on shared Supabase,
- manual SQL apply on shared Supabase,
- seed,
- read path switch,
- API/auth/voice changes,
- scraper/scheduler.

## Prompt for Ujang

```text
Ujang, read docs/engineering/44-iwan-clean-db-validation-strategy.md.

Decision: use temporary Supabase dev DB for clean migration validation.
Do not use shared Supabase.
Do not seed or switch read path.

Wait for owner to provide temporary dev DATABASE_URL/DIRECT_URL.
Do not commit secrets.

Once provided, run against temp dev DB only:
- npx prisma migrate reset
- npx prisma migrate dev
- npx prisma validate
- npx prisma generate
- npx tsc --noEmit
- npm run test

Create:
docs/engineering/45-sprint-03-temp-dev-db-validation-report.md

Report short:
commands, pass/fail, migration folders applied, tables created, generate status, blockers, recommendation whether shared Supabase baseline/deploy can proceed.

Do not run migrate resolve/deploy on shared Supabase until Iwan approves after report 45.
```

## Final status

Migration files: created.

Clean validation: blocked until temporary dev DB is provided.

Shared Supabase apply: blocked.

Seed/read path: blocked.

Initiated-by: Iwan (CEO)
Reviewed-by: Owner acting as Technical Gate
Executed-by: Ujang (Codex)
Status: approved-temporary-supabase-dev-db
Backlog: #4 #13

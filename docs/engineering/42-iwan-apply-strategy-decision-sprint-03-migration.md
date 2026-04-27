# Iwan Decision — Sprint 03 Migration Apply Strategy

Date: 2026-04-27
Reviewer: Iwan
Technical gate: Owner acting as temporary technical gate
Inputs reviewed:

- `docs/engineering/40-sprint-03-baseline-and-diff-plan.md`
- `docs/engineering/41-sprint-03-migration-diff-review.md`

## Decision

Use this strategy:

> Formalize migration in a clean/local dev database first, then baseline existing Supabase migration history, then apply reviewed Sprint 03 migration through controlled deploy.

Do **not** apply reviewed SQL manually to shared Supabase as the first choice.

Do **not** run `migrate dev`, `migrate reset`, or `db push` against shared Supabase.

## Why this decision

The reviewed diff is safe in content:

- only adds Sprint 03 enums,
- only adds Sprint 03 tables,
- only adds indexes/FKs for new tables,
- does not drop/alter auth/user/voice tables,
- does not touch `Voice.desaId`.

However, shared Supabase is currently not managed by Prisma Migrate history.

So the risk is not the SQL content. The risk is migration history drift.

We need a repeatable migration path that protects existing auth/user/voice data and keeps repo migration history clean.

## Rejected options

## Option A — Baseline Supabase then apply reviewed Sprint 03 diff immediately

Rejected as first choice.

Reason:

- It may work, but without validating migration files in a clean dev DB first, repo migration history can still become messy.
- We need a reproducible path before touching shared Supabase.

## Option B — Manual SQL apply to shared Supabase, then record afterward

Rejected as first choice.

Reason:

- Manual SQL can work but is easier to drift from Prisma migration history.
- If recorded incorrectly afterward, future migrations become harder.
- Use only as emergency fallback.

## Option C — Formalize migration in clean local/dev DB first

Approved.

Reason:

- Safest for repo hygiene.
- Lets Ujang verify migration files before touching shared Supabase.
- Allows baseline + Sprint 03 migration history to be reviewed.
- Protects existing Supabase from reset/destructive migration.

## Approved workflow

## Step 1 — Create baseline migration file from existing pre-Sprint-03 schema

Goal:

Represent existing auth/user/voice schema as baseline migration in repo history.

Important:

- This baseline must reflect the database state **before Sprint 03 tables**.
- It must not include `Desa`, `DataSource`, `AnggaranDesaSummary`, `APBDesItem`, or `DokumenPublik`.

Possible approach:

1. Create temporary pre-Sprint-03 schema from git history before commit `b1b6237214daab3208554bbc99328323df8123c0`.
2. Generate baseline SQL from empty to that pre-Sprint-03 schema.
3. Save it as first migration folder, for example:

```text
prisma/migrations/0001_baseline_existing_schema/migration.sql
```

Do not apply this SQL to existing Supabase, because those tables already exist there.

## Step 2 — Create Sprint 03 migration file

Goal:

Create migration SQL that adds only Sprint 03 objects.

Expected migration folder example:

```text
prisma/migrations/0002_sprint_03_data_foundation/migration.sql
```

This migration should match reviewed diff from `docs/engineering/41-sprint-03-migration-diff-review.md`.

It should add only:

- `DataStatus`
- `SourceType`
- `ScopeType`
- `AccessStatus`
- `DataAvailability`
- `StatusSerapan`
- `DocumentStatus`
- `DocumentType`
- `desa`
- `data_sources`
- `anggaran_desa_summaries`
- `apbdes_items`
- `dokumen_publik`
- indexes and FKs for those new tables.

It must not drop/alter:

- users
- accounts
- sessions
- verification_tokens
- otp_codes
- voices
- voice_replies
- voice_votes
- voice_helpfuls

## Step 3 — Validate migrations in clean local/dev DB

Use a clean local/dev database, not shared Supabase.

Run:

```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run test
```

If lint/build are known existing issues, report them but do not hide them.

Expected result:

- baseline migration creates existing auth/user/voice schema in clean DB,
- Sprint 03 migration adds new data foundation tables,
- Prisma validates,
- generated client works,
- TypeScript/tests pass.

## Step 4 — Baseline existing Supabase migration history without running baseline SQL

Only after local/dev DB migration files are reviewed:

Mark the baseline migration as applied on existing Supabase without executing it.

Command pattern:

```bash
npx prisma migrate resolve --applied 0001_baseline_existing_schema
```

Important:

- This should be done only against shared Supabase after confirming baseline represents existing schema.
- This must not run SQL to recreate existing tables.

## Step 5 — Apply Sprint 03 migration to shared Supabase

After baseline is marked applied, apply the Sprint 03 migration through controlled deploy:

```bash
npx prisma migrate deploy
```

Expected:

- Prisma sees baseline as applied.
- Prisma applies only `0002_sprint_03_data_foundation`.
- No auth/user/voice tables are dropped/altered.

## Step 6 — Report results before seed/read path

After apply, create report:

`docs/engineering/43-sprint-03-migration-application-report.md`

Must include:

- migration folders created,
- local/dev DB validation result,
- baseline resolve result,
- migrate deploy result,
- whether auth/user/voice tables were untouched,
- whether Sprint 03 tables exist,
- QA command results,
- recommendation whether seed can start.

## Current gate status

Allowed now:

- create migration files,
- create temporary baseline schema file if needed,
- run migrations against clean local/dev DB,
- document SQL review,
- prepare application report.

Not allowed yet:

- seed,
- read path switch,
- API/auth/voice changes,
- scraper/scheduler,
- production deploy,
- marking imported/needs_review data as verified.

## Manual SQL fallback

Manual SQL apply is allowed only if Prisma baseline/deploy flow fails for environment reasons and Iwan/Owner explicitly approve fallback.

If fallback is needed, Ujang must write a new decision request first.

Do not silently apply manual SQL.

## Prompt for Ujang

```text
Ujang, read docs/engineering/42-iwan-apply-strategy-decision-sprint-03-migration.md.

Decision: formalize migrations in clean local/dev DB first, then baseline existing Supabase, then apply Sprint 03 migration through controlled deploy.

Tasks:
1. Create baseline migration from pre-Sprint-03 schema.
2. Create Sprint 03 migration that only adds approved enums/tables/indexes/FKs.
3. Validate both migrations in a clean local/dev DB.
4. If clean DB passes, mark baseline as applied on shared Supabase using migrate resolve.
5. Apply Sprint 03 migration using migrate deploy.
6. Create docs/engineering/43-sprint-03-migration-application-report.md.

Do not seed.
Do not switch read path.
Do not touch API/auth/voice/scheduler/scraper.
Do not manually apply SQL unless Iwan explicitly approves fallback.

Report short: migration folders, commands, pass/fail, auth/user/voice untouched, Sprint 03 tables applied or not, blocker, need Iwan decision.
```

## Final status

Sprint 03 schema: accepted.

Migration diff: content safe.

Apply strategy: approved-dev-db-baseline-first.

Seed/read path: still blocked until migration application report is reviewed.

Initiated-by: Iwan (CEO)
Reviewed-by: Owner acting as Technical Gate
Executed-by: Ujang (Codex)
Status: approved-dev-db-baseline-first
Backlog: #4 #13

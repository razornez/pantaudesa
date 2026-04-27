# Iwan Decision — Sprint 03 Migration Strategy

Date: 2026-04-27
Reviewer: Iwan
Technical gate: Owner acting as temporary technical gate
Input reviewed: `docs/engineering/38-sprint-03-local-qa-and-migration-readiness-report.md`

## Decision

Use **reviewed diff workflow with baseline**, not direct `migrate dev` against existing Supabase.

## Why

Ujang's report shows:

- `npx prisma validate` passed after escalation.
- `npx tsc --noEmit` passed.
- `npm run test` passed after escalation.
- `npx prisma generate` failed due to local Prisma engine DLL rename lock, likely environment/local file lock.
- `npm run build` failed before Next build because Prisma generate hit the same engine DLL issue.
- `npm run lint` failed due to existing lint debt, not Sprint 03 schema.
- `npx prisma migrate dev --name sprint_03_data_foundation` detected drift against existing Supabase and requested resetting `public` schema.

Resetting `public` is not allowed.

It could affect existing:

- users
- accounts
- sessions
- verification_tokens
- otp_codes
- voices
- voice_replies
- voice_votes
- voice_helpfuls

## Rejected options

## Option 1 — Direct `migrate dev` against existing Supabase

Rejected.

Reason:

- Drift detected.
- Prisma requested reset.
- Reset risks existing auth/user/voice tables and data.

## Option 2 — Clean local/dev DB only

Useful for testing, but not enough as the main strategy.

Reason:

- Clean local DB can validate migration generation.
- But it does not solve the fact that existing Supabase has no aligned migration history.
- We still need a safe baseline/reviewed diff path before touching Supabase.

## Approved option — Reviewed diff workflow with baseline

Approved.

Goal:

Protect existing Supabase while introducing Sprint 03 schema safely.

## Required workflow

### Step 1 — Do not touch shared Supabase yet

Do not run:

```bash
npx prisma migrate dev
npx prisma migrate reset
npx prisma db push
```

against shared Supabase.

### Step 2 — Prepare baseline of existing database state

Create a baseline representing the current existing Supabase schema before Sprint 03 data foundation tables are applied.

Important:

- Baseline must represent existing auth/user/voice tables.
- Baseline must not falsely mark Sprint 03 new tables as already applied.

Ujang should create a temporary baseline schema/report using one of these safe methods:

1. Use a pre-Sprint-03 schema from git history before commit `b1b6237214daab3208554bbc99328323df8123c0`, or
2. Introspect existing Supabase into a temporary schema file, not directly overwriting current `prisma/schema.prisma`.

Output should be documented in:

`docs/engineering/40-sprint-03-baseline-and-diff-plan.md`

### Step 3 — Generate reviewed diff for Sprint 03 only

Generate SQL/diff that adds only Sprint 03 approved models/enums.

Expected SQL should only add:

- Sprint 03 enums,
- `desa`,
- `data_sources`,
- `anggaran_desa_summaries`,
- `apbdes_items`,
- `dokumen_publik`,
- indexes and foreign keys for those tables.

It must not drop/alter existing auth/user/voice tables.

### Step 4 — Review SQL before applying

Before any DB apply, Ujang must create:

`docs/engineering/41-sprint-03-migration-diff-review.md`

This must include:

- generated command used,
- SQL summary,
- tables created,
- enums created,
- indexes created,
- foreign keys created,
- any auth/user/voice changes detected,
- safe/unsafe recommendation.

### Step 5 — Only after review, decide apply path

After Iwan/Owner reviews the diff:

- If safe: allow migration file creation/apply plan.
- If unsafe: stop and revise schema/diff.

## Commands guidance

Ujang should check actual Prisma CLI version first:

```bash
npx prisma --version
```

Then use the correct syntax for that version.

Useful commands to investigate safely:

```bash
npx prisma migrate status
npx prisma migrate diff --help
npx prisma db pull --schema prisma/schema.baseline.tmp.prisma
```

Do not overwrite main schema with `db pull`.

## Baseline warning

Do not create a baseline from the current Sprint 03 schema and mark it applied on existing Supabase.

That would incorrectly tell Prisma that Sprint 03 tables already exist even if they do not.

Baseline must represent the database state **before** Sprint 03 tables.

## Current QA interpretation

Accepted:

- Schema is likely valid because `prisma validate` passed.
- TypeScript is okay because `tsc --noEmit` passed.
- Tests are okay because test suite passed.

Not accepted yet:

- Prisma generate/build readiness, because local file lock blocked normal generate.
- Migration readiness, because current migration path is unsafe.
- Seed readiness, because migration strategy is unresolved.

## Next task for Ujang

Create baseline/diff plan first.

Required output:

`docs/engineering/40-sprint-03-baseline-and-diff-plan.md`

Then create reviewed SQL/diff report:

`docs/engineering/41-sprint-03-migration-diff-review.md`

## Prompt for Ujang

```text
Ujang, read docs/engineering/38-sprint-03-local-qa-and-migration-readiness-report.md and docs/engineering/39-iwan-migration-strategy-decision.md.

Decision: use reviewed diff workflow with baseline.
Do not run migrate dev/reset/db push against shared Supabase.
Do not seed or switch read path.

Task 1 output:
docs/engineering/40-sprint-03-baseline-and-diff-plan.md

Task 2 output:
docs/engineering/41-sprint-03-migration-diff-review.md

Goal:
- identify safe baseline of existing DB before Sprint 03 tables,
- generate/review SQL diff that only adds Sprint 03 enums/tables/indexes/FKs,
- confirm no auth/user/voice tables are dropped/altered.

Run/report:
- npx prisma --version
- npx prisma migrate status
- npx prisma migrate diff --help
- safe diff commands you use

Do not overwrite main schema with db pull.
Do not apply migration to shared Supabase.
Do not create seed.
Report short: commands, diff summary, safe/unsafe, blocker, need Iwan decision.
```

## Final status

Sprint 03 schema: accepted-pending-migration-strategy.

Migration: blocked until baseline/diff review.

Seed/read path: blocked.

Initiated-by: Iwan (CEO)
Reviewed-by: Owner acting as Technical Gate
Executed-by: Ujang (Codex)
Status: approved-reviewed-diff-baseline
Backlog: #4 #13

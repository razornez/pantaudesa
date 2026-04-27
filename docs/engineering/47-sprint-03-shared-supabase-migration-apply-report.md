# Sprint 03 Shared Supabase Migration Apply Report

Date: 2026-04-27
Executor: Ujang
Status: shared-supabase-migration-applied

## Inputs

Reviewed before execution:

- `docs/engineering/45-sprint-03-temp-dev-db-validation-report.md`
- `docs/engineering/39-iwan-migration-strategy-decision.md`
- `docs/engineering/42-iwan-apply-strategy-decision-sprint-03-migration.md`
- `docs/engineering/43-sprint-03-migration-application-report.md`

Iwan approval:

- Proceed to controlled shared Supabase migration gate.
- Accept remaining normal `npx prisma generate` Windows DLL-lock issue as non-blocking for migration deploy.

## Target Confirmation

Target confirmed before migration commands:

- shared Supabase pooler host: `aws-1-ap-south-1.pooler.supabase.com`
- not temp dev pooler host: `aws-1-ap-northeast-1.pooler.supabase.com`
- not direct DB host

No secrets were written to committed files or reports.

## Guardrails

- No `migrate reset` on shared Supabase.
- No `migrate dev` on shared Supabase.
- No `db push`.
- No seed.
- No read path switch.
- No API/auth/voice/scheduler/scraper changes.
- No manual SQL apply.

## Safety Check Before Deploy

Checked `prisma/migrations/0002_sprint_03_data_foundation/migration.sql` before deploy.

No match found for:

- `DROP`
- `TRUNCATE`
- `ALTER TABLE` on `users`
- `ALTER TABLE` on `accounts`
- `ALTER TABLE` on `sessions`
- `ALTER TABLE` on `verification_tokens`
- `ALTER TABLE` on `otp_codes`
- `ALTER TABLE` on `voices`
- `ALTER TABLE` on `voice_replies`
- `ALTER TABLE` on `voice_votes`
- `ALTER TABLE` on `voice_helpfuls`

## Commands Run

| Command | Result | Notes |
| --- | --- | --- |
| `git pull` | Pass after escalation | Repo was already up to date. |
| target host guard | Pass | Confirmed shared Supabase pooler host and rejected temp/direct hosts. |
| `npx prisma migrate status` | Expected non-zero | Reported 2 migrations not yet applied before baseline resolve. |
| `npx prisma migrate resolve --applied 0001_baseline_existing_schema` | Pass | Baseline marked as applied without executing baseline SQL. |
| `npx prisma migrate deploy` | Pass | Applied only `0002_sprint_03_data_foundation`. |
| `npx prisma migrate status` | Pass | Database schema is up to date. |
| `npx prisma validate` | Pass | Current Prisma schema is valid. |
| `npx tsc --noEmit` | Pass | No TypeScript errors. |
| `npm run test` | Pass | 3 test files, 42 tests. |
| `npx prisma migrate diff --from-empty --to-schema-datasource prisma/schema.prisma` | Pass | Read-only confirmation of objects present in shared Supabase. |

## Baseline Resolve Result

`0001_baseline_existing_schema` was marked as applied.

Important:

- Baseline SQL was not executed on shared Supabase.
- Existing auth/user/voice tables were not recreated.
- This step only aligned Prisma migration history with the existing database baseline.

## Deploy Result

`npx prisma migrate deploy` applied:

- `0002_sprint_03_data_foundation`

Deploy output confirmed all migrations were successfully applied.

## Final Migrate Status

Final `npx prisma migrate status` result:

- 2 migrations found.
- Database schema is up to date.

## Sprint 03 Tables Present

Read-only datasource diff from empty confirms these Sprint 03 tables exist in shared Supabase:

- `desa`
- `data_sources`
- `anggaran_desa_summaries`
- `apbdes_items`
- `dokumen_publik`

Sprint 03 enums also appear:

- `AccessStatus`
- `DataAvailability`
- `DataStatus`
- `DocumentStatus`
- `DocumentType`
- `ScopeType`
- `SourceType`
- `StatusSerapan`

## Auth/User/Voice Safety

Auth/user/voice tables remain present:

- `users`
- `accounts`
- `sessions`
- `verification_tokens`
- `otp_codes`
- `voices`
- `voice_replies`
- `voice_votes`
- `voice_helpfuls`

No deploy output indicated auth/user/voice drop or alteration.

`Voice.desaId` remains unchanged as a scalar string in Prisma schema. No relation from `Voice` to `Desa` was added.

## Blockers

No migration deploy blocker remains.

Known local environment issue remains:

- normal `npx prisma generate` can fail on this Windows machine because of Prisma engine DLL rename lock.

Iwan already accepted this as non-blocking for migration deploy because:

- temp dev migration validation passed,
- `prisma validate` passed,
- `generate --no-engine` passed during temp validation,
- TypeScript passed,
- tests passed.

## Recommendation

Shared Supabase migration gate is complete.

Seed/read path may be considered next by Iwan, but only as a new explicit task. Recommended next order:

1. Iwan reviews this report.
2. If accepted, create/approve a demo seed task.
3. Keep all seeded records clearly `demo`.
4. Switch read path only after seed/data status behavior is reviewed.

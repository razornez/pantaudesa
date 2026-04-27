# Sprint 03 Migration Application Report

Date: 2026-04-27
Executor: Ujang
Status: blocked-before-shared-apply

## Input

Reviewed:

- `docs/engineering/42-iwan-apply-strategy-decision-sprint-03-migration.md`

Decision followed:

- formalize migrations in clean local/dev DB first,
- then baseline existing Supabase,
- then apply Sprint 03 migration through controlled deploy.

Guardrails followed:

- No seed.
- No read path switch.
- No API/auth/voice/scheduler/scraper changes.
- No manual SQL apply.
- No `migrate dev`, `migrate reset`, or `db push` against shared Supabase.
- No `migrate resolve` or `migrate deploy` against shared Supabase because clean DB validation did not pass.

## Migration Folders Created

- `prisma/migrations/0001_baseline_existing_schema/migration.sql`
- `prisma/migrations/0002_sprint_03_data_foundation/migration.sql`

## Migration Creation Commands

Temporary pre-Sprint-03 schema source:

- `b1b6237214daab3208554bbc99328323df8123c0^:prisma/schema.prisma`

Baseline migration SQL:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.pre-sprint-03.baseline.tmp.prisma --script --output prisma/migrations/0001_baseline_existing_schema/migration.sql
```

Sprint 03 migration SQL:

```bash
npx prisma migrate diff --from-schema-datamodel prisma/schema.pre-sprint-03.baseline.tmp.prisma --to-schema-datamodel prisma/schema.prisma --script --output prisma/migrations/0002_sprint_03_data_foundation/migration.sql
```

Temporary schema file was removed after migration SQL generation.

## Migration Content Review

Baseline migration creates existing pre-Sprint-03 schema:

- `users`
- `otp_codes`
- `voices`
- `voice_replies`
- `voice_votes`
- `voice_helpfuls`
- `accounts`
- `sessions`
- `verification_tokens`
- related enums, indexes, and foreign keys.

Sprint 03 migration adds only approved Sprint 03 objects:

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
- indexes and foreign keys for the new Sprint 03 tables.

Safety scan result:

- No `DROP`.
- No `TRUNCATE`.
- No `ALTER TABLE` for existing auth/user/voice tables in `0002_sprint_03_data_foundation`.
- No `Voice` to `Desa` relation added.

## Clean Local/Dev DB Validation

Result: blocked.

Reason:

- Docker is not installed or not available.
- Local Postgres on `localhost:5432` is not listening.
- No separate `LOCAL_DATABASE_URL` or clean dev DB environment variable is available.
- Existing `.env` points to the shared Supabase database, which must not be used for `migrate reset` or `migrate dev`.

Because clean DB validation did not pass, the workflow stopped before shared Supabase apply steps.

## Commands Run

| Command | Result | Notes |
| --- | --- | --- |
| `git pull` | Pass after escalation | Pulled `docs/engineering/42-iwan-apply-strategy-decision-sprint-03-migration.md`. |
| `npx prisma migrate diff ... 0001_baseline_existing_schema` | Pass | Created baseline migration SQL from pre-Sprint-03 schema. |
| `npx prisma migrate diff ... 0002_sprint_03_data_foundation` | Pass | Created Sprint 03 migration SQL from baseline schema to current schema. |
| `docker --version` | Fail | Docker command not available. |
| `Test-NetConnection localhost -Port 5432` | Fail | Local Postgres is not listening. |
| `npx prisma validate` | Pass | Current schema is valid. |
| `npx prisma migrate status` | Expected non-zero | Finds 2 local migrations not applied on shared Supabase. No apply was performed. |
| `npx prisma generate` | Fail | Existing local Prisma engine DLL rename lock: `query_engine-windows.dll.node.tmp... -> query_engine-windows.dll.node`. |
| `npx prisma generate --no-engine` | Pass | Confirms client generation works without engine DLL replacement. |
| `npx tsc --noEmit` | Pass | No TypeScript errors. |
| `npm run test` | Pass | 3 test files, 42 tests. |

## Shared Supabase Status

Baseline marked applied: no.

Reason:

- Clean local/dev DB validation is blocked, so `migrate resolve --applied 0001_baseline_existing_schema` was not run.

Sprint 03 migration applied: no.

Reason:

- Baseline was not resolved.
- `migrate deploy` was not run.

Auth/user/voice touched on shared Supabase: no.

Sprint 03 tables applied to shared Supabase: no.

## Blocker

Need a clean local/dev PostgreSQL database to validate:

```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run test
```

Current machine does not expose one safely.

## Need Iwan Decision

Choose one path:

- provide a clean local/dev PostgreSQL `DATABASE_URL` for validation, then rerun migration validation and proceed to `migrate resolve` / `migrate deploy` if it passes, or
- explicitly approve a fallback path, such as using a temporary Supabase dev project/database, or
- explicitly approve manual SQL fallback in a separate decision document.

Until then:

- do not seed,
- do not switch read path,
- do not resolve baseline on shared Supabase,
- do not deploy Sprint 03 migration.

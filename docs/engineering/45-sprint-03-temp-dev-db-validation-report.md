# Sprint 03 Temp Dev DB Validation Report

Date: 2026-04-27
Executor: Ujang
Status: temp-dev-migration-validated-generate-blocked

## Command Authority

Reviewed:

- `docs/company/05-ai-command-chain-policy.md`
- `docs/engineering/44-iwan-clean-db-validation-strategy.md`
- `docs/engineering/46-rangga-temp-dev-db-validation-oversight-checklist.md`

Command owner: Iwan.

Rangga checklist was used as support only. No conflict was found with Iwan's instruction.

## Guardrails

- Temp Supabase dev DB credentials were used only as process environment variables.
- Secrets were not written to `.env`, `.env.local`, or committed docs.
- Confirmed temp DB host before migration commands: `aws-1-ap-northeast-1.pooler.supabase.com`.
- Did not use `aws-1-ap-south-1.pooler.supabase.com`.
- Did not use the old direct DB host.
- Did not use shared Supabase.
- No `migrate resolve` or `migrate deploy` was run on shared Supabase.
- No seed was run.
- No read path switch was made.
- No API/auth/voice/scheduler/scraper files were changed.

## Commands Run

Target: temporary Supabase dev DB only.

| Command | Result | Notes |
| --- | --- | --- |
| `git pull` | Pass after escalation | Repo was already up to date. |
| host guard check | Pass | Script refused old shared/direct hosts and confirmed `aws-1-ap-northeast-1.pooler.supabase.com`. |
| `npx prisma migrate status` before reset | Expected non-zero | Temp DB had 2 pending migrations: `0001_baseline_existing_schema`, `0002_sprint_03_data_foundation`. |
| `npx prisma migrate reset --force --skip-generate` | Pass | Applied both migrations to temp dev DB. |
| `npx prisma migrate dev --skip-generate` | Pass | Already in sync; no pending migration or schema change. |
| `npx prisma migrate status` after dev | Pass | Database schema is up to date. |
| `npx prisma validate` | Pass | Current Prisma schema is valid. |
| `npx prisma generate` | Fail | Existing local Windows Prisma engine DLL rename lock: `query_engine-windows.dll.node.tmp... -> query_engine-windows.dll.node`. |
| `npx prisma generate --no-engine` | Pass diagnostic | Client generation succeeds without replacing the Windows engine DLL. Not counted as full normal generate pass. |
| `npx tsc --noEmit` | Pass | No TypeScript errors. |
| `npm run test` | Pass | 3 test files, 42 tests. |
| `npx prisma migrate diff --from-empty --to-schema-datasource prisma/schema.prisma` | Pass | Read-only confirmation of objects present in temp dev DB. |

## Migration Folders Applied

Applied on temp dev DB:

- `0001_baseline_existing_schema`
- `0002_sprint_03_data_foundation`

`migrate status` after validation reports the database schema is up to date.

## Tables Created

Baseline/auth/user/voice tables confirmed present through read-only datasource diff:

- `users`
- `otp_codes`
- `voices`
- `voice_replies`
- `voice_votes`
- `voice_helpfuls`
- `accounts`
- `sessions`
- `verification_tokens`

Sprint 03 tables confirmed present through read-only datasource diff:

- `desa`
- `data_sources`
- `anggaran_desa_summaries`
- `apbdes_items`
- `dokumen_publik`

Sprint 03 enums confirmed present:

- `AccessStatus`
- `DataAvailability`
- `DataStatus`
- `DocumentStatus`
- `DocumentType`
- `ScopeType`
- `SourceType`
- `StatusSerapan`

## Generate Status

Normal `npx prisma generate`: fail.

Classification:

- Existing local environment/file-lock issue.
- Same class as previous reports: Prisma cannot rename the Windows query engine DLL in `src/generated/prisma`.

Diagnostic `npx prisma generate --no-engine`: pass.

No full normal generate pass is claimed.

## Auth/User/Voice Safety

Auth/user/voice baseline objects were created by `0001_baseline_existing_schema` in the temp dev DB.

Sprint 03 migration validation did not require:

- changing `Voice.desaId`,
- adding a `Voice` to `Desa` relation,
- touching API/auth/voice/scheduler/scraper code,
- seed or read path changes.

## Blockers

Migration validation blocker: none on temp dev DB.

Remaining local blocker:

- normal `npx prisma generate` still fails due to Windows Prisma engine DLL rename lock.

This appears environment-local and not migration-content-related because:

- migrations applied successfully,
- `prisma validate` passed,
- `generate --no-engine` passed,
- TypeScript passed,
- tests passed.

## Recommendation

Iwan can review this report and approve the next shared Supabase baseline/deploy gate if comfortable with the remaining local generate DLL-lock issue.

Recommended next gate, only after Iwan approval:

- run `npx prisma migrate resolve --applied 0001_baseline_existing_schema` on shared Supabase,
- run `npx prisma migrate deploy` on shared Supabase,
- verify shared Supabase status,
- keep seed/read path blocked until shared migration report is reviewed.

Do not proceed to shared Supabase without Iwan approval after this report.

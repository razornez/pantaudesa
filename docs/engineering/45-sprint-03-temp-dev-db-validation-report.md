# Sprint 03 Temp Dev DB Validation Report

Date: 2026-04-27
Executor: Ujang
Status: blocked-temp-dev-db-network

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
- Shared Supabase was not used for reset/dev validation.
- No `migrate resolve` or `migrate deploy` was run on shared Supabase.
- No seed was run.
- No read path switch was made.
- No API/auth/voice/scheduler/scraper files were changed.

## Commands Run

Target: temporary Supabase dev DB only.

| Command | Result | Notes |
| --- | --- | --- |
| `git pull` | Pass after escalation | Pulled command-chain policy and Rangga oversight checklist. |
| `npx prisma migrate status` | Fail | Targeted the temp DB host, but Prisma returned `Schema engine error`. |
| `npx prisma migrate reset --force --skip-generate` | Fail | Targeted the temp DB host, but Prisma returned `Schema engine error`. |
| `npx prisma migrate dev --skip-generate` | Fail | Targeted the temp DB host, but Prisma returned `Schema engine error`. |
| `npx prisma validate` | Pass | Current Prisma schema is valid. |
| `npx prisma generate` | Fail | Existing local Windows Prisma engine DLL rename lock: `query_engine-windows.dll.node.tmp... -> query_engine-windows.dll.node`. |
| `npx tsc --noEmit` | Pass | No TypeScript errors. |
| `npm run test` | Pass | 3 test files, 42 tests. |
| `npx prisma migrate status` with `sslmode=require` | Fail | Same `Schema engine error`. |
| `npx prisma migrate reset --force --skip-generate` with `sslmode=require` | Fail | Same `Schema engine error`. |
| `npx prisma migrate dev --skip-generate` with `sslmode=require` | Fail | Same `Schema engine error`. |
| `npx prisma migrate status` with URL-encoded password and `sslmode=require` | Fail | Same `Schema engine error`. |
| `Test-NetConnection` to temp DB host on port `5432` | Fail | Local TCP connection failed. |
| `Resolve-DnsName` for temp DB host | Partial | Host resolved to IPv6 `AAAA` only from this machine. |

## Migration Folders

Expected migration folders remain:

- `0001_baseline_existing_schema`
- `0002_sprint_03_data_foundation`

Applied on temp dev DB: no.

Reason:

- Prisma could not connect through schema engine.
- TCP connection to the temp DB host on port `5432` failed from this machine.

## Tables Created

Baseline/auth/user/voice tables created on temp DB: not confirmed.

Expected baseline tables:

- `users`
- `otp_codes`
- `voices`
- `voice_replies`
- `voice_votes`
- `voice_helpfuls`
- `accounts`
- `sessions`
- `verification_tokens`

Sprint 03 tables created on temp DB: not confirmed.

Expected Sprint 03 tables:

- `desa`
- `data_sources`
- `anggaran_desa_summaries`
- `apbdes_items`
- `dokumen_publik`

## Generate Status

Normal `npx prisma generate`: fail.

Classification:

- Existing local environment/file-lock issue.
- Same class as previous reports: Prisma cannot rename the Windows query engine DLL in `src/generated/prisma`.

No full generate pass is claimed.

## Blocker

Temp dev DB validation is blocked by connectivity/schema-engine failure.

Observed from this machine:

- temp DB host resolves only to IPv6 `AAAA`,
- TCP connection to port `5432` fails,
- Prisma schema engine reports a generic schema engine error for migrate commands.

Likely next need:

- provide a Supabase pooler connection string for the temp dev DB that works over IPv4 from this machine, or
- provide another temporary dev DB reachable from this environment, or
- ask Iwan/Owner to approve a different validation path.

## Recommendation

Shared Supabase baseline/deploy must not proceed yet.

Reason:

- Temp dev DB migration validation did not complete.
- Baseline and Sprint 03 migrations were not applied in an isolated DB.

Need Iwan decision:

- provide reachable temp dev DB connection details, preferably pooler/direct URL that resolves from this machine, then rerun validation, or
- approve a separate fallback strategy in a new decision document.

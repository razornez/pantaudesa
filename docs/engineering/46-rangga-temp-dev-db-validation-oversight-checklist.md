# Rangga Oversight Checklist — Temp Dev DB Validation

Date: 2026-04-27
Status: ready-for-iwan-ujang-use
Prepared-by: ChatGPT Freelancer / Rangga

## Context

This checklist is based on:

- `docs/engineering/43-sprint-03-migration-application-report.md`
- `docs/engineering/44-iwan-clean-db-validation-strategy.md`

Current status:

- Migration files already created.
- Clean DB validation is blocked until owner provides temporary Supabase dev `DATABASE_URL` / `DIRECT_URL`.
- Shared Supabase apply is blocked.
- Seed and read path are blocked.

Rangga role in this step:

> Oversight only. Rangga does not run migration commands.

## Boundary

Rangga must not:

- run migration,
- touch schema,
- touch database,
- edit Prisma,
- create seed,
- switch read path,
- touch API,
- touch auth,
- touch scheduler,
- touch scraper.

Ujang/Codex executes validation commands only after owner provides temporary dev DB credentials.

## 1. Checklist before Ujang runs any command

Before Ujang runs commands, confirm:

- [ ] Owner provided temporary Supabase dev `DATABASE_URL`.
- [ ] Owner provided temporary Supabase dev `DIRECT_URL` if Prisma needs it.
- [ ] Temp DB is disposable and contains no real user/public data.
- [ ] Temp DB is not shared Supabase production/shared project.
- [ ] Ujang confirms local env points to temp dev DB only.
- [ ] Ujang confirms `.env` is not committed.
- [ ] Ujang confirms no command will be run against shared Supabase.
- [ ] Ujang confirms no seed will be run.
- [ ] Ujang confirms no read path switch will be made.
- [ ] Ujang confirms no API/auth/voice/scheduler/scraper changes will be made.
- [ ] Ujang confirms current branch is clean except intended validation/report work.
- [ ] Ujang has read `docs/engineering/44-iwan-clean-db-validation-strategy.md`.

## 2. Secret handling checklist

Temp dev DB secrets must stay local only.

Confirm:

- [ ] `DATABASE_URL` is not pasted into any committed file.
- [ ] `DIRECT_URL` is not pasted into any committed file.
- [ ] `.env` is not committed.
- [ ] `.env.local` is not committed.
- [ ] terminal screenshots/logs do not expose DB password.
- [ ] report 45 does not include full DB URL.
- [ ] report 45 may mention temp DB alias/name only, for example `pantaudesa-dev-migration-validation`.
- [ ] `git diff` before commit does not show secrets.
- [ ] `git status` does not include `.env`, `.env.local`, or any temp secret file.

Recommended quick checks for Ujang:

```bash
git status --short
git diff -- . ':!package-lock.json'
```

If secrets appear anywhere, stop and remove them before continuing.

## 3. Commands Ujang should run on temp dev DB only

Run these only after local env points to temp dev DB.

Recommended command order:

```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run test
```

If normal Prisma generate fails due to known local Windows engine DLL lock, diagnostic only:

```bash
npx prisma generate --no-engine
```

Important:

- Do not treat `generate --no-engine` as full replacement for normal `npx prisma generate`.
- Report normal generate as failed if normal generate fails.
- Do not proceed to shared Supabase actions after these commands.

## 4. Expected report 45 contents

Ujang must create:

`docs/engineering/45-sprint-03-temp-dev-db-validation-report.md`

Report 45 must include:

- [ ] Date and executor.
- [ ] Confirmation temp dev DB was used, without secrets.
- [ ] Confirmation shared Supabase was not used.
- [ ] Confirmation no seed was run.
- [ ] Confirmation no read path/API/auth/voice/scheduler/scraper changes were made.
- [ ] Commands run, in order.
- [ ] Pass/fail for each command.
- [ ] Short error summary for any failed command.
- [ ] Whether failure is known existing issue or new issue.
- [ ] Migration folders applied on temp dev DB:
  - [ ] `0001_baseline_existing_schema`
  - [ ] `0002_sprint_03_data_foundation`
- [ ] Confirmation baseline created expected existing tables:
  - [ ] `users`
  - [ ] `otp_codes`
  - [ ] `voices`
  - [ ] `voice_replies`
  - [ ] `voice_votes`
  - [ ] `voice_helpfuls`
  - [ ] `accounts`
  - [ ] `sessions`
  - [ ] `verification_tokens`
- [ ] Confirmation Sprint 03 migration created expected tables:
  - [ ] `desa`
  - [ ] `data_sources`
  - [ ] `anggaran_desa_summaries`
  - [ ] `apbdes_items`
  - [ ] `dokumen_publik`
- [ ] Confirmation Sprint 03 enums exist after migration.
- [ ] Confirmation no unexpected auth/user/voice alteration was observed.
- [ ] Confirmation `Voice.desaId` remains unchanged.
- [ ] Recommendation whether shared Supabase baseline/deploy can proceed.
- [ ] Explicit blocker if shared Supabase should remain blocked.

## 5. Stop conditions

Ujang must stop immediately if:

- [ ] Local env points to shared Supabase instead of temp dev DB.
- [ ] `DATABASE_URL` / `DIRECT_URL` secrets appear in git diff.
- [ ] `.env` or `.env.local` appears staged for commit.
- [ ] `npx prisma migrate reset` targets anything other than temp dev DB.
- [ ] Migration attempts to drop/alter unexpected auth/user/voice objects.
- [ ] `0001_baseline_existing_schema` fails to create baseline schema.
- [ ] `0002_sprint_03_data_foundation` fails to apply.
- [ ] Prisma schema validation fails because of Sprint 03 schema.
- [ ] `Voice.desaId` requires relation/migration changes.
- [ ] Any command suggests touching shared Supabase.
- [ ] Seed is accidentally triggered.
- [ ] Read path/API/auth/scheduler/scraper changes are required to proceed.
- [ ] Ujang is unsure whether DB target is temp dev or shared Supabase.

If any stop condition happens:

1. Stop commands.
2. Do not retry destructive commands.
3. Do not touch shared Supabase.
4. Write the blocker in report 45.
5. Ask Iwan/Owner for decision.

## 6. Shared Supabase remains blocked

Until Iwan reviews report 45, do not run on shared Supabase:

- `npx prisma migrate resolve`
- `npx prisma migrate deploy`
- `npx prisma migrate reset`
- `npx prisma migrate dev`
- `npx prisma db push`
- manual SQL apply
- seed
- read path switch

## 7. Minimal instruction for Ujang / Codex

Use this short prompt to save Codex tokens:

```text
Read docs/engineering/44-iwan-clean-db-validation-strategy.md and docs/engineering/46-rangga-temp-dev-db-validation-oversight-checklist.md.
Use temp Supabase dev DB only. Do not use shared Supabase. Do not commit secrets.
Run: migrate reset, migrate dev, prisma validate, prisma generate, tsc, test.
Create docs/engineering/45-sprint-03-temp-dev-db-validation-report.md with pass/fail, tables created, blockers, and recommendation.
No seed/read path/API/auth/scheduler/scraper.
Stop if DB target is unclear or secrets appear in git diff.
```

Recommended Codex mode/model:

- Use a lightweight/standard coding model for command execution and report writing.
- Avoid high-reasoning mode unless migration errors are complex.
- Keep context limited to docs 44 and 46 plus current terminal output.

## 8. Minimal instruction for Asep / Claude if review is needed

Use this short prompt to save Claude tokens:

```text
Review docs/engineering/45-sprint-03-temp-dev-db-validation-report.md against docs/engineering/44-iwan-clean-db-validation-strategy.md.
Check: temp DB only, no secrets, migrations applied, auth/voice untouched, QA pass/fail, blockers, and whether shared Supabase deploy can proceed.
Return approve/block with reasons.
```

Recommended Claude mode/model:

- Use a mid-tier reasoning model for review.
- No need for largest model unless migration diff is ambiguous or destructive.
- Provide only approve/block plus concise risk notes.

## 9. Rangga oversight note

Rangga does not run migration commands in this step.

Rangga only:

- prepares oversight checklist,
- reviews reports after Ujang runs commands,
- highlights blockers,
- prepares owner/Iwan summaries.

## Final status

Checklist ready.

Still blocked until owner provides temporary Supabase dev DB credentials.

Initiated-by: Iwan
Reviewed-by: Pending Iwan/Ujang
Executed-by: ChatGPT Freelancer / Rangga
Status: ready-for-temp-dev-db-validation

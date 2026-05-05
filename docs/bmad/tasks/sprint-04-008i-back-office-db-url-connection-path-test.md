# Sprint 04-008I — Back Office DB URL Connection Path Test

## Status
READY FOR EXECUTION — local/staging test only. Do not commit secrets.

## Context
Sprint 04-008H narrowed the `/profil/admin-desa/dokumen` slowness to the Prisma call boundary / DB connection path.

Latest evidence:

```text
admin-desa.context dbQuery rows=1 durationMs=1719
admin-desa.dokumen dbQuery rows=7 durationMs=1223
Raw SQL EXPLAIN context: ~0.210ms
Raw SQL EXPLAIN documents: ~0.240ms
```

This means DB execution is fast, but the app path through Prisma is slow.

The next test is to compare:

- `DATABASE_URL` current path — likely Supabase pooler / PgBouncer.
- `DIRECT_URL` direct Postgres path — bypasses pooler.

Important Prisma behavior:
- Runtime app queries use `datasource db.url`, which is `DATABASE_URL` in `prisma/schema.prisma`.
- `DIRECT_URL` is mostly for direct DB operations/migrations.
- To test direct connection at runtime, temporarily set `DATABASE_URL` to the same value as `DIRECT_URL` in local environment.

## Goal
Find whether the 1–2s `dbQuery` time is caused by Supabase pooler/PgBouncer path, cold connection, or another Prisma runtime issue.

## Hard Boundaries
Do not:
- Merge to `main`.
- Commit `.env`, `.env.local`, DB URLs, passwords, tokens, or screenshots containing secrets.
- Create migration.
- Add DB index.
- Change business logic.
- Install third-party packages.
- Add persistent cache for back office data.
- Move sensitive fetching to client.

## Required Report Update
Update:

```text
docs/bmad/reports/back-office-performance-audit.md
```

Add a section summarizing this test:

```md
## DATABASE_URL vs DIRECT_URL Test

| Test | Context dbQuery | Documents dbQuery | Notes |
|---|---:|---:|---|
| DATABASE_URL baseline | ...ms | ...ms | Current env |
| DIRECT_URL as DATABASE_URL | ...ms | ...ms | Direct Postgres path |
| Warm refresh #2 | ...ms | ...ms | Detect cold connection |
| Warm refresh #3 | ...ms | ...ms | Confirm repeatability |
```

Do not include actual URLs or credentials.

## Task 1 — Verify current branch

```bash
git checkout fix/mobile-suara-profile-admin-access-polish
git pull origin fix/mobile-suara-profile-admin-access-polish
```

## Task 2 — Baseline test with current DATABASE_URL

1. Confirm `.env.local` has both `DATABASE_URL` and `DIRECT_URL` locally.
2. Do not print full values in terminal output that will be copied into report.
3. Run dev server:

```bash
PERF_DEBUG_BACK_OFFICE=true npm run dev
```

4. Open:

```text
http://localhost:3000/profil/admin-desa/dokumen
```

5. Record these logs:

```text
[perf][back-office] route=admin-desa.context step=dbQuery rows=1 durationMs=...
[perf][back-office] route=admin-desa.dokumen step=dbQuery rows=... durationMs=...
```

6. Run 3 measurements:
- first load after dev server restart
- refresh #2
- refresh #3

## Task 3 — Test DIRECT_URL as runtime DATABASE_URL

Temporarily make runtime `DATABASE_URL` use the same value as `DIRECT_URL`.

### Option A — Manual `.env.local` edit

1. Backup local env file:

```bash
cp .env.local .env.local.backup
```

2. In `.env.local`, copy the value from `DIRECT_URL` into `DATABASE_URL`.
3. Do not commit `.env.local`.
4. Restart dev server.
5. Run the same 3 measurements.
6. Restore original env after test:

```bash
cp .env.local.backup .env.local
```

### Option B — Shell override, if comfortable

Use only if the local shell can safely read env vars without printing secrets.

Bash/macOS/Linux:

```bash
set -a
source .env.local
set +a
DATABASE_URL="$DIRECT_URL" PERF_DEBUG_BACK_OFFICE=true npm run dev
```

PowerShell:

```powershell
# Prefer manual .env.local edit if env parsing is risky.
# Do not print secrets. Do not commit .env.local.
```

## Task 4 — Interpret results

### Case A — Direct URL is much faster

Example:

```text
DATABASE_URL: context 1700ms, documents 1200ms
DIRECT_URL: context 100–300ms, documents 100–300ms
```

Conclusion:
- Likely Supabase pooler/PgBouncer connection path overhead.
- Recommend owner review for local/staging/prod connection strategy.
- Do not change production DB URL without owner approval.

### Case B — First load slow, refresh #2/#3 much faster

Conclusion:
- Likely cold connection / Prisma engine warm-up.
- Recommend connection warm-up or deployment/runtime strategy review.

### Case C — Direct URL is still slow every time

Conclusion:
- Pooler is probably not the main issue.
- Continue investigating Prisma engine startup, Next dev overhead, machine/network latency, or Supabase region.

### Case D — Both are already fast

Conclusion:
- Slowness may have been transient or cold-only.
- Repeat after fresh restart and document conditions.

## Task 5 — Quality checks

Run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Record pass/fail in the report. If build fails due local Windows EPERM / Prisma DLL / network font issue, record it honestly.

## Expected Deliverables

1. Updated report:

```text
docs/bmad/reports/back-office-performance-audit.md
```

2. No env files committed.
3. No migration.
4. No schema/index changes.
5. Clear recommendation for next owner decision.

## Acceptance Criteria

This task is complete when:
- Baseline `DATABASE_URL` timings are recorded.
- `DIRECT_URL` as runtime `DATABASE_URL` timings are recorded.
- Warm refresh #2 and #3 are recorded.
- Report clearly states whether the bottleneck points to pooler/PgBouncer, cold connection, Prisma runtime, region/network, or remains inconclusive.
- No secrets are committed or pasted into the report.

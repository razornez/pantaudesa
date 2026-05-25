# Database Runtime Runbook

Status: Active guardrail  
Scope: Supabase/Postgres + Prisma runtime, migration, seed, build, and local QA.

## Connection Policy

- `DATABASE_URL` is the application runtime connection for `next dev`, API routes, public pages, and local back office workflows.
- `DIRECT_URL` is migration/admin-only. Do not use it for local runtime unless explicitly debugging with `PANTAUDESA_LOCAL_DB_USE_DIRECT_URL=true`.
- `TEMPLATE_SYNC_DATABASE_URL` may override template sync only. Use it when the normal runtime pooler is healthy for the app but template sync needs a different stable admin path.
- `PANTAUDESA_LOCAL_DB_USE_DIRECT_URL` must default to `false`. If it is set to `true`, local runtime may bypass the working pooler and trigger read-only degraded mode.

## Required Health Checks

Run before debugging UI data failures, migration, or build:

```bash
npm run db:doctor
```

Expected healthy state:

- `runtime_ok: true`
- `migration_ok: true`
- `runtime.source: DATABASE_URL`
- `recommended_action` confirms runtime/migration health or clearly names the remaining issue.

If `direct_url_usable` is false but `runtime_ok` is true, the app can still run locally. Do not switch runtime to `DIRECT_URL`; run migrations from CI, a stable network, or Supabase SQL tooling.

## Migration Drift Recovery

Do not retry blindly when Prisma reports failed migrations or drift.

1. Run `npm run db:doctor` and `npx prisma migrate status`.
2. Inspect the failed migration SQL file.
3. Inspect actual DB schema and `_prisma_migrations`.
4. Verify every object from the failed migration exists before using `migrate resolve --applied`.
5. If migration was partially applied, repair missing objects first with explicit SQL, then resolve the ledger.
6. Never use `migrate reset` on shared/staging/production databases.

## Template Sync

Template sync must be observable and fail fast:

```bash
npm run template:sync
node prisma/seed-templates.mjs --dry-run
```

The sync script logs stages:

- preflight Prisma `SELECT 1`
- catalog relation detection
- component catalog seed
- template placement seed
- desa assignment seed
- perangkat and demo profile backfill

If a stage times out, fix the named connection/stage before retrying. Do not leave hanging sync processes running.

## Build Safety

- `npm run build` must not seed, migrate, or write DB data.
- `npm run prisma:generate` is allowed before build and has a Windows lock hint.
- On Windows, stop `next dev` before `npm run build` if Prisma reports `EPERM ... query_engine-windows.dll.node`.
- Current build may report a Turbopack/NFT tracing warning through generated Prisma imports. Treat it as a tracked residual warning unless it becomes a build failure.
- Run `npm run qa:prebuild` when changing DB/runtime code.
- Run `npm run qa:runtime` when changing read paths or template management.

## Known Residual Risks

- Local networks may fail to reach Supabase direct/session paths even when runtime transaction pooler works.
- Authenticated internal API smoke requires `QA_INTERNAL_ADMIN_COOKIE`; without it, runtime QA skips internal admin API smoke.
- Read-heavy back office pages must keep intentional degraded modes for real DB outages.

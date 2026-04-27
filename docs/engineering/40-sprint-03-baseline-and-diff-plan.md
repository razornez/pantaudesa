# Sprint 03 Baseline and Diff Plan

Date: 2026-04-27
Executor: Ujang
Status: reviewed-diff-plan-prepared

## Decision Context

Input reviewed:

- `docs/engineering/38-sprint-03-local-qa-and-migration-readiness-report.md`
- `docs/engineering/39-iwan-migration-strategy-decision.md`

Iwan decision:

- Use reviewed diff workflow with baseline.
- Do not run `migrate dev`, `migrate reset`, or `db push` against shared Supabase.
- Do not seed.
- Do not switch read path.
- Do not overwrite main `prisma/schema.prisma` with `db pull`.

## Baseline Choice

Safe baseline source:

- current shared Supabase schema, read-only, via Prisma datasource in `prisma/schema.prisma`.

Reason:

- `npx prisma migrate status` confirms the current database is not managed by Prisma Migrate.
- The existing database already contains auth/user/voice tables.
- The baseline must represent the database before Sprint 03 tables are applied.
- Using `migrate diff --from-schema-datasource` reads the current DB state without writing to it.

Rejected baseline approaches:

- `migrate dev` against Supabase: rejected because it previously requested reset.
- `migrate reset`: rejected because it would drop data.
- `db push`: rejected because it applies changes without migration review.
- `db pull` into main schema: rejected because it could overwrite the accepted Sprint 03 schema.
- marking current Sprint 03 schema as already applied: rejected because Sprint 03 tables do not exist yet.

## Commands Run

| Command | Result | Notes |
| --- | --- | --- |
| `npx prisma --version` | Pass after escalation | Prisma `6.19.3`, `@prisma/client 6.19.3`, Node `v20.17.0`. Sandbox first failed with `EPERM lstat C:\Users\IWANKU~1`. |
| `npx prisma migrate status` | Expected non-zero / baseline required | No migration found in `prisma/migrations`. Current database is not managed by Prisma Migrate. |
| `npx prisma migrate diff --help` | Pass after escalation | Confirms `migrate diff` is read-only and supports `--from-schema-datasource`, `--to-schema-datamodel`, and `--script`. |

## Safe Diff Commands

Read-only SQL diff command:

```bash
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script
```

Read-only summary diff command:

```bash
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma
```

Meaning:

- `from-schema-datasource` = current Supabase state from the datasource URL.
- `to-schema-datamodel` = accepted Sprint 03 Prisma schema file.
- Output is review material only.
- No SQL was applied.

## Baseline Interpretation

The current Supabase schema is the practical baseline for this pass.

The diff result proves the accepted Sprint 03 schema would add new Sprint 03 database objects on top of the existing baseline. It does not require treating auth/user/voice tables as new migration objects in this reviewed diff.

## Next Gate

Before applying anything to shared Supabase, Iwan must choose the apply path:

- create a baseline migration/history entry for existing DB state, then apply reviewed Sprint 03 SQL, or
- apply reviewed SQL manually through a controlled DB change process and record it afterward, or
- use a separate dev database to formalize migrations before shared DB apply.

Seed/read-path work remains blocked.

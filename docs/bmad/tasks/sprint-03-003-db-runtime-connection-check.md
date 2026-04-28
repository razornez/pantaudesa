# Task Sprint 03-003 — DB Runtime Connection Check

Status: READY_FOR_UJANG_OR_ASEP
Executor: Ujang or Asep
Prepared-by: Rangga
Date: 2026-04-28

## Goal

Confirm whether the current Next.js runtime is reading the intended shared Supabase database and whether seeded Arjasari desa such as Ancolmekar appear correctly.

## Read first

- `docs/bmad/project-context.md`
- `docs/bmad/workflow.md`
- `docs/bmad/boundary-rules.md`
- `docs/bmad/sprint-status.md`
- `docs/bmad/stories/sprint-03-002-db-read-hybrid-mock-flagging.md`
- `docs/bmad/stories/sprint-03-003-db-runtime-connection-check.md`

## Scope

- Pull latest `main`.
- Verify runtime DB host/alias without exposing secrets.
- Verify whether runtime DB contains seeded Arjasari rows.
- Verify whether slug `ancolmekar` exists.
- Verify route behavior:
  - `/desa`
  - `/desa?cari=ancolmekar`
  - `/desa/ancolmekar`
  - `/desa/4`
- Run QA commands.
- Fix only small runtime/read/fallback issues if found.
- Commit and push only if code/docs change is needed.

## Out of scope

- No schema change.
- No migration.
- No seed rerun unless Iwan explicitly approves.
- No full read path expansion.
- No numeric APBDes extraction.
- No active `verified` / `Terverifikasi`.
- No scraper/scheduler.
- No API/auth/voice changes.
- No removing mock fallback.
- No new dependency.

## Acceptance criteria

1. `npx prisma validate` passes.
2. `npx tsc --noEmit` passes.
3. `npm run test` passes.
4. `npm run build` passes.
5. Runtime host is checked safely without printing full `DATABASE_URL`.
6. If intended shared Supabase env is active, host should be `aws-1-ap-south-1.pooler.supabase.com`.
7. DB row check confirms whether `desa` contains seeded Arjasari rows.
8. DB row check confirms whether slug `ancolmekar` exists.
9. `/desa` does not crash.
10. `/desa` shows `Mode: Database + Angka Demo` when DB is connected and seed exists.
11. `/desa` shows `Mode: Mock/Hardcoded` when DB is missing/invalid.
12. `/desa?cari=ancolmekar` finds Ancolmekar in DB mode.
13. `/desa/ancolmekar` resolves in DB mode.
14. `/desa/4` still works.
15. DB records show `Dari Database`.
16. Mock fallback records show `Mock/Hardcoded`.
17. Budget/serapan fields remain labelled `Angka Demo`.

## Guardrails

- Do not paste or commit full `DATABASE_URL`.
- Do not commit `.env`, `.env.local`, or any secret file.
- Do not run `npx prisma migrate reset`.
- Do not run `npx prisma migrate dev` against shared Supabase.
- Do not run `npx prisma db push` against shared Supabase.
- Do not run seed unless Iwan explicitly opens a seed rerun gate.
- Do not change schema/migration files.
- Do not mark anything as verified.
- Do not insert numeric APBDes values.
- Keep mock fallback active.

## Commands

```bash
git pull
npx prisma validate
npx tsc --noEmit
npm run test
npm run build
```

Safe host check:

```bash
node -e "const url=process.env.DATABASE_URL; if(!url){console.log('DATABASE_URL missing'); process.exit(0)}; const u=new URL(url); console.log(u.host)"
```

Optional DB count check:

Use Prisma Studio, Supabase dashboard, or a temporary local-only script to check:

- count rows in `desa`,
- check whether slug `ancolmekar` exists.

Do not commit any temporary script unless it is intentionally reviewed and useful.

## Route checks

- `/desa`
- `/desa?cari=ancolmekar`
- `/desa/ancolmekar`
- `/desa/4`

## Commit rule

If no code/docs change is needed, do not create empty commit. Report findings only.

If changes are needed, commit message must include:

```text
fix(scope): short summary

What changed:
- ...

QA:
- npx prisma validate: PASS
- npx tsc --noEmit: PASS
- npm run test: PASS
- npm run build: PASS
- route /desa: PASS/OBSERVED
- route /desa?cari=ancolmekar: PASS/OBSERVED
- route /desa/ancolmekar: PASS/OBSERVED
- route /desa/4: PASS/OBSERVED

Guardrails:
- no secrets committed
- no schema/migration change
- no seed rerun
- no numeric APBDes extraction
- no verified status
- no scraper/scheduler
- mock fallback remains

Known risks:
- ...
```

## Report back in chat

Report only this summary:

```text
Task: Sprint 03-003 DB Runtime Connection Check
Runtime host alias: <host or missing>
Desa row count: <count or not checked>
ancolmekar exists: yes/no/not checked
/desa banner: Database + Angka Demo / Mock-Hardcoded / not checked
Routes checked:
- /desa: PASS/FAIL
- /desa?cari=ancolmekar: PASS/FAIL
- /desa/ancolmekar: PASS/FAIL
- /desa/4: PASS/FAIL
QA:
- prisma validate: PASS/FAIL
- tsc: PASS/FAIL
- test: PASS/FAIL
- build: PASS/FAIL
Files changed: <list or none>
Commit SHA: <sha or none>
Known risks/blockers: <text or none>
```

# Task Sprint 03-005 — User-friendly Empty State + Loading Performance

Status: READY_FOR_UJANG_ASEP_EXECUTION
Executor: Ujang / Asep
Prepared-by: Rangga
Date: 2026-04-28

## Goal

Improve the DB-first user experience after Sprint 03-004.

This batch must:

1. replace technical no-data/error copy with citizen-friendly Indonesian copy;
2. add loading/skeleton states so navigation does not feel frozen;
3. optimize DB-backed reads where safe;
4. keep DB-first displayed data behavior.

## Owner feedback

Owner saw public copy like:

```text
Data database belum bisa ditampilkan
PantauDesa tidak memakai fallback hardcoded...
DB: aws-1-ap-south-1.pooler.supabase.com
```

Problem:

- too technical;
- normal users do not understand database, fallback, hardcoded, seed, DB host;
- after DB-first switch, clicking desa detail feels frozen for several seconds.

Expected:

- use simple human language;
- keep navbar/footer/layout visible;
- main content should show loading/skeleton while data fetches;
- DB-backed pages should feel lighter and more responsive.

## Read first

- `docs/bmad/project-context.md`
- `docs/bmad/workflow.md`
- `docs/bmad/boundary-rules.md`
- `docs/bmad/sprint-status.md`
- `docs/bmad/tasks/sprint-03-004-db-first-all-displayed-data-batch.md`
- latest commit `5ccc8fbe410e8c674f858df55c1fc0aba2c10327`

## Scope

### A. User-friendly copy

Search all public UI for technical terms:

```bash
rg "database|Database|DB|fallback|hardcoded|seed|pooler|host|Supabase|koneksi DB|Jalankan seed|Data hardcoded" src
```

Replace public-facing copy with simple Indonesian.

Avoid showing:

- database / DB,
- fallback,
- hardcoded,
- seed,
- host / pooler,
- connection details.

Good examples:

```text
Data belum tersedia
Kami belum bisa menampilkan data untuk halaman ini. Coba muat ulang beberapa saat lagi.
```

```text
Data desa belum siap ditampilkan
Beberapa data desa masih sedang disiapkan. Silakan coba lagi nanti atau kembali ke daftar desa.
```

```text
Belum ada cerita warga
Cerita warga untuk halaman ini belum tersedia. Kamu bisa kembali lagi nanti.
```

Target routes/components:

- `/`
- `/desa`
- `/desa/[id]`
- `/desa/[id]/suara`
- `/suara-warga`
- `/suara`
- shared empty/unavailable components.

### B. Loading and route transition UX

Add lightweight loading states for slow DB-backed routes.

Prefer Next.js-native solutions:

- `loading.tsx`,
- Suspense boundaries,
- lightweight skeleton components,
- stable layout while main content loads,
- route/link prefetch if useful.

No new dependency unless Iwan approves.

Important routes:

- `/desa`
- `/desa/[id]`
- `/desa/[id]/suara`
- `/suara-warga`
- `/suara`

### C. DB read performance

Look for slow repeated DB calls or overfetching.

Allowed:

- use Prisma `select`/`include` more carefully;
- avoid repeated same query in one render;
- add safe cache/revalidate for public read-only demo/imported data;
- reduce payload size;
- avoid N+1 queries.

Do not reintroduce hardcoded displayed data fallback.

## Out of scope

- No schema change.
- No migration.
- No seed rerun unless explicitly requested.
- No new dependency unless approved.
- No official numeric APBDes extraction.
- No `verified` activation.
- No scraper/scheduler.
- No unrelated redesign.
- No auth/voice schema changes.

## Acceptance criteria

1. Public UI no longer shows technical DB/fallback/hardcoded/seed/host copy.
2. No public page shows DB host alias.
3. Empty/unavailable states use simple Indonesian.
4. `/desa/[id]` has visible loading state while fetching.
5. `/desa`, `/suara-warga`, and `/suara` have appropriate loading/empty states.
6. Layout feels stable during navigation.
7. Clicking desa detail no longer feels like app is frozen.
8. DB reads are reviewed for repeated queries/overfetching.
9. DB-first displayed data behavior remains.
10. No hardcoded displayed data fallback is reintroduced.
11. Mock/demo values remain clearly flagged where displayed.
12. No `verified` activation.
13. No new dependency.

## QA

Run:

```bash
npx prisma validate
npx tsc --noEmit
npm run test
npm run build
```

Route checks:

- `/`
- `/desa`
- `/desa?cari=ancolmekar`
- `/desa/ancolmekar`
- `/desa/4`
- `/suara-warga`
- `/suara`

Also report a short perceived performance note for clicking from `/desa` to a detail page.

## Commit message requirement

Commit message must include:

```text
What changed:
- ...

QA:
- prisma validate: PASS
- tsc: PASS
- test: PASS
- build: PASS
- route checks: PASS

Guardrails:
- no schema/migration change
- no seed rerun
- no verified status
- no official numeric APBDes extraction
- no scraper/scheduler
- no new dependency
- DB-first displayed data policy remains

Performance note:
- ...

Known risks:
- ...
```

## Report back

```text
Task: Sprint 03-005 User-friendly Empty + Loading Performance
Status: PASS / REWORK / BLOCKED
Routes checked:
- /:
- /desa:
- /desa?cari=ancolmekar:
- /desa/ancolmekar:
- /desa/4:
- /suara-warga:
- /suara:
QA:
- prisma validate:
- tsc:
- test:
- build:
Copy check:
- technical public terms removed: yes/no
Loading check:
- detail route loading visible: yes/no
Performance note:
- ...
Files changed:
Commit SHA(s):
Known risks/blockers:
```

## Short handoff

```text
Ujang, pull latest main, read docs/bmad/tasks/sprint-03-005-user-friendly-empty-loading-performance.md, execute as one UX/performance batch, run QA/guardrails, commit with implementation note, push, then report commit SHA + QA/route summary. Do not widen scope beyond the task file.
```

If Asep takes over:

```text
Asep, pull latest main, read docs/bmad/tasks/sprint-03-005-user-friendly-empty-loading-performance.md, continue from latest commit, keep the same scope/guardrails, run QA, commit/push only necessary fixes, then report commit SHA + QA/route summary.
```

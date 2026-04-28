# Task Sprint 03-005 — Loading, Caching, and Route Performance

Status: READY_FOR_UJANG_ASEP_EXECUTION
Executor: Ujang / Asep
Prepared-by: Rangga
Date: 2026-04-28

## Goal

Improve the DB-first user experience after Sprint 03-004 by making route transitions feel responsive and DB-backed pages lighter.

Rangga already patched the obvious public technical copy in:

- `src/components/desa/DesaListClient.tsx`
- `src/app/page.tsx`
- `src/app/suara/page.tsx`

So Ujang/Asep should focus on technical UX/performance:

1. route-level loading states;
2. lightweight skeletons/placeholders;
3. stable layout during navigation;
4. safe caching/revalidation for public read data;
5. reducing repeated DB calls and overfetching;
6. final sweep for any remaining public technical copy.

## Owner feedback

After DB-first switch, clicking from `/desa` to a desa detail can feel frozen for several seconds.

Expected behavior:

- click should feel immediate;
- navbar/footer/layout should remain stable;
- the main content area should show loading/skeleton while data is fetched;
- data fetch should be optimized so pages feel lighter;
- no new dependency unless Iwan approves.

## Read first

- `docs/bmad/project-context.md`
- `docs/bmad/workflow.md`
- `docs/bmad/boundary-rules.md`
- `docs/bmad/sprint-status.md`
- `docs/bmad/tasks/sprint-03-004-db-first-all-displayed-data-batch.md`
- latest DB-first commit `5ccc8fbe410e8c674f858df55c1fc0aba2c10327`
- latest copy cleanup commits:
  - `33b00e1bcd9bfbd32e69cef78f8b90940560a110`
  - `8cee693448e1b441c35720100095b8f28a227d9f`
  - `64c0a556c84b3c585035943b7b813fe7b04d0fa6`

## Scope

### A. Loading and route transition UX

Add lightweight loading states for slow DB-backed routes.

Prefer Next.js-native solutions:

- route-level `loading.tsx`,
- Suspense boundaries,
- lightweight skeleton components,
- stable layout while main content loads,
- route/link prefetch if useful.

Important routes:

- `/desa`
- `/desa/[id]`
- `/desa/[id]/suara`
- `/suara-warga`
- `/suara`

The user should not feel the app froze after clicking a desa card.

### B. Layout stability

Make sure persistent layout areas do not feel like they reload from zero.

Expected:

- navbar/footer remain stable;
- only main content shows loading state;
- no full-screen blank wait if avoidable.

### C. DB read performance

Look for slow repeated DB calls or overfetching.

Allowed:

- use Prisma `select`/`include` more carefully;
- avoid repeated same query in one render;
- add safe cache/revalidate for public read-only demo/imported data;
- reduce payload size;
- avoid N+1 queries;
- add server-side memoization/caching where safe.

Do not reintroduce hardcoded displayed data fallback.

### D. Final copy sweep

Rangga already patched the known technical copy.

Do a final sweep only:

```bash
rg "database|Database|DB:|fallback|hardcoded|seed demo|Jalankan seed|pooler|aws-1|Supabase|Prisma" src
```

If anything user-facing remains, replace with citizen-friendly Indonesian.

Technical comments/logs can remain if not visible to users.

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
- No reintroducing hardcoded displayed data fallback.

## Acceptance criteria

1. `/desa/[id]` has visible loading state while fetching.
2. `/desa`, `/suara-warga`, and `/suara` have appropriate loading/empty states.
3. Layout feels stable during navigation.
4. Clicking a desa detail no longer feels like app is frozen.
5. DB reads are reviewed for repeated queries/overfetching.
6. Safe caching/revalidation is added where appropriate.
7. DB-first displayed data behavior remains.
8. No hardcoded displayed data fallback is reintroduced.
9. Mock/demo values remain clearly flagged where displayed.
10. No public UI shows technical DB/fallback/hardcoded/seed/host copy.
11. No `verified` activation.
12. No new dependency.

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
- no hardcoded displayed data fallback reintroduced

Performance note:
- ...

Known risks:
- ...
```

## Report back

```text
Task: Sprint 03-005 Loading, Caching, and Route Performance
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
- remaining public technical terms removed: yes/no
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
Ujang, pull latest main, read docs/bmad/tasks/sprint-03-005-user-friendly-empty-loading-performance.md, focus on loading/skeleton, caching/revalidation, and DB route performance. Copy cleanup was already patched by Rangga, but do a final sweep. Run QA/guardrails, commit with implementation note, push, then report commit SHA + QA/route/performance summary. Do not widen scope beyond the task file.
```

If Asep takes over:

```text
Asep, pull latest main, read docs/bmad/tasks/sprint-03-005-user-friendly-empty-loading-performance.md, continue from latest commit, keep the same scope/guardrails, run QA, commit/push only necessary fixes, then report commit SHA + QA/route/performance summary.
```

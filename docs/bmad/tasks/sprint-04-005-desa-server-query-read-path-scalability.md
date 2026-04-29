# Task Sprint 04-005 — Data Desa Server Query Read Path Scalability

Status: READY_FOR_UJANG_AFTER_04_004_OR_OWNER_PRIORITY
Executor: Ujang / Asep
Prepared-by: Rangga
Date: 2026-04-29

## Recommended model for Ujang

```text
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
```

Why:

- This is a DB/read-path refactor with Prisma query shaping, pagination, searchParams, and SSR build-safety.
- It is not as risky as admin verification/security, but it can break public Data Desa routes if done carelessly.

Escalate to:

```text
Model: GPT-5.1
Reasoning effort: high
```

Only if Ujang finds:

- DB connection/runtime-only failures;
- Prisma query/type issues that are not obvious;
- route cache/build failures;
- severe performance regression;
- mismatch between `/desa`, `/desa?cari=...`, and `/desa/[id]`.

## Owner feedback

Owner reported:

```text
Ketergantungan mock data & pengambilan client-side – Banyak halaman utama (/desa, /desa/[id]) masih menggunakan mockDesa dan melakukan filter/sort di klien. Ini tidak skalabel jika dataset desa bertambah; transisi ke query server (misal getDesaListResult() yang membaca Prisma) perlu direncanakan agar build SSR tidak gagal karena DB belum tersedia.
```

## Rangga current-code check

Checked current `main` before writing this task.

Findings:

1. `/desa` already calls `getDesaListResult()` server-side, so the current feedback about `mockDesa` is not fully accurate for the latest code.
2. `/desa/[id]` already calls `getDesaByIdOrSlugWithFallback()` server-side.
3. However, `/desa` still sends the full `result.items` list into `DesaListClient`, and the client performs search/filter/sort/pagination in memory.
4. This is acceptable for small demo datasets but not scalable if PantauDesa grows to many desa.
5. `getDesaListResult()` currently has graceful unavailable/empty handling when Prisma/DB is missing, and that must be preserved.

## Goal

Move Data Desa list filtering/sorting/pagination toward server-side Prisma queries while preserving:

- DB-first public data;
- build/runtime safety when DB env is unavailable;
- user-friendly empty/unavailable states;
- `/desa?cari=...` homepage search prefill behavior;
- mobile UI and existing visual quality;
- no hardcoded/mock fallback.

## Scope

This task focuses on `/desa` list read path scalability.

Primary scope:

- `/desa`
- `src/lib/data/desa-read.ts`
- `src/components/desa/DesaListClient.tsx`
- `src/components/desa/SearchFilterBar.tsx`
- related types/tests

Secondary check only:

- `/desa/[id]` should remain DB-backed and not regress.

Do not redesign detail page in this task unless needed for type compatibility.

## Conflict prevention

Do not run this task in parallel with Sprint 04-004 admin claim verification service work if the same engineer is touching shared route/build/auth infra.

This task is separate from:

- admin claim verification;
- Resend email;
- website token verification;
- invite admin;
- fake admin report;
- AI review;
- upload service.

## Required direction

## A. Add server query input type

Update `getDesaListResult()` or add a new function to accept query parameters.

Suggested type:

```ts
type DesaListQuery = {
  cari?: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  status?: "semua" | "baik" | "sedang" | "rendah";
  sortField?: "nama" | "totalAnggaran" | "terealisasi" | "persentaseSerapan";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};
```

Allowed approach:

```ts
getDesaListResult(query?: DesaListQuery)
```

or:

```ts
getDesaListPageResult(query: DesaListQuery)
```

Keep naming consistent with existing code.

## B. Move search/filter/sort/pagination to Prisma where possible

Current client behavior:

- search in client;
- provinsi/kabupaten/kecamatan filter in client;
- status filter in client;
- sort in client;
- pagination in client.

Target:

- Prisma `where` for search and region filters;
- Prisma `orderBy` where supported;
- `skip/take` pagination;
- total count from DB;
- page metadata returned from server.

Important nuance:

Some displayed fields are computed after mapping, e.g. `persentaseSerapan` from latest summary.

If sorting/filtering by computed/mapped field is not simple in Prisma:

- use reasonable DB-side equivalent where possible;
- otherwise document safe temporary limitation;
- do not pull thousands of rows and sort all on the client.

## C. Return paginated result shape

Add result shape similar to:

```ts
interface DesaListReadResult {
  items: DesaListItem[];
  state: DesaReadState;
  message: string;
  dbHostAlias: string;
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
  filters: {
    provinsi: string[];
    kabupaten: string[];
    kecamatan: string[];
  };
}
```

Keep existing fields compatible where possible.

## D. Preserve DB unavailable safety

Current `getDesaListResult()` handles missing Prisma/DB by returning empty/unavailable states instead of crashing.

This behavior is mandatory.

Requirements:

- if `prisma` is unavailable, return `state = unavailable`;
- do not throw during build because DB env is missing;
- do not reintroduce hardcoded fallback data;
- keep user-friendly message;
- route should still render safe empty/unavailable UI.

## E. URL/searchParams driven state

`/desa` should use URL search params as the source of truth for query state.

Expected URL examples:

```text
/desa?cari=ancolmekar
/desa?provinsi=Jawa%20Barat
/desa?kabupaten=Bandung
/desa?kecamatan=Arjasari
/desa?status=baik
/desa?sortField=nama&sortOrder=asc
/desa?page=2
```

Client component should update URL/query when filters change rather than filtering a huge array locally.

Options:

- use `router.push` / `useSearchParams` in client;
- or submit forms/links;
- keep UX responsive.

## F. Keep client component lean

After refactor, `DesaListClient` should mainly handle:

- UI controls;
- view mode grid/table;
- calling router navigation on filter changes;
- rendering items already filtered/paginated by server.

It should not do full dataset filtering/sorting/pagination in memory.

Allowed client-side small logic:

- selected UI state sync;
- view mode toggle;
- local loading state if needed;
- small derived display from already paginated items.

## G. Region filter options from DB

Current filters derive options from the current client array. That becomes wrong once results are paginated.

Server result should include available filter options.

Minimum acceptable:

- distinct provinsi from DB;
- distinct kabupaten based on selected provinsi if any;
- distinct kecamatan based on selected provinsi/kabupaten if any.

No schema migration required.

Use existing `Desa` table fields.

## H. Detail page check

`/desa/[id]` already reads DB via `getDesaByIdOrSlugWithFallback()`.

Task should only ensure:

- no mock import is reintroduced;
- detail route still handles missing DB gracefully;
- `generateMetadata` does not crash if DB unavailable;
- `/desa/4` and `/desa/ancolmekar` still work as expected.

## I. Build/SSR safety

Because some environments may not have DB env during build, ensure:

- route remains dynamic if necessary;
- no `generateStaticParams` DB call causes build failure;
- metadata generation catches unavailable DB safely;
- public route renders an unavailable/empty UI instead of crashing.

## J. Tests

Add or update tests for the query parser/helper if project test structure supports it.

Test cases:

- default query;
- search term;
- invalid page falls back to 1;
- invalid sort field falls back to safe default;
- invalid status falls back to `semua`;
- missing DB returns unavailable result if testable;
- URL params parse into query shape.

## Out of scope

Do not implement:

- admin claim service;
- email/Resend changes;
- website token check;
- screenshot storage;
- AI review;
- official numeric extraction;
- new schema/migration;
- seed reset;
- new dependency;
- broad UI redesign.

## QA requirements

Run:

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run test
npm run build
```

Route checks:

```text
/desa
/desa?cari=ancolmekar
/desa?provinsi=Jawa%20Barat
/desa?kabupaten=Bandung
/desa?kecamatan=Arjasari
/desa?status=baik
/desa?sortField=nama&sortOrder=asc
/desa?page=2
/desa/ancolmekar
/desa/4
```

Performance/data checks:

- verify `/desa` no longer fetches entire dataset just to filter/sort/page on client;
- verify page size is respected server-side;
- verify total count is DB-backed;
- verify filter options are DB-backed;
- verify no hardcoded/mock fallback is reintroduced.

Manual UI checks if UI behavior changes:

- desktop `/desa`;
- mobile `/desa` at 360/390/414;
- search from homepage to `/desa?cari=...` still pre-fills and works.

Screenshot rule:

- if UI layout is changed, capture before/after screenshots or notes;
- do not commit screenshots unless Owner/Iwan explicitly requests;
- keep local screenshots in ignored artifact folder, e.g. `.artifacts/screenshots/sprint-04-005/`.

## Acceptance criteria

1. `/desa` query state is server-driven via searchParams.
2. Search/filter/sort/page are moved to server/Prisma where feasible.
3. Client no longer filters/sorts/paginates the full dataset in memory.
4. DB-backed total count and pagination metadata are returned.
5. DB-backed filter option lists are returned.
6. `/desa?cari=...` still works from homepage search.
7. `/desa/[id]` remains DB-backed and stable.
8. Missing/unavailable DB does not crash build or route render.
9. No hardcoded/mock fallback is reintroduced.
10. No schema/migration.
11. No new dependency.
12. QA passes.
13. Manual UI checks reported if UI changed.

## Commit message requirement

```text
refactor(desa): move list filters to server query read path

What changed:
- ...

Data/read path:
- server query params: PASS
- Prisma where/order/pagination: PASS
- DB-backed totals: PASS
- DB-backed region filters: PASS
- client full-list filter removed: PASS

SSR/build safety:
- missing DB safe state: PASS
- no mock fallback: PASS
- generate metadata safe: PASS

QA:
- prisma validate: PASS
- prisma generate: PASS
- tsc: PASS
- test: PASS
- build: PASS
- route checks: PASS

UI evidence if changed:
- desktop /desa: PASS/SKIPPED with reason
- mobile /desa 360/390/414: PASS/SKIPPED with reason

Guardrails:
- no schema/migration
- no seed reset
- no new dependency
- no admin claim/email/token changes
- no verified data activation
- no numeric extraction

Known risks/blockers:
- ...
```

## Report back

```text
Task: Sprint 04-005 Data Desa Server Query Read Path Scalability
Status: PASS / REWORK / BLOCKED
Model used:
Reasoning effort:
Routes checked:
- /desa:
- /desa?cari=ancolmekar:
- /desa?provinsi=...:
- /desa?kabupaten=...:
- /desa?kecamatan=...:
- /desa?status=baik:
- /desa?page=2:
- /desa/ancolmekar:
- /desa/4:
Data/read path:
- server query:
- client full-list filtering removed:
- DB total count:
- DB region filters:
SSR/build safety:
- missing DB safe:
- no mock fallback:
QA:
- prisma validate:
- prisma generate:
- tsc:
- test:
- build:
UI evidence if changed:
- screenshot folder/notes:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

## Short handoff

```text
Ujang, pull latest main and read docs/bmad/tasks/sprint-04-005-desa-server-query-read-path-scalability.md fully. Use GPT-5.1 Codex mini with medium reasoning. Refactor `/desa` so search/filter/sort/pagination are server/Prisma-driven through searchParams instead of filtering/sorting the full dataset in `DesaListClient`. Preserve DB-unavailable safe state so build/SSR does not crash when DB env is missing. Keep `/desa?cari=...`, `/desa/ancolmekar`, and `/desa/4` working. Do not touch admin claim/email/token services, schema, seed, AI, verified data, or numeric extraction. Run QA/route checks and report whether client full-list filtering was removed. If UI changes, capture desktop/mobile screenshot notes but do not commit screenshots.
```

If Asep takes over:

```text
Asep, pull latest main and read docs/bmad/tasks/sprint-04-005-desa-server-query-read-path-scalability.md fully. Continue only the Data Desa server query/read-path scalability scope. Do not widen into admin claim or UI redesign. Keep build/SSR safety and DB unavailable fallback intact.
```

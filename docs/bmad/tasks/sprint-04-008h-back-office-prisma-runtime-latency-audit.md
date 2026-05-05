# Sprint 04-008H — Back Office Prisma Runtime Latency Audit

## Status
READY FOR EXECUTION — audit only, no migration/index without owner approval.

## Context
Back office `/profil/admin-desa/dokumen` masih terasa lambat di local.

Previous app-level logs showed:

```text
[perf][back-office] route=admin-desa.layout step=auth() durationMs=330
[perf][back-office] route=admin-desa.dokumen step=auth() durationMs=330
[perf][back-office] route=admin-desa.context step=desaAdminMember.findFirst durationMs=1661
[perf][back-office] route=admin-desa.dokumen step=adminDesaDocument.findMany durationMs=1278
```

But valid non-zero `EXPLAIN ANALYZE` showed raw SQL execution is fast in the local dataset:

```text
desa_admin_members context lookup: Execution Time ~0.210ms
admin_desa_documents list: Execution Time ~0.240ms
```

This means the current evidence does **not** prove DB index/migration as the immediate fix. The bottleneck likely sits between the app perf wrapper and raw DB execution.

## Goal
Find why Prisma/app-level timing reports 1–2 seconds while raw SQL EXPLAIN reports less than 1ms.

## Hard Boundaries
Do not:
- Merge to `main`.
- Create migration.
- Add DB index.
- Install third-party observability/performance packages.
- Change approval/reject admin desa logic.
- Change role/status admin desa logic.
- Change upload document logic.
- Change notification logic.
- Change claim verification or renewal logic.
- Add persistent cache for sensitive back office data.
- Move sensitive back office fetching to client.
- Log PII or sensitive values.

## Evidence To Preserve
Update this report with every finding:

```text
docs/bmad/reports/back-office-performance-audit.md
```

Do not create a separate report unless owner requests it.

## Tasks

### Task 1 — Reproduce current app-level timing
Run:

```bash
PERF_DEBUG_BACK_OFFICE=true npm run dev
```

Open:

```text
http://localhost:3000/profil/admin-desa/dokumen
```

Record at least 3 runs after initial warm-up:
- first request after `npm run dev`
- second browser refresh
- third browser refresh

Capture these logs:
- `admin-desa.layout auth()`
- `admin-desa.dokumen auth()`
- `admin-desa.context desaAdminMember.findFirst`
- `admin-desa.dokumen adminDesaDocument.findMany`
- query-shape logs

### Task 2 — Add dev-only Prisma query duration logging
Add temporary dev-only logging for Prisma query events if supported by the current Prisma client setup.

Requirements:
- Log query duration only.
- Do not log raw SQL params.
- Do not log `userId`, `desaId`, email, token, document title, storage key, or document content.
- Keep behind dev or `PERF_DEBUG_BACK_OFFICE=true`.

Target output example:

```text
[perf][prisma] model=unknown action=query durationMs=12
```

If Prisma event logging exposes raw query/params by default, do not print params. Sanitize or skip query text.

### Task 3 — Split timing around Prisma call
For the two slow paths only, add temporary timing that separates:

1. before Prisma call
2. after Prisma promise resolves
3. row count / serialization mapping
4. page render handoff

Target paths:

```text
src/lib/data/admin-desa-context.ts
src/app/profil/admin-desa/dokumen/page.tsx
```

Target logs should stay privacy-safe:

```text
[perf][back-office] route=admin-desa.context step=beforePrisma durationMs=0
[perf][back-office] route=admin-desa.context step=afterPrisma rows=1 durationMs=...
[perf][back-office] route=admin-desa.dokumen step=afterPrisma rows=7 durationMs=...
[perf][back-office] route=admin-desa.dokumen step=serializeRows count=7 durationMs=...
```

Do not change business logic or result shape.

### Task 4 — Check RSC/request duplication
Use browser Network tab and terminal logs.

Check:
- Are there repeated `_rsc` requests?
- Is `/profil/admin-desa/dokumen` rendered more than once per navigation?
- Are layout and page both calling `auth()`?
- Is `getAdminDesaContext()` deduped by `React.cache()` as expected?
- Does first load differ materially from second/third refresh?

Document findings in the report.

### Task 5 — Compare 3 layers side-by-side
Update `docs/bmad/reports/back-office-performance-audit.md` with a table:

```md
| Layer | Context query | Document query | Notes |
|---|---:|---:|---|
| App perf wrapper | ...ms | ...ms | Existing perfLog result |
| Prisma query event | ...ms | ...ms | Query/runtime duration if available |
| Raw SQL EXPLAIN | 0.210ms | 0.240ms | DB execution only |
```

Conclusion must state which layer is slow:
- DB execution
- Prisma query event / connection layer
- app wrapper / render layer
- RSC duplicate request layer
- still inconclusive

### Task 6 — Update recommendations
Update report recommendations:

P0 should focus on confirmed runtime issue, not migration.

Examples:
- If Prisma event duration is high: investigate connection pooling, DATABASE_URL vs DIRECT_URL, Supabase region, Prisma runtime cold start.
- If Prisma event duration is low but app wrapper is high: inspect RSC duplication, serialization, route waterfall, duplicate `auth()`.
- If only first request is high: document as cold start/module/db connection issue.
- If every request is high: continue deeper runtime/network audit.

Keep DB index proposals as production-scale candidates only, unless new evidence proves otherwise.

### Task 7 — Quality checks
Run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Update report with pass/fail.

If build fails because Google Fonts/network is unavailable, write that explicitly.

## Expected Deliverables
1. Updated:

```text
docs/bmad/reports/back-office-performance-audit.md
```

2. No migration file.
3. No schema index changes.
4. No business logic change.
5. No third-party package.
6. Clear next recommendation based on evidence.

## Acceptance Criteria
This task is complete when:
- App perf wrapper, Prisma query event, and raw SQL EXPLAIN are compared.
- First vs repeated request timing is documented.
- RSC duplicate request check is documented.
- Report clearly explains why raw SQL is fast but page/app timing is slow.
- Migration/index remains blocked unless evidence changes.

# Back Office Performance Audit

**Sprint:** 04-008F
**Branch:** `fix/mobile-suara-profile-admin-access-polish`
**Date:** 2026-05-05
**Status:** DB QUERY PLAN AUDIT IN PROGRESS — root cause narrowed to back-office DB queries; migration pending owner approval

---

## 1. Executive Summary

Latest local evidence shows `auth()` is **not** the bottleneck for `/profil/admin-desa/dokumen`.
The slow path is now isolated to two back-office database queries:

| Route / Step | Latest local duration | Interpretation |
|---|---:|---|
| `/profil/admin-desa/dokumen` → `auth()` | 36ms | Healthy; not the primary bottleneck |
| `admin-desa.context` → `desaAdminMember.findFirst` | 1648ms | Primary bottleneck candidate |
| `admin-desa.dokumen` → `adminDesaDocument.findMany` | 1298ms | Primary bottleneck candidate |
| `/desa` public page load | ~320ms | Public query path is materially faster |

Current conclusion: Phase 1 instrumentation was useful, but the root cause is **not auth latency**.
The remaining evidence points to back-office query plans: missing or non-covering compound indexes,
expensive ordering, and relation joins on queries that run before the main page can render.

No UI refactor, business-logic change, or migration is included in this audit update.

---

## 2. Instrumentation Status

**File:** `src/lib/perf.ts`

Helper functions (dev-only, opt-in via `PERF_DEBUG_BACK_OFFICE=true`):
- `perfEnabled()` — `true` when `NODE_ENV !== "production"` or env var is set
- `perfStart()` / `perfLog(route, step, timestamp)` — duration logging
- `perfTime(route, step, fn)` — async wrapper
- `perfQueryShape(route, query, shape)` — query-shape logging without values

**Duration format:**

```text
[perf][back-office] route=<route> step=<step> durationMs=<number>
```

**Query-shape format:**

```text
[perf][back-office] route=<route> query=<model.method> shape=<static-shape>
```

**Privacy:** Do not log `userId`, `desaId`, `email`, token, session data, storage keys, document content,
or raw query parameters. Query-shape strings are static descriptors only.

---

## 3. Latest Local Measurement Evidence

### 3.1 `/profil/admin-desa/dokumen`

Observed latest local timings:

```text
route=/profil/admin-desa/dokumen step=auth() durationMs=36
route=admin-desa.context step=desaAdminMember.findFirst durationMs=1648
route=admin-desa.dokumen step=adminDesaDocument.findMany durationMs=1298
```

Interpretation:

1. `auth()` at 36ms is well below the target budget and does not explain multi-second render time.
2. `desaAdminMember.findFirst` at 1648ms blocks all admin-desa pages because it resolves membership context.
3. `adminDesaDocument.findMany` at 1298ms is page-specific additional latency for the documents tab.
4. Combined DB time for the two critical queries is ~2946ms before considering React render, network,
   hydration, or browser work.

### 3.2 `/desa` public comparison

Observed latest local timing:

```text
route=/desa public load durationMs≈320
```

Key difference from back office:

- Public `/desa` reads broad public data with existing indexes on relation tables (`desaId`, `[desaId, tahun]`, etc.).
- Back office `/profil/admin-desa/dokumen` starts with personalized membership lookup by `userId + status`,
  but `DesaAdminMember` currently has only `@@unique([desaId, userId])` and `@@index([desaId, status])`.
- Back office documents are filtered by `desaId` but ordered by `status ASC, createdAt DESC`; current
  `AdminDesaDocument` indexes are single-column `desaId`, `status`, and `uploadedById`, so the DB may need
  an additional sort or bitmap/index combination instead of scanning in final order.

---

## 4. Query Shapes Under Audit

### 4.1 `getAdminDesaContext` / `desaAdminMember.findFirst`

Prisma shape:

```ts
await db.desaAdminMember.findFirst({
  where: {
    userId,
    status: { in: ["LIMITED", "VERIFIED"] },
  },
  orderBy: { updatedAt: "desc" },
  select: {
    id: true,
    desaId: true,
    role: true,
    status: true,
    joinedAt: true,
    invitedAt: true,
    acceptedAt: true,
    verifiedById: true,
    renewalDueAt: true,
    revokedAt: true,
    revokedReason: true,
    desa: { select: { id: true, nama: true, slug: true, kecamatan: true, kabupaten: true, provinsi: true, websiteUrl: true } },
    user: { select: { id: true, nama: true, username: true, email: true, avatarUrl: true } },
  },
});
```

Sanitized runtime shape log:

```text
[perf][back-office] route=admin-desa.context query=desaAdminMember.findFirst shape=where:userId,statusIn(LIMITED,VERIFIED);orderBy:updatedAtDesc;take:1;join:desa,user;select:memberContextFields
```

Expected SQL skeleton for EXPLAIN (values intentionally redacted):

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT m.id, m."desaId", m.role, m.status, m."joinedAt", m."invitedAt", m."acceptedAt",
       m."verifiedById", m."renewalDueAt", m."revokedAt", m."revokedReason",
       d.id, d.nama, d.slug, d.kecamatan, d.kabupaten, d.provinsi, d."websiteUrl",
       u.id, u.nama, u.username, u.email, u."avatarUrl"
FROM desa_admin_members m
JOIN desa d ON d.id = m."desaId"
JOIN users u ON u.id = m."userId"
WHERE m."userId" = '<redacted-user-id>'
  AND m.status IN ('LIMITED', 'VERIFIED')
ORDER BY m."updatedAt" DESC
LIMIT 1;
```

Index coverage today:

| Existing index | Helps this query? | Gap |
|---|---|---|
| `@@unique([desaId, userId])` | No, leading column is `desaId`; query starts with `userId` | Cannot seek efficiently by `userId` alone |
| `@@index([desaId, status])` | No, leading column is `desaId`; query starts with `userId` | Cannot cover `userId + status` |

Likely plan risk: sequential scan or inefficient scan over `desa_admin_members`, followed by filter on
`userId/status` and sort by `updatedAt DESC` before `LIMIT 1`.

### 4.2 `/profil/admin-desa/dokumen` / `adminDesaDocument.findMany`

Prisma shape:

```ts
await db.adminDesaDocument.findMany({
  where: { desaId: ctx.desa.id },
  orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  take: 100,
  select: {
    id: true,
    title: true,
    category: true,
    fileName: true,
    fileType: true,
    fileSize: true,
    status: true,
    approvedAt: true,
    publishedAt: true,
    failedReason: true,
    rejectedReason: true,
    createdAt: true,
    uploadedById: true,
    uploadedBy: { select: { id: true, nama: true, username: true, email: true } },
  },
});
```

Sanitized runtime shape log:

```text
[perf][back-office] route=admin-desa.dokumen query=adminDesaDocument.findMany shape=where:desaId;orderBy:statusAsc,createdAtDesc;take:100;join:uploadedBy;select:listFields
```

Expected SQL skeleton for EXPLAIN (values intentionally redacted):

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT doc.id, doc.title, doc.category, doc."fileName", doc."fileType", doc."fileSize",
       doc.status, doc."approvedAt", doc."publishedAt", doc."failedReason", doc."rejectedReason",
       doc."createdAt", doc."uploadedById",
       uploader.id, uploader.nama, uploader.username, uploader.email
FROM admin_desa_documents doc
LEFT JOIN users uploader ON uploader.id = doc."uploadedById"
WHERE doc."desaId" = '<redacted-desa-id>'
ORDER BY doc.status ASC, doc."createdAt" DESC
LIMIT 100;
```

Index coverage today:

| Existing index | Helps this query? | Gap |
|---|---|---|
| `@@index([desaId])` | Partially filters rows for one desa | Does not satisfy `ORDER BY status, createdAt` |
| `@@index([status])` | Not useful when filtering by `desaId` first | May require combining/sorting |
| `@@index([uploadedById])` | Helps relation lookup from document to user only in other access patterns | Not relevant for filter/order |

Likely plan risk: index scan by `desaId` followed by explicit sort on `status ASC, createdAt DESC`, or a
bitmap scan plus sort. This can become expensive as one desa accumulates documents.

---

## 5. EXPLAIN ANALYZE Status

### 5.1 Agent environment result

Attempted in the agent environment on 2026-05-05:

```bash
node - <<'NODE'
if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  console.error('EXPLAIN_ANALYZE_SKIPPED: DATABASE_URL/DIRECT_URL unset in agent environment')
  process.exit(2)
}
NODE
```

Result:

```text
EXPLAIN_ANALYZE_SKIPPED: DATABASE_URL/DIRECT_URL unset in agent environment
```

So this patch does **not** claim a captured Supabase execution plan. The query-plan run is blocked in the
agent environment because no local/Supabase database URL is available. The SQL skeletons above are ready to
run locally with redacted parameters. The migration decision should wait for owner-approved EXPLAIN output.

### 5.2 What to capture before approving migration

For each query, capture:

- Scan type: `Seq Scan`, `Index Scan`, `Bitmap Index Scan`, `Bitmap Heap Scan`
- Sort node: whether `Sort` appears, sort method, memory/disk usage
- Rows removed by filter
- Actual time and row counts per node
- Buffer reads/hits
- Whether joins to `desa` and `users` are cheap primary-key lookups

A migration is only justified after the plan confirms either:

1. `desa_admin_members` is not using an index compatible with `userId + status`, or
2. `admin_desa_documents` must sort filtered rows because no index matches `desaId + status + createdAt`.

---

## 6. DB Index Proposals — Evidence Before Migration

> **Do NOT create a migration until this report is approved.**

### Proposal A — Admin Desa context lookup

```prisma
model DesaAdminMember {
  @@index([userId, status])
}
```

Query helped:

```text
WHERE userId = ? AND status IN ('LIMITED', 'VERIFIED')
ORDER BY updatedAt DESC
LIMIT 1
```

Risk: LOW. New read index on existing columns, no data change.

Expected benefit: turns the slow context lookup into a selective index scan by `userId + status`.

Open question: because the query also orders by `updatedAt DESC`, EXPLAIN may show that
`[userId, status, updatedAt]` would be even better. The requested safe proposal is `[userId, status]`;
final migration should be chosen after real plan data.

### Proposal B — Document list by desa + created date

```prisma
model AdminDesaDocument {
  @@index([desaId, createdAt])
}
```

Query helped:

```text
WHERE desaId = ?
ORDER BY createdAt DESC
```

Risk: LOW. Useful for any documents list that only needs newest documents per desa.

Expected benefit: helps newest-first variants, but does not fully match the current tab order
`status ASC, createdAt DESC`.

### Proposal C — Document list by desa + status + created date

```prisma
model AdminDesaDocument {
  @@index([desaId, status, createdAt])
}
```

Query helped:

```text
WHERE desaId = ?
ORDER BY status ASC, createdAt DESC
LIMIT 100
```

Risk: LOW to MEDIUM. Read index on existing columns, but more write overhead than Proposal B.

Expected benefit: best match for the current `/profil/admin-desa/dokumen` query shape because it filters
by `desaId` and orders by `status + createdAt`. If Postgres uses this index for ordered retrieval, it can
avoid a separate sort for the first 100 rows.

Open question: Prisma/Postgres index sort direction should be reviewed before migration. If the planner
cannot use an ascending `createdAt` index efficiently for `createdAt DESC`, migration may need explicit
sort direction support in Prisma schema or raw SQL.

---

## 7. Why `/desa` Can Load Around 320ms

Public `/desa` uses `getDesaListResult()` → `fetchDesaRecords()` and reads a public data graph:

- `desa.findMany` ordered by `provinsi`, `kabupaten`, `nama`
- relation reads for `dataSources`
- `anggaranSummaries` with `take: 1`, ordered by `tahun DESC`
- `apbdesItems`
- `dokumenPublik`

Relevant existing indexes:

- `anggaran_desa_summaries`: `@@unique([desaId, tahun])`
- `apbdes_items`: `@@index([desaId, tahun])`
- `dokumen_publik`: `@@index([desaId, tahun])`
- `data_sources`: `@@index([desaId])`

Back office differs because the first blocking query is personalized and starts from `userId`, while the
existing `DesaAdminMember` compound indexes start from `desaId`. Then the documents page sorts by a compound
order that no existing `AdminDesaDocument` compound index satisfies.

---

## 8. Prioritized Recommendations

### P0 — safest next step after EXPLAIN confirms plan

1. Add an index for `DesaAdminMember` context lookup. Requested proposal: `[userId, status]`.
2. Add an index for `AdminDesaDocument` matching the active documents tab query. Requested proposal:
   `[desaId, status, createdAt]`.
3. Keep query-shape logging enabled in development/staging until post-index measurements show main data
   renders under 1 second.

### P1 — small refactor only after P0 evidence

1. Consider trimming `getAdminDesaContext` relation select if the layout does not need all user/desa fields.
2. Consider splitting document list relation data so uploader fields are fetched only where displayed.
3. Consider request-level streaming boundaries so the shell/shimmer appears under 1 second even when DB is slow.

### P2 — infra / third party only if query/index fixes are insufficient

1. Review Supabase connection pooling and region if indexed queries still exceed 500–800ms.
2. Consider Prisma Accelerate only after query plans are healthy and network/connection latency remains proven.
3. Consider OpenTelemetry (`@vercel/otel`) after manual perf logs become insufficient for ongoing diagnosis.

---

## 9. Acceptance Checklist

- [x] Latest local measurement evidence added
- [x] Query-shape logging added for `getAdminDesaContext` / `desaAdminMember.findFirst`
- [x] Query-shape logging added for `/profil/admin-desa/dokumen` / `adminDesaDocument.findMany`
- [x] Query shapes avoid logging `userId`, `desaId`, or `email` values
- [x] No UI refactor
- [x] No business logic change
- [x] No migration added
- [x] Index proposals documented without migration
- [x] Public `/desa` query path compared with back-office path
- [ ] Real Supabase `EXPLAIN ANALYZE` captured — blocked in agent env because `DATABASE_URL`/`DIRECT_URL` is unset
- [x] `npm run lint` — passed 2026-05-05
- [x] `npx tsc --noEmit` — passed 2026-05-05
- [ ] `npm run build` — attempted 2026-05-05; blocked by Google Fonts fetch failure for `Inter` in this environment

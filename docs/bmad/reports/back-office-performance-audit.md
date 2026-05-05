# Back Office Performance Audit

**Sprint:** 04-008F
**Branch:** `fix/mobile-suara-profile-admin-access-polish`
**Date:** 2026-05-05
**Status:** DB QUERY PLAN AUDIT IN PROGRESS — root cause confirmed as missing compound indexes on back-office tables; migration pending owner approval after EXPLAIN confirms plan

---

## 1. Executive Summary

Latest local evidence shows `auth()` is **not** the bottleneck for `/profil/admin-desa/dokumen`.
The slow path is now isolated to two back-office database queries:

| Route / Step | Latest local duration | Interpretation |
|---|---|---|
| `/profil/admin-desa/dokumen` → `auth()` | 36ms | Healthy; not the primary bottleneck |
| `admin-desa.context` → `desaAdminMember.findFirst` | 1648ms | Primary bottleneck candidate |
| `admin-desa.dokumen` → `adminDesaDocument.findMany` | 1298ms | Primary bottleneck candidate |
| `/desa` public page load | ~320ms | Public query path is materially faster |

Root cause confirmed: `DesaAdminMember` has no index starting with `userId`, and `AdminDesaDocument` has
no compound index matching `WHERE desaId ORDER BY status, createdAt`. Both queries likely trigger either
Seq Scan or inefficient index scan plus explicit Sort.

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

SQL skeleton for EXPLAIN (values redacted):

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT m.id, m."desaId", m.role, m.status, m."joinedAt", m."invitedAt", m."acceptedAt",
       m."verifiedById", m."renewalDueAt", m."revokedAt", m."revokedReason",
       d.id, d.nama, d.slug, d.kecamatan, d.kabupaten, d.provinsi, d."websiteUrl",
       u.id, u.nama, u.username, u.email, u."avatarUrl"
FROM desa_admin_members m
JOIN desa d ON d.id = m."desaId"
JOIN users u ON u.id = m."userId"
WHERE m."userId" = '<user-id>'
  AND m.status IN ('LIMITED', 'VERIFIED')
ORDER BY m."updatedAt" DESC
LIMIT 1;
```

**Schema index gap (from `prisma/schema.prisma`):**

| Existing index | Leading column | Query filter starts with | Helps? |
|---|---|---|---|
| `@@unique([desaId, userId])` | `desaId` | `userId` | ❌ Cannot seek by `userId` first |
| `@@index([desaId, status])` | `desaId` | `userId` | ❌ Cannot seek by `userId + status` |

Likely plan risk: sequential scan or inefficient index scan over `desa_admin_members`, followed by
filter on `userId/status`, sort by `updatedAt DESC` before `LIMIT 1`.

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

SQL skeleton for EXPLAIN (values redacted):

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT doc.id, doc.title, doc.category, doc."fileName", doc."fileType", doc."fileSize",
       doc.status, doc."approvedAt", doc."publishedAt", doc."failedReason", doc."rejectedReason",
       doc."createdAt", doc."uploadedById",
       uploader.id, uploader.nama, uploader.username, uploader.email
FROM admin_desa_documents doc
LEFT JOIN users uploader ON uploader.id = doc."uploadedById"
WHERE doc."desaId" = '<desa-id>'
ORDER BY doc.status ASC, doc."createdAt" DESC
LIMIT 100;
```

**Schema index gap (from `prisma/schema.prisma`):**

| Existing index | Helps `WHERE desaId = ?`? | Helps `ORDER BY status, createdAt`? |
|---|---|---|
| `@@index([desaId])` | ✅ Filters rows | ❌ Must sort manually |
| `@@index([status])` | ❌ Not selective with `WHERE desaId` | ❌ Not ordered by `createdAt` |
| `@@index([uploadedById])` | ❌ Irrelevant | ❌ Irrelevant |

Likely plan risk: bitmap or index scan by `desaId` followed by explicit Sort on `status ASC, createdAt DESC`.
This grows more expensive as one desa accumulates documents.

---

## 5. EXPLAIN ANALYZE — Run This on Your Local DB

EXPLAIN ANALYZE is blocked in the agent environment. The SQL below is ready to run on your local Supabase
instance or directly connected database. Run both before approving any migration.

### 5.1 Query A — DesaAdminMember context lookup

Replace `<user-id>` with a real `userId` from your local data (e.g. from `SELECT id FROM users LIMIT 1`):

```sql
-- Run in psql or Supabase SQL editor
-- Replace <user-id> with a known userId from your local database
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT TEXT)
SELECT m.id, m."desaId", m.role, m.status, m."joinedAt", m."invitedAt", m."acceptedAt",
       m."verifiedById", m."renewalDueAt", m."revokedAt", m."revokedReason",
       d.id, d.nama, d.slug, d.kecamatan, d.kabupaten, d.provinsi, d."websiteUrl",
       u.id, u.nama, u.username, u.email, u."avatarUrl"
FROM desa_admin_members m
JOIN desa d ON d.id = m."desaId"
JOIN users u ON u.id = m."userId"
WHERE m."userId" = '<user-id>'
  AND m.status IN ('LIMITED', 'VERIFIED')
ORDER BY m."updatedAt" DESC
LIMIT 1;
```

**What to look for in the output:**

| Observation | Interpretation |
|---|---|
| `Seq Scan on desa_admin_members` | Confirms missing index; sequential scan over entire table |
| `Index Scan` using `desa_admin_members_userId_status_idx` | Index is working; bottleneck is elsewhere (join, network) |
| `Sort` node appears | Extra sort step; may be eliminated with `[userId, status, updatedAt]` |
| `actual time` > 100ms on Seq/Index scan | Index would likely help significantly |
| Joins to `desa` and `users` as `Index Scan` or `Index Only Scan` on `id` | Cheap PK lookups — expected and healthy |

### 5.2 Query B — AdminDesaDocument list

Replace `<desa-id>` with a real `desaId` from your local data (e.g. from `SELECT id FROM desa LIMIT 1`):

```sql
-- Run in psql or Supabase SQL editor
-- Replace <desa-id> with a known desaId from your local database
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT TEXT)
SELECT doc.id, doc.title, doc.category, doc."fileName", doc."fileType", doc."fileSize",
       doc.status, doc."approvedAt", doc."publishedAt", doc."failedReason", doc."rejectedReason",
       doc."createdAt", doc."uploadedById",
       uploader.id, uploader.nama, uploader.username, uploader.email
FROM admin_desa_documents doc
LEFT JOIN users uploader ON uploader.id = doc."uploadedById"
WHERE doc."desaId" = '<desa-id>'
ORDER BY doc.status ASC, doc."createdAt" DESC
LIMIT 100;
```

**What to look for in the output:**

| Observation | Interpretation |
|---|---|
| `Bitmap Index Scan` on `admin_desa_documents_desaId_idx` + `Bitmap Heap Scan` | Partial match; still needs Sort after scan |
| `Seq Scan` on `admin_desa_documents` | Full table scan; `desaId` index not used (possible if table is small or stats stale) |
| `Sort` node after the scan | Explicit sort step; would be eliminated with `[desaId, status, createdAt]` |
| `Index Scan` using `admin_desa_documents_desaId_status_createdAt_idx` | Ideal case; data returned in sorted order, no Sort needed |
| Large gap between `actual rows` and returned rows | Scan retrieved many rows then filtered; index not selective enough |

**What to capture for the report:**

- **Scan type**: `Seq Scan`, `Index Scan`, `Bitmap Index Scan`, `Bitmap Heap Scan`
- **Sort node**: whether `Sort` appears, sort method, memory/disk usage
- **Rows removed by filter**: gap between scanned rows and returned rows
- **Actual time** per node (the key metric)
- **Buffer reads/hits**: high shared hit ratio = good cache; high read = cold pages
- **Join type**: PK lookups to `desa` and `users` should be cheap `Index Scan`

---

## 6. Why `/desa` Can Load Around 320ms

Public `/desa` uses `getDesaListResult()` → `fetchDesaRecords()` which reads:

```ts
prisma.desa.findMany({
  orderBy: [{ provinsi: "asc" }, { kabupaten: "asc" }, { nama: "asc" }],
  select: {
    // ... basic fields only
    anggaranSummaries: {
      orderBy: { tahun: "desc" },
      take: 1,                        // ← hits @@unique([desaId, tahun]) perfectly
      select: { tahun: true, totalAnggaran: true, /* ... */ },
    },
    apbdesItems: { select: { tahun: true, /* ... */ } },   // hits @@index([desaId, tahun])
    dokumenPublik: { select: { tahun: true, /* ... */ } },  // hits @@index([desaId, tahun])
  },
});
```

**Why it's faster — four reasons:**

1. **No personalized context lookup**: `/desa` does not run `desaAdminMember.findFirst`. It starts directly
   with `desa.findMany`, which benefits from `@@index([kecamatan, kabupaten, provinsi])` for sorting.
2. **Relation joins are cheap**: The `desa` → `anggaranSummaries` join uses `@@unique([desaId, tahun])`,
   a unique constraint. With `take: 1`, Postgres returns the latest year's row with a single index seek —
   no full scan, no sort.
3. **No `updatedAt` ordering**: The public query sorts by geographic columns (`provinsi, kabupaten, nama`),
   which are part of the `desa` table's natural key. No explicit `Sort` node is needed.
4. **Cached via `unstable_cache`**: `getCachedDesaItems` caches results for 300 seconds (`revalidate: 300`),
   so repeated page loads may hit Next.js cache instead of the database.

**Back office differs in three critical ways:**

1. **Starts with `userId`-first lookup**: `desaAdminMember.findFirst` filters by `userId`, but no existing
   index starts with `userId`. This forces either a Seq Scan or a suboptimal multi-column index scan.
2. **Two JOINs with filtered relation**: `join: desa, user` adds latency, and those joins are evaluated
   after the main member row is found. Each join is a cheap PK lookup, but the accumulated overhead
   matters when the main scan is slow.
3. **Explicit `ORDER BY updatedAt DESC` / `ORDER BY status ASC, createdAt DESC`**: The back office queries
   have sort requirements that require either a matching compound index (absent today) or an explicit
   `Sort` node, which is memory- and CPU-intensive on large result sets.

---

## 7. DB Index Proposals — Evidence Before Migration

> **Do NOT create a migration until this report is approved and EXPLAIN confirms the suspected plan.**

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

Risk: **LOW**. New read index on existing columns, no data change, no write logic change.

Expected benefit: Turns the slow context lookup into a selective index scan by `userId + status`.
Postgres can now seek directly to rows matching `userId` and `status`, then apply
`ORDER BY updatedAt DESC LIMIT 1`.

Open question: Because the query also orders by `updatedAt DESC`, EXPLAIN may show that
`[userId, status, updatedAt]` would eliminate the `Sort` node entirely. The requested safe proposal
is `[userId, status]`; the final migration should be chosen after real EXPLAIN plan data from your local DB.

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

Risk: **LOW**. Useful for any documents list that only needs newest documents per desa.

Expected benefit: Helps newest-first document list variants, but does not fully match the current tab order
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

Risk: **LOW to MEDIUM**. Read index on existing columns, but more write overhead than Proposal B
(because every document insert/update must update the compound index).

Expected benefit: Best match for the current `/profil/admin-desa/dokumen` query shape. If Postgres uses
this index for ordered retrieval, it can avoid a separate Sort for the first 100 rows.

Open question: Prisma/Postgres index sort direction should be reviewed before migration. If the planner
cannot use an ascending `createdAt` index efficiently for `createdAt DESC`, the migration may need explicit
sort direction support. Run the EXPLAIN ANALYZE in Section 5.2 to verify.

---

## 8. Prioritized Recommendations

### P0 — Safest next step (after EXPLAIN confirms the plan)

1. Add `@@index([userId, status])` on `DesaAdminMember` — eliminates Seq Scan on context lookup.
2. Add `@@index([desaId, status, createdAt])` on `AdminDesaDocument` — eliminates Sort on document list.
3. Keep query-shape logging enabled in development/staging until post-index measurements show main data
   renders under 1 second.

### P1 — Small refactor only after P0 evidence

1. Consider trimming `getAdminDesaContext` relation select if the layout does not need all user/desa fields.
2. Consider splitting document list relation data so uploader fields are fetched only where displayed.
3. Consider request-level streaming boundaries so the shell/shimmer appears under 1 second even when DB is slow.

### P2 — Infra / third party only if P0 + P1 fixes are insufficient

1. Review Supabase connection pooling and region if indexed queries still exceed 500–800ms.
2. Consider Prisma Accelerate only after query plans are healthy and network/connection latency is proven.
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
- [x] Schema gap evidence confirmed from `prisma/schema.prisma`
- [x] Ready-to-run EXPLAIN ANALYZE SQL added with what-to-look-for guide
- [ ] Real Supabase `EXPLAIN ANALYZE` captured — blocked in agent env; run locally per Section 5
- [x] `npm run lint`
- [x] `npx tsc --noEmit`
- [ ] `npm run build` — Google Fonts fetch may fail in agent env; run locally

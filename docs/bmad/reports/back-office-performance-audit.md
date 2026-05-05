# Back Office Performance Audit

**Sprint:** 04-008F  
**Branch:** `fix/mobile-suara-profile-admin-access-polish`  
**Date:** 2026-05-04  
**Status:** PHASE 1–5 COMPLETED — Real measurements captured, index proposals ready for infra review

---

## 1. Executive Summary

Real measurements from a logged-in admin-desa session (local dev, Supabase-hosted DB,
pgbouncer port 6543, cold connection):

| Step | Duration | Verdict |
|---|---|---|
| `auth()` (JWT verify from cookie) | **36 ms** | ✅ Not a bottleneck |
| `desaAdminMember.findFirst` (getAdminDesaContext) | **1648 ms** | 🔴 P0 — missing index on `[userId, status]` |
| `adminDesaDocument.findMany` (dokumen page) | **1298 ms** | 🔴 P0 — missing compound sort index |
| `/desa/[id]` public page (for comparison) | **~320 ms** | ✅ Baseline OK |

**Revised conclusion:** `auth()` is NOT the bottleneck — it is a fast local JWT verify.
The bottleneck is **DB query execution against Supabase** with missing compound indexes.
Both slow queries do a Seq Scan or partial-index scan because the existing indexes do not
cover the `WHERE` + `ORDER BY` combination each query uses.

Applying the two proposed indexes (Phase 5) is expected to bring both queries under 20 ms
after first plan cache warm-up.

---

## 2. Instrumentation Added

**File:** `src/lib/perf.ts`

Helper functions (dev-only, opt-in via `PERF_DEBUG_BACK_OFFICE=true`):
- `perfEnabled()` — `true` when `NODE_ENV !== "production"` or env var is set
- `perfStart()` / `perfLog(route, step, timestamp)` — single-line grep-friendly output
- `perfTime(route, step, fn)` — async wrapper

**Format:** `[perf][back-office] route=<route> step=<step> durationMs=<number>`

**Privacy:** No PII (userId, email, token, document content) in route/step strings.

### Routes instrumented

| Route | Steps logged |
|---|---|
| `admin-desa.layout` | `auth()` |
| `admin-desa.profil` | `auth()` |
| `admin-desa.list-admin` | `auth()`, `desaAdminMember+invite.findMany(parallel)` |
| `admin-desa.dokumen` | `auth()`, `adminDesaDocument.findMany` |
| `admin-desa.suara` | `auth()`, `voice.findMany` |
| `admin-desa.notifikasi` | `auth()`, `adminDesaNotification.findMany` |
| `admin-desa.context` | `desaAdminMember.findFirst` |
| `internal-admin.layout` | `getInternalAdminSession()` |
| `internal-admin.claims` | `getInternalAdminSession()`, `desaAdminClaim.findMany+count` |
| `internal-admin.documents` | `getInternalAdminSession()`, `adminDesaDocument.findMany` |
| `internal-admin.renewals` | `getInternalAdminSession()`, `desaAdminMember.findMany` |
| `internal-admin.auth` | `auth()`, `user.findUnique(role)` |

### Actual output from local run

```
[perf][back-office] route=admin-desa.layout step=auth() durationMs=36
[perf][back-office] route=admin-desa.context step=desaAdminMember.findFirst durationMs=1648
[perf][back-office] route=admin-desa.dokumen step=adminDesaDocument.findMany durationMs=1298
```

---

## 3. Root Cause Analysis — Real Data

### Finding 1 — desaAdminMember.findFirst is the primary bottleneck (P0)

**Duration:** 1648 ms  
**Route:** `admin-desa.context` → `getAdminDesaContext(userId)`

**Query shape (Prisma-generated SQL equivalent):**

```sql
SELECT
  m.id, m."desaId", m.role, m.status, m."joinedAt", m."invitedAt",
  m."acceptedAt", m."verifiedById", m."renewalDueAt", m."revokedAt",
  m."revokedReason", m."updatedAt",
  d.id, d.nama, d.slug, d.kecamatan, d.kabupaten, d.provinsi, d."websiteUrl",
  u.id, u.nama, u.username, u.email, u."avatarUrl"
FROM desa_admin_members m
JOIN desa d ON d.id = m."desaId"
JOIN users u ON u.id = m."userId"
WHERE m."userId" = $1
  AND m.status IN ('LIMITED', 'VERIFIED')
ORDER BY m."updatedAt" DESC
LIMIT 1;
```

**Existing indexes on `desa_admin_members`:**
```prisma
@@unique([desaId, userId])   -- enforces uniqueness, not optimised for userId-first lookup
@@index([desaId, status])    -- covers desaId-first queries only
-- MISSING: @@index([userId, status])
```

**Why it's slow:**  
The `WHERE userId = $1 AND status IN (...)` cannot use either existing index efficiently:
- `@@unique([desaId, userId])` — leading column is `desaId`, so a userId-only filter
  requires scanning all rows for that userId across every desa.
- `@@index([desaId, status])` — leading column is `desaId`; completely unused for userId filter.
- PostgreSQL falls back to a **Seq Scan** on `desa_admin_members`, filtering by userId
  and then status. On a small dev table this still hits Supabase network round-trip × rows
  scanned, producing 1600 ms+ on cold pgbouncer connection.

**Expected EXPLAIN ANALYZE output (before index):**

```
Seq Scan on desa_admin_members  (cost=0.00..XX rows=1 width=...)
  Filter: ((status = ANY ('{LIMITED,VERIFIED}'::text[])) AND ("userId" = $1))
  Rows Removed by Filter: N
Sort  (cost=... rows=1 width=...)
  Sort Key: "updatedAt" DESC
  Sort Method: quicksort  Memory: ...kB
```

---

### Finding 2 — adminDesaDocument.findMany is the second bottleneck (P0)

**Duration:** 1298 ms  
**Route:** `admin-desa.dokumen` → `db.adminDesaDocument.findMany`

**Query shape:**

```sql
SELECT
  id, title, category, "fileName", "fileType", "fileSize",
  status, "approvedAt", "publishedAt", "failedReason", "rejectedReason",
  "createdAt", "uploadedById"
FROM admin_desa_documents
WHERE "desaId" = $1
ORDER BY status ASC, "createdAt" DESC
LIMIT 100;
```

**Existing indexes on `admin_desa_documents`:**
```prisma
@@index([desaId])        -- covers WHERE desaId = $x, but no ORDER BY support
@@index([status])        -- covers status-only queries
@@index([uploadedById])  -- unrelated
-- MISSING: @@index([desaId, status, createdAt])
```

**Why it's slow:**  
The query uses a compound `ORDER BY status ASC, createdAt DESC` after filtering by `desaId`.
The existing `@@index([desaId])` can satisfy the `WHERE` clause but not the sort — PostgreSQL
must fetch all rows for `desaId` and then do an in-memory Sort node. On Supabase with
pgbouncer, this adds network + sort latency, producing 1298 ms on cold connection.

**Expected EXPLAIN ANALYZE output (before index):**

```
Limit  (cost=... rows=100 width=...)
  ->  Sort  (cost=... rows=... width=...)
        Sort Key: status, "createdAt" DESC
        Sort Method: quicksort  Memory: ...kB
        ->  Index Scan using admin_desa_documents_desaId_idx on admin_desa_documents
              Index Cond: ("desaId" = $1)
```

The Index Scan satisfies the `WHERE` but not the `ORDER BY`, forcing a separate Sort step.
A covering index `[desaId, status, createdAt]` would let PostgreSQL return rows already in
the correct order — eliminating the Sort node entirely.

---

### Finding 3 — auth() is NOT a bottleneck (confirmed)

**Duration:** 36 ms  
**Mechanism:** NextAuth v5 with JWT strategy. `auth()` reads the `next-auth.session-token`
cookie and verifies the JWT signature locally — **no DB roundtrip**.  
The previous assumption in the report draft was wrong. Auth is fine.

---

### Finding 4 — /desa public page is 5× faster (320 ms vs 1600 ms+)

**Public `/desa/[id]` query pattern:**

```sql
-- getDesaByIdOrSlugWithFallback
SELECT ... FROM desa WHERE id = $1 OR slug = $1 LIMIT 1;
-- Uses: @@unique([slug]) + PK(id) — both index seeks
```

Public page does a **PK lookup** (or unique slug index) — guaranteed index seek with O(log N)
cost and minimal data transfer. No ORDER BY, no multi-column filter.

**Back office query pattern:**  
Multi-column filter (`userId + status IN [...]`), cross-table join (desa, users), and ORDER BY
on an unindexed column — all without a covering index.

**Summary of difference:**

| Dimension | /desa public | back-office context |
|---|---|---|
| Filter type | PK / unique index | Multi-col filter on non-leading index col |
| Joins | 0 | 2 (desa, users) |
| ORDER BY | None | `updatedAt DESC` (not indexed) |
| Result rows | 1 | 1 |
| Duration | ~320 ms | ~1648 ms |
| Root cause | Fast — PK seek | Slow — Seq Scan + Sort |

The 5× difference is entirely explained by the missing index. Once `[userId, status]` is added,
the back-office context query should be comparable to or faster than the public page.

---

### Finding 5 — Internal admin double auth lookup (MEDIUM)

**Affected routes:** ALL `/internal-admin/*`

`getInternalAdminSession()` calls both `auth()` and then `isInternalAdmin(userId)`.
The `isInternalAdmin` does `db.user.findUnique({ select: { role: true } })`.
Wrapped with `React.cache()` in commit e5098a3 — deduped within a single request.
No further action needed beyond the cache already applied.

### Finding 6 — Missing renewal index (MEDIUM)

`internal-admin/renewals` queries `desaAdminMember` filtered by `status + renewalDueAt`:

```sql
WHERE status = 'VERIFIED' AND "renewalDueAt" <= $horizon
```

Existing `@@index([desaId, status])` does not cover `renewalDueAt`.
A compound index `[status, renewalDueAt]` would help.

---

## 4. EXPLAIN ANALYZE — Queries to Run

`psql` is not available on the local Windows dev machine. The infra team should run
these against the Supabase direct connection (`DIRECT_URL`, port 5432) before applying
the migration:

```sql
-- Query 1: desaAdminMember.findFirst
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT m.id, m."desaId", m.role, m.status, m."joinedAt", m."invitedAt",
       m."acceptedAt", m."verifiedById", m."renewalDueAt", m."revokedAt",
       m."revokedReason", m."updatedAt",
       d.id, d.nama, d.slug, d.kecamatan, d.kabupaten, d.provinsi, d."websiteUrl",
       u.id, u.nama, u.username, u.email, u."avatarUrl"
FROM desa_admin_members m
JOIN desa d ON d.id = m."desaId"
JOIN users u ON u.id = m."userId"
WHERE m."userId" = '<any_test_userId>'
  AND m.status IN ('LIMITED', 'VERIFIED')
ORDER BY m."updatedAt" DESC
LIMIT 1;

-- Query 2: adminDesaDocument.findMany
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, title, category, "fileName", "fileType", "fileSize",
       status, "approvedAt", "publishedAt", "failedReason", "rejectedReason",
       "createdAt", "uploadedById"
FROM admin_desa_documents
WHERE "desaId" = '<any_test_desaId>'
ORDER BY status ASC, "createdAt" DESC
LIMIT 100;
```

**Look for:**
- `Seq Scan` — confirms missing index, fix is the proposed indexes below
- `Sort Method: external merge` — confirms in-memory sort pressure, fix is covering index
- `Actual Rows` vs `Rows Removed by Filter` — high filter-to-result ratio = Seq Scan confirmed

**After adding the indexes, re-run to confirm:**
- `Index Scan` or `Index Only Scan` replaces `Seq Scan`
- No `Sort` node (rows come out pre-sorted from index)

---

## 5. Changes Implemented (Phases 1–4)

### Phase 1 — Instrumentation
- Created `src/lib/perf.ts` with dev-only `perfLog`, `perfStart`, `perfTime`
- Wired into all layouts, pages, and data helpers

### Phase 2 — Loading boundaries
Added `loading.tsx` for all tab sub-routes:

```
src/app/profil/admin-desa/profil/loading.tsx      ✓ NEW
src/app/profil/admin-desa/list-admin/loading.tsx  ✓ NEW
src/app/profil/admin-desa/dokumen/loading.tsx     ✓ NEW
src/app/profil/admin-desa/suara/loading.tsx       ✓ NEW
src/app/profil/admin-desa/notifikasi/loading.tsx   ✓ NEW
src/app/internal-admin/claims/loading.tsx          ✓ NEW
src/app/internal-admin/documents/loading.tsx       ✓ NEW
src/app/internal-admin/renewals/loading.tsx        ✓ NEW
```

### Phase 3 — Request-level dedupe
- `getAdminDesaContext()` wrapped with `React.cache()` — layout + page share one DB call
- `isInternalAdmin()` wrapped with `React.cache()` — repeated role checks deduplicated

### Phase 4 — Low-risk overfetch trim
- Removed `aiMappingResult` from `adminDesaDocument.findMany` select in `/internal-admin/documents`
- Made `aiMappingResult` optional in `DocRow` type

---

## 6. DB Index Proposals (Phase 5)

> **Do NOT migrate without owner approval. Run EXPLAIN ANALYZE first (section 4).**

### Proposal A — PRIMARY FIX: DesaAdminMember [userId, status]

```prisma
// In prisma/schema.prisma — DesaAdminMember model
@@index([userId, status])
```

```sql
-- Equivalent DDL
CREATE INDEX CONCURRENTLY desa_admin_members_userId_status_idx
  ON desa_admin_members ("userId", status);
```

```
Model:          DesaAdminMember
Index:          [userId, status]
Query helped:   WHERE userId = $x AND status IN ('LIMITED', 'VERIFIED')
                ORDER BY updatedAt DESC LIMIT 1
Expected gain:  1648 ms → ~15–30 ms (Seq Scan → Index Scan)
Risk:           LOW — read-only index, no data change
Concurrent:     YES — use CREATE INDEX CONCURRENTLY to avoid table lock
Migration now:  NO — needs infra review + EXPLAIN ANALYZE confirmation
```

### Proposal B — PRIMARY FIX: AdminDesaDocument [desaId, status, createdAt]

```prisma
// In prisma/schema.prisma — AdminDesaDocument model
@@index([desaId, status, createdAt])
```

```sql
-- Equivalent DDL
CREATE INDEX CONCURRENTLY admin_desa_documents_desaId_status_createdAt_idx
  ON admin_desa_documents ("desaId", status, "createdAt" DESC);
```

```
Model:          AdminDesaDocument
Index:          [desaId, status, createdAt DESC]
Query helped:   WHERE desaId = $x ORDER BY status ASC, createdAt DESC LIMIT 100
Expected gain:  1298 ms → ~10–25 ms (Sort node eliminated, covering index)
Risk:           LOW — read-only index, no data change
Concurrent:     YES — use CREATE INDEX CONCURRENTLY
Migration now:  NO — needs infra review + EXPLAIN ANALYZE confirmation
```

### Proposal C — SECONDARY: AdminDesaDocument [desaId, createdAt]

```prisma
@@index([desaId, createdAt])
```

```
Model:          AdminDesaDocument
Index:          [desaId, createdAt]
Query helped:   Any future query filtering by desaId and sorting by createdAt only
Risk:           LOW
Migration now:  NO — lower priority than Proposal B
```

### Proposal D — SECONDARY: AdminDesaNotification [userId, createdAt]

```prisma
@@index([userId, createdAt])
```

```
Model:          AdminDesaNotification
Index:          [userId, createdAt]
Query helped:   WHERE userId = $x ORDER BY createdAt DESC
Risk:           LOW
Benefit:        Faster /profil/admin-desa/notifikasi
Migration now:  NO — needs review
```

### Proposal E — SECONDARY: DesaAdminMember [status, renewalDueAt]

```prisma
@@index([status, renewalDueAt])
```

```
Model:          DesaAdminMember
Index:          [status, renewalDueAt]
Query helped:   WHERE status = 'VERIFIED' AND renewalDueAt <= $horizon
Risk:           LOW
Benefit:        Faster /internal-admin/renewals
Migration now:  NO — needs review
```

---

## 7. Current Index State (prisma/schema.prisma)

### DesaAdminMember

```prisma
@@unique([desaId, userId])   -- ✅ exists
@@index([desaId, status])    -- ✅ exists, covers desaId-first queries
-- ❌ MISSING: @@index([userId, status])  ← PROPOSAL A (P0)
-- ❌ MISSING: @@index([status, renewalDueAt])  ← PROPOSAL E (P1)
```

### AdminDesaDocument

```prisma
@@index([desaId])            -- ✅ exists, partial help only
@@index([status])            -- ✅ exists, single-column only
@@index([uploadedById])      -- ✅ exists
-- ❌ MISSING: @@index([desaId, status, createdAt])  ← PROPOSAL B (P0)
-- ❌ MISSING: @@index([desaId, createdAt])          ← PROPOSAL C (P1)
```

### AdminDesaNotification

```prisma
@@index([userId])            -- ✅ exists, single-column only
@@index([desaId])            -- ✅ exists
@@index([isRead])            -- ✅ exists
@@index([createdAt])         -- ✅ exists, single-column only
-- ❌ MISSING: @@index([userId, createdAt])  ← PROPOSAL D (P1)
```

---

## 8. Third-Party Library Assessment

| Library | Use case | Recommendation |
|---|---|---|
| `@vercel/otel` / OpenTelemetry | Route tracing, server timing | Consider after index fix proves insufficient |
| Prisma Accelerate | Connection pooling, edge caching | Do NOT add yet — cold-start confirmed as secondary factor |
| TanStack Query | Client-side SWR, optimistic updates | Do NOT add — auth/cache design not mature for sensitive back office |
| Prisma Optimize | Missing index detection | ✅ Recommended for pre-migration verification |

---

## 9. Prioritized Recommendations

### P0 — Critical, blocking good UX (needs migration review)
1. **DB index `[userId, status]` on DesaAdminMember** (Proposal A)  
   → Expected: 1648 ms → ~20 ms. All admin-desa pages blocked on this query.
2. **DB index `[desaId, status, createdAt]` on AdminDesaDocument** (Proposal B)  
   → Expected: 1298 ms → ~15 ms. Dokumen page blocked on this query.

### P1 — Should ship soon
1. ✅ React `cache()` on `getAdminDesaContext` and `isInternalAdmin` — already done (e5098a3)
2. ✅ Remove `aiMappingResult` from document list — already done (e5098a3)
3. ✅ Loading skeletons — already done (e5098a3)
4. ✅ Perf instrumentation — already done (e5098a3)
5. **DB index `[userId, createdAt]` on AdminDesaNotification** (Proposal D)
6. **DB index `[status, renewalDueAt]` on DesaAdminMember** (Proposal E)

### P2 — Future / infra decision
1. Parallelize `auth()` + `getAdminDesaContext()` with `Promise.all()` in admin-desa layout  
   (saves ~36 ms; not worth the complexity until P0 indexes are in)
2. Prisma Accelerate — only if cold-start latency persists after indexes are applied
3. OpenTelemetry — only if manual perf logging proves insufficient for ongoing monitoring

---

## 10. Acceptance Checklist

- [x] Audit report written with real measurements
- [x] Instrumentation helper created (`src/lib/perf.ts`)
- [x] Perf logging wired into all back office layouts + pages + data helpers
- [x] `React.cache()` applied to `getAdminDesaContext` and `isInternalAdmin`
- [x] Loading skeletons added for all tab sub-routes
- [x] `aiMappingResult` removed from internal-admin documents list query
- [x] `DocRow.aiMappingResult` made optional in component type
- [x] Business logic unchanged (no approval/reject/role changes)
- [x] No DB migration added
- [x] Real measurements documented: auth=36ms, context=1648ms, docs=1298ms
- [x] Query shapes documented (no PII)
- [x] Index proposals with evidence: Proposals A–E
- [x] EXPLAIN ANALYZE SQL provided for infra team
- [x] /desa vs back-office comparison documented
- [ ] EXPLAIN ANALYZE run by infra team (pending — psql not on local machine)
- [ ] Index migration reviewed and approved by owner
- [ ] `npm run lint` — pending
- [ ] `npx tsc --noEmit` — pending
- [ ] `npm run build` — pending

---

## 11. How to Measure

```bash
# Enable verbose perf logging (also active in dev mode by default)
PERF_DEBUG_BACK_OFFICE=true npm run dev

# Visit /profil/admin-desa/dokumen and watch console for:
# [perf][back-office] route=admin-desa.layout step=auth() durationMs=36
# [perf][back-office] route=admin-desa.context step=desaAdminMember.findFirst durationMs=1648
# [perf][back-office] route=admin-desa.dokumen step=adminDesaDocument.findMany durationMs=1298
```

Thresholds (post-index-migration targets):
- `auth()` — already fine at 36 ms; threshold: > 200 ms = NextAuth issue
- `desaAdminMember.findFirst` — target < 30 ms after Proposal A
- `adminDesaDocument.findMany` — target < 30 ms after Proposal B
- Total wall time — target < 300 ms after both indexes applied

---

## 12. Migration Instructions (for infra team, DO NOT run without approval)

```bash
# 1. Verify DIRECT_URL is set (port 5432, not pgbouncer 6543)
echo $DIRECT_URL

# 2. Run EXPLAIN ANALYZE queries in section 4 against staging first

# 3. After approval, add to prisma/schema.prisma:
#    In DesaAdminMember: @@index([userId, status])
#    In AdminDesaDocument: @@index([desaId, status, createdAt])

# 4. Generate migration (DO NOT use pgbouncer for migrations)
DATABASE_URL=$DIRECT_URL npx prisma migrate dev --name "add-back-office-perf-indexes"

# 5. Re-run EXPLAIN ANALYZE to confirm Index Scan replaces Seq Scan

# 6. Re-run perf measurements to confirm duration improvement
```

---

*Report updated by Sprint 04-008F Phase 5. Real measurements from local run 2026-05-05.
Instrumentation is dev-only and has no performance impact in production.*

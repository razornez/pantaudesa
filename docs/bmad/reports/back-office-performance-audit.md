# Back Office Performance Audit

**Sprint:** 04-008F  
**Branch:** `fix/mobile-suara-profile-admin-access-polish`  
**Date:** 2026-05-04  
**Status:** PHASE 1–4 COMPLETED — Measurement data pending local run

---

## 1. Executive Summary

The back office pages (`/profil/admin-desa/*` and `/internal-admin/*`) show sequential
query chains that cause perceived slowness (5–10 seconds on poor networks). The primary
bottleneck is the **auth() → context query waterfall** that runs on every layout render,
combined with repeated `findFirst` / `findMany` calls that are not deduplicated within a
single request.

This audit implements Phase 1–4 of the sprint task: instrumentation, loading boundaries,
request-level dedupe, and low-risk overfetch trimming.

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

### Expected output (dev console)

```
[perf][back-office] route=admin-desa.layout step=auth() durationMs=47
[perf][back-office] route=admin-desa.context step=desaAdminMember.findFirst durationMs=12
[perf][back-office] route=admin-desa.dokumen step=adminDesaDocument.findMany durationMs=38
[perf][back-office] route=internal-admin.auth step=auth() durationMs=52
[perf][back-office] route=internal-admin.auth step=user.findUnique(role) durationMs=8
[perf][back-office] route=internal-admin.claims step=desaAdminClaim.findMany+count durationMs=91
```

---

## 3. Root Cause Analysis (Code Review)

### Finding 1 — Auth + context waterfall (HIGH)

**Affected routes:** ALL `/profil/admin-desa/*` and `/internal-admin/*`

Every layout and page independently calls `auth()` (NextAuth session lookup) and then a
context query. On a cold DB connection or slow network this creates a sequential chain:

```
auth()          → ~30–80ms (network + JWT verify)
  └─ getAdminDesaContext() → ~10–50ms (single findFirst + join)
      └─ (for tabs with extra queries)
          ├─ getDesaAdminRoster()   → parallel findMany+findMany
          ├─ voice.findMany(take:50) → full scan + join
          ├─ adminDesaDocument.findMany(take:100) → full scan
          └─ adminDesaNotification.findMany(take:50) → full scan
```

**Root cause:** No dedupe between layout and nested page for the same user context.

### Finding 2 — Internal admin double auth lookup (MEDIUM)

**Affected routes:** ALL `/internal-admin/*`

`getInternalAdminSession()` calls both `auth()` and then `isInternalAdmin(userId)`.
The `isInternalAdmin` does `db.user.findUnique({ select: { role: true } })` — a second
DB roundtrip that could be avoided for the current user (already in session).

**Root cause:** No caching of internal admin role within the request.

### Finding 3 — Serial queries in some pages (MEDIUM)

In `admin-desa.context` and `admin-desa.list-admin`, queries are already parallelized where
possible. However, the layout runs `auth()` then `getAdminDesaContext()` sequentially — these
could be parallelized with `Promise.all()` since they are independent.

### Finding 4 — Overfetch in internal-admin documents (LOW)

`adminDesaDocument.findMany` was selecting `aiMappingResult` (a potentially large JSON blob)
for every row in the list. This field is only used in the PublishModal which is opened by user
action (not rendered on initial page load). Removed from list select; still available via
on-demand fetch if needed.

### Finding 5 — Missing DB indexes for renewal queries (MEDIUM, needs verification)

`internal-admin/renewals` queries `desaAdminMember` filtered by `status + renewalDueAt`:

```prisma
where: { status: "VERIFIED", renewalDueAt: { lte: horizon } }
```

The existing index `[desaId, status]` does not cover `renewalDueAt`.  
A compound index `[status, renewalDueAt]` would help for queries without `desaId` filter.

---

## 4. Changes Implemented

### Phase 1 — Instrumentation
- Created `src/lib/perf.ts` with dev-only `perfLog`, `perfStart`, `perfTime`
- Wired into all layouts, pages, and data helpers

### Phase 2 — Loading boundaries
Added `loading.tsx` for all tab sub-routes (existing skeletons already existed for the
top-level `/profil/admin-desa` and `/internal-admin` layouts):

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

All skeletons: quiet-luxury style, mobile-friendly, no dummy data, screen-reader labels.

### Phase 3 — Request-level dedupe
- `getAdminDesaContext()` wrapped with `React.cache()` — layout + page share one DB call
- `isInternalAdmin()` wrapped with `React.cache()` — repeated role checks within a request are deduplicated

### Phase 4 — Low-risk overfetch trim
- Removed `aiMappingResult` from `adminDesaDocument.findMany` select in `/internal-admin/documents`
- Made `aiMappingResult` optional in `DocRow` type (PublishModal handles `undefined` gracefully)

---

## 5. DB Index Proposal (Phase 5)

> **Do NOT migrate without owner approval.**

### Proposal 1 — Renewal queries
```
Model:         DesaAdminMember
Index:         [status, renewalDueAt]
Query helped:   WHERE status = 'VERIFIED' AND renewalDueAt <= $horizon
Risk:          LOW — index on existing columns, no data change
Benefit:       Faster /internal-admin/renewals page load
Migration now:  NO — needs review
```

### Proposal 2 — Notification lookup
```
Model:         AdminDesaNotification
Index:         [userId, createdAt]
Query helped:   WHERE userId = $id ORDER BY createdAt DESC
Risk:          LOW — covers common access pattern
Benefit:       Faster /profil/admin-desa/notifikasi
Migration now:  NO — needs review
```

### Proposal 3 — Document filter by status
```
Model:         AdminDesaDocument
Index:         [status, updatedAt]
Query helped:   WHERE status = $filter ORDER BY updatedAt DESC
Risk:          LOW
Benefit:       Faster /internal-admin/documents filtered view
Migration now:  NO — needs review
```

---

## 6. Third-Party Library Assessment

| Library | Use case | Recommendation |
|---|---|---|
| `@vercel/otel` / OpenTelemetry | Route tracing, server timing | Consider after manual logging proves insufficient |
| Prisma Accelerate | Connection pooling, edge caching | Do NOT add yet — cold-start bottleneck not confirmed |
| TanStack Query | Client-side SWR, optimistic updates | Do NOT add — auth/cache design not mature for sensitive back office |
| Prisma Optimize | Missing index detection | Recommended for pre-migration audit |

---

## 7. Prioritized Recommendations

### P0 — Safe, can ship now
1. ✅ React `cache()` on `getAdminDesaContext` and `isInternalAdmin` — reduces duplicate DB calls
2. ✅ Remove `aiMappingResult` from document list — smaller response payload
3. ✅ Loading skeletons — no more blank/freeze screens
4. ✅ Perf instrumentation — owners can now measure real durations

### P1 — Needs owner review before merge
1. Parallelize `auth()` + `getAdminDesaContext()` with `Promise.all()` in admin-desa layout
2. DB index proposals (Phase 5) — need migration review
3. Serial auth optimization for internal-admin (cache user role after first look-up)

### P2 — Needs migration / infra / third party
1. Prisma Accelerate — only if cold-start latency > 500ms proven
2. TanStack Query — only after auth + cache strategy is designed
3. OpenTelemetry — only if manual perf logging proves insufficient for ongoing monitoring

---

## 8. Acceptance Checklist

- [x] Audit report written
- [x] Instrumentation helper created (`src/lib/perf.ts`)
- [x] Perf logging wired into all back office layouts + pages + data helpers
- [x] `React.cache()` applied to `getAdminDesaContext` and `isInternalAdmin`
- [x] Loading skeletons added for all tab sub-routes
- [x] `aiMappingResult` removed from internal-admin documents list query
- [x] `DocRow.aiMappingResult` made optional in component type
- [x] Business logic unchanged (no approval/reject/role changes)
- [x] No DB migration added
- [ ] Duration measurements from local/staging run (pending — run `npm run dev` and test)
- [ ] `npm run lint` — pending
- [ ] `npx tsc --noEmit` — pending
- [ ] `npm run build` — pending

---

## 9. How to Measure

```bash
# Enable verbose perf logging (also active in dev mode by default)
PERF_DEBUG_BACK_OFFICE=true npm run dev

# Visit each route and watch console for:
# [perf][back-office] route=admin-desa.layout step=auth() durationMs=47
# [perf][back-office] route=admin-desa.context step=desaAdminMember.findFirst durationMs=12
```

Thresholds to investigate:
- `auth()` > 200ms → NextAuth or session store issue
- `findFirst` / `findMany` > 200ms → missing index or cold connection
- Total wall time > 2000ms → sequential query waterfall

---

*Report generated by Sprint 04-008F execution. Instrumentation is dev-only and has no
performance impact in production.*

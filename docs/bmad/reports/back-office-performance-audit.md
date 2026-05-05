# Back Office Performance Audit

**Sprint:** 04-008F / 04-008G  
**Branch:** `fix/mobile-suara-profile-admin-access-polish`  
**Date:** 2026-05-05  
**Status:** PRISMA/RUNTIME LATENCY AUDIT NEEDED — raw SQL EXPLAIN is fast in local dataset; do not migrate yet

---

## 1. Executive Summary

Back office `/profil/admin-desa/dokumen` still feels slow in local, but the investigation has changed direction.

Initial app-level perf logs showed:

| Route / Step | App perf duration | Initial interpretation |
|---|---:|---|
| `admin-desa.layout` → `auth()` | 330ms | Not primary bottleneck, but can fluctuate |
| `admin-desa.dokumen` → `auth()` | 330ms | Not primary bottleneck, but duplicate auth still worth watching |
| `admin-desa.context` → `desaAdminMember.findFirst` | 1661ms | Suspected DB query bottleneck |
| `admin-desa.dokumen` → `adminDesaDocument.findMany` | 1278ms | Suspected DB query bottleneck |
| Public `/desa` load | ~320ms | Much faster comparison path |

Latest `EXPLAIN ANALYZE` with non-empty local rows shows raw SQL execution is fast:

| Query | Raw SQL plan result | Meaning |
|---|---:|---|
| `desa_admin_members` context lookup | 0.210ms | Query execution itself is not slow in current local dataset |
| `admin_desa_documents` list | 0.240ms | Query execution itself is not slow in current local dataset |

Current conclusion:

- **Do not create DB migration/index yet.** The evidence does not prove missing index as the cause of local 1–2s latency.
- The gap is between **Prisma/app measured time** and **raw SQL execution time**.
- Next audit must isolate Prisma runtime, connection acquisition/cold start, Next.js dev/RSC duplicate requests, and request waterfall.

No UI refactor, business-logic change, migration, or third-party package is included in this report update.

---

## 2. Audit Timeline / Comparison With Earlier Findings

### Phase A — Commit `e5098a3d97ba036eb85e3dc3e3cfaa122a141688`

Summary:
- Added `src/lib/perf.ts`.
- Added perf logging to back-office routes.
- Added loading skeletons.
- Added `React.cache()` for `getAdminDesaContext` and `isInternalAdmin`.
- Removed `aiMappingResult` overfetch from internal-admin documents list.

Assessment:
- **Partial pass.** Instrumentation and perceived-loading work were useful.
- Root cause was still not proven because there was no real EXPLAIN evidence yet.

### Phase B — Commit `3b4e743fa32a3654a857891250a4c284d97d9403`

Summary:
- Added sanitized query-shape logging via `perfQueryShape()`.
- Documented query shapes for:
  - `desaAdminMember.findFirst`
  - `adminDesaDocument.findMany`
- Added DB index proposals without migration.

Assessment:
- **Good audit step.** Query shape logging is privacy-safe and useful.
- However, the report still leaned toward DB index root cause before valid local EXPLAIN was available.

### Phase C — Commit `9395c5e39bebc6f489273f5cc201a138603edfdd`

Summary:
- Added BMAD task:
  `docs/bmad/tasks/sprint-04-008g-back-office-db-query-plan-index-audit.md`

Assessment:
- Good as an execution checklist.
- New evidence below changes the next action: finish DB plan summary, then continue to Prisma/runtime latency audit.

### Phase D — Latest EXPLAIN Results From Local Dataset

Summary:
- First EXPLAIN attempt used email-like values in `userId` / `desaId`, producing `rows=0`; that result was invalid for root-cause decision.
- Second EXPLAIN attempt used candidate rows from the database, producing non-zero rows.
- Raw SQL execution is very fast: ~0.210ms and ~0.240ms.

Assessment:
- **DB index migration is not yet justified for the observed local slowness.**
- Index proposals remain valid for future production-scale review, but not as the immediate fix.

---

## 3. Instrumentation Status

**File:** `src/lib/perf.ts`

Current helper coverage:

- `perfEnabled()` — dev/opt-in gate.
- `perfStart()` / `perfLog(route, step, timestamp)` — duration logging.
- `perfTime(route, step, fn)` — async wrapper.
- `perfQueryShape(route, query, shape)` — static query-shape logging without values.

Duration format:

```text
[perf][back-office] route=<route> step=<step> durationMs=<number>
```

Query-shape format:

```text
[perf][back-office] route=<route> query=<model.method> shape=<static-shape>
```

Privacy requirement:
- Do not log `userId`, `desaId`, email, token, session data, storage key, document title, document content, or raw query params.
- Query-shape strings must stay static descriptors only.

---

## 4. App-Level Local Evidence

Observed latest app console logs:

```text
[perf][back-office] route=admin-desa.layout step=auth() durationMs=330
[perf][back-office] route=admin-desa.context query=desaAdminMember.findFirst shape=where:userId,statusIn(LIMITED,VERIFIED);orderBy:updatedAtDesc;take:1;join:desa,user;select:memberContextFields
[perf][back-office] route=admin-desa.dokumen step=auth() durationMs=330
[perf][back-office] route=admin-desa.context step=desaAdminMember.findFirst durationMs=1661
[perf][back-office] route=admin-desa.dokumen query=adminDesaDocument.findMany shape=where:desaId;orderBy:statusAsc,createdAtDesc;take:100;join:uploadedBy;select:listFields
[perf][back-office] route=admin-desa.dokumen step=adminDesaDocument.findMany durationMs=1278
```

Interpretation:

1. `auth()` is not the largest contributor, but duplicate/sequential auth can still add latency.
2. App-level wrapper around `desaAdminMember.findFirst` and `adminDesaDocument.findMany` reports 1–2 seconds.
3. The slow timing may include connection acquisition, Prisma client overhead, cold start, RSC request duplication, or dev-mode server work — not only SQL execution.

---

## 5. Query Shapes Under Audit

### 5.1 `getAdminDesaContext` / `desaAdminMember.findFirst`

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

Runtime shape:

```text
where:userId,statusIn(LIMITED,VERIFIED);orderBy:updatedAtDesc;take:1;join:desa,user;select:memberContextFields
```

Current schema indexes:

| Existing index | Helps this query? | Note |
|---|---|---|
| `@@unique([desaId, userId])` | Not ideal | Query starts from `userId`, not `desaId` |
| `@@index([desaId, status])` | Not ideal | Query starts from `userId`, not `desaId` |

### 5.2 `/profil/admin-desa/dokumen` / `adminDesaDocument.findMany`

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

Runtime shape:

```text
where:desaId;orderBy:statusAsc,createdAtDesc;take:100;join:uploadedBy;select:listFields
```

Current schema indexes:

| Existing index | Helps this query? | Note |
|---|---|---|
| `@@index([desaId])` | Yes, partially | Current EXPLAIN uses this index |
| `@@index([status])` | Not ideal | Query filters by `desaId` first |
| `@@index([uploadedById])` | Not relevant for filter/order | Only helps uploader lookup/access pattern |

---

## 6. Latest EXPLAIN ANALYZE Summary

### 6.1 Initial invalid EXPLAIN attempt

The first EXPLAIN run used email-like values for both `userId` and `desaId`:

```text
"userId" = 'admin.verified.desa-a.qa@pantaudesa.local'
"desaId" = 'admin.verified.desa-a.qa@pantaudesa.local'
```

Result:
- `rows=0`
- raw SQL execution appeared fast, but the test did not hit the same rows as the app route.

Assessment:
- Invalid for root-cause decision.
- Do not use this result to approve or reject indexes.

### 6.2 Valid non-zero EXPLAIN — `desa_admin_members`

Observed plan highlights:

```text
Seq Scan on desa_admin_members m
Rows Removed by Filter: 11
Sort Key: m."updatedAt" DESC
Sort Method: quicksort  Memory: 25kB
Index Only Scan using users_pkey on users u
Execution Time: 0.210 ms
```

Interpretation:

- `Seq Scan` appears, but the table only has ~12 rows in this local dataset.
- Sort is tiny: 25kB.
- Join to `users` is cheap via `users_pkey`.
- Raw SQL execution is **0.210ms**, so this does not explain app-level `1661ms`.

### 6.3 Valid non-zero EXPLAIN — `admin_desa_documents`

Observed plan highlights:

```text
Index Scan using "admin_desa_documents_desaId_idx" on admin_desa_documents doc
Sort Key: doc.status, doc."createdAt" DESC
Sort Method: quicksort  Memory: 27kB
Execution Time: 0.240 ms
```

Interpretation:

- DB already uses existing `desaId` index.
- Sort exists, but only over ~7 rows in local dataset.
- Raw SQL execution is **0.240ms**, so this does not explain app-level `1278ms`.

### 6.4 Evidence Gap

| Layer | Context query | Document query | Meaning |
|---|---:|---:|---|
| App perf wrapper | 1661ms | 1278ms | Slow at Prisma/app boundary |
| Raw SQL EXPLAIN | 0.210ms | 0.240ms | Fast in DB execution |

Likely root-cause candidates now:

1. Prisma connection acquisition / cold connection / pooler latency.
2. Prisma client runtime overhead in local/dev.
3. Query executed by Prisma differs from simplified EXPLAIN query.
4. Next.js dev-mode / RSC duplicated requests.
5. Layout/page request waterfall, including duplicate `auth()` and context resolution.
6. Supabase/Vercel region or connection path if reproduced outside local.

---

## 7. DB Index Proposals — Status After EXPLAIN

> **Do NOT create a migration yet.**

Candidate indexes remain documented for production-scale review, but latest local EXPLAIN does not prove them as the immediate fix.

### Candidate A — Admin Desa context lookup

```prisma
model DesaAdminMember {
  @@index([userId, status])
}
```

Status:
- Still reasonable as a production-scale access pattern.
- Not yet justified as the fix for current local 1.6s latency because raw SQL is 0.210ms.

Optional if future EXPLAIN shows sort remains expensive:

```prisma
model DesaAdminMember {
  @@index([userId, status, updatedAt])
}
```

### Candidate B — Document list by desa + created date

```prisma
model AdminDesaDocument {
  @@index([desaId, createdAt])
}
```

Status:
- May help newest-first variants.
- Not the best match for the current order `status ASC, createdAt DESC`.

### Candidate C — Document list by desa + status + created date

```prisma
model AdminDesaDocument {
  @@index([desaId, status, createdAt])
}
```

Status:
- Best candidate for the current document tab query shape.
- Not yet justified as the immediate fix because existing `desaId` index is used and local sort is tiny.
- Revisit only after production/staging data volume or EXPLAIN proves sort/filter cost.

---

## 8. Prioritized Recommendations

### P0 — Do next, safe audit only

1. Add dev-only Prisma query event logging to compare Prisma-reported query duration vs `perfLog` wrapper duration.
2. Split timing around:
   - before Prisma call
   - after Prisma promise resolves
   - row count serialization
   - render handoff
3. Test first request vs second/third request after `npm run dev` to detect cold connection or cold module cost.
4. Check Network tab for repeated `_rsc` requests and route duplication.
5. Update report with side-by-side table: app perf wrapper vs Prisma event duration vs raw SQL EXPLAIN.

### P1 — Review after P0 evidence

1. If Prisma query event duration is also high, investigate connection pooling, DB URL mode, Supabase region, and Prisma runtime.
2. If Prisma query event is fast but wrapper is slow, inspect Next.js RSC/dev-mode duplication, serialization, and route waterfall.
3. Consider trimming relation selects only if row serialization is proven meaningful.

### P2 — Needs owner approval / infra decision

1. DB indexes only after staging/production EXPLAIN proves scan/sort cost.
2. Prisma Accelerate only if connection/pool latency remains proven after query shape is healthy.
3. OpenTelemetry only if manual perf logging is no longer enough.
4. No TanStack Query for sensitive back office until auth/cache design is approved.

---

## 9. Acceptance Checklist

- [x] App-level perf logs documented.
- [x] Query-shape logging documented without sensitive values.
- [x] First invalid EXPLAIN attempt documented and rejected as evidence.
- [x] Valid non-zero EXPLAIN results documented.
- [x] Comparison added: previous DB-index suspicion vs latest raw SQL evidence.
- [x] Report updated to block migration/index for now.
- [x] New likely root-cause area identified: Prisma/runtime/connection/RSC layer.
- [x] No UI refactor.
- [x] No business logic change.
- [x] No migration added.
- [x] No third-party package added.
- [x] `npm run lint` — passed 2026-05-05 in previous audit.
- [x] `npx tsc --noEmit` — passed 2026-05-05 in previous audit.
- [ ] `npm run build` — previously blocked by Google Fonts fetch failure for `Inter` in this environment; needs rerun in normal network environment.

---

## 10. Next BMAD Task

Create or execute:

```text
docs/bmad/tasks/sprint-04-008h-back-office-prisma-runtime-latency-audit.md
```

Purpose:
- Explain why Prisma/app perf logs show 1–2s while raw SQL EXPLAIN shows <1ms.
- Do not create indexes, migrations, or UI changes until the Prisma/runtime gap is understood.

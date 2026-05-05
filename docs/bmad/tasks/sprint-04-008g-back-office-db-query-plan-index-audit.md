# Sprint 04-008G — Back Office DB Query Plan & Index Audit

## Status
READY FOR EXECUTION — audit only, no migration without owner approval.

## Context
Back office PantauDesa masih lambat di local, terutama route:

```text
/profil/admin-desa/dokumen
```

Latest observed console logs:

```text
[perf][back-office] route=admin-desa.layout step=auth() durationMs=330
[perf][back-office] route=admin-desa.context query=desaAdminMember.findFirst shape=where:userId,statusIn(LIMITED,VERIFIED);orderBy:updatedAtDesc;take:1;join:desa,user;select:memberContextFields
[perf][back-office] route=admin-desa.dokumen step=auth() durationMs=330
[perf][back-office] route=admin-desa.context step=desaAdminMember.findFirst durationMs=1661
[perf][back-office] route=admin-desa.dokumen query=adminDesaDocument.findMany shape=where:desaId;orderBy:statusAsc,createdAtDesc;take:100;join:uploadedBy;select:listFields
[perf][back-office] route=admin-desa.dokumen step=adminDesaDocument.findMany durationMs=1278
```

Interpretasi sementara:
- `auth()` bisa fluktuatif, tapi bukan bottleneck utama.
- Bottleneck utama ada di query DB:
  - `desaAdminMember.findFirst` sekitar 1.6 detik.
  - `adminDesaDocument.findMany` sekitar 1.2 detik.
- Query shape sudah aman karena tidak log `userId`, `desaId`, `email`, token, atau isi dokumen.
- Commit audit terakhir yang perlu dicek:
  `3b4e743fa32a3654a857891250a4c284d97d9403`

## Goal
Membuktikan root cause performa back office lewat query plan DB sebelum membuat migration/index.

Target akhir:
- Shell/shimmer tampil < 1 detik.
- Data utama idealnya < 1 detik.
- Tidak ada perubahan business logic.
- Tidak ada migration sebelum owner approval.

## Scope
Kerjakan audit untuk dua query lambat ini.

### 1. Admin Desa context
Prisma shape:

```ts
db.desaAdminMember.findFirst({
  where: {
    userId,
    status: { in: ["LIMITED", "VERIFIED"] },
  },
  orderBy: { updatedAt: "desc" },
  take: 1,
});
```

Runtime shape:

```text
where:userId,statusIn(LIMITED,VERIFIED);orderBy:updatedAtDesc;take:1;join:desa,user;select:memberContextFields
```

### 2. Admin Desa documents list
Prisma shape:

```ts
db.adminDesaDocument.findMany({
  where: { desaId: ctx.desa.id },
  orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  take: 100,
});
```

Runtime shape:

```text
where:desaId;orderBy:statusAsc,createdAtDesc;take:100;join:uploadedBy;select:listFields
```

## Hard Boundaries
Do not:
- Merge to `main`.
- Create migration.
- Add DB index directly.
- Change approval/reject admin desa logic.
- Change role/status admin desa logic.
- Change upload document logic.
- Change notification logic.
- Change claim verification or renewal logic.
- Add third-party performance library.
- Add persistent cache for sensitive back office data.
- Move sensitive back office fetching to client.
- Log PII or sensitive values.

## Tasks

### Task 1 — Verify current branch and commit
1. Checkout branch:

```bash
git checkout fix/mobile-suara-profile-admin-access-polish
git pull origin fix/mobile-suara-profile-admin-access-polish
```

2. Confirm latest audit commit exists:

```bash
git log --oneline --decorate -n 10
```

Look for:

```text
3b4e743 Audit back office DB query plans
```

3. Do not merge.

### Task 2 — Reproduce local measurement
Run:

```bash
PERF_DEBUG_BACK_OFFICE=true npm run dev
```

Open:

```text
http://localhost:3000/profil/admin-desa/dokumen
```

Capture perf logs for:
- `admin-desa.layout auth()`
- `admin-desa.dokumen auth()`
- `admin-desa.context query shape`
- `admin-desa.context duration`
- `admin-desa.dokumen query shape`
- `admin-desa.dokumen duration`

Run at least 3 times after initial warm-up and record:
- first load
- second load
- third load
- average estimate

Do not include real `userId`, `desaId`, email, token, document title, storage key, or file content.

### Task 3 — Update audit report with latest measurement
Update:

```text
docs/bmad/reports/back-office-performance-audit.md
```

Add a section like:

```md
## Latest Local Measurement — 2026-05-05

| Route / Step | Duration | Notes |
|---|---:|---|
| admin-desa.layout auth() | 330ms | Fluctuates; not main bottleneck |
| admin-desa.dokumen auth() | 330ms | Fluctuates; not main bottleneck |
| admin-desa.context desaAdminMember.findFirst | 1661ms | Main bottleneck |
| admin-desa.dokumen adminDesaDocument.findMany | 1278ms | Main bottleneck |
```

Also include sanitized query shape logs.

### Task 4 — Run EXPLAIN ANALYZE
Run `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)` for both query shapes in Supabase SQL editor or local Postgres.

Use real IDs only locally, but do not commit or paste the real values. Replace with `<redacted-user-id>` and `<redacted-desa-id>` in the report.

#### Query A — DesaAdminMember context

Adapt table names if Prisma mapped names differ.

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT m.*
FROM "DesaAdminMember" m
WHERE m."userId" = '<redacted-user-id>'
  AND m."status" IN ('LIMITED', 'VERIFIED')
ORDER BY m."updatedAt" DESC
LIMIT 1;
```

If actual generated SQL joins `Desa` and `User`, also run the joined version:

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT m.*, d.id, d.nama, u.id
FROM "DesaAdminMember" m
JOIN "Desa" d ON d.id = m."desaId"
JOIN "User" u ON u.id = m."userId"
WHERE m."userId" = '<redacted-user-id>'
  AND m."status" IN ('LIMITED', 'VERIFIED')
ORDER BY m."updatedAt" DESC
LIMIT 1;
```

#### Query B — AdminDesaDocument list

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT doc.*
FROM "AdminDesaDocument" doc
WHERE doc."desaId" = '<redacted-desa-id>'
ORDER BY doc."status" ASC, doc."createdAt" DESC
LIMIT 100;
```

If actual generated SQL joins uploader, also run the joined version:

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT doc.*, u.id, u.nama
FROM "AdminDesaDocument" doc
LEFT JOIN "User" u ON u.id = doc."uploadedById"
WHERE doc."desaId" = '<redacted-desa-id>'
ORDER BY doc."status" ASC, doc."createdAt" DESC
LIMIT 100;
```

### Task 5 — Analyze EXPLAIN result
For each query, document:
- Scan type:
  - `Seq Scan`
  - `Index Scan`
  - `Bitmap Index Scan`
  - `Bitmap Heap Scan`
- Whether there is a `Sort` node.
- Sort method and memory usage.
- Rows removed by filter.
- Actual execution time.
- Buffer hits/reads.
- Whether joins to `Desa` / `User` are cheap PK lookups.

Important:
Do not claim missing index unless EXPLAIN supports it.

### Task 6 — Update index proposal based on evidence
Update report with proposal only. Do not create migration.

Candidate indexes:

```prisma
model DesaAdminMember {
  @@index([userId, status])
}
```

Optional if EXPLAIN shows sort remains expensive:

```prisma
model DesaAdminMember {
  @@index([userId, status, updatedAt])
}
```

For documents:

```prisma
model AdminDesaDocument {
  @@index([desaId, createdAt])
  @@index([desaId, status, createdAt])
}
```

Add notes:
- `[userId, status]` helps context lookup.
- `[userId, status, updatedAt]` may better match `ORDER BY updatedAt DESC`.
- `[desaId, status, createdAt]` best matches current document tab order.
- Index direction for `createdAt DESC` must be checked against Prisma/Postgres behavior before migration.
- Migration requires owner approval.

### Task 7 — Quality checks
Run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Update report with result:
- pass/fail
- exact error if any
- if build fails due Google Fonts/network, state that clearly and do not hide it.

## Expected Deliverables
1. Updated:

```text
docs/bmad/reports/back-office-performance-audit.md
```

2. No migration file.
3. No business logic change.
4. No UI refactor.
5. No third-party package.
6. Clear recommendation:
   - P0 safe next step
   - P1 needs owner review
   - P2 infra/third-party only after DB root cause is resolved

## Acceptance Criteria
This task is complete when:
- Latest local logs are documented.
- Query shapes are documented without sensitive values.
- Real `EXPLAIN ANALYZE` results are summarized.
- Report states whether bottleneck is:
  - missing index,
  - expensive sort,
  - join overhead,
  - DB/network/connection latency,
  - or still inconclusive.
- Index proposal is evidence-based.
- lint, typecheck, and build status are recorded.
- No migration was created.

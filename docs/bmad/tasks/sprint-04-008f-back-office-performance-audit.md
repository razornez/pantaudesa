# Sprint 04-008F — Back Office Performance Audit

Status: **READY FOR EXECUTION**  
Type: **Audit first, no risky optimization yet**  
Owner direction: cari root cause dulu sebelum implement solusi besar.

---

## 1. Problem Statement

Back office terasa lambat saat load data. Beberapa halaman bisa terasa menunggu 5–10 detik, terutama pada jaringan kurang baik.

Area terdampak:

- `/profil/admin-desa/*`
- `/internal-admin/claims`
- `/internal-admin/documents`
- `/internal-admin/renewals`

Target UX jangka pendek:

- Shell/header/tab/shimmer tampil cepat, idealnya < 1 detik.
- Data utama boleh menyusul setelah query selesai.
- Tidak ada halaman terasa freeze/blank.

Target engineering:

- Audit dulu bagian mana yang lambat.
- Jangan langsung refactor besar.
- Jangan mengubah business logic approval, reject, role, upload, document processing, notification, atau admin verification.

---

## 2. Important Guardrails

Wajib ikuti aturan ini:

1. **Jangan merge ke `main` tanpa review owner.**
2. **Jangan ubah flow bisnis.**
3. **Jangan tambah persistent cache untuk data sensitif.**
4. **Jangan langsung pindahkan semua data fetching ke client.**
5. **Jangan tambah migration/index DB dulu sebelum ada audit report.**
6. **Jangan ubah schema Prisma kecuali sudah ada approval lanjutan.**
7. **Jangan menghilangkan auth/permission check demi performa.**
8. **Jangan tampilkan data palsu/dummy saat loading.** Pakai shimmer/skeleton saja.

Branch kerja yang dipakai saat task ini dibuat:

```bash
git checkout fix/mobile-suara-profile-admin-access-polish
```

---

## 3. References to Review Before Working

Baca dulu:

- Next.js `loading.tsx` / loading UI / streaming.
- Next.js Server Components + Suspense behavior.
- React `cache()` for request-level dedupe.
- Next.js instrumentation / OpenTelemetry.
- Prisma query performance, overfetching, missing index, repeated query.
- Existing BMAD checklist:
  - `docs/bmad/checklists/back-office-quiet-luxury-design-standard.md`
  - `docs/bmad/checklists/mobile-information-density-checklist.md`
  - `docs/bmad/checklists/inclusive-ui-ux-for-non-technical-users.md`

Catatan konsep:

- `loading.tsx` = mekanisme Next.js untuk menampilkan loading route.
- shimmer/skeleton = UI visual yang ditampilkan di dalam `loading.tsx`.
- React `cache()` hanya untuk dedupe dalam satu render/request, bukan cache global lintas user.

---

## 4. Task Phase 1 — Instrumentation / Measurement Only

Tujuan fase ini: tahu bagian mana yang lambat.

Tambahkan helper performa dev-only, misalnya:

```ts
perfLog("admin-desa.context", startTime)
```

Aturan helper:

- Aktif hanya jika:
  - `NODE_ENV !== "production"`, atau
  - `PERF_DEBUG_BACK_OFFICE=true`
- Jangan log email, user id, token, session, dokumen sensitif, atau secret.
- Format log disarankan:

```text
[perf][back-office] route=<route> step=<step> durationMs=<number>
```

Ukur minimal:

### Admin Desa

- `auth()`
- `getAdminDesaContext()`
- query list admin / roster
- query dokumen admin desa
- query suara warga admin desa
- query notifikasi admin desa

### Internal Admin

- auth/internal admin check
- query claims
- query documents
- query renewals
- query count/summary jika ada

Output fase 1:

- Report awal di:

```text
docs/bmad/reports/back-office-performance-audit.md
```

Isi report:

- route
- step yang diukur
- durasi lokal/staging jika tersedia
- dugaan bottleneck
- rekomendasi next step
- hal yang belum bisa dipastikan

---

## 5. Task Phase 2 — Loading Boundary / Perceived Performance

Tujuan fase ini: halaman tidak terasa freeze meskipun query belum optimal.

Tambahkan `loading.tsx` dengan shimmer/skeleton untuk route berikut:

```text
src/app/profil/admin-desa/loading.tsx
src/app/profil/admin-desa/profil/loading.tsx
src/app/profil/admin-desa/list-admin/loading.tsx
src/app/profil/admin-desa/dokumen/loading.tsx
src/app/profil/admin-desa/suara/loading.tsx
src/app/profil/admin-desa/notifikasi/loading.tsx
src/app/internal-admin/loading.tsx
src/app/internal-admin/claims/loading.tsx
src/app/internal-admin/documents/loading.tsx
src/app/internal-admin/renewals/loading.tsx
```

Skeleton requirements:

- Quiet luxury style.
- Mirip struktur konten asli.
- Tidak terlalu tinggi.
- Mobile friendly.
- Tidak memakai dummy text/data palsu.
- Jangan tampilkan stale data sebagai loading.

Acceptance untuk fase ini:

- Saat navigasi antar tab back office, user langsung melihat shell/loading state.
- Tidak ada layar kosong/freeze.
- Tidak mengubah business logic.

---

## 6. Task Phase 3 — Request-Level Dedupe Only

Tujuan fase ini: menghindari query context yang sama dipanggil berulang dalam satu render/request.

Boleh gunakan React `cache()` untuk helper yang aman, misalnya:

- `getAdminDesaContext(userId)`
- helper internal admin session/context jika ada dan aman

Aturan:

- Ini hanya request-level dedupe.
- Jangan gunakan persistent/global cache untuk role/status admin.
- Jangan cache data yang harus real-time seperti approval queue, notification unread, document status, atau claim status.
- Pastikan user-specific data tetap aman.

Acceptance:

- Helper context yang sering dipakai tidak query berulang dalam render yang sama.
- Tidak ada perubahan hasil data.

---

## 7. Task Phase 4 — Low-Risk Query Review

Tujuan fase ini: identifikasi query yang berat tanpa langsung mengubah banyak hal.

Cek dan tulis di report:

1. Query mana yang serial dan bisa diparalelkan.
2. Query mana yang overfetching.
3. Query mana yang mengambil JSON besar di list.
4. Query mana yang pakai `take: 100` atau lebih.
5. Query mana yang butuh pagination.
6. Query mana yang butuh index.

Low-risk improvement yang boleh dilakukan bila jelas aman:

- Hilangkan field besar yang tidak dipakai di list.
- Jangan fetch `aiMappingResult` di internal document list jika hanya dipakai saat modal publish.
- Fetch detail tambahan hanya saat modal/action dibuka.
- Kurangi payload response, bukan mengubah logic.

Yang belum boleh dilakukan tanpa approval:

- Mengubah schema DB.
- Mengubah workflow approval/reject.
- Mengubah status/role behavior.
- Menambah cache TTL untuk data sensitif.

---

## 8. Task Phase 5 — DB Index Proposal Only

Jangan langsung migrate.

Buat proposal index di report untuk query yang terbukti butuh index.

Format proposal:

```text
Model:
Index candidate:
Query yang dibantu:
Risiko:
Benefit:
Perlu migration sekarang: yes/no
```

Contoh kandidat yang perlu dianalisis, bukan langsung diterapkan:

```prisma
DesaAdminMember: [userId, status, updatedAt]
DesaAdminMember: [desaId, status]
DesaAdminMember: [status, renewalDueAt]
DesaAdminInvite: [desaId, status, createdAt]
AdminDesaDocument: [desaId, status, createdAt]
AdminDesaDocument: [status, updatedAt]
AdminDesaNotification: [userId, desaId, createdAt]
AdminDesaNotification: [userId, readAt, createdAt]
Voice: [desaId, createdAt]
Voice: [desaId, status, createdAt]
```

---

## 9. Optional Library / Third Party Assessment

Jangan install library dulu kecuali diminta.

Tulis assessment di report:

### `@vercel/otel` / OpenTelemetry

Gunanya:

- tracing route/server timing
- observability tanpa ubah flow bisnis

Rekomendasi awal:

- boleh dipertimbangkan setelah logging manual dirasa kurang

### Prisma Optimize

Gunanya:

- deteksi missing index
- repeated query
- overfetching
- full table scan

Rekomendasi awal:

- cocok untuk audit query sebelum migration

### TanStack Query

Gunanya:

- client-side stale-while-revalidate
- optimistic update
- fast tab navigation

Rekomendasi awal:

- jangan dipakai dulu untuk back office sensitif sebelum auth/cache design matang

### Prisma Accelerate

Gunanya:

- connection pooling / query caching / edge acceleration

Rekomendasi awal:

- jangan dipakai dulu kecuali bottleneck terbukti dari DB latency/connection/cold start

---

## 10. Deliverables

Wajib hasilkan:

1. Performance audit report:

```text
docs/bmad/reports/back-office-performance-audit.md
```

2. Loading skeleton route files, jika fase 2 dikerjakan.
3. Summary commit yang jelas.
4. Rekomendasi root cause, bukan asumsi.
5. Daftar solusi lanjutan yang diprioritaskan:

```text
P0: aman, bisa langsung
P1: perlu review owner
P2: perlu migration / infra / third party
```

---

## 11. Acceptance Criteria

Task dianggap selesai jika:

- Ada audit report.
- Ada data durasi minimal dari local/staging.
- Root cause sementara ditulis jelas.
- Hal yang belum pasti ditulis jelas.
- Tidak ada business logic yang berubah.
- Tidak ada DB migration tanpa approval.
- Loading/shimmer membuat back office tidak terasa blank/freeze.
- Build aman.

Commands minimal:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Jika Playwright tersedia dan tidak terlalu mahal:

```bash
npx playwright test
```

---

## 12. Suggested Execution Order

Jangan kerjakan semua sekaligus jika token/time terbatas.

Batch 1:

- instrumentation helper
- audit report template
- ukur route utama

Batch 2:

- loading skeleton untuk admin desa
- loading skeleton untuk internal admin

Batch 3:

- request-level `cache()` untuk context jika aman
- report hasil before/after

Batch 4:

- query hygiene proposal
- index proposal
- third-party assessment

---

## 13. Final Note for Implementer

Fokus utama task ini adalah **mencari root cause**.

Jangan mengejar klaim “load pasti <1 detik” sebelum tahu bottleneck asli. Yang harus dicapai dulu adalah:

```text
User melihat feedback visual cepat, developer tahu step mana yang lambat, dan solusi lanjutan punya dasar data.
```

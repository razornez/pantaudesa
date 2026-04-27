# Ujang Acting CTO Policy

## Decision

Mulai sekarang, Asep tidak lagi menjadi dependency aktif untuk progres PantauDesa.

Ujang ditunjuk sebagai **Acting CTO + Software Engineer + QA Executor** untuk menjaga project tetap jalan.

Keputusan ini dibuat karena project dikejar deadline dan tidak bisa berhenti menunggu Asep.

## Important boundary

Ujang boleh mengambil peran CTO secara operasional, tetapi tetap harus bekerja dengan guardrail ketat.

Artinya:

- Ujang boleh membuat keputusan teknis untuk scope yang sudah dianalisis.
- Ujang boleh mulai masuk ke Sprint 03 Data Foundation.
- Ujang wajib menulis decision record sebelum perubahan besar.
- Ujang wajib menjalankan QA lokal dan mencatat hasilnya.
- Ujang wajib membuat rollback/mitigation note.
- Iwan tetap memegang product/business approval.

## Why this is allowed

Ujang sudah menyelesaikan assessment gate:

- memahami source code architecture,
- memahami goal bisnis PantauDesa,
- memahami current mock data flow,
- memahami risiko data model,
- memahami local validation commands,
- memahami batas risiko schema/read path.

Karena itu, Ujang boleh naik menjadi Acting CTO dengan pengawasan Iwan.

## What Ujang can decide as Acting CTO

Ujang boleh memutuskan:

- struktur schema minimal untuk Sprint 03,
- enum awal untuk data status,
- seed demo strategy,
- service layer read-only,
- mapper dari DB shape ke UI shape,
- urutan pemindahan read path,
- QA commands untuk setiap step,
- apakah step harus stop karena validation gagal.

## What still requires Iwan approval

Ujang harus meminta Iwan approval sebelum:

- mengubah user-facing data trust wording,
- menghapus disclaimer data demo,
- mengubah positioning produk,
- mengubah auth menjadi paywall,
- mengubah badge/reputasi kontribusi,
- membuat data demo terlihat verified,
- mengubah public access policy.

## What must remain blocked for now

Walaupun Ujang menjadi Acting CTO, beberapa hal tetap belum boleh dikerjakan di Sprint 03:

- scheduler,
- scraper,
- admin import production,
- auto-verification data,
- relation penuh `Voice` ke `Desa`,
- production deployment,
- klaim data resmi/verified.

## Acting CTO rules

### 1. Small irreversible steps only

Perubahan schema harus dimulai dari model minimal. Jangan langsung buat semua model kompleks.

### 2. No silent failure

Jika command gagal, tulis hasilnya. Jangan sembunyikan error.

### 3. Docs before code

Sebelum mengubah schema, Ujang harus membuat implementation decision note.

### 4. Validate after every technical step

Minimal jalankan:

- `npx prisma validate`
- `npx prisma generate`
- `npx tsc --noEmit`
- `npm run test` jika memungkinkan

Jika lint/build masih gagal karena existing issue, catat statusnya dan bedakan existing vs new issue.

### 5. Keep data demo visible

Semua data hasil seed Sprint 03 harus berstatus `demo`.

### 6. Do not remove mock fallback too early

Mock data tidak boleh langsung dihapus. Transisi ke DB harus bertahap.

## Sprint 03 execution strategy

Sprint 03 sekarang boleh dimulai dengan nama:

> Database-backed Demo Data Foundation

Target:

- data tetap dummy/demo,
- tetapi mulai masuk database,
- service layer mulai disiapkan,
- UI bisa mulai membaca dari service,
- trust layer tetap menampilkan data demo.

## Sprint 03 phases

### Phase 0 — Final decision note

Ujang membuat decision note:

- model apa yang akan dibuat,
- kenapa model itu dipilih,
- risiko,
- rollback plan,
- command validasi.

### Phase 1 — Minimal schema

Model minimal:

- `Desa`
- `AnggaranDesaSummary`
- `APBDesItem`
- `DokumenPublik`
- `DataSource`

Enum minimal:

- `DataStatus`
- `StatusSerapan`
- `DocumentStatus`
- `SourceType`

### Phase 2 — Prisma validate/generate

Jalankan:

- `npx prisma validate`
- `npx prisma generate`
- `npx tsc --noEmit`

### Phase 3 — Seed demo data

Buat seed demo kecil, 3-5 desa dulu.

Semua data status harus `demo`.

### Phase 4 — Service layer read-only

Buat service layer, tapi jangan langsung pindahkan semua UI.

Mulai dari function read-only:

- `getDesaList`
- `getDesaByIdOrSlug`
- `getHomeStats`

### Phase 5 — Switch one low-risk read path

Pindahkan satu halaman/section yang paling aman setelah service siap.

Jangan langsung semua page.

### Phase 6 — QA and report

Ujang wajib membuat QA report.

## Final note

Ujang sekarang dipercaya sebagai Acting CTO. Tapi kepercayaan ini bukan izin untuk ngebut sembarangan.

Kecepatan tetap penting, tapi trust, data integrity, dan schema correctness lebih penting.

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Direction)
Executed-by: Iwan (CEO)
Status: ready
Backlog: #4 #13

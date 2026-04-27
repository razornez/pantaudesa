# Sprint 03 Acting CTO Decision Note

Phase: S3-00
Status: ready
Date: 2026-04-27

## Keputusan Ujang sebagai Acting CTO

Sprint 03 dimulai dengan tema Database-backed Demo Data Foundation.

Keputusan teknis awal:

- Mulai dari schema minimal, bukan model lengkap.
- Data tetap demo/dummy.
- Semua data seed wajib berstatus `demo`.
- Mock fallback tidak dihapus.
- Read path dipindah bertahap, dimulai dari area low-risk.
- Detail desa penuh tidak dipindahkan lebih dulu karena nested data detail masih paling kompleks.

## Model yang akan dibuat

Model minimal yang akan ditambahkan ke `prisma/schema.prisma`:

- `Desa`
- `AnggaranDesaSummary`
- `APBDesItem`
- `DokumenPublik`
- `DataSource`

Alasan:

- `Desa` menjadi anchor identitas dan route publik.
- `AnggaranDesaSummary` memisahkan data anggaran tahunan dari identitas desa.
- `APBDesItem` membuat rincian bidang bisa direlasikan dan diaudit.
- `DokumenPublik` mendukung hak warga untuk tahu dokumen apa yang tersedia/belum.
- `DataSource` menjaga data lineage agar data demo/imported/verified tidak tercampur.

## Enum yang akan dibuat

Enum minimal:

- `DataStatus`
- `StatusSerapan`
- `DocumentStatus`
- `SourceType`

Nilai awal yang direncanakan:

- `DataStatus`: `DEMO`, `IMPORTED`, `NEEDS_REVIEW`, `VERIFIED`, `OUTDATED`, `REJECTED`
- `StatusSerapan`: `BAIK`, `SEDANG`, `RENDAH`
- `DocumentStatus`: `TERSEDIA`, `BELUM`, `UNKNOWN`
- `SourceType`: `DEMO`, `MANUAL`, `IMPORTED`, `OFFICIAL`

Catatan:

- Enum Prisma memakai uppercase agar selaras dengan enum existing seperti `Role`, `VoiceStatus`, dan `VoteType`.
- Mapping ke UI akan tetap memakai string lowercase existing (`baik`, `sedang`, `rendah`) agar komponen tidak perlu refactor besar.

## Kenapa mulai minimal

Sprint 03 adalah pondasi, bukan full data automation.

Mulai minimal mengurangi risiko:

- tidak menyentuh auth/voice relation,
- tidak memaksa semua nested detail desa tersedia di DB,
- tidak membuat scheduler/scraper lebih awal,
- tidak membuat admin import production,
- menjaga public route tetap aman,
- membuat fallback mock tetap tersedia.

## Risiko utama

- Prisma generate bisa gagal karena file lock/permission query engine di local Windows.
- DB env mungkin belum tersedia, sehingga seed hanya bisa disiapkan dan belum bisa dijalankan.
- `generateStaticParams()` detail desa tidak boleh langsung bergantung pada DB.
- Data demo bisa terlihat verified jika mapper/service salah.
- `Voice.desaId` masih string dan tidak boleh langsung direlasikan ke `Desa`.
- Lint/build existing belum green penuh, jadi QA harus membedakan existing issue vs issue baru.

## Rollback plan

Jika validasi gagal karena schema baru:

1. Stop phase.
2. Jangan lanjut seed/service/read path.
3. Revert perubahan schema Sprint 03 saja.
4. Catat error di QA report.
5. Report ke Iwan sebelum mencoba desain lain.

Jika service/read path bermasalah:

1. Revert switch read path.
2. Pertahankan service/schema jika valid dan tidak memengaruhi public route.
3. Pastikan mock fallback masih aktif.
4. Catat route yang gagal dan penyebabnya.

Jika data demo terlihat verified:

1. Stop.
2. Perbaiki mapper/status copy.
3. Jangan lanjut sampai trust layer aman.

## Command QA yang akan dijalankan

Command wajib:

- `npx prisma validate`
- `npx prisma generate`
- `npx tsc --noEmit`
- `npm run test`
- `npm run lint`
- `npm run build` jika environment memungkinkan

Smoke check:

- homepage `/`
- list `/desa`
- detail `/desa/1`

Catatan:

- Jika command gagal karena environment/permission, hasil tetap dicatat.
- Jika command perlu eskalasi karena EPERM lokal, Ujang akan menjalankannya dengan izin sesuai policy.

## Batas yang tidak akan disentuh

Tidak akan dikerjakan di Sprint 03 phase ini:

- scheduler,
- scraper,
- admin import production,
- production deploy,
- relation `Voice` ke `Desa`,
- auth flow,
- API auth/users/voices,
- klaim data resmi/verified,
- penghapusan mock fallback,
- pemindahan detail desa penuh sebagai read path pertama.

## Report phase

S3-00 dianggap selesai jika file decision note ini sudah dibuat dan di-commit sebelum perubahan schema/code.


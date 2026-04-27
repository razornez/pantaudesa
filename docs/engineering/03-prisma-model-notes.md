# Prisma Model Notes

Learning task: L-02
Status: draft for Iwan/Asep review

## Scope

Catatan ini adalah pemahaman awal Ujang untuk Sprint 03 Data Foundation. Tidak ada perubahan ke `prisma/schema.prisma`.

## Kondisi Prisma saat ini

File: `prisma/schema.prisma`

Konfigurasi saat ini:

- Generator: `prisma-client-js`
- Output client: `src/generated/prisma`
- Database provider: `postgresql`
- Connection env: `DATABASE_URL`
- Direct connection env: `DIRECT_URL`

Model yang sudah ada:

- `User`
- `OtpCode`
- `Voice`
- `VoiceReply`
- `VoiceVote`
- `VoiceHelpful`
- `Account`
- `Session`
- `VerificationToken`

Enum yang sudah ada:

- `OtpPurpose`
- `VoiceCategory`
- `VoiceStatus`
- `VoteType`
- `Role`

Belum ada model database untuk data desa, ringkasan anggaran, APBDes, dokumen publik, atau data source.

## Catatan konsep Prisma

- Prisma schema adalah definisi kontrak antara database PostgreSQL dan Prisma Client.
- Model biasanya menjadi table, misalnya `Desa` menjadi table `desa` atau `desas` tergantung mapping.
- Field dengan `@id` menjadi primary key.
- Field relation memakai `@relation(fields: [x], references: [id])`.
- Enum membatasi nilai yang boleh dipakai, cocok untuk status seperti `demo`, `verified`, atau `needs_review`.
- Migration adalah perubahan schema database; ini berisiko kalau dilakukan tanpa review.
- Seed adalah data awal untuk development/demo; seed tidak berarti data sudah verified.
- `prisma generate` membuat client sesuai schema. Di repo ini build menjalankan `prisma generate && next build`.

## Model yang menurut Ujang dibutuhkan

### 1. Desa

Purpose:
Menyimpan identitas desa dan metadata dasar yang dipakai list/detail.

Field minimal:

- `id`
- `kodeDesa` optional
- `nama`
- `slug`
- `kecamatan`
- `kabupaten`
- `provinsi`
- `tahunData`
- `jumlahPenduduk` optional
- `kategori` optional
- `websiteUrl` optional
- `dataStatus`
- `createdAt`
- `updatedAt`

Catatan:

- `slug` berguna untuk URL yang lebih stabil dan ramah manusia.
- `kodeDesa` optional karena sumber data resmi mungkin belum tersedia untuk semua seed demo.
- `dataStatus` penting agar UI bisa membedakan demo/imported/verified.

### 2. AnggaranDesaSummary

Purpose:
Menyimpan ringkasan anggaran tahunan yang sekarang tampil di homepage, list, dan detail hero.

Field minimal:

- `id`
- `desaId`
- `tahun`
- `totalAnggaran`
- `totalRealisasi`
- `persentaseRealisasi`
- `statusSerapan`
- `dataStatus`
- `sourceId` optional
- `createdAt`
- `updatedAt`

Relation:

- Banyak `AnggaranDesaSummary` ke satu `Desa`.
- Satu desa bisa punya banyak tahun anggaran.

Catatan:

- Jangan simpan hanya satu angka di model `Desa`, karena anggaran berubah per tahun.
- `persentaseRealisasi` bisa dihitung dari total, tetapi menyimpannya dapat membuat query/list lebih sederhana. Asep perlu putuskan apakah disimpan atau dihitung.

### 3. APBDesItem

Purpose:
Menyimpan rincian bidang APBDes.

Field minimal:

- `id`
- `desaId`
- `tahun`
- `kodeBidang` optional
- `namaBidang`
- `anggaran`
- `realisasi`
- `persentase`
- `dataStatus`
- `sourceId` optional
- `createdAt`
- `updatedAt`

Relation:

- Banyak `APBDesItem` ke satu `Desa`.
- Optional relation ke `DataSource`.

Catatan:

- Item APBDes sebaiknya relation, bukan JSON di `Desa`, karena jumlah item bisa bertambah dan perlu query/filter.

### 4. DokumenPublik

Purpose:
Menyimpan checklist dokumen publik yang bisa dilihat/diminta warga.

Field minimal:

- `id`
- `desaId`
- `tahun`
- `namaDokumen`
- `jenisDokumen` optional
- `status`
- `url` optional
- `dataStatus`
- `sourceId` optional
- `updatedAt`

Relation:

- Banyak `DokumenPublik` ke satu `Desa`.
- Optional relation ke `DataSource`.

Catatan:

- Status dokumen sebaiknya bukan boolean saja. Mock saat ini pakai `tersedia: boolean`, tetapi DB lebih aman pakai enum `tersedia`, `belum`, `unknown`.

### 5. DataSource

Purpose:
Mencatat asal data agar trust layer punya dasar.

Field minimal:

- `id`
- `desaId` optional
- `sourceName`
- `sourceType`
- `url` optional
- `notes` optional
- `lastCheckedAt` optional
- `dataStatus`
- `createdAt`
- `updatedAt`

Relation:

- Bisa global atau per desa.
- Bisa dihubungkan ke summary, APBDes item, dan dokumen publik.

Catatan:

- Untuk seed demo, source bisa berupa `PantauDesa demo seed`.
- Untuk import nanti, source bisa menyimpan asal CSV/manual/official.

## Enum yang mungkin dibutuhkan

### DataStatus

Nilai dari plan:

- `demo`
- `imported`
- `needs_review`
- `verified`
- `outdated`
- `rejected`

Catatan:

- `demo`: data ilustrasi/mock/seed demo.
- `imported`: data sudah masuk dari sumber tertentu, tapi belum dicek.
- `needs_review`: data menunggu pengecekan.
- `verified`: data sudah dicek sebelum tampil sebagai kredibel.
- `outdated`: data lama dan perlu update.
- `rejected`: data ditolak karena salah/tidak layak tampil.

### StatusSerapan

Nilai yang selaras dengan UI saat ini:

- `baik`
- `sedang`
- `rendah`

### DocumentStatus

Draft:

- `tersedia`
- `belum`
- `unknown`

### SourceType

Draft:

- `demo`
- `manual`
- `imported`
- `official`

## Relation yang perlu dipahami

- `Desa` 1 -> banyak `AnggaranDesaSummary`.
- `Desa` 1 -> banyak `APBDesItem`.
- `Desa` 1 -> banyak `DokumenPublik`.
- `Desa` 1 -> banyak `DataSource` jika source dicatat per desa.
- `DataSource` 1 -> banyak summary/APBDes/dokumen jika source dipakai sebagai referensi asal data.
- `Voice` saat ini punya `desaId: String`, tetapi belum relation ke `Desa`. Ini perlu keputusan khusus karena mengubahnya bisa menyentuh fitur suara warga.

## Field yang mungkin optional

- `kodeDesa`
- `websiteUrl`
- `jumlahPenduduk`
- `kategori`
- `sourceId` pada summary/item/dokumen
- `url` pada dokumen
- `lastCheckedAt`

## Risiko mengubah schema sembarangan

- Migration bisa gagal atau tidak cocok dengan database Supabase.
- Generated client berubah dan bisa mematahkan import di auth/API.
- Existing table auth dan voice sudah dipakai; perubahan relation ke `User`/`Voice` berisiko tinggi.
- Build menjalankan `prisma generate`, jadi schema invalid akan memblokir build.
- Jika data desa langsung diberi relation ke `Voice`, semua route suara warga perlu review.

## Pertanyaan untuk Asep sebelum implementasi

- Apakah model `Desa` harus memakai `slug` wajib, atau cukup `id` untuk Sprint 03?
- Apakah `kodeDesa` wajib sejak awal atau optional sampai sumber resmi tersedia?
- Apakah `AnggaranDesaSummary` dipisah dari `Desa` atau sementara satu model dulu?
- Apakah `persentaseRealisasi` disimpan di DB atau dihitung di service layer?
- Apakah `dataStatus` enum global dipakai di semua model?
- Apakah `Voice.desaId` tetap string bebas dulu atau mulai relation ke `Desa`?
- Apakah seed Sprint 03 cukup untuk data utama saja, atau harus mengisi APBDes dan dokumen juga?


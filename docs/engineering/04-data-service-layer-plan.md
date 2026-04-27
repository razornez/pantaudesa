# Data Service Layer Plan

Learning task: L-03
Status: draft for Iwan/Asep review

## Scope

Ini rencana service layer untuk Sprint 03 setelah Asep review. Belum ada implementasi dan belum ada perubahan read path utama.

## Tujuan service layer

UI tidak sebaiknya langsung tahu apakah data berasal dari `mock-data.ts`, Prisma, atau fallback lain. Service layer menjadi batas agar perubahan sumber data bisa dikendalikan.

Target jangka pendek:

- homepage/detail/list tetap menerima shape data yang stabil,
- sumber data bisa pindah ke DB demo,
- trust layer bisa membaca `dataStatus`,
- fallback bisa dibahas tanpa menyebar logika ke komponen UI.

## Function yang dibutuhkan

### `getHomeStats()`

Dipakai oleh:

- `src/app/page.tsx`
- `StatsCards`
- `SerapanDonut`

Return minimal:

- `totalAnggaranNasional`
- `totalDesa`
- `rataRataSerapan`
- `desaSerapanBaik`
- `desaSerapanSedang`
- `desaSerapanRendah`
- `totalTerealisasi`
- `rataRataSkorTransparansi` optional/fallback
- `dataStatus` agregat optional

Catatan:

- Bisa dihitung dari `AnggaranDesaSummary`.
- Jika skor transparansi belum ada di DB, service perlu fallback nilai kosong atau tidak menampilkan metrik tertentu.

### `getHomeTrend()`

Dipakai oleh:

- `src/app/page.tsx`
- `TrendChart`

Return minimal:

- `bulan`
- `anggaran`
- `realisasi`

Catatan:

- Sprint 03 mungkin belum punya tabel trend bulanan. Bisa tetap mock/fallback dengan keputusan Asep.

### `getFeaturedDesa()`

Dipakai oleh:

- `src/app/page.tsx`
- `AlertDiniSection`
- `DesaLeaderboard`

Return minimal:

- `topBaik`
- `topRendah`
- `alertDini`
- `provinsiRanking`

Field desa minimal:

- `id`
- `nama`
- `kabupaten`
- `provinsi`
- `totalAnggaran`
- `terealisasi`
- `persentaseSerapan`
- `status`
- `riwayat` optional untuk downtrend

Catatan:

- Untuk Sprint 03, ranking bisa dihitung dari summary tahun aktif.
- Jika `riwayat` belum tersedia, alert dini tetap bisa jalan tanpa indikator downtrend.

### `getDesaList(params)`

Dipakai oleh:

- `src/app/desa/page.tsx`
- `SearchFilterBar`
- `DesaCard`
- `DesaTable`

Input draft:

- `search`
- `provinsi`
- `status`
- `sortField`
- `sortOrder`
- `page`
- `pageSize`

Return minimal:

- `items`
- `total`
- `totalPages`
- `provinsiList`

Field item minimal:

- `id`
- `slug` optional jika URL berubah
- `nama`
- `kecamatan`
- `kabupaten`
- `provinsi`
- `totalAnggaran`
- `terealisasi`
- `persentaseSerapan`
- `status`
- `penduduk`
- `kategori`
- `dataStatus`

Catatan:

- Saat ini list filtering terjadi client-side di component. Kalau pindah ke DB, Asep perlu putuskan apakah page tetap client dengan preloaded data atau filtering pindah ke query/server.

### `getDesaByIdOrSlug(idOrSlug)`

Dipakai oleh:

- `src/app/desa/[id]/page.tsx`
- `generateMetadata`
- halaman detail lain yang butuh desa.

Return minimal:

- identitas desa,
- summary anggaran tahun aktif,
- pendapatan optional,
- APBDes items,
- dokumen publik,
- data source/status.

Field detail minimal:

- `id`
- `slug`
- `nama`
- `kecamatan`
- `kabupaten`
- `provinsi`
- `tahun`
- `penduduk`
- `kategori`
- `totalAnggaran`
- `terealisasi`
- `persentaseSerapan`
- `status`
- `dataStatus`
- `pendapatan` optional
- `apbdes` optional
- `dokumen` optional
- `dataSources` optional

Optional visual:

- `outputFisik`
- `riwayat`
- `skorTransparansi`
- `perangkat`
- `profil`

Catatan:

- UI detail saat ini kaya visual dan banyak field optional. Service harus jelas membedakan data wajib dan data tambahan.

### `getDesaStaticParams()`

Dipakai oleh:

- `generateStaticParams()` di detail.

Return minimal:

- array `{ id: string }` atau `{ slug: string }`.

Catatan:

- Karena DB access saat build bisa berisiko, Asep perlu putuskan apakah detail tetap static, dynamic, atau fallback.

### `getProvinsiList()`

Dipakai oleh:

- `src/app/desa/page.tsx`
- `SearchFilterBar`

Return:

- daftar provinsi unik.

Catatan:

- Bisa digabung di `getDesaList`.

## Shape compatibility

Untuk mengurangi risiko, service awal bisa mengembalikan shape yang mirip `Desa` dari `src/lib/types.ts`, tetapi internal mapping dari DB dibuat terpusat.

Contoh mapping konseptual:

- `Desa.nama` dari `Desa.nama`
- `Desa.totalAnggaran` dari `AnggaranDesaSummary.totalAnggaran`
- `Desa.terealisasi` dari `AnggaranDesaSummary.totalRealisasi`
- `Desa.persentaseSerapan` dari `AnggaranDesaSummary.persentaseRealisasi`
- `Desa.status` dari `AnggaranDesaSummary.statusSerapan`
- `Desa.dokumen[]` dari `DokumenPublik[]`
- `Desa.apbdes[]` dari `APBDesItem[]`

## Risiko jika langsung pindah dari mock ke DB

- Build bisa gagal jika DB belum tersedia saat `generateStaticParams()` berjalan.
- Homepage bisa lambat jika agregasi dilakukan tanpa index/strategi query.
- Component client seperti daftar desa saat ini mengandalkan data lengkap di browser; DB pagination bisa mengubah UX.
- Banyak field visual detail belum ada di model minimal, sehingga butuh fallback yang disepakati.
- Data status bisa salah dipahami jika `demo` tidak dikirim dari service.
- `Voice` masih pakai `desaId` string; jika ID/slug berubah, relasi suara warga bisa tidak cocok.
- Perubahan schema tanpa seed akan membuat halaman publik kosong.

## Saran urutan implementasi setelah Asep approve

1. Finalisasi model dan enum di docs atau schema.
2. Buat seed demo kecil yang mencakup minimal 3-5 desa.
3. Buat service read-only dengan fallback yang jelas.
4. Tambah test mapping service untuk memastikan shape sesuai UI.
5. Pindahkan homepage/list ke service dulu.
6. Pindahkan detail desa setelah data nested minimal siap.
7. Hubungkan trust layer ke `dataStatus`.

## Hal yang sengaja tidak dilakukan sekarang

- Tidak membuat file service.
- Tidak mengubah import page dari `mock-data.ts`.
- Tidak mengubah schema Prisma.
- Tidak membuat seed.
- Tidak membuat API route.
- Tidak mengubah auth/voice/admin/scheduler.


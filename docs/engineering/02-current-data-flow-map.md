# Current Data Flow Map

Learning task: L-01
Status: draft for Iwan/Asep review

## Scope

Catatan ini hanya memetakan jalur data saat ini. Tidak ada perubahan schema, API route, auth flow, scheduler, scraper, admin import, atau read path utama aplikasi.

## Source of truth saat ini

Data desa publik sekarang berasal dari `src/lib/mock-data.ts`.

File itu membentuk data dari beberapa bagian:

- `desaBase`: identitas desa, wilayah, anggaran ringkas, status serapan, tahun, penduduk, kategori.
- Helper generator: `mkApbdes`, `mkOutputFisik`, `mkDokumen`, `mkSkor`, `mkRiwayat`, `mkPendapatan`.
- Data tambahan: `allPerangkat`, `allTrend`, `allSkor`.
- Profil desa dari `src/lib/profil-desa.ts` lewat `mkProfilDesa`.

Export yang dipakai aplikasi:

- `mockDesa`: daftar desa lengkap.
- `mockTrendData`: tren nasional bulanan.
- `mockSummaryStats`: ringkasan nasional hasil agregasi dari `mockDesa`.
- `provinsiList`: daftar provinsi hasil turunan dari `mockDesa`.
- `kategoriList`: daftar kategori hasil turunan dari `mockDesa`.

Type shape utama ada di `src/lib/types.ts`.

## File yang memakai mock data

### Public data pages

- `src/app/page.tsx`
  - Import: `mockSummaryStats`, `mockTrendData`, `mockDesa`.
  - Menghitung `topBaik`, `topRendah`, dan ranking provinsi.
  - Mengoper data ke `HeroSection`, `StatsCards`, `AlertDiniSection`, `TrendChart`, `SerapanDonut`, `DesaLeaderboard`.

- `src/app/desa/page.tsx`
  - Import: `mockDesa`, `provinsiList`.
  - Melakukan search, filter provinsi, filter status, sort, pagination.
  - Mengoper data ke `SearchFilterBar`, `DesaCard`, `DesaTable`.

- `src/app/desa/[id]/page.tsx`
  - Import: `mockDesa`.
  - `generateStaticParams()` membuat route dari `mockDesa.map`.
  - `generateMetadata()` mencari desa dengan `id`.
  - Page detail mencari desa dengan `id`, lalu mengoper data ke card/detail sections.

- `src/app/desa/[id]/suara/page.tsx`
  - Import: `mockDesa`.
  - Memakai `generateStaticParams()` dan lookup desa untuk halaman suara per desa.

- `src/app/suara/page.tsx`
  - Import: `mockDesa`.
  - Membuat `desaMap` untuk menampilkan konteks desa pada suara warga.

- `src/components/suara/VoiceStats.tsx`
  - Import: `mockDesa`.
  - Membuat map `desaId -> nama` untuk statistik suara.

### Supporting/demo pages

- `src/app/bandingkan/page.tsx`
  - Import: `mockDesa`.
  - Search dan compare beberapa desa.

- `src/app/profil/saya/page.tsx`
  - Import: `mockDesa`.
  - Membuat `desaMap` untuk nama desa dari aktivitas warga.

- `src/app/profil/[username]/page.tsx`
  - Import: `mockDesa`.
  - Membuat `desaMap` untuk profil publik warga.

- `src/app/desa-admin/page.tsx`
  - Import: `mockDesa`.
  - Demo dashboard admin desa berdasarkan `user.desaId`.

- `src/app/desa-admin/profil/page.tsx`
  - Import: `mockDesa`.
  - Demo profil desa berdasarkan `user.desaId`.

## Field yang dipakai homepage

Homepage memakai kombinasi data agregat dan daftar desa.

Data agregat dari `mockSummaryStats`:

- `totalAnggaranNasional`
- `totalDesa`
- `rataRataSerapan`
- `desaSerapanBaik`
- `desaSerapanSedang`
- `desaSerapanRendah`
- `totalTerealisasi`
- `rataRataSkorTransparansi`

Data trend dari `mockTrendData`:

- `bulan`
- `anggaran`
- `realisasi`

Field `Desa` yang dipakai untuk section homepage:

- `id`: link ke detail desa.
- `nama`: leaderboard dan alert dini.
- `kabupaten`, `provinsi`: konteks lokasi.
- `totalAnggaran`, `terealisasi`: kartu/list.
- `persentaseSerapan`: ranking, alert dini, progress, status visual.
- `status`: top baik/rendah dan badge status.
- `riwayat`: deteksi tren turun pada alert dini.

Homepage juga menghitung ranking provinsi dari:

- `provinsi`
- `persentaseSerapan`
- `nama`

## Field yang dipakai daftar desa

`src/app/desa/page.tsx` dan komponen list/table memakai:

- `id`
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

Untuk filter:

- `provinsi`
- `status`
- `nama`, `kecamatan`, `kabupaten`, `provinsi` untuk search.

Untuk sort:

- `nama`
- `totalAnggaran`
- `persentaseSerapan`
- `terealisasi`

## Field yang dipakai detail desa

`src/app/desa/[id]/page.tsx` dan komponen detail memakai:

Identitas:

- `id`
- `nama`
- `kecamatan`
- `kabupaten`
- `provinsi`
- `tahun`
- `penduduk`
- `kategori`

Ringkasan anggaran:

- `totalAnggaran`
- `terealisasi`
- `persentaseSerapan`
- `status`
- sisa anggaran dihitung dari `totalAnggaran - terealisasi`

Pendapatan:

- `pendapatan.danaDesa`
- `pendapatan.add`
- `pendapatan.pades`
- `pendapatan.bantuanKeuangan`

Rincian APBDes:

- `apbdes[].kode`
- `apbdes[].bidang`
- `apbdes[].anggaran`
- `apbdes[].realisasi`
- `apbdes[].persentase`

Output fisik:

- `outputFisik[].label`
- `outputFisik[].satuan`
- `outputFisik[].target`
- `outputFisik[].realisasi`
- `outputFisik[].persentase`

Riwayat:

- `riwayat[].tahun`
- `riwayat[].totalAnggaran`
- `riwayat[].terealisasi`
- `riwayat[].persentaseSerapan`

Transparansi:

- `skorTransparansi.total`
- `skorTransparansi.ketepatan`
- `skorTransparansi.kelengkapan`
- `skorTransparansi.responsif`
- `skorTransparansi.konsistensi`

Perangkat:

- `perangkat[].jabatan`
- `perangkat[].nama`
- `perangkat[].periode`
- `perangkat[].kontak`

Dokumen:

- `dokumen[].nama`
- `dokumen[].jenis`
- `dokumen[].tahun`
- `dokumen[].tersedia`

Profil visual:

- `profil.website`
- `profil.luasWilayah`
- `profil.luasSawah`
- `profil.luasHutan`
- `profil.jumlahDusun`
- `profil.jumlahRt`
- `profil.jumlahRw`
- `profil.jumlahKk`
- `profil.mataPencaharian`
- `profil.potensiUnggulan`
- `profil.terakhirDiperbarui`
- `profil.aset[]`
- `profil.fasilitas[]`
- `profil.lembaga[]`
- `profil.bumdes`
- `profil.historyBelanja`
- `profil.badge`

## Field wajib untuk MVP database-backed demo

Minimal agar homepage, daftar desa, dan detail utama tetap berjalan:

- `Desa.id`
- `Desa.nama`
- `Desa.slug` atau strategi pengganti `id` untuk URL.
- `Desa.kecamatan`
- `Desa.kabupaten`
- `Desa.provinsi`
- `Desa.tahunData`
- `Desa.jumlahPenduduk`
- `Desa.kategori` atau `fokus/kategori`.
- `Desa.websiteUrl` optional tapi berguna untuk trust.
- `Desa.dataStatus`

Ringkasan anggaran:

- `desaId`
- `tahun`
- `totalAnggaran`
- `totalRealisasi`
- `persentaseRealisasi`
- `statusSerapan`
- `dataStatus`
- `sourceId` atau `sumberData` awal.

Rincian dasar:

- `APBDesItem`: minimal `desaId`, `tahun`, `kodeBidang`, `namaBidang`, `anggaran`, `realisasi`, `persentase`, `dataStatus`.
- `DokumenPublik`: minimal `desaId`, `tahun`, `namaDokumen`, `status`, `url`, `dataStatus`.
- `DataSource`: minimal `sourceName`, `sourceType`, `url`, `notes`, `lastCheckedAt`, `dataStatus`.

## Field yang bisa ditunda

Ini penting untuk pengalaman visual, tetapi tidak perlu menjadi blocker Sprint 03 awal:

- `OutputFisik`
- `RiwayatTahunan`
- `SkorTransparansi` detail per metrik
- `PerangkatDesa`
- `ProfilDesa.aset`
- `ProfilDesa.fasilitas`
- `ProfilDesa.lembaga`
- `ProfilDesa.bumdes`
- `ProfilDesa.historyBelanja`
- `ProfilDesa.badge`
- Ranking provinsi yang presisi jika data awal masih sedikit.

Catatan: jika field ini ditunda, UI harus punya fallback/empty state yang disepakati Asep sebelum read path dipindah.

## Risiko transisi dari mock ke DB

- `generateStaticParams()` detail desa sekarang bergantung pada `mockDesa`; jika pindah ke DB, perlu strategi build/runtime yang aman.
- `mockSummaryStats` saat ini dihitung di module load; di DB perlu query agregasi atau service khusus.
- Banyak komponen mengasumsikan nested optional data tersedia; kalau DB seed minimal belum punya data visual, halaman bisa kosong atau timpang.
- Status data saat ini hanya copy static demo; Sprint 03 perlu field `dataStatus` agar trust layer tidak hanya hardcoded.
- `Voice` sudah menyimpan `desaId` sebagai string tanpa relation ke model desa; relation masa depan perlu diputuskan hati-hati agar tidak mematahkan fitur suara warga.


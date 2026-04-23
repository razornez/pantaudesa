# Changelog

Semua perubahan penting pada proyek PantauDesa didokumentasikan di sini.  
Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

> Fitur-fitur yang sedang dalam rencana atau pengerjaan.

- Peta choropleth interaktif Indonesia (drill-down provinsi → kabupaten → desa)
- Halaman `/panduan` — glossary dan FAQ keresahan warga
- Fitur "Bandingkan Desa" — perbandingan side-by-side 2–3 desa
- QR code per desa untuk transparansi offline-to-online
- Halaman `/cerita-data` — narasi investigatif berbasis data
- Form pengaduan warga terintegrasi per halaman desa
- Integrasi data resmi: OMSPAN, SIPD, OpenData DJPK Kemenkeu

---

## [0.3.0] — 2026-04-23

### `feat(language): humanize all UI copy — from jargon to citizen voice`

Commit: `9def2c3`

Perubahan fundamental pada identitas platform: dari dashboard keuangan menjadi
suara rakyat. Seluruh teks UI ditulis ulang dari bahasa jargon anggaran ke bahasa
yang langsung dipahami warga tanpa latar belakang keuangan.

#### Arsitektur Baru

| File | Peran |
|---|---|
| `src/lib/copy.ts` | Satu sumber kebenaran seluruh teks UI — tidak ada string yang di-hardcode di komponen manapun (DRY) |
| `src/lib/verdicts.ts` | Fungsi murni yang menghasilkan pesan berjiwa berdasarkan data — tanpa efek samping (SRP) |
| `src/lib/utils.ts` | Tambah `getVerdictColors()` — mapping tone → Tailwind classes, memisahkan UI concern dari domain logic (ISP) |
| `src/components/ui/VerdictBanner.tsx` | Komponen reusable untuk menampilkan verdict di mana saja (DRY) |

#### Transformasi Bahasa

| Konteks | Sebelum | Sesudah |
|---|---|---|
| Status badge | "Rendah" | "Perlu Diawasi" |
| Status badge | "Sedang" | "Perlu Ditingkatkan" |
| Label budget | "Belum Terserap" | "Belum Jelas Penggunaannya" |
| Label budget | "Terealisasi" | "Sudah Digunakan" |
| Label budget | "Total Anggaran" | "Uang yang Diterima Desa" |
| Progress bar | "Penyerapan Anggaran" | "Anggaran yang sudah dipakai" |
| Verdict serapan | *(tidak ada)* | Kalimat jujur otomatis, contoh: *"Sebagian besar anggaran (Rp 682 Jt) belum jelas penggunaannya. Desa ini perlu pengawasan serius dari warganya."* |
| Section APBDes | "Rincian APBDes per Bidang" | "Anggaran Ini Dipakai untuk Apa Saja?" |
| Bidang kode 1 | "Penyelenggaraan Pemerintahan Desa" | "Operasional Kantor & Gaji Perangkat Desa" |
| Bidang kode 2 | "Pelaksanaan Pembangunan Desa" | "Pembangunan Fisik (Jalan, Gedung, Drainase, dll.)" |
| Bidang kode 3 | "Pembinaan Kemasyarakatan Desa" | "Program Sosial & Kemasyarakatan" |
| Bidang kode 4 | "Pemberdayaan Masyarakat Desa" | "Pelatihan & Pemberdayaan Warga" |
| Bidang kode 5 | "Penanggulangan Bencana & Darurat" | "Dana Siaga Bencana & Darurat" |
| Output fisik label | "Target: 3.2 km" | "Seharusnya ada: 3.2 km" |
| Output fisik label | "Realisasi: 3.0 km" | "Sudah ada/dikerjakan: 3.0 km" |
| Section perangkat | "Perangkat Desa" | "Siapa yang Harus Kamu Tanya?" |
| Section riwayat | "Tren Serapan 5 Tahun" | "Apakah Kinerjanya Membaik dari Tahun ke Tahun?" |
| Verdict tren | "Naik X poin dalam 5 tahun" | "Bagus! Kinerjanya terus membaik — naik X poin selama 5 tahun terakhir." |
| Verdict tren | "Turun X poin" | "Waspada: kinerja makin memburuk setiap tahunnya — ini tanda bahaya." |
| Section skor | "Skor Transparansi" | "Seberapa Terbuka Desa Ini ke Warganya?" |
| Skor label | "Perlu Peningkatan" | "Desa ini kurang terbuka — kamu berhak meminta informasi" |
| Metrik skor | "Ketepatan Pelaporan" | "Laporan disampaikan tepat waktu?" |
| Metrik skor | "Kelengkapan Dokumen" | "Dokumen publik bisa diakses warga?" |
| Metrik skor | "Responsivitas Pengaduan" | "Cepat merespons pertanyaan warga?" |
| Section dokumen | "Dokumen Publik" | "Dokumen yang Bisa Kamu Minta ke Desa" |
| Dokumen belum ada | "Belum ada" | "Belum ada — kamu berhak memintanya!" |
| Section pengaduan | "Laporkan Masalah" | "Ada yang Tidak Beres?" |
| Teks pengaduan | Singkat & formal | Empatik: *"Jika ada yang tidak sesuai — jalan rusak padahal ada anggarannya, bansos tidak merata, fasilitas dijanjikan tapi tidak ada — kamu berhak melapor. Suaramu penting."* |
| Stats card | "Total Anggaran Nasional" | "Total Uang Negara untuk Desa" |
| Stats card | "Serapan Baik (≥85%)" | "Desa dengan Kinerja Baik" |
| Stats card | "Serapan Rendah (<60%)" | "Desa yang Perlu Diawasi" |
| Filter button | "Rendah <60%" | "Perlu Diawasi (<60%)" |
| Filter total | "Menampilkan X desa" | "Ditemukan X desa" |
| Tren chart | "Anggaran" / "Realisasi" | "Total Anggaran" / "Sudah Dipakai" |
| Donut chart | "Baik (≥85%)" | "Kinerja Baik (≥85%)" |
| Top table | "Perlu Perhatian" | "Desa yang Harus Diawasi" |
| Top table sub | "5 desa dengan serapan terendah..." | "5 desa dengan penggunaan anggaran paling rendah — warga perlu turun tangan" |
| Hero title | "Transparansi Penyerapan Anggaran Dana Desa" | "Uang desamu sudah dipakai untuk apa?" |
| Hero subtitle | Teknis & formal | *"Setiap tahun desamu mendapat miliaran rupiah dari negara. Uang itu untuk kamu — rakyatnya..."* |
| CTA button | "Cari Data Desa" | "Cari Desamu Sekarang" |
| Footer tagline | "Platform transparansi anggaran dan penyerapan dana desa Indonesia" | "Kami hadir untuk menjawab pertanyaan yang selama ini tidak pernah dijawab — tentang uang desamu." |
| Halaman `/desa` title | "Data Desa" | "Data Desa" *(tetap, sudah tepat)* |
| Kolom tabel | "Anggaran" | "Uang Diterima" |
| Kolom tabel | "Realisasi" | "Sudah Dipakai" |
| Kolom tabel | "Serapan" | "% Terpakai" |
| Link tabel | "Detail" | "Lihat Detail" |

#### Fitur Baru

- **VerdictBanner** muncul tepat di bawah progress bar di halaman detail — kalimat
  jujur otomatis yang langsung menjawab "ini artinya apa?" berdasarkan persentase
  serapan, tanpa warga perlu menghitung sendiri.
- **Hint text** di setiap bidang APBDes — kalimat pendek yang menjelaskan dengan
  bahasa manusia apa yang dimaksud tiap kategori anggaran.
- **Framing "Seharusnya ada / Sudah ada"** di output fisik — mengubah laporan
  teknis menjadi pernyataan berbasis hak warga.
- **Teks pengaduan yang empatik** — bukan sekadar link ke portal, tapi kalimat
  yang memeluk keresahan warga dan mempertegas bahwa melapor adalah hak mereka.

#### Komponen yang Diubah

- `src/components/home/StatsCards.tsx`
- `src/components/home/TrendChart.tsx`
- `src/components/home/SerapanDonut.tsx`
- `src/components/home/AlertDiniSection.tsx`
- `src/components/desa/APBDesBreakdown.tsx`
- `src/components/desa/SkorTransparansiCard.tsx`
- `src/components/desa/OutputFisikCards.tsx`
- `src/components/desa/PerangkatDesaSection.tsx`
- `src/components/desa/RiwayatChart.tsx`
- `src/components/desa/DesaCard.tsx`
- `src/components/desa/DesaTable.tsx`
- `src/components/desa/SearchFilterBar.tsx`
- `src/components/layout/Footer.tsx`
- `src/app/page.tsx`
- `src/app/desa/[id]/page.tsx`

---

## [0.2.0] — 2026-04-23

### `feat(data): enrich desa model with APBDes, output fisik, perangkat, riwayat, transparansi`

Perluasan besar pada layer data dan halaman detail desa: dari dashboard angka sederhana
menjadi profil desa yang komprehensif dan akuntabel.

#### Ditambahkan

**Data Layer**
- `src/lib/types.ts` — interface baru: `APBDesItem`, `OutputFisik`, `PerangkatDesa`,
  `RiwayatTahunan`, `DokumenPublik`, `SkorTransparansi`, `PendapatanDesa`
- `src/lib/mock-data.ts` — 20 desa kini masing-masing memiliki:
  - APBDes breakdown 5 bidang dengan realisasi per bidang
  - Output fisik 3 program (target vs realisasi)
  - Profil 4 perangkat desa dengan kontak dan periode jabatan
  - Riwayat serapan 5 tahun (2020–2024) dengan tren realistis
  - 5 dokumen publik dengan status ketersediaan
  - Skor transparansi komposit (4 sub-indikator)
  - Breakdown sumber pendapatan desa (Dana Desa, ADD, PADes, Bantuan)

**Komponen Baru**
- `src/components/desa/APBDesBreakdown.tsx` — rincian anggaran per bidang dengan progress bar
- `src/components/desa/SkorTransparansiCard.tsx` — skor keterbukaan dengan 4 metrik
- `src/components/desa/OutputFisikCards.tsx` — capaian fisik program
- `src/components/desa/PerangkatDesaSection.tsx` — profil pejabat desa
- `src/components/desa/RiwayatChart.tsx` — line chart tren 5 tahun + mini tabel per tahun
- `src/components/desa/DownloadButton.tsx` — ekspor data desa ke CSV
- `src/components/home/AlertDiniSection.tsx` — panel peringatan desa serapan < 50%

**Halaman Detail Desa** (`/desa/[id]`)
- Tambah seksi: Sumber Pendapatan Desa
- Tambah seksi: Skor Transparansi
- Tambah seksi: Output Fisik
- Tambah seksi: Rincian APBDes per Bidang
- Tambah seksi: Tren 5 Tahun
- Tambah seksi: Perangkat Desa
- Tambah seksi: Dokumen Publik
- Tambah seksi: Laporkan Masalah
- Tambah tombol: Unduh Data CSV
- Tambah tombol: Kembali ke daftar (header)

**Halaman Beranda** (`/`)
- Tambah: Banner Skor Transparansi Nasional di bawah stats cards
- Tambah: Panel Peringatan Dini (desa < 50% serapan)
- Tambah: Peringkat rata-rata serapan per provinsi

#### Diubah

- `src/lib/types.ts` — `SummaryStats` tambah field `rataRataSkorTransparansi`
- `src/components/home/StatsCards.tsx` — tambah banner skor transparansi nasional

---

## [0.1.0] — 2026-04-23

### `init`

Commit: `00d2566`

Inisialisasi proyek PantauDesa — fondasi platform monitoring penyerapan anggaran dana desa.

#### Ditambahkan

**Struktur Proyek**
- Next.js 16 (App Router) + TypeScript 5 + Tailwind CSS 4 + Recharts

**Data Layer**
- `src/lib/types.ts` — interface `Desa`, `TrendData`, `SummaryStats`
- `src/lib/mock-data.ts` — 20 desa dari berbagai provinsi Indonesia
- `src/lib/utils.ts` — `formatRupiah`, `formatRupiahFull`, `getStatusColor`, `getStatusLabel`, `getSerapanColor`

**Komponen**
- `src/components/layout/Navbar.tsx` — navigasi sticky dengan mobile menu
- `src/components/layout/Footer.tsx` — footer dengan branding
- `src/components/home/StatsCards.tsx` — 6 kartu ringkasan nasional
- `src/components/home/TrendChart.tsx` — area chart anggaran vs realisasi bulanan
- `src/components/home/SerapanDonut.tsx` — donut chart distribusi status desa
- `src/components/home/TopDesaTable.tsx` — tabel desa terbaik & terendah
- `src/components/desa/SearchFilterBar.tsx` — pencarian + filter provinsi & status
- `src/components/desa/DesaCard.tsx` — kartu grid desa
- `src/components/desa/DesaTable.tsx` — tabel desa dengan sort
- `src/components/desa/BudgetBarChart.tsx` — bar chart anggaran vs realisasi

**Halaman**
- `/` — beranda dengan hero, stats, chart, top tables
- `/desa` — daftar desa dengan search, filter, sort, pagination, dual view
- `/desa/[id]` — detail desa: header, budget stats, chart, info panel
- `/_not-found` — halaman 404 custom

---

*Format: `[MAJOR.MINOR.PATCH]` — MAJOR: breaking change, MINOR: fitur baru, PATCH: bugfix.*

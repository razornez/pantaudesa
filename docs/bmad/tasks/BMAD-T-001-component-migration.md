# BMAD-T-001 — Migrasi Komponen Detail Desa: Mock → Sumber Publik Internet

> **Status:** Draft, butuh review Asep (CTO)
> **Initiated by:** Iwan (CEO / BA / Designer)
> **Assigned to:** Asep (CTO)
> **Reviewer:** Iwan
> **Sprint:** 3
> **Depends on:** #4 (data model), #13 (data automation pipeline design)
> **Blocks:** Launch publik kabupaten percontohan

---

## Story

Sebagai CTO (Asep), saya butuh memetakan setiap komponen di halaman `/desa/[slug]` ke sumber data publik yang konkret, lengkap dengan kontrak schema, alur CRUD admin, dan strategi sinkronisasi, **tanpa mengandalkan AI extraction** (cost control), sehingga PantauDesa bisa launch dengan data yang dapat dipertanggungjawabkan, auditable, dan terhubung rapi dengan database.

## Tujuan Bisnis (Iwan POV)

1. Ganti semua field mock dengan data dari sumber publik resmi yang bisa dirujuk
2. Hindari narasi "menyesatkan" — kalau data tidak tersedia, tampilkan eksplisit, bukan sembunyikan
3. Pertahankan filosofi citizen-first language di setiap komponen baru
4. Siapkan fondasi yang scalable: sekali bangun pipeline per sumber, semua 75.000+ desa nasional ter-cover

## Prinsip Eksekusi (Asep POV)

- **Single source of truth:** Zod schema di `src/lib/schemas/desa.ts` — semua layer lain derive dari sini
- **Source attribution wajib** untuk setiap field di UI maupun di database
- **Data lifecycle eksplisit:** `DEMO → IMPORTED → NEEDS_REVIEW → VERIFIED → OUTDATED`
- **No silent fallback** ke mock; kalau field kosong, tampilkan "Belum tersedia" + sumber yang seharusnya
- **Adapter pattern** untuk setiap sumber data — output: `Partial<Desa>` yang lewat Zod parse

---

## Inventaris Sumber Data Publik

Berikut sumber yang akan dipakai. Setiap entry di repo akan reference ke `DataSource.id` ini.

| ID Sumber | Nama Resmi | URL | Format | Update | Trust Level (1-5) |
|---|---|---|---|---|---|
| `BPS-KW` | BPS Kode Wilayah | https://sig.bps.go.id | HTML/JSON | Tahunan | 5 |
| `BPS-SENSUS` | BPS Sensus Penduduk | https://sensus.bps.go.id | Excel/PDF | 10-tahunan | 5 |
| `BPS-PODES` | BPS Potensi Desa (Podes) | https://www.bps.go.id (publikasi) | Excel per kab | 3-tahunan | 5 |
| `BPS-KDA` | BPS Kecamatan Dalam Angka | https://www.bps.go.id (per kab) | PDF | Tahunan | 5 |
| `IDM` | Indeks Desa Membangun Kemendesa | https://idm.kemendesa.go.id | Excel/Web | Tahunan | 5 |
| `DJPK-PMK` | PMK Rincian Dana Desa per Desa | https://djpk.kemenkeu.go.id | Excel/PDF | Tahunan | 5 |
| `OMSPAN-DD` | OM-SPAN Dana Desa | https://omspan.kemenkeu.go.id | Web dashboard | Real-time | 5 |
| `PRODESKEL` | Profil Desa Kemendagri | https://prodeskel.binapemdes.kemendagri.go.id | Web | Tahunan | 4 |
| `EPRODESKEL` | e-Prodeskel Kemendagri | https://e-prodeskel.kemendagri.go.id | Web | Tahunan | 4 |
| `PPID-KAB` | PPID Kabupaten (variabel) | misal: ppid.bandungkab.go.id | HTML/PDF | Variabel | 3-4 |
| `OSM` | OpenStreetMap | https://overpass-api.de | API JSON | Komunitas | 3 |
| `GMAPS-EMBED` | Google Maps Embed | https://maps.google.com | iframe | Real-time | N/A (display) |
| `BUMDES-REG` | Registry BUMDes Kemendesa | https://bumdes.kemendesa.go.id | Web/Excel | Variabel | 4 |
| `LAPOR` | LAPOR! SP4N | https://lapor.go.id | Web | Real-time | 5 (eskalasi) |
| `INTERNAL-MANUAL` | Input Manual Admin | — | DB | On-demand | 3-4 |
| `INTERNAL-CROWD` | Crowdsource Warga | — | DB | On-demand | 2-3 (perlu review) |

---

## Klasifikasi Komponen by Kesulitan Data

Saya kelompokkan komponen ke 4 tier berdasarkan kemudahan mendapat data dari internet.

```
🟢 Tier 1 — SANGAT MUDAH       (10 komponen, coverage 100%)
🟢 Tier 2 — MUDAH DENGAN SETUP (5 komponen,  coverage 90-100%)
🟡 Tier 3 — SEDANG             (4 komponen,  coverage 50-80%)
🔴 Tier 4 — SULIT / GANTI      (5 komponen,  butuh replace)
```

---

# 🟢 TIER 1 — Sangat Mudah Didapat

Komponen ini bisa langsung di-populate dari sumber publik nasional. Pipeline-nya sekali bangun untuk semua 75.000+ desa.

---

## T1-01. Header Identitas Desa

- **Komponen sekarang:** `DesaHeroCard.tsx` (judul + breadcrumb wilayah)
- **Aksi:** ✅ **Keep**, ganti sumber dari mock ke real
- **File:** `src/components/desa/DesaHeroCard.tsx`

### Data Fields

| Field | Type | Sumber | Catatan |
|---|---|---|---|
| `identitas.nama` | string | `BPS-KW` | Verbatim dari kode wilayah BPS |
| `identitas.kodeBPS.desa` | string (10-digit) | `BPS-KW` | Format: `XX.XX.XX.YYYY` |
| `identitas.tipe` | enum DESA/KELURAHAN | `BPS-KW` | |
| `wilayah.kecamatan` | string | `BPS-KW` | |
| `wilayah.kabupaten` | string | `BPS-KW` | |
| `wilayah.provinsi` | string | `BPS-KW` | |
| `meta.lastUpdated` | datetime | system | Auto |

### Schema Impact (Prisma)

```prisma
model Desa {
  id            String   @id  // kode BPS 10-digit
  slug          String   @unique
  nama          String
  tipe          DesaTipe @default(DESA)
  kecamatan     String
  kabupaten     String
  provinsi      String
  kodeProvinsi  String   // 2-digit
  kodeKabupaten String   // 4-digit
  kodeKecamatan String   // 6-digit

  @@index([kodeKabupaten])
  @@index([kodeKecamatan])
}

enum DesaTipe { DESA  KELURAHAN }
```

### CRUD Intake

- **Bulk seed:** Script `prisma/seed-wilayah.mjs` — sekali jalan, isi seluruh hierarki Indonesia dari BPS-KW
- **Admin manual:** Read-only (tidak boleh diubah, ini master data)
- **API:** `GET /api/desa/[id]` — public

---

## T1-02. Stats Penduduk (Header Strip)

- **Komponen sekarang:** strip ringkasan "Penduduk 3.786 jiwa" di `DesaHeroCard`
- **Aksi:** ✅ **Keep**, isi dengan data nyata

### Data Fields

| Field | Type | Sumber | Catatan |
|---|---|---|---|
| `demografi.jumlahPenduduk` | int | `BPS-PODES` | Field `R301` Podes |
| `demografi.tahunData` | int | `BPS-PODES` | Tahun sensus/podes |
| `demografi.sumberId` | FK | `BPS-PODES` | Reference ke `DataSource` |

### Schema Impact

```prisma
model Demografi {
  id              String   @id @default(cuid())
  desaId          String
  tahunData       Int
  jumlahPenduduk  Int
  jumlahKK        Int?
  jumlahDusun     Int?
  jumlahRT        Int?
  jumlahRW        Int?
  sumberId        String
  fetchedAt       DateTime @default(now())

  desa   Desa       @relation(fields: [desaId], references: [id])
  sumber DataSource @relation(fields: [sumberId], references: [id])

  @@unique([desaId, tahunData])
}
```

### CRUD Intake

- **Importer:** `BPSPodesAdapter` — parse Excel Podes per kabupaten, upsert per `(desaId, tahunData)`
- **Admin override:** Bisa input manual kalau Podes belum publikasi tahun terkini (status `INTERNAL-MANUAL`)
- **Fallback display:** Kalau kosong, tampilkan "Data belum tersedia (BPS Podes terbaru: 2021)"

---

## T1-03. Klasifikasi Desa (Badge "Maju")

- **Komponen sekarang:** Badge di header (`<DesaStatusBadge>`)
- **Aksi:** ✅ **Keep**, source dari IDM resmi

### Data Fields

| Field | Type | Sumber | Catatan |
|---|---|---|---|
| `idm.status` | enum | `IDM` | SANGAT_TERTINGGAL / TERTINGGAL / BERKEMBANG / MAJU / MANDIRI |
| `idm.skor` | float | `IDM` | 0.0 – 1.0 |
| `idm.tahun` | int | `IDM` | |
| `idm.ike` | float | `IDM` | Indeks Ketahanan Ekonomi |
| `idm.iks` | float | `IDM` | Indeks Ketahanan Sosial |
| `idm.ikl` | float | `IDM` | Indeks Ketahanan Lingkungan |

### Schema Impact

```prisma
model IDM {
  id     String @id @default(cuid())
  desaId String
  tahun  Int
  status IDMStatus
  skor   Float
  ike    Float?
  iks    Float?
  ikl    Float?
  sumberId String
  fetchedAt DateTime @default(now())

  desa   Desa       @relation(fields: [desaId], references: [id])
  sumber DataSource @relation(fields: [sumberId], references: [id])

  @@unique([desaId, tahun])
}

enum IDMStatus {
  SANGAT_TERTINGGAL
  TERTINGGAL
  BERKEMBANG
  MAJU
  MANDIRI
}
```

### CRUD Intake

- **Importer:** `IDMKemendesaAdapter` — pull Excel IDM tahunan
- **Admin override:** Tidak (skor resmi, tidak boleh edit)
- **Display fallback:** "Data IDM belum tersedia untuk tahun ini"

---

## T1-04. Anggaran Header (Pengganti "Uang Diterima Desa")

- **Komponen sekarang:** `AnggaranSummaryCard` (3 angka besar: Diterima, Digunakan, Belum)
- **Aksi:** 🔄 **Replace scope** — fokus ke Dana Desa, bukan total APBDes
- **Komponen baru:** `DanaDesaSummaryCard`

### Alasan Replace

Halaman sekarang tampilkan "Total APBDes 2.8 M" yang **tidak bisa didapat lengkap dari internet** (butuh LKPD per desa). Ganti scope-nya jadi "Dana Desa" — angka yang **bisa didapat 100%** dari Kemenkeu.

### Data Fields

| Field | Type | Sumber | Catatan |
|---|---|---|---|
| `danaDesa.tahun` | int | `DJPK-PMK` | |
| `danaDesa.pagu` | bigint | `DJPK-PMK` | Pagu dari APBN |
| `danaDesa.realisasiTahap1` | bigint | `OMSPAN-DD` | Cair tahap 1 |
| `danaDesa.realisasiTahap2` | bigint | `OMSPAN-DD` | Cair tahap 2 |
| `danaDesa.realisasiTahap3` | bigint | `OMSPAN-DD` | Cair tahap 3 |
| `danaDesa.totalRealisasi` | bigint | computed | Sum tahap 1+2+3 |
| `danaDesa.persenRealisasi` | float | computed | (realisasi/pagu) × 100 |
| `danaDesa.tahapCair` | int | `OMSPAN-DD` | 1/2/3 |

### Schema Impact

```prisma
model DanaDesa {
  id                   String @id @default(cuid())
  desaId               String
  tahun                Int
  pagu                 BigInt
  realisasiTahap1      BigInt @default(0)
  realisasiTahap2      BigInt @default(0)
  realisasiTahap3      BigInt @default(0)
  tahapCair            Int    @default(0)
  sumberPaguId         String
  sumberRealisasiId    String
  fetchedAt            DateTime @default(now())

  desa             Desa       @relation(fields: [desaId], references: [id])
  sumberPagu       DataSource @relation("DD_Pagu", fields: [sumberPaguId], references: [id])
  sumberRealisasi  DataSource @relation("DD_Realisasi", fields: [sumberRealisasiId], references: [id])

  @@unique([desaId, tahun])
}
```

### CRUD Intake

- **Importer #1:** `DJPKPMKAdapter` — parse Excel rincian PMK (sekali per tahun anggaran)
- **Importer #2:** `OMSPANAdapter` — scraping/API dashboard OM-SPAN (mingguan)
- **Admin:** Read-only (data resmi), tapi bisa flag sebagai "perlu diverifikasi" kalau ada anomali
- **Display logic:**
  - Selalu tampilkan tahun anggaran berjalan + tahun sebelumnya
  - Kalau realisasi belum lengkap, tampilkan tahap yang sudah cair
  - Badge "Update terakhir: [tanggal]" wajib

### UI Copy (citizen-first)

```
Dana Desa yang diterima Batukarut tahun 2024
Rp 582.000.000

✅ Sudah cair (Tahap 1 & 2): Rp 466.000.000 (80%)
⏳ Belum cair (Tahap 3): Rp 116.000.000 (20%)

Sumber: PMK 218/2023 (DJPK Kemenkeu) + OM-SPAN per 20 Mei 2026
```

---

## T1-05. Riwayat 5 Tahun (Tren Chart)

- **Komponen sekarang:** `RiwayatChart.tsx`
- **Aksi:** ✅ **Keep**, ganti scope ke Dana Desa historical (bukan total APBDes)
- **File:** `src/components/desa/RiwayatChart.tsx`

### Data Fields

Per tahun (5 entri terakhir):

| Field | Type | Sumber |
|---|---|---|
| `tahun` | int | — |
| `pagu` | bigint | `DJPK-PMK` arsip |
| `realisasi` | bigint | `OMSPAN-DD` arsip |
| `persenRealisasi` | float | computed |

### Schema Impact

Pakai relasi `Desa → DanaDesa[]` yang sudah ada di T1-04, query `findMany` dengan `orderBy tahun desc take 5`.

### CRUD Intake

- Importer DJPK menjalankan upsert untuk semua tahun yang tersedia (2015–sekarang biasanya)
- Tidak ada admin manual untuk historical

---

## T1-06. Seharusnya Ada (Hak Warga Checklist)

- **Komponen sekarang:** `SeharusnyaAdaSection.tsx`
- **Aksi:** ✅ **Keep**, sudah computed dari `src/lib/expectations.ts`
- **File:** `src/components/desa/SeharusnyaAdaSection.tsx`

### Data Fields

Tidak ada field baru — pure computed dari:
- `demografi.jumlahPenduduk` (T1-02) → posyandu ideal, sekolah ideal
- `danaDesa.pagu` (T1-04) → BLT-DD wajib (20% dari Dana Desa)

### Schema Impact

Tidak ada (computed at runtime). Tapi formula harus diaudit oleh Iwan + ditulis di `docs/product/methodology-hak-warga.md`.

### CRUD Intake

Tidak ada (read-only computed).

---

## T1-07. Tanggung Jawab (Eskalasi)

- **Komponen sekarang:** `TanggungJawabSection.tsx`
- **Aksi:** ✅ **Keep**, sudah computed dari `src/lib/responsibility.ts`

### Data Fields

Computed; reference statis ke:
- Kepala desa (dari T2-08)
- Camat (dari `kecamatan` master data)
- Inspektorat kab/prov (dari `kabupaten` master data)
- LAPOR.go.id (sumber `LAPOR`)

### Schema Impact

Tambah master data:

```prisma
model Kecamatan {
  id            String @id  // kode 6-digit
  nama          String
  kabupatenId   String
  camatNama     String?  // optional
  alamatKantor  String?
  telepon       String?
  email         String?
}

model Kabupaten {
  id              String @id  // kode 4-digit
  nama            String
  provinsiId      String
  inspektoratUrl  String?
  ppidUrl         String?
}
```

### CRUD Intake

- Admin manual untuk lengkapi nama camat, kontak inspektorat per kabupaten (one-time effort)
- Source: SK pemerintahan, situs resmi kabupaten

---

## T1-08. Cek Langkah Sebelum Melapor

- **Komponen sekarang:** Static content section
- **Aksi:** ✅ **Keep**, no data changes

---

## T1-09. Panduan Warga (4-step flow)

- **Komponen sekarang:** Static content section
- **Aksi:** ✅ **Keep**, no data changes

---

## T1-10. Suara Warga Preview Card

- **Komponen sekarang:** Preview card linking ke `/desa/[id]/suara`
- **Aksi:** ✅ **Keep**, internal data
- **Catatan:** Migrasi dari mock di `src/lib/citizen-voice.ts` ke DB sudah ada di Unreleased changelog — separate task.

---

# 🟢 TIER 2 — Mudah dengan Setup Sumber

Butuh setup adapter, tapi sumber-nya nasional dan stabil. Sekali bangun, semua desa selesai.

---

## T2-11. Demografi Detail (Dusun, RT, RW, KK)

- **Komponen sekarang:** Strip stats di sidebar/footer
- **Aksi:** ✅ **Keep**, sumber dari BPS Podes

### Data Fields

Sudah dicover di T1-02 schema `Demografi`. Tinggal pastikan adapter Podes ambil field tambahan:
- `jumlahKK` (Podes field `R302`)
- `jumlahDusun` (Podes field `R201A`)
- `jumlahRT` (Podes field `R201B`)
- `jumlahRW` (Podes field `R201C`)

### CRUD Intake

Sama dengan T1-02 — extend `BPSPodesAdapter`.

---

## T2-12. Wilayah Geografis (Luas, Topografi)

- **Komponen sekarang:** Strip info "Luas sawah 186 ha / Luas hutan 94 ha"
- **Aksi:** ✅ **Keep**, sumber BPS Podes

### Data Fields

| Field | Type | Sumber Podes |
|---|---|---|
| `geografi.luasKm2` | float | Podes R102 |
| `geografi.luasSawahHa` | float | Podes R401A |
| `geografi.luasHutanKebunHa` | float | Podes R401B |
| `geografi.topografi` | enum | Podes R104 (dataran/perbukitan/dst) |
| `geografi.lat` | float | OSM Nominatim |
| `geografi.lng` | float | OSM Nominatim |

### Schema Impact

```prisma
model Geografi {
  desaId              String  @id
  luasKm2             Float?
  luasSawahHa         Float?
  luasHutanKebunHa    Float?
  topografi           String?
  lat                 Float?
  lng                 Float?
  sumberPodesId       String?
  sumberOSMId         String?

  desa Desa @relation(fields: [desaId], references: [id])
}
```

### CRUD Intake

- BPS Podes adapter (extend dari T1-02)
- OSM Nominatim adapter — query by nama desa + kecamatan + kabupaten

---

## T2-13. Fasilitas & Lembaga (GANTI Aset)

> **🔄 PERUBAHAN BESAR DI SINI**

- **Komponen sekarang:** `KelengkapanDesa.tsx` dengan tab Aset / Fasilitas / Lembaga / BUMDes (masih mock dengan nilai aset Rp)
- **Aksi:** 🔄 **Replace** — Tab Aset dihapus, diganti dengan content yang **lebih bermakna untuk warga**
- **Komponen baru:** `FasilitasDesaSection.tsx`

### Alasan Replace

Nilai aset Rp tanah/bangunan **tidak publik** dan **tidak relevan untuk warga awam**. Yang lebih dipedulikan warga: "Apakah ada sekolah/posyandu/masjid di desaku?" — dan ini ada di BPS Podes.

### Struktur Tab Baru

```
🏫 Pendidikan      🏥 Kesehatan       🕌 Ibadah         💼 Ekonomi & Lembaga
TK, SD, SMP, dst   Posyandu, Pustu    Masjid, Gereja    BUMDes, BPD, LPM
```

### Data Fields

#### Tab Pendidikan (sumber: BPS-PODES)

| Field | Type | Podes Field |
|---|---|---|
| `pendidikan.tk` | int | R701A |
| `pendidikan.sd` | int | R701B |
| `pendidikan.smp` | int | R701C |
| `pendidikan.sma` | int | R701D |
| `pendidikan.smk` | int | R701E |
| `pendidikan.pt` | int | R701F |

#### Tab Kesehatan (sumber: BPS-PODES)

| Field | Type | Podes Field |
|---|---|---|
| `kesehatan.puskesmas` | int | R801A |
| `kesehatan.pustu` | int | R801B |
| `kesehatan.polindes` | int | R801C |
| `kesehatan.posyandu` | int | R801D |
| `kesehatan.bidanPraktik` | int | R801E |
| `kesehatan.dokterPraktik` | int | R801F |
| `kesehatan.aksesAirBersih` | enum | R501 (PDAM/sumur/dll) |
| `kesehatan.aksesListrik` | float | R601 (% rumah tangga PLN) |

#### Tab Ibadah (sumber: BPS-PODES)

| Field | Type | Podes Field |
|---|---|---|
| `ibadah.masjid` | int | R902A |
| `ibadah.mushola` | int | R902B |
| `ibadah.gereja_protestan` | int | R902C |
| `ibadah.gereja_katolik` | int | R902D |
| `ibadah.pura` | int | R902E |
| `ibadah.vihara` | int | R902F |

#### Tab Ekonomi & Lembaga

| Field | Type | Sumber |
|---|---|---|
| `lembaga.bumdes.ada` | boolean | `BPS-PODES` + `BUMDES-REG` |
| `lembaga.bumdes.namaUnit` | string[] | `BUMDES-REG` |
| `lembaga.bpd.aktif` | boolean | `PRODESKEL` / `BPS-PODES` |
| `lembaga.lpm.aktif` | boolean | `PRODESKEL` |
| `lembaga.pkk.aktif` | boolean | `PRODESKEL` |
| `lembaga.karangtaruna.aktif` | boolean | `PRODESKEL` |
| `ekonomi.pasar` | int | `BPS-PODES` |
| `ekonomi.bank` | int | `BPS-PODES` |
| `ekonomi.koperasi` | int | `BPS-PODES` |

### Schema Impact

```prisma
model Fasilitas {
  desaId           String   @id
  tahunData        Int

  // Pendidikan
  jumlahTK         Int @default(0)
  jumlahSD         Int @default(0)
  jumlahSMP        Int @default(0)
  jumlahSMA        Int @default(0)
  jumlahSMK        Int @default(0)
  jumlahPT         Int @default(0)

  // Kesehatan
  jumlahPuskesmas    Int @default(0)
  jumlahPustu        Int @default(0)
  jumlahPolindes     Int @default(0)
  jumlahPosyandu     Int @default(0)
  jumlahBidan        Int @default(0)
  jumlahDokter       Int @default(0)
  aksesAirBersih     String?
  aksesListrikPct    Float?

  // Ibadah (json untuk fleksibilitas multi-agama)
  ibadahJson         Json   // {masjid: 5, mushola: 8, gereja_protestan: 1, ...}

  // Ekonomi
  jumlahPasar        Int @default(0)
  jumlahBank         Int @default(0)
  jumlahKoperasi     Int @default(0)

  sumberPodesId      String?
  fetchedAt          DateTime @default(now())

  desa Desa @relation(fields: [desaId], references: [id])
}

model Lembaga {
  id          String @id @default(cuid())
  desaId      String
  jenis       LembagaJenis  // BPD | LPM | PKK | KARANG_TARUNA | BUMDES | LAINNYA
  nama        String?
  aktif       Boolean @default(true)
  ketua       String?
  tahunBerdiri Int?
  sumberId    String?

  desa Desa @relation(fields: [desaId], references: [id])

  @@unique([desaId, jenis])
}

enum LembagaJenis {
  BPD
  LPM
  PKK
  KARANG_TARUNA
  BUMDES
  KOPERASI
  LAINNYA
}
```

### CRUD Intake

- **Importer Podes** isi semua field fasilitas dari Excel
- **Importer BUMDES-REG** isi `Lembaga` dengan jenis BUMDES
- **Admin manual:** Bisa edit `Lembaga.ketua`, `tahunBerdiri`, dan flag aktif/tidak

### UI Copy (citizen-first)

```
Pendidikan
2 TK, 3 SD, 1 SMP, 0 SMA
ℹ️ Anakmu harus ke Arjasari pusat untuk SMA terdekat (3 km)

Kesehatan
5 Posyandu aktif untuk 3.786 jiwa
⚠️ Ideal: 8 Posyandu (1 per 500 jiwa). Masih kurang 3.
```

---

## T2-14. Sumber Pendapatan Desa (SIMPLIFY)

- **Komponen sekarang:** Strip "Dana dari Pemerintah Pusat / PADes / Bantuan Lain" dengan persentase
- **Aksi:** 🔄 **Simplify** — fokus ke Dana Desa saja, sisanya tampilkan "data tidak publik"

### Alasan Simplify

PADes & Bantuan Lain hanya ada di LKPD/Perdes APBDes per desa yang **jarang publik**. Kalau ditampilkan dengan angka 0 atau mock, akan menyesatkan.

### Data Fields

Sudah dicover di T1-04 (`DanaDesa`). Tinggal komponen tampilkan dengan disclaimer untuk sumber lain.

### UI Copy

```
Dari mana uang desa berasal?

✅ Dana Desa (APBN, dari Pemerintah Pusat): Rp 582 Jt
   Sumber: DJPK Kemenkeu, dapat diverifikasi

❓ Pendapatan Asli Desa (PADes): Belum tersedia
   PADes diatur di Perdes APBDes desa, biasanya tidak dipublikasi rinci.
   Kamu berhak meminta Perdes APBDes ke kantor desa.

❓ Bantuan Provinsi/Kabupaten: Belum tersedia
   Sumber: LKPD desa, biasanya tidak dipublikasi rinci.
```

---

## T2-15. Dokumen Publik + Disiplin Publikasi

- **Komponen sekarang:** Checklist 5 dokumen (5/5 tersedia) di tab Transparansi
- **Aksi:** ➕ **Augment** dengan track historical "Disiplin Publikasi"
- **Komponen baru:** `DisiplinPublikasiCard.tsx` (di samping `DokumenPublikChecklist`)

### Data Fields

#### Dokumen per Jenis × Tahun

| Field | Type | Sumber |
|---|---|---|
| `jenis` | enum | — |
| `tahun` | int | — |
| `tersedia` | boolean | `PPID-KAB` cek URL 200/404 |
| `urlDokumen` | string? | `PPID-KAB` |
| `tanggalDiunggah` | date? | `PPID-KAB` |

#### Disiplin Publikasi (computed)

```typescript
// Untuk 3 tahun terakhir, cek 3 dokumen wajib:
const disiplinScore = (jumlahDokumenTersedia / (3 jenis × 3 tahun)) × 100
```

### Schema Impact

```prisma
model DokumenPublik {
  id              String @id @default(cuid())
  desaId          String
  jenis           DokumenJenis
  tahun           Int
  tersedia        Boolean @default(false)
  urlDokumen      String?
  tanggalDiunggah DateTime?
  sumberId        String?
  fetchedAt       DateTime @default(now())

  desa Desa @relation(fields: [desaId], references: [id])

  @@unique([desaId, jenis, tahun])
}

enum DokumenJenis {
  APBDES
  PERDES_APBDES
  REALISASI_APBDES
  LKPD
  RKP_DESA
  RPJM_DESA
  LAPORAN_DD
  IDM_HASIL
}
```

### CRUD Intake

- **Adapter PPID kabupaten** — scraping link PPID kab + cek HEAD HTTP per URL
- **Admin manual** — bisa upload URL kalau warga melaporkan dokumen ada di tempat lain (mis. website desa)
- **Frekuensi:** Bulanan (PPID jarang update mendadak)

---

# 🟡 TIER 3 — Sedang (50-80% coverage)

Bisa didapat, tapi tidak konsisten antar desa. Butuh fallback strategy.

---

## T3-16. Perangkat Desa (SIMPLIFY)

> **🔄 PERUBAHAN BESAR DI SINI**

- **Komponen sekarang:** 4 perangkat dengan nama lengkap (Kades, Sekdes, Bendahara, Kaur Perencanaan)
- **Aksi:** 🔄 **Simplify drastis** — hanya tampilkan **Kepala Desa + Kontak Kantor**
- **Komponen baru:** `KontakDesaCard.tsx` (gabungkan kontak kantor + Kades)

### Alasan Simplify

Detail Sekdes/Kaur/Bendahara:
- Privasi (HP pribadi tidak boleh dipublikasi tanpa izin)
- Tidak konsisten antar sumber
- Untuk pertanyaan warga, **kontak kantor desa sudah cukup**

### Data Fields

| Field | Type | Sumber | Catatan |
|---|---|---|---|
| `kontak.kepalaDesa.nama` | string | `PRODESKEL` / `PPID-KAB` | Wajib publik |
| `kontak.kepalaDesa.periode` | string | `PRODESKEL` | "2021-2027" |
| `kontak.kepalaDesa.fotoUrl` | string? | optional | |
| `kontak.alamatKantor` | string | `PRODESKEL` / `GMAPS-EMBED` | |
| `kontak.lat` | float | `OSM` | Untuk peta |
| `kontak.lng` | float | `OSM` | |
| `kontak.telepon` | string? | `PRODESKEL` | Telepon kantor, bukan HP |
| `kontak.jamPelayanan` | string? | Manual admin | mis. "Senin-Jumat 08:00-15:00" |
| `kontak.email` | string? | `PRODESKEL` | |
| `kontak.website` | string? | `PRODESKEL` | |

### Schema Impact

```prisma
model KontakDesa {
  desaId        String  @id
  kadesNama     String?
  kadesPeriode  String?
  kadesFotoUrl  String?
  alamatKantor  String?
  telepon       String?
  email         String?
  website       String?
  jamPelayanan  String?
  sumberId      String?
  fetchedAt     DateTime @default(now())

  desa Desa @relation(fields: [desaId], references: [id])
}
```

### Bagaimana dengan Sekdes, Bendahara, dst?

**DROP dari display utama**, tapi field-nya **tetap ada di DB** untuk admin yang ingin lengkapi manual. Tidak ditampilkan ke publik kecuali sudah ada `confirmedPublic = true` flag (perangkat memberikan izin).

```prisma
model PerangkatDesa {
  id              String  @id @default(cuid())
  desaId          String
  jabatan         PerangkatJabatan
  nama            String
  periode         String?
  confirmedPublic Boolean @default(false)  // 🔑 default tidak ditampilkan
  sumberId        String?

  desa Desa @relation(fields: [desaId], references: [id])
}

enum PerangkatJabatan {
  KEPALA_DESA       // selalu publik
  SEKDES
  BENDAHARA
  KAUR_PERENCANAAN
  KAUR_UMUM
  KAUR_KEUANGAN
  KASI_PEMERINTAHAN
  KASI_KESEJAHTERAAN
  KASI_PELAYANAN
}
```

### CRUD Intake

- **PRODESKEL adapter** — fetch struktur perangkat (best-effort, banyak yang kosong)
- **Admin manual** — input/edit kapanpun
- **Kades flow khusus:** Kalau Kades sendiri login (verified DESA role), bisa toggle `confirmedPublic` untuk timnya

### UI Display Rule

```
Default tampil:
  - Kepala Desa: [Nama] (Periode 2021-2027)
  - Kontak Kantor: [Alamat]
  - Telepon: [Nomor kantor]
  - Jam Pelayanan: Senin-Jumat 08:00-15:00

Hanya tampil kalau confirmedPublic:
  - Sekretaris Desa: [Nama]
  - Bendahara: [Nama]
  ...
```

---

## T3-17. APBDes per Bidang

> **🔄 PERUBAHAN BESAR DI SINI**

- **Komponen sekarang:** `APBDesBreakdown.tsx` — 5 bidang dengan progress bar
- **Aksi:** 🔄 **Replace** dengan 2 komponen berbeda
- **Komponen baru:**
  1. `KomposisiTipikalCard.tsx` — komposisi rata-rata Dana Desa nasional/per bidang (referensi)
  2. `APBDesAktualCard.tsx` — kalau Perdes APBDes tersedia (mostly empty for now)

### Alasan Replace

Realisasi per bidang APBDes individual **tidak bisa didapat tanpa AI atau kerjasama desa**. Daripada tampilkan mock yang menyesatkan:

- **Komposisi Tipikal** — show "rata-rata desa di Indonesia alokasikan ~40% untuk Pembangunan, 30% Pemerintahan, ..." sebagai REFERENSI agar warga punya konteks
- **APBDes Aktual** — hanya tampilkan kalau Perdes APBDes berhasil di-parse (Tier 4, mostly empty)

### Data Fields — Komposisi Tipikal

| Field | Type | Sumber |
|---|---|---|
| `komposisi.tahun` | int | — |
| `komposisi.kategoriDesa` | enum | based on IDM |
| `komposisi.bidang1Pct` | float | Computed nasional |
| `komposisi.bidang2Pct` | float | Computed nasional |
| ... | | |

### Schema Impact

```prisma
model KomposisiBenchmark {
  id                String @id @default(cuid())
  tahun             Int
  kategoriDesa      IDMStatus
  bidang1Pct        Float  // Penyelenggaraan
  bidang2Pct        Float  // Pembangunan
  bidang3Pct        Float  // Pembinaan
  bidang4Pct        Float  // Pemberdayaan
  bidang5Pct        Float  // Penanggulangan Bencana
  sumberDeskripsi   String
  fetchedAt         DateTime @default(now())

  @@unique([tahun, kategoriDesa])
}

model APBDesItem {
  id              String @id @default(cuid())
  desaId          String
  tahun           Int
  bidang          BidangAPBDes
  anggaran        BigInt
  realisasi       BigInt?
  sumberId        String
  fetchedAt       DateTime @default(now())

  desa Desa @relation(fields: [desaId], references: [id])

  @@unique([desaId, tahun, bidang])
}

enum BidangAPBDes {
  BIDANG_01_PENYELENGGARAAN
  BIDANG_02_PEMBANGUNAN
  BIDANG_03_PEMBINAAN
  BIDANG_04_PEMBERDAYAAN
  BIDANG_05_BENCANA_DARURAT
}
```

### CRUD Intake

- **`KomposisiBenchmark`** — populate via script analisis nasional satu-kali per tahun (bisa pakai dataset DJPK)
- **`APBDesItem`** — fallback flow:
  1. Admin upload Perdes APBDes (PDF) → manual extraction
  2. Kades sendiri input via portal desa (Tier 2 dari user roles)
  3. Crowdsource warga upload, masuk review queue
- **Kalau kosong:** Tampilkan benchmark komposisi tipikal + CTA "Bantu lengkapi"

### UI Copy

```
Anggaran Ini Dipakai untuk Apa Saja?

Data spesifik APBDes Batukarut 2024 belum tersedia.
Berikut komposisi tipikal desa "Maju" di Indonesia:

🏛️ Penyelenggaraan Pemerintahan: ~25% (gaji perangkat, operasional)
🏗️ Pembangunan Fisik: ~42% (jalan, gedung, drainase)
🤝 Pembinaan Masyarakat: ~12% (kegiatan sosial, RT/RW)
💼 Pemberdayaan: ~18% (pelatihan, UMKM)
🆘 Bencana & Darurat: ~3% (siaga)

📄 Mau lihat angka pasti? Minta Perdes APBDes ke kantor desa.
[Tombol: Bantu lengkapi data ini]
```

---

## T3-18. Status & Pencairan Dana Desa (Augmented)

- **Komponen sekarang:** Belum ada eksplisit
- **Aksi:** ➕ **Augment** — tambahkan card status pencairan
- **Komponen baru:** `PencairanDDTimelineCard.tsx`

### Data Fields

Sudah di T1-04. Tinggal komponen dedicated yang tampilkan timeline:

```
Tahap 1 (Maret 2024): ✅ Cair Rp 233 Jt
Tahap 2 (Juni 2024):  ✅ Cair Rp 233 Jt
Tahap 3 (Okt 2024):   ⏳ Belum cair Rp 116 Jt
```

### CRUD Intake

Pakai data dari OMSPAN-DD yang sudah ada.

---

## T3-19. Berita & Aktivitas Desa (BARU, Optional Phase)

- **Komponen baru:** `AktivitasDesaSection.tsx`
- **Aksi:** ➕ **New** — Aggregator berita lokal (Tier 2 priority, after launch)

### Data Fields

| Field | Type | Sumber |
|---|---|---|
| `berita.judul` | string | Google News / RSS lokal |
| `berita.url` | string | — |
| `berita.tanggal` | date | — |
| `berita.publisher` | string | — |
| `berita.snippet` | string | — |

### Schema Impact

```prisma
model BeritaDesa {
  id          String   @id @default(cuid())
  desaId      String
  judul       String
  url         String
  tanggal     DateTime
  publisher   String?
  snippet     String?
  fetchedAt   DateTime @default(now())

  desa Desa @relation(fields: [desaId], references: [id])

  @@index([desaId, tanggal])
}
```

### CRUD Intake

- Adapter `GoogleNewsAdapter` — query `"{nama desa}" "{nama kab}"` mingguan
- Admin moderation queue untuk filter spam/iklan

> **Catatan:** Defer ke Phase 2 (post-launch) karena risk content quality.

---

# 🔴 TIER 4 — Sulit / Harus Drop atau Crowdsource

---

## T4-20. Output Fisik (km jalan, jumlah posyandu dibangun)

> **🔄 PERUBAHAN BESAR DI SINI**

- **Komponen sekarang:** `OutputFisikCards.tsx` — 3 program dengan target vs realisasi
- **Aksi:** 🔄 **Replace total** dengan kombinasi peta + fasilitas eksisting
- **Komponen baru:** `<PetaDesaInteraktif>` (T-NEW-01) + `<FasilitasDesaSection>` (T2-13)

### Alasan Drop

"Output fisik dibangun tahun X" hanya ada di LKPD naratif yang sangat sulit di-parse. Yang lebih bermakna untuk warga: **apa yang ada SEKARANG** (BPS Podes) + visualisasi geografis (OSM).

### Mapping Komponen

| Yang Lama | Yang Baru |
|---|---|
| "Jalan dibangun 3 km dari target 5 km" | Peta jaringan jalan dari OSM (visual) |
| "Posyandu baru 1 unit" | "Posyandu aktif: 5 unit" (T2-13 Kesehatan) |
| "Renovasi balai desa" | Pin lokasi balai desa di peta |

### Schema Impact

**HAPUS** model `OutputFisik` yang ada di mock-data. Ganti dengan:
- `Fasilitas` (sudah di T2-13)
- `Geografi.lat/lng` untuk peta (sudah di T2-12)

---

## T4-21. Aset Desa (Nilai Rp tanah, bangunan, kendaraan)

> **🔄 PERUBAHAN BESAR DI SINI**

- **Komponen sekarang:** Tab "Aset" di `KelengkapanDesa` dengan nilai Rp
- **Aksi:** 🚫 **DROP** total — tidak tampilkan nilai Rp aset

### Alasan Drop

Nilai aset hanya ada di LKPD aset desa yang tidak publik. Selain itu, nilai akuntansi aset **tidak bermakna untuk warga awam** — yang penting: "ada/tidak ada fasilitasnya".

### Mapping Komponen

| Yang Lama | Yang Baru |
|---|---|
| "Tanah Cimeong Rp 950 Jt" | "Lahan kas desa: Ya/Tidak" + lokasi peta |
| "Mobil siaga Rp 285 Jt" | "Mobil siaga desa: Tersedia" |

### Schema Impact

**HAPUS** model `Aset` dengan nilai Rp. Pindah ke tabel `Fasilitas` dengan boolean fields. Detail nilai aset hanya ada di internal admin (kalau desa input), tidak tampil publik.

---

## T4-22. Skor Transparansi (4 metrik mock)

> **🔄 PERUBAHAN BESAR DI SINI**

- **Komponen sekarang:** `SkorTransparansiCard.tsx` — skor mock 0-100
- **Aksi:** 🔄 **Replace** dengan kombinasi IDM resmi + Disiplin Publikasi
- **Komponen baru:** `IndeksDesaCard.tsx` (gabungan)

### Alasan Replace

Skor Transparansi versi mock tidak punya metodologi yang bisa dipertanggungjawabkan. Lebih baik pakai:
1. **IDM Kemendesa** — skor resmi pemerintah (T1-03)
2. **Disiplin Publikasi** — computed dari Dokumen Publik (T2-15)

### Data Fields

Composite dari:
- `idm.skor` + `idm.status` (T1-03)
- `disiplinPublikasi.score` (T2-15 computed)

### Schema Impact

**HAPUS** model `SkorTransparansi` versi mock. Tidak perlu tabel baru — computed at runtime.

### UI Copy

```
Seberapa Maju & Terbuka Desa Ini?

🏆 Indeks Desa Membangun (IDM)
Status: MAJU (skor 0.74)
Sumber: Kemendesa, IDM 2024

📋 Disiplin Publikasi Dokumen
3 dari 9 dokumen wajib tersedia (3 tahun × 3 jenis)
  ✅ APBDes 2022
  ❌ APBDes 2023 (belum dipublikasi)
  ❌ APBDes 2024
  ... 
Sumber: PPID Kabupaten Bandung
```

---

## T4-23. Foto Kegiatan / Bukti Output

- **Aksi:** 🚫 **Drop dari MVP**, defer ke Phase 4 (Crowdsource)
- **Catatan:** Akan jadi fitur "Suara Warga + Foto Bukti" yang sudah ada di v0.7.0 changelog. Tidak perlu komponen terpisah di detail desa.

---

# 🆕 KOMPONEN BARU YANG DITAMBAH

---

## T-NEW-01. Peta Desa Interaktif

- **Komponen baru:** `PetaDesaInteraktif.tsx`
- **Posisi:** Setelah header identitas, sebelum stats card
- **Library:** Leaflet + react-leaflet (lebih ringan dari Mapbox, free)

### Data Fields

| Field | Sumber |
|---|---|
| Center lat/lng | T2-12 `Geografi` |
| Boundary (optional) | OSM Nominatim |
| POI sekolah/faskes/ibadah | OSM Overpass API |
| Layer satelit | Google Maps tile (atau Esri free tier) |

### Schema Impact

Tidak ada tabel baru. Pakai `Geografi.lat/lng` (T2-12). POI fetched on-demand client-side dengan caching.

### CRUD Intake

- Lat/lng dari OSM Nominatim adapter (one-time per desa)
- POI: client-side fetch via Overpass API dengan cache 7 hari

### Acceptance

Peta tampil untuk semua desa yang punya `lat/lng`. POI fetched lazy ketika user expand peta.

---

## T-NEW-02. Komparasi Peer (Kecamatan)

- **Komponen baru:** `KomparasiPeerSection.tsx`
- **Posisi:** Setelah anggaran section

### Data Fields

| Field | Sumber |
|---|---|
| `peer.totalDesa` | Computed dari `Desa.where(kecamatan)` |
| `peer.rankPersenSerapan` | Computed dari `DanaDesa` |
| `peer.rankIDM` | Computed dari `IDM` |
| `peer.rankDisiplinPublikasi` | Computed dari `DokumenPublik` |

### Schema Impact

Tidak ada tabel baru — pure computed query. Bisa pakai materialized view kalau performa jadi issue:

```prisma
model KecamatanStat {
  kecamatanId       String @id
  tahun             Int
  rataPersenSerapan Float
  rataIDMSkor       Float
  totalDesa         Int
  updatedAt         DateTime @updatedAt
}
```

### CRUD Intake

Re-compute via cron job atau Prisma trigger setelah data DanaDesa/IDM di-update.

---

# DATABASE SCHEMA — RINGKASAN

## Tabel Master (sekali populate, jarang berubah)

```
Provinsi
Kabupaten
Kecamatan
Desa (master)
DataSource (registry)
KomposisiBenchmark (annual benchmark nasional)
```

## Tabel Operasional (di-update via importer)

```
Demografi          (1:1 desa, per tahun)
Geografi           (1:1 desa)
IDM                (1:N desa, per tahun)
DanaDesa           (1:N desa, per tahun)
APBDesItem         (1:N desa, per tahun, per bidang) — mostly empty
Fasilitas          (1:1 desa, per tahun)
Lembaga            (1:N desa)
DokumenPublik      (1:N desa, per jenis, per tahun)
KontakDesa         (1:1 desa)
PerangkatDesa      (1:N desa)
BeritaDesa         (1:N desa, deferred Phase 2)
```

## Tabel Pendukung (audit & sync)

```
DataSource         (registry sumber)
IngestionLog       (catatan setiap import run)
AuditLog           (perubahan oleh admin)
RawSnapshot        (file mentah dari sumber, untuk re-process)
```

### DataSource Model

```prisma
model DataSource {
  id              String @id
  nama            String
  jenis           SourceJenis
  urlBase         String?
  trustLevel      Int    @default(3)  // 1-5
  format          SourceFormat
  frekuensiUpdate String?
  catatan         String?
  aktif           Boolean @default(true)
  createdAt       DateTime @default(now())
}

enum SourceJenis {
  OFFICIAL_GOV
  OFFICIAL_DESA_WEB
  DOCUMENT_SCAN
  CROWDSOURCED
  MANUAL_ADMIN
  COMPUTED
}

enum SourceFormat {
  EXCEL
  CSV
  PDF
  HTML
  API_JSON
  MANUAL
}
```

### IngestionLog Model

```prisma
model IngestionLog {
  id              String @id @default(cuid())
  sourceId        String
  adapterName     String
  startedAt       DateTime
  finishedAt      DateTime?
  status          IngestionStatus
  desaProcessed   Int @default(0)
  fieldsUpdated   Int @default(0)
  errorMessage    String?
  rawSnapshotId   String?

  source DataSource @relation(fields: [sourceId], references: [id])
}

enum IngestionStatus {
  PENDING
  RUNNING
  SUCCESS
  FAILED
  PARTIAL
}
```

---

# CRUD ADMIN — ROUTE STRUCTURE

```
/admin
├── /admin/desa                       # list semua desa, filter by kab/status
│   └── /admin/desa/[kodeBPS]
│       ├── /overview                 # full data desa dengan source per field
│       ├── /edit/[section]           # edit per section (kontak, lembaga, dst)
│       ├── /reimport                 # trigger ulang adapter X
│       └── /audit                    # history perubahan
├── /admin/sources                    # CRUD DataSource registry
│   └── /admin/sources/[id]
│       └── /test                     # test koneksi & parser
├── /admin/jobs                       # daftar ingestion jobs
│   ├── /admin/jobs/queue
│   └── /admin/jobs/[id]/logs
├── /admin/review-queue               # data dengan status NEEDS_REVIEW
└── /admin/benchmarks                 # update KomposisiBenchmark tahunan
```

## Pattern per Field di Admin Detail

Setiap field di `/admin/desa/[kodeBPS]/overview` harus tampil:

```
[Field name]
[Current value]
🔗 Sumber: [DataSource.nama] · Fetched [tanggal] · Trust: ⭐⭐⭐⭐
[Tombol] Edit Manual  |  Re-import  |  History
```

## Conflict Resolution UI

Kalau 2+ sumber kasih nilai berbeda untuk field yang sama:

```
⚠️ Konflik Sumber
Field: demografi.jumlahPenduduk
  - BPS Podes 2021: 3.786 (trust ⭐⭐⭐⭐⭐)
  - Prodeskel 2024: 3.842 (trust ⭐⭐⭐⭐)
  - Manual Admin (Iwan, 2026-04-01): 3.800
[Tombol] Pakai BPS  |  Pakai Prodeskel  |  Pakai Manual  |  Override Baru
```

---

# SYNC STRATEGY — END-TO-END

## Single Source of Truth: Zod Schema

```
src/lib/schemas/
├── desa.ts              # canonical Desa schema (Zod)
├── source.ts            # DataSource schema
├── ingestion.ts         # adapter input/output schemas
└── index.ts             # exports
```

## Layer Derivation

```
src/lib/schemas/desa.ts (Zod, canonical)
    │
    ├── TypeScript types       → z.infer<typeof DesaSchema>
    │     ↓
    │   src/components/desa/*.tsx (props typed)
    │
    ├── Prisma schema          → manual sync (validate di CI)
    │     ↓
    │   prisma/schema.prisma
    │     ↓
    │   @prisma/client (generated)
    │
    ├── API contracts          → Zod parse di route handlers
    │     ↓
    │   src/app/api/desa/[id]/route.ts
    │
    ├── Form validation        → Zod resolver di admin forms
    │     ↓
    │   src/components/admin/forms/*.tsx
    │
    └── Adapter output         → Zod parse di akhir setiap adapter
          ↓
        src/lib/adapters/*.ts
```

## CI Rules

Tambahkan ke `npm run qa:static`:

```bash
# Pseudocode untuk script qa-schema-sync.mjs
1. Parse src/lib/schemas/desa.ts → extract field list
2. Parse prisma/schema.prisma → extract model fields
3. Diff & fail kalau ada mismatch
4. Validate setiap adapter punya unit test yang produce Zod-valid output
```

## Migration dari Mock-Data Sekarang

Step-by-step untuk Asep:

1. Tulis Zod schema baru di `src/lib/schemas/desa.ts`
2. Generate Prisma model sesuai schema
3. Buat migration SQL
4. Tulis script `prisma/migrate-mock-to-db.mjs`:
   - Baca `src/lib/mock-data.ts`
   - Transform ke shape baru
   - Insert ke DB dengan `meta.status = 'DEMO'`
5. Update API routes untuk read dari DB, bukan import mock
6. Update components untuk read via API
7. Delete `src/lib/mock-data.ts` (atau pindah ke `prisma/seed-demo.mjs`)
8. Tambah disclaimer "Data Demo" yang sangat eksplisit di UI untuk semua desa dengan `meta.status = 'DEMO'`

---

# TASK BREAKDOWN — UNTUK ASEP

Sub-task yang harus dieksekusi, order matters:

## Sprint 3.1 — Foundation (1 minggu)

- [ ] **3.1.1** Tulis Zod schema `src/lib/schemas/desa.ts` lengkap (semua T1-T4 fields)
- [ ] **3.1.2** Update `prisma/schema.prisma` agar match Zod schema
- [ ] **3.1.3** Buat migration SQL + jalankan di dev DB
- [ ] **3.1.4** Setup `DataSource` registry seed (16 entries dari tabel atas)
- [ ] **3.1.5** Buat `AdapterBase` interface + base class di `src/lib/adapters/`
- [ ] **3.1.6** Migrate `src/lib/mock-data.ts` → `prisma/seed-demo.mjs` dengan status DEMO

**DoD:** `npm run build` + `npm run qa:static` lulus dengan schema baru.

## Sprint 3.2 — Tier 1 Adapters (1.5 minggu)

- [ ] **3.2.1** `BPSKodeWilayahAdapter` → populate Provinsi/Kabupaten/Kecamatan/Desa master
- [ ] **3.2.2** `IDMKemendesaAdapter` → populate IDM
- [ ] **3.2.3** `DJPKPMKAdapter` → populate DanaDesa.pagu
- [ ] **3.2.4** `OMSPANAdapter` → populate DanaDesa.realisasi (perlu cheerio + axios)
- [ ] **3.2.5** Unit test setiap adapter dengan fixture file

**DoD:** Jalankan adapter untuk Kabupaten Bandung, semua ~270 desa punya minimal: identitas + IDM + DanaDesa 2024.

## Sprint 3.3 — Tier 2 Adapters (1.5 minggu)

- [ ] **3.3.1** `BPSPodesAdapter` (parse Excel Podes Kabupaten Bandung)
- [ ] **3.3.2** `OSMNominatimAdapter` (lat/lng + topografi)
- [ ] **3.3.3** `PPIDKabupatenAdapter` (Bandung saja dulu, untuk dokumen publik)
- [ ] **3.3.4** `BUMDESRegistryAdapter` (Lembaga BUMDES)
- [ ] **3.3.5** Computed: `KomposisiBenchmark` populate dari analisis DJPK nasional

**DoD:** Halaman detail Batukarut tampil dengan Fasilitas, Demografi lengkap, IDM, DanaDesa, peta.

## Sprint 3.4 — Component Migration (2 minggu)

- [ ] **3.4.1** Refactor `DesaHeroCard` → real data
- [ ] **3.4.2** Buat `FasilitasDesaSection` baru (replace tab Aset)
- [ ] **3.4.3** Refactor `KelengkapanDesa` jadi 4 tab baru (Pendidikan/Kesehatan/Ibadah/Ekonomi)
- [ ] **3.4.4** Buat `DanaDesaSummaryCard` baru (replace anggaran header)
- [ ] **3.4.5** Buat `PencairanDDTimelineCard` baru
- [ ] **3.4.6** Refactor `RiwayatChart` → DanaDesa historical
- [ ] **3.4.7** Buat `IndeksDesaCard` baru (replace SkorTransparansi)
- [ ] **3.4.8** Buat `KomposisiTipikalCard` baru (replace APBDesBreakdown when empty)
- [ ] **3.4.9** Buat `KontakDesaCard` baru (replace PerangkatDesa)
- [ ] **3.4.10** Buat `DisiplinPublikasiCard` baru
- [ ] **3.4.11** Buat `PetaDesaInteraktif` (Leaflet + OSM)
- [ ] **3.4.12** Buat `KomparasiPeerSection`

**DoD:** Halaman `/desa/batukarut` di-render full dari DB, semua field punya source attribution.

## Sprint 3.5 — Admin Tooling (1.5 minggu)

- [ ] **3.5.1** `/admin/desa` list page dengan filter status
- [ ] **3.5.2** `/admin/desa/[kodeBPS]/overview` — field-level source attribution
- [ ] **3.5.3** `/admin/sources` CRUD untuk DataSource registry
- [ ] **3.5.4** `/admin/jobs` — UI untuk monitor ingestion runs
- [ ] **3.5.5** Conflict resolution UI
- [ ] **3.5.6** Manual override flow per field

**DoD:** Admin bisa lihat semua data Batukarut + tahu sumber + bisa override manual.

## Sprint 3.6 — Trust Layer & Launch Prep (1 minggu)

- [ ] **3.6.1** Status badge sistem (DEMO/IMPORTED/NEEDS_REVIEW/VERIFIED/OUTDATED)
- [ ] **3.6.2** Disclaimer text per status di UI
- [ ] **3.6.3** Methodology page (`/metodologi`) dengan rumus semua computed fields
- [ ] **3.6.4** Source attribution badge konsisten di semua komponen
- [ ] **3.6.5** Pre-launch QA: jalankan importer untuk Kab Bandung, validate 50 desa sample

**DoD:** Siap launch kabupaten percontohan dengan disclaimer trust yang kuat.

---

# RISK & DECISIONS YANG BUTUH SIGN-OFF

## R-001: Drop nilai Rp aset desa
- **Impact:** Halaman terlihat "lebih kosong" di section aset
- **Mitigation:** Ganti dengan Fasilitas yang lebih kaya
- **Decision needed:** Iwan + Asep

## R-002: Simplify perangkat dari 4 ke 1 (Kades only by default)
- **Impact:** Sebagian filosofi "Siapa yang harus kamu tanya" jadi lebih terbatas
- **Mitigation:** Kontak kantor desa + Tanggung Jawab (eskalasi) sudah cover use case
- **Decision needed:** Iwan

## R-003: Realisasi APBDes per bidang tidak akan terisi otomatis
- **Impact:** Section "Anggaran ini dipakai untuk apa saja?" mostly menampilkan benchmark, bukan actual
- **Mitigation:** CTA "Bantu lengkapi" untuk crowdsource Phase 4
- **Decision needed:** Iwan

## R-004: Dependency pada PPID kabupaten yang variabel
- **Impact:** Adapter PPID harus dibangun per-kabupaten, tidak universal
- **Mitigation:** Mulai dengan 1 kabupaten percontohan, expand bertahap
- **Decision needed:** Asep — pilihan tech: scraping dengan cheerio vs Playwright

## R-005: Re-introduce AI di masa depan?
- **Trigger:** Kalau manual review queue overload
- **Cost estimate:** Claude Haiku 4.5 ~$0.005 per PDF, untuk 75k desa nasional ~$375 one-time
- **Decision needed:** Defer, review setelah 3 bulan post-launch

---

# ACCEPTANCE CRITERIA — KESELURUHAN BMAD-T-001

- [ ] Zod schema lengkap di `src/lib/schemas/desa.ts` lulus `npm run qa:static`
- [ ] Prisma schema match dengan Zod, migration berhasil
- [ ] 6 adapter Tier 1+2 implemented dengan unit test (>80% coverage)
- [ ] Halaman `/desa/batukarut` render full dari DB, **tidak ada mock data lagi** kecuali Suara Warga (separate task)
- [ ] Setiap field di UI punya source attribution visible (badge atau tooltip)
- [ ] Admin di `/admin/desa/[kodeBPS]/overview` bisa lihat full data + sumber per field
- [ ] Ingestion jalan untuk semua ~270 desa di Kabupaten Bandung
- [ ] Minimal 200 desa punya kelengkapan score ≥ 0.5
- [ ] Status `DEMO` muncul dengan disclaimer kuat untuk desa di luar Kab Bandung
- [ ] Documentation di `docs/bmad/architecture/data-pipeline.md`
- [ ] Methodology page publik di `/metodologi`

---

# OUT OF SCOPE (Defer ke Sprint Berikutnya)

- ❌ AI/LLM extraction untuk Perdes APBDes PDF
- ❌ OCR untuk dokumen scan
- ❌ Aggregator berita lokal (T3-19, defer ke Phase 2)
- ❌ Crowdsource dari warga (Phase 4)
- ❌ Scheduler otomatis daily/weekly (manual trigger dulu, scheduler di Sprint 4)
- ❌ Multi-kabupaten expansion (selesaikan Bandung dulu)
- ❌ White-label / multi-tenant (Phase 5 monetization)

---

# CATATAN UNTUK ASEP (CTO)

Beberapa keputusan teknis yang saya delegasikan ke kamu:

1. **Cheerio vs Playwright** untuk scraping — saran saya cheerio dulu untuk PPID, Playwright kalau ketemu site JS-heavy.
2. **Cron scheduler** — Vercel Cron Jobs cukup untuk MVP, atau pakai GitHub Actions schedule.
3. **Rate limiting** scraping — wajib, terutama untuk OM-SPAN. Bottleneck biasanya di sini.
4. **Caching strategy** — Redis/Upstash untuk hot path (homepage stats nasional), CDN untuk static.
5. **Error handling adapter** — partial success di-allow (1 desa fail, tidak rollback semua). Log via Sentry.
6. **Snapshot raw file** — simpan di Supabase Storage dengan retention 1 tahun, agar bisa re-process kalau ada bug parser.

Mohon review dokumen ini, tambahkan catatan teknis di section yang relevan, dan estimasi effort sebelum eksekusi.

---

*Last updated: 2026-06-02 by Iwan (drafted dengan bantuan AI assistant)*
*Document version: 1.0*
*BMAD framework: see `docs/bmad/standards/`*

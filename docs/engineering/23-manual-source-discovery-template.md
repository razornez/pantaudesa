# Manual Source Discovery Template

Date: 2026-04-27
Status: ready-for-use-after-area-selection
Prepared-by: ChatGPT Freelancer / Rangga

## Purpose

Template ini dipakai untuk manual discovery official data source desa/kecamatan/kabupaten sebelum membuat scraper, scheduler, schema, atau database changes.

Template ini membantu tim mencatat:

- desa apa saja dalam pilot,
- official source yang ditemukan,
- jenis data yang tersedia,
- format data,
- risiko akses/kualitas,
- rekomendasi next action.

## Boundary

Manual discovery ini bukan scraping.

Tidak boleh melakukan:

- crawler otomatis,
- scraper,
- scheduler,
- database insert,
- migration,
- API change,
- auth change,
- read path change,
- OCR/parsing otomatis,
- publish data ke UI.

## How to use

1. Owner/Iwan memilih pilot area.
2. Buat manual spreadsheet/table dengan kolom di bawah.
3. Isi 5–20 desa dulu.
4. Cek source secara manual dan terbatas.
5. Catat temuan dan risiko.
6. Gunakan hasilnya untuk review Sprint 03 schema readiness.

## Template columns

Copy kolom ini ke spreadsheet:

```csv
no,namaDesa,kecamatan,kabupaten,provinsi,desaListSourceUrl,officialWebsiteUrl,websiteStatus,sourceLevel,sourceName,sourceUrl,hasProfilDesa,hasAPBDes,hasRealisasi,hasDokumenPublik,hasPerangkatDesa,hasKontak,latestDetectedYear,formatHtml,formatPdf,formatExcelCsv,formatImageScan,formatUnknown,lastVisibleUpdate,brokenLinks,accessConcern,recommendedNextAction,notes
```

## Column guide

### Basic identity

#### `no`

Urutan manual.

#### `namaDesa`

Nama desa sesuai sumber yang ditemukan.

#### `kecamatan`

Nama kecamatan.

#### `kabupaten`

Nama kabupaten/kota.

#### `provinsi`

Nama provinsi.

#### `desaListSourceUrl`

URL sumber daftar desa, misalnya website kecamatan/kabupaten/BPS/portal pemerintah.

## Source columns

#### `officialWebsiteUrl`

Website official desa jika ditemukan.

Isi:

- URL jika ada,
- `not_found` jika tidak ditemukan,
- `unclear` jika ragu.

#### `websiteStatus`

Gunakan salah satu:

- `active`
- `inactive`
- `not_found`
- `unknown`
- `broken`

#### `sourceLevel`

Gunakan salah satu:

- `desa`
- `kecamatan`
- `kabupaten`
- `provinsi`
- `national`
- `other`

#### `sourceName`

Nama sumber yang manusiawi.

Contoh:

- Website Resmi Desa Sukamaju
- Portal Kecamatan Ciawi
- Dokumen APBDes Desa Sukamaju 2024

#### `sourceUrl`

URL halaman/dokumen spesifik yang dicek.

## Data availability columns

Isi dengan:

- `yes`
- `no`
- `unknown`

#### `hasProfilDesa`

Ada profil desa/kondisi wilayah?

#### `hasAPBDes`

Ada dokumen/ringkasan APBDes?

#### `hasRealisasi`

Ada laporan realisasi anggaran?

#### `hasDokumenPublik`

Ada halaman dokumen publik atau file dokumen?

#### `hasPerangkatDesa`

Ada struktur perangkat desa?

#### `hasKontak`

Ada kontak resmi desa/lembaga?

#### `latestDetectedYear`

Tahun terbaru yang terlihat dari konten/dokumen.

Isi contoh:

- `2024`
- `2023`
- `unknown`

## Format columns

Isi dengan:

- `yes`
- `no`
- `unknown`

#### `formatHtml`

Data muncul sebagai halaman HTML.

#### `formatPdf`

Data muncul dalam PDF.

#### `formatExcelCsv`

Data muncul sebagai Excel/CSV.

#### `formatImageScan`

Data muncul sebagai gambar/scan.

#### `formatUnknown`

Format tidak jelas.

## Quality/risk columns

#### `lastVisibleUpdate`

Tanggal/tahun update terakhir yang terlihat.

Contoh:

- `2024-09-10`
- `2023`
- `unknown`

#### `brokenLinks`

Gunakan:

- `yes`
- `no`
- `unknown`

#### `accessConcern`

Gunakan:

- `none`
- `unknown`
- `requires_review`
- `blocked`
- `sensitive_data_risk`

#### `recommendedNextAction`

Gunakan salah satu:

- `ignore`
- `monitor`
- `manual_import_candidate`
- `scrape_candidate_later`
- `needs_review`
- `document_only_candidate`

#### `notes`

Catatan bebas.

Contoh:

- Website aktif tetapi APBDes hanya PDF.
- Link dokumen 2024 rusak.
- Portal kabupaten lebih lengkap daripada website desa.
- Ada kontak pribadi, jangan ambil dulu.

## Example rows

```csv
1,Desa Contoh A,Kecamatan Contoh,Kabupaten Contoh,Provinsi Contoh,https://kecamatan.example.go.id/desa,https://desacontoha.example.go.id,active,desa,Website Resmi Desa Contoh A,https://desacontoha.example.go.id,yes,yes,unknown,yes,yes,yes,2024,yes,yes,no,no,no,2024,no,none,manual_import_candidate,"APBDes tersedia sebagai PDF; profil desa lengkap."
2,Desa Contoh B,Kecamatan Contoh,Kabupaten Contoh,Provinsi Contoh,https://kecamatan.example.go.id/desa,not_found,not_found,kecamatan,Portal Kecamatan Contoh,https://kecamatan.example.go.id/desa/contoh-b,yes,no,no,no,unknown,unknown,2023,yes,no,no,no,no,2023,no,none,monitor,"Tidak ada website desa; data profil ada di kecamatan."
3,Desa Contoh C,Kecamatan Contoh,Kabupaten Contoh,Provinsi Contoh,https://kecamatan.example.go.id/desa,https://desacontohc.example.go.id,broken,desa,Website Resmi Desa Contoh C,https://desacontohc.example.go.id,unknown,unknown,unknown,unknown,unknown,unknown,unknown,unknown,unknown,unknown,unknown,yes,unknown,yes,unknown,needs_review,"Website tidak bisa dibuka saat dicek."
```

## Review checklist

Before submitting discovery result, ensure:

- [ ] Pilot area is named.
- [ ] 5–20 desa are listed.
- [ ] Every desa has website/source status.
- [ ] Data availability fields are filled.
- [ ] Format fields are filled.
- [ ] Risk/access notes are filled.
- [ ] Recommended next action is filled.
- [ ] No scraping/crawler was used.
- [ ] No data was inserted into database.
- [ ] No data was published as verified.

## Output expected after manual discovery

Manual discovery should produce:

1. Completed spreadsheet/table.
2. Short summary of findings.
3. Recommendation for Sprint 03 schema scope.
4. Recommendation whether pilot source is good enough.
5. List of unresolved risks.

## Suggested summary format

```text
Pilot area: [name]
Scope checked: [N] desa
Active official desa websites: [N]
No official website found: [N]
Sources from kecamatan/kabupaten: [N]
APBDes found: [N]
Realisasi found: [N]
Mostly HTML/PDF/Excel/Image: [summary]
Main risk: [summary]
Recommendation: [DB-backed demo only / source registry first / document registry first / manual import candidate / later scrape candidate]
```

## Boundary reminder

Manual discovery output is not verified public data.

Any data collected from source discovery must be treated as:

- `imported`, or
- `needs_review`,

not `verified`.

Initiated-by: Iwan direction
Reviewed-by: Pending Iwan/Owner
Executed-by: ChatGPT Freelancer / Rangga
Status: ready-for-use-after-area-selection

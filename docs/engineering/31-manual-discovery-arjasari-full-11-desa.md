# Manual Discovery — Arjasari Full 11-Desa Sample

Date: 2026-04-27
Status: draft-for-owner-iwan-asep-review
Prepared-by: ChatGPT Freelancer / Rangga
Pilot area: Kecamatan Arjasari, Kabupaten Bandung, Provinsi Jawa Barat

## Context

Iwan/Owner approved continuation from initial 5-desa discovery to full manual discovery for all 11 desa in Kecamatan Arjasari.

Framing aman:

> Area ini diperlakukan sebagai area prioritas untuk transparansi dan validasi sumber data publik. Dokumen ini tidak menyimpulkan bahwa area/desa terkait bermasalah atau mencurigakan.

## Boundary

This was manual public web research only.

No:

- scraping,
- automatic crawling,
- schema changes,
- database changes,
- migration,
- Supabase table changes,
- API changes,
- auth changes,
- read path changes,
- Prisma runtime implementation,
- UI publishing,
- verified data claim.

All findings below must be treated as:

- `imported`, or
- `needs_review`,

not `verified`.

## Shared Kecamatan source

Primary Kecamatan source:

- `https://kecamatanarjasari.bandungkab.go.id/profil/letak-geografis`
- `https://kecamatanarjasari.bandungkab.go.id/profil/struktur-pemerintahan`

Observed finding:

- Kecamatan Arjasari page lists 11 desa/kelurahan: Ancolmekar, Arjasari, Baros, Batukarut, Lebakwangi, Mangunjaya, Mekarjaya, Patrolsari, Pinggirsari, Rancakole, Wargaluyu.

## Completed manual discovery table

| no | namaDesa | officialWebsiteUrl | websiteStatus | sourceLevel | hasProfilDesa | hasAPBDes | hasRealisasi | hasDokumenPublik | hasPerangkatDesa | hasKontak | latestDetectedYear | formatHtml | formatPdf | formatExcelCsv | formatImageScan | accessConcern | recommendedNextAction | notes |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ancolmekar | `https://ancolmekar.desa.id/` | active | desa | yes | yes | yes | yes | unknown | yes | 2024 | yes | yes | unknown | yes | none | manual_import_candidate | Website active. Profile/contact found. Laporan Realisasi Pelaksanaan Anggaran Pendapatan 2019 found with PDF download reference. Treat as imported/needs_review. |
| 2 | Arjasari | `https://arjasari.desa.id/` | active | desa | yes | unknown | unknown | unknown | yes | yes | 2024 | yes | unknown | unknown | yes | none | manual_import_candidate | Website active. Profile, peta/data wilayah, aparatur, and contact found. APBDes/realisasi not found in this pass. |
| 3 | Baros | `https://baros.desa.id/` / `https://www.baros.desa.id/` | active | desa | yes | unknown | unknown | partial | yes | yes | 2026 | yes | unknown | unknown | yes | none | manual_import_candidate | Website active. Profile/contact, pemerintah desa, data wilayah/statistics, and recent articles found. Peraturan desa page exists but table appeared empty in this pass. |
| 4 | Batukarut | `https://batukarut.desa.id/` | active | desa | yes | unknown | unknown | partial | yes | yes | 2024 | yes | unknown | unknown | yes | none | manual_import_candidate | Website active. Profile, contact, aparatur/pemerintah desa, peta, and recent articles found. BLT/DD-related article found, but APBDes/realisasi not confirmed in this pass. |
| 5 | Lebakwangi | `https://lebakwangi.desa.id/` / `https://www.lebakwangi.desa.id/` | active | desa | yes | yes | yes | yes | yes | yes | 2026 | yes | yes | unknown | yes | none | manual_import_candidate | Website active. Diagram APBDes visible. APBDes 2022 and Laporan Realisasi APBDES 2023 Semester I found. Multiple Perdes/dokumen-related entries found. |
| 6 | Mangunjaya | `https://mangunjaya.desa.id/` / `https://www.mangunjaya.desa.id/` | active | desa | yes | yes | yes | yes | unknown | yes | 2026 | yes | unknown | unknown | yes | none | manual_import_candidate | Website active. APBDes 2021 summary visible. Realisasi Pertanggungjawaban APBDes Tahun 2025 article found. Recent 2025/2026 activity visible. |
| 7 | Mekarjaya | Kecamatan detail: `https://kecamatanarjasari.bandungkab.go.id/desa/desa-mekarjaya`; website field `http://www.mekarjaya-arjasari.desa.id` | unknown / needs_review | kecamatan | partial | unknown | unknown | unknown | unknown | unknown | 2025 | yes | unknown | unknown | unknown | requires_review | needs_review | Kecamatan detail provides kode desa, website field, luas wilayah, and agenda context. Direct website remained unconfirmed in this manual pass. Good source-status validation case. |
| 8 | Patrolsari | `https://patrolsari.desa.id/` / `https://www.patrolsari.desa.id/` | active | desa | yes | yes | yes | yes | yes | yes | 2026 | yes | unknown | unknown | yes | none | manual_import_candidate | Website active. Kecamatan detail exists. APBDes 2026, Laporan Realisasi APBDes 2025, and Realisasi APBDes 2024 found. Strong document/budget candidate. |
| 9 | Pinggirsari | `https://pinggirsari.desa.id/` / `https://www.pinggirsari.desa.id/arsip` | active | desa | yes | yes | yes | yes | yes | unknown | 2026 | yes | unknown | unknown | yes | none | manual_import_candidate | Website active. Laporan Pertanggungjawaban Realisasi Anggaran Pendapatan dan Belanja Desa Tahun Anggaran 2025 found. Arsip and aparatur found. |
| 10 | Rancakole | `https://rancakole.desa.id/` / `https://www.rancakole.desa.id/` | active | desa | yes | yes | yes | yes | yes | yes | 2021 | yes | unknown | unknown | yes | none | manual_import_candidate | Website active. Infografik APBDes 2021, Realisasi APBDesa 2019, APBDes 2019/2018 archive items, profile/contact, and aparatur found. |
| 11 | Wargaluyu | `https://wargaluyu.desa.id/`; kecamatan field typo-like `http://ww.wargaluyu.desa.id` | active / needs_review for kecamatan URL field | desa + kecamatan | yes | yes | yes | yes | yes | yes | 2025 | yes | unknown | unknown | yes | requires_review | manual_import_candidate | Working desa domain found. Kecamatan website field appears typo/stale. APBDes 2025 and APBDes/realisasi-style 2021 content found. Strong document/budget candidate. |

## Per-desa source notes

## 1. Ancolmekar

Source URLs found:

- `https://ancolmekar.desa.id/`
- `https://ancolmekar.desa.id/artikel/2020/1/6/laporan-realisasi-pelaksanaan-anggaran-pendapatan-2019`

Observed:

- Website Resmi Desa Ancolmekar active.
- Profile, contact, and articles found.
- 2024 articles visible.
- Laporan Realisasi Pelaksanaan Anggaran Pendapatan 2019 found with PDF/download reference.

Classification:

- Data status: `imported/needs_review`.
- Recommended next action: `manual_import_candidate`.

## 2. Arjasari

Source URLs found:

- `https://arjasari.desa.id/`
- `https://www.arjasari.desa.id/data-wilayah`
- `https://www.arjasari.desa.id/index.php/artikel/2023/11/16/peta-wilayah-desa-arjasari`

Observed:

- Website Resmi Desa Arjasari active.
- Profile, peta/data wilayah, aparatur, office/contact, and articles found.
- APBDes/realisasi not found in this manual pass.

Classification:

- Data status: `imported/needs_review`.
- Recommended next action: `manual_import_candidate` for profile/contact; continue budget/document check later.

## 3. Baros

Source URLs found:

- `https://baros.desa.id/`
- `https://www.baros.desa.id/`
- `https://www.baros.desa.id/data-wilayah`
- `https://www.baros.desa.id/peraturan-desa`

Observed:

- Website Resmi Desa Baros active.
- Profile/contact, pemerintah desa, data wilayah/statistics, and recent 2024–2026 articles found.
- Peraturan Desa page exists, but no product hukum rows were visible in this pass.
- APBDes/realisasi not confirmed in this pass.

Classification:

- Data status: `imported/needs_review`.
- Recommended next action: `manual_import_candidate`; keep budget/document as follow-up.

## 4. Batukarut

Source URLs found:

- `https://batukarut.desa.id/`
- `https://batukarut.desa.id/index/18`
- `https://batukarut.desa.id/index/12`

Observed:

- Website Resmi Desa Batukarut active.
- Profile, contact, peta, pemerintah desa, LPMD/BPD/RT/RW-style categories, and recent 2024 articles found.
- BLT Dana Desa related content found in article snippets.
- APBDes/realisasi not confirmed in this pass.

Classification:

- Data status: `imported/needs_review`.
- Recommended next action: `manual_import_candidate` for profile/contact/aparatur; continue budget/document check later.

## 5. Lebakwangi

Source URLs found:

- `https://lebakwangi.desa.id/`
- `https://www.lebakwangi.desa.id/`
- `https://lebakwangi.desa.id/index.php/artikel/2022/1/3/apbdes-2022`

Observed:

- Website Resmi Desa Lebakwangi active.
- Diagram APBDes visible.
- APBDes 2022 article found, including PDF attachment reference.
- Laporan Realisasi APBDES 2023 Semester I found in archive snippets.
- LAPORAN REALISASI APBDes 2020 found in archive snippets.
- Perdes/dokumen-related entries visible.
- Recent content up to 2025/2026 visible.

Classification:

- Data status: `imported/needs_review`.
- Recommended next action: `manual_import_candidate`, strong document/budget follow-up candidate.

## 6. Mangunjaya

Source URLs found:

- `https://mangunjaya.desa.id/`
- `https://www.mangunjaya.desa.id/`
- `https://mangunjaya.desa.id/index/`
- `https://www.mangunjaya.desa.id/artikel/kategori/produk-desa`
- `https://mangunjaya.desa.id/peraturan-desa`

Observed:

- Website Resmi Desa Mangunjaya active.
- Recent 2025/2026 activity visible.
- APBDes 2021 Pelaksanaan/Pendapatan/Pembelanjaan visible.
- Realisasi Pertanggungjawaban APBDes Tahun 2025 article found.
- Profile/contact visible.

Classification:

- Data status: `imported/needs_review`.
- Recommended next action: `manual_import_candidate`, strong document/budget follow-up candidate.

## 7. Mekarjaya

Source URLs found:

- `https://kecamatanarjasari.bandungkab.go.id/desa/desa-mekarjaya`
- Website field: `http://www.mekarjaya-arjasari.desa.id`

Observed:

- Kecamatan detail page provides kode desa, nama desa, website field, and luas wilayah.
- Direct desa website remained unconfirmed in this manual pass.
- Kecamatan page includes 2025 agenda context and visitor/contact area.

Classification:

- Data status: `needs_review`.
- Recommended next action: `needs_review` / source status validation.

## 8. Patrolsari

Source URLs found:

- `https://kecamatanarjasari.bandungkab.go.id/desa/desa-patrolsari`
- `https://patrolsari.desa.id/`
- `https://www.patrolsari.desa.id/`
- `https://patrolsari.desa.id/artikel/2025/4/11/realisasi-apbdes-tahun-anggaran-2024`
- `https://patrolsari.desa.id/data-statistik/jenis-kelamin`
- `https://patrolsari.desa.id/peta`

Observed:

- Website Resmi Desa Patrolsari active.
- Kecamatan detail page provides kode desa, website field, and luas wilayah.
- APBDes 2026 visible.
- Laporan Realisasi APBDes 2025 visible.
- Realisasi APBDes 2024 article visible.
- Profile, aparatur, detail desa, statistics, and contact visible.

Classification:

- Data status: `imported/needs_review`.
- Recommended next action: `manual_import_candidate`, strongest document/budget candidate.

## 9. Pinggirsari

Source URLs found:

- `https://pinggirsari.desa.id/`
- `https://www.pinggirsari.desa.id/arsip`

Observed:

- Website Resmi Desa Pinggirsari active.
- Laporan Pertanggungjawaban Realisasi Anggaran Pendapatan dan Belanja Desa Tahun Anggaran 2025 found.
- Arsip page found.
- Aparatur desa visible.
- Data appears mostly HTML/images in this pass.

Classification:

- Data status: `imported/needs_review`.
- Recommended next action: `manual_import_candidate`, strong document/budget follow-up candidate.

## 10. Rancakole

Source URLs found:

- `https://rancakole.desa.id/`
- `https://www.rancakole.desa.id/`

Observed:

- Website Resmi Desa Rancakole active.
- Infografik APBDes 2021 found.
- Realisasi APBDesa 2019 found in archive snippets.
- APBDes 2019 and 2018 archive items visible.
- Profile/contact and aparatur visible.
- More historical than recent compared with Patrolsari/Mangunjaya/Pinggirsari.

Classification:

- Data status: `imported/needs_review`.
- Recommended next action: `manual_import_candidate`, especially for historical APBDes/realisasi pattern.

## 11. Wargaluyu

Source URLs found:

- `https://kecamatanarjasari.bandungkab.go.id/desa/desa-wargaluyu`
- `https://wargaluyu.desa.id/`
- `https://wargaluyu.desa.id/peta`
- `https://wargaluyu.desa.id/peraturan-desa`
- `https://wargaluyu.desa.id/artikel/2021/5/29/apbdes-2021`

Observed:

- Working domain appears `https://wargaluyu.desa.id/`.
- Kecamatan website field appears typo-like as `http://ww.wargaluyu.desa.id`.
- APBDes 2025 / transparansi anggaran visible.
- APBDes 2021 / laporan realisasi style content visible.
- Profile, aparatur, contact, and peta visible.

Classification:

- Data status: `imported/needs_review`.
- Recommended next action: `manual_import_candidate`, strong document/budget follow-up candidate and URL correction case.

## Summary by category

### Active official desa websites observed

- Ancolmekar
- Arjasari
- Baros
- Batukarut
- Lebakwangi
- Mangunjaya
- Patrolsari
- Pinggirsari
- Rancakole
- Wargaluyu

### Needs review / uncertain website status

- Mekarjaya

### APBDes / realisasi evidence found

Strong or clear evidence:

- Ancolmekar: Laporan Realisasi Pelaksanaan Anggaran Pendapatan 2019.
- Lebakwangi: APBDes 2022, Laporan Realisasi APBDES 2023 Semester I, Laporan Realisasi APBDes 2020.
- Mangunjaya: APBDes 2021 summary, Realisasi Pertanggungjawaban APBDes Tahun 2025.
- Patrolsari: APBDes 2026, Laporan Realisasi APBDes 2025, Realisasi APBDes 2024.
- Pinggirsari: Laporan Pertanggungjawaban Realisasi Anggaran Pendapatan dan Belanja Desa Tahun Anggaran 2025.
- Rancakole: Infografik APBDes 2021, Realisasi APBDesa 2019, APBDes 2019/2018 archives.
- Wargaluyu: APBDes 2025 and APBDes 2021/realisasi-style content.

Not confirmed in this pass:

- Arjasari
- Baros
- Batukarut
- Mekarjaya

### Mostly observed formats

- HTML pages dominate.
- Some images/infographics/embedded maps/personnel photos appear.
- PDF references found for some APBDes/laporan items, especially Ancolmekar/Lebakwangi.
- No confirmed Excel/CSV in this pass.

### Strongest candidates for document/budget review

1. Patrolsari
2. Mangunjaya
3. Lebakwangi
4. Pinggirsari
5. Wargaluyu
6. Rancakole
7. Ancolmekar

### Source-status problems

- Mekarjaya website field exists on Kecamatan page, but direct website remained unconfirmed.
- Wargaluyu Kecamatan page website field appears typo-like (`http://ww.wargaluyu.desa.id`) while working domain appears `https://wargaluyu.desa.id/`.
- Some websites may have partial/empty document pages, e.g. Baros Peraturan Desa page visible but no product rows observed in this pass.

## Schema implications after full 11-desa discovery

The full 11-desa discovery strengthens the recommendation that Sprint 03 should not only copy current mock data shape.

### 1. `DataSource` is important from Sprint 03

Reason:

- Source can be desa website, kecamatan detail page, article page, archive page, or document URL.
- One desa can have multiple relevant sources.
- Some source URLs can be stale/typo.

Recommended fields remain important:

- `scopeType`
- `scopeName`
- `sourceName`
- `sourceUrl`
- `sourceType`
- `accessStatus`
- `dataAvailability`
- `lastCheckedAt`
- `dataStatus`
- `notes`

### 2. `dataStatus` lifecycle is mandatory

Reason:

- Findings are uneven and not verified.
- Some are only profile/contact.
- Some include APBDes/realisasi.
- Some are historical.
- Some need URL validation.

Minimum values:

- `demo`
- `imported`
- `needs_review`
- `verified`
- `outdated`
- `rejected`

### 3. Published models should support optional source relation

Reason:

- A profile record may come from homepage.
- APBDes record may come from article page.
- Dokumen record may come from archive/peraturan page.
- Kecamatan detail may provide kode desa/website field.

Recommended:

- `sourceId` optional on public data models.

### 4. Document registry should come before full numeric extraction

Reason:

- Many APBDes/realisasi items are article pages, infographics, or document attachments.
- Numeric extraction should not be rushed.

Recommended:

- prioritize `DokumenPublik` / document-source registry in early design.

### 5. Raw snapshot/staging are still valuable but can remain next phase

Reason:

- Manual discovery already shows source diversity.
- When scraper/import starts later, raw snapshot and staging will be necessary.
- Sprint 03 can include the design but may defer implementation if Asep/Owner approves.

## Recommendation

Kecamatan Arjasari remains a strong pilot area.

Recommended next step:

1. Iwan/Owner review this full discovery.
2. Asep/technical gate reviews schema implications.
3. If accepted, prepare final Sprint 03 schema recommendation using this discovery.
4. Do not start scraper/scheduler.
5. Do not change schema/database until Sprint 03 gate is explicitly opened.

## Boundary and trust note

This document is a manual discovery note, not a verification report.

All source findings are treated as:

- `imported`, or
- `needs_review`.

Nothing here should be shown to users as verified PantauDesa data yet.

No runtime/code/database changes were made.

Initiated-by: Owner/Iwan direction
Reviewed-by: Pending Owner/Iwan/Asep
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-review

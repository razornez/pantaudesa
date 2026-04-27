# Manual Discovery — Arjasari Initial 5-Desa Sample

Date: 2026-04-27
Status: draft-for-owner-iwan-review
Prepared-by: ChatGPT Freelancer / Rangga
Pilot area: Kecamatan Arjasari, Kabupaten Bandung, Provinsi Jawa Barat

## Context

Iwan approved Kecamatan Arjasari as the first manual source discovery pilot.

Approved initial sample:

1. Arjasari
2. Wargaluyu
3. Baros
4. Mekarjaya
5. Patrolsari

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

## Shared source for desa list

Primary Kecamatan source:

- `https://kecamatanarjasari.bandungkab.go.id/profil/letak-geografis`

Observed finding:

- Kecamatan Arjasari page lists 11 desa/kelurahan: Ancolmekar, Arjasari, Baros, Batukarut, Lebakwangi, Mangunjaya, Mekarjaya, Patrolsari, Pinggirsari, Rancakole, Wargaluyu.

## Completed manual discovery table

| no | namaDesa | kecamatan | kabupaten | provinsi | desaListSourceUrl | officialWebsiteUrl | websiteStatus | sourceLevel | sourceName | sourceUrl | hasProfilDesa | hasAPBDes | hasRealisasi | hasDokumenPublik | hasPerangkatDesa | hasKontak | latestDetectedYear | formatHtml | formatPdf | formatExcelCsv | formatImageScan | formatUnknown | lastVisibleUpdate | brokenLinks | accessConcern | recommendedNextAction | notes |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Arjasari | Arjasari | Bandung | Jawa Barat | `https://kecamatanarjasari.bandungkab.go.id/profil/letak-geografis` | `https://arjasari.desa.id/` / `https://www.arjasari.desa.id/data-wilayah` | active | desa | Website Resmi Desa Arjasari | `https://www.arjasari.desa.id/data-wilayah` | yes | unknown | unknown | unknown | yes | yes | 2024 | yes | unknown | unknown | yes | no | 2024 | unknown | none | manual_import_candidate | Website desa aktif; profil, peta, aparatur, alamat, email, dan artikel 2024 ditemukan. APBDes/realisasi belum ditemukan pada pass ini. Treat as `imported/needs_review`. |
| 2 | Wargaluyu | Arjasari | Bandung | Jawa Barat | `https://kecamatanarjasari.bandungkab.go.id/profil/letak-geografis` | `https://wargaluyu.desa.id/` | active | desa | Website Resmi Desa Wargaluyu | `https://wargaluyu.desa.id/peta`, `https://wargaluyu.desa.id/artikel/2021/5/29/apbdes-2021` | yes | yes | yes | yes | yes | yes | 2025 | yes | unknown | unknown | yes | no | 2025 | yes | requires_review | manual_import_candidate | Kecamatan page contains typo-like website value `http://ww.wargaluyu.desa.id`, but working domain observed as `https://wargaluyu.desa.id/`. APBDes 2025 and APBDes/realisasi-style 2021 content found. Treat as `imported/needs_review`. |
| 3 | Baros | Arjasari | Bandung | Jawa Barat | `https://kecamatanarjasari.bandungkab.go.id/profil/letak-geografis` | `https://baros.desa.id/` / `https://www.baros.desa.id/` | active | desa | Website Resmi Desa Baros | `https://www.baros.desa.id/`, `https://www.baros.desa.id/data-wilayah` | yes | unknown | unknown | partial | yes | yes | 2026 | yes | unknown | unknown | yes | no | 2026 | yes | none | manual_import_candidate | Website desa aktif; profile/contact, pemerintah desa/aparatur, data wilayah/statistik, and recent 2025/2026 articles found. APBDes/realisasi not confirmed in this pass. Some pages return 404, so document links need manual review. |
| 4 | Mekarjaya | Arjasari | Bandung | Jawa Barat | `https://kecamatanarjasari.bandungkab.go.id/profil/letak-geografis` | `http://www.mekarjaya-arjasari.desa.id` | unknown / needs_review | kecamatan | Data Desa Mekarjaya via Kecamatan Arjasari | `https://kecamatanarjasari.bandungkab.go.id/desa/desa-mekarjaya` | partial | unknown | unknown | unknown | unknown | unknown | 2025 | yes | unknown | unknown | unknown | yes | 2025 | unknown | requires_review | needs_review | Kecamatan detail page provides kode desa, website field, luas wilayah, and kecamatan context. Direct website open failed during this pass, so desa website status needs follow-up. Treat as `needs_review`. |
| 5 | Patrolsari | Arjasari | Bandung | Jawa Barat | `https://kecamatanarjasari.bandungkab.go.id/profil/letak-geografis` | `https://patrolsari.desa.id/` / `https://www.patrolsari.desa.id/` | active | desa | Website Resmi Desa Patrolsari | `https://patrolsari.desa.id/`, `https://patrolsari.desa.id/artikel/2025/4/11/realisasi-apbdes-tahun-anggaran-2024`, `https://patrolsari.desa.id/data-statistik/jenis-kelamin` | yes | yes | yes | yes | yes | yes | 2026 | yes | unknown | unknown | yes | no | 2026 | unknown | none | manual_import_candidate | Website desa aktif; APBDes 2026, Laporan Realisasi APBDes 2025, realisasi APBDes 2024, aparatur, detail desa, and statistics pages found. Treat as `imported/needs_review`. |

## Per-desa notes

## 1. Desa Arjasari

Sources found:

- `https://arjasari.desa.id/`
- `https://www.arjasari.desa.id/data-wilayah`
- `https://www.arjasari.desa.id/index.php/artikel/2023/11/16/peta-wilayah-desa-arjasari`

Observed public data:

- Website resmi desa visible.
- Data wilayah / peta desa visible.
- Aparatur desa section visible.
- Office location, address, and email visible.
- Peta Wilayah Desa Arjasari article visible.
- Recent content observed around 2024.

Data availability classification:

- Profile: yes.
- APBDes: unknown.
- Realisasi: unknown.
- Dokumen publik: unknown.
- Perangkat desa: yes.
- Kontak: yes.

Recommended next action:

- `manual_import_candidate` for profile/contact/aparatur.
- Continue manual check for APBDes/realisasi/dokumen pages.

## 2. Desa Wargaluyu

Sources found:

- `https://wargaluyu.desa.id/`
- `https://wargaluyu.desa.id/peta`
- `https://wargaluyu.desa.id/peraturan-desa`
- `https://wargaluyu.desa.id/artikel/2021/5/29/apbdes-2021`
- `https://kecamatanarjasari.bandungkab.go.id/desa/desa-wargaluyu`

Observed public data:

- Website resmi desa visible.
- Kecamatan detail page provides kode desa, luas wilayah, and website field.
- Working domain appears `https://wargaluyu.desa.id/`.
- Kecamatan page website field appears typo-like as `http://ww.wargaluyu.desa.id`.
- APBDes 2025 transparency/budget information visible.
- APBDes 2021 / laporan realisasi pelaksanaan APBDes content visible.
- Aparatur, profile/contact, and peta sections visible.

Data availability classification:

- Profile: yes.
- APBDes: yes.
- Realisasi: yes.
- Dokumen publik: yes / partial.
- Perangkat desa: yes.
- Kontak: yes.

Recommended next action:

- `manual_import_candidate` for source registry and document/budget discovery.
- Mark source URL discrepancy as `needs_review`.

## 3. Desa Baros

Sources found:

- `https://baros.desa.id/`
- `https://www.baros.desa.id/`
- `https://www.baros.desa.id/data-wilayah`
- `https://baros.desa.id/first/statistik/501`
- `https://baros.desa.id/first/dpt`

Observed public data:

- Website resmi desa visible.
- Profile/contact and office location visible.
- Pemerintah Desa/aparatur section visible.
- Data wilayah/statistik content visible.
- Recent articles visible around 2025/2026.
- Some pages return 404 or empty category pages, so document availability needs more checking.

Data availability classification:

- Profile: yes.
- APBDes: unknown.
- Realisasi: unknown.
- Dokumen publik: partial/unknown.
- Perangkat desa: yes.
- Kontak: yes.

Recommended next action:

- `manual_import_candidate` for profile/contact/statistics.
- Continue manual check for Peraturan Desa/APBDes/realisasi categories.

## 4. Desa Mekarjaya

Sources found:

- `https://kecamatanarjasari.bandungkab.go.id/desa/desa-mekarjaya`
- Website field on kecamatan page: `http://www.mekarjaya-arjasari.desa.id`

Observed public data:

- Kecamatan detail page provides kode desa, name, website field, luas wilayah.
- Kecamatan page shows agenda/visitor/contact context.
- Direct website open failed during this pass, so desa website status is not confirmed.

Data availability classification:

- Profile: partial via kecamatan.
- APBDes: unknown.
- Realisasi: unknown.
- Dokumen publik: unknown.
- Perangkat desa: unknown.
- Kontak: unknown.

Recommended next action:

- `needs_review`.
- Retry manual access later.
- Check whether website moved, expired, redirects, or requires different protocol/host.

## 5. Desa Patrolsari

Sources found:

- `https://patrolsari.desa.id/`
- `https://www.patrolsari.desa.id/`
- `https://kecamatanarjasari.bandungkab.go.id/desa/desa-patrolsari`
- `https://patrolsari.desa.id/artikel/2025/4/11/realisasi-apbdes-tahun-anggaran-2024`
- `https://patrolsari.desa.id/data-statistik/jenis-kelamin`
- `https://patrolsari.desa.id/peta`

Observed public data:

- Website resmi desa visible.
- Kecamatan detail page provides kode desa, website field, and luas wilayah.
- Website shows APBDes Tahun Anggaran 2026.
- Website shows Laporan Realisasi APBDes Tahun 2025.
- Website shows Realisasi APBDes Tahun Anggaran 2024 page.
- Aparatur desa, detail desa, contact, and statistics are visible.

Data availability classification:

- Profile: yes.
- APBDes: yes.
- Realisasi: yes.
- Dokumen publik: yes / partial.
- Perangkat desa: yes.
- Kontak: yes.

Recommended next action:

- `manual_import_candidate` for source registry, document registry, and budget document discovery.
- Keep status `imported/needs_review` until explicit review.

## Summary findings

Pilot area: Kecamatan Arjasari, Kabupaten Bandung, Jawa Barat

Scope checked: 5 desa

Active official desa websites observed:

- Arjasari
- Wargaluyu
- Baros
- Patrolsari

Needs review / uncertain website status:

- Mekarjaya

Sources from Kecamatan:

- Kecamatan Arjasari profile/list pages.
- Kecamatan detail pages for Wargaluyu, Mekarjaya, Patrolsari.

APBDes / realisasi found:

- Wargaluyu: APBDes 2025 and APBDes/realisasi-style 2021 content found.
- Patrolsari: APBDes 2026, Laporan Realisasi APBDes 2025, and Realisasi APBDes 2024 page found.
- Arjasari: not found in this pass.
- Baros: not found in this pass.
- Mekarjaya: not found in this pass.

Mostly observed format:

- HTML pages.
- Images/embedded maps/personnel images.
- No confirmed Excel/CSV in this pass.
- No confirmed PDF in this pass.

Main risk:

- Source availability varies across villages.
- Some website fields can be typo/stale.
- APBDes/realisasi availability is uneven.
- Some pages may be incomplete/404.
- Findings require review before any public display.

## Implication for Sprint 03 schema review

This initial manual discovery supports the need for:

1. `DataSource` model from early Sprint 03.
2. `dataStatus` lifecycle from day one.
3. `sourceUrl`, `sourceType`, `scopeType`, `accessStatus`, and `dataAvailability` fields.
4. Optional `sourceId` relation on public records.
5. Strong distinction between `imported`, `needs_review`, and `verified`.
6. Document registry support before full numeric APBDes extraction.
7. Ability to handle source URL corrections/typos/stale links.

## Recommendation

Arjasari remains suitable as first pilot.

Recommended next step:

1. Iwan/Owner review this discovery result.
2. If accepted, continue manual discovery for all 11 desa in Kecamatan Arjasari.
3. Do not start scraper/scheduler yet.
4. Do not start schema/database until Asep/technical review clears Sprint 03 gate.
5. Treat Wargaluyu and Patrolsari as strongest document/budget candidates for deeper manual review.
6. Treat Mekarjaya as source-status validation case.

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

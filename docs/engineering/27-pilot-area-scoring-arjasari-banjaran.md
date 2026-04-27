# Pilot Area Scoring — Arjasari vs Banjaran

Date: 2026-04-27
Status: draft-for-owner-iwan-review
Prepared-by: ChatGPT Freelancer / Rangga

## Context

Owner mengajukan 2 kandidat area pilot untuk manual source discovery PantauDesa:

1. Kecamatan Arjasari, Kabupaten Bandung, Provinsi Jawa Barat.
2. Kecamatan Banjaran, Kabupaten Bandung, Provinsi Jawa Barat.

Framing aman:

> Area ini diperlakukan sebagai area prioritas untuk transparansi dan validasi sumber data publik. Dokumen ini tidak menyimpulkan bahwa area tersebut bermasalah atau mencurigakan.

## Method

Manual public web research dilakukan secara terbatas untuk mencari indikasi:

- official source availability,
- website kecamatan/kabupaten/desa official,
- daftar desa,
- profil desa,
- APBDes/realisasi/RKPDes/RPJMDes/dokumen publik,
- format data,
- recency,
- access safety.

Boundary:

- No scraping.
- No crawling automation.
- No schema/database/API/auth/read path changes.
- No Prisma/runtime implementation.
- Source findings are not verified public data yet.

## Source links found — Candidate A: Kecamatan Arjasari

### Kecamatan / official public source

- `https://kecamatanarjasari.bandungkab.go.id/profil/letak-geografis`
  - Shows Kecamatan Arjasari profile and lists 11 desa: Ancolmekar, Arjasari, Baros, Batukarut, Lebakwangi, Mangunjaya, Mekarjaya, Patrolsari, Pinggirsari, Rancakole, Wargaluyu.
  - Also shows Kecamatan office/contact info.

- `https://kecamatanarjasari.bandungkab.go.id/profil/struktur-pemerintahan`
  - Shows Kecamatan Arjasari government structure and repeats desa list.

- `https://kecamatanarjasari.bandungkab.go.id/desa/desa-patrolsari`
  - Shows Data Desa Patrolsari with kode desa and website field: `http://www.patrolsari.desa.id`.

- `https://kecamatanarjasari.bandungkab.go.id/desa/desa-mekarjaya`
  - Shows Data Desa Mekarjaya with kode desa and website field: `http://www.mekarjaya-arjasari.desa.id`.

- `https://kecamatanarjasari.bandungkab.go.id/desa/desa-wargaluyu`
  - Shows Data Desa Wargaluyu with kode desa and website field, but observed website text appears typo-like: `http://ww.wargaluyu.desa.id`.

### Desa websites / village-level sources

- `https://arjasari.desa.id/`
  - Website Resmi Desa Arjasari.
  - Shows profile/contact, aparatur, map, articles.
  - Recent content observed around 2024.

- `https://www.arjasari.desa.id/data-wilayah`
  - Shows peta desa, aparatur desa, office location, peta wilayah.

- `https://www.baros.desa.id/`
  - Website Resmi Desa Baros.
  - Shows profile/contact, pemerintah desa, peta desa, peta wilayah, articles.
  - Recent content observed around 2025.

- `https://wargaluyu.desa.id/`
  - Website Resmi Desa Wargaluyu.
  - Shows identity, contact/pengaduan, profile, wilayah, aparatur.

- `https://wargaluyu.desa.id/peta`
  - Shows Transparansi Anggaran / APBDes 2025 sections.

- `https://wargaluyu.desa.id/artikel/2021/5/29/apbdes-2021`
  - Shows APBDes 2021 / laporan realisasi pelaksanaan APBDes.

## Source links found — Candidate B: Kecamatan Banjaran

### Kecamatan / official public source

- `https://kecamatanbanjaran.bandungkab.go.id/profil/letak-geografis`
  - Shows Kecamatan Banjaran profile and lists 11 desa: Banjaran Wetan, Banjaran Kulon, Ciapus, Kamasan, Kiangroke, Margahurip, Mekarjaya, Neglasari, Pasirmulya, Sindangpanon, Tarajusari.
  - Shows Kecamatan office/contact info.

### Desa websites / village-level sources

- `https://banjaran.desa.id/`
  - Website Resmi Desa Banjaran.
  - Shows profile/contact, government/aparatur, articles, and public information.

- `https://www.banjaran.desa.id/`
  - Same/alternate host for Website Resmi Desa Banjaran.

- `https://www.banjaran.desa.id/data-wilayah`
  - Shows peta desa, pemerintah desa, contact, and APBDes 2023 sections.

- `https://www.banjaran.desa.id/artikel/2022/1/27/peraturan`
  - Shows Peraturan Desa Banjaran No. 1 Tahun 2022 about LPj Realisasi Pelaksanaan APBDes 2021, and APBDes 2023 sections.

## Candidate A scoring — Kecamatan Arjasari

Candidate area: Kecamatan Arjasari, Kabupaten Bandung, Jawa Barat  
Scope type: kecamatan  
Expected sample: 5–20 desa  
Owner/business reason: area prioritas untuk transparansi dan validasi sumber data publik.

| Criteria | Score | Notes |
|---|---:|---|
| Official source availability | 5/5 | Kecamatan official source found with desa list and desa detail pages. |
| Desa website coverage | 4/5 | Multiple desa-level websites or website fields found: Arjasari, Baros, Wargaluyu, Patrolsari, Mekarjaya. Coverage appears promising but not fully verified for all 11 desa. |
| Public document availability | 4/5 | Wargaluyu shows APBDes 2025 and APBDes 2021/realisasi style content. Other desa show profile/aparatur/articles; document coverage needs deeper manual discovery. |
| Format processability | 4/5 | Mostly HTML pages and tables, good for manual review. Some images/embedded maps/aparatur images exist. |
| Recency | 4/5 | Found content from 2024 and 2025 in several sources; not all desa recency checked. |
| Access safety | 5/5 | Public pages accessible without login in observed sources. No bypass needed. |
| Business relevance | 4/5 | Same province/county context as owner candidates; useful for transparency/data-source validation. |
| Data diversity | 5/5 | Kecamatan list, desa detail pages, desa websites, profile, contact, aparatur, APBDes/transparency budget content found. |
| **Total** | **35/40** | Strong pilot candidate. |

### Candidate A risk notes

- Some kecamatan website fields may contain typo or stale URL, e.g. Wargaluyu link observed as `http://ww.wargaluyu.desa.id` while working domain appears `https://wargaluyu.desa.id/`.
- Not all 11 desa websites were verified manually in this pass.
- APBDes/realisasi evidence is strong for Wargaluyu, but still needs manual confirmation across more desa.
- Some data may be HTML table, image, or embedded map; data extraction must remain manual at this stage.

## Candidate B scoring — Kecamatan Banjaran

Candidate area: Kecamatan Banjaran, Kabupaten Bandung, Jawa Barat  
Scope type: kecamatan  
Expected sample: 5–20 desa  
Owner/business reason: area prioritas untuk transparansi dan validasi sumber data publik.

| Criteria | Score | Notes |
|---|---:|---|
| Official source availability | 4/5 | Kecamatan official source found with 11 desa list and office/contact info. Fewer desa detail/website results found in this pass compared with Arjasari. |
| Desa website coverage | 3/5 | Website Resmi Desa Banjaran found, but this pass did not find as many desa-level websites for other Banjaran villages. |
| Public document availability | 4/5 | Desa Banjaran shows APBDes 2023 and Perdes/LPj Realisasi APBDes 2021 content. Coverage for other desa remains unknown. |
| Format processability | 4/5 | Banjaran source appears mostly HTML/table-style APBDes content, good for manual review. |
| Recency | 3/5 | APBDes evidence found around 2023; recent article activity appears older than the strongest Arjasari/Wargaluyu evidence found. Needs deeper check. |
| Access safety | 5/5 | Public pages accessible without login in observed sources. No bypass needed. |
| Business relevance | 4/5 | Same Kabupaten Bandung context; useful for comparing against Arjasari. |
| Data diversity | 3/5 | Kecamatan list and Desa Banjaran APBDes/profile found, but cross-desa diversity was less visible in this pass. |
| **Total** | **30/40** | Strong/acceptable pilot candidate, but weaker than Arjasari for first pilot. |

### Candidate B risk notes

- Search results concentrated heavily on Desa Banjaran, not multiple desa in Kecamatan Banjaran.
- Kecamatan page lists 11 desa, but this pass did not confirm official websites for many of them.
- APBDes/realisasi evidence exists for Desa Banjaran, but cross-desa coverage is still unclear.
- Could still be useful as second pilot or comparison area after Arjasari.

## Comparison summary

| Candidate | Score | Recommendation |
|---|---:|---|
| Kecamatan Arjasari | 35/40 | Strong first pilot candidate |
| Kecamatan Banjaran | 30/40 | Good secondary candidate / backup pilot |

## Recommendation

Recommended first pilot area:

> Kecamatan Arjasari, Kabupaten Bandung, Provinsi Jawa Barat.

## Why Arjasari is recommended first

Arjasari is slightly stronger for the first manual source discovery because:

1. Kecamatan official page lists 11 desa and provides desa profile/detail pages.
2. Multiple desa-level official websites or website fields were found in the initial pass.
3. Wargaluyu provides strong APBDes/transparansi anggaran evidence, including APBDes 2025 and APBDes 2021/realisasi-style content.
4. Arjasari village site has recent 2024 activity and profile/aparatur/contact content.
5. Baros website shows recent 2025 activity and profile/contact content.
6. The area appears better for testing mixed source patterns: kecamatan page, desa page, desa website, APBDes, profile, aparatur, contact, maps.

## Recommended pilot scope if Arjasari is selected

Start with 5 desa sample:

1. Arjasari
2. Wargaluyu
3. Baros
4. Mekarjaya
5. Patrolsari

Reason:

- These names already appeared in official/public source discovery.
- They include a mix of direct desa website findings and kecamatan detail page findings.
- This sample is enough to test the manual discovery template before expanding to all 11 desa.

## Suggested next action

If owner approves Arjasari:

1. Use `docs/engineering/23-manual-source-discovery-template.md`.
2. Fill 5-desa sample first.
3. Mark all findings as `imported` or `needs_review`, not `verified`.
4. Do not scrape or crawl.
5. Report whether source patterns are good enough for Sprint 03 schema review.

If owner prefers Banjaran:

1. Start with Desa Banjaran plus 4 desa from the kecamatan list.
2. Expect more manual searching for official desa websites.
3. Use Banjaran as a more challenging test of sparse source coverage.

## Boundary and trust note

This scoring is based on limited manual public web research.

The findings are not verified public data and should not be displayed in PantauDesa as official/verified records.

Any future use of these sources must follow data status lifecycle:

- `imported`
- `needs_review`
- `verified` only after explicit review

No schema/database/API/auth/read path changes were made.

Initiated-by: Owner/Iwan direction
Reviewed-by: Pending Owner/Iwan
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-owner-iwan-review

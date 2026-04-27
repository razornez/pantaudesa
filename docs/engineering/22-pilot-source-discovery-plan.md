# Pilot Source Discovery Plan

Date: 2026-04-27
Status: draft-for-iwan-asep-review
Prepared-by: ChatGPT Freelancer / Rangga acting as Ujang backup
Sprint: 02.5 — Data Source Strategy and Backlog Hygiene
Task: H-04

## Context

PantauDesa ingin bergerak dari data dummy/mock menuju data yang lebih dekat dengan official source. Namun Sprint 02.5 tidak boleh membuat scraper, scheduler, database table, migration, API, atau mengubah read path.

Dokumen ini adalah rencana pilot discovery manual untuk mempelajari realita sumber data desa sebelum Sprint 03 schema/database dibuka kembali.

References:

- `docs/project-management/18-iwan-review-rangga-docs-and-sprint-025.md`
- `docs/engineering/14-official-desa-data-source-and-scraping-strategy.md`
- `docs/engineering/21-official-source-schema-implications.md`

## Goal

Menentukan apakah official website desa/kecamatan/kabupaten cukup tersedia dan cukup rapi untuk dijadikan dasar data foundation PantauDesa.

Target:

- memilih 1 pilot wilayah,
- mengumpulkan daftar 5–20 desa,
- mencatat website/source official yang tersedia,
- mengidentifikasi format data,
- menentukan implikasi ke schema Sprint 03,
- tanpa scraping otomatis.

## Non-goals

Pilot ini tidak melakukan:

- scraping otomatis,
- scheduler,
- crawler nasional,
- database insert,
- migration,
- Supabase table,
- API baru,
- read path change,
- OCR otomatis,
- parsing PDF otomatis,
- publish data ke UI.

## Pilot target selection criteria

Pilih 1 kecamatan atau 1 kabupaten yang memenuhi sebanyak mungkin kriteria berikut:

### 1. Ada daftar desa yang jelas

Sumber bisa dari:

- website kecamatan,
- website kabupaten,
- portal resmi pemerintah daerah,
- sumber publik resmi lain.

### 2. Banyak desa punya website official

Ideal:

- minimal 5 website desa aktif,
- lebih baik 10–20 website desa aktif.

### 3. Website tidak butuh login

Sumber harus publik dan bisa diakses tanpa:

- login,
- captcha,
- bypass access control,
- akses internal.

### 4. Ada data publik yang relevan

Minimal salah satu:

- profil desa,
- APBDes,
- realisasi anggaran,
- RKPDes/RPJMDes,
- dokumen publik,
- berita pembangunan,
- struktur perangkat desa,
- kontak resmi.

### 5. Struktur relatif bisa dipelajari

Tidak harus sama semua, tetapi jangan terlalu acak untuk pilot pertama.

### 6. Risiko etika rendah

Website tidak boleh dibebani. Discovery dilakukan manual dan terbatas.

## Candidate pilot options

Owner/Iwan perlu memilih salah satu:

### Option A — 1 kecamatan

Pros:

- scope kecil,
- mudah dicek manual,
- cocok untuk 5–20 desa,
- risiko rendah.

Cons:

- data mungkin terlalu sedikit,
- tidak semua kecamatan punya portal rapi.

### Option B — 1 kabupaten

Pros:

- lebih banyak desa,
- peluang menemukan portal/dokumen lebih besar,
- lebih cocok untuk source registry.

Cons:

- scope bisa melebar,
- discovery manual lebih lama,
- bisa cepat terasa seperti crawler nasional kalau tidak dibatasi.

Recommendation:

Mulai dari **1 kecamatan** jika owner belum punya target wilayah. Naik ke 1 kabupaten hanya jika kecamatan target terlalu miskin data.

## Manual discovery fields

Gunakan spreadsheet/manual table dulu. Belum perlu database.

Fields yang dikumpulkan:

### Basic identity

- `no`
- `namaDesa`
- `kecamatan`
- `kabupaten`
- `provinsi`

### Source info

- `officialWebsiteUrl`
- `websiteStatus`: `active`, `inactive`, `not_found`, `unknown`
- `sourceLevel`: `desa`, `kecamatan`, `kabupaten`, `other`
- `sourceName`
- `sourceUrl`

### Data availability

- `hasProfilDesa`: yes/no/unknown
- `hasAPBDes`: yes/no/unknown
- `hasRealisasi`: yes/no/unknown
- `hasDokumenPublik`: yes/no/unknown
- `hasPerangkatDesa`: yes/no/unknown
- `hasKontak`: yes/no/unknown
- `latestDetectedYear`

### Format

- `formatHtml`: yes/no
- `formatPdf`: yes/no
- `formatExcelCsv`: yes/no
- `formatImageScan`: yes/no
- `formatUnknown`: yes/no

### Quality and risk

- `lastVisibleUpdate` optional
- `brokenLinks`: yes/no/unknown
- `accessConcern`: none/unknown/requires_review
- `notes`
- `recommendedNextAction`: `ignore`, `monitor`, `manual_import_candidate`, `scrape_candidate_later`, `needs_review`

## Discovery procedure

### Step 1 — Choose pilot area

Owner/Iwan picks one pilot area.

Output:

- selected kecamatan/kabupaten name,
- reason for selection,
- expected desa count.

### Step 2 — List desa

Collect 5–20 desa names from official/public source.

Output:

- draft desa list,
- source for desa list.

### Step 3 — Find official websites

For each desa, manually search/check:

- official website desa,
- kecamatan page,
- kabupaten page,
- official document link.

Output:

- website/source URL per desa if available,
- not found marker if unavailable.

### Step 4 — Check data types

For each source, manually note if it contains:

- profile,
- APBDes,
- realization report,
- planning docs,
- documents page,
- contact/perangkat.

### Step 5 — Classify format

Classify whether data appears as:

- HTML page,
- PDF document,
- Excel/CSV,
- image/scan,
- unknown.

### Step 6 — Risk note

Note any concerns:

- website down,
- broken links,
- outdated content,
- unclear official status,
- possible personal data,
- source requires manual review.

### Step 7 — Decide next action

For each source:

- ignore,
- monitor only,
- manual import candidate,
- scrape candidate later,
- needs review.

## Expected decision after pilot

After discovery, Iwan/Asep/Owner should decide:

1. Is official website source strategy viable?
2. Should Sprint 03 include `DataSource` as real model?
3. Should `RawSourceSnapshot` be included now or later?
4. Should staging tables be included now or later?
5. Should Sprint 03 start with DB-backed demo only, source registry, or hybrid?
6. Which source type should be supported first?
7. Is a manual import workflow more realistic than scraping for MVP?

## Recommendation for Sprint 03 based on possible pilot outcomes

### Outcome A — Many official websites and documents found

Recommendation:

- Sprint 03 should include `DataSource` model.
- Consider source registry first.
- Published model can remain DB-backed demo, but source relation should be ready.
- Scraper still deferred.

### Outcome B — Websites exist but data mostly PDF/image

Recommendation:

- Prioritize `DokumenPublik` and `DataSource`.
- Do not force APBDes numeric extraction yet.
- Use document checklist/status first.
- OCR/parsing later.

### Outcome C — Websites are sparse/inconsistent

Recommendation:

- Sprint 03 should focus on DB-backed demo + source registry.
- Data import may start manual/CSV later.
- Avoid investing in scraper too early.

### Outcome D — Kabupaten/kecamatan portal is better than desa websites

Recommendation:

- `DataSource.scopeType` must support `kecamatan`/`kabupaten`.
- Do not assume every source belongs directly to a desa website.

## Suggested manual table template

```text
no | namaDesa | kecamatan | kabupaten | provinsi | officialWebsiteUrl | websiteStatus | sourceLevel | sourceName | sourceUrl | hasProfilDesa | hasAPBDes | hasRealisasi | hasDokumenPublik | latestDetectedYear | formatHtml | formatPdf | formatExcelCsv | formatImageScan | brokenLinks | accessConcern | recommendedNextAction | notes
```

## Quality bar for pilot completion

Pilot discovery is considered complete if:

- [ ] 1 pilot area selected.
- [ ] 5–20 desa listed.
- [ ] website/source availability checked for each desa.
- [ ] data type availability classified.
- [ ] source format classified.
- [ ] basic risk/access notes written.
- [ ] next action recommended for each source.
- [ ] Sprint 03 schema implications updated if needed.

## Roles

### Owner / Komisaris

- Decide pilot area if there is a preferred region.
- Confirm whether output supports business direction.

### Iwan

- Review pilot plan and product fit.
- Decide whether discovery output is enough before Sprint 03.

### Asep / CTO

- Review technical implications before schema.
- Decide whether `DataSource`, `RawSnapshot`, and staging enter Sprint 03.

### Ujang / backup executor

- Run manual discovery after approval.
- Do not implement scraper/scheduler.
- Document findings.

### Rangga / ChatGPT Freelancer

- Support review, risk analysis, docs, and owner-side second opinion.
- Avoid overlapping implementation without owner instruction.

## Risks

### Risk 1 — Discovery becomes scraping

Manual discovery can accidentally expand into scraping/crawling.

Mitigation:

Keep scope fixed: 5–20 desa, manual checks only.

### Risk 2 — Team assumes public equals verified

Public web data can still be stale, wrong, or incomplete.

Mitigation:

Use `imported`/`needs_review`, not `verified`.

### Risk 3 — Pilot area not representative

One area may be unusually good/bad.

Mitigation:

Treat pilot as discovery, not final national conclusion.

### Risk 4 — Personal data exposure

Some websites may include personal contact details.

Mitigation:

Collect only relevant official/public institutional data. Avoid unnecessary personal data.

## Completion note

H-04 complete as documentation only.

No schema/database/API/auth/scraper/scheduler/read path/migration/Supabase table changes were made.

Initiated-by: Iwan / Asep direction
Reviewed-by: Pending Iwan/Asep
Executed-by: ChatGPT Freelancer / Rangga as Ujang backup
Status: draft-for-review

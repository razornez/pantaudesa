# Sprint 05 Batch 5 - Real Data Rollout, Source Research & Seeding

## Status
PLANNED / READY AFTER BATCH 4.5 TEMPLATE RUNTIME CONTRACT CLOSEOUT.

## Owner Goal

Batch 5 starts the real data rollout.

The goal is not to make every desa 100% complete immediately. The goal is:

```text
Start filling and publishing real, source-backed data for desa gradually, based on the active template, while clearly knowing which data is easy to get, rare/hard to get, and available-but-not-yet-supported by the current template.
```

Owner needs PantauDesa to begin showing real public data even when completeness is partial.

## Context From Previous Batches

Batch 4 created the runtime architecture foundation:

```text
template runtime
component catalog
review candidate
source-backed structured input
source ingestion candidate
DataDesa publish path
public detail runtime render
```

Batch 4.5 should close remaining template runtime contract/migration issues before Batch 5 starts.

Batch 5 must use that shared runtime contract. Do not reintroduce hardcoded field-count, hardcoded ownership, direct DataDesa writes, or parallel publish paths.

## Critical Principle

Public factual data must be source-backed.

Allowed source categories:

- official government/open-data portal,
- official desa website,
- official kabupaten/kota/provinsi website,
- official public document such as APBDes/RKPDes/RPJMDes/Perdes/LPPD,
- official governance/procurement source where relevant,
- admin desa structured submission,
- source-backed scraping/fetch snapshot,
- other owner-approved trusted source.

Not allowed:

- internal admin free-text factual data with no source,
- dummy data represented as real,
- citizen voice as factual public data,
- source-less scraping result,
- direct publish without review.

Citizen voice remains a public signal only.

## Dynamic Planning Rule

This task is allowed to evolve during development.

Executor may suggest better technical implementation, new source classifications, better import staging, or safer rollout order. Owner may enhance the plan during development. Changes are acceptable if:

- the goal remains real source-backed data rollout,
- the system remains review-first,
- public render remains safe,
- source provenance is preserved,
- QA passes,
- report documents the changes honestly.

---

# Phase 0 - Research Source Atlas

## Goal

Research and document where PantauDesa can obtain the most complete real village data.

Use official sources first. Every source must be classified by trust level, availability, mapping difficulty, and template coverage.

## Initial Source Candidates To Research

### A. National / official baseline sources

1. BPS Potensi Desa / Podes
   - Useful for national/provincial/kabupaten profile, infrastructure, potentials, challenges, and reference counts.
   - Check whether usable data is available per desa or only aggregate/publication-level for the target area.
   - Candidate mapping: demografi, fasilitas, potensi, infrastruktur, kerawanan, wilayah.

2. Kemendesa IDM / Indeks Desa
   - Useful for status desa, score, dimensions, ranking, development indicators.
   - Candidate mapping: status/score/transparency-like signals, completeness insights, future component.

3. Satu Data Indonesia / data.go.id
   - Search per-desa datasets from ministries/provinces/kabupaten.
   - Candidate mapping varies by dataset.

4. Kemendagri / master wilayah / kode wilayah
   - Useful for province/kabupaten/kecamatan/desa names and administrative codes.
   - Candidate mapping: identitas wilayah, code normalization, matching/deduplication.

5. LKPP / SIRUP / Inaproc / SPSE-style sources
   - Research feasibility for desa-related procurement or public spending signals.
   - Do not assume all procurement data maps cleanly to desa.
   - Candidate mapping: dokumen/transparansi/kegiatan/anggaran only when desa linkage and source meaning are clear.

### B. Provincial / local open data sources

Examples to research first:

- Open Data Jawa Barat datasets under Pemerintah & Desa / Infrastruktur.
- Kabupaten/kota open data portals.
- Local PPID datasets.
- Local DPMPD datasets.

Candidate mapping:

- desa status/strata,
- fasilitas olahraga/fasilitas umum,
- kualitas jalan,
- BUMDes aggregate or per-desa where available,
- desa profile/administrative data.

### C. Official desa/kabupaten web sources

1. Website resmi desa
   - Candidate mapping: websiteUrl, kontak, alamat, kepala desa/perangkat, potensi, fasilitas, berita/profil, dokumen publik.

2. PPID / JDIH / dokumen kabupaten/desa
   - Candidate mapping: APBDes, Perdes, RPJMDes, RKPDes, LPPD, dokumen transparansi.

3. Jadesta / Kemenparekraf for desa wisata
   - Candidate mapping: potensi wisata, atraksi, fasilitas, homestay, paket wisata, suvenir.
   - This may require template gap handling because current template may not have detailed tourism fields.

### D. Admin desa / document submission sources

- Admin Desa structured submission.
- Admin Desa uploaded document.
- Official note with evidence URL/document.

Candidate mapping:

- any active template field, as long as source/evidence policy is satisfied.

---

# Phase 1 - Source Trust & Difficulty Classification

Every researched source must be scored with this classification.

## Trust Level

```text
S0 - Official structured dataset/API/CSV from government/open-data portal
S1 - Official website/public document from desa/kabupaten/provinsi/ministry
S2 - Admin Desa structured submission with evidence
S3 - User/citizen signal, not factual public data
S4 - Third-party/unverified source, not allowed for factual publish without owner approval
```

## Availability

```text
EASY
- structured CSV/API/table
- stable source URL
- downloadable
- can be matched by kode wilayah/nama desa

MEDIUM
- HTML page or PDF/DOCX with extractable text
- source exists but format varies
- matching needs normalization

RARE/HARD
- only scanned PDF/image
- incomplete or outdated local page
- source exists but no per-desa granularity
- needs manual evidence review
- not publicly accessible

NOT_AVAILABLE
- no trustworthy source found yet
```

## Mapping Status

```text
MAPPED_TO_CURRENT_TEMPLATE
- data maps cleanly to current active template fields

PARTIAL_MAPPING
- some fields map, some require normalization or reviewer decision

TEMPLATE_GAP
- data is useful and source-backed but current template has no field/component

NO_PUBLIC_FACT_USE
- data is only signal/comment/context, not factual public data
```

---

# Phase 2 - Current Template Mapping Matrix

## Goal

Create a matrix that maps source data to current active template fields.

Required output file:

```text
docs/bmad/reports/sprint-05-batch-5-source-field-mapping-matrix.md
```

## Current Template Components To Map

Use the runtime contract, not hardcoded lists. As a starting frame, map against these current public detail areas:

```text
identitas
  websiteUrl
  kategori
  tahunData
  kecamatan
  kabupaten
  provinsi

demografi
  jumlahPenduduk
  jumlahKK
  jumlahDusun
  jumlahRt
  jumlahRw

sumber_dokumen
  source/document references
  public document metadata

transparansi
  transparency/document availability signals

anggaran
  totalAnggaran
  terealisasi
  persentaseSerapan

pendapatan
  danaDesa
  add
  pades
  bantuanKeuangan

kinerja
  apbdesItems
  outputFisik
  riwayatAPBDes

profil_desa
  teleponDesa
  emailDesa
  kepalaDesa
  perangkatDesa
  potensiUnggulan
  mataPencaharian
  luasWilayah
  luasSawah
  luasHutan
  fasilitasUmum
  asetDesa
  lembagaDesa
  bumdes

panduan_warga
  mostly static/computed

suara_warga
  citizen voice signal only
```

Executor must validate the actual field list from `TemplateRuntimeContract` before implementation.

## Matrix Columns

```text
sourceName
sourceUrl
sourceOwner
trustLevel
availability
sourceFormat
updateFrequency
coverageLevel: national/province/kabupaten/kecamatan/desa
matchKey: kode wilayah/nama desa/url/domain/document id
sourceField
targetComponentKey
targetFieldKey
mappingStatus
dataType
normalizationNeeded
sourcePolicy
publishEligibility
sampleDesa
sampleValue
notes
```

---

# Phase 3 - Easy vs Rare Data Classification

## Goal

Produce a practical source backlog for rollout.

Required output:

```text
docs/bmad/reports/sprint-05-batch-5-data-availability-classification.md
```

## Expected Categories

### Easy To Get / High Priority

Likely candidates:

- wilayah identity and code normalization,
- website URL and official site status,
- published public documents link if available,
- IDM/Indeks Desa status/score if downloadable per desa,
- local open data fields that are structured per desa,
- simple contact/profile data from official desa websites,
- Jadesta fields for desa wisata where page exists.

### Medium Difficulty

Likely candidates:

- perangkat desa from varied website HTML,
- potensi unggulan from profile pages,
- fasilitas umum from open data or website text,
- BUMDes existence/details if local data exists,
- APBDes summary from text PDF/DOCX,
- procurement/governance data when desa linkage is clear.

### Rare / Hard To Get

Likely candidates:

- full APBDes line items across all desa,
- realisasi budget and output fisik details,
- aset desa,
- detailed lembaga desa with active membership,
- official facility condition by desa,
- up-to-date perangkat desa for all desa,
- scanned documents requiring OCR,
- data only available after admin desa cooperation.

### Available But Template Gap

Likely candidates:

- IDM score/status/dimensions,
- Podes/IPD-style infrastructure and vulnerability indicators,
- disaster/environment/social vulnerability signals,
- desa wisata details: attractions, homestay, packages, souvenirs,
- procurement package identifiers and procurement activity status,
- source freshness/confidence score,
- geo coordinates/boundary data,
- external dataset provenance metadata.

Do not add template fields automatically in Batch 5 unless owner approves. Record as gap report first.

---

# Phase 4 - Pilot Desa Selection

## Goal

Pick a small set of desa to seed real data first.

Suggested pilot:

```text
3-5 desa already in PantauDesa DB
```

Selection criteria:

- has official desa website or source page,
- has at least one trusted open dataset match,
- has at least one field mapped to current template,
- includes one easy desa and one hard/poor-source desa for contrast,
- does not require full completeness before public display.

Required output:

```text
docs/bmad/reports/sprint-05-batch-5-pilot-desa-selection.md
```

Include for each pilot desa:

```text
desa id/name
kabupaten/kecamatan
source candidates
fields expected to fill
hard fields
template gaps
risk notes
owner QA URL
```

---

# Phase 5 - Source Candidate Ingestion Plan

## Goal

Use existing Batch 4 source-backed candidate flow to bring real data into review.

Allowed entry paths:

- Admin Desa structured submission,
- Internal Admin Source Mode in intake,
- source ingestion/fetch candidate,
- document upload/paste when source is document-based.

Not allowed:

- direct DataDesa writes from script without review, unless explicitly owner-approved for controlled backfill with audit and source evidence,
- source-less internal admin input,
- auto-publish scraping.

## Required Behavior

For each source candidate:

```text
resolve active template
sanitize values
store source provenance
create review candidate
Step 2 review
publish only valid eligible fields
write DataDesa PUBLISHED rows
public detail shows partial real data
```

---

# Phase 6 - Real Data Seeding MVP

## Goal

Publish a small amount of real data safely to public detail.

Minimum target:

```text
At least 3 pilot desa
At least 3-5 real source-backed fields per desa where available
At least 1 visible public section showing real DataDesa value
At least 1 source attribution example
```

If source quality is poor, publish fewer fields and document why.

## Priority Fields

Prefer fields that are safer/easier:

```text
websiteUrl
kategori
tahunData
kecamatan/kabupaten/provinsi if needed for normalization
teleponDesa/emailDesa if official
kepalaDesa/perangkatDesa if official and current
potensiUnggulan
fasilitasUmum
jumlahPenduduk if trusted source exists
IDM/status fields only if template supports them; otherwise mark TEMPLATE_GAP
```

Budget fields may be included only when source is strong:

```text
APBDes official document
RKPDes/RPJMDES/Perdes budget attachment
official public budget page
trusted government/procurement source with clear desa linkage
```

---

# Phase 7 - Template Gap Report

## Goal

Identify useful data that exists but cannot be mapped because current template has no field/component.

Required output:

```text
docs/bmad/reports/sprint-05-batch-5-template-gap-report.md
```

Each gap item must include:

```text
dataName
sourceExample
whyUseful
suggestedComponent
suggestedFieldKey
valueType
sourcePolicySuggestion
priority: P0/P1/P2
risk
shouldAddNow: yes/no
```

Do not modify template fields automatically unless owner approves.

---

# Phase 8 - Public Trust QA

## Required QA

```bash
npm run db:doctor
npm run template:validate
npm run qa:static
npm run qa:runtime
npm run build
```

Manual QA:

1. Open pilot public detail pages.
2. Confirm real DataDesa values appear only after publish.
3. Confirm source attribution is visible where expected.
4. Confirm dummy/fallback is not presented as verified real data.
5. Confirm empty/missing fields are honest.
6. Confirm template hidden components do not render.
7. Confirm outside-template data is not published.
8. Confirm audit trail exists for published fields.
9. Confirm source URLs/metadata do not expose private storage keys or internal notes.
10. Confirm old public shell remains usable on mobile.

Playwright where feasible:

```text
source candidate -> Step 2 -> publish -> public detail shows real value
rejected/failed candidate -> public detail unchanged
source attribution visible
hidden/outside-template field does not render
```

---

# Required Reports

Create/update:

```text
docs/bmad/reports/sprint-05-batch-5-real-data-rollout-report.md
docs/bmad/reports/sprint-05-batch-5-source-field-mapping-matrix.md
docs/bmad/reports/sprint-05-batch-5-data-availability-classification.md
docs/bmad/reports/sprint-05-batch-5-pilot-desa-selection.md
docs/bmad/reports/sprint-05-batch-5-template-gap-report.md
```

Main rollout report must include:

1. branch / commit,
2. sources researched,
3. source trust classification,
4. easy vs medium vs rare data summary,
5. template mapping summary,
6. template gap summary,
7. pilot desa selected,
8. data actually published,
9. fields skipped and why,
10. source attribution examples,
11. public detail screenshots or owner-test URLs if requested,
12. audit trail summary,
13. QA results,
14. Playwright results or reason not run,
15. known limitations,
16. suggested next data rollout batch.

---

# Out Of Scope

Do not do these unless owner explicitly changes direction:

- dashboard grooming,
- public `/desa` advanced filter,
- large-scale crawler,
- scraping the entire country,
- full template CRUD expansion,
- direct bulk publish without review/audit,
- using unverified third-party data as factual public data,
- building a new parallel ingestion system outside the existing review flow.

---

# Acceptance Criteria

Batch 5 is successful if:

- source atlas exists,
- source-field mapping matrix exists,
- easy/medium/rare/template-gap classification exists,
- 3-5 pilot desa are selected,
- at least some real source-backed data is published for pilot desa,
- public detail shows partial real data safely,
- source attribution is present for published data,
- audit trail exists,
- invalid/unverified/outside-template data does not leak,
- QA passes or blockers are honestly documented.

## Short Instruction For Executor

```text
Pull latest main. First read Batch 4/4.5 template runtime reports and BMAD standards. Then execute docs/bmad/tasks/sprint-05-batch-5-real-data-rollout-source-research-and-seeding.md. The goal is to start filling real source-backed data for pilot desa gradually, not to reach 100% completeness. Research official sources, classify data as easy/medium/rare/template-gap, map fields to current TemplateRuntimeContract, choose pilot desa, create review candidates, publish only reviewed eligible data, and report all QA/results honestly. Do not create a parallel publish path or use source-less internal admin input.
```

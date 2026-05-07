# Sprint 05 Batch 2 Data Governance Foundation Report

**Date:** 2026-05-06  
**Branch:** `main`  
**Scope:** S05-004 Data Governance & Permission Matrix, S05-005 MVP Village Data Field Catalog, S05-006 Data Source Registry Upgrade Plan, S05-006A Government Village Data Source Feasibility, S05-007 Data Quality Rules

---

## Executive Summary

Sprint 05 Batch 2 locks the business and data contract needed before PantauDesa implements versioning, mapping review, conflict handling, and public latest-published rendering.

This batch is intentionally docs-first:

1. no migration,
2. no schema apply,
3. no package install,
4. no public data behavior change,
5. no change to the Sprint 04-008 approval/publish flow.

The core decisions are:

- Internal Admin remains the only final publisher of public village data.
- Admin Desa input is valid as evidence, not as automatic final truth.
- Existing `DataSource` is a usable base, but it is not yet rich enough to carry full source identity, credibility, and review metadata on its own.
- MVP public data should stay limited to fields that can be sourced, reviewed, validated, and rendered honestly with empty states when data is missing.

---

## S05-004 - Data Governance & Permission Matrix

### Source priority

| Priority | Source class | Governance meaning |
|---|---|---|
| 1 | Official village/government website or official public source | Best baseline for public factual village data when current and attributable |
| 2 | Partner government/province source | High trust if PantauDesa has explicit cooperation or structured access |
| 3 | Admin Desa submission | Important operational source, but still reviewable and rejectable |
| 4 | Internal Admin manual input with source reference | Allowed as fallback or curation path, but still should cite evidence |
| 5 | Citizen voice | Signal/report only, never final source of truth by itself |

### Role permission matrix

| Actor | Can submit source/data | Can approve LIMITED-uploaded doc before processing | Can reject/return LIMITED-uploaded doc | Can create mapping draft | Can reject final mapping/data | Can resolve conflict | Can publish final public data |
|---|---|---|---|---|---|---|---|
| Internal Admin | Yes | No | No | Yes | Yes | Yes | Yes |
| Admin Desa VERIFIED | Yes | Yes | Yes | No | No | No | No |
| Admin Desa LIMITED | Yes, by upload/submission only | No | No | No | No | No | No |
| Citizen/Warga | Voice/signal only | No | No | No | No | No | No |

### Preserved workflow

The existing Sprint 04-008 flow remains the operational gate:

```text
LIMITED upload -> VERIFIED approve/reject/return -> Internal Admin review/publish/fail
```

Batch 2 does not change this flow. Future versioning and mapping work must be layered on top of it.

### Correction flow

Correction must be treated as a traceable workflow, not as silent overwrite:

1. Admin Desa uploads replacement evidence or submits correction.
2. Existing published data remains public until a newer reviewed version is approved.
3. Rejection reason must be explicit and user-safe.
4. Source trail and correction trail must be retained.
5. If a more trusted source contradicts Admin Desa input, Internal Admin may keep the higher-trust source and reject the correction with explanation.

### Governance defaults

- No auto-publish from AI mapping.
- No auto-publish from Admin Desa submission.
- No public rendering of draft, rejected, failed, or conflicted values as final.
- Public pages should prefer empty state over weak or unattributed data.

---

## S05-005 - MVP Village Data Field Catalog

### Catalog decisions

- Use existing Prisma models as the MVP base where possible: `Desa`, `DataSource`, `AnggaranDesaSummary`, `APBDesItem`, `DokumenPublik`, `PerangkatDesa`, and `AdminDesaDocument`.
- Allow proposal-only fields for categories not yet modeled (`fasilitas`, `potensi`, richer contact channels), but mark them clearly as future contract fields, not implementation-ready storage.
- Public-facing MVP should focus on fields with clear source attribution and understandable empty states.

### Field catalog

| fieldName | Label | Category | Visibility | Required | Time-sensitive | Source | Mapping mode | Allowed source type | Validation note | Public empty state |
|---|---|---|---|---|---|---|---|---|---|---|
| `Desa.nama` | Nama desa | Profil desa | public | required | no | required | manual or doc | official source, admin desa, internal admin | non-empty text | `Nama desa belum tersedia.` |
| `Desa.slug` | Slug profil desa | Profil desa | private/internal routing | required | no | optional | manual only | system generated, internal admin | unique slug | not shown |
| `Desa.kategori` | Kategori desa | Profil desa | public | optional | yes | recommended | manual or doc | official source, government source, admin desa | constrained text vocabulary later | `Kategori desa belum tersedia.` |
| `Desa.kodeDesa` | Kode desa | Wilayah | internal now, public later if verified | optional | no | recommended | manual or import | government source, official source | must match administrative format when available | `Kode desa belum diverifikasi.` |
| `Desa.kecamatan` | Kecamatan | Wilayah | public | required | no | required | manual or doc | official source, government source, admin desa | non-empty text | `Kecamatan belum tersedia.` |
| `Desa.kabupaten` | Kabupaten/Kota | Wilayah | public | required | no | required | manual or doc | official source, government source, admin desa | non-empty text | `Kabupaten belum tersedia.` |
| `Desa.provinsi` | Provinsi | Wilayah | public | required | no | required | manual or doc | official source, government source, admin desa | non-empty text | `Provinsi belum tersedia.` |
| `Desa.jumlahPenduduk` | Jumlah penduduk | Demografi | public | optional | yes | required if published | manual or doc | government source, official source, admin desa | positive integer | `Jumlah penduduk belum tersedia.` |
| `Desa.tahunData` | Tahun data | Demografi | public | required if `jumlahPenduduk` published | yes | required if published | manual or doc | government source, official source, admin desa | valid year | `Tahun data belum tersedia.` |
| `PerangkatDesa.nama` | Nama perangkat desa | Pemerintahan desa | public | optional | yes | required if published | manual or doc | official source, government source, admin desa | non-empty text | `Data perangkat desa belum tersedia.` |
| `PerangkatDesa.jabatan` | Jabatan perangkat desa | Pemerintahan desa | public | required if perangkat row published | yes | required if published | manual or doc | official source, government source, admin desa | non-empty text | `Jabatan perangkat desa belum tersedia.` |
| `PerangkatDesa.periode` | Periode tugas | Pemerintahan desa | public | optional | yes | recommended | manual or doc | official source, admin desa | bounded text/date range | `Periode tugas belum tersedia.` |
| `PerangkatDesa.kontakLabel` | Kontak perangkat desa | private by default | optional | yes | recommended | manual only for MVP | official source, admin desa | must not expose personal contact without approval | not shown publicly by default |
| `DokumenPublik.namaDokumen` | Judul dokumen publik | Dokumen publik | public | required | yes | required | manual or doc | official document, government source, admin desa | non-empty title | `Belum ada dokumen publik terverifikasi.` |
| `DokumenPublik.jenisDokumen` | Jenis dokumen | Dokumen publik | public | required | yes | required | manual or doc | official document, government source, admin desa | enum-backed type | `Jenis dokumen belum tersedia.` |
| `DokumenPublik.status` | Status ketersediaan dokumen | Dokumen publik | public | required | yes | required | manual only | official source, government source, internal admin | enum-backed status | `Status dokumen belum diketahui.` |
| `DokumenPublik.url` / file reference | Tautan dokumen | Dokumen publik | public if safe | optional | yes | required for downloadable/public evidence | manual or doc | official document, government source, admin desa | valid URL or storage/file reference | `Tautan dokumen belum tersedia.` |
| `DokumenPublik.tahun` | Tahun dokumen | Dokumen publik | public | optional | yes | recommended | manual or doc | official document, government source, admin desa | valid year | `Tahun dokumen belum tersedia.` |
| `AnggaranDesaSummary.tahun` | Tahun anggaran | Anggaran | public | required if summary published | yes | required | manual or doc | official document, government source, admin desa | valid year | `Tahun anggaran belum tersedia.` |
| `AnggaranDesaSummary.totalAnggaran` | Total anggaran | Anggaran | public | optional | yes | required if published | manual or doc | official document, government source, admin desa | non-negative integer | `Total anggaran belum tersedia.` |
| `AnggaranDesaSummary.totalRealisasi` | Total realisasi | Anggaran | public | optional | yes | required if published | manual or doc | official document, government source, admin desa | non-negative integer | `Realisasi anggaran belum tersedia.` |
| `AnggaranDesaSummary.persentaseRealisasi` | Persentase realisasi | Anggaran | public | optional | yes | derived or sourced | derived or doc | official document, government source, internal admin | 0-100 decimal | `Persentase realisasi belum tersedia.` |
| `AnggaranDesaSummary.statusSerapan` | Status serapan | Anggaran | public | optional | yes | optional | derived | internal admin, system generated | derived classification only | `Status serapan belum tersedia.` |
| `APBDesItem.kodeBidang` | Kode bidang APBDes | Anggaran | public | optional | yes | recommended | manual or doc | official document, government source | text/structured code | `Kode bidang belum tersedia.` |
| `APBDesItem.namaBidang` | Nama bidang APBDes | Anggaran | public | required if item published | yes | required | manual or doc | official document, government source, admin desa | non-empty text | `Nama bidang belum tersedia.` |
| `APBDesItem.anggaran` | Nilai anggaran bidang | Anggaran | public | optional | yes | required if published | manual or doc | official document, government source, admin desa | non-negative integer | `Nilai anggaran belum tersedia.` |
| `APBDesItem.realisasi` | Nilai realisasi bidang | Anggaran | public | optional | yes | required if published | manual or doc | official document, government source, admin desa | non-negative integer | `Nilai realisasi belum tersedia.` |
| `APBDesItem.persentase` | Persentase realisasi bidang | Anggaran | public | optional | yes | derived or sourced | derived or doc | official document, government source | 0-100 decimal | `Persentase bidang belum tersedia.` |
| `Desa.websiteUrl` | Website resmi desa | Kontak/kanal resmi | public | optional | yes | required if published | manual or doc | official source, government source, admin desa | valid URL and official relevance | `Website resmi belum tersedia.` |
| `officialEmail` proposal | Email resmi desa | Kontak/kanal resmi | private first, public later | optional | yes | required if published | manual only for MVP | official source, admin desa | valid email and non-personal where possible | `Email resmi belum tersedia.` |
| `socialChannel` proposal | Kanal sosial resmi | Kontak/kanal resmi | public | optional | yes | recommended | manual only for MVP | official source, admin desa | valid URL/account handle | `Kanal resmi belum tersedia.` |
| `fasilitasRingkas` proposal | Ringkasan fasilitas desa | Fasilitas | public | optional | yes | required if published | manual or doc later | government source, official source, admin desa | structured list preferred later | `Data fasilitas belum tersedia.` |
| `potensiUtama` proposal | Potensi utama desa | Potensi desa | public | optional | yes | required if published | manual or doc later | government source, official source, admin desa | bounded text/tag list | `Potensi desa belum tersedia.` |
| `AdminDesaDocument.title` | Judul dokumen admin desa | Internal evidence | internal | required | yes | required | upload | admin desa document upload | non-empty title | not shown publicly |
| `AdminDesaDocument.category` | Kategori dokumen admin desa | Internal evidence | internal | required | yes | required | upload | admin desa document upload | non-empty text or controlled vocab later | not shown publicly |

### Catalog summary

- MVP public fields should lean on `Desa`, `AnggaranDesaSummary`, `APBDesItem`, `DokumenPublik`, and selected `PerangkatDesa`.
- `Fasilitas`, `Potensi`, and richer official contacts are valid Sprint 05 targets, but still proposal-only until versioning and source handling are ready.
- `AdminDesaDocument` is evidence input, not direct public output.

---

## S05-006 - Data Source Registry Upgrade Plan

### Current model review

Current `DataSource` strengths:

- already linked to `Desa`,
- already linked to `AnggaranDesaSummary`, `APBDesItem`, `DokumenPublik`, and `PerangkatDesa`,
- already stores `sourceName`, `sourceUrl`, `sourceType`, `accessStatus`, `dataAvailability`, `lastCheckedAt`, `notes`, and `dataStatus`.

Current gaps:

- no durable field for uploader/inputter identity,
- no explicit source date,
- no explicit confidence/credibility rating,
- no explicit review status separate from generic `dataStatus`,
- no clean link to `AdminDesaDocument`,
- no future link to `VillageDataVersion`,
- no distinction between source identity and a later extracted/versioned data snapshot.

### Registry decision

Use the existing `DataSource` table as the base entity and extend it in a future schema proposal, rather than replacing it.

For later Sprint 05 implementation, plan for:

1. `DataSource` as the durable source identity record.
2. `VillageDataVersion` as the reviewed data snapshot record.
3. a join/link layer between versioned data and one or more sources.
4. an optional source check/history table later if repeated crawl/refresh monitoring becomes necessary.

### Proposed sourceType vocabulary

Recommended logical enum candidates for Sprint 05 proposal:

| Proposed sourceType | Meaning |
|---|---|
| `OFFICIAL_VILLAGE_WEBSITE` | official village website/profile |
| `GOVERNMENT_DATASET` | government open dataset or official portal dataset |
| `GOVERNMENT_DOCUMENT` | official document from government/public source |
| `PARTNER_GOVERNMENT_FEED` | partner/government integration with explicit cooperation |
| `ADMIN_DESA_DOCUMENT_UPLOAD` | uploaded evidence document from Admin Desa |
| `ADMIN_DESA_CORRECTION_SUBMISSION` | correction or replacement evidence from Admin Desa |
| `INTERNAL_ADMIN_MANUAL_ENTRY` | manual curation/input by Internal Admin with cited evidence |
| `CITIZEN_VOICE_SIGNAL` | signal-only citizen report |
| `SYSTEM_GENERATED_DERIVATION` | derived classification or computed value |
| `OTHER_VERIFIED_SOURCE` | fallback verified source not covered above |

Mapping note:

- The current Prisma enum (`demo`, `manual`, `official_website`, `official_document`, `kecamatan_page`, `article_page`, `archive_page`, `other`) is too coarse for Sprint 05 final governance.
- Keep it unchanged for now. Treat the list above as the proposal target for a later schema review.

### Source metadata required in the proposal

Each source record should eventually support:

- source type
- source name
- source URL or file reference
- uploader/inputter actor
- source date / publication date
- confidence or credibility score/band
- review status
- internal admin note
- access type
- data domain/category coverage
- refresh or last-check timestamp

### Relationship plan

| Relation target | Recommended role |
|---|---|
| `Desa` | source may be scoped to one village or a wider region |
| `VillageDataVersion` proposal | version should reference one or more supporting sources |
| `AdminDesaDocument` | uploaded document should be promotable into a source record after review |
| public rendering | public page should show only published values and, where useful, human-readable source attribution |

### Source publishing rule

Admin Desa source must never be considered final automatically.

Required path:

```text
source captured -> mapping/correction reviewed -> conflict checked -> Internal Admin approves -> published version updates public data
```

---

## S05-006A - Government Village Data Source Feasibility

### Candidate source matrix

| Source | Domain | Desa-level available | Access type | SourceType recommendation | MVP fit | Main limitation/risk |
|---|---|---|---|---|---|---|
| SID Kemendesa - IDM | village development status and indicators | yes | public web, API/export unknown | `GOVERNMENT_DATASET` | high | export/API stability and terms still need validation |
| SID Kemendesa - Dana Desa | village fund and distribution signal | unknown to partial | public web | `GOVERNMENT_DATASET` | high | row-level desa fields still need manual validation |
| SID Kemendesa - Profil | profile and village reference info | yes | public web plus restricted areas | `GOVERNMENT_DATASET` | high | sensitive/login-only areas must stay out of scope |
| Satu Data Kemendesa | dataset discovery portal | dataset-dependent | public portal/export | `GOVERNMENT_DATASET` | high | not every dataset is village-level or machine-friendly |
| Satu Data Kemendesa - Data Insight | insight/dashboard views | unknown | public web | `GOVERNMENT_DATASET` | medium | may expose aggregates, not clean raw village rows |
| BPS PODES | facilities, infrastructure, socio-economic context | unknown | publication/manual/export varies | `GOVERNMENT_DATASET` | medium-high | granular public access may be limited |
| Prodeskel Kemendagri | village profile and institutional data | unknown | login/manual | `GOVERNMENT_DATASET` | medium | access may require authorization; no scraping |
| Satu Data Indonesia - Jumlah Penduduk Desa | village population | yes if dataset resource is usable | public dataset/API/export | `GOVERNMENT_DATASET` | high | freshness and field completeness need validation |
| data.go.id - Jumlah Desa/Kelurahan | regional counts | no for detailed village profile | public dataset/export | `GOVERNMENT_DATASET` | low-medium | mostly aggregate administrative support |
| INAPROC / LKPP Profil Pengadaan Monitoring | procurement signal | unknown | public dashboard/manual | `GOVERNMENT_DATASET` or `PARTNER_GOVERNMENT_FEED` later | low-medium for MVP | village relevance is not yet proven |
| Data PDN INAPROC | procurement/PDN signal | unknown | public dashboard/manual | `GOVERNMENT_DATASET` or `PARTNER_GOVERNMENT_FEED` later | low-medium | likely not village-specific enough for first MVP |
| API Data Wilayah Indonesia | administrative code/name lookup | yes for names/codes | public API | `OTHER_VERIFIED_SOURCE` | medium as helper only | not primary truth for substantive village facts |
| WebGIS Kemendesa | geospatial and thematic layers | unknown | public web/catalog/manual | `GOVERNMENT_DATASET` | medium | official scope, dataset download, and village-level extractability still unclear |

### MVP shortlist

Recommended MVP feasibility shortlist:

1. SID Kemendesa - IDM
2. SID Kemendesa - Profil
3. Satu Data Indonesia - Jumlah Penduduk Desa
4. SID Kemendesa - Dana Desa
5. API Data Wilayah Indonesia, but only as helper for administrative normalization, not as source of record

### Use now vs later

Use now for proposal and manual verification only:

- IDM
- Profil
- population dataset

Defer deeper integration research:

- BPS PODES
- Prodeskel
- INAPROC / PDN
- WebGIS

### Feasibility conclusions

- Village-level public government data exists, but consistency and machine-readiness differ heavily by source.
- The safest Sprint 05 approach is to treat these as candidate evidence registries first, not as automatic ingest feeds.
- PantauDesa should prefer manual validation and source attribution over aggressive integration.

---

## S05-007 - Data Quality Rules

### Validation rules

| Field/group | Rule | Invalid behavior | Admin-facing message |
|---|---|---|---|
| `jumlahPenduduk` | must be a positive integer | `needs_correction` or `mapping_failed` if extraction is broken | `Jumlah penduduk harus berupa angka positif.` |
| `websiteUrl` | must be a valid URL and should point to an official channel | `needs_review` if URL is syntactically valid but not clearly official | `Website resmi harus berupa URL yang valid.` |
| `tahunData` | must be a valid year in reasonable range | `needs_correction` | `Tahun data harus berupa tahun yang valid.` |
| official email proposal | must be valid email format and should avoid personal email for public official contact | `needs_review` | `Email resmi harus valid dan sebaiknya bukan email pribadi.` |
| `AnggaranDesaSummary.*` | published budget summary must include `tahun` and at least one cited source | `reject` or `needs_correction` | `Data anggaran wajib punya tahun dan sumber.` |
| `APBDesItem.*` | each published item should include `namaBidang`; numeric values must be non-negative | `mapping_failed` or `needs_correction` | `Bidang APBDes wajib punya nama bidang dan nilai yang valid.` |
| `DokumenPublik.*` | public document must have title, status, source, and URL/file reference if claimed as available | `needs_review` or `reject` | `Dokumen publik wajib punya judul, status, sumber, dan referensi file atau tautan.` |
| `PerangkatDesa.nama/jabatan` | row should not publish if jabatan or nama is missing | `needs_correction` | `Nama dan jabatan perangkat desa wajib diisi sebelum dipublikasikan.` |
| proposal fields `fasilitasRingkas` / `potensiUtama` | should publish only with attributed source and bounded content | `needs_review` | `Data fasilitas atau potensi butuh sumber yang jelas sebelum dipublikasikan.` |
| all public/published fields | source is mandatory unless the field is explicitly system-derived from sourced data | `reject` | `Field yang dipublikasikan wajib punya sumber.` |

### Stale threshold guidance

| Data group | Stale threshold |
|---|---|
| demografi | 2 years |
| perangkat desa | 1 year or when leadership changes |
| dokumen publik tahunan | current budget year plus previous year |
| anggaran summary/APBDes | current fiscal year |
| website/contact channel | 6 months manual recheck if no automated verification exists |
| facilities/potential | 2 years unless source explicitly newer |

### Invalid behavior contract

| State | When to use |
|---|---|
| `reject` | data clearly conflicts with policy or lacks minimum publish requirements |
| `needs_review` | source exists, but trust, freshness, or official relevance still needs human judgment |
| `needs_correction` | submitter can reasonably fix the issue by clarifying or replacing evidence |
| `mapping_failed` | extraction or mapping output is technically unusable |

### Runtime implementation note

Batch 2 does not implement runtime validation. The rules above are the contract for later helper-level validation in mapping, review, and publish flows.

---

## Implementation Guidance For Next Batch

Before versioning or conflict logic starts:

1. reuse `DataSource` rather than inventing a second competing source model,
2. model future `VillageDataVersion` as reviewed data snapshots, not as direct overwrite of `Desa`,
3. keep `AdminDesaDocument` as evidence intake,
4. validate fields before publish, not only at ingestion,
5. keep public pages on latest reviewed/published values only.

---

## QA

Batch 2 remains docs/proposal-first. No migration, schema apply, or package install was executed for this batch.

Latest close-out QA note:

| Command | Result | Note |
|---|---|---|
| `npm run lint` | PASS | warning lama `.eslintignore` masih muncul |
| `npx tsc --noEmit` | PASS | tidak ada type error dari perubahan docs/proposal Batch 2 |
| `npx prisma generate` | BLOCKED | issue environment Prisma Windows `EPERM` |
| `npm run build` | BLOCKED | berhenti di langkah `prisma generate` yang gagal karena `EPERM` |

Interpretasi:

- Kontrak governance, field catalog, source registry, dan data quality rules untuk Batch 2 sudah terdokumentasi.
- Blocker build bukan berasal dari isi proposal Batch 2, tetapi dari environment Prisma Windows yang juga mempengaruhi batch lanjutan.

---

## Guardrails

- No migration created.
- No schema applied.
- No package installed.
- No production environment change.
- No business flow change.
- No public dummy data.
- No auto-publish AI/Admin Desa data.
- No scraping or government source integration.

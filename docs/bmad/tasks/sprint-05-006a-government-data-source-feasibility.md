# Sprint 05-006A - Government Village Data Source Feasibility

## Status
READY FOR OWNER REVIEW - research and source registry input only, no integration yet.

## Parent Task

Related primary Sprint 05 task:

```text
S05-006 - Data Source Registry Upgrade Plan
```

Related downstream tasks:

```text
S05-005 - MVP Village Data Field Catalog
S05-007 - Data Quality Rules
S05-010 - Document Intake & Auto Mapping Adapter
S05-011 - Structured Value Diff / Conflict Engine
S05-013 - Public Data Completeness & Empty State
S05-014 - Public Latest Published Rendering
```

## Purpose

Collect and evaluate official or semi-official data sources that can support PantauDesa village data quality.

This task does not integrate any source yet. It only records candidate sources, their likely data domain, trust level, access risk, and how they should be represented in the Sprint 05 source registry.

## Why This Matters

Sprint 05 needs village data that is traceable, reviewed, versioned, and publishable. Admin Desa input is useful but not automatically final. Official government/public sources should be used as higher-priority evidence when available.

## Source Priority Reminder

Initial trust order from Sprint 05 planning:

1. Official village/government website or official public source.
2. Partner government/province source if PantauDesa has cooperation/data access.
3. Admin Desa direct submission.
4. Internal admin manual input with source reference.
5. Citizen voice as signal/report only, not final source of truth.

## Candidate Source Matrix

| Source | URL | Owner / Institution | Data Domain | Likely Granularity | Access Type | Suggested Source Type | Trust Level | MVP Usage | Limitation / Risk | Related Task |
|---|---|---|---|---|---|---|---|---|---|---|
| SID Kemendesa - IDM | https://sid.kemendesa.go.id/idm | Kemendesa PDTT | Indeks Desa Membangun, status desa, indikator sosial/ekonomi/ekologi | Desa visible in UI | public web, API/export unknown | GOVERNMENT_SOURCE | High | Source pendukung untuk status/quality desa | Need check export/API stability and usage terms | S05-006, S05-007, S05-013 |
| SID Kemendesa - Dana Desa | https://sid.kemendesa.go.id/village-fund | Kemendesa PDTT, source references monevdd.kemendesa.go.id | Dana Desa, penyaluran, BLT Desa, padat karya | wilayah/desa search likely available | public web, API/export unknown | GOVERNMENT_SOURCE | High | Source pendukung anggaran/dana desa | Need verify row-level desa availability and field mapping | S05-006, S05-010, S05-011 |
| SID Kemendesa - Profil | https://sid.kemendesa.go.id/profile | Kemendesa PDTT | Profil desa, SDGs Desa, BUMDes, data wilayah | desa search available, some BNBA login-protected | public web + login for sensitive data | GOVERNMENT_SOURCE | High | Public/non-sensitive profile support | BNBA/sensitive data must not be used; API/export unknown | S05-005, S05-006, S05-014 |
| Satu Data Kemendesa | https://satudata.kemendesa.go.id/ | Kemendesa PDTT | Dataset desa, daerah tertinggal, BUM Desa, IDM, geospasial, data insight | dataset-dependent | portal dataset, access varies | GOVERNMENT_SOURCE | High | Source registry candidate and dataset discovery | Need evaluate each dataset license, freshness, and machine access | S05-006, S05-005 |
| Satu Data Kemendesa - Data Insight | https://satudata.kemendesa.go.id/pages/data-insight | Kemendesa PDTT | Transmigrasi, daerah tertinggal, desa cerdas, BUM Desa, IDM, geospasial | aggregate/dataset-dependent | public web | GOVERNMENT_SOURCE | Medium-High | Discovery of relevant public indicators | May be insight/dashboard rather than raw desa-level data | S05-006, S05-013 |
| BPS PODES | https://www.bps.go.id/ | Badan Pusat Statistik | Potensi desa, fasilitas, infrastruktur, sosial-ekonomi desa/kelurahan | desa/kelurahan in Podes program, public raw access varies | publications/tables/API varies | GOVERNMENT_SOURCE | Very High | Reference for facilities, potential, infrastructure, socio-economic context | Raw per-desa data may not be easily accessible; may require publication extraction | S05-005, S05-006, S05-010 |
| Prodeskel Kemendagri | https://prodeskel.binapemdes.kemendagri.go.id/ | Kemendagri / Bina Pemdes | Profil desa/kelurahan, potensi, kelembagaan, sarana-prasarana, perkembangan desa | desa/kelurahan | likely login/limited public access | GOVERNMENT_SOURCE | High | Ideal official profile reference if access exists | Access may be restricted; do not scrape login-protected data without authorization | S05-006, S05-004 |
| Satu Data Indonesia - Jumlah Penduduk Desa | https://katalog.satudata.go.id/dataset/data-jumlah-penduduk-desa | Kemendagri via Satu Data Indonesia | Jumlah penduduk desa | desa | dataset JSON listed | GOVERNMENT_SOURCE | High if accessible/fresh | Baseline demografi / population candidate | Check resource availability, freshness, fields, and license before use | S05-005, S05-006, S05-007 |
| Satu Data Indonesia / data.go.id - Jumlah Desa/Kelurahan | https://data.go.id/dataset/dataset/data-jumlah-desa-kelurahan | Kemendagri via Satu Data Indonesia | jumlah desa/kelurahan, administrative counts | wilayah aggregate | dataset access may be limited | GOVERNMENT_SOURCE | Medium-High | Region/administrative baseline support | May be limited/aggregate, not village data detail | S05-006 |
| INAPROC / LKPP Profil Pengadaan Monitoring | https://data.inaproc.id/ | LKPP | Pengadaan, perencanaan, pelaksanaan, pembayaran, PDN/Non-PDN | likely K/L/Pemda/region; desa-level unknown | dashboard/public web | GOVERNMENT_PROCUREMENT_SOURCE | High for procurement domain | Source pendukung/pembanding anggaran/pengadaan | Need verify whether desa-level data exists; not automatically final village budget source | S05-006, S05-010, S05-011 |
| Data PDN INAPROC | https://data-pdn.inaproc.id/ | LKPP / INAPROC ecosystem | PDN/Non-PDN, procurement planning/execution/payment signals | K/L/Pemda/region likely | dashboard/public web | GOVERNMENT_PROCUREMENT_SOURCE | High for procurement domain | Procurement indicator support | Granularity and village relevance must be proven | S05-006 |
| API Data Wilayah Indonesia | https://api.datawilayah.com/ | Third-party derived from government datasets | wilayah administrative lookup, potentially demographics | desa/kelurahan lookup | public API | THIRD_PARTY_DERIVED_GOVERNMENT | Medium | Dev/QA/helper lookup only | Not primary source of truth; must trace back to official source | S05-006, S05-015 |
| WebGIS Kemendesa | https://webgiskemendesa.com/ | Kemendesa-related geospatial portal | geospatial datasets, maps, environment/infrastructure/economy themes | spatial dataset-dependent | public web/catalog, download varies | GOVERNMENT_GEOSPATIAL_SOURCE | Medium-High | Geospatial support / future enrichment | Need verify official status, datasets, license, and download/API availability | S05-006, S05-013 |

## Required Feasibility Checks

For each candidate source, record:

```text
sourceName
ownerInstitution
sourceUrl
dataDomain
desaLevelAvailable: yes/no/unknown
accessType: public/API/export/login/manual
updateFrequency
licenseOrUsageTerms
trustLevel
MVPUsage
limitations
recommendedSourceType
```

## Integration Rules

Do not:

- integrate or scrape immediately
- scrape login-protected data without authorization
- store BNBA/personal data
- treat third-party derived data as final source of truth
- publish data from any candidate source without review/versioning
- bypass source attribution
- auto-resolve conflicts based only on source priority

Allowed:

- add candidates to source registry proposal
- manually inspect public pages and public downloads
- recommend 1-2 high-value sources for MVP validation
- create adapter design for future ingestion

## Recommended Initial MVP Source Candidates

Start with source feasibility, not integration:

1. SID Kemendesa - IDM
2. SID Kemendesa - Dana Desa
3. SID Kemendesa - Profil
4. Satu Data Indonesia - Jumlah Penduduk Desa
5. INAPROC / LKPP as procurement/budget support only

BPS PODES and Prodeskel are high-trust but may need deeper access/legal/format validation before MVP integration.

## Expected Output

Update S05-006 Data Source Registry work with:

- source registry candidate table
- recommended `sourceType` enum candidates
- source priority notes
- source limitation notes
- MVP source shortlist
- no code integration unless owner explicitly starts implementation task

## Acceptance Criteria

- candidate source matrix is reviewed
- each source has MVP usage and limitation
- no integration or scraping is performed
- no personal/sensitive data is collected
- source registry proposal references these candidates

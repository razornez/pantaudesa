# Sprint 05 Batch 3 Extension - Internal Dashboard

## Status
PLANNED - extend Batch 3 after Village Data Flow Consolidation P0 verification.

## Purpose

Add an internal dashboard for owner/internal admin to monitor PantauDesa data coverage, data quality, source trust, public traffic, and village ranking signals.

This dashboard is not a public page. It is for internal decision-making and backlog prioritization.

## Owner Direction

Owner needs a dashboard to see, at minimum:

1. Village data currently available in PantauDesa DB compared with total villages in Indonesia.
2. Real data vs dummy data; which components already use real/source-backed data and which still use dummy/fallback.
3. Visitor traffic.
4. Filters/rankings for best/worst villages, most comments, worst facilities, lowest budget, and similar operational insights.

## Mandatory UI Standard

Must follow:

```text
docs/bmad/standards/back-office-ui-design-guidelines.md
```

The dashboard must use the same quiet luxury back-office direction:

```text
clean
premium but simple
decision-oriented
source-backed
compact but breathable
mobile-friendly
no noisy analytics wall
```

Avoid huge generic BI dashboard UI. The dashboard should help owner quickly decide what needs attention.

## Proposed Route

```text
/internal-admin/dashboard
```

Menu label:

```text
Dashboard Internal
```

Alternative if navigation wants it under Data Desa:

```text
/internal-admin/village-data?tab=overview
```

Preferred for MVP:

```text
/internal-admin/dashboard
```

because this dashboard covers more than village data.

## Scope

### 1. National Coverage Overview

Goal:

Show how much PantauDesa covers compared with total villages in Indonesia.

Metrics:

```text
PantauDesa desa in DB
Total desa reference Indonesia
Coverage percentage
Desa with published real data
Desa with only dummy/fallback data
Desa with no usable public data
```

Important source rule:

- total village reference must come from an official/government-maintained source or a documented static reference with source/date;
- do not hardcode a random number without source label;
- show the source label and last checked date.

Suggested data model later:

```text
NationalCoverageReference
- id
- countryCode
- level
- totalCount
- sourceName
- sourceUrl
- sourceDate
- lastCheckedAt
- notes
```

MVP may use config/constant only if it includes:

```text
sourceName
sourceUrl
sourceDate
lastCheckedAt
```

### 2. Real vs Dummy Data Quality

Goal:

Show which data is real/source-backed vs dummy/fallback.

Metrics:

```text
real/source-backed DataDesa count
dummy/fallback field count
published source-backed count
in-review count
rejected count
components with real data
components still dummy/fallback
```

Breakdown by component/template:

```text
Identitas & Wilayah
Demografi
Sumber & Dokumen
Transparansi & Skor
Perangkat Desa
Anggaran & Realisasi
Sumber Pendapatan
Kinerja & APBDes
Profil & Kelengkapan
Panduan Warga
Suara Warga
```

Rules:

- source-backed means value has trusted source/evidence;
- dummy/fallback must be clearly labeled;
- do not present dummy as real public data;
- show which desa/components need data completion.

### 3. Visitor Traffic

Goal:

Show traffic to public pages and key village detail pages.

Preferred data sources:

- Vercel Analytics if already available;
- PostHog / Plausible / Umami if configured later;
- Sentry performance only for error/performance diagnostics, not full product analytics;
- server-side lightweight pageview table only if approved and privacy-safe.

MVP dashboard must not expose PII.

Metrics:

```text
total visits
unique visitors if analytics source supports it safely
top village detail pages
traffic by day
referrer/source if available
device type if available
slowest pages / error rate if available
```

Privacy guardrails:

- no emails,
- no tokens,
- no DB URLs,
- no raw IP display,
- no document content,
- no storage keys,
- no sensitive identifiers.

### 4. Village Ranking / Filters

Goal:

Help owner identify villages that need attention or are performing well.

Required ranking/filter ideas:

```text
Desa paling lengkap datanya
Desa paling kurang datanya
Desa paling banyak komentar/suara warga
Desa dengan komentar unresolved terbanyak
Desa dengan fasilitas terburuk / fasilitas paling kurang lengkap
Desa dengan anggaran terendah
Desa dengan realisasi anggaran terendah
Desa dengan dokumen publik paling lengkap
Desa dengan dokumen publik paling kurang
Desa dengan transparansi/skor terendah
Desa dengan data paling lama/outdated
Desa dengan conflict/source mismatch terbanyak
Desa dengan data paling banyak rejected
Desa dengan data in-review terbanyak
Desa dengan traffic publik tertinggi
Desa dengan traffic tinggi tapi data rendah
Desa dengan admin desa aktif
Desa tanpa admin desa verified
```

Filters:

```text
nama desa
provinsi
kabupaten/kota
kecamatan
template
component
status data
source type
real vs dummy
published/in-review/rejected
traffic range
comment count
budget range
last updated range
```

Reuse village filter component created for internal admin. Do not create duplicate filter components.

### 5. Actionable Backlog Signals

Dashboard should not only show numbers. It should suggest follow-up work.

Examples:

```text
12 desa traffic tinggi tapi data anggaran kosong
8 desa punya komentar fasilitas buruk tapi belum ada data fasilitas source-backed
5 desa punya dokumen upload tapi belum dipublish
10 desa masih memakai dummy transparansi
```

Each card should have CTA:

```text
Buka Data Desa
Buka Intake
Buka Dokumen
Buka Detail Desa
Buka Audit Log
```

## Data Source / Source-of-Truth Requirements

Dashboard must respect governance:

```text
internal admin is not source of truth
public data must be source-backed
citizen voice is signal only
```

Do not count citizen voice as factual village data. Count it as signal/comment/feedback.

## MVP Layout Proposal

### Header

```text
Dashboard Internal
Ringkasan coverage, kualitas data, traffic, dan prioritas perbaikan desa.
```

### Top KPI Cards

1. PantauDesa coverage vs total desa Indonesia.
2. Desa with source-backed public data.
3. Dummy/fallback ratio.
4. Total traffic / visits.
5. Open review/audit items.

### Section A - Data Coverage

- national coverage chart/card,
- by province/kabupaten if data exists,
- real vs dummy ratio.

### Section B - Component Quality

- component matrix: real / dummy / missing / in-review,
- top components needing work.

### Section C - Traffic

- traffic trend,
- top public pages,
- high traffic + low data completeness warning.

### Section D - Village Ranking Explorer

- reusable filters,
- ranking presets,
- village list with score badges.

### Section E - Action Queue

- generated insights/actionable tasks.

## Technical Requirements

### API

Create internal API endpoint(s), for example:

```text
/api/internal-admin/dashboard/summary
/api/internal-admin/dashboard/village-rankings
/api/internal-admin/dashboard/traffic
```

Use server-side auth guard:

```text
requireInternalAdminSession
```

### Data Aggregation

Must avoid expensive N+1 queries.

Use:

- aggregate queries,
- grouped counts,
- pagination,
- caching where safe,
- guarded diagnostics only.

### Traffic Integration

If analytics provider is not available yet, dashboard should show honest empty state:

```text
Traffic analytics belum dikonfigurasi. Sambungkan Vercel Analytics/PostHog/Plausible/Umami untuk melihat traffic.
```

Do not fake traffic data.

## Out of Scope For This Batch

Do not build yet:

- full template CRUD;
- full BI analytics suite;
- scraping automation;
- public dashboard;
- AI recommendations;
- paid analytics integration without approval;
- manual public data creation.

## QA Required

Run and report:

```bash
npm run lint
npx tsc --noEmit
npx prisma generate
npm run build
```

Manual QA:

1. Open `/internal-admin/dashboard`.
2. Confirm only internal admin can access.
3. Confirm coverage metrics load.
4. Confirm real vs dummy metrics load.
5. Confirm traffic section shows data or honest empty state.
6. Confirm filters work by desa/provinsi/kabupaten/kecamatan.
7. Confirm ranking presets work.
8. Confirm no PII/secrets are displayed.
9. Confirm UI follows back-office guideline.
10. Confirm links/CTAs open relevant pages.

Playwright if available:

- dashboard loads for internal admin;
- redirects/blocks non-internal admin;
- filter changes update results;
- empty traffic state is shown when analytics is not configured;
- no horizontal scroll at 375px viewport.

## Required Report

Create/update:

```text
docs/bmad/reports/sprint-05-batch-3-internal-dashboard-extension-report.md
```

Report must include:

1. route implemented,
2. metrics included,
3. national total source used,
4. real vs dummy definition,
5. traffic source or empty state,
6. ranking/filter presets,
7. component reuse summary,
8. privacy guardrails,
9. performance notes,
10. QA results,
11. Playwright result or reason not run,
12. known limitations,
13. next enhancement.

## Acceptance Criteria

- Internal dashboard route exists.
- Coverage vs Indonesia total is shown with source label/date.
- Real vs dummy/source-backed breakdown is visible.
- Traffic section exists and is honest if analytics is unavailable.
- Ranking/filter explorer supports meaningful owner filters.
- UI follows back-office guideline.
- No PII/secrets are displayed.
- No dummy traffic data is shown.
- No template CRUD is added in this batch.
- QA/report are complete.

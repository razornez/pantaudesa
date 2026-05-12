# Sprint 05 Next Enhancement - Public Village Filter

## Status
NICE TO HAVE / NEXT ENHANCEMENT.

Do not block Sprint 05 Batch 3 P0 flow consolidation.
Do not block Internal Dashboard extension.

## Purpose

Improve the public `/desa` discovery experience with richer filtering and sorting so visitors can find villages by location, data completeness, source-backed status, public activity, and key village signals.

## Owner Direction

Public filter is useful and should be considered as a nice-to-have enhancement.

The public page can eventually support a lighter version of internal dashboard filters, but with public-safe wording and no sensitive/admin-only data.

## Route

```text
/desa
```

## Reuse Requirement

Reuse or extract the village filter pattern/component where possible.

Do not create duplicate filter logic/components that diverge between:

```text
/desa
/internal-admin/village-data
/internal-admin/dashboard
```

Recommended direction:

```text
shared village filter primitives
-> public wrapper for /desa
-> internal wrapper for admin pages
```

Public and internal filters may expose different options, but should share core query/filter logic when possible.

## Public Filter Ideas

### Basic filters

```text
nama desa
provinsi
kabupaten/kota
kecamatan
kategori desa
```

### Data quality filters

```text
data paling lengkap
data paling sedikit
punya data source-backed
masih banyak data kosong
punya dokumen publik
punya data anggaran
punya data kontak resmi
```

### Public activity filters

```text
paling banyak suara warga
paling banyak komentar belum selesai
paling aktif dilihat jika analytics tersedia
```

### Village signal filters

```text
fasilitas umum tersedia
potensi unggulan tersedia
anggaran tersedia
transparansi tinggi/rendah jika score sudah valid
```

### Sort options

```text
nama A-Z
terbaru diperbarui
data paling lengkap
paling banyak suara warga
paling banyak dilihat jika traffic data tersedia
anggaran tertinggi/terendah jika source-backed
```

## Public Safety Rules

Do not expose internal-only indicators such as:

- raw audit events,
- reviewer names,
- rejected values,
- draft/in-review data,
- source conflict internals,
- internal admin notes,
- raw IP/user analytics,
- sensitive identifiers.

Use neutral public wording, for example:

```text
Data belum lengkap
Belum ada sumber terverifikasi
Banyak masukan warga
Dokumen belum tersedia
```

## Relationship With Internal Dashboard

Internal dashboard may use operational labels for owner prioritization.
Public page should use softer, neutral labels.

## Data Requirements

Public filter must only use public-safe data:

```text
PUBLISHED
isActive = true
component visible
source-backed where needed
```

No draft/rejected/in-review data may affect public filtering unless exposed as a safe aggregate later with owner approval.

## UX Direction

Follow current public design language, not admin dashboard density.

Public filter should be:

- simple,
- mobile-friendly,
- fast,
- easy to reset,
- not overwhelming,
- visually consistent with `/desa`.

## Out of Scope For Initial Nice-to-have

Do not build yet unless explicitly approved:

- public map view,
- public comparison table,
- advanced analytics exposed to public,
- template CRUD,
- scraping automation.

## Acceptance Criteria

- Public `/desa` can filter by location and useful public-safe data signals.
- Filter component reuses shared primitives where possible.
- No internal/sensitive data leaks.
- Labels are neutral and public-safe.
- Mobile layout works cleanly.
- Query performance remains acceptable.

## Short Instruction For Later Executor

```text
This is a next enhancement. Do not start before Batch 3 P0 flow consolidation and Internal Dashboard extension are stable. When started, improve /desa filtering using reusable village filter primitives, public-safe labels, and strict published/source-backed data rules.
```

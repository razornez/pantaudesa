# Sprint 05 - Intake Coverage Template Sync Addendum

## Status
MANDATORY ADDENDUM.

## Owner Feedback

The Intake Review coverage panel currently shows sections such as:

```text
Identitas & wilayah
Demografi
Pemerintahan desa
Profil desa
Dokumen & transparansi
Anggaran & realisasi
```

Owner noticed this can be confusing because `/internal-admin/village-data` now has many DB-backed template components/sections.

The intake coverage panel must be synchronized with the actual active template used by the selected desa.

## Required Behavior

When a desa is selected in Intake, the coverage panel must resolve:

```text
selected desa
-> active template
-> visible components
-> field standards inside visible components
-> detected upload result
-> coverage summary
```

The panel must clearly show which template is being used.

Example visible copy:

```text
Template dipakai: Template Detail Desa Publik Saat Ini
Key: CURRENT_PUBLIC_DETAIL_TEMPLATE
Source: DB / fallback
```

If the desa has a custom template, show that template name/key.

If resolver falls back to constants because DB/default template is unavailable, show a calm warning:

```text
Menggunakan fallback standar karena template DB belum tersedia.
```

## Current Problem To Fix

The existing implementation still builds coverage rows from the hardcoded `DETAIL_FIELD_STANDARDS` array, while `resolvedTemplate` is only used to detect hidden components.

This is not enough.

Coverage must not show a different section/component structure than the active template shown in `/internal-admin/village-data`.

## Required Code Direction

Update coverage generation so that entries are derived from `resolvedTemplate.visibleComponents` whenever a DB template is available.

Recommended approach:

1. Convert `ResolvedTemplate.visibleComponents[].fields[]` into `DetailFieldCoverageEntry`-compatible entries.
2. Preserve source/policy metadata where available.
3. Group the coverage chart by `componentLabel`, not legacy `sectionLabel`, when using DB template.
4. Keep `DETAIL_FIELD_STANDARDS` only as fallback.
5. Remove or minimize `SECTION_TO_COMPONENT` legacy bridging after DB template derivation is working.

## UI Requirements

The coverage card must include:

- template name,
- template key,
- data source: `DB template` or `fallback standard`,
- visible component count,
- total active field count,
- hidden component count if any.

The per-section breakdown must match active template components.

For example, if `/internal-admin/village-data` shows components:

```text
Identitas
Demografi
Perangkat
Profil Desa
Transparansi
Anggaran
Pendapatan
Kinerja
Dokumen
Fasilitas
Potensi
```

then the intake coverage panel should use those same component labels or intentionally grouped labels, but must not silently show an older hardcoded grouping that makes the user think the system is inconsistent.

## Hidden Component Behavior

If uploaded data maps to a hidden component:

- do not count it as publishable,
- show it as detected but hidden/not currently publishable,
- include the hidden component name,
- explain that the desa's current template hides that component.

Example:

```text
Anggaran terdeteksi, tapi komponen Anggaran sedang disembunyikan untuk desa ini.
```

## Source-of-Truth Policy

Coverage wording must respect source governance:

- do not say `Aman dipublish` unless source/evidence requirement is satisfied,
- use wording like `Siap direview` if publish still requires source verification,
- public publish remains internal-admin reviewed and source-backed.

Preferred labels:

```text
Siap direview
Terdeteksi, perlu cek sumber
Tidak terbaca
Terdeteksi tapi komponen hidden
```

Avoid misleading copy that implies automatic publish.

## Acceptance Criteria

- Intake coverage uses DB active template when available.
- Intake coverage displays template name/key used by the selected desa.
- Per-section/component coverage matches `/internal-admin/village-data` template components.
- Fallback standard is clearly labeled if used.
- Hidden component data is shown as detected-but-hidden, not publishable.
- Copy does not imply auto-publish or source-less publishing.
- No hardcoded-only section grouping when DB template exists.

## Short Instruction For Asep

```text
Asep, update Intake Coverage Lens so it is truly template-aware. It must show the active template used by the selected desa and the component breakdown must come from resolvedTemplate.visibleComponents, not only hardcoded DETAIL_FIELD_STANDARDS. Keep DETAIL_FIELD_STANDARDS only as fallback. Match the component labels with /internal-admin/village-data, show DB/fallback source, visible/hidden component counts, and avoid wording like Aman dipublish if source governance still requires review.
```

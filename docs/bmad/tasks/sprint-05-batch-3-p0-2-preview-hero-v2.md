# Sprint 05 Batch 3 - P0-2 Preview Hero V2

## Status
READY FOR EXECUTION.

## Branch Rule

Create a new branch from `main`:

```text
p02-intake-preview-hero-coverage-v2
```

Do not commit directly to `main`.
Do not merge to `main`.
Do not commit final before owner reviews the visual result.

## Goal

Redesign the intake preview/result top area to match the owner's mockup direction:

```text
Decision hero + impact summary + visual coverage + clear CTA
```

Keep PantauDesa's current quiet luxury style.

## Scope

Only update the preview/result top area after pipeline success.

Do not:

- redesign the full page,
- redesign diff fully,
- redesign modal,
- redesign queue,
- change business logic,
- auto-publish,
- add new source of truth.

## Required Layout

### 1. Decision Hero

Show:

- small label: `Ringkasan keputusan`
- clear headline, for example:
  `Upload tidak menambah field baru, tapi memperbarui 7 field yang sudah ada.`
- file metadata strip:
  - file name
  - parser
  - file size
  - main fields read

### 2. Impact Summary

Desktop: two columns.
Mobile: stacked.

Left side: four impact rows:

- `Mengisi field kosong`
- `Akan berubah / bertambah`
- `Belum aman dipublish`
- `Temuan lain yang berguna`

Each row must have:

- icon
- short explanation
- clear value on the right

Important impact must be visually stronger than secondary info.

### 3. Coverage Visualization

Show a compact visual coverage summary, such as ring/donut/progress.

Must include:

- percentage coverage
- label `Tercakup`
- `X / Y field detail`
- short note explaining next step

Formula must be honest and documented in the report.

### 4. Secondary Status Cards

Show compact secondary cards:

- Mapping
- Validasi
- Review
- AI

These must not feel like debug panels.

### 5. Clear CTA

CTA must be visible and easy to find:

- secondary: `Kembali ke Input` or correct context label
- primary: `Lanjut ke Review`

Mobile CTA must be obvious and not cramped.

## Relationship With Coverage Detail Below

Hero = one-glance summary.

Coverage detail below = drilldown/detail.

Do not make both sections repeat the same summary.

## Style Direction

- quiet luxury
- clean
- calm
- premium but simple
- soft borders
- soft shadow
- clear hierarchy
- not plain debug card
- not overly colorful
- mobile friendly

## Report Update

Update:

```text
docs/bmad/reports/sprint-05-batch-3-versioning-intake-mapping-review-report.md
```

Add subsection:

```text
P0-2 Preview Hero V2
```

Include:

- files changed
- visual summary
- coverage formula
- before/after notes
- owner test checklist

## Output Before Final Commit

Before final commit, report back with:

1. branch name
2. files changed
3. desktop screenshot
4. mobile screenshot
5. coverage formula
6. short explanation why this is better

## Acceptance Criteria

- result top area feels like a decision hero
- user understands the impact in seconds
- coverage is visual and meaningful
- CTA is clear
- status cards are secondary
- no business logic regression

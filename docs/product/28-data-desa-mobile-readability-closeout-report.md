# Data Desa + Mobile Readability Closeout Report

Date: 2026-04-28
Status: DONE_PENDING_REVIEW
Executed-by: Rangga / implementation closeout support
Gate opened-by: Iwan

## Batch name

Data Desa + Mobile Readability Closeout

## Tracker IDs Addressed

- A11Y-06
- DATA-DESA-01
- DATA-DESA-02
- DATA-DESA-03
- DATA-DESA-04
- DATA-DESA-05
- DATA-DESA-06
- DATA-DESA-07
- TEST-03
- TEST-07

## Affected Pages / Routes

- `http://localhost:3000/desa`
- `http://localhost:3000/desa/4`

Primary affected area:

- Data Desa list/grid/cards/filter area
- Data Desa mobile readability
- Detail page mobile journey/readability evidence only

## Files / Components Changed

- `src/app/desa/page.tsx`
- `src/components/desa/DesaCard.tsx`
- `src/components/desa/SearchFilterBar.tsx`
- `src/components/desa/DesaTable.tsx`
- `docs/product/28-data-desa-mobile-readability-closeout-report.md`

No `/desa/[id]` source change was made in this batch. Detail page was reviewed as mobile journey/test evidence only.

## Commits in this closeout batch

- `ff93e7500e24124cc7414aa060936cba3be28fa8` — improve mobile filter readability
- `972563cc08d20ddd96f0b1d9015acf45b5e63e43` — improve card mobile readability
- `15bea37692a34bbfded4b20154623d9c62d7d0fe` — improve list page mobile controls
- `45a002d5cdaa6cf349fcfe741f827b39eb9c20f4` — improve table mobile accessibility

## What Changed Per Tracker ID

| Tracker ID | Status in this batch | Evidence |
|---|---|---|
| DATA-DESA-01 | Addressed / verified | Existing density work already simplified the card. This batch preserved the simplified structure and improved mobile text size/spacing so the card scans better on phone. |
| DATA-DESA-02 | Addressed / verified | Row 1 remains `nama desa + status badge` only. No new data point was added to the first row. |
| DATA-DESA-03 | Addressed / verified | Row 2 remains location as `kecamatan / kabupaten / provinsi`. Text is more readable on mobile with `text-sm` and relaxed line height. |
| DATA-DESA-04 | Addressed / verified | Row 3 remains one progress/serapan visual signal. Progress bar height is slightly easier to read on mobile, while `Data Demo` remains near the metric. |
| DATA-DESA-05 | Addressed / verified | Row 4 remains only two numbers: `Diterima` and `Dipakai`. Mobile values are slightly larger for readability. |
| DATA-DESA-06 | Addressed / verified | Population, category, per-capita, and extra metadata are still not shown in the list card first view. No metadata was reintroduced. |
| DATA-DESA-07 | Addressed / improved | Card remains a full clickable `Link` with accessible aria-label and visible focus ring. Touch/readability treatment was improved through larger mobile card spacing and text. |
| A11Y-06 | Addressed | Mobile/low-vision readability improved in search/filter controls, Data Desa cards, view toggle buttons, pagination, table horizontal behavior, and focus/tap targets. |
| TEST-03 | Added / confirmed | Mobile journey note added below: user can enter `/desa`, search/scan list, open detail, and understand next action. |
| TEST-07 | Added / confirmed | Long detail page mobile scroll note added below: user should stay oriented through identity/status, docs, budget context, guidance, and safe action. |

## Implementation Details

### `/desa` page

- Header stack improved on mobile so title/subtitle and view controls do not crowd each other.
- Grid/table toggle buttons now have minimum 44px tap targets and aria labels.
- Empty state copy was made easier to read on mobile with larger text and relaxed line height.
- Pagination now uses minimum 44px tap targets and wraps safely on small screens.

### `SearchFilterBar`

- Search input and province select now stack vertically on mobile.
- Input/select controls now have minimum 44px height.
- Clear-search button now has an accessible aria-label and safer tap target.
- Filter label is larger and occupies its own line on mobile for easier scanning.
- Reset filter button has clearer focus treatment and touch-friendly sizing.
- Result count text is larger/readable on mobile.

### `DesaCard`

- Existing four-row density hierarchy is preserved:
  1. name + status badge,
  2. location,
  3. progress/serapan visual,
  4. `Diterima` and `Dipakai` only.
- Mobile text size and value weight are improved.
- Progress bar is slightly taller on mobile.
- Card padding is increased on mobile while preserving compact desktop layout.
- No population/category/per-capita metadata was added back to the card.

### `DesaTable`

- Table now has a mobile-friendly minimum width so horizontal scroll is predictable rather than crushed.
- Sort header buttons have focus ring and safer click target.
- `Lihat Detail` link has focus ring and safer tap area.
- Table remains secondary to grid card scanning on mobile; no data semantics changed.

## What Reviewers Should Check

Open `http://localhost:3000/desa` on desktop and mobile:

1. Search/filter area is readable without pinch zoom.
2. Search and province controls stack naturally on mobile.
3. Filter chips are readable and tappable.
4. View toggle buttons are easy to tap.
5. Data Desa cards still follow the accepted hierarchy:
   - name + status,
   - location,
   - progress,
   - `Diterima` / `Dipakai`.
6. Cards are easier to scan than before and do not feel like dense spreadsheets.
7. Cards clearly feel clickable and have visible keyboard focus.
8. Population/category/per-capita/extra metadata do not appear in card first view.
9. Pagination is tappable and wraps safely on mobile.
10. Table view remains usable through horizontal scroll and does not crush text.

Open `http://localhost:3000/desa/4` on mobile:

1. User can return to list and stay oriented.
2. First view shows identity/status before heavy metrics.
3. CTA path remains understandable after opening a card:
   - `Lihat Dokumen`,
   - `Cara Membaca Data`,
   - later safe action/reporting context.
4. Long detail scroll remains understandable and does not require pinch zoom for primary information.

## QA Commands

Recommended commands for local executor/reviewer:

- `npx tsc --noEmit`
- `npm run test`
- `npx eslint src/app/desa/page.tsx src/components/desa/DesaCard.tsx src/components/desa/SearchFilterBar.tsx src/components/desa/DesaTable.tsx`

QA execution note:

- These commands were not executed from this review environment.
- Reviewer should run them locally before final Owner/Iwan acceptance.
- This report is source/diff-based and marks the batch as `DONE_PENDING_REVIEW`, not final `ACCEPTED`.

## Screenshots Or Notes

Source-based route notes:

- `/desa` remains the primary Data Desa list route.
- `/desa` still reads the `cari` query for prefilled search.
- `/desa/4` remains the detail route used for mobile journey validation.
- No live localhost screenshot was generated in this environment.

Mobile viewport notes to verify locally:

- Test around 360px width for small Android devices.
- Test around 390px width for common iPhone viewport.
- Test `/desa` grid view first, then table view.
- Test opening `/desa/4` from a card and scrolling through the long detail page.

## Known Risks

- Long province/kabupaten names may still wrap to two lines. This is acceptable as long as readable.
- Currency labels can still be visually dense for some villages, but only two numbers remain in card first view.
- Table view is still naturally denser than card view; mobile primary scan path should remain card/grid.
- Full repo lint may still fail due unrelated existing lint debt outside this gate.
- Local QA commands still need execution before final acceptance.

## Items Intentionally Left Untouched

- No homepage expansion.
- No Panduan/Bandingkan IA work.
- No major `/desa/[id]` redesign.
- No data semantics changes.
- No new status interpretation.
- No demo/imported data made official.

## Confirmation

- No seed/read path/schema/DB/API/Prisma/scraper changes.
- No new dependency.
- No active `Terverifikasi` state.
- No numeric APBDes extraction.
- No Risk Radar.
- No Score Orb.
- No advanced dataviz.
- No animation/micro-interactions added.

## Status

`DONE_PENDING_REVIEW`

Rangga should review this batch against the 10 tracker IDs and report verdict only after source diff + local/visual evidence is sufficient.

Potential verdicts:

- `ACCEPTED_FOR_OWNER_REVIEW`
- `REWORK`
- `BLOCKED`

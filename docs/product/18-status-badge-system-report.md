# Reusable Status Badge System Report

Date: 2026-04-28
Status: DONE_PENDING_REVIEW
Executed-by: Ujang

## Tracker IDs Addressed

- STATUS-01
- STATUS-02
- STATUS-04
- STATUS-05
- STATUS-06

Blocked / not activated:

- STATUS-03 remains BLOCKED
- STATUS-07 remains BLOCKED
- Active `Terverifikasi` state was not added

## Affected Pages / Routes

- http://localhost:3000/
- http://localhost:3000/desa/4

`http://localhost:3000/desa` was not touched in this gate.

## Files / Components Changed

- `src/components/ui/DataStatusBadge.tsx`
- `src/components/home/DataStatusCardsSection.tsx`
- `src/app/page.tsx`
- `src/app/desa/[id]/page.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `src/components/desa/SourceDocumentSnapshotSection.tsx`
- `docs/product/18-status-badge-system-report.md`

## What Changed

- Added reusable `DataStatusBadge` component with four supported status keys:
  - `demo` / Data Demo
  - `source-found` / Sumber Ditemukan
  - `needs-review` / Perlu Review
  - `verified` / Terverifikasi, shown only as disabled/future legend state
- Added required microcopy:
  - Data Demo: `Data ini masih demo, belum menjadi fakta resmi.`
  - Sumber Ditemukan: `Sumber publik ditemukan, belum berarti terverifikasi.`
  - Perlu Review: `Perlu dicek sebelum jadi rujukan.`
  - Terverifikasi: `Belum aktif sampai workflow verifikasi tersedia.`
- Replaced ad-hoc homepage Data Demo pill in the priority/ranking section.
- Rebuilt homepage status legend using the reusable badge component.
- Replaced detail page first-view and status note demo badges.
- Replaced budget/stat card demo labels with compact reusable badges.
- Replaced source/document snapshot status pills for source-found and needs-review states.

## What Reviewers Should Check

- Homepage priority area has a reusable Data Demo badge near the ranking context.
- Homepage status section shows the four statuses consistently, with Terverifikasi visibly disabled/future.
- Desa detail first view shows Data Demo and Sumber Ditemukan with consistent status styling.
- Budget cards still fit on mobile and show compact Data Demo badges near values.
- Source/document snapshot uses Sumber Ditemukan and Perlu Review badges without implying verification.
- No active green verified state appears in data-bearing UI.

## QA Commands Run

- `npx tsc --noEmit` - PASS
- `npm run test` - PASS after sandbox escalation for Vitest/esbuild spawn; 42/42 tests passed
- `npm run lint` - FAIL due existing unrelated lint errors outside this gate:
  - `src/app/desa-admin/dokumen/page.tsx`
  - `src/components/desa/SuaraWargaSection.tsx`
  - `src/components/ui/OtpInput.tsx`
  - `src/components/ui/PinInput.tsx`
  - `src/lib/use-countdown.ts`
- Targeted lint for changed files - PASS:
  - `src/components/ui/DataStatusBadge.tsx`
  - `src/app/page.tsx`
  - `src/app/desa/[id]/page.tsx`
  - `src/components/home/DataStatusCardsSection.tsx`
  - `src/components/desa/DesaDetailFirstView.tsx`
  - `src/components/desa/SourceDocumentSnapshotSection.tsx`

Route checks:

- `http://localhost:3000/` SSR contains Data Demo, Sumber Ditemukan, Perlu Review, and disabled/future Terverifikasi microcopy.
- `http://localhost:3000/desa/4` SSR contains Data Demo, Sumber Ditemukan, and Perlu Review.
- `http://localhost:3000/desa/4` SSR does not contain active `Data terverifikasi` copy.

## Known Risks

- Full-repo lint remains blocked by pre-existing lint errors outside this UI-only gate.
- This gate standardizes visible status badges in selected important locations only; it does not complete a sitewide inventory of every metric/chart/card.
- `Terverifikasi` is present only in the homepage educational legend as disabled/future. Owner/Rangga should confirm this is acceptable before any broader use.

## Confirmation

- No seed/read path/schema/DB/API/Prisma/scraper changes.
- No new dependency.
- No active `Terverifikasi` state.
- No numeric APBDes extraction.
- No Risk Radar.
- No Score Orb.
- No animation/visual delight work.
- No Data Desa card density work.
- Status remains DONE_PENDING_REVIEW until Rangga/Iwan/Owner review.

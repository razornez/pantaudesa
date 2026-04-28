# Status Badge Consistency Sweep Report

Date: 2026-04-28
Status: DONE_PENDING_REVIEW
Executed-by: Ujang

## Tracker IDs Addressed

- STATUS-01
- STATUS-02
- STATUS-04
- STATUS-05
- STATUS-06

Still blocked:

- STATUS-03
- STATUS-07

## Affected Pages / Routes

- http://localhost:3000/
- http://localhost:3000/desa/4

`http://localhost:3000/desa` was not touched.

## Files / Components Changed

- `src/components/home/DesaLeaderboard.tsx`
- `src/app/desa/[id]/page.tsx`
- `docs/product/21-status-badge-consistency-sweep-report.md`

Reviewed but not changed:

- `src/app/page.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `src/components/desa/SourceDocumentSnapshotSection.tsx`
- `src/components/home/DataStatusCardsSection.tsx`
- `src/components/ui/DataStatusBadge.tsx`

Note: `src/components/desa/Sour9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8.tsx` does not exist in this workspace. The matching component reviewed was `src/components/desa/SourceDocumentSnapshotSection.tsx`.

## Search Terms Used

- `Data demo`
- `Data Demo`
- `data demo`
- `Sumber ditemukan`
- `Sumber Ditemukan`
- `Perlu Review`
- `Perlu review`
- `DATA_DISCLAIMER.statusLabel`
- `rounded-full.*amber`
- `bg-amber-50.*text-amber`
- `text-amber-.*Data`
- `statusLabel`

## Hardcoded Markers Found

- `src/components/home/DesaLeaderboard.tsx`
  - `Urutan bantu baca data demo, bukan penilaian final`
  - `Indikator serapan rendah dalam data demo, perlu dicek bersama sumbernya.`
- `src/app/desa/[id]/page.tsx`
  - `(data demo)` inline label beside the source-fund heading.

## Replaced With DataStatusBadge

- Homepage leaderboard banner now shows `<DataStatusBadge status="demo" size="xs" />`.
- Homepage leaderboard `Perlu Ditinjau` panel now shows `<DataStatusBadge status="needs-review" />`.
- Desa detail source-fund heading now shows `<DataStatusBadge status="demo" size="xs" />`.

## Intentionally Left As Explanatory Copy

These were left because they are sentence-level guidance, metadata, or source copy, not standalone visual badges:

- Homepage explanatory sentence under priority section: `Urutan ini memakai data demo...`
- `CitizenJourneySection` and `PondasiTransparansiSection` body copy explaining status concepts.
- `DesaDetailFirstView` explanatory paragraph about demo data.
- `SourceDocumentSnapshotSection` internal status strings used to choose badge state.
- `copy.ts`, `expectations.ts`, and metadata strings containing demo wording.
- `SeharusnyaAdaSection` guidance copy around demo APBDes context.

## What Reviewers Should Check

- Homepage leaderboard no longer mixes plain `data demo` as a status marker in its banner.
- Homepage `Perlu Ditinjau` panel uses the reusable `Perlu Review` badge near the low-serapan context.
- Desa detail source-fund heading uses the reusable Data Demo badge near the fund numbers.
- Existing explanatory sentences still read naturally and are not over-badged.
- No active `Terverifikasi` state appears.

## QA Commands

- `npx tsc --noEmit` - PASS
- `npm run test` - PASS after sandbox escalation for Vitest/esbuild spawn; 42/42 tests passed
- Targeted lint - PASS:
  - `npx eslint src/components/home/DesaLeaderboard.tsx src/app/desa/[id]/page.tsx`
- `npm run lint` - FAIL due existing lint debt outside this sweep, not new issues:
  - `src/app/desa-admin/dokumen/page.tsx`
  - `src/components/desa/SuaraWargaSection.tsx`
  - `src/components/ui/OtpInput.tsx`
  - `src/components/ui/PinInput.tsx`
  - `src/lib/use-countdown.ts`

Route checks:

- `http://localhost:3000/` SSR contains Data Demo and Perlu Review badges.
- `http://localhost:3000/` SSR no longer contains `Urutan bantu baca data demo`.
- `http://localhost:3000/desa/4` SSR contains Data Demo near the detail route context.
- `http://localhost:3000/desa/4` SSR does not contain active `Data terverifikasi` copy.

## Known Risks

- The sweep is focused on homepage/detail status markers. It is not a full admin or auth UI cleanup.
- Full repo lint is still blocked by known unrelated lint debt.
- Metadata still contains `(data demo)`, which is intentionally not a visible badge marker.

## Confirmation

- No seed/read path/schema/DB/API/Prisma/scraper changes.
- No new dependency.
- No active `Terverifikasi` state.
- No numeric APBDes extraction.
- No Risk Radar.
- No Score Orb.
- No animation/micro-interactions.
- No Data Desa card density work.
- No CTA journey work.

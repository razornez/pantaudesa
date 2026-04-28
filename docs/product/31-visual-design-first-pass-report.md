# Visual Design First Pass Report

Date: 2026-04-28
Status: DONE_PENDING_REVIEW
Executed-by: Ujang
Requested-by: Iwan

## Scope

- First visual design pass for homepage and desa detail.
- Focused on higher-impact visual rhythm, stronger status language, data movement, and detail-page orientation.
- Kept data semantics and read paths unchanged.

## Affected Pages / Routes

- `http://localhost:3000/`
- `http://localhost:3000/desa/4`

## Files / Components Changed

- `src/app/desa/[id]/page.tsx`
- `src/app/globals.css`
- `src/components/home/AlertDiniSection.tsx`
- `src/components/home/StatsCards.tsx`
- `src/components/desa/SeharusnyaAdaSection.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `src/components/ui/AnimatedCounter.tsx`
- `src/components/ui/DataStatusBadge.tsx`
- `docs/product/31-visual-design-first-pass-report.md`

## What Changed

### Risk Radar

- Converted the early alert cards into a `Risk Radar` treatment.
- Added radar grid texture, pulse marker, stronger `Perlu Review` badge, and hover lift.
- Copy remains safe: `perlu dicek`, not violation/fraud language.

### Animated Data Feel

- Added reusable `AnimatedCounter`.
- Applied animated counters to homepage national stats and transparency score.
- Motion respects `prefers-reduced-motion`.

### Stronger Status Badge Language

- Enhanced `DataStatusBadge` with icon bubbles, subtle shadow, and hover lift.
- Existing statuses remain unchanged:
  - `Data Demo`
  - `Sumber Ditemukan`
  - `Perlu Review`
  - disabled/future `Terverifikasi`

### Detail Hero CTA Cleanup

- Removed the secondary `Cara Membaca Data` button from the detail hero.
- Kept `Lihat Dokumen` as the primary hero action.
- The explanatory status panel still remains in the first view for safe data reading context.

### Sticky Detail Summary Rollback

- Removed `DetailStickySummary` from `/desa/[id]` because it interfered with the detail reading experience.
- Deleted the component file instead of leaving unused UI code behind.

### Hak Wargamu Visual Lift

- Added compact visual counters to the Hak Warga hero.
- Made checklist items feel more tactile with card lift and check-pop animation.
- Kept safer copy such as `Ada dasar`, `Masuk rencana`, and `Bisa ditanya`.

## Intentionally Left For Later

- No full homepage redesign.
- No Score Orb.
- No advanced dataviz.
- No user-state achievement system such as `Warga Cermat`.
- No generated sparkle around document count.
- No issue-selection workflow for `Pertanyaan siap dibawa`.

## What Reviewers Should Check

- `/`: `Risk Radar` feels more clickable but still civic-safe.
- `/`: national stats animate without changing final values.
- `/desa/4`: hero should no longer show the `Cara Membaca Data` button.
- `/desa/4`: no sticky mini-summary should appear between `DetailSectionNav` and document/source sections.
- `/desa/4`: Hak Warga feels more prominent but does not overclaim.
- Status badges remain readable at `xs`, `sm`, and `md` sizes.
- Reduced-motion users are not forced through distracting animation.

## QA Commands

- `npx tsc --noEmit` - PASS
- `npx eslint src/app/page.tsx 'src/app/desa/[id]/page.tsx' src/components/desa/DesaDetailFirstView.tsx src/components/home/AlertDiniSection.tsx src/components/home/StatsCards.tsx src/components/desa/SeharusnyaAdaSection.tsx src/components/ui/DataStatusBadge.tsx src/components/ui/AnimatedCounter.tsx` - PASS
- `npm run test` - PASS after sandbox escalation for Vitest/esbuild spawn; 42/42 tests passed
- `npm run lint` - FAIL due existing unrelated lint debt outside this batch:
  - `src/app/desa-admin/dokumen/page.tsx`
  - `src/components/desa/SuaraWargaSection.tsx`
  - `src/components/ui/OtpInput.tsx`
  - `src/components/ui/PinInput.tsx`
  - `src/lib/use-countdown.ts`
  - plus existing unused-var warnings in admin/support components

## Route Checks

- `http://localhost:3000/` - 200; contains `Risk Radar`, `Perlu Review`, and `Sinyal awal untuk desa yang perlu dicek dulu`.
- `http://localhost:3000/desa/4` - 200; contains `Lihat Dokumen`, `Panduan Hak Warga`, and `Data Demo`.
- `http://localhost:3000/desa/4` - confirmed `Cara Membaca Data` button copy is no longer rendered.

## Known Risks

- Removing the sticky detail summary lowers persistent orientation support, but reduces visual interference on long detail pages.
- Animated counters are client-side visual enhancement only; final values are unchanged.
- Full repo lint still has old unrelated debt.

## Confirmation

- No seed/read path/schema/DB/API/Prisma/scraper changes.
- No new dependency.
- No active `Terverifikasi` state.
- No numeric APBDes extraction.
- No data semantics changes.
- No personal phone/contact exposure.

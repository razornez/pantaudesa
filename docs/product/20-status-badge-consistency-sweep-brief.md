# Status Badge Consistency Sweep Brief

Date: 2026-04-28
Status: ready-for-iwan-review
Prepared-by: ChatGPT Freelancer / Rangga

## Context

Owner approved the reusable status badge system first pass.

Reference:

- `docs/product/19-rangga-status-badge-system-review.md`
- commit `25b50a487bdc61f756301324a2651845bedf1f3e`

Owner note:

> Next task can continue, but sweep again and make sure all demo marks use the reusable demo badge. Do not leave mixed/hardcoded demo labels.

## Goal

Do a focused UI-only consistency sweep so visible demo/source/review markers use the reusable `DataStatusBadge` system where appropriate.

This is not a new feature gate. It is a cleanup/consistency gate after reusable status badge approval.

## Scope

Review UI code for ad-hoc/hardcoded status markers such as:

- `Data demo`
- `Data Demo`
- `data demo`
- `Sumber ditemukan`
- `Sumber Ditemukan`
- `Perlu Review`
- `Perlu review`
- old amber pill/status label patterns
- raw `DATA_DISCLAIMER.statusLabel` usage inside components

Replace visible UI status marks with:

- `<DataStatusBadge status="demo" />`
- `<DataStatusBadge status="source-found" />`
- `<DataStatusBadge status="needs-review" />`

Use `showMicrocopy` only where explanation is needed, not everywhere.

## Initial finding from Rangga quick sweep

Potential area to check first:

- `src/components/home/DesaLeaderboard.tsx`

Reason:

- It still contains plain copy such as `data demo` in visible UI text.
- If this is meant as a status indicator, it should use reusable `DataStatusBadge`.
- If it is explanatory sentence copy, keep the sentence but add/replace with badge where status meaning is important.

Also review:

- `src/app/page.tsx`
- `src/app/desa/[id]/page.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `src/components/desa/SourceDocumentSnapshotSection.tsx`
- `src/components/home/DataStatusCardsSection.tsx`
- any component rendering demo/status labels near important numbers.

## Acceptance criteria

- All visible demo/source/review status markers in affected pages use `DataStatusBadge` where they function as badges/labels.
- No mixed ad-hoc pill styles remain for demo/source/review markers in reviewed affected pages.
- Plain explanatory copy may remain if it is sentence context, but status badge should be nearby when it frames important numbers/data.
- `Terverifikasi` remains disabled/future only.
- `STATUS-03` and `STATUS-07` remain blocked.
- No seed/read path/schema/DB/API/Prisma/scraper changes.
- No numeric APBDes extraction.
- No new dependency.

## Affected routes to check

Minimum:

- `http://localhost:3000/`
- `http://localhost:3000/desa/4`

Optional if touched:

- `http://localhost:3000/desa`

## Suggested execution owner

This is small UI cleanup.

Recommended:

- Asep if the change is visual/UX polish.
- Ujang if Iwan wants a mechanical code sweep.

Avoid both working on the same files simultaneously.

## Suggested split to avoid conflict

Option A — one executor only:

- One person handles the sweep and report.

Option B — if both are involved:

- Asep reviews desired visual behavior first.
- Ujang applies mechanical replacements after Asep confirms.
- Do not let Asep and Ujang edit the same component in parallel.

## Required report format

Implementation report must include:

```text
Tracker IDs addressed:
Affected pages/routes:
Files/components changed:
Search terms used:
Hardcoded markers found:
What was replaced with DataStatusBadge:
What was intentionally left as explanatory copy:
What reviewers should check:
QA commands:
Known risks:
Confirmation:
- no seed/read path/schema/DB/API/Prisma/scraper changes
- no new dependency
- no active Terverifikasi state
```

## QA commands

Required:

- `npx tsc --noEmit`
- `npm run test`
- targeted lint for changed files

If full `npm run lint` still fails, report whether it is existing lint debt or introduced by this task.

## Review checklist for Rangga/Iwan/Owner

- [ ] Homepage uses consistent `DataStatusBadge` for demo/source/review labels.
- [ ] Detail page uses consistent `DataStatusBadge` for demo/source/review labels.
- [ ] Important numbers still have nearby status context.
- [ ] No active `Terverifikasi` appears.
- [ ] No old ad-hoc demo badge style remains in affected UI.
- [ ] Text still feels natural and not over-badged.

## Boundary

Do not open:

- seed execution,
- read path switch,
- schema/DB/API/Prisma,
- scraper/import,
- numeric APBDes extraction,
- active `Terverifikasi` state,
- Risk Radar,
- Score Orb,
- animation/micro-interactions.

## Final recommendation

Before moving to Data Desa card density or CTA journey, do this small sweep first.

Reason:

Reusable status badge was approved, so the UI should not keep mixed demo/status markers that confuse future review.

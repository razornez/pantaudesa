# Rangga Review — Navigation and Citizen Journey Cleanup

Date: 2026-04-28
Prepared-by: Rangga / PM-BA / Product-UX Review
Review type: Batch gate review
Status: ACCEPTED_FOR_OWNER_REVIEW

## Batch name

Navigation and Citizen Journey Cleanup

## Commits reviewed

- `0d104899284ae632f6d82023fa30fdc367cea1c2` — `feat(nav-journey): navigation and citizen journey cleanup batch`

## Report reviewed

- `docs/product/25-navigation-citizen-journey-batch-report.md`

## Affected routes reviewed

Based on commit diff and Ujang route notes:

- `http://localhost:3000/`
- `http://localhost:3000/desa`
- `http://localhost:3000/suara-warga`
- `http://localhost:3000/suara`
- `http://localhost:3000/desa/4`

Note: Rangga review used repository diff + report verification. Local visual browser pass should still be done by Owner/Iwan before final tracker acceptance.

## Scope and boundary check

This batch stayed within the approved UI-only navigation/citizen-journey scope.

No evidence of changes to:

- seed execution,
- read path switch,
- schema/DB/API/Prisma,
- scraper/import,
- numeric APBDes extraction,
- active `Terverifikasi`,
- Risk Radar,
- Score Orb,
- new animation/micro-interactions,
- advanced dataviz.

The files changed are limited to UI/page/copy/report surfaces:

- `src/components/home/HeroSection.tsx`
- `src/components/home/CitizenJourneySection.tsx`
- `src/components/layout/Navbar.tsx`
- `src/app/desa/page.tsx`
- `src/app/suara/page.tsx`
- `src/app/suara-warga/page.tsx`
- `src/app/desa/[id]/page.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `src/lib/copy.ts`
- `docs/product/25-navigation-citizen-journey-batch-report.md`

## Review answers

| Check | Result | Rangga note |
|---|---|---|
| 1. Is homepage first obvious action now “Cari Desa”? | PASS | Homepage hero now exposes a direct search input and submit CTA. Search is materially more prominent than before. |
| 2. Is CTA language consistent and not competing? | PASS_WITH_OWNER_VISUAL_CHECK | Core language is aligned around `Cari Desa`, `Lihat Dokumen`, `Cara Membaca Data`, and `Ceritakan Kondisi Desaku`. Homepage button still says `Cari Desamu Sekarang`, but intent is consistent and not a blocker. Owner can decide if it should be shortened to exact `Cari Desa`. |
| 3. Does homepage search route to `/desa?cari=...` and prefill Data Desa search? | PASS | `HeroSection` submits to `/desa?cari=${encodeURIComponent(query)}`. `src/app/desa/page.tsx` initializes search from `window.location.search.get("cari")`. |
| 4. Does `/suara-warga` work while `/suara` remains safe? | PASS | New `/suara-warga/page.tsx` re-exports the existing `/suara` page. Old `/suara` remains present. |
| 5. Does Suara Warga loading state feel intentional, not stuck? | PASS | Loading state now has title + explanatory microcopy instead of spinner-only impression. Existing spinner remains, no new interaction pattern added. |
| 6. Does Suara Warga empty state use the owner-approved copy and CTA? | PASS | Empty state uses `Belum ada suara warga yang bisa ditampilkan.` + `Jadilah warga pertama yang membagikan kondisi desamu.` and CTA `Ceritakan Kondisi Desaku`. |
| 7. Does citizen journey clearly explain the correct flow? | PASS | Flow is now explicit: `Cari Desa` → `Lihat status data` → `Baca sumber/dokumen` → `Tanya atau sampaikan suara warga`. |
| 8. Are TEST-01 and TEST-02 notes adequate? | PASS | Report includes first-click prompt, expected success behavior, data-status comprehension prompt, and expected interpretation. Adequate for next Owner/Iwan test round. |
| 9. Did Ujang avoid seed/read path/schema/DB/API/Prisma/scraper/numeric extraction? | PASS | Diff shows UI/copy/docs only. No data-layer gate opened. |
| 10. Is full lint failure old debt, not introduced by this batch? | PASS | Targeted lint for changed files passed. Full lint failure is reported against unrelated existing files outside this gate. |

## Tracker ID result table

| Tracker ID | Result | Evidence / review note |
|---|---|---|
| JOURNEY-01 | PASS | Homepage first action is now village search. |
| JOURNEY-02 | PASS_WITH_OWNER_VISUAL_CHECK | CTA set is consistent enough for review. Only minor wording variant: `Cari Desamu Sekarang` vs exact `Cari Desa`. |
| JOURNEY-03 | PASS | Search input is prominent in homepage hero. |
| JOURNEY-04 | PASS | Citizen journey section directly explains the intended cross-page flow. |
| VOICE-01 | PASS | Suara Warga copy frames content as stories/questions, not formal proof. |
| VOICE-02 | PASS | Loading state has intentional explanatory copy. |
| VOICE-03 | PASS | Empty state no longer looks broken and uses safe invitation copy. |
| VOICE-04 | PASS | Voice CTA uses `Ceritakan Kondisi Desaku`. |
| TEST-01 | PASS | First-click test note is present and usable. |
| TEST-02 | PASS | Data-status comprehension test note is present and usable. |

## What passed

- Homepage now makes searching for a village the clearest citizen entry point.
- Navbar changes `Data Desa` to `Cari Desa`, which better matches the intended first action.
- Homepage search routes into Data Desa with `cari` query and Data Desa reads that query for prefill/filtering.
- Secondary homepage CTA points to the journey explanation instead of competing with the search action.
- Detail page CTAs are clearer: `Lihat Dokumen` and `Cara Membaca Data`.
- Citizen journey section now tells the correct sequence in plain language.
- `/suara-warga` route alias was added while `/suara` remains available.
- Suara Warga hero, loading state, empty state, and CTA are safer and more intentional.
- Test notes are sufficient for a small Owner/Iwan validation round.
- Ujang stayed inside UI-only boundaries.
- Targeted lint passed for changed files; full lint failure is not attributable to this batch.

## What needs rework, if any

No blocking rework required before Owner/Iwan review.

Minor Owner visual decision only:

- Decide whether homepage primary submit copy should remain `Cari Desamu Sekarang` or be shortened to exact canonical `Cari Desa` for stricter CTA uniformity.

This is not enough to block the batch because the intent and flow are clear.

## Owner / Iwan visual checklist

Before final approval, Owner/Iwan should visually check:

1. Homepage: first instinct is to type/search desa, not click another dashboard element.
2. Homepage: `Cara Membaca Data` feels secondary and does not compete with search.
3. Data Desa: search text is prefilled after searching from homepage.
4. Navbar: `Cari Desa` reads naturally as the main citizen entry.
5. Detail page `/desa/4`: `Lihat Dokumen` and `Cara Membaca Data` feel like clear next steps.
6. `/suara-warga`: page loads and does not feel like a duplicate/broken route.
7. `/suara`: old route still works safely.
8. Suara Warga loading state: feels intentional, not stuck.
9. Suara Warga empty state: copy feels warm, safe, and non-formal-report.
10. Status/demo framing: no part of this batch makes demo data feel official/verified.

## Recommended tracker update if approved

Do not mark final `ACCEPTED` until Iwan/Owner approves.

If Owner/Iwan approves this batch, recommended tracker update:

| Tracker ID | Recommended status after approval |
|---|---|
| JOURNEY-01 | ACCEPTED |
| JOURNEY-02 | ACCEPTED |
| JOURNEY-03 | ACCEPTED |
| JOURNEY-04 | ACCEPTED |
| VOICE-01 | ACCEPTED |
| VOICE-02 | ACCEPTED |
| VOICE-03 | ACCEPTED |
| VOICE-04 | ACCEPTED |
| TEST-01 | ACCEPTED |
| TEST-02 | ACCEPTED |

Until then, treat these as `DONE_PENDING_REVIEW` / `ACCEPTED_FOR_OWNER_REVIEW`, not final accepted.

## Recommended next batch after this one

No new gate is opened by this review.

Recommended next batch only if Iwan asks:

**Data Desa + Mobile Readability Closeout**

Candidate tracker IDs:

- `A11Y-06`
- `DATA-DESA-01`
- `DATA-DESA-02`
- `DATA-DESA-03`
- `DATA-DESA-04`
- `DATA-DESA-05`
- `DATA-DESA-06`
- `DATA-DESA-07`
- `TEST-03`
- `TEST-07`

Why:

- Data Desa card density was already Owner-approved first pass, but tracker reconciliation still appears needed.
- `A11Y-06` remains in progress.
- This keeps the next step UI-only and within one affected area cluster.

Alternative after that: `Panduan and Bandingkan IA batch`, but only after Iwan explicitly opens it.

## Verdict

`ACCEPTED_FOR_OWNER_REVIEW`

Rangga recommendation: send to Owner/Iwan for visual approval. Do not instruct Ujang directly, do not update tracker to final `ACCEPTED` yet, and do not open a new gate unless Iwan asks.

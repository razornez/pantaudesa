# Next Batch UI/UX Work Plan

Date: 2026-04-28
Status: ready-for-iwan-review
Prepared-by: ChatGPT Freelancer / Rangga

## Context

Owner approved Data Desa Card Density first pass, but noted that progress is becoming too small and token-heavy.

Owner direction:

> Jangan terlalu dikit-dikit. Sekali instruksi ke Ujang boleh berisi beberapa item supaya tidak boros token dan tidak terlalu lama di review loop.

## Problem

Current workflow is too granular:

1. one small UI change,
2. one implementation report,
3. one Rangga review,
4. one Owner/Iwan approval,
5. tracker update,
6. repeat.

This is safe, but too slow and token-heavy.

## Proposed improvement

Use **batch gates**.

A batch gate should include several related UI/UX tracker items that:

- affect nearby pages/components,
- have the same risk level,
- are UI-only,
- do not touch seed/read path/schema/DB/API/Prisma/scraper,
- can be reviewed together in one report.

## Rule of thumb

One Ujang instruction should include:

- minimum 3 tracker IDs,
- maximum around 10–12 tracker IDs,
- only one theme at a time,
- one affected area cluster,
- one implementation report.

Do not mix unrelated themes such as:

- visual delight + read path,
- Data Desa card + scraper,
- CTA journey + database,
- APBDes numeric extraction + UI polish.

## Recommended next batch

Recommended next batch:

**Navigation and citizen journey cleanup**

Tracker IDs:

- `JOURNEY-01`
- `JOURNEY-02`
- `JOURNEY-03`
- `JOURNEY-04`
- `VOICE-01`
- `VOICE-02`
- `VOICE-03`
- `VOICE-04`
- `TEST-01`
- `TEST-02`

Why this batch:

- It improves the main user flow after Data Desa cards are easier to scan.
- It can include CTA consistency, empty states, and journey clarity.
- It is still UI-only.
- It does not require seed/read path/schema/DB/API changes.
- It gives Owner more visible improvement than one tiny badge task.

## Alternative batch if Owner wants page-level cleanup first

**Data Desa + mobile readability batch**

Tracker IDs:

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

Note:

Most Data Desa card density items are already Owner-approved first pass, so this should only be chosen if Owner wants mobile/readability polish before moving on.

## Alternative batch if Owner wants support pages

**Panduan and Bandingkan IA batch**

Tracker IDs:

- `GUIDE-01`
- `GUIDE-02`
- `GUIDE-03`
- `GUIDE-04`
- `GUIDE-05`
- `GUIDE-06`
- `GUIDE-07`
- `GUIDE-08`
- `COMPARE-01`
- `COMPARE-02`
- `COMPARE-03`
- `COMPARE-04`
- `COMPARE-05`

Why:

- This is larger but still UI/IA-only.
- Useful if Owner wants more complete user guidance.

Risk:

- Bigger than journey cleanup and may touch multiple routes.

## Recommended executor model

Use one executor per batch to avoid conflict.

Recommended:

- Ujang executes the batch if it is mostly mechanical UI/code.
- Asep reviews or gives visual/UX direction before/after, not editing same files in parallel.
- Rangga reviews batch result against tracker IDs.
- Owner approves only sensitive/visual final feel.

## Required batch report format

Every batch implementation report must include:

```text
Batch name:
Tracker IDs addressed:
Affected pages/routes:
Files/components changed:
What changed per tracker ID:
What reviewers should check:
QA commands:
Screenshots or notes:
Known risks:
Items intentionally left untouched:
Confirmation:
- no seed/read path/schema/DB/API/Prisma/scraper changes
- no new dependency unless approved
- no active Terverifikasi state
```

## Review rule

Rangga review should be one report per batch, not one report per small item.

Possible verdicts:

- `ACCEPTED_FOR_OWNER_REVIEW`
- `PARTIAL_ACCEPTED_WITH_REWORK`
- `REWORK_REQUIRED`
- `BLOCKED`

## Boundaries remain unchanged

Do not open:

- seed execution,
- read path switch,
- schema/DB/API/Prisma,
- scraper/import,
- numeric APBDes extraction,
- active `Terverifikasi` state,
- Risk Radar,
- Score Orb,
- animation/micro-interactions,
- advanced dataviz.

## Recommendation

Move from micro-gates to batch gates.

Recommended next instruction to Iwan:

- Ask Ujang to handle `Navigation and citizen journey cleanup` batch.
- Keep Asep as reviewer/visual direction support.
- Do not split this into separate tiny tasks unless something fails.

Initiated-by: Owner feedback
Prepared-by: ChatGPT Freelancer / Rangga
Status: ready-for-iwan-review

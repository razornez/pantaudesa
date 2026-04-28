# Owner Feedback UI/UX Visual To-Do Tracker

Date: 2026-04-28
Status: canonical-status-tracker
Prepared-by: ChatGPT Freelancer / Rangga
Purpose: One source of truth for Owner UI/UX/visual feedback progress and gate status.

## Canonical detail files

Detailed acceptance criteria are split for readability and testing:

- `docs/product/owner-feedback/00-index-and-test-map.md`
- `docs/product/owner-feedback/01-accessibility-and-primary-journey.md`
- `docs/product/owner-feedback/02-homepage-data-desa-and-status.md`
- `docs/product/owner-feedback/03-detail-safety-reporting-and-metrics.md`
- `docs/product/owner-feedback/04-rights-contact-documents-and-score.md`
- `docs/product/owner-feedback/05-visual-dataviz-and-tests.md`
- `docs/product/owner-feedback/06-review-protocol-and-next-gate.md`

This tracker is the status index. The split files preserve detailed Owner feedback and testing guidance.

## Operating rules

- Pushed code is **DONE_PENDING_REVIEW**, not `ACCEPTED`.
- `ACCEPTED` requires Iwan/Rangga/Owner review against tracker IDs.
- Owner-sensitive items require Owner approval.
- Mismatch against acceptance criteria becomes `REWORK`.
- Rangga does not command Asep or Ujang directly.
- Iwan remains command owner.

## Review protocol

Every implementation report must include:

```text
Tracker IDs addressed:
Affected pages/routes:
Files/components changed:
What changed:
What reviewers should check:
QA commands:
Screenshots or notes:
Known risks:
Confirmation:
- no seed/read path/schema/DB/API/Prisma/scraper changes unless approved
- no new dependency unless approved
```

## Progress summary

Total Owner Feedback Items: **66**

| Status | Count |
|---|---:|
| ACCEPTED | 24 / 66 |
| DONE_PENDING_REVIEW | 0 / 66 |
| IN_PROGRESS | 1 / 66 |
| REWORK | 0 / 66 |
| BLOCKED | 9 / 66 |
| DEFERRED | 6 / 66 |
| TODO | 26 / 66 |

## Latest accepted gate

Gate accepted as **first-pass / owner-approved for now** after:

- Asep implementation,
- Ujang verification/rework,
- Rangga review,
- Owner visual approval,
- Iwan confirmation.

Reference:

- `docs/product/17-rangga-detail-safety-hierarchy-review.md`
- commit `9af6c79803e6da547b74df2e55cb9754c2c5a34b`

## Accepted items

### Accessibility accepted

| ID | Status | Note |
|---|---|---|
| A11Y-01 | ACCEPTED | WCAG AA color contrast accepted. |
| A11Y-02 | ACCEPTED | Visible keyboard focus accepted. |
| A11Y-03 | ACCEPTED | Heading structure accepted. |
| A11Y-04 | ACCEPTED | Touch target baseline accepted. |
| A11Y-05 | ACCEPTED | Aria-label baseline accepted. |

### Homepage accepted

| ID | Status | Note |
|---|---|---|
| HOME-01 | ACCEPTED | Homepage first pass accepted; do not expand endlessly. |
| HOME-08 | ACCEPTED | Future homepage work should be polish/reduction unless Owner requests otherwise. |

### Detail safety/hierarchy accepted first pass

| ID | Status | Note |
|---|---|---|
| DETAIL-HIER-01 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| DETAIL-HIER-06 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| DETAIL-RISK-01 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| DETAIL-RISK-02 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| REPORT-01 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| REPORT-02 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| REPORT-03 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| REPORT-04 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| REPORT-05 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| REPORT-06 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| REPORT-07 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| SCORE-01 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| METRIC-06 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| RIGHTS-01 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| RIGHTS-06 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| CONTACT-01 | ACCEPTED | Accepted as first-pass / owner-approved for now. |
| CONTACT-02 | ACCEPTED | Accepted as first-pass / owner-approved for now. |

## In progress

| ID | Status | Note |
|---|---|---|
| A11Y-06 | IN_PROGRESS | Mobile/low-vision readability still needs follow-up review. |

## Gates that remain blocked

These remain blocked even after detail safety/hierarchy first-pass approval:

| Gate | Status | Reason |
|---|---|---|
| Seed execution | BLOCKED | Data status UX/readiness still needs more gates. |
| Read path switch | BLOCKED | Avoid making demo/imported data look official. |
| Schema/DB/API/Prisma | BLOCKED | No technical data-layer gate opened. |
| Scraper/import | BLOCKED | Source governance/import UX not ready. |
| Numeric APBDes extraction | BLOCKED | Document-first approach remains required. |
| Active `Terverifikasi` state | BLOCKED | Verification workflow does not exist yet. |

## Visual delight remains deferred

These are intentionally deferred and should not be opened before core trust/journey/status work:

| Item | Status | Reason |
|---|---|---|
| Risk Radar | DEFERRED / BLOCKED until methodology | Needs non-accusatory framing and method. |
| Score Orb | DEFERRED / BLOCKED until methodology | Score must not look official. |
| Animation / micro-interactions | DEFERRED | Wait until P0/P1 UX is stable. |
| Advanced dataviz | DEFERRED | Must avoid false authority and verified-data implication. |

## Remaining recommended next gate options

Iwan/Owner can choose one of these next:

### Option 1 — Data Desa card density

Focus tracker IDs:

- `DATA-DESA-01`
- `DATA-DESA-02`
- `DATA-DESA-03`
- `DATA-DESA-04`
- `DATA-DESA-05`
- `DATA-DESA-06`
- `DATA-DESA-07`

Why:

Listing cards are still a major scanning point. Reducing density helps ordinary citizens find a desa faster.

### Option 2 — CTA journey / Cari Desa primary funnel

Focus tracker IDs:

- `JOURNEY-01`
- `JOURNEY-02`
- `JOURNEY-03`
- `JOURNEY-04`

Why:

This strengthens the core path: Cari Desa → status → source/document → safe action.

### Option 3 — Reusable status badge system

Focus tracker IDs:

- `STATUS-01`
- `STATUS-02`
- `STATUS-04`
- `STATUS-05`
- `STATUS-06`

Still blocked:

- `STATUS-03`
- `STATUS-07` active verified state.

Why:

Status clarity is required before any future seed/read path work.

### Option 4 — A11Y-06 mobile readability

Focus tracker ID:

- `A11Y-06`

Why:

Mobile readability is still in progress and likely important for ordinary citizens.

## Recommended next choice

Recommended next gate:

> Option 3 — reusable status badge system.

Reason:

It strengthens trust and data interpretation across homepage, listing, and detail pages before any seed/read path discussion.

Alternative if Owner wants visible UX improvement faster:

> Option 1 — Data Desa card density.

## Status values

- `TODO`
- `IN_PROGRESS`
- `DONE_PENDING_REVIEW`
- `ACCEPTED`
- `REWORK`
- `BLOCKED`
- `DEFERRED`

## Final note

This tracker update does not authorize seed, read path, schema/DB/API/Prisma, scraper/import, numeric APBDes extraction, or active `Terverifikasi` state.

Initiated-by: Iwan confirmation of Owner first-pass approval
Reviewed-by: Pending Iwan/Owner after this tracker update
Executed-by: ChatGPT Freelancer / Rangga
Status: canonical-status-tracker

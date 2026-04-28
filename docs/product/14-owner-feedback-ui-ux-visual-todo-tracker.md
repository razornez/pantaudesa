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
| ACCEPTED | 39 / 66 |
| DONE_PENDING_REVIEW | 0 / 66 |
| IN_PROGRESS | 1 / 66 |
| REWORK | 0 / 66 |
| BLOCKED | 9 / 66 |
| DEFERRED | 6 / 66 |
| TODO | 11 / 66 |

## Latest accepted gate

Gate accepted: **Navigation and Citizen Journey Cleanup**.

Accepted after:

- Ujang implementation batch,
- Rangga batch review,
- Rangga owner visual pass checklist,
- Iwan final approval for tracker update.

References:

- `docs/product/25-navigation-citizen-journey-batch-report.md`
- `docs/product/26-rangga-navigation-citizen-journey-batch-review.md`
- `docs/product/27-rangga-navigation-citizen-journey-owner-visual-pass.md`
- commit `0d104899284ae632f6d82023fa30fdc367cea1c2`
- commit `1cee0c156b15aa86fb2bc27eed672250e3f07fbb`

Previous accepted gate: **Reusable Status Badge System + Consistency Sweep**.

Previous references:

- `docs/product/18-status-badge-system-report.md`
- `docs/product/19-rangga-status-badge-system-review.md`
- `docs/product/21-status-badge-consistency-sweep-report.md`
- commit `79f342c09e95994860fc2087268e13d05f15c337`
- commit `25b50a487bdc61f756301324a2651845bedf1f3e`
- commit `5f3fd6c83c50a7891626fa97c271b3f21333c5a0`

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

### Status badge system accepted

| ID | Status | Note |
|---|---|---|
| STATUS-01 | ACCEPTED | Accepted after reusable badge implementation, Rangga review, Owner first-pass approval, and Ujang consistency sweep. Scope: selected important locations, not admin/auth-wide audit. |
| STATUS-02 | ACCEPTED | Reusable status badge system supports `Data Demo`, `Sumber Ditemukan`, `Perlu Review`, and disabled/future `Terverifikasi`. |
| STATUS-04 | ACCEPTED | `Data Demo` visual/microcopy accepted. |
| STATUS-05 | ACCEPTED | `Sumber Ditemukan` visual/microcopy accepted. |
| STATUS-06 | ACCEPTED | `Perlu Review` visual/microcopy accepted. |

### Navigation and citizen journey accepted

| ID | Status | Note |
|---|---|---|
| JOURNEY-01 | ACCEPTED | Homepage first action now clearly pushes citizens to search/find desa first. |
| JOURNEY-02 | ACCEPTED | Primary CTA language accepted around `Cari Desa`, `Lihat Dokumen`, `Cara Membaca Data`, and `Ceritakan Kondisi Desaku`. `Cari Desamu Sekarang` is accepted as non-blocking campaign/action copy for this batch. |
| JOURNEY-03 | ACCEPTED | Homepage search/find desa is visually prominent and easy to use. |
| JOURNEY-04 | ACCEPTED | User journey accepted: Cari desa → lihat status data → baca sumber/dokumen → tanya/sampaikan suara warga. |

### Suara Warga accepted

| ID | Status | Note |
|---|---|---|
| VOICE-01 | ACCEPTED | Suara Warga copy frames posts as citizen stories/questions, not formal proof. |
| VOICE-02 | ACCEPTED | Loading state feels intentional and avoids looking stuck. |
| VOICE-03 | ACCEPTED | Empty state uses warm safe copy: `Belum ada suara warga yang bisa ditampilkan` and invites first citizen story. |
| VOICE-04 | ACCEPTED | Voice CTA uses `Ceritakan Kondisi Desaku`. |

### Test notes accepted

| ID | Status | Note |
|---|---|---|
| TEST-01 | ACCEPTED | First-click validation note accepted: users should choose homepage search / `Cari Desa` as first action. |
| TEST-02 | ACCEPTED | Data-status comprehension note accepted: users should understand demo/review/source/verified framing and not treat demo data as official. |

## In progress

| ID | Status | Note |
|---|---|---|
| A11Y-06 | IN_PROGRESS | Mobile/low-vision readability still needs follow-up review. |

## Gates that remain blocked

These remain blocked even after Navigation and Citizen Journey Cleanup acceptance:

| Gate | Status | Reason |
|---|---|---|
| STATUS-03 | BLOCKED | Active `Terverifikasi` cannot appear until verification workflow exists. |
| STATUS-07 | BLOCKED | Verified visual can remain disabled/future only; no active data-bearing verified state. |
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

## Recommended next gate

No new gate opened by this tracker update.

Potential next batch remains pending Iwan direction.

If Iwan asks for the next UI-only batch, the safest candidate is **Data Desa + Mobile Readability Closeout**.

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

Why this remains a candidate:

- Data Desa card density was owner-approved first pass but still needs tracker reconciliation if Iwan confirms.
- A11Y-06 remains in progress.
- This keeps the next step UI-only and within one affected area cluster.

## Alternative future gate options

### Panduan and Bandingkan IA batch

Potential focus tracker IDs:

- `GUIDE-01` to `GUIDE-08`
- `COMPARE-01` to `COMPARE-05`

Only open if Iwan explicitly asks.

## Status values

- `TODO`
- `IN_PROGRESS`
- `DONE_PENDING_REVIEW`
- `ACCEPTED`
- `REWORK`
- `BLOCKED`
- `DEFERRED`

## Final note

This tracker update does not authorize seed, read path, schema/DB/API/Prisma, scraper/import, numeric APBDes extraction, active `Terverifikasi` state, Risk Radar, Score Orb, animation/micro-interactions, advanced dataviz, or new dependency work.

Initiated-by: Iwan final approval for Navigation and Citizen Journey Cleanup tracker update
Reviewed-by: Rangga visual pass + Iwan final approval
Executed-by: ChatGPT Freelancer / Rangga
Status: canonical-status-tracker

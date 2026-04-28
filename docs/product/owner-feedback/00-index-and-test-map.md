# Owner Feedback Modular Index and Test Map

Date: 2026-04-28
Status: canonical-split-index
Prepared-by: ChatGPT Freelancer / Rangga

## Purpose

This folder splits the long Owner Feedback UI/UX tracker into smaller files so Owner, Iwan, Asep, and Ujang can read, execute, and test feedback more easily.

The original canonical tracker remains:

- `docs/product/14-owner-feedback-ui-ux-visual-todo-tracker.md`

This split does **not** remove or reduce owner feedback. It reorganizes the same feedback into readable execution/review groups.

## How to read this folder

| File | Focus | Best reader |
|---|---|---|
| `00-index-and-test-map.md` | Overview, counts, test map, review flow | Owner / Iwan / Rangga |
| `01-accessibility-and-primary-journey.md` | A11Y and main Cari Desa journey | Asep / Ujang / Rangga |
| `02-homepage-data-desa-and-status.md` | Homepage, Data Desa cards, data status badges | Asep / Ujang / Rangga |
| `03-detail-safety-reporting-and-metrics.md` | Desa Detail safety, report CTA, metric hierarchy | Asep / Ujang / Rangga / Owner |
| `04-rights-contact-documents-and-score.md` | Hak Wargamu, contact risk, documents, score methodology | Asep / Rangga / Owner |
| `05-visual-dataviz-and-tests.md` | Visual direction, data visualization ideas, tests | Owner / Asep / Rangga |
| `06-review-protocol-and-next-gate.md` | How implementation reports must be written and reviewed | Iwan / Rangga / Asep / Ujang |

## Current progress counts

Total Owner Feedback Items: **66**

| Status | Count |
|---|---:|
| ACCEPTED | 7 / 66 |
| DONE_PENDING_REVIEW | 0 / 66 |
| IN_PROGRESS | 1 / 66 |
| REWORK | 0 / 66 |
| BLOCKED | 9 / 66 |
| DEFERRED | 6 / 66 |
| TODO | 43 / 66 |

## Current accepted items

- `A11Y-01`
- `A11Y-02`
- `A11Y-03`
- `A11Y-04`
- `A11Y-05`
- `HOME-01`
- `HOME-08`

## Current in-progress item

- `A11Y-06`

## Current next gate

Next gate: **Detail safety/hierarchy**

Tracker IDs:

- `DETAIL-HIER-01`
- `DETAIL-HIER-06`
- `DETAIL-RISK-01`
- `DETAIL-RISK-02`
- `REPORT-01` to `REPORT-07`
- `SCORE-01`
- `METRIC-06`
- `RIGHTS-01`
- `RIGHTS-06`

## Owner testing map

Use this when Owner wants to personally test the UI.

### 1. First impression test

Ask:

- Do I understand what this page is about in 5 seconds?
- Do I know what to click next?
- Does it feel helpful, not accusatory?

Relevant IDs:

- `JOURNEY-01`
- `JOURNEY-03`
- `DETAIL-HIER-06`
- `VISUAL-01`
- `VISUAL-03`

### 2. Data trust test

Ask:

- Can I clearly see whether this is demo/imported/needs_review/verified?
- Are big numbers clearly labeled?
- Does any score or percentage feel too final?

Relevant IDs:

- `STATUS-01`
- `STATUS-02`
- `DETAIL-RISK-01`
- `DETAIL-RISK-02`
- `SCORE-01`
- `SCORE-06`
- `METRIC-06`

### 3. Detail page overload test

Ask:

- Is the first view too crowded?
- Are raw/technical details hidden?
- Do I see documents/source context before budget conclusions?

Relevant IDs:

- `DETAIL-HIER-01`
- `DETAIL-HIER-06`
- `DOC-01`
- `DOC-08`

### 4. Civic safety test

Ask:

- Does the UI avoid accusing desa?
- Does the report CTA ask me to check first?
- Does Hak Wargamu avoid claiming violation too early?

Relevant IDs:

- `REPORT-01` to `REPORT-07`
- `RIGHTS-01`
- `RIGHTS-06`
- `TRUST-06`

### 5. Mobile test

Ask:

- Is text readable?
- Are buttons easy to tap?
- Do I stay oriented on long detail pages?

Relevant IDs:

- `A11Y-06`
- `DETAIL-HIER-03`
- `TEST-03`
- `TEST-07`

## Rule for execution reports

Every implementation report must include:

```text
Tracker IDs addressed:
Affected pages/routes:
What changed:
What reviewers should check:
QA commands:
Screenshots or notes:
Known risks:
```

## Final note

This folder is for readability and testing. It does not authorize implementation by itself.

Iwan still decides the gate. Rangga reviews. Owner approves sensitive items.

# Owner Feedback Split 06 — Review Protocol and Next Gate

Date: 2026-04-28
Status: split-from-canonical-tracker
Source: `docs/product/14-owner-feedback-ui-ux-visual-todo-tracker.md`

## Purpose

This file defines how Asep/Ujang implementation reports should be written and how Iwan/Rangga/Owner should review them.

It also defines the current next gate.

## Review protocol

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

## Status rule

- Pushed code = `DONE_PENDING_REVIEW`.
- Pushed code is **not** automatically `ACCEPTED`.
- Iwan/Rangga review against tracker IDs.
- Owner-sensitive items need Owner approval.
- If implementation does not match acceptance criteria, mark `REWORK`.
- If work touches seed/read path/schema/DB/API/scraper/numeric extraction without explicit gate approval, mark `BLOCKED`.

## What every implementation report must list

1. Tracker IDs addressed.
2. Affected pages/routes.
3. Files/components changed.
4. What reviewers should check visually.
5. What reviewers should check in copy/tone.
6. QA commands run.
7. Whether any new dependency was added.
8. Confirmation of no schema/DB/API/seed/read path/scraper changes unless explicitly approved.

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

## Why this gate comes first

This gate prevents PantauDesa from looking:

- accusatory,
- overconfident,
- unsafe for civic escalation,
- too authority-biased around big numbers or scores,
- too complex for ordinary citizens.

## Gate acceptance checklist

Before accepting this gate, reviewers should confirm:

- [ ] Detail first view is not a data dump.
- [ ] Data Demo/status appears near first view and important numbers.
- [ ] Big Rupiah/percentage/score values have context.
- [ ] Direct LAPOR CTA is replaced or gated.
- [ ] Report checklist exists before external reporting.
- [ ] Score has methodology/demo disclosure.
- [ ] Hak Wargamu has caution copy.
- [ ] Copy avoids `bermasalah`, `mencurigakan`, `buruk`, or proof-of-violation tone.
- [ ] No seed/read path/schema/DB/API/scraper changes.

## Recommended message pattern from Iwan to executor

This is a pattern only, not a direct command from Rangga:

```text
Read:
- docs/product/owner-feedback/03-detail-safety-reporting-and-metrics.md
- docs/product/owner-feedback/04-rights-contact-documents-and-score.md
- docs/product/owner-feedback/06-review-protocol-and-next-gate.md

Scope:
Address tracker IDs: [list IDs].

Rules:
- UI-only.
- No seed/read path/schema/DB/API/scraper.
- Report must list tracker IDs, affected routes, what changed, what to review, QA commands, and risks.
```

## Owner testing checklist after implementation

Owner can test quickly:

1. Open detail page.
2. Ask: “Do I understand this desa in 5 seconds?”
3. Ask: “Does this page accuse the desa?”
4. Ask: “Do big numbers look official or clearly demo/status-labeled?”
5. Click reporting CTA and confirm checklist appears first.
6. Check Hak Wargamu and confirm it says estimate is not proof of violation.
7. Check mobile view and confirm first view is not overwhelming.

## Final note

This file does not authorize implementation.

Iwan decides when to open the next gate. Rangga reviews. Owner approves sensitive items.

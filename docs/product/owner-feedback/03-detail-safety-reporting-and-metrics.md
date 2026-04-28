# Owner Feedback Split 03 — Detail Safety, Reporting, and Metrics

Date: 2026-04-28
Status: split-from-canonical-tracker
Source: `docs/product/14-owner-feedback-ui-ux-visual-todo-tracker.md`

## Purpose

This file groups the most important next-gate items for Desa Detail safety/hierarchy.

Owner test focus:

- Does the detail page guide, not overwhelm?
- Are big numbers/statuses safe?
- Is the reporting CTA gated responsibly?
- Is metric hierarchy not overconfident?

## Detail hierarchy items

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| DETAIL-HIER-01 | TODO | P1 | First view is not data dump; advanced data collapsed. | Does first view feel simple? |
| DETAIL-HIER-02 | TODO | P1 | Detail page visibly groups: Ringkasan, Anggaran, Dokumen & Transparansi, Panduan Warga. | Do I understand page sections? |
| DETAIL-HIER-03 | TODO | P2 | Mobile sticky summary shows desa + data status + safe quick actions. | On mobile, do I stay oriented? |
| DETAIL-HIER-04 | TODO | P2 | Sections have type labels or visual rhythm indicating insight/education/action. | Does it avoid monotony? |
| DETAIL-HIER-05 | TODO | P2 | Long copy becomes bullets, cards, or expandable text. | Is copy easy to scan? |
| DETAIL-HIER-06 | TODO | P1 | Above fold shows identity, status, quick summary, source/doc snapshot, not all metrics. | Does first view guide me? |

## Detail data risk items

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| DETAIL-RISK-01 | TODO | P0 | Data Demo badge and microcopy appear near first view and key values. | Can I tell this is demo? |
| DETAIL-RISK-02 | TODO | P0 | Large Rupiah, percentages, scores, and charts show status badge or nearby disclaimer. | Do big numbers feel clearly labeled? |
| DETAIL-RISK-03 | TODO | P0 | Big values and names cannot appear without context/methodology/status. | Could a screenshot mislead people? |
| DETAIL-RISK-04 | TODO | P1 | First-screen and score/metrics areas include enough context that screenshots do not mislead. | Is screenshot safe? |

## Reporting safety items

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| REPORT-01 | TODO | P0 | Direct LAPOR CTA replaced with pre-report safety gate. | Does reporting require checking first? |
| REPORT-02 | TODO | P0 | CTA label changes to `Cek Langkah Sebelum Melapor`. | Is the CTA safe? |
| REPORT-03 | TODO | P0 | Checklist includes: `Pastikan data berasal dari dokumen resmi.` | Is evidence-first clear? |
| REPORT-04 | TODO | P0 | Checklist includes: `Cek apakah masalah termasuk kewenangan desa.` | Is authority scope clear? |
| REPORT-05 | TODO | P0 | Checklist includes: `Dokumentasikan bukti lapangan.` | Does it encourage responsible action? |
| REPORT-06 | TODO | P0 | Checklist includes: `Gunakan jalur tanya dulu sebelum eskalasi.` | Does it preserve memantau bukan menuduh? |
| REPORT-07 | TODO | P0 | External reporting option appears only after checklist/context interaction. | Is external report not too easy/impulsive? |

## Metric hierarchy items

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| METRIC-01 | TODO | P0 | Status data is primary and near top. | Is status the first lens? |
| METRIC-02 | TODO | P1 | Total anggaran appears only with status and context. | Does Rupiah number avoid false authority? |
| METRIC-03 | TODO | P1 | Serapan appears with status and explanation; not final if demo. | Does percentage feel contextual? |
| METRIC-04 | TODO | P1 | Document availability appears as primary because document-first. | Do documents appear before conclusions? |
| METRIC-05 | TODO | P2 | Aset desa not first-fold dominant; shown after core context or collapsed. | Are assets not cluttering first view? |
| METRIC-06 | TODO | P0 | Score shown only after methodology/status context. | Is score methodology visible first? |
| METRIC-07 | TODO | P2 | Source fund details are not primary first-fold content. | Are fund details not overwhelming? |
| METRIC-08 | TODO | P2 | Detailed asset list is lower/collapsed. | Is tertiary info collapsed? |
| METRIC-09 | TODO | P1 | Escalation guide appears after context/checklist, not as first action. | Is escalation not too early? |

## Next-gate IDs in this file

- `DETAIL-HIER-01`
- `DETAIL-HIER-06`
- `DETAIL-RISK-01`
- `DETAIL-RISK-02`
- `REPORT-01` to `REPORT-07`
- `METRIC-06`

## What reviewers should check

- First view is not a data dump.
- Big numbers have status/context.
- Report CTA is checklist-gated.
- Score does not look official without methodology.
- Copy avoids accusation.

## Not allowed

- Do not show direct LAPOR CTA first.
- Do not show big numbers without status.
- Do not make score prominent without methodology.
- Do not push seed/read path because of UI changes.

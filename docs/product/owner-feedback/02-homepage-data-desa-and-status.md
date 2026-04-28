# Owner Feedback Split 02 — Homepage, Data Desa, and Data Status

Date: 2026-04-28
Status: split-from-canonical-tracker
Source: `docs/product/14-owner-feedback-ui-ux-visual-todo-tracker.md`

## Purpose

This file groups feedback related to homepage clarity, Data Desa density, and data status badge requirements.

Owner test focus:

- Is homepage still clear and not crowded?
- Are Data Desa cards easy to scan?
- Are demo/imported/needs_review/verified states obvious?

## Homepage items

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| HOME-01 | ACCEPTED | P1 | Homepage first pass is accepted and no new major sections are added unless Owner requests. | Does homepage feel acceptable as first pass? |
| HOME-02 | TODO | P2 | Sections alternate between hook, education, data status, document, pilot story, civic narrative, and CTA without monotony. | Does the page feel visually varied? |
| HOME-03 | TODO | P2 | Data is represented through cards, status badges, document desk, journey timeline, and non-heavy visuals. | Does data feel visual, not just table/report? |
| HOME-04 | DEFERRED | P3 | Counters may animate subtly without implying real verified data. | Not tested yet; later polish. |
| HOME-05 | BLOCKED | P3 | Risk/radar concept must be non-accusatory and methodology-approved. | Do not implement/test yet. |
| HOME-06 | TODO | P1 | Data Demo/status badges are visually memorable and appear near important demo metrics. | Do demo numbers clearly look demo? |
| HOME-07 | TODO | P1 | Visual feel is modern, warm, data-rich, and human, not stiff government portal or generic SaaS. | Does it feel like fresh civic-tech? |
| HOME-08 | ACCEPTED | P1 | Future homepage work should not add more major sections; only polish/reduce after first pass. | Is team resisting endless homepage expansion? |

## Data Desa items

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| DATA-DESA-01 | TODO | P1 | DesaCard shows fewer visible data points and feels easier to scan. | Can I scan cards quickly? |
| DATA-DESA-02 | TODO | P1 | Row 1 shows `nama desa + status badge` only. | Do I instantly know name + status? |
| DATA-DESA-03 | TODO | P1 | Row 2 shows location: kecamatan/kabupaten/provinsi. | Is location clear but secondary? |
| DATA-DESA-04 | TODO | P1 | Row 3 shows progress/serapan in simple visual. | Is there one simple visual signal? |
| DATA-DESA-05 | TODO | P1 | Row 4 shows only 2 numbers: `diterima` and `dipakai`. | Are there too many numbers? |
| DATA-DESA-06 | TODO | P1 | Population, category, per-capita, and extra metadata move to detail/expanded state. | Are extra details hidden from list? |
| DATA-DESA-07 | TODO | P2 | Cards clearly feel clickable with hover lift/focus state and accessible link label. | Does card interaction feel modern and obvious? |

## Data status items

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| STATUS-01 | TODO | P0 | Every important metric/chart/card has nearby data status when demo/imported/needs_review. | Are important numbers always labeled? |
| STATUS-02 | TODO | P0 | System supports `Data Demo`, `Sumber Ditemukan`, `Perlu Review`, `Terverifikasi`. | Are the 4 statuses consistent? |
| STATUS-03 | BLOCKED | P0 | `Terverifikasi` cannot appear active until verification workflow exists. | Do not show active verified state. |
| STATUS-04 | TODO | P1 | Data Demo badge uses amber/cream and beaker/flask icon with microcopy. | Is Data Demo memorable? |
| STATUS-05 | TODO | P1 | Sumber Ditemukan badge uses blue/teal + link/globe icon and clear microcopy. | Does source found avoid implying verified? |
| STATUS-06 | TODO | P1 | Perlu Review badge uses orange/amber + alert icon, caution but not scary. | Does it feel careful, not accusatory? |
| STATUS-07 | BLOCKED | P1 | Terverifikasi badge uses green + shield-check but disabled/future until workflow. | Do not show as active. |

## What reviewers should check

- Homepage does not add more major sections.
- Demo/status badges are visible near important values.
- Data Desa cards are not overloaded.
- `Terverifikasi` is not active.
- Status language uses citizen terms, not raw enums.

## Not allowed

- Do not make demo/imported data look official.
- Do not make Data Desa listing a dense spreadsheet.
- Do not implement risk radar yet.
- Do not activate verified state.

# Owner Feedback Split 04 — Rights, Contact, Documents, and Score

Date: 2026-04-28
Status: split-from-canonical-tracker
Source: `docs/product/14-owner-feedback-ui-ux-visual-todo-tracker.md`

## Purpose

This file groups feedback related to Hak Wargamu, personal contact risk, document-first APBDes, and transparency score methodology.

Owner test focus:

- Does Hak Wargamu avoid overclaiming?
- Are personal contacts safe?
- Are documents shown before numeric conclusions?
- Does score explain methodology and demo status?

## Hak Wargamu items

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| RIGHTS-01 | TODO | P0 | Section does not present estimates/plans as proof of violation. | Does it avoid accusing desa? |
| RIGHTS-02 | TODO | P1 | Items that are regulatory requirements use label `Wajib menurut regulasi`. | Is certainty level clear? |
| RIGHTS-03 | TODO | P1 | Estimates use label `Estimasi berdasarkan jumlah penduduk`. | Are estimates clearly estimates? |
| RIGHTS-04 | TODO | P1 | Planned items use label `Masuk rencana APBDes`. | Is plan separated from obligation? |
| RIGHTS-05 | TODO | P1 | Unclear items use label `Perlu ditanyakan ke desa`. | Is next action safe? |
| RIGHTS-06 | TODO | P0 | Microcopy: `Angka ini adalah estimasi panduan, bukan bukti pelanggaran.` | Is caution visible? |
| RIGHTS-07 | TODO | P2 | Section uses checklist treatment to guide reading, not scare users. | Does it feel helpful? |

## Contact/personal data risk items

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| CONTACT-01 | TODO | P0 | No personal mobile numbers appear in demo/public UI unless explicitly approved. | Are personal phone numbers hidden? |
| CONTACT-02 | TODO | P0 | Demo contact uses placeholders like `Kepala Desa — [Nama Pejabat]`, `Nomor kantor desa — [Nomor resmi kantor]`. | Are fake/personal-looking contacts avoided? |
| CONTACT-03 | TODO | P1 | Contact hierarchy: kantor desa, website desa, email resmi, LAPOR.go.id, hotline resmi. | Are official channels prioritized? |

## Document-first APBDes items

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| DOC-01 | TODO | P1 | Document/source section appears above heavy budget metrics. | Do I see documents before conclusions? |
| DOC-02 | TODO | P2 | APBDes 2024 card exists if data/mock supports it, with status and source. | Is APBDes tangible as document? |
| DOC-03 | TODO | P2 | RKPDes card exists if available/mock, with status and source. | Is planning document visible? |
| DOC-04 | TODO | P2 | Laporan Realisasi card exists with status and source. | Is realization document visible? |
| DOC-05 | TODO | P2 | Perdes card exists if available/mock, with status and source. | Is regulation doc visible? |
| DOC-06 | TODO | P2 | Profil Desa card exists with status and source. | Is profile doc visible? |
| DOC-07 | TODO | P1 | Every document card/row shows name, year, source, status, button `Lihat sumber`. | Are document details enough but not raw? |
| DOC-08 | BLOCKED | P0 | Numeric APBDes conclusions are hidden/collapsed or clearly demo until document/status context appears. | Are numeric conclusions blocked? |

## Transparency score methodology items

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| SCORE-01 | TODO | P0 | Any score has visible tooltip/info explaining methodology and demo status. | Is methodology visible near score? |
| SCORE-02 | TODO | P1 | Tooltip includes `Ketersediaan dokumen publik`. | Is factor shown? |
| SCORE-03 | TODO | P1 | Tooltip includes `Kelengkapan laporan`. | Is factor shown? |
| SCORE-04 | TODO | P1 | Tooltip includes `Konsistensi serapan`. | Is factor shown? |
| SCORE-05 | TODO | P1 | Tooltip includes `Respons kanal publik`. | Is factor shown? |
| SCORE-06 | TODO | P0 | Tooltip/status says score is simulation demo, not official final. | Is score clearly demo? |

## Next-gate IDs in this file

- `RIGHTS-01`
- `RIGHTS-06`
- `SCORE-01`

`METRIC-06` is covered in split file 03 and should be reviewed together with `SCORE-01`.

## What reviewers should check

- Hak Wargamu does not sound like proof of violation.
- Estimates are clearly labeled.
- Contact information avoids personal phone numbers.
- Documents come before budget conclusions.
- Score is not prominent without methodology/demo explanation.

## Not allowed

- Do not show estimates as violations.
- Do not show personal phone numbers without explicit approval.
- Do not show numeric APBDes conclusions before document/status context.
- Do not make score feel official.

# Owner Feedback Split 01 — Accessibility and Primary Journey

Date: 2026-04-28
Status: split-from-canonical-tracker
Source: `docs/product/14-owner-feedback-ui-ux-visual-todo-tracker.md`

## Purpose

This file groups feedback related to accessibility and the main citizen journey.

Owner test focus:

- Is the UI readable and usable?
- Is keyboard/mobile usage safe?
- Is the main journey clear: Cari Desa → status → source/document → action?

## Accessibility items

| ID | Status | Priority | Page/Area | Acceptance criteria | Owner test |
|---|---|---|---|---|---|
| A11Y-01 | ACCEPTED | P0 | All pages | Normal text contrast meets WCAG AA. Small captions avoid low-contrast text unless decorative. | Can I read text comfortably without guessing? |
| A11Y-02 | ACCEPTED | P0 | Interactive elements | Buttons, links, toggles, cards, and icon controls show clear focus-visible ring. | Can I tab through and see where I am? |
| A11Y-03 | ACCEPTED | P0 | Homepage + Detail | Pages have logical semantic h1/h2/h3 structure. | Does the page title/section order make sense? |
| A11Y-04 | ACCEPTED | P0 | Mobile controls | Important tap targets meet minimum 44×44px. | Are buttons/cards easy to tap on mobile? |
| A11Y-05 | ACCEPTED | P0 | Buttons/cards/icons | Icon-only and ambiguous controls have descriptive aria-label; decorative icons are hidden. | Do icon buttons have clear meaning? |
| A11Y-06 | IN_PROGRESS | P1 | Mobile / low vision | Mobile text remains readable; no critical info uses tiny text; layout spacing supports scanning. | Can I read and scan on phone without zooming? |

## Primary journey items

| ID | Status | Priority | Page/Area | Acceptance criteria | Owner test |
|---|---|---|---|---|---|
| JOURNEY-01 | TODO | P1 | Homepage | Homepage first journey clearly pushes user to search/find desa before interpreting complex data. | Do I know to click/search desa first? |
| JOURNEY-02 | TODO | P1 | All pages | Primary CTAs use consistent language: `Cari Desa`, `Lihat Dokumen`, `Cara Membaca Data`, `Ceritakan Kondisi Desaku`. | Are CTA labels consistent and not confusing? |
| JOURNEY-03 | TODO | P1 | Homepage | Search/find desa is visually prominent and easy to use. | Can I immediately find the search action? |
| JOURNEY-04 | TODO | P1 | Cross-page journey | User can follow: Cari desa → Lihat status data → Baca sumber/dokumen → Ajukan pertanyaan/suara warga. | Does the journey feel connected across pages? |

## Acceptance notes

- A11Y-01 through A11Y-05 are accepted.
- A11Y-06 remains in progress and needs mobile readability review.
- Journey items are still TODO because homepage/detail/list flow needs more validation after detail page updates.

## What reviewers should check

For every UI implementation touching these items:

- keyboard tab order,
- visible focus,
- mobile tap target size,
- readable text size,
- CTA label consistency,
- whether user naturally knows what to do next.

## Not allowed

- Do not bury `Cari Desa` behind complex dashboard content.
- Do not use unclear CTA labels.
- Do not rely only on color for meaning.
- Do not make mobile users pinch-zoom to read key information.

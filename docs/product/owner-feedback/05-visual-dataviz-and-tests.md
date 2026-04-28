# Owner Feedback Split 05 — Visual Direction, Data Visualization, and Tests

Date: 2026-04-28
Status: split-from-canonical-tracker
Source: `docs/product/14-owner-feedback-ui-ux-visual-todo-tracker.md`

## Purpose

This file groups feedback related to visual direction, data visualization ideas, delight elements, and test recommendations.

Owner test focus:

- Does PantauDesa feel fresh, not government-boring?
- Are visuals useful and not misleading?
- Are delight elements tasteful?
- What should Owner/Iwan test before accepting?

## Visual design direction items

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| VISUAL-01 | TODO | P1 | UI feels civic-tech premium, not stiff government portal. | Does it feel modern and trustworthy? |
| VISUAL-02 | TODO | P1 | UI feels warm, modern, and data-rich without overwhelming. | Does it feel rich but still readable? |
| VISUAL-03 | TODO | P1 | Copy/design feels helpful, not patronizing. | Does it feel like helping citizens? |
| VISUAL-04 | TODO | P2 | Dashboard elements are humanized with context, source, and action. | Does dashboard feel human? |
| VISUAL-05 | TODO | P2 | Important sections tell a guided story: context → source → status → action. | Does the page tell a story? |
| VISUAL-06 | DEFERRED | P3 | Map/radar interface explored only after methodology and visual spec. | Not now. |
| VISUAL-07 | DEFERRED | P3 | Light glassmorphism used sparingly, readable, performant, and accessible. | Not now. |
| VISUAL-08 | TODO | P1 | Visual language balances civic report and product interface. | Does it avoid admin-panel vibe? |
| VISUAL-09 | TODO | P2 | Palette includes civic green for action/positive/verified later. | Is green used consistently? |
| VISUAL-10 | TODO | P2 | Palette includes trust teal for source/informational states. | Is source info visually distinct? |
| VISUAL-11 | TODO | P2 | Palette includes warm cream for demo/caution areas. | Does demo/caution feel warm? |
| VISUAL-12 | TODO | P2 | Palette includes deep ink for headings/primary text. | Are headings readable and strong? |
| VISUAL-13 | TODO | P2 | Palette includes alert amber for review/caution, avoiding scary red. | Does Perlu Review avoid fear tone? |

## Data visualization ideas

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| DATAVIZ-01 | DEFERRED | P3 | Uang Desa Flow Map implemented only after methodology and status rules. | Not now. |
| DATAVIZ-02 | BLOCKED | P3 | Keterbukaan Score Orb only allowed with methodology/demo label. | Blocked until score methodology. |
| DATAVIZ-03 | TODO | P2 | Progress ring may show serapan with status badge and demo context. | Does progress ring avoid false precision? |
| DATAVIZ-04 | DEFERRED | P3 | Animated counters only for demo/status-labeled numbers and reduced-motion support. | Later polish. |
| DATAVIZ-05 | DEFERRED | P3 | Document sparkle is subtle and not distracting. | Later polish. |
| DATAVIZ-06 | BLOCKED | P3 | Warga Cermat badge needs product logic before implementation. | Blocked until logic. |
| DATAVIZ-07 | TODO | P2 | Ready-to-ask questions based on documents/status, safely worded. | Does it help citizens act constructively? |

## Test recommendations

| ID | Status | Priority | Acceptance criteria | Owner test |
|---|---|---|---|---|
| TEST-01 | TODO | P2 | Test whether users click/find `Cari Desa` first without confusion. | Ask 3–5 users: what do you click first? |
| TEST-02 | TODO | P1 | Users can explain Data Demo/Sumber Ditemukan/Perlu Review/Terverifikasi after seeing UI. | Ask user to explain statuses. |
| TEST-03 | TODO | P1 | Users can complete main journey on mobile. | Try on phone. |
| TEST-04 | DEFERRED | P3 | Compare CTA variants later if unclear. | Not now. |
| TEST-05 | TODO | P0 | Users do not misread demo/imported data as official/verified. | Ask: is this official data? |
| TEST-06 | TODO | P0 | Users understand report CTA checklist before external reporting. | Ask: what should you do before reporting? |
| TEST-07 | TODO | P1 | Long detail page remains understandable on mobile scroll. | Scroll detail page on phone. |

## What reviewers should check

- Visuals feel fresh but not decorative-only.
- Data visualization does not imply verified/final data.
- Delight elements are deferred until safety/hierarchy is stable.
- Color palette supports meaning but does not rely on color alone.
- User tests focus on comprehension, not just aesthetics.

## Not allowed

- Do not implement risk radar before methodology.
- Do not implement score orb before methodology.
- Do not add heavy animation/library without approval.
- Do not prioritize delight before P0/P1 safety and trust.

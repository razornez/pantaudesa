# Sprint 05 Batch 3 - Review Modal UX Feedback Notes

## Status
DISCUSSION NOTE - do not execute until owner asks.

## Context

Owner reviewed the Internal Admin document/data review modal on a small/mobile-like viewport and reported the modal feels heavy, slow, visually tiring, and difficult to scan.

This note is intentionally parked first. Do not assign execution yet.

## Screenshot Context

Observed modal area:

- title: `Review Data Dokumen`
- document title: `tesssas`
- village: `Ancolmekar`
- multiple notice/info boxes before the actual field decision form
- field review cards below, with columns:
  - `Nilai publik saat ini`
  - `Isian draft saat ini`
  - `Keputusan final admin`
- modal has nested/long scrolling

## Owner Feedback

1. Modal feels heavy.
2. Scrolling feels slow, approximately like 10 FPS.
3. There is too much information shown at once.
4. The information may be important, but the packaging makes it confusing.
5. The form feels cramped and narrow.
6. The UI is too plain white, making it hard to distinguish data groups.
7. The visual hierarchy is weak: instruction text, warnings, explanation, and form compete for attention.
8. The modal creates cognitive fatigue before the reviewer reaches the actual decision fields.

## Product Interpretation

The modal tries to be transparent and educational, but it over-explains at the wrong place.

For internal admin review, the priority should be:

```text
1. What changed?
2. Which fields need a decision?
3. What is the current public value?
4. What is the draft value?
5. What is the final admin decision?
6. What action should admin take next?
```

Long instructions, legends, and policy explanations should not dominate the first screen.

## UX Direction To Consider Later

### 1. Replace multiple large info boxes with one compact summary

Current issue:

- too many stacked notice cards before the actual form
- all are visually similar and compete for attention

Suggested direction:

- show one compact top banner with the most important guardrail:
  `Preview ini belum mengubah data. Publish hanya terjadi setelah Anda konfirmasi.`
- move `Cara pakai modal ini` and `Legenda isi modal` into collapsed help.
- avoid showing more than one yellow/blue/purple info box by default.

### 2. Make the first screen decision-focused

First visible area should include:

- document/village title
- changed field count
- primary status
- direct jump to first changed field
- compact action guidance

The actual field decision should appear sooner.

### 3. Improve color grouping and contrast

Current issue:

- too plain white
- cards blend together
- hard to distinguish current vs draft vs final decision

Suggested grouping:

- Current public value: neutral/slate background
- Draft value: soft blue background
- Final decision: soft green or focused border
- Conflict/warning: amber only when needed
- Empty/missing data: muted dashed/empty state style

### 4. Reduce nested scroll / improve performance

Current issue:

- modal scroll feels slow, roughly 10 FPS
- likely due to long modal content, nested scroll containers, many cards, shadows, borders, or sticky elements

Potential checks later:

- avoid nested scroll inside modal when possible
- reduce heavy shadows/backdrop blur inside long scroll
- reduce sticky elements if causing repaint
- render only changed fields first
- collapse unchanged/empty fields
- consider virtualizing field list only if field count becomes large
- avoid expensive computed rendering inside map loops

### 5. Compact field cards

Current field cards feel cramped even though the modal is large.

Suggested field card structure:

```text
Field label + status badge
Current public value | Draft value
Final decision input
Reason/note collapsed unless required
```

On mobile/small width:

- stack current/draft/final vertically
- keep only one field open at a time if needed
- show a compact field index like `1/7`

### 6. Progressive disclosure

Default visible:

- changed fields
- required decisions
- publish confirmation

Collapsed by default:

- how-to instructions
- legend
- unchanged fields
- raw evidence
- technical metadata

### 7. Copywriting

Make copy shorter and calmer.

Examples:

- `Preview ini belum mengubah data.`
- `Cek nilai yang berubah, lalu pilih nilai final.`
- `Field kosong tidak ikut dipublish.`
- `Buka panduan` instead of displaying long guidance blocks.

## Acceptance Ideas If This Becomes A Task

- Modal first screen shows decision content faster.
- Help/legend collapsed by default.
- Field cards visually separate current, draft, and final decision.
- Scroll feels smooth on mobile/small viewport.
- No nested-scroll jank or obvious lag.
- Reviewer can complete decisions with less reading.
- No business logic change.

## Guardrails

Do not change:

- publish/review business rules
- final admin decision requirement
- no-auto-publish guardrail
- audit/version fallback behavior

This is UX/performance polish only unless owner later approves deeper changes.

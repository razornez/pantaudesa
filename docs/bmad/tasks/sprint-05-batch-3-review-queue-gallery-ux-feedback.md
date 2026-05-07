# Sprint 05 Batch 3 - Review Queue Gallery UX Feedback Notes

## Status
DISCUSSION NOTE - do not execute until owner asks.

## Context

Owner reviewed the Internal Admin document/data review queue cards and found that the queue is information-rich but visually inefficient and not pleasant to use.

This note is parked first. Do not assign execution yet.

## Screenshot Context

Observed UI:

- Status tabs: `Semua`, `Menunggu`, `Diproses`, `Sudah tayang`, `Gagal`.
- Card grid with document entries.
- Each card contains document title, village name, uploader/type/size/date metadata, badges, status explanation boxes, review guidance, and action buttons.
- Cards currently display several stacked info boxes and multiple buttons.

## Refined Owner Feedback

The review queue currently contains important information, but the presentation makes it feel dense, plain, and tiring.

Specific issues:

1. Cards are too informational but not visually curated.
2. The queue should feel more like a clean review gallery, not a pile of status notes.
3. The information hierarchy is weak: title, metadata, status, explanation, guidance, and actions compete for attention.
4. Font for secondary info is too small, yet there is too much of it.
5. Buttons inside cards feel scattered and are not aligned into a clear action area.
6. Data blocks inside each card feel cramped, like they are fighting for space.
7. The cards feel too plain/white and do not provide enough visual separation between content types.
8. The review process should feel calm and enjoyable, not like reading a crowded internal log.
9. Important guidance is repeated too heavily across cards.
10. The cards do not yet give a strong sense of priority: which item needs attention first, which one is ready, which one is blocked.

Owner expression to preserve:

```text
Card list ini harusnya menjadi sebuah gallery yang enak dilihat sehingga proses review menjadi menyenangkan. Sekarang data antar card terasa seperti orang yang berdempet-dempetan mencari tempat di kereta.
```

## Product Interpretation

The card is trying to explain every state directly inside each item, but a review queue should be optimized for scanning and decision-making.

A reviewer should quickly know:

```text
1. Dokumen apa ini?
2. Desa mana?
3. Status pentingnya apa?
4. Apakah draft review sudah siap?
5. Apa action utama berikutnya?
6. Apakah ada masalah/blocker?
```

Detailed explanations should be available, but not dominate every card.

## UX Direction To Consider Later

### 1. Transform queue cards into review gallery cards

Cards should look like curated review items:

- clear title area,
- village/source summary,
- compact status chip,
- one short review insight,
- one primary action,
- one secondary action,
- optional expanded details.

### 2. Reduce repeated explanatory boxes

Current cards show multiple explanation boxes:

- `Arti status ini`
- `Draft review tersedia...`
- `Calon versi review siap...`
- `Lanjut cek draft review...`

Suggestion:

- Show only one compact insight by default.
- Move repeated explanation into tooltip, help drawer, or collapsed `Detail status`.
- Do not repeat long status education in every card.

### 3. Create a stronger visual hierarchy

Recommended visible hierarchy:

```text
Card top:
Document title + status chip
Village + source/date summary

Card middle:
Review readiness summary / field count / blocker if any

Card bottom:
Primary action + secondary action
```

Less important metadata should be collapsed or shown as compact chips.

### 4. Improve action button layout

Current buttons feel scattered.

Suggested action pattern:

- Primary action: `Lanjut review data` should be prominent and consistently placed.
- Secondary action: `Preview` should be quieter.
- Destructive/blocking action: `Tidak bisa dipakai` should be separated visually and not compete with primary action.
- On mobile, stack buttons cleanly.
- On desktop, keep action row aligned across cards.

### 5. Make cards more breathable

The cards need breathing room without becoming oversized.

Suggested improvements:

- use fewer stacked boxes,
- group metadata into chips,
- increase internal spacing between content groups,
- avoid long paragraph blocks by default,
- use soft tinted sections only where they indicate meaning,
- visually distinguish status/insight/action zones.

### 6. Make card grid feel like a gallery

Suggested gallery direction:

- consistent card height where possible,
- aligned action area at bottom,
- subtle visual rhythm between cards,
- cards should feel like selectable work items,
- no visual crowding,
- calm colors with meaningful accents.

### 7. Prioritization cues

Consider showing:

- `Ready to review`,
- `Needs correction`,
- `Draft has 7 fields`,
- `Blocked`,
- `Published`,
- `Failed`,
- priority/date age indicator.

Do not make every state equally loud.

### 8. Mobile behavior

On small screens:

- card should stack cleanly,
- one clear primary button,
- secondary actions under dropdown or compact row,
- long metadata collapsed,
- avoid tiny text walls.

## Acceptance Ideas If This Becomes A Task

- Queue feels like a clean review gallery, not a dense log.
- Each card has a clear top/middle/bottom hierarchy.
- Repeated explanations are collapsed or reduced.
- Primary action is visually consistent across cards.
- Destructive action does not compete with primary action.
- Cards are easier to scan at a glance.
- Mobile layout remains comfortable.
- No business logic change.

## Guardrails

Do not change:

- review/publish/fail business logic,
- document status semantics,
- permission rules,
- no-auto-publish guardrail,
- audit/version fallback behavior.

This is UX/presentation polish only unless owner later approves deeper changes.

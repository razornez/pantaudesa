# Rangga REWORK Review — Sprint 04-003 Admin Claim Guided UI from Profile

Date: 2026-04-29
Reviewer: Rangga
Owner status: NOT APPROVED / visual UI rejected
Commits reviewed:

- `4c8bfbdf232a6f3da9f986b370cd75474d96a2dc` — `feat(admin): add guided desa admin claim profile UI`
- `f11942f48f705ad286c2fa038d4c148e1ae205be` — `fix(admin): polish guided claim profile UX`

Task reviewed:

- `docs/bmad/tasks/sprint-04-003-admin-claim-guided-ui-profile-batch.md`

Verdict:

`REWORK_REQUIRED_VISUAL_AND_STRUCTURE`

## Summary

The implementation passes technical QA according to commit messages, but the visual result is not acceptable. Owner reported desktop and mobile UI are broken/chaotic.

Rangga review agrees that the current direction is too heavy for a profile page and should be simplified structurally, not just patched with small class changes.

## Main problems observed from diff/code

### 1. Profile page is overloaded

`ProfileAdminAccessCard.tsx` became a very large client component with many responsibilities:

- data fetching,
- state machine/stepper,
- desa search/list,
- method cards,
- support mailto,
- status cards,
- demo state cards,
- current account state,
- explanatory copy,
- badge rendering.

This makes it hard to keep layout stable and visually clean.

### 2. Guided flow became a mini dashboard

The page shows too many things at once:

- hero card,
- stepper,
- searchable desa list,
- channel record card,
- method cards,
- instruction card,
- demo status gallery,
- current account state sidebar.

This overwhelms users and makes the profile page feel cluttered.

### 3. Mobile layout likely breaks because of density

Problem patterns visible in code:

- many nested rounded cards,
- many badges/chips,
- multiple grid sections,
- long labels inside small badges,
- `lg:grid-cols-[1.2fr_0.8fr]` and large card stacks,
- long explanatory copy inside every card.

Even if technically responsive, the result is visually cramped and hard to scan.

### 4. Desktop layout likely feels unbalanced

The two-column layout puts a complex wizard beside status/demo content. It likely creates uneven heights, heavy whitespace, and confusing hierarchy.

### 5. Too much demo/debug language appears in user flow

Examples to reduce or remove from primary UI:

- `Contoh status yang bisa muncul`
- `Dibaca dari database`
- `Demo fallback`
- `data demo yang disiapkan`
- technical-ish notes about database/source fallback.

Demo states may exist for QA, but should not dominate the user-facing profile flow.

### 6. Support card acts as both navigation and mailto

The `SUPPORT_REVIEW` method is an anchor when `supportHref` exists, while also changing step state. This can create confusing behavior: clicking a method may open email instead of moving through the guided flow.

### 7. This is not aligned with Owner expectation

Owner wanted:

- simple guided UI,
- not an empty form,
- not a messy dashboard,
- clear claim button in profile,
- safe choices,
- easy path for desa users.

Current implementation overshoots the complexity.

## Rework direction

This needs a structural redesign.

Do not keep patching the current large UI with small Tailwind tweaks.

Recommended fix:

1. Profile page should show only a compact `Akses Admin Desa` card.
2. Clicking `Klaim sebagai Admin Desa` opens a dedicated claim page or modal-like focused section.
3. The claim flow should show one step at a time.
4. Hide/demo state gallery should be moved to dev-only or removed from normal user view.
5. Use cleaner components and reduce badges/cards.
6. Validate mobile first.

## Required rework task

Open a rework task:

- `docs/bmad/tasks/sprint-04-003-rework-admin-claim-ui-structure.md`

Recommended model:

```text
GPT-5.1 Codex mini
Reasoning effort: medium
```

Escalate to GPT-5.1 high only if auth/session or route/data bugs appear.

## Verdict

`REWORK_REQUIRED_VISUAL_AND_STRUCTURE`

Do not accept Sprint 04-003 until desktop and mobile visual pass are clean.

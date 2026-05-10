# Back Office UI Design Guidelines

## Status
MANDATORY STANDARD for back-office development.

## Scope

This guideline is mandatory for all current and future PantauDesa back-office/internal-admin UI work.

Initial scope:

```text
/internal-admin/**
/admin-desa/**
/profil/admin-desa/**
back-office related components under src/components/internal-admin/**
back-office related components under src/components/profil/admin-claim/**
```

For now, apply this standard first to back-office pages. Public pages may adopt it later with adjusted public-facing tone.

## Reference Direction

The approved direction is the Intake V2 visual style:

```text
quiet luxury
clean
calm
premium but simple
soft border
subtle shadow
strong hierarchy
compact but breathable
decision-oriented
technical detail collapsed
clear primary action
mobile-friendly
```

This style must become the default reference for future back-office screens.

## Design Principles

### 1. Decision-oriented UI

Back-office screens should help users make decisions quickly.

Every key page must answer:

```text
What is this item?
What changed?
What needs attention?
What is safe?
What is blocked?
What should I do next?
```

Avoid showing raw system status as the main experience unless the user is explicitly in a debugging/technical section.

### 2. One-glance summary first

Each major workflow page should start with a useful summary/hero area.

Good summary examples:

- source to target narrative,
- impact summary,
- diff summary,
- validation state,
- next action.

Avoid scattered small cards that force the user to read everything one by one.

### 3. Technical detail is secondary

Technical detail must be collapsed, secondary, or placed in an inspector/troubleshooting area.

Examples of secondary technical detail:

- parser metadata,
- OpenAI proof/request id,
- fallback mode details,
- raw evidence snippets,
- debug timings,
- internal API/storage notes.

Default visible UI should be useful for non-technical owner/admin users.

### 4. Quiet luxury visual language

Use:

- soft white/off-white surfaces,
- subtle borders,
- subtle shadows,
- calm accent colors,
- strong typography hierarchy,
- compact spacing with enough breathing room,
- fewer but more meaningful visual groups.

Avoid:

- too many plain white boxes,
- repeated info boxes,
- heavy nested cards,
- loud colors everywhere,
- tiny dense text walls,
- dashboard/debug-panel look,
- redundant summaries.

### 5. Clear action placement

Primary actions must be easy to find.

Rules:

- primary action should not be buried in the middle of content,
- destructive action must not compete visually with primary action,
- secondary actions should be quieter but still reachable,
- mobile must keep actions obvious and not cramped.

### 6. Progressive disclosure

Show only what is needed by default.

Default visible:

- decision summary,
- primary status,
- important changes,
- blockers,
- next action.

Collapsed/secondary:

- unchanged data,
- long history,
- technical parser details,
- full evidence,
- fallback/debug proof,
- raw metadata.

### 7. Mobile-first back office

Back-office features must remain usable on small screens, including iPhone 12 mini width around 375px.

Rules:

- no horizontal scroll,
- no dense tiny text walls,
- stack complex layouts cleanly,
- keep primary action visible,
- avoid long unstructured scroll,
- avoid nested scroll jank unless absolutely necessary.

## Engineering Principles

### 1. No duplicate UI surfaces

There must be one source of truth per workflow.

Examples:

- review queue is the source of truth for review work items,
- intake history may be shortcut/link only, not a competing review queue,
- technical inspector is the place for parser/AI details, not repeated cards across the page.

If a new component duplicates an existing flow, reuse or consolidate instead.

### 2. No redundant components

Before adding a new component, check if an equivalent component already exists.

Avoid duplicates for:

- status badges,
- cards/sections,
- empty states,
- formatters,
- action bars,
- diff rows,
- review cards,
- modal shells,
- technical detail panels.

If a component is superseded and no longer used, remove it.

### 3. Keep components small and focused

Use SOLID/DRY-style boundaries.

Rules:

- parent page/component should orchestrate only,
- presentational components should not own API/business logic,
- hooks should own stateful fetch/action logic,
- domain helpers should live in `src/lib/**`, not inside UI components,
- component files should stay small enough to review comfortably,
- avoid 1000+ line UI components.

### 4. Shared contracts and helpers

Do not duplicate domain DTOs or constants in UI folders if shared types already exist.

Preferred ownership:

- domain/API DTOs: `src/lib/**`,
- UI-only state/props: component folder,
- mapping/data contracts: neutral domain module,
- reusable formatting helpers: shared helper only when used by multiple surfaces.

### 5. Dynamic data only

Prototype/demo data must never ship as real UI data.

Rules:

- all visible operational data must come from API/DB/pipeline result,
- if data is missing, show honest empty/fallback state,
- do not hardcode values from mockups,
- do not use dummy data to make the UI look complete.

## Required Developer Checklist Before Starting Back-office UI Work

Before implementing a back-office UI task, the developer must check:

```text
1. Is there an existing component/flow that already solves this?
2. Am I creating a second source of truth?
3. Can this reuse Intake V2 visual patterns?
4. Is the default view decision-oriented?
5. Are technical details secondary/collapsed?
6. Is the primary action obvious?
7. Is the mobile layout usable around 375px?
8. Are all displayed data dynamic from API/DB/result state?
9. Are unused/superseded components removed?
10. Are domain types/helpers reused instead of duplicated?
```

## Required Review Checklist

Every back-office UI PR must include:

- screenshot desktop,
- screenshot mobile/narrow viewport,
- list of reused components,
- list of new components and why they are needed,
- confirmation no duplicate source of truth was introduced,
- confirmation no static prototype/demo data remains,
- QA result:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build` if environment allows.

## Current Mandatory Direction

For Sprint 05 Batch 3 and onward:

```text
Intake V2 is the approved back-office UI reference.
Any new back-office screen should visually and structurally align with this direction unless owner explicitly approves a different direction.
```

## Guardrails

Do not compromise:

- auth/permission rules,
- no-auto-publish rule,
- review/publish flow,
- audit/version safety,
- sensitive data protection,
- API key/secret protection,
- production env safety.

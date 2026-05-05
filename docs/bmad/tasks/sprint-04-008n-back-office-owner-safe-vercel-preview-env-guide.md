# Sprint 04-008N - Owner-Safe Vercel Preview Env Guide

## Status
READY FOR EXECUTION - docs only, owner-safe instructions.

## Context
Sprint 04-008M prepared a staging/preview rollout runbook, but execution is blocked because:

- the owner cannot invite an executor to Vercel without upgrading plan
- the owner is non-technical and Vercel Environment Variables UI is confusing
- current Vercel UI shows `DATABASE_URL` scoped to `Production and Preview`
- editing the existing `DATABASE_URL` is risky because it may affect Production

## Decision
Do **not** ask the owner to edit existing `DATABASE_URL` manually.

The owner-safe path is documentation and assisted execution only:

1. Do not touch existing `DATABASE_URL` that says `Production and Preview`.
2. Do not click Reveal.
3. Do not paste DB URLs into chat or docs.
4. If a Preview-only override cannot be created clearly, stop.
5. Production remains unchanged.

## Goal
Create a short owner-safe guide that explains what the owner should and should not click in Vercel.

## Hard Boundaries
Do not:

- change production `DATABASE_URL`
- ask owner to reveal secrets
- ask owner to paste secrets into chat
- create migration/index/schema change
- install package
- change business logic
- modify env files

## Required Deliverables

Update:

```text
docs/bmad/runbooks/back-office-connection-strategy-staging-rollout.md
```

Append a section:

```md
## Owner-Safe Vercel UI Guidance

From the current Vercel screenshot, `DATABASE_URL` appears scoped to `Production and Preview`.

Do not edit that row directly.

Safe rule:
- if a variable says `Production and Preview`, treat it as production-impacting
- only continue if Vercel lets you create or edit a `Preview`-only `DATABASE_URL`
- if Preview-only is not clearly available, stop and do not change anything

Owner should not click Reveal and should not paste secrets into chat.

Next safe action:
- create a separate Preview-only environment variable only if the UI clearly allows selecting Preview only
- otherwise keep the task blocked and wait for technical assisted execution
```

Also update:

```text
docs/bmad/reports/back-office-performance-audit.md
```

Add one line under Sprint 04-008M status:

```md
Owner manual execution paused: current Vercel UI shows `DATABASE_URL` scoped to `Production and Preview`, so direct owner editing is considered unsafe without assisted execution.
```

## Acceptance Criteria

- runbook includes owner-safe Vercel UI guidance
- report notes manual execution is paused for safety
- no production env change
- no secrets committed
- docs-only change

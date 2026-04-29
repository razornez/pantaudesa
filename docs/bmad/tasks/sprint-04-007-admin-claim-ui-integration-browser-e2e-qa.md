# Sprint 04-007 — Admin Claim UI Integration & Browser E2E QA Index

Date: 2026-04-29
Status: draft-refinement / pending-owner-final-approval
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner requested Sprint 04-007 be split into two documents so the task is easier to read and execute sequentially.

## Current status

- Draft only.
- Do not assign to Ujang yet.
- Do not execute until Owner explicitly says OK/gas/approve.

## Purpose

Sprint 04-007 connects the completed Sprint 04-006 admin-claim service layer to the user-facing browser UI.

The work is intentionally split into two task documents:

1. `docs/bmad/tasks/sprint-04-007a-admin-claim-core-browser-flow.md`
2. `docs/bmad/tasks/sprint-04-007b-admin-claim-completion-ux-invite-contact-browser-qa.md`

Developer must read both documents first, then execute them in order.

## Execution order

### First: 04-007A — Admin Claim Core Browser Flow

File:

```text
docs/bmad/tasks/sprint-04-007a-admin-claim-core-browser-flow.md
```

Focus:

- claim eligibility check,
- one-user-one-desa rule,
- submit claim UI,
- email magic link UI,
- website token generation UI,
- website token check UI,
- website renewal awareness,
- profile/status badge integration,
- admin access CTA,
- caching/freshness for core claim actions,
- desktop/mobile browser QA and screenshot notes.

### Second: 04-007B — Admin Claim Completion UX, Invite, Hubungi Admin, and Browser QA

File:

```text
docs/bmad/tasks/sprint-04-007b-admin-claim-completion-ux-invite-contact-browser-qa.md
```

Focus:

- resume current claim flow,
- resend/regenerate token flow,
- claim method switch,
- active claim timeline,
- invite admin UI,
- invite accept result UI,
- reusable Hubungi Admin form,
- `CONTACT_EMAIL=cs@pantaudesa.id`,
- lightweight anti-spam,
- caching/freshness for completion flows,
- desktop/mobile browser QA and screenshot notes.

## Shared requirements

Both 04-007A and 04-007B must follow:

- TDD-first / test-first posture,
- SOLID and separation of concerns,
- typed API client/hooks where practical,
- reusable component boundaries,
- React/Next.js best practices,
- no stale cache after user actions,
- no public data verified activation,
- no raw token leakage,
- no private email/phone exposure,
- no new dependency,
- no screenshot storage,
- desktop and mobile UI QA,
- local screenshot cleanup after handoff.

## Env policy

Existing env used:

```text
AUTH_URL
RESEND_API_KEY
RESEND_FROM
```

One approved new env for 04-007B:

```text
CONTACT_EMAIL=cs@pantaudesa.id
```

No other env names are approved.

## Quality gate

Each task must report:

```bash
npm run lint
npm run test
npx tsc --noEmit
npx prisma generate
npm run build
```

Hard gate:

- lint must pass,
- tests must pass,
- typecheck must pass,
- Prisma generate must pass,
- build must pass.

If any command fails, status must be `BLOCKED` or `REWORK`, not PASS.

## Screenshot policy

Screenshots remain local only and must not be committed.

Use local ignored folders:

```text
.artifacts/screenshots/sprint-04-007a/
tmp/screenshots/sprint-04-007a/
.artifacts/screenshots/sprint-04-007b/
tmp/screenshots/sprint-04-007b/
```

After push/handoff, cleanup local screenshots:

```bash
rm -rf .artifacts/screenshots/sprint-04-007a tmp/screenshots/sprint-04-007a
rm -rf .artifacts/screenshots/sprint-04-007b tmp/screenshots/sprint-04-007b
```

## Out of scope for Sprint 04-007

Do not implement:

- Data Desa `/desa` server-query refactor,
- Voice-to-Desa relation migration,
- broad DataStatus trust sweep,
- NextAuth upgrade,
- Playwright setup,
- branch protection,
- public data `verified` activation,
- screenshot storage/Supabase bucket,
- file upload/evidence attachment storage,
- claim history UI,
- manual support review workflow,
- public admin list per desa,
- internal admin review queue,
- revoke/suspend admin UI,
- invite management dashboard,
- audit viewer,
- Fake Admin Report UI,
- automatic moderation/suspension from reports,
- full 6-month auto-downgrade scheduler/cron if it requires migration/infrastructure,
- new schema/migration unless Owner approves,
- new dependency,
- additional env vars beyond `CONTACT_EMAIL`.

## Approval and assignment rule

Do not assign this task until Owner says OK/gas/approve.

When assigning after approval, keep chat instruction short:

```text
Ujang, pull latest main lalu baca dan kerjakan berurutan:
1. docs/bmad/tasks/sprint-04-007a-admin-claim-core-browser-flow.md
2. docs/bmad/tasks/sprint-04-007b-admin-claim-completion-ux-invite-contact-browser-qa.md
```

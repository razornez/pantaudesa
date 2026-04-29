# Sprint 04-007 — Admin Claim UI Integration & Browser E2E QA

Date: 2026-04-29
Status: approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner approved combining Admin Claim Wizard API Wiring and Admin Claim UI Integration so the flow can be tested directly in browser.

## Purpose

Connect the completed Sprint 04-006 admin-claim service layer to the user-facing profile/admin-claim UI and verify the end-to-end user journey in browser.

This task exists because Sprint 04-006 completed the backend/API/service layer, but the UI wizard is not yet wired to the new endpoints.

## Ownership

- PIC: Ujang
- Reviewer: Rangga
- Gate owner: Iwan/Owner for product/security/governance decisions
- Asep: not assigned unless Owner opens a separate task

## Source docs

Ujang must read:

1. `docs/bmad/tasks/sprint-04-007-admin-claim-ui-integration-browser-e2e-qa.md`
2. `docs/bmad/tasks/sprint-04-006-consolidated-quality-data-trust-batch.md`
3. `docs/bmad/reports/sprint-04-006-handoff-report.md`
4. `docs/bmad/tasks/sprint-04-004-admin-claim-verification-services-batch.md`

## Context from Sprint 04-006

Sprint 04-006 added backend/service endpoints for:

- `POST /api/admin-claim/submit`
- `POST /api/admin-claim/generate-email-token`
- `POST /api/admin-claim/generate-website-token`
- `GET /api/admin-claim/verify-email`
- `POST /api/admin-claim/check-website-token`
- `POST /api/admin-claim/update-status`
- `POST /api/admin-claim/invite`
- `GET /api/admin-claim/accept-invite`
- `POST /api/admin-claim/report-fake-admin`

Sprint 04-006 also added admin claim helpers for:

- audit events,
- token generation/hash/expiry,
- website token checking,
- status transitions,
- admin claim email service.

Known state before this task:

- API/service layer exists.
- UI wizard is not yet fully wired.
- Browser flow cannot be considered complete until this task passes.

## Existing env usage

Use existing env only:

```text
AUTH_URL
RESEND_API_KEY
RESEND_FROM
```

Rules:

- Do not add new env var names.
- Do not add `NEXT_PUBLIC_APP_URL`, `EMAIL_FROM`, `RESEND_FROM_EMAIL`, `SUPPORT_EMAIL`, or `NEXT_PUBLIC_SUPPORT_EMAIL`.
- If existing env is invalid/missing, report blocker.

## TDD-first / test-first rule

Before or during implementation, add/update tests or at least explicit browser QA cases for every changed behavior.

Minimum expectation:

- test/QA happy path,
- invalid input,
- unauthenticated access,
- API error state,
- loading/success/error UI,
- token expired/invalid states where reachable,
- no public data verified activation.

Do not rely only on visual manual testing if a helper or behavior can be covered with Vitest.

## Scope

## A. Wire `/profil/klaim-admin-desa` to real admin-claim APIs

Connect the existing admin claim wizard components to the new service endpoints.

Likely UI/components to inspect:

- `/profil/klaim-admin-desa`
- `AdminClaimWizard`
- `AdminClaimInstruction`
- `AdminClaimStatusPanel`
- related profile claim card/components

Required behavior:

- submit claim calls `POST /api/admin-claim/submit`,
- email method calls `POST /api/admin-claim/generate-email-token`,
- website method calls `POST /api/admin-claim/generate-website-token`,
- check website token calls `POST /api/admin-claim/check-website-token`,
- UI reads and displays real claim/admin status where possible,
- UI never fakes success when API returns error.

## B. Integrate UI states

Implement clear user-facing states for:

- idle,
- loading,
- submit success,
- email sent,
- email env missing / email failed,
- website token generated,
- website token check success,
- website token not found,
- website check blocked/unsafe URL,
- pending review,
- limited admin,
- verified admin membership,
- generic API failure.

Copy must stay demo-safe and trust-safe.

Important wording:

- `VERIFIED` admin membership must not be written as verified public data.
- Public village data must not appear verified because a user/admin claim was verified.

## C. Website token UX

After token generation:

- display raw token only in the active UI session,
- show placement instruction clearly,
- tell user that token should be placed on the official village website,
- allow user to trigger check token while raw token is still available,
- handle the case where the raw token is lost after refresh by telling user to regenerate token.

Do not store raw token in localStorage/sessionStorage unless Owner explicitly approves.

## D. Email magic link UX

Email flow should:

- send magic link using existing backend endpoint,
- show success message when email sent,
- show honest error if Resend/env is missing or email fails,
- keep user in `PENDING`/review state until verification callback succeeds,
- display result when `/api/admin-claim/verify-email` redirects back with success/error params if currently supported.

## E. Profile page integration

If `/profil/saya` has a claim/admin card:

- update it to reflect real admin claim/member state where available,
- keep CTA to `/profil/klaim-admin-desa`,
- avoid duplicate or conflicting CTAs,
- do not expose private email/phone.

If wiring this card would cause scope creep, document it as follow-up, but `/profil/klaim-admin-desa` must be completed.

## F. Browser E2E QA without adding Playwright

Run browser/manual E2E QA directly. Do not add Playwright or any new dependency in this task.

Browser flows to test:

1. Unauthenticated user attempts to access/submit claim.
2. Authenticated user opens `/profil/klaim-admin-desa`.
3. User submits claim for a valid desa.
4. User selects email verification and triggers magic link.
5. User selects website token verification and generates token.
6. User checks website token and sees success/failure state.
7. Unsafe/private website URL is rejected or reported safely.
8. API error state displays cleanly.
9. Refresh/revisit page shows persisted claim/status correctly where supported.
10. Mobile layout remains usable.

If full email delivery cannot be tested in local/staging, report the exact reason and test the reachable fallback/dev path honestly.

## G. Screenshots / UI evidence

Because this task changes UI, screenshots are required.

Capture before/after desktop and mobile screenshots or clear screenshot notes for:

- `/profil/saya` if changed,
- `/profil/klaim-admin-desa` initial state,
- claim submitted state,
- email method state,
- website token generated state,
- website token check result state,
- error state if practical.

Store screenshots locally only in ignored artifact folder:

```text
.artifacts/screenshots/sprint-04-007/
tmp/screenshots/sprint-04-007/
```

Do not commit screenshots unless Owner explicitly asks.

After code is committed/pushed and the screenshot notes are included in the handoff report, clean up local screenshot artifacts.

Required cleanup command example:

```bash
rm -rf .artifacts/screenshots/sprint-04-007 tmp/screenshots/sprint-04-007
```

Cleanup must happen locally after push/handoff. Do not add screenshot storage or Supabase bucket in this task.

## Quality gate

Run:

```bash
npm run lint
npm run test
npx tsc --noEmit
npx prisma generate
npm run build
```

If any command fails:

- do not hide it,
- report exact command and error,
- separate pre-existing lint debt from new regressions,
- do not disable rules massally.

## Out of scope

Do not implement in this task:

- Data Desa `/desa` server-query refactor from Sprint 04-005,
- Voice-to-Desa relation migration,
- broad DataStatus trust sweep,
- NextAuth upgrade,
- Playwright setup,
- branch protection,
- public data `verified` activation,
- screenshot storage/Supabase bucket,
- new schema/migration unless Owner approves,
- new dependency,
- new env var.

## Guardrails

- No public data verified activation.
- Admin membership verification is not public data verification.
- No crawler behavior.
- Website token checker must remain SSRF/private URL safe.
- No private email/phone exposure.
- No admin self-promotion.
- `User.role = DESA` is not proof of verified desa admin.
- All important actions must remain audited by service layer.
- No fake success if API/email/env fails.

## Acceptance criteria

1. `/profil/klaim-admin-desa` can submit a real claim from UI.
2. UI can trigger real email magic link endpoint.
3. UI can trigger real website token generation endpoint.
4. UI can trigger real website token check endpoint.
5. UI displays loading/success/error states clearly.
6. UI displays claim/admin status from real backend state where available.
7. Browser QA covers happy path, error path, unsafe URL path, and refresh/revisit behavior.
8. Mobile and desktop UI remain usable.
9. Screenshots/notes are captured locally, reported, and then cleaned up locally after push/handoff.
10. No new env names are introduced.
11. No new dependency is introduced.
12. No public verified data is activated.
13. No screenshot storage or Supabase bucket is introduced.
14. Quality gate is reported.

## Final handoff report format

```text
Task: Sprint 04-007 Admin Claim UI Integration & Browser E2E QA
Status: PASS / PARTIAL_PASS / BLOCKED / REWORK
Batches/flows completed:
- submit claim UI:
- email magic link UI:
- website token generation UI:
- website token check UI:
- status panel/profile integration:
- browser E2E QA:
Env used:
- RESEND_API_KEY:
- RESEND_FROM:
- AUTH_URL:
- new env introduced: YES/NO
Tests/QA:
- tests added/updated:
- browser flows tested:
- unauthenticated case:
- API error case:
- unsafe URL case:
Quality gate:
- npm run lint:
- npm run test:
- npx tsc --noEmit:
- npx prisma generate:
- npm run build:
UI evidence:
- before screenshots/notes:
- after screenshots/notes:
- screenshot folder:
- local screenshot cleanup after push/handoff: DONE / NOT_DONE / SKIPPED_WITH_REASON
Security/trust checks:
- no public data verified activation:
- no private exposure:
- no fake success:
- SSRF guard still respected:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

## Chat instruction rule

When assigning this task in chat, keep the instruction short:

```text
Ujang, pull latest main dan kerjakan task BMAD: docs/bmad/tasks/sprint-04-007-admin-claim-ui-integration-browser-e2e-qa.md
```

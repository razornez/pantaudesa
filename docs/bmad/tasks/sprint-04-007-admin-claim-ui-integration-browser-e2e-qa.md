# Sprint 04-007 — Admin Claim UI Integration & Browser E2E QA

Date: 2026-04-29
Status: approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner approved combining Admin Claim Wizard API Wiring and Admin Claim UI Integration so the flow can be tested directly in browser. Owner also approved adding Invite Admin UI and replacing Fake Admin Report UI with a reusable Hubungi Admin email form.

## Purpose

Connect the completed Sprint 04-006 admin-claim service layer to the user-facing profile/admin-claim UI and verify the end-to-end user journey in browser.

This task exists because Sprint 04-006 completed the backend/API/service layer, but the UI wizard is not yet wired to the new endpoints.

This task now covers the claim admin UI enough to be browser-testable end-to-end:

1. claim submit UI,
2. email magic link UI,
3. website token UI,
4. status/profile integration,
5. invite admin UI,
6. reusable Hubungi Admin email form for reports/support.

Fake Admin Report UI is intentionally taken out. Users who want to report a fake admin should use Hubungi Admin, which sends an email with subject, description, and optional evidence.

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
- Invite admin service exists but UI is not wired.
- Fake admin report API exists, but its UI is intentionally not part of this task.
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
- invite permission and max-admin behavior where reachable,
- Hubungi Admin form validation and send states,
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
- invite created,
- invite accepted result if user lands from accept link,
- Hubungi Admin email sent,
- Hubungi Admin email failed,
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

## F. Invite Admin UI

Add browser-usable UI for the existing invite admin service.

Required behavior:

- available only when current user is allowed to invite, or shown disabled with clear reason,
- calls `POST /api/admin-claim/invite`,
- form contains invitee email,
- validates email before send,
- displays loading/success/error state,
- explains max 5 admins per desa,
- explains invited admin starts as `LIMITED`, not verified admin,
- handles `403` non-verified admin gracefully,
- handles max-admin reached gracefully,
- does not expose private user/contact data,
- browser QA covers invite created and blocked states where practical.

Accept invite flow:

- `GET /api/admin-claim/accept-invite` already exists.
- UI should display success/error result if redirected back to `/profil/klaim-admin-desa` with invite query params.
- Do not create a full invite management dashboard in this task unless it is already trivial.

## G. Reusable Hubungi Admin email form

Replace Fake Admin Report UI with a reusable Hubungi Admin component.

Purpose:

- Give users a safe way to contact PantauDesa/admin/support when they want to report a fake admin or need help.
- Do not build a Fake Admin Report UI in this task.
- Use email sending, not automatic moderation/suspension.

Component requirements:

- reusable component, not hardcoded only for claim page,
- can be embedded in admin claim page and reused later elsewhere,
- fields:
  - subject,
  - description,
  - evidence/bukti field,
  - send button,
- evidence may be a URL/text field; do not implement file upload/storage in this task,
- validate required fields,
- show loading/success/error state,
- send email using existing email setup/env only,
- do not add new env names,
- do not add screenshot storage or attachment storage,
- do not auto-suspend or auto-punish anyone.

Implementation options:

- Add a small API route for contact-admin email if no suitable route exists.
- Reuse existing Resend setup with `RESEND_API_KEY` and `RESEND_FROM`.
- If recipient cannot be determined from existing env/config safely, report blocker instead of adding `SUPPORT_EMAIL` or another new env.

Important constraint:

- Owner asked not to create new env names.
- If sending email requires a recipient env that does not exist, stop and ask Owner instead of inventing `SUPPORT_EMAIL`.
- A safe fallback can be sending to the existing `RESEND_FROM` address only if that is acceptable and documented in handoff.

Browser QA:

- form renders,
- required validation works,
- send success state works,
- send failure state works,
- evidence URL/text is included in email body,
- no private data is exposed.

## H. Browser E2E QA without adding Playwright

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
10. Verified/allowed admin can invite another admin, or blocked state is shown if not eligible.
11. Invite accept redirect result is shown if reachable.
12. Hubungi Admin form validates and sends/fails honestly.
13. Mobile layout remains usable.

If full email delivery cannot be tested in local/staging, report the exact reason and test the reachable fallback/dev path honestly.

## I. Screenshots / UI evidence

Because this task changes UI, screenshots are required.

Capture before/after desktop and mobile screenshots or clear screenshot notes for:

- `/profil/saya` if changed,
- `/profil/klaim-admin-desa` initial state,
- claim submitted state,
- email method state,
- website token generated state,
- website token check result state,
- invite admin UI state,
- Hubungi Admin form state,
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
- file upload/evidence attachment storage,
- full invite management dashboard,
- Fake Admin Report UI,
- automatic moderation/suspension from reports,
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
- All important admin-claim actions must remain audited by service layer.
- No fake success if API/email/env fails.
- Hubungi Admin must not auto-suspend, auto-punish, or create public accusation states.

## Acceptance criteria

1. `/profil/klaim-admin-desa` can submit a real claim from UI.
2. UI can trigger real email magic link endpoint.
3. UI can trigger real website token generation endpoint.
4. UI can trigger real website token check endpoint.
5. UI displays loading/success/error states clearly.
6. UI displays claim/admin status from real backend state where available.
7. Invite Admin UI can trigger real invite endpoint or clearly explain why user is not eligible.
8. Invite accept redirect result is surfaced if reachable.
9. Reusable Hubungi Admin component exists and can send a contact/report email using existing env/config only.
10. Fake Admin Report UI is not implemented in this task.
11. Browser QA covers happy path, error path, unsafe URL path, invite path, Hubungi Admin path, and refresh/revisit behavior.
12. Mobile and desktop UI remain usable.
13. Screenshots/notes are captured locally, reported, and then cleaned up locally after push/handoff.
14. No new env names are introduced.
15. No new dependency is introduced.
16. No public verified data is activated.
17. No screenshot storage or Supabase bucket is introduced.
18. Quality gate is reported.

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
- invite admin UI:
- invite accept result UI:
- Hubungi Admin reusable form:
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
- invite path:
- Hubungi Admin path:
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
- no fake admin report UI:
- Hubungi Admin sends email only:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

## Chat instruction rule

When assigning this task in chat, keep the instruction short:

```text
Ujang, pull latest main dan kerjakan task BMAD: docs/bmad/tasks/sprint-04-007-admin-claim-ui-integration-browser-e2e-qa.md
```

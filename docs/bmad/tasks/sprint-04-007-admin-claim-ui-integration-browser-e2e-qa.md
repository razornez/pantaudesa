# Sprint 04-007 — Admin Claim UI Integration & Browser E2E QA

Date: 2026-04-29
Status: draft-refinement / pending-owner-final-approval
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner is still refining scope. Do not instruct Ujang until Owner explicitly says OK/gas/approve.

## Purpose

Connect the completed Sprint 04-006 admin-claim service layer to the user-facing profile/admin-claim UI and verify the end-to-end user journey in browser.

This task exists because Sprint 04-006 completed the backend/API/service layer, but the UI wizard is not yet wired to the new endpoints.

This task now covers the claim admin UI enough to be browser-testable end-to-end:

1. claim submit UI,
2. one-user-one-desa enforcement visibility,
3. email magic link UI,
4. website token UI,
5. website token renewal awareness,
6. status/profile integration,
7. invite admin UI,
8. reusable Hubungi Admin email form for reports/support.

Fake Admin Report UI is intentionally taken out. Users who want to report a fake admin should use Hubungi Admin, which sends an email with subject, description, and optional evidence.

## Ownership

- PIC: Ujang, only after Owner final approval
- Reviewer: Rangga
- Gate owner: Iwan/Owner for product/security/governance decisions
- Asep: not assigned unless Owner opens a separate task

## Source docs

Ujang must read after task is approved:

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

## Existing env usage and one approved new env

Use existing env for auth/email base:

```text
AUTH_URL
RESEND_API_KEY
RESEND_FROM
```

Owner approved one new env for customer support/contact email:

```text
CONTACT_EMAIL=cs@pantaudesa.id
```

Rules:

- `RESEND_API_KEY` is used for Resend.
- `RESEND_FROM` remains sender/from address.
- `AUTH_URL` remains app base URL for existing admin-claim callback/magic link behavior.
- `CONTACT_EMAIL` is the recipient for Hubungi Admin emails.
- Do not add any other env names.
- Do not add `NEXT_PUBLIC_APP_URL`, `EMAIL_FROM`, `RESEND_FROM_EMAIL`, `SUPPORT_EMAIL`, `NEXT_PUBLIC_SUPPORT_EMAIL`, or `CS_EMAIL`.
- If `CONTACT_EMAIL` is missing, Hubungi Admin must report blocker/error honestly, not fake success.

## Owner decisions captured

1. One user may manage/represent only one desa.
2. Claim history is not needed because each user can only claim one desa.
3. Website verification should be renewed every 6 months. If not renewed, admin status should eventually return to `LIMITED` or similar.
4. Full automatic 6-month downgrade/scheduler is not required in this task unless already possible without schema/migration.
5. Manual support review flow is not needed in this task because website verification exists.
6. Internal admin features are moved to a later internal-admin batch.
7. Public admin list per desa is not needed.
8. Fake Admin Report UI is not needed; use Hubungi Admin instead.
9. Rate-limit/anti-spam should be minimal and lightweight, without new dependency.

## TDD-first / test-first rule

Before or during implementation, add/update tests or at least explicit browser QA cases for every changed behavior.

Minimum expectation:

- test/QA happy path,
- invalid input,
- unauthenticated access,
- API error state,
- loading/success/error UI,
- token expired/invalid states where reachable,
- one-user-one-desa rule,
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

## B. Enforce and explain one-user-one-desa rule

A user may manage/represent only one desa.

Required behavior:

- UI must prevent or clearly block claiming a second desa when the user already has an active claim/member for another desa.
- API/backend should also enforce this rule if not already enforced.
- Active statuses include at least `PENDING`, `LIMITED`, and `VERIFIED`.
- If an active claim/member exists, show which desa is already connected if safe and non-private.
- Do not add claim history UI.

If enforcing this requires schema/migration, stop and ask Owner.

## C. Integrate UI states

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
- already managing another desa,
- invite created,
- invite accepted result if user lands from accept link,
- Hubungi Admin email sent,
- Hubungi Admin email failed,
- generic API failure.

Copy must stay demo-safe and trust-safe.

Important wording:

- `VERIFIED` admin membership must not be written as verified public data.
- Public village data must not appear verified because a user/admin claim was verified.

## D. Website token UX and 6-month renewal awareness

After token generation:

- display raw token only in the active UI session,
- show placement instruction clearly,
- tell user that token should be placed on the official village website,
- allow user to trigger check token while raw token is still available,
- handle the case where the raw token is lost after refresh by telling user to regenerate token,
- explain that website verification should be renewed every 6 months.

Do not store raw token in localStorage/sessionStorage unless Owner explicitly approves.

This task should include renewal awareness/copy and any already-available date display. Do not implement cron/scheduler/automatic downgrade if it requires schema/migration or infrastructure not already available.

## E. Email magic link UX

Email flow should:

- send magic link using existing backend endpoint,
- show success message when email sent,
- show honest error if Resend/env is missing or email fails,
- keep user in `PENDING`/review state until verification callback succeeds,
- display result when `/api/admin-claim/verify-email` redirects back with success/error params if currently supported.

## F. Profile page integration

If `/profil/saya` has a claim/admin card:

- update it to reflect real admin claim/member state where available,
- keep CTA to `/profil/klaim-admin-desa`,
- avoid duplicate or conflicting CTAs,
- do not expose private email/phone.

If wiring this card would cause scope creep, document it as follow-up, but `/profil/klaim-admin-desa` must be completed.

## G. Invite Admin UI

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

## H. Reusable Hubungi Admin email form

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
- send email using `RESEND_API_KEY`, `RESEND_FROM`, and `CONTACT_EMAIL`,
- do not add screenshot storage or attachment storage,
- do not auto-suspend or auto-punish anyone.

Implementation options:

- Add a small API route for contact-admin email if no suitable route exists.
- Reuse existing Resend setup with `RESEND_API_KEY` and `RESEND_FROM`.
- Send to `CONTACT_EMAIL`.
- Include user email as reply-to only if safely available or explicitly provided.

Browser QA:

- form renders,
- required validation works,
- send success state works,
- send failure state works,
- evidence URL/text is included in email body,
- no private data is exposed.

## I. Minimal anti-spam / rate-limit posture

Keep rate-limit/anti-spam lightweight and dependency-free.

Minimum options:

- disable submit button while sending,
- prevent immediate duplicate submit on client,
- validate subject/description length,
- reject empty/too-long contact form payload,
- if trivial, add simple server-side cooldown using existing DB/user/timestamp data.

Do not add a new rate-limit dependency in this task.

## J. Browser E2E QA without adding Playwright

Run browser/manual E2E QA directly. Do not add Playwright or any new dependency in this task.

Browser flows to test:

1. Unauthenticated user attempts to access/submit claim.
2. Authenticated user opens `/profil/klaim-admin-desa`.
3. User submits claim for a valid desa.
4. User is blocked from claiming a second desa if already active elsewhere.
5. User selects email verification and triggers magic link.
6. User selects website token verification and generates token.
7. User checks website token and sees success/failure state.
8. Unsafe/private website URL is rejected or reported safely.
9. API error state displays cleanly.
10. Refresh/revisit page shows persisted claim/status correctly where supported.
11. Verified/allowed admin can invite another admin, or blocked state is shown if not eligible.
12. Invite accept redirect result is shown if reachable.
13. Hubungi Admin form validates and sends/fails honestly.
14. Mobile layout remains usable.

If full email delivery cannot be tested in local/staging, report the exact reason and test the reachable fallback/dev path honestly.

## K. Screenshots / UI evidence

Because this task changes UI, screenshots are required.

Capture before/after desktop and mobile screenshots or clear screenshot notes for:

- `/profil/saya` if changed,
- `/profil/klaim-admin-desa` initial state,
- claim submitted state,
- email method state,
- website token generated state,
- website token check result state,
- one-user-one-desa blocked state if practical,
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
- Keep anti-spam/rate-limit lightweight and dependency-free.

## Acceptance criteria

1. `/profil/klaim-admin-desa` can submit a real claim from UI.
2. UI and/or API enforce one-user-one-desa active claim/member rule.
3. UI can trigger real email magic link endpoint.
4. UI can trigger real website token generation endpoint.
5. UI can trigger real website token check endpoint.
6. UI explains website verification renewal awareness for 6 months.
7. UI displays loading/success/error states clearly.
8. UI displays claim/admin status from real backend state where available.
9. Invite Admin UI can trigger real invite endpoint or clearly explain why user is not eligible.
10. Invite accept redirect result is surfaced if reachable.
11. Reusable Hubungi Admin component exists and can send a contact/report email to `CONTACT_EMAIL`.
12. Fake Admin Report UI is not implemented in this task.
13. Browser QA covers happy path, error path, unsafe URL path, one-user-one-desa path, invite path, Hubungi Admin path, and refresh/revisit behavior.
14. Mobile and desktop UI remain usable.
15. Screenshots/notes are captured locally, reported, and then cleaned up locally after push/handoff.
16. Only one new env name is introduced: `CONTACT_EMAIL`.
17. No new dependency is introduced.
18. No public verified data is activated.
19. No screenshot storage or Supabase bucket is introduced.
20. Quality gate is reported.

## Final handoff report format

```text
Task: Sprint 04-007 Admin Claim UI Integration & Browser E2E QA
Status: PASS / PARTIAL_PASS / BLOCKED / REWORK
Batches/flows completed:
- submit claim UI:
- one-user-one-desa rule:
- email magic link UI:
- website token generation UI:
- website token check UI:
- website renewal awareness:
- status panel/profile integration:
- invite admin UI:
- invite accept result UI:
- Hubungi Admin reusable form:
- browser E2E QA:
Env used:
- RESEND_API_KEY:
- RESEND_FROM:
- AUTH_URL:
- CONTACT_EMAIL:
- other new env introduced: YES/NO
Tests/QA:
- tests added/updated:
- browser flows tested:
- unauthenticated case:
- API error case:
- unsafe URL case:
- one-user-one-desa case:
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
- lightweight anti-spam only:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

## Chat instruction rule

Do not assign this task until Owner says OK/gas/approve.

When assigning after approval, keep the instruction short:

```text
Ujang, pull latest main dan kerjakan task BMAD: docs/bmad/tasks/sprint-04-007-admin-claim-ui-integration-browser-e2e-qa.md
```

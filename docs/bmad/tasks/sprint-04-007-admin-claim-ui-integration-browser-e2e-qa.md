# Sprint 04-007 — Admin Claim UI Integration & Browser E2E QA

Date: 2026-04-29
Status: draft-refinement / pending-owner-final-approval
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner is still refining scope. Do not instruct Ujang until Owner explicitly says OK/gas/approve.

## Purpose

Connect the completed Sprint 04-006 admin-claim service layer to the user-facing profile/admin-claim UI and verify the end-to-end user journey in browser.

Sprint 04-006 completed the backend/API/service layer. Sprint 04-007 focuses on making the claim admin feature usable and testable from the browser.

Because the scope is now larger, this task is split into two structured execution batches:

1. **04-007A — Core Claim Browser Flow**
2. **04-007B — Completion UX, Invite, Hubungi Admin, and Browser QA**

This split keeps the work sequential and reviewable without losing the full admin-claim user-facing scope.

## Current status

- Draft only.
- Do not assign to Ujang yet.
- Do not execute until Owner explicitly says OK/gas/approve.

## Ownership

- PIC after approval: Ujang
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

Sprint 04-006 also added admin claim helpers for audit events, token generation/hash/expiry, website token checking, status transitions, and admin claim email service.

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
10. The 10 user-facing admin-claim completeness items should be included in 04-007, but split into 04-007A and 04-007B so the work remains structured.

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
- resend/regenerate behavior,
- invite permission and max-admin behavior where reachable,
- Hubungi Admin form validation and send states,
- no public data verified activation.

Do not rely only on visual manual testing if a helper or behavior can be covered with Vitest.

---

# Batch 04-007A — Core Claim Browser Flow

## Goal

Make the main claim admin flow usable from the browser up to successful claim submission and verification method operation.

This batch must be completed before 04-007B starts.

## Scope A1 — Claim eligibility check before form is active

Required behavior:

- detect whether user is logged in,
- detect whether user already has an active claim/member,
- prevent claiming a second desa when user already represents another active desa,
- validate selected desa before allowing submit,
- show clear blocked state when user is not eligible.

One-user-one-desa rule:

- user may manage/represent only one desa,
- active statuses include at least `PENDING`, `LIMITED`, and `VERIFIED`,
- do not add claim history UI.

If enforcing this requires schema/migration, stop and ask Owner.

## Scope A2 — Wire `/profil/klaim-admin-desa` to real admin-claim APIs

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

## Scope A3 — Core UI states

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
- generic API failure.

Copy must stay demo-safe and trust-safe.

Important wording:

- `VERIFIED` admin membership must not be written as verified public data.
- Public village data must not appear verified because a user/admin claim was verified.

## Scope A4 — Website token UX and 6-month renewal awareness

After token generation:

- display raw token only in the active UI session,
- show placement instruction clearly,
- tell user that token should be placed on the official village website,
- allow user to trigger check token while raw token is still available,
- handle the case where raw token is lost after refresh by telling user to regenerate token,
- explain that website verification should be renewed every 6 months.

Do not store raw token in localStorage/sessionStorage unless Owner explicitly approves.

This batch includes renewal awareness/copy and any already-available date display. Do not implement cron/scheduler/automatic downgrade if it requires schema/migration or infrastructure not already available.

## Scope A5 — Email magic link UX

Email flow should:

- send magic link using existing backend endpoint,
- show success message when email sent,
- show honest error if Resend/env is missing or email fails,
- keep user in `PENDING`/review state until verification callback succeeds,
- display result when `/api/admin-claim/verify-email` redirects back with success/error params if currently supported.

## Scope A6 — Profile page integration / admin status badge / admin access CTA

If `/profil/saya` has a claim/admin card:

- update it to reflect real admin claim/member state where available,
- keep CTA to `/profil/klaim-admin-desa`,
- avoid duplicate or conflicting CTAs,
- show admin membership status badge distinct from public data status,
- add a clear next-step CTA after success, such as entering the Admin Desa area or continuing setup,
- do not expose private email/phone.

Badge wording should be admin-membership-specific, for example:

- `Admin pending`,
- `Admin terbatas`,
- `Admin terverifikasi`.

Do not use wording that implies public village data is verified.

## Scope A7 — Browser QA for 04-007A

Browser flows to test in this batch:

1. Unauthenticated user attempts to access/submit claim.
2. Authenticated user opens `/profil/klaim-admin-desa`.
3. Eligibility state appears before form action.
4. User submits claim for a valid desa.
5. User is blocked from claiming a second desa if already active elsewhere.
6. User selects email verification and triggers magic link.
7. User selects website token verification and generates token.
8. User checks website token and sees success/failure state.
9. Unsafe/private website URL is rejected or reported safely.
10. API error state displays cleanly.
11. Mobile layout remains usable.

## Acceptance criteria for 04-007A

1. `/profil/klaim-admin-desa` can submit a real claim from UI.
2. UI and/or API enforce one-user-one-desa active claim/member rule.
3. UI can trigger real email magic link endpoint.
4. UI can trigger real website token generation endpoint.
5. UI can trigger real website token check endpoint.
6. UI explains website verification renewal awareness for 6 months.
7. UI displays loading/success/error states clearly.
8. UI displays claim/admin status from real backend state where available.
9. Admin membership badge is visually/copy-wise distinct from public data verification.
10. Admin access/next-step CTA exists after a successful state where appropriate.
11. No public verified data is activated.

---

# Batch 04-007B — Completion UX, Invite, Hubungi Admin, and Browser QA

## Goal

Complete the user-facing admin claim experience after the core browser flow works.

This batch adds recovery/resume behavior, invite UI, Hubungi Admin, and fuller browser QA.

## Scope B1 — Current claim loader / resume flow

If user already has a claim/member, the page should resume from current backend state instead of restarting from zero.

Required behavior:

- existing `PENDING` claim displays current status,
- previously selected method is reflected where possible,
- already generated email/token state is represented without exposing raw token,
- if raw website token is lost after refresh, user is told to regenerate,
- `LIMITED` and `VERIFIED` states show appropriate next step.

No claim history UI is needed because one user can only claim one desa.

## Scope B2 — Resend / regenerate token flow

Support recovery for lost or expired verification attempts:

- resend email magic link,
- regenerate website token,
- warn that old token becomes invalid where applicable,
- display loading/success/error state,
- avoid unlimited rapid resend/regenerate.

This must remain lightweight and dependency-free.

## Scope B3 — Claim method switch

Allow user to switch between verification methods when appropriate:

- email to website token,
- website token to email,
- update method through existing service behavior if supported,
- preserve audit trail via backend service,
- show clear copy that previous token/method may no longer be active.

If backend does not safely support switching methods, document as blocker/follow-up instead of forcing unsafe behavior.

## Scope B4 — Claim status timeline sederhana

Add a simple timeline for the active claim only.

Possible states:

- claim created,
- method selected,
- email sent / website token generated,
- verification success/failure,
- current membership status.

Use existing status/audit data where readily available. If an audit timeline API is required and would be too large, implement a derived/simple timeline from current claim state and document the limitation.

Do not create a full audit viewer. Full audit viewer belongs to internal admin backlog.

## Scope B5 — Invite Admin UI

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
- Do not create a full invite management dashboard in this task.

## Scope B6 — Reusable Hubungi Admin email form

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

## Scope B7 — Minimal anti-spam / rate-limit posture

Keep rate-limit/anti-spam lightweight and dependency-free.

Minimum options:

- disable submit button while sending,
- prevent immediate duplicate submit on client,
- validate subject/description length,
- reject empty/too-long contact form payload,
- if trivial, add simple server-side cooldown using existing DB/user/timestamp data.

Do not add a new rate-limit dependency in this task.

## Scope B8 — Browser QA test-data notes

Handoff must include non-sensitive QA notes:

- test account type used,
- test desa identifier/name,
- verification method tested,
- starting status,
- ending status,
- email path tested or reason skipped,
- website token path tested or reason skipped,
- invite path tested or reason skipped,
- Hubungi Admin tested or reason skipped.

Do not commit secrets, raw tokens, private email/phone, or screenshots.

## Scope B9 — Browser QA for 04-007B

Browser flows to test in this batch:

1. Refresh/revisit page shows persisted claim/status correctly where supported.
2. Lost raw token after refresh shows regenerate path.
3. Email resend works or fails honestly.
4. Website token regenerate works or fails honestly.
5. Method switch works safely or is clearly blocked.
6. Timeline shows current claim progress.
7. Verified/allowed admin can invite another admin, or blocked state is shown if not eligible.
8. Invite accept redirect result is shown if reachable.
9. Hubungi Admin form validates and sends/fails honestly.
10. Mobile layout remains usable.

## Acceptance criteria for 04-007B

1. Existing/current claim flow resumes from backend state.
2. Resend/regenerate behavior exists or is explicitly blocked with clear reason.
3. Method switching works safely or is documented as not supported.
4. Active claim timeline/simple progress indicator exists.
5. Invite Admin UI can trigger real invite endpoint or clearly explain why user is not eligible.
6. Invite accept redirect result is surfaced if reachable.
7. Reusable Hubungi Admin component exists and can send a contact/report email to `CONTACT_EMAIL`.
8. Hubungi Admin does not auto-punish, auto-suspend, or create public accusation states.
9. Browser QA covers invite path, Hubungi Admin path, resume path, and regeneration path.
10. No new dependency is introduced.

---

# Shared quality gate

Run after each batch if practical, and always at final handoff:

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

# Screenshots / UI evidence

Because this task changes UI, screenshots or clear screenshot notes are required.

Capture before/after desktop and mobile screenshots or notes for:

- `/profil/saya` if changed,
- `/profil/klaim-admin-desa` initial state,
- eligibility/blocked state,
- claim submitted state,
- email method state,
- website token generated state,
- website token check result state,
- resume/regenerate state,
- timeline state,
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

# Out of scope

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

# Guardrails

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

# Final acceptance criteria

1. 04-007A acceptance criteria pass.
2. 04-007B acceptance criteria pass or any partial item is clearly reported as blocked with reason.
3. Only one new env name is introduced: `CONTACT_EMAIL`.
4. No new dependency is introduced.
5. No public verified data is activated.
6. No screenshot storage or Supabase bucket is introduced.
7. Quality gate is reported.
8. Browser QA notes and local screenshot cleanup status are reported.

# Final handoff report format

```text
Task: Sprint 04-007 Admin Claim UI Integration & Browser E2E QA
Status: PASS / PARTIAL_PASS / BLOCKED / REWORK
Batch 04-007A:
- eligibility check:
- submit claim UI:
- email magic link UI:
- website token generation UI:
- website token check UI:
- website renewal awareness:
- status badge/profile integration:
- admin access CTA:
- browser QA A:
Batch 04-007B:
- resume current claim flow:
- resend/regenerate flow:
- method switch:
- claim timeline:
- invite admin UI:
- invite accept result UI:
- Hubungi Admin reusable form:
- anti-spam lite:
- browser QA B:
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
- resume/regenerate path:
- invite path:
- Hubungi Admin path:
- test data notes:
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

# Chat instruction rule

Do not assign this task until Owner says OK/gas/approve.

When assigning after approval, keep the instruction short:

```text
Ujang, pull latest main dan kerjakan task BMAD: docs/bmad/tasks/sprint-04-007-admin-claim-ui-integration-browser-e2e-qa.md
```

# Sprint 04-007B — Admin Claim Completion UX, Invite, Hubungi Admin, Guide/FAQ, and Browser QA

Date: 2026-04-29
Status: draft-refinement / pending-owner-final-approval
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner requested Sprint 04-007 be split into 04-007A and 04-007B. Do not instruct Ujang until Owner explicitly says OK/gas/approve.

## Purpose

Complete the user-facing admin claim experience after the core browser flow in Sprint 04-007A works.

This document covers recovery/resume UX, resend/regenerate behavior, method switch, active claim timeline, Invite Admin UI, reusable Hubungi Admin form, Admin Desa guide/FAQ, browser QA, caching/freshness, screenshots, and final handoff.

## Execution dependency

Do not start 04-007B until 04-007A is completed or explicitly approved by Owner to continue.

04-007B depends on:

- core claim submit UI,
- email magic link UI,
- website token generation/check UI,
- one-user-one-desa rule,
- profile/status badge basics,
- caching/freshness approach from 04-007A.

## Related documents

Read in this order after Owner approval:

1. `docs/bmad/tasks/sprint-04-007-admin-claim-ui-integration-browser-e2e-qa.md` — index/overview
2. `docs/bmad/tasks/sprint-04-007a-admin-claim-core-browser-flow.md` — execute first
3. `docs/bmad/tasks/sprint-04-007b-admin-claim-completion-ux-invite-contact-browser-qa.md` — execute after 04-007A
4. `docs/bmad/checklists/admin-desa-zero-bug-readiness-checklist.md` — mandatory zero-bug readiness checklist
5. `docs/bmad/tasks/sprint-04-006-consolidated-quality-data-trust-batch.md`
6. `docs/bmad/reports/sprint-04-006-handoff-report.md`
7. `docs/bmad/tasks/sprint-04-004-admin-claim-verification-services-batch.md`

## Ownership

- PIC after approval: Ujang
- Reviewer: Rangga
- Gate owner: Iwan/Owner
- Asep: not assigned unless Owner opens a separate task

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

## Owner decisions captured for 04-007B

1. One user may manage/represent only one desa.
2. Claim history is not needed because each user can only claim one desa.
3. Website verification should be renewed every 6 months.
4. Full automatic 6-month downgrade/scheduler is not required in this task unless already possible without schema/migration.
5. Manual support review flow is not needed in this task because website verification exists.
6. Internal admin features are moved to a later internal-admin batch.
7. Public admin list per desa is not needed.
8. Fake Admin Report UI is not needed; use Hubungi Admin instead.
9. Rate-limit/anti-spam should be minimal and lightweight, without new dependency.
10. Full QA must pass before handoff; ESLint must not fail.
11. UI changes require browser testing and desktop/mobile screenshots or screenshot notes.
12. Caching/freshness must be checked so claim/admin status is not stale after actions.
13. Only `VERIFIED` Admin Desa may invite another admin.
14. Invited admin starts as `LIMITED` after accepting invite.
15. Admin Desa needs complete guide and FAQ so rules are clear.
16. Zero-bug readiness checklist is mandatory and must be reported in handoff.

## Engineering standards — mandatory

Developer must not only make the UI work. The implementation must follow clean-code and maintainability standards.

### TDD-first / test-first

For every new behavior or changed behavior:

1. Write or update tests first where practical.
2. If a browser-only behavior cannot be covered by Vitest, write explicit browser QA cases before coding and report them in handoff.
3. Tests/QA must cover happy path, invalid input, unauthenticated access, unauthorized/ownership mismatch, API error state, loading/success/error UI, token expired/invalid states where reachable, resend/regenerate behavior, invite permission and max-admin behavior, Hubungi Admin validation and send states, guide/FAQ visibility, zero-bug readiness checklist, and no public data verified activation.
4. Do not mark 04-007B PASS if the main changed behavior has neither automated test nor explicit browser QA evidence.

### SOLID / separation of concerns

Implementation must keep responsibilities separated:

- UI components render state and user interactions only.
- API calling logic should live in a small typed client/helper or clearly isolated hook, not scattered across multiple JSX blocks.
- State orchestration should be in a focused hook when the wizard state becomes complex.
- Validation/parsing should be centralized where practical.
- Status/copy mapping should be centralized so wording does not drift between profile card, wizard, timeline, invite UI, Hubungi Admin, guide/FAQ, and status panel.
- Reusable components must not import page-specific data directly.

Avoid one giant component, duplicated fetch/error handling across resend/regenerate/invite/Hubungi Admin flows, arbitrary string status comparisons spread across components, hidden side effects inside render logic, and client-side trust decisions that should belong to server/API.

Suggested boundaries, if consistent with current codebase:

```text
components/admin-claim/AdminClaimTimeline.tsx
components/admin-claim/AdminInviteForm.tsx
components/admin-claim/AdminDesaGuide.tsx
components/admin-claim/AdminDesaFAQ.tsx
components/support/ContactAdminForm.tsx
hooks/use-admin-claim-flow.ts
lib/admin-claim/client.ts
lib/admin-claim/ui-copy.ts
lib/support/contact-admin-client.ts
```

### Reusable Hubungi Admin component rules

`ContactAdminForm` / Hubungi Admin must be reusable:

- accept props for context/source page where needed,
- not hardcode only the claim page,
- not hardcode private recipient in component code,
- use approved `CONTACT_EMAIL` server-side only,
- never expose `CONTACT_EMAIL` as a public requirement unless already safe,
- support subject, description, evidence/bukti, send state,
- support validation and user-friendly error messages.

### Caching and freshness — mandatory

Admin claim UI must not show stale status after user actions.

Requirements:

- ensure current claim state is fresh after resume, resend, regenerate, method switch, invite action, invite accept redirect, and Hubungi Admin send,
- use the project-appropriate Next.js pattern such as dynamic rendering, `router.refresh()`, cache revalidation, or no-store fetch where needed,
- do not globally disable caching across unrelated public pages just to fix admin claim state,
- do not cache raw tokens,
- do not persist raw website token in localStorage/sessionStorage,
- document in handoff what caching/freshness approach was used.

Caching QA must include:

- refresh/revisit page shows updated current claim state,
- stale status is not shown after method switch or regeneration,
- invite action does not require hard reload to show result if UI is expected to update,
- Hubungi Admin send state does not create stale claim state,
- guide/FAQ does not display stale or contradictory admin rules,
- build/SSR remains safe.

### Type safety, React, error handling, clean code, privacy

- Avoid `any` unless there is no reasonable alternative and explain why.
- Define request/response types for client calls where practical.
- Treat API response errors as typed states, not only generic `catch` messages.
- Follow React Hooks rules.
- Avoid unnecessary `useEffect` state synchronization loops.
- Keep server-only logic out of client components.
- Do not expose env secrets to client.
- Do not put raw tokens into localStorage/sessionStorage unless Owner explicitly approves.
- Every API action must have loading, success, and failure UI.
- Never fake success if API/email/env fails.
- Remove unused imports, unused variables, and unused local helper functions introduced by this task.
- Do not mass-disable ESLint rules.
- Final `npm run lint` must pass.
- Do not expose private email/phone.
- Do not log raw token or secrets.
- Do not put private data in screenshots or committed docs.
- Hubungi Admin must not create public accusation states.

---

# Scope B1 — Current claim loader / resume flow

If user already has a claim/member, the page should resume from current backend state instead of restarting from zero.

Required behavior:

- existing `PENDING` claim displays current status,
- previously selected method is reflected where possible,
- already generated email/token state is represented without exposing raw token,
- if raw website token is lost after refresh, user is told to regenerate,
- `LIMITED` and `VERIFIED` states show appropriate next step.

No claim history UI is needed because one user can only claim one desa.

# Scope B2 — Resend / regenerate token flow

Support recovery for lost or expired verification attempts:

- resend email magic link,
- regenerate website token,
- warn that old token becomes invalid where applicable,
- display loading/success/error state,
- avoid unlimited rapid resend/regenerate.

This must remain lightweight and dependency-free.

TDD/QA minimum:

- lost raw token state shows regenerate guidance,
- resend email success/failure state,
- regenerate website token success/failure state,
- duplicate rapid submit is prevented or handled safely.

# Scope B3 — Claim method switch

Allow user to switch between verification methods when appropriate:

- email to website token,
- website token to email,
- update method through existing service behavior if supported,
- preserve audit trail via backend service,
- show clear copy that previous token/method may no longer be active.

If backend does not safely support switching methods, document as blocker/follow-up instead of forcing unsafe behavior.

# Scope B4 — Claim status timeline sederhana

Add a simple timeline for the active claim only.

Possible states:

- claim created,
- method selected,
- email sent / website token generated,
- verification success/failure,
- current membership status.

Use existing status/audit data where readily available. If an audit timeline API is required and would be too large, implement a derived/simple timeline from current claim state and document the limitation.

Do not create a full audit viewer. Full audit viewer belongs to internal admin backlog.

# Scope B5 — Invite Admin UI — VERIFIED admin only

Add browser-usable UI for the existing invite admin service.

Required behavior:

- only `VERIFIED` Admin Desa may invite another admin,
- `LIMITED`, `PENDING`, unauthenticated, and non-admin users must not be able to invite,
- if user is not `VERIFIED`, show disabled state or clear explanation instead of hiding all context,
- calls `POST /api/admin-claim/invite`,
- form contains invitee email,
- invitee email may be any valid email address, not limited to official desa domain,
- validates email before send,
- does not allow inviting self,
- does not allow inviting an email/user already admin for that desa,
- does not allow invite if invitee user is already managing another desa, where this can be checked safely,
- displays loading/success/error state,
- explains max 5 admins per desa,
- enforces max 5 admins server-side,
- explains invited admin starts as `LIMITED`, not `VERIFIED`,
- explains inviter/verified admin is responsible for who they invite,
- handles `403` non-verified admin gracefully,
- handles max-admin reached gracefully,
- handles expired/used/invalid invite result gracefully,
- does not expose private user/contact data,
- browser QA covers invite created and blocked states where practical.

Accept invite flow:

- `GET /api/admin-claim/accept-invite` already exists.
- UI should display success/error result if redirected back to `/profil/klaim-admin-desa` with invite query params.
- If invitee is not logged in, flow should guide login/register before approval where supported.
- After valid accept/approve, invitee becomes Admin Desa `LIMITED`.
- Invite token must remain expiry-bound and single-use.
- Do not create a full invite management dashboard in this task.

TDD/QA minimum:

- invalid email rejected,
- non-eligible admin blocked/disabled,
- `LIMITED` admin cannot invite,
- only `VERIFIED` admin can invite,
- invite self blocked,
- invite success state,
- invite API failure state,
- max-admin error state if reachable,
- accept invite success creates/reflects `LIMITED`,
- expired/used invite error state where reachable.

# Scope B6 — Reusable Hubungi Admin email form

Replace Fake Admin Report UI with a reusable Hubungi Admin component.

Purpose:

- Give users a safe way to contact PantauDesa/admin/support when they want to report a fake admin or need help.
- Do not build a Fake Admin Report UI in this task.
- Use email sending, not automatic moderation/suspension.

Component requirements:

- reusable component, not hardcoded only for claim page,
- can be embedded in admin claim page and reused later elsewhere,
- fields: subject, description, evidence/bukti field, send button,
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

TDD/QA minimum:

- required subject/description validation,
- too-long payload rejected,
- send success state,
- send failure state,
- evidence included in email body or request payload,
- no auto-suspend or fake report UI path.

# Scope B7 — Admin Desa guide and FAQ

Add a complete guide and FAQ for Admin Desa so the rules are clear to users.

Placement options:

- within `/profil/klaim-admin-desa`,
- as a reusable `AdminDesaGuide` / `AdminDesaFAQ` component,
- or a linked help section/page if the existing app structure supports it.

The guide must explain at minimum:

1. What Admin Desa is.
2. The difference between Admin Desa membership verification and public data verification.
3. One user can only represent/manage one desa.
4. Verification methods: email magic link and website token.
5. Website token must be placed on the official desa website.
6. Website verification should be renewed every 6 months.
7. What `PENDING`, `LIMITED`, and `VERIFIED` mean.
8. What a `LIMITED` admin can and cannot do.
9. What a `VERIFIED` admin can and cannot do.
10. Only `VERIFIED` Admin Desa can invite another admin.
11. Invited admin starts as `LIMITED`.
12. Max 5 admins per desa.
13. Inviter is responsible for invited admins.
14. Admin Desa verification does not automatically verify all public desa data.
15. Public data/source status still follows review/governance workflow.
16. What to do if email verification fails.
17. What to do if website token is not found.
18. What to do if token expires or raw token is lost.
19. What to do if the user no longer manages the desa.
20. How to contact admin/support via Hubungi Admin.

FAQ must include at minimum:

- Can I manage more than one desa?
- Can I invite anyone as admin?
- Why can only VERIFIED admin invite?
- What happens after someone accepts an invite?
- Why is invited admin only LIMITED?
- Can a LIMITED admin invite others?
- Why is the admin limit 5 people?
- Does verified admin mean desa data is verified?
- Why do I need to renew website verification every 6 months?
- What if I do not have access to the official email?
- What if I do not have access to the official website?
- What if I entered the wrong email invite?
- What if invite link expired?
- What if I suspect fake admin activity?
- How do I contact PantauDesa support?

Guide/FAQ requirements:

- copy must be concise but complete,
- must not overpromise public data verification,
- must not expose private contact data,
- must stay consistent with status badges and invite rules,
- should be reusable or easy to move later,
- desktop and mobile layout must remain readable,
- browser QA must verify guide/FAQ visibility and wording.

# Scope B8 — Minimal anti-spam / rate-limit posture

Keep rate-limit/anti-spam lightweight and dependency-free.

Minimum options:

- disable submit button while sending,
- prevent immediate duplicate submit on client,
- validate subject/description length,
- reject empty/too-long contact form payload,
- if trivial, add simple server-side cooldown using existing DB/user/timestamp data.

Do not add a new rate-limit dependency in this task.

# Scope B9 — Browser QA test-data notes

Handoff must include non-sensitive QA notes:

- test account type used,
- test desa identifier/name,
- verification method tested,
- starting status,
- ending status,
- email path tested or reason skipped,
- website token path tested or reason skipped,
- invite path tested or reason skipped,
- Hubungi Admin tested or reason skipped,
- guide/FAQ checked or reason skipped.

Do not commit secrets, raw tokens, private email/phone, or screenshots.

# Browser QA for 04-007B

Browser flows to test:

1. Refresh/revisit page shows persisted claim/status correctly where supported.
2. Lost raw token after refresh shows regenerate path.
3. Email resend works or fails honestly.
4. Website token regenerate works or fails honestly.
5. Method switch works safely or is clearly blocked.
6. Timeline shows current claim progress.
7. `VERIFIED` admin can invite another admin.
8. `LIMITED` admin cannot invite another admin and sees clear explanation.
9. Invite accept redirect result is shown if reachable.
10. Accepted invitee becomes or is shown as `LIMITED`.
11. Hubungi Admin form validates and sends/fails honestly.
12. Guide/FAQ is visible, readable, and consistent with rules.
13. Caching/freshness: after resume/regenerate/invite/contact actions, UI does not show stale state.
14. Desktop layout remains usable.
15. Mobile layout remains usable.
16. Zero-bug readiness checklist is completed for 04-007B-relevant items.

# Quality gate — must pass

Run before handoff:

```bash
npm run lint
npm run test
npx tsc --noEmit
npx prisma generate
npm run build
```

Hard requirements:

- `npm run lint` must PASS. No ESLint failure is acceptable for handoff.
- `npm run test` must PASS.
- `npx tsc --noEmit` must PASS.
- `npx prisma generate` must PASS.
- `npm run build` must PASS.
- New code must not introduce lint warnings/errors, unused imports, unused variables, hook-rule violations, or type errors.
- Do not mass-disable ESLint rules.

If any command fails, status must be `BLOCKED` or `REWORK`, not PASS.

# Screenshots / UI evidence — desktop and mobile required

Required viewport coverage:

- desktop: at least 1366px or 1440px width,
- mobile: at least one of 360px, 390px, or 414px width.

Capture before/after desktop and mobile screenshots or clear screenshot notes for:

- `/profil/saya` if changed,
- `/profil/klaim-admin-desa` resume/regenerate state,
- timeline state,
- invite admin UI state,
- VERIFIED-only invite disabled/allowed state,
- Hubungi Admin form state,
- Admin Desa guide/FAQ state,
- error state if practical.

Store screenshots locally only in ignored artifact folder:

```text
.artifacts/screenshots/sprint-04-007b/
tmp/screenshots/sprint-04-007b/
```

Do not commit screenshots unless Owner explicitly asks. After code is committed/pushed and screenshot notes are included in handoff, clean up local screenshot artifacts:

```bash
rm -rf .artifacts/screenshots/sprint-04-007b tmp/screenshots/sprint-04-007b
```

# Out of scope

Do not implement in 04-007B:

- 04-007A rework unless required to fix a blocker,
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

# Guardrails

- No public data verified activation.
- Admin membership verification is not public data verification.
- No crawler behavior.
- Website token checker must remain SSRF/private URL safe.
- No private email/phone exposure.
- No admin self-promotion.
- `User.role = DESA` is not proof of verified desa admin.
- Important admin-claim actions must remain audited by service layer.
- No fake success if API/email/env fails.
- Hubungi Admin must not auto-suspend, auto-punish, or create public accusation states.
- Keep anti-spam/rate-limit lightweight and dependency-free.
- Only `VERIFIED` Admin Desa may invite another admin.
- Accepted invitee must start as `LIMITED` unless Owner later approves a different policy.

# Acceptance criteria for 04-007B

1. Existing/current claim flow resumes from backend state.
2. Resend/regenerate behavior exists or is explicitly blocked with clear reason.
3. Method switching works safely or is documented as not supported.
4. Active claim timeline/simple progress indicator exists.
5. Invite Admin UI allows only `VERIFIED` Admin Desa to invite.
6. Invite Admin UI blocks `LIMITED`/non-verified admin with a clear explanation.
7. Invite Admin UI can trigger real invite endpoint for eligible `VERIFIED` admin.
8. Invite accept redirect result is surfaced if reachable.
9. Accepted invitee starts as `LIMITED`.
10. Reusable Hubungi Admin component exists and can send a contact/report email to `CONTACT_EMAIL`.
11. Hubungi Admin does not auto-punish, auto-suspend, or create public accusation states.
12. Admin Desa guide and FAQ exist and explain rules clearly.
13. Browser QA covers invite path, Hubungi Admin path, guide/FAQ path, resume path, and regeneration path.
14. No new dependency is introduced.
15. Relevant TDD/QA evidence exists for changed behavior.
16. Code follows the Engineering standards section above.
17. Caching/freshness behavior is verified for resume/regenerate/invite/contact states.
18. Desktop and mobile UI are tested and screenshot evidence/notes are reported.
19. Full quality gate passes.
20. ESLint has no failure at handoff.
21. Zero-bug readiness checklist is completed and reported.

# 04-007B handoff report format

```text
Task: Sprint 04-007B Admin Claim Completion UX, Invite, Hubungi Admin, Guide/FAQ, and Browser QA
Status: PASS / PARTIAL_PASS / BLOCKED / REWORK
Scope completed:
- resume current claim flow:
- resend/regenerate flow:
- method switch:
- claim timeline:
- VERIFIED-only invite admin UI:
- invite accept result UI:
- accepted invitee starts LIMITED:
- Hubungi Admin reusable form:
- Admin Desa guide:
- Admin Desa FAQ:
- anti-spam lite:
- caching/freshness B:
- browser QA B:
Engineering standards:
- TDD/test-first evidence:
- SOLID/separation of concerns:
- typed API client/hooks:
- reusable components:
- clean error handling:
- unused imports/dead code introduced by task removed:
Env used:
- RESEND_API_KEY:
- RESEND_FROM:
- AUTH_URL:
- CONTACT_EMAIL:
- other new env introduced: YES/NO
Tests/QA:
- tests added/updated:
- browser flows tested:
- resume/regenerate path:
- invite path:
- VERIFIED-only invite gate:
- Hubungi Admin path:
- guide/FAQ path:
- test data notes:
Quality gate:
- npm run lint: PASS/FAIL
- npm run test: PASS/FAIL
- npx tsc --noEmit: PASS/FAIL
- npx prisma generate: PASS/FAIL
- npm run build: PASS/FAIL
UI evidence:
- desktop before screenshots/notes:
- desktop after screenshots/notes:
- mobile before screenshots/notes:
- mobile after screenshots/notes:
- screenshot folder:
- local screenshot cleanup after push/handoff: DONE / NOT_DONE / SKIPPED_WITH_REASON
Caching/freshness:
- route/page caching checked:
- router.refresh/revalidation/no-store approach:
- stale status after actions: YES/NO
Zero-bug readiness:
- duplicate submit/idempotency checked:
- multi-tab/stale cache checked:
- unauthorized direct API checked:
- token expiry/reuse checked:
- email failure behavior checked:
- invite edge cases checked:
- public data verified not activated:
- private data/token/secret leakage checked:
- desktop/mobile QA checked:
- screenshot cleanup done:
- known residual risks:
Security/trust checks:
- no public data verified activation:
- no private exposure:
- no fake success:
- SSRF guard still respected:
- no fake admin report UI:
- Hubungi Admin sends email only:
- lightweight anti-spam only:
- only VERIFIED admin can invite:
- invitee starts LIMITED:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

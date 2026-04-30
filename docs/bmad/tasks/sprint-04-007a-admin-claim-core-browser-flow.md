# Sprint 04-007A — Admin Claim Core Browser Flow

Date: 2026-04-29
Status: draft-refinement / pending-owner-final-approval
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner requested Sprint 04-007 be split into 04-007A and 04-007B. Do not instruct Ujang until Owner explicitly says OK/gas/approve.

## Purpose

Make the main admin-claim flow usable from the browser up to successful claim submission and verification method operation.

This is the first execution document for Sprint 04-007. It must be completed before `sprint-04-007b-admin-claim-completion-ux-invite-contact-browser-qa.md` starts.

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

## Existing env usage

Use existing env for auth/email base:

```text
AUTH_URL
RESEND_API_KEY
RESEND_FROM
```

`CONTACT_EMAIL=cs@pantaudesa.id` is approved for 04-007B Hubungi Admin work, but 04-007A should not need to use it unless shared setup touches env validation.

Rules:

- Do not add any new env var in 04-007A.
- Do not add `NEXT_PUBLIC_APP_URL`, `EMAIL_FROM`, `RESEND_FROM_EMAIL`, `SUPPORT_EMAIL`, `NEXT_PUBLIC_SUPPORT_EMAIL`, or `CS_EMAIL`.

## Owner decisions captured for 04-007A

1. One user may manage/represent only one desa.
2. Claim history is not needed because each user can only claim one desa.
3. Website verification should be renewed every 6 months.
4. Full automatic 6-month downgrade/scheduler is not required in this task unless already possible without schema/migration.
5. Manual support review flow is not needed in this task because website verification exists.
6. Public admin list per desa is not needed.
7. Full QA must pass before handoff; ESLint must not fail.
8. UI changes require browser testing and desktop/mobile screenshots or screenshot notes.
9. Caching/freshness must be checked so claim/admin status is not stale after actions.
10. Zero-bug readiness checklist is mandatory and must be reported in handoff.

## Engineering standards — mandatory

Developer must not only make the UI work. The implementation must follow clean-code and maintainability standards.

### TDD-first / test-first

For every new behavior or changed behavior:

1. Write or update tests first where practical.
2. If a browser-only behavior cannot be covered by Vitest, write explicit browser QA cases before coding and report them in handoff.
3. Tests/QA must cover happy path, invalid input, unauthenticated access, unauthorized/ownership mismatch, API error state, loading/success/error UI, token expired/invalid states where reachable, one-user-one-desa rule, zero-bug readiness checklist, and no public data verified activation.
4. Do not mark 04-007A PASS if the main changed behavior has neither automated test nor explicit browser QA evidence.

### SOLID / separation of concerns

Implementation must keep responsibilities separated:

- UI components render state and user interactions only.
- API calling logic should live in a small typed client/helper or clearly isolated hook, not scattered across multiple JSX blocks.
- State orchestration should be in a focused hook when the wizard state becomes complex.
- Validation/parsing should be centralized where practical.
- Status/copy mapping should be centralized so wording does not drift between profile card, wizard, and status panel.
- Reusable components must not import page-specific data directly.

Avoid one giant component, duplicated fetch/error handling, arbitrary string status comparisons spread across components, hidden side effects inside render logic, and client-side trust decisions that should belong to server/API.

Suggested boundaries, if consistent with the current codebase:

```text
components/admin-claim/AdminClaimWizard.tsx
components/admin-claim/AdminClaimStatusPanel.tsx
components/admin-claim/AdminClaimEligibilityNotice.tsx
components/admin-claim/AdminClaimVerificationMethod.tsx
hooks/use-admin-claim-flow.ts
lib/admin-claim/client.ts
lib/admin-claim/ui-copy.ts
```

### Caching and freshness — mandatory

Admin claim UI must not show stale status after user actions.

Requirements:

- identify any route/page/component that may be statically cached or use cached data for profile/admin claim state,
- ensure `/profil/klaim-admin-desa` and relevant profile claim/admin state are fresh after submit, token generation, token check, and email verify redirect,
- use the project-appropriate Next.js pattern such as dynamic rendering, `router.refresh()`, cache revalidation, or no-store fetch where needed,
- do not globally disable caching across unrelated public pages just to fix admin claim state,
- do not cache raw tokens,
- do not persist raw website token in localStorage/sessionStorage,
- document in handoff what caching/freshness approach was used.

Caching QA must include:

- submit claim then refresh/revisit page shows updated state,
- verify/check token then page reflects new status,
- stale status is not shown after token generation/check,
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
- Keep website token SSRF/private URL guard intact.

---

# Scope A1 — Claim eligibility check before form is active

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

TDD/QA minimum:

- unauthenticated user is blocked or redirected safely,
- user with no active claim can proceed,
- user with active claim/member for one desa cannot claim a second desa,
- invalid desa is rejected,
- blocked state copy is visible in browser.

# Scope A2 — Wire `/profil/klaim-admin-desa` to real admin-claim APIs

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

TDD/QA minimum:

- submit success path,
- submit API failure path,
- email token success/failure path,
- website token generation success/failure path,
- website token check success/not-found/blocked path where practical.

# Scope A3 — Core UI states

Implement clear user-facing states for idle, loading, submit success, email sent, email env missing/email failed, website token generated, website token check success, website token not found, website check blocked/unsafe URL, pending review, limited admin, verified admin membership, already managing another desa, and generic API failure.

Copy must stay demo-safe and trust-safe.

Important wording:

- `VERIFIED` admin membership must not be written as verified public data.
- Public village data must not appear verified because a user/admin claim was verified.

# Scope A4 — Website token UX and 6-month renewal awareness

After token generation:

- display raw token only in the active UI session,
- show placement instruction clearly,
- tell user that token should be placed on the official village website,
- allow user to trigger check token while raw token is still available,
- handle the case where raw token is lost after refresh by telling user to regenerate token,
- explain that website verification should be renewed every 6 months.

Do not store raw token in localStorage/sessionStorage unless Owner explicitly approves.

This batch includes renewal awareness/copy and any already-available date display. Do not implement cron/scheduler/automatic downgrade if it requires schema/migration or infrastructure not already available.

# Scope A5 — Email magic link UX

Email flow should:

- send magic link using existing backend endpoint,
- show success message when email sent,
- show honest error if Resend/env is missing or email fails,
- keep user in `PENDING`/review state until verification callback succeeds,
- display result when `/api/admin-claim/verify-email` redirects back with success/error params if currently supported.

# Scope A6 — Profile page integration / admin status badge / admin access CTA

If `/profil/saya` has a claim/admin card:

- update it to reflect real admin claim/member state where available,
- keep CTA to `/profil/klaim-admin-desa`,
- avoid duplicate or conflicting CTAs,
- show admin membership status badge distinct from public data status,
- add a clear next-step CTA after success, such as entering the Admin Desa area or continuing setup,
- do not expose private email/phone.

Badge wording should be admin-membership-specific, for example `Admin pending`, `Admin terbatas`, or `Admin terverifikasi`. Do not use wording that implies public village data is verified.

# Browser QA for 04-007A

Browser flows to test:

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
11. Caching/freshness: after submit/token/check actions, refresh/revisit reflects the latest state.
12. Desktop layout remains usable.
13. Mobile layout remains usable.
14. Zero-bug readiness checklist is completed for 04-007A-relevant items.

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
- `/profil/klaim-admin-desa` initial state,
- eligibility/blocked state,
- claim submitted state,
- email method state,
- website token generated state,
- website token check result state,
- error state if practical.

Store screenshots locally only in ignored artifact folder:

```text
.artifacts/screenshots/sprint-04-007a/
tmp/screenshots/sprint-04-007a/
```

Do not commit screenshots unless Owner explicitly asks. After code is committed/pushed and screenshot notes are included in handoff, clean up local screenshot artifacts:

```bash
rm -rf .artifacts/screenshots/sprint-04-007a tmp/screenshots/sprint-04-007a
```

# Out of scope

Do not implement in 04-007A:

- 04-007B completion UX work,
- invite admin UI,
- Hubungi Admin,
- claim timeline,
- resend/regenerate recovery,
- method switch,
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
- additional env vars.

# Acceptance criteria for 04-007A

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
12. Relevant TDD/QA evidence exists for changed behavior.
13. Code follows the Engineering standards section above.
14. Caching/freshness behavior is verified for changed admin-claim states.
15. Desktop and mobile UI are tested and screenshot evidence/notes are reported.
16. Full quality gate passes.
17. ESLint has no failure at handoff.
18. Zero-bug readiness checklist is completed and reported.

# 04-007A handoff report format

```text
Task: Sprint 04-007A Admin Claim Core Browser Flow
Status: PASS / PARTIAL_PASS / BLOCKED / REWORK
Scope completed:
- eligibility check:
- submit claim UI:
- email magic link UI:
- website token generation UI:
- website token check UI:
- website renewal awareness:
- status badge/profile integration:
- admin access CTA:
- caching/freshness A:
- browser QA A:
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
- new env introduced: YES/NO
Tests/QA:
- tests added/updated:
- browser flows tested:
- unauthenticated case:
- API error case:
- unsafe URL case:
- one-user-one-desa case:
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
Files changed:
Commit SHA(s):
Known risks/blockers:
```

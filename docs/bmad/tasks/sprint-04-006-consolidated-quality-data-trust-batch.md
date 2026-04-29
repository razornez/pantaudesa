# Sprint 04-006 — Sprint 04 Consolidated Plan: Ujang Single-PIC Execution

Date: 2026-04-29
Status: approved-for-execution / architect-review-waived-by-owner
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner approved execution, waived Software Architect review gate because external access was unstable, and clarified that Sprint 04 execution should be assigned to one executor only.

## Correction from Rangga

Owner clarified these rules:

1. Pick one executor only between Ujang or Asep for this Sprint 04 execution track.
2. Do not split execution between Ujang and Asep unless Owner explicitly opens a separate task later.
3. Do not send long execution instructions in chat.
4. Store the actual instructions in BMAD task docs.
5. Chat instruction to executor should only say to pull latest and work from the BMAD task path.

Decision:

- Sprint 04 execution PIC: **Ujang**.
- Asep: **not assigned for this execution batch**.
- Rangga: BMAD planning/review only, not local executor.

## Purpose

This BMAD task is the single source of truth for Ujang to execute Sprint 04 admin claim work safely and in order.

It consolidates:

- the original Sprint 04-004 admin claim 8 items,
- the Owner's TDD-first rule,
- quality gate expectations,
- guardrails,
- recommended model and reasoning effort,
- single-PIC execution policy.

## Required source docs

Ujang must read:

1. `docs/bmad/tasks/sprint-04-006-consolidated-quality-data-trust-batch.md`
2. `docs/bmad/tasks/sprint-04-004-admin-claim-verification-services-batch.md`
3. `docs/bmad/reviews/sprint-04-003-rangga-rework-review.md`
4. `docs/bmad/reviews/sprint-04-002-rangga-review.md`

## Ownership rule

One task track has one execution PIC only.

- PIC: Ujang.
- Reviewer: Rangga.
- Gate owner: Iwan/Owner for high-risk/security/governance decisions.
- Asep is not assigned in this execution batch.

If a future task needs Asep, Owner must open it separately.

## Recommended model and effort

For Ujang:

```text
Recommended model: Claude Sonnet or GPT-5.1
Reasoning effort: high
```

Use high reasoning because this sprint touches auth, email, token, website verification, SSRF/private URL protection, status transitions, admin membership, audit trail, invite service, fake-admin reporting, and legal/reputation risk.

Escalate/stop and ask Owner if:

- a new dependency is needed,
- Prisma/schema migration is needed beyond existing schema usage,
- verified public data status becomes ambiguous,
- website token checker cannot be made SSRF-safe,
- Resend/env behavior is unclear,
- destructive seed/reset is proposed,
- public/private contact exposure is unclear.

## TDD-first rule from Owner

Every feature or behavior change must be implemented with a TDD-first posture to avoid breaking existing features.

Minimum expectation:

1. Define/write tests or test cases before implementation where practical.
2. Cover happy path, invalid input, unauthenticated/unauthorized access, ownership mismatch, expired/invalid token, and regression risk.
3. Implement only enough to make tests pass.
4. Run focused tests for the changed behavior.
5. Run full quality gate before handoff:

```bash
npm run lint
npm run test
npx tsc --noEmit
npx prisma generate
npm run build
```

6. If UI is touched, capture before/after desktop and mobile screenshots in local ignored artifacts only.

Screenshot folders:

```text
.artifacts/screenshots/sprint-04-006/
tmp/screenshots/sprint-04-006/
```

Do not commit screenshots unless Owner explicitly asks.

## Global guardrails

- No verified activation for public data without governance.
- `VERIFIED` for admin membership must not imply public data is verified.
- No official numeric APBDes extraction without explicit gate.
- No scraper/crawler umum.
- Website token checker may only perform a safe single-page check with SSRF/private URL protection.
- No destructive migration or seed reset without Owner approval.
- No new dependency without Owner approval.
- No read path back to hardcoded fallback.
- No private email/phone exposed.
- No admin self-promotion.
- `User.role = DESA` is not proof of verified village admin.
- All admin claim/invite/report flows must have audit trail.
- Tokens must be hash-only, expiring, and single-use where relevant.
- Demo data must never look official.

---

# Sprint 04 execution scope

Core source:

- `docs/bmad/tasks/sprint-04-004-admin-claim-verification-services-batch.md`

Core items:

1. Send real admin-claim email magic link.
2. Generate real website verification token.
3. Check token on official village website.
4. Submit claim to DB from UI.
5. Update status `PENDING` / `LIMITED` / `VERIFIED` from user action.
6. Write real audit events from claim actions.
7. Implement admin invite service.
8. Implement fake admin report service.

These items may be implemented in compact batches, but no item may be removed or weakened.

## Execution batches

### Batch 0 — Local quality preflight

PIC: Ujang
Recommended model: Claude Sonnet / GPT-5.1 Codex mini
Reasoning effort: medium

Goal:

Stabilize the local quality gate enough so admin claim changes do not hide behind old lint/build failures.

Scope:

- Run and inspect:

```bash
npm run lint
npm run test
npx tsc --noEmit
npx prisma generate
npm run build
```

- Fix blocking lint/build/typecheck issues that prevent meaningful Sprint 04 work.
- Do not mass-disable ESLint rules.
- Do not update Prisma/dependencies without Owner approval.
- If Prisma query engine rename issue appears, document environment, OS, command, and error.

Acceptance:

- Quality gate passes, or blocker is clearly reported with evidence and no risky workaround.

### Batch 1 — Claim submit + audit foundation

PIC: Ujang
Recommended model: Claude Sonnet / GPT-5.1
Reasoning effort: high

Tasks:

- 04-004A Submit claim to DB from UI.
- 04-004F Audit event foundation for claim actions.

Scope:

- Wire `/profil/klaim-admin-desa` to real submit endpoint.
- Require authenticated user.
- Validate desa exists.
- Create or safely update `DesaAdminClaim` for `(userId, desaId)`.
- Initial status: `PENDING`.
- Save method: `OFFICIAL_EMAIL`, `WEBSITE_TOKEN`, or `SUPPORT_REVIEW`.
- Prevent noisy duplicate claims.
- Create audit constants/helper.
- Write audit events such as `CLAIM_STARTED`, `CLAIM_REUSED`, `CLAIM_METHOD_UPDATED`.

TDD minimum:

- public submit blocked,
- authenticated submit succeeds,
- invalid desa rejected,
- duplicate claim is safe,
- audit event is written.

Acceptance:

- Claim submit persists to DB.
- UI reads status from DB after submit.
- Audit helper exists and is used by claim submit.

### Batch 2 — Verification artifact generation

PIC: Ujang
Recommended model: Claude Sonnet / GPT-5.1
Reasoning effort: high

Tasks:

- 04-004B Real admin-claim email magic link.
- 04-004C Generate real website token.

Scope:

- Create dedicated admin-claim email service using Resend.
- Do not reuse NextAuth `signIn("resend")` directly.
- Generate cryptographically random email token.
- Store email token hash only.
- Token expires and is single-use where relevant.
- Send magic link only to allowed official email source.
- Handle missing Resend env as `RESEND_ENV_MISSING`, not fake success.
- Generate website verification token.
- Store website token hash and expiry.
- Show website raw token once in UI.
- Provide safe placement instructions for official desa website.
- Write audit events for email/token generation.

TDD minimum:

- token hash-only persistence,
- raw token is not stored,
- expiry is set,
- missing Resend env reports honestly,
- invalid/expired/used email token fails,
- valid email token can verify admin membership once verification handler exists.

Acceptance:

- Admin claim email helper is separate from NextAuth login provider.
- Website token generation stores hash only and displays raw token once.
- Audit events exist for generated verification artifacts.

### Batch 3 — Verification execution + status transitions

PIC: Ujang
Recommended model: Claude Sonnet / GPT-5.1
Reasoning effort: high

Tasks:

- 04-004D Check token on official village website.
- 04-004E Status transition `PENDING` / `LIMITED` / `VERIFIED`.
- 04-004F Audit events for success/failure transitions.

Scope:

- Implement email token verification callback/route if not completed in Batch 2.
- Implement website token check endpoint.
- Require authenticated user where appropriate.
- Ensure claim belongs to current user.
- Validate token exists and is not expired.
- Validate website URL is allowed and tied to official desa website/domain where possible.
- Fetch only one page safely.
- Reject localhost/private/internal IPs, unsafe schemes, and suspicious redirects.
- Timeout and response-size limit required.
- No crawler/recursive fetch.
- Centralize allowed status transitions.
- Prevent client from setting arbitrary status.
- Prevent user verifying another user's claim.
- Treat `VERIFIED` as admin membership only, not public data verification.
- Write audit for success/failure.

TDD minimum:

- token found verifies admin membership,
- token not found remains pending,
- private URL rejected,
- unsafe scheme rejected,
- expired token rejected,
- user cannot verify another user's claim,
- client cannot set arbitrary status,
- audit events are written.

Acceptance:

- Valid official email token verifies claim/admin membership.
- Valid website token on allowed page verifies claim/admin membership.
- Invalid/private/unsafe paths fail safely.
- Status transitions are server-enforced.

### Batch 4 — Invite admin service

PIC: Ujang
Recommended model: Claude Sonnet / GPT-5.1
Reasoning effort: high

Task:

- 04-004G Invite admin service.

Scope:

- Verified desa admin can invite another admin.
- Enforce max 5 admins per desa.
- Invite token stored hash-only and expires.
- Accept invite creates/updates `DesaAdminMember` as `LIMITED`.
- Send invite email via dedicated admin-claim/invite email helper if env exists.
- Write audit events `INVITE_CREATED`, `INVITE_ACCEPTED`.

TDD minimum:

- verified admin required,
- non-admin invite rejected,
- max 5 admins enforced,
- invite token hash-only and expiring,
- expired/used invite rejected,
- accepted invite creates `LIMITED` membership,
- audit events are written.

Acceptance:

- Invite flow works without granting verified admin automatically.
- Invite service respects max admin limit and ownership.

### Batch 5 — Fake admin report service

PIC: Ujang
Recommended model: Claude Sonnet / GPT-5.1
Reasoning effort: high

Task:

- 04-004H Fake admin report service.

Scope:

- Implement endpoint/service to create `FakeAdminReport`.
- Required: `desaId`, `reason`.
- Optional: `reportedUserId`, `description`, `evidenceUrl`, `reporterEmail`.
- Validate desa exists.
- Validate evidence URL/email if provided.
- Write audit events `FAKE_ADMIN_REPORT_SUBMITTED` and, if relevant, `ADMIN_CLAIM_FLAGGED_BY_PUBLIC`.
- Do not auto-suspend or auto-punish based on report alone.

TDD minimum:

- valid report creates record,
- invalid desa rejected,
- invalid evidence URL rejected,
- audit event is written,
- no auto-suspend occurs.

Acceptance:

- Fake admin report creates DB record and audit only.
- No automatic punishment/suspension is triggered.

---

# Deferred / not assigned in this execution batch

The following are not assigned to Asep or Ujang in this execution batch unless Owner opens a new task:

- broad public read path scalability,
- Voice-to-Desa relation migration,
- broad DataStatus trust sweep,
- NextAuth upgrade,
- Playwright E2E setup,
- branch protection,
- public data `verified` activation,
- GitHub board/label operations,
- Supabase screenshot storage.

Screenshot evidence remains local QA artifact only, not a storage feature.

---

# Final handoff report format for Ujang

Ujang must report back with:

```text
Task: Sprint 04-006 / Sprint 04-004 Admin Claim 8 Items
Status: PASS / PARTIAL_PASS / BLOCKED / REWORK
Model used:
Reasoning effort:
Batches completed:
- Batch 0:
- Batch 1:
- Batch 2:
- Batch 3:
- Batch 4:
- Batch 5:
TDD/tests:
- tests added/updated:
- focused tests:
- regression tests:
Quality gate:
- npm run lint:
- npm run test:
- npx tsc --noEmit:
- npx prisma generate:
- npm run build:
Security checks:
- token hash only:
- token expiry:
- token single-use:
- SSRF/private URL guard:
- no arbitrary status:
- no private exposure:
- audit events:
UI evidence if touched:
- screenshot folder/notes:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

## Chat instruction rule

When assigning this task in chat, keep the instruction short:

```text
Ujang, pull latest main dan kerjakan task BMAD: docs/bmad/tasks/sprint-04-006-consolidated-quality-data-trust-batch.md
```

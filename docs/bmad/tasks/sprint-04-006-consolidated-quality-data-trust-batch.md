# Sprint 04-006 — Sprint 04 Consolidated Plan: Quality Gate + Admin Claim 8 Items

Date: 2026-04-29
Status: approved-for-BMAD-planning / not-yet-executed
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner approved BMAD recording, prioritization, and single-PIC restructuring in chat.

## Correction from Rangga

Owner clarified that the "8 items" meant the original Sprint 04 admin claim service items from `docs/bmad/tasks/sprint-04-004-admin-claim-verification-services-batch.md`, not the later consolidated quality/data/trust items.

This document now treats Sprint 04-004 Admin Claim as the core Sprint 04 implementation track, with quality gate work as preflight/supporting work.

## Purpose

Give Owner a clear Sprint 04 report showing:

1. the 8 admin claim task items,
2. the PIC for each item,
3. how many batches are recommended,
4. which supporting/preflight tasks should run first,
5. which feedback is deferred or skipped,
6. how to avoid two people executing the same task.

## Ownership rule from Owner

One task must have one execution PIC only.

Reviewer/support roles do not count as executor. If work truly requires two people to actively execute, it must be split into separate tasks. This avoids hidden dependency and prevents Ujang/Asep/Rangga from blocking each other inside the same task.

Allowed role types:

- PIC: the single owner accountable for execution and deliverable.
- Reviewer: reviews output after PIC completes work.
- Input provider: provides logs, screenshots, decisions, or context, but does not execute that task.
- Gate owner: Iwan/Owner approval where required.

## Global guardrails

- No verified activation for public data without governance.
- No official numeric APBDes extraction without explicit gate.
- No scraper/crawler umum.
- No destructive migration or seed reset without Owner approval.
- No new dependency without Owner approval.
- No read path back to hardcoded fallback.
- No private email/phone exposed.
- No admin self-promotion.
- No `User.role = DESA` as proof of verified village admin.
- All admin claim/invite/report flows must have audit trail.
- Token must be hash-only, expire, and single-use where relevant.
- Website token checker must include SSRF/private URL guard.
- Demo data must never look official.

---

# Sprint 04 core implementation track — Admin Claim 8 Items

Source task:

- `docs/bmad/tasks/sprint-04-004-admin-claim-verification-services-batch.md`

Total core admin-claim items: 8
Recommended core admin-claim batches: 5
Primary PIC: Ujang
Reviewer: Rangga
Gate owner: Iwan/Owner for high-risk/security/governance decisions
Recommended model: GPT-5.1
Reasoning effort: high
Escalate high by default for auth, email, token, role, audit, invite, website checking, SSRF, and reputation risk.

## Admin claim task inventory

| Item | Task ID | Title | PIC | Reviewer/Gate | Batch | Local QA required? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 04-004A | Submit claim to DB from UI | Ujang | Rangga review | Core Batch 1 | Yes | Establish claim record and action entry point first |
| 2 | 04-004B | Real admin-claim email magic link | Ujang | Rangga review / Owner if env risk | Core Batch 2 | Yes | Dedicated Resend service, not NextAuth `signIn("resend")` |
| 3 | 04-004C | Generate real website token | Ujang | Rangga review | Core Batch 2 | Yes | Token shown once, hash stored, expires |
| 4 | 04-004D | Check token on official village website | Ujang | Rangga review / Owner if SSRF ambiguity | Core Batch 3 | Yes | Single-page safe check only, no crawler |
| 5 | 04-004E | Status transition PENDING/LIMITED/VERIFIED | Ujang | Rangga review / Owner governance gate | Core Batch 3 | Yes | Verified admin membership, not verified public data |
| 6 | 04-004F | Real audit events from claim actions | Ujang | Rangga review | Core Batch 1-3 cross-cutting | Yes | Must be implemented alongside every action |
| 7 | 04-004G | Invite admin service | Ujang | Rangga review | Core Batch 4 | Yes | Verified admin only, max 5 admins per desa |
| 8 | 04-004H | Fake admin report service | Ujang | Rangga review | Core Batch 5 | Yes | Report only, no auto-suspend |

## Why Ujang owns all 8 admin-claim items

The 8 admin claim items touch the same service boundary:

- `DesaAdminClaim`,
- `DesaAdminMember`,
- `DesaAdminInvite`,
- `AdminClaimAudit`,
- `FakeAdminReport`,
- token helpers,
- status transitions,
- admin claim route handlers,
- `/profil/klaim-admin-desa` wiring.

Splitting execution across Ujang and Asep inside this same area would create file-level conflicts and hidden dependencies. Therefore, Ujang is the single PIC for the admin-claim implementation track. Rangga reviews only after completion or handoff checkpoints.

## Core admin claim batch sequence

### Core Batch 1 — Claim submit + audit foundation

Tasks:

- 04-004A Submit claim to DB from UI.
- 04-004F audit event helper and initial `CLAIM_STARTED`/claim action audit events.

Why first:

- Every later verification method needs a persisted claim.
- Every later action must write audit trail.

### Core Batch 2 — Verification method generation

Tasks:

- 04-004B Real admin-claim email magic link.
- 04-004C Generate real website token.

Why second:

- Both create proof artifacts/tokens but do not require website fetching yet.
- Both depend on claim + token/audit primitives from Core Batch 1.

### Core Batch 3 — Verification execution + status transition

Tasks:

- 04-004D Check token on official village website.
- 04-004E Status transition PENDING/LIMITED/VERIFIED.
- 04-004F audit events for success/failure transitions.

Why third:

- Website checking and email verification both need strict transition rules.
- `VERIFIED` here means admin membership verification only; it must not activate verified public data values.

### Core Batch 4 — Invite admin service

Task:

- 04-004G Invite admin service.

Why fourth:

- Invite depends on a verified admin member existing.
- Invite grants `LIMITED`, not verified admin self-promotion.

### Core Batch 5 — Fake admin report service

Task:

- 04-004H Fake admin report service.

Why fifth:

- Can be implemented after membership/invite model is clearer.
- Must not auto-suspend or auto-punish based on report alone.

---

# Supporting Sprint 04 quality/preflight tasks

These tasks are not the "8 admin claim items". They exist to reduce risk before or during implementation.

| Support Task | Title | PIC | Batch | Required before admin claim? | Notes |
| --- | --- | --- | --- | --- | --- |
| 04-006Q1 | Lint & Build Gate Stabilization | Ujang | Preflight 1 | Yes | Current lint/build must not hide admin-claim regressions |
| 04-006Q2 | GitHub Actions CI Quality Gate | Ujang | Preflight 2 | Strongly recommended | CI should run lint/test/typecheck/build |
| 04-006Q3 | Critical Test Foundation | Asep | Preflight 2 | Strongly recommended | Vitest route/service/security tests, no Playwright dependency yet |
| 04-006Q4 | Developer Docs & QA Checklist | Rangga | Support | No | Docs/checklist only, based on verified commands/logs |

## Preflight task notes

- Q1 should run before admin claim coding.
- Q2/Q3 can run after Q1 and in parallel with each other if file ownership does not collide.
- Q4 can be done by Rangga using command results from Ujang; Ujang is input provider only, not co-executor.

---

# Deferred/non-core feedback

The following feedback remains valid but should not replace the admin claim 8-item Sprint 04 core:

1. Public read path scalability — keep as next data-quality task after admin claim gate or run only if Owner explicitly prioritizes it before admin claim.
2. Voice-to-Desa relation migration — high-risk data integrity task, gated separately; do not mix with admin claim implementation.
3. DataStatus trust layer consistency — keep guardrail active; only implement if needed by admin claim UI/security path.
4. NextAuth upgrade — risk note only, do not execute now unless auth blocker appears.
5. Playwright E2E — defer; requires new dependency approval.
6. Branch protection — defer until CI is green.
7. Public `verified` activation — blocked until governance exists.
8. GitHub board/label operations — defer until minimum docs/templates are ready.

---

# Admin claim detailed task definitions

## 04-004A — Submit claim to DB from UI

PIC: Ujang
Reviewer: Rangga
Batch: Core Batch 1
Recommended model: GPT-5.1
Reasoning effort: high

### Scope

- Wire `/profil/klaim-admin-desa` to a real submit endpoint.
- Require authenticated user.
- Validate desa exists.
- Create or safely update `DesaAdminClaim` for `(userId, desaId)`.
- Initial status: `PENDING`.
- Save selected method: `OFFICIAL_EMAIL`, `WEBSITE_TOKEN`, or `SUPPORT_REVIEW`.
- Prevent noisy duplicate claims.
- Write audit event through 04-004F.

### Acceptance criteria

- Claim submit persists to DB.
- Public/unauthenticated request is blocked.
- Duplicate submit is safe and predictable.
- UI reads status from DB after submit.

## 04-004B — Real admin-claim email magic link

PIC: Ujang
Reviewer: Rangga
Batch: Core Batch 2
Recommended model: GPT-5.1
Reasoning effort: high

### Scope

- Create dedicated admin-claim email service using Resend.
- Do not reuse NextAuth `signIn("resend")` directly.
- Generate cryptographically random token.
- Store token hash only.
- Token expires and is single-use where applicable.
- Send magic link only to allowed official email source.
- Handle missing Resend env honestly as `RESEND_ENV_MISSING`, not fake success.
- Verify token from callback/route and grant verified admin membership if valid.
- Write audit events through 04-004F.

### Acceptance criteria

- Email helper is separate from NextAuth login provider.
- Raw token is never stored.
- Valid token verifies claim/admin membership.
- Invalid/expired/used token fails safely.

## 04-004C — Generate real website token

PIC: Ujang
Reviewer: Rangga
Batch: Core Batch 2
Recommended model: GPT-5.1
Reasoning effort: high

### Scope

- Generate website verification token.
- Store token hash and expiry.
- Show raw token once in UI.
- Provide safe placement instruction for official desa website.
- Write audit event through 04-004F.

### Acceptance criteria

- Website token exists only as raw value at creation time.
- DB stores hash only.
- Token expires.
- UI copy is clear and does not imply verified public data.

## 04-004D — Check token on official village website

PIC: Ujang
Reviewer: Rangga
Gate owner: Owner if SSRF/domain ambiguity appears
Batch: Core Batch 3
Recommended model: GPT-5.1
Reasoning effort: high

### Scope

- Implement real website token check endpoint.
- Require authenticated user.
- Load claim owned by current user.
- Validate token exists and is not expired.
- Validate URL is allowed and tied to official desa website/domain where possible.
- Fetch only one page safely.
- Search token text.
- Reject localhost/private/internal IPs, unsafe schemes, and suspicious redirects.
- Timeout and response-size limit required.
- No crawler/recursive fetch.
- Write audit events through 04-004F.

### Acceptance criteria

- Token found grants verified admin membership through 04-004E.
- Token not found keeps claim pending.
- Invalid/private URL is rejected.
- No generic crawler behavior.

## 04-004E — Status transition PENDING/LIMITED/VERIFIED

PIC: Ujang
Reviewer: Rangga
Gate owner: Owner for governance ambiguity
Batch: Core Batch 3
Recommended model: GPT-5.1
Reasoning effort: high

### Scope

- Centralize allowed admin claim/member transitions.
- User cannot set arbitrary status from client.
- User cannot verify another user's claim.
- `User.role = DESA` must not imply verified desa admin.
- Email/website proof can transition claim to `VERIFIED` and member to `VERIFIED_ADMIN`.
- Invite acceptance can create `LIMITED` membership.
- `VERIFIED` here is admin membership only, not public data verification.
- Write audit events through 04-004F.

### Acceptance criteria

- Transitions are enforced in server-side helper/service.
- Invalid transitions fail safely.
- Verified public data status remains inactive.

## 04-004F — Real audit events from claim actions

PIC: Ujang
Reviewer: Rangga
Batch: Cross-cutting Core Batch 1-3
Recommended model: GPT-5.1
Reasoning effort: high

### Scope

- Create audit event constants.
- Create audit write helper.
- Use helper for all claim/email/website/status/invite/report actions.
- Avoid scattered raw event strings.
- Store enough metadata for review without exposing private token/email data.

### Minimum events

- `CLAIM_STARTED`
- `CLAIM_REUSED`
- `CLAIM_METHOD_UPDATED`
- `EMAIL_VERIFICATION_SENT`
- `EMAIL_PROVIDER_CONFIG_MISSING`
- `EMAIL_VERIFIED`
- `EMAIL_FAILED`
- `EMAIL_TOKEN_EXPIRED`
- `WEBSITE_TOKEN_CREATED`
- `WEBSITE_TOKEN_VERIFIED`
- `WEBSITE_TOKEN_FAILED`
- `WEBSITE_NOT_ACCEPTED_FOR_AUTO_VERIFY`
- `ROLE_GRANTED`
- `INVITE_CREATED`
- `INVITE_ACCEPTED`
- `FAKE_ADMIN_REPORT_SUBMITTED`
- `ADMIN_CLAIM_FLAGGED_BY_PUBLIC`

### Acceptance criteria

- Every important action writes audit.
- Audit metadata avoids raw token leakage.
- Audit helper is reusable by all admin claim services.

## 04-004G — Invite admin service

PIC: Ujang
Reviewer: Rangga
Batch: Core Batch 4
Recommended model: GPT-5.1
Reasoning effort: high

### Scope

- Verified desa admin can invite another admin.
- Enforce max 5 admins per desa.
- Invite token stored hash-only and expires.
- Accept invite creates/updates `DesaAdminMember` as `LIMITED`.
- Send invite email via dedicated admin-claim/invite email helper if env exists.
- Write audit events through 04-004F.

### Acceptance criteria

- Only verified admin for that desa can invite.
- Max 5 admin rule enforced.
- Invite accept handles valid/expired/used token cases.
- Invite does not create verified admin automatically.

## 04-004H — Fake admin report service

PIC: Ujang
Reviewer: Rangga
Batch: Core Batch 5
Recommended model: GPT-5.1
Reasoning effort: high

### Scope

- Implement endpoint/service to create `FakeAdminReport`.
- Required: `desaId`, `reason`.
- Optional: `reportedUserId`, `description`, `evidenceUrl`, `reporterEmail`.
- Validate desa exists.
- Validate evidence URL/email if provided.
- Write audit events through 04-004F.
- Do not auto-suspend based on report alone.

### Acceptance criteria

- Valid report creates DB record.
- Invalid report fails safely.
- Audit event is written.
- No automatic punishment/suspension based only on report.

---

# Sprint 04 report summary

## Core task count

8 admin claim task items.

## Supporting/preflight task count

4 supporting tasks.

## Total execution groups

5 core admin-claim batches + 2 preflight/support batches.

## PIC distribution for core admin claim

- Ujang: 8 admin-claim implementation items.
- Rangga: reviewer only.
- Owner/Iwan: gate owner for high-risk/security/governance decisions.

## PIC distribution for supporting tasks

- Ujang: Q1 lint/build, Q2 CI.
- Asep: Q3 critical tests.
- Rangga: Q4 docs/QA checklist.

## Recommended order

1. Preflight Q1 — lint/build stabilization.
2. Preflight Q2/Q3 — CI and critical tests.
3. Core Batch 1 — claim submit + audit foundation.
4. Core Batch 2 — email magic link + website token generation.
5. Core Batch 3 — website token check + status transitions.
6. Core Batch 4 — invite admin service.
7. Core Batch 5 — fake admin report service.
8. Support Q4 — docs/QA checklist update after commands and flow are known.

## Definition of done for Sprint 04 admin claim track

- All 8 owner admin claim items are implemented or explicitly reported blocked with reason.
- Every item has single PIC execution ownership.
- Token flows are hash-only, expiring, and single-use where relevant.
- Website check has SSRF/private URL protection and no crawler behavior.
- Status transitions cannot be controlled arbitrarily by client.
- Audit events exist for claim/email/website/status/invite/report actions.
- Invite admin enforces verified-admin-only and max 5 admin rule.
- Fake admin report creates report/audit only and does not auto-suspend.
- UI remains clean and mobile-safe if touched.
- Required QA commands pass or blockers are clearly reported.

# Sprint 04 — Software Architect Handoff

Date: 2026-04-29
Status: awaiting-software-architect-review
Prepared-by: Rangga / BMAD-lite orchestration
Owner request: transfer project knowledge to Software Architect and ask for input before proceeding further.

## Purpose

This document is a handoff package for the Software Architect to understand the current PantauDesa state and provide architectural input before Sprint 04 continues.

The Owner wants input before deeper implementation, especially around the admin claim verification services, quality gate, testing posture, security/privacy, and sequencing.

## Required reading

Please read these docs before giving input:

1. `docs/bmad/roadmap.md`
2. `docs/bmad/tasks/sprint-04-004-admin-claim-verification-services-batch.md`
3. `docs/bmad/tasks/sprint-04-006-consolidated-quality-data-trust-batch.md`
4. `docs/bmad/reviews/sprint-04-002-rangga-review.md`
5. `docs/bmad/reviews/sprint-04-003-rangga-rework-review.md`
6. `docs/engineering/08-ujang-source-architecture-summary.md`
7. `docs/engineering/07-ujang-architecture-business-assessment.md`
8. `docs/product/01-pantaudesa-data-product-ux-governance-review.md`

## Project summary

PantauDesa is a public web platform for village transparency. The product helps citizens read village data, documents, citizen voices, and trust/status framing safely.

Current stack:

- Next.js
- React
- TypeScript
- Prisma
- Supabase/PostgreSQL
- NextAuth
- Resend
- Vitest
- Tailwind
- Sentry

Important product principle:

The app must help citizens understand public data without making demo/imported/unreviewed data look official or verified.

## Key roles

- Iwan / Owner: final gate and product/business approval.
- Rangga: BMAD planning, review, guardrail enforcement, task sequencing, knowledge transfer.
- Ujang: primary local technical executor for high-risk implementation tasks.
- Asep: local executor for selected test/security/trust tasks when file ownership does not conflict.
- Software Architect: requested reviewer before Sprint 04 proceeds further.

## Current Sprint 04 state

Completed/reviewed foundations:

1. Sprint 04-001 Public UI/UX Closeout
   - Status: accepted with noted blockers.

2. Sprint 04-002 Schema/Data Foundation
   - Status: accepted for next Sprint 04 gate.
   - Important schema foundation already exists:
     - `Desa`
     - `PerangkatDesa`
     - `DesaAdminClaim`
     - `DesaAdminMember`
     - `DesaAdminInvite`
     - `AdminClaimAudit`
     - `FakeAdminReport`
     - `DokumenAttachment`
     - `AIReviewResult`

3. Sprint 04-003 Admin Claim Guided UI from Profile
   - Reworked UI is accepted structurally.
   - Current UI split:
     - `/profil/saya` = compact entry card.
     - `/profil/klaim-admin-desa` = focused wizard.
   - Still UI-only; not yet real submit/email/website verification.

## Current core Sprint 04 implementation track

The Owner clarified that the core Sprint 04 task is the original 8-item admin claim service batch.

Source:

- `docs/bmad/tasks/sprint-04-004-admin-claim-verification-services-batch.md`

Core 8 items:

1. Send real admin-claim email magic link.
2. Generate real website verification token.
3. Check token on official village website.
4. Submit claim to DB from UI.
5. Update status `PENDING` / `LIMITED` / `VERIFIED` from user action.
6. Write real audit events from claim actions.
7. Implement admin invite service.
8. Implement fake admin report service.

Current sequencing recommendation:

1. Preflight Q1: lint/build stabilization.
2. Preflight Q2/Q3: CI and critical tests.
3. Core Batch 1: claim submit + audit foundation.
4. Core Batch 2: email magic link + website token generation.
5. Core Batch 3: website token check + status transitions.
6. Core Batch 4: invite admin service.
7. Core Batch 5: fake admin report service.
8. Support Q4: docs/QA checklist after commands and flow are known.

## Ownership rule

Owner explicitly requested single-PIC execution.

One task must have one execution PIC only. Reviewers do not count as executors. If a task truly needs two active executors, split the task.

Current proposed split:

- Ujang owns the 8 admin claim implementation items because they touch the same service/model boundary.
- Asep owns selected critical test/security/trust support tasks only when they do not conflict with Ujang's files.
- Rangga owns docs/QA checklist and reviews.

## Guardrails that must not be violated

- No verified activation for public data without governance.
- `VERIFIED` for admin membership must not imply public data is verified.
- No official numeric APBDes extraction without explicit Owner gate.
- No scraper/crawler umum.
- Website token checker may only perform a safe single-page check with SSRF/private URL protection.
- No destructive migration or seed reset without Owner approval.
- No new dependency without Owner approval.
- No read path back to hardcoded fallback.
- No private email/phone exposed.
- No admin self-promotion.
- `User.role = DESA` is not proof of verified village admin.
- All claim/invite/report actions must write audit trail.
- Tokens must be hash-only, expiring, and single-use where relevant.
- Demo data must never look official.

## TDD-first rule requested by Owner

Owner added that all feature implementation must follow TDD-first behavior to avoid touching unrelated features accidentally.

Expected rule:

1. Define or write tests before feature implementation where practical.
2. Cover happy path, invalid input, unauthorized access, ownership mismatch, expired/invalid token, and regression risk.
3. Implement only enough to make tests pass.
4. Run full quality gate:

```bash
npm run lint
npm run test
npx tsc --noEmit
npx prisma generate
npm run build
```

5. If UI is touched, capture before/after screenshots desktop and mobile in local ignored artifacts only.

## Known technical concerns needing architect review

### 1. Admin claim service boundaries

Proposed helper/service structure:

```text
src/lib/email/resend-client.ts
src/lib/email/admin-claim-email.ts
src/lib/admin-claim/token.ts
src/lib/admin-claim/audit.ts
src/lib/admin-claim/audit-events.ts
src/lib/admin-claim/status.ts
src/lib/admin-claim/website-token.ts
src/lib/admin-claim/permissions.ts
src/lib/admin-claim/safe-url.ts
```

Architect input needed:

- Is this service boundary clean enough for Next.js route handlers?
- Should admin-claim logic be organized as domain services, route helpers, or server actions?
- Should email verification and website verification share a generic token service or remain separate?
- How should audit metadata be structured to be useful but privacy-safe?

### 2. Status model and governance

Current schema has `DesaAdminStatus` and `DesaAdminRole`.

Important distinction:

- Admin membership verification can be `VERIFIED`.
- Public data verification must remain inactive until governance workflow exists.

Architect input needed:

- Are `DesaAdminClaim.status`, `DesaAdminMember.status`, and `DesaAdminMember.role` sufficient?
- Should status transitions be centralized in a state-machine style helper?
- Should `LIMITED` be represented as role, status, or both?
- How to avoid accidental misuse of `VERIFIED` across admin membership and public data status?

### 3. Token design

Requirements:

- raw token never stored,
- hash-only persistence,
- expiry,
- single-use where relevant,
- ownership check,
- audit on success/failure.

Architect input needed:

- What token hash scheme is preferred with existing dependencies?
- Should email token and website token use the same DB fields or separate token records?
- Is storing token hash on `DesaAdminClaim` sufficient, or should token events be normalized?
- How should token reuse/replay attempts be audited?

### 4. Website token checker safety

Requirements:

- not a crawler,
- one safe page fetch,
- allow only http/https,
- reject localhost/private/internal IPs,
- reject unsafe schemes,
- timeout,
- response size limit,
- redirect limit,
- ideally restrict to official desa domain.

Architect input needed:

- What safe URL validation design should be used?
- Should DNS resolution be checked before request and after redirect?
- How strict should official-domain matching be if village website metadata is missing?
- Should website token check be queued/background later or direct request in MVP?

### 5. Invite admin service

Owner MVP rule:

- max 5 admins per desa,
- invite accepted user becomes `LIMITED`,
- only verified admin for that desa can invite.

Architect input needed:

- Is the current `DesaAdminInvite` schema enough?
- Should invites be tied to user account at creation or only email until accept?
- How should email mismatch be handled when accepting invite?
- What is the safest path for revocation/expiry?

### 6. Fake admin report

Requirements:

- public or authenticated report path still needs validation,
- create report record,
- write audit event,
- no auto-suspend or auto-punish.

Architect input needed:

- Should fake admin report require auth or allow unauthenticated reports with reporter email?
- What abuse/rate-limit posture is acceptable without adding dependency?
- Should evidence URL be stored raw, normalized, or hashed?

### 7. Testing / TDD / CI

Current package scripts include lint/test/build. Typecheck is currently expected via `npx tsc --noEmit`.

Architect input needed:

- What minimum tests must block admin claim merge?
- How should route handlers be tested in this Next.js setup?
- How should Prisma be mocked or isolated for route/service tests?
- Is it acceptable to defer Playwright until later?
- Should CI run with DB mocked or a real ephemeral Postgres?

### 8. Public data scalability and deferred feedback

Feedback exists for server-driven `/desa`, home stats, caching, Voice-to-Desa relation, and dataStatus consistency.

Current Rangga recommendation:

- Do not let these replace the 8-item admin claim core.
- Keep as next Sprint 04/05 tasks or reopen if Owner prioritizes them.

Architect input needed:

- Should any of these become blockers before admin claim services?
- Is it risky to proceed admin claim before Voice-to-Desa relation migration?
- Should public read path scalability be done before or after admin claim?

## Requested output from Software Architect

Please provide a review with these sections:

1. **Proceed / Reorder / Block** recommendation.
2. **Architecture risks** ranked P0/P1/P2.
3. **Recommended service boundaries** for admin claim implementation.
4. **Token and status transition design** recommendation.
5. **Website token checker security design** recommendation.
6. **Testing/TDD minimum bar** before implementation and before merge.
7. **CI/database strategy** recommendation.
8. **Which deferred feedback should be pulled into Sprint 04, if any.**
9. **Any task that should be split further to preserve single-PIC execution.**

## Decision gate

Do not continue broad admin claim implementation until Software Architect has provided input or Owner explicitly waives this review gate.

Rangga should use the architect review to adjust BMAD tasks before sending final execution instructions to Ujang/Asep.

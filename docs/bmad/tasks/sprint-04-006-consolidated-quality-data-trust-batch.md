# Sprint 04-006 — Consolidated Quality, Data, and Trust Batch

Date: 2026-04-29
Status: approved-for-BMAD-planning / not-yet-executed
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner approved BMAD recording, prioritization, and single-PIC restructuring in chat.

## Purpose

Consolidate recent Owner feedback into a structured Sprint 04 execution plan without swallowing every suggestion raw.

This file is now the Owner-facing BMAD execution report for Sprint 04-006. It defines:

1. which feedback is kept, adjusted, skipped, or deferred,
2. how many task items are planned,
3. who owns each task as single PIC,
4. how many execution batches are recommended,
5. which tasks must run locally,
6. which tasks Rangga can handle without local QA/runtime work.

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

## Consolidated feedback decisions

### Execute in Sprint 04

- Lint/build/typecheck/Prisma generate stabilization.
- GitHub Actions CI quality gate after local commands are stable.
- Critical Vitest coverage for services, route handlers, auth/error states, and important UI behavior.
- Server-driven public data query and DB-backed home stats to avoid full-list client behavior.
- Trust layer consistency for `dataStatus` and `DataStatusBadge`.
- Security/privacy checklist for public APIs, voice text, admin claim, token, and query params.
- Voice-to-Desa relation migration planning and gated implementation.
- Developer documentation minimum readiness.
- Admin claim verification services after quality gates are stable.

### Execute, but with adjusted wording/scope

- `getDesaListResult()` already exists; the real issue is full-list oriented public read behavior.
- `Desa` already exists; the real issue is `Voice.desaId` as plain string without relation/FK.
- `DataStatusBadge` already exists; the real issue is consistent mapping and governance, not enabling verified.

### Skip/defer unless Owner reopens

- NextAuth upgrade: keep as risk note only; do not execute unless there is a concrete auth blocker.
- Playwright E2E: defer because it likely requires a new dependency and explicit approval.
- Branch protection: defer until CI is green and stable.
- Public `verified` activation: blocked until governance workflow exists.
- GitHub board/label operations: defer until CI, CONTRIBUTING, and issue/PR templates exist.

---

# Sprint 04 task inventory

Total planned task items: 8
Recommended execution batches: 6

| Task | Title | PIC | Reviewer / Gate | Batch | Local QA required? | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 04-006A | Lint & Build Gate Stabilization | Ujang | Rangga review, Owner gate if dependency/version change | Batch 1 | Yes | Planned |
| 04-006B | GitHub Actions CI Quality Gate | Ujang | Rangga review | Batch 2 | Yes | Planned |
| 04-006C | Critical Test Foundation | Asep | Rangga review | Batch 2 | Yes | Planned |
| 04-006D | Public Read Path Scalability | Ujang | Rangga review | Batch 3 | Yes | Planned |
| 04-006E | Trust Layer, Security, and Privacy Consistency | Asep | Rangga review, Owner gate for verified/security scope | Batch 4 | Yes if UI/API touched | Planned |
| 04-006F | Voice to Desa Relation Migration | Ujang | Rangga review, Owner migration gate | Batch 5 | Yes | Planned/gated |
| 04-006G | Developer Documentation & OSS Minimum Readiness | Rangga | Owner review; Ujang only provides prior command results as input | Batch 4 | No direct local QA by Rangga | Planned |
| 04-006H | Admin Claim Verification Services Batch | Ujang | Rangga review, Owner high-risk gate | Batch 6 | Yes | Planned/gated |

## Why 6 batches, not 8 batches

There are 8 task items, but they can be grouped into 6 controlled batches without task ownership collision:

1. Batch 1: Quality stabilization baseline.
2. Batch 2: CI and tests, owned separately by Ujang and Asep.
3. Batch 3: Public read path scalability.
4. Batch 4: Trust/security consistency and docs, owned separately by Asep and Rangga.
5. Batch 5: Voice-to-Desa migration.
6. Batch 6: Admin claim services.

Parallel work is allowed only when file ownership and dependencies do not collide.

---

# Batch 1 — Quality stabilization baseline

## Task 04-006A — Lint & Build Gate Stabilization

PIC: Ujang
Reviewer: Rangga
Gate owner: Iwan/Owner if Prisma version/dependency changes are proposed
Priority: P0
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
Escalate to high if: Prisma query engine rename/build error persists, auth/session files need refactor, Prisma version changes are proposed, or React Hooks fixes affect user-facing auth/data flow.

### Goal

Make local project quality commands reliable before CI is introduced as a gate.

### Scope

- Fix ESLint errors/warnings, especially React Hooks and unused imports.
- Do not mass-disable ESLint rules.
- Fix hook-heavy code only as needed to make logic stable.
- Extract small hooks only when it reduces lint risk and improves testability.
- Investigate Prisma query engine rename issue.
- Confirm whether Prisma rename issue is Windows-specific, file-lock related, cache related, or version related.

### Required validation

```bash
npm run lint
npm run test
npx tsc --noEmit
npx prisma generate
npm run build
```

### Acceptance criteria

- `npm run lint` passes without mass ignores.
- `npm run test` passes.
- `npx tsc --noEmit` passes.
- `npx prisma generate` passes.
- `npm run build` passes or has a clear environment-specific blocker report.
- Any Prisma/package update proposal stops for Owner approval.

### Screenshot rule

If UI components are touched, capture desktop and mobile before-after screenshots locally only:

- `.artifacts/screenshots/sprint-04-006a/`
- `tmp/screenshots/sprint-04-006a/`

Do not commit screenshots unless Owner asks.

---

# Batch 2 — CI and critical tests

## Task 04-006B — GitHub Actions CI Quality Gate

PIC: Ujang
Reviewer: Rangga
Priority: P0 after 04-006A
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
Escalate to high if: CI needs production secrets, live DB access, Prisma version updates, package manager changes, or branch protection.

### Goal

Add a minimal non-deployment CI workflow on Linux.

### Scope

Create `.github/workflows/ci.yml` that runs:

```bash
npx prisma generate
npm run lint
npm run test
npx tsc --noEmit
npm run build
```

### Boundaries

- No deployment workflow.
- No branch protection yet.
- No new dependency without Owner approval.
- No production DB requirement.
- No hardcoded fallback to make CI green.

### Acceptance criteria

- CI runs on PR and push to main.
- CI uses Linux runner, preferably `ubuntu-latest`.
- CI failure clearly shows whether failure is Prisma generate, lint, test, typecheck, or build.
- CI is green or has a documented blocker tied to environment.

## Task 04-006C — Critical Test Foundation

PIC: Asep
Reviewer: Rangga
Priority: P1 after 04-006A, can run alongside 04-006B if file ownership does not collide
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
Escalate to high if: auth mocking, Prisma integration isolation, DB cleanup, token flows, SSRF guard, or route-handler testing becomes complex.

### Goal

Add meaningful tests for risky paths, not just increase coverage percentage.

### Scope

Use existing Vitest setup first.

Add/extend tests for:

- service/helper functions,
- route handlers under `/api/*`,
- invalid payloads,
- unauthenticated and unauthorized access,
- DB unavailable/error states,
- public read-path mapper behavior,
- token invalid/expired/reused behavior where applicable,
- important UI behavior where current tooling supports it.

### Deferred

Playwright E2E is deferred until Owner approves new dependency.

### Acceptance criteria

- `npm run test` passes locally and in CI.
- Critical API/service behavior has tests.
- Tests do not require production DB.
- No destructive DB reset.

---

# Batch 3 — Public data scalability

## Task 04-006D — Public Read Path Scalability

PIC: Ujang
Reviewer: Rangga
Priority: P1
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
Escalate to high if: DB unavailable behavior, cache invalidation, ISR, aggregate stats, or public numeric APBDes framing becomes ambiguous.

### Goal

Move public list/search/home stats away from full-list oriented reads.

### Adjusted finding

`getDesaListResult()` already exists and reads from Prisma. The issue is that public read behavior is still full-list oriented:

- list reads can still load many records,
- `/desa` passes full `result.items` to client,
- homepage computes stats/leaderboards from full list in page logic.

### Scope

- Server-driven `getDesaListResult({ search, provinsi, kabupaten, kecamatan, sort, page, pageSize })`.
- Prisma `where`, `orderBy`, `skip`, `take`.
- DB-backed total count and pagination metadata.
- DB-backed filter options.
- DB-backed `getHomeStats()`.
- DB-backed leaderboard/trend helpers where safe.
- Preserve unavailable/empty DB state without hardcoded fallback.

### Boundaries

- No schema/migration.
- No admin claim changes.
- No hardcoded fallback.
- No official numeric APBDes claim.
- Keep demo/trust badges visible.

### QA requirements

- Desktop/mobile before-after screenshots for `/desa`.
- Desktop/mobile before-after screenshots for homepage if changed.
- Verify search/filter/sort/pagination behavior.
- Verify empty/unavailable state.

### Acceptance criteria

- Client no longer receives unbounded full desa dataset for list browsing.
- Search/filter/sort/page are represented in URL/search params.
- Server returns pagination metadata.
- Home stats are not computed by loading the full list into page logic.
- Build remains safe when DB is unavailable.

---

# Batch 4 — Trust/security consistency and docs

## Task 04-006E — Trust Layer, Security, and Privacy Consistency

PIC: Asep
Reviewer: Rangga
Gate owner: Iwan/Owner if verified/security scope expands
Priority: P1/P2 after 04-006D or when file ownership is clear
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
Escalate to high if: verified governance, APBDes numeric status, privacy exposure, admin role proof, token security, SSRF, or legal/reputation risk appears.

### Goal

Make public trust framing and security rules consistent before deeper admin claim features.

### Scope

- Audit UI usage of `DataStatusBadge`.
- Map Prisma `DataStatus` values to UI-safe statuses/copy.
- Keep `verified` disabled until governance exists.
- Ensure `source-found` never implies verified.
- Check public UI for private email/phone exposure.
- Add validation/security checklist for route handlers.
- Confirm citizen voice text safe rendering/escaping and length validation.
- Confirm query param validation and safe parsing.

### Boundaries

- Do not enable `verified`.
- Do not claim official data truth.
- Do not add sanitizer dependency without Owner approval.
- Do not expose private contact details.

### Acceptance criteria

- Status badge usage is consistent across public desa/detail/source/document/perangkat surfaces.
- Verified remains inactive/disabled.
- Public copy clearly distinguishes demo/source-found/needs-review.
- Security/privacy checklist is documented for admin claim and voice APIs.

## Task 04-006G — Developer Documentation & OSS Minimum Readiness

PIC: Rangga
Reviewer: Owner
Input provider: Ujang provides command results from 04-006A/04-006B only; Ujang is not co-executor for this task.
Priority: P2 after commands/CI are known-good
Recommended model: GPT-5.1 Codex mini
Reasoning effort: low/medium
Escalate to high if docs require changing env, CI secrets, deployment, or production DB assumptions.

### Goal

Make local development and contribution flow clear enough without adding unnecessary process overhead.

### Scope

Update or draft:

- README development section,
- seed demo instructions,
- Prisma generate/migration notes,
- lint/test/typecheck/build commands,
- CI explanation,
- screenshot audit policy,
- `CONTRIBUTING.md`,
- PR template,
- issue template.

### Deferred

- GitHub board setup.
- Label taxonomy automation.
- Community process beyond minimum PR/issue guide.

### Boundaries

- Do not document destructive reset as default workflow.
- Do not tell contributors to use production DB.
- Do not commit screenshots.

### Acceptance criteria

- README reflects verified command flow from prior tasks.
- CONTRIBUTING explains commit, lint, test, CI, and screenshot expectations.
- Issue/PR templates help future QA/review.

---

# Batch 5 — Data integrity migration

## Task 04-006F — Voice to Desa Relation Migration Plan and Gated Implementation

PIC: Ujang
Reviewer: Rangga
Gate owner: Iwan/Owner for migration approval
Priority: P2 after quality/test foundation
Recommended model: GPT-5.1
Reasoning effort: high
Escalate to high by default because this touches schema, migration, existing data, and foreign keys.

### Goal

Safely connect `Voice.desaId` to existing `Desa` without orphaning voice records.

### Adjusted finding

`Desa` already exists. The gap is that `Voice.desaId` is currently a plain string without a Prisma relation/foreign key.

### Required pre-migration audit

- Inspect existing `voices.desaId` values.
- Determine whether values match `Desa.id`, `Desa.slug`, `kodeDesa`, or legacy/mock identifiers.
- Produce orphan/mismatch report.
- Do not delete or mutate old voice data automatically.

### Implementation scope after audit approval

- Add Prisma relation only after data compatibility or migration mapping is approved.
- Update seed data with valid desa references.
- Update voice queries/API to use relation where appropriate.
- Add tests for invalid desa, missing desa, and per-desa voice reads.

### Boundaries

- No destructive migration without Owner approval.
- No seed reset without Owner approval.
- No auto-delete orphan voices.
- Stop and ask if production-like data mismatch exists.

### Acceptance criteria

- Orphan report is produced before FK enforcement.
- FK is added only after data compatibility is confirmed or mapping is approved.
- Tests cover invalid/missing desa behavior.

---

# Batch 6 — Admin claim high-risk services

## Task 04-006H — Admin Claim Verification Services Batch

PIC: Ujang
Reviewer: Rangga
Gate owner: Iwan/Owner for high-risk decisions
Priority: P2/P3 after quality gate and critical tests are stable
Recommended model: GPT-5.1
Reasoning effort: high
Escalate to high by default because this touches auth, email, token, website check, role, audit, invite, report, SSRF, and reputation risk.

### Goal

Implement real admin claim services only after quality gates can catch regressions.

### Scope

Owner-requested admin claim service items remain valid:

1. real admin-claim email magic link via dedicated email service,
2. real website token generation,
3. website token checker with SSRF/private URL guard,
4. submit claim to DB from UI,
5. status flow PENDING/LIMITED/VERIFIED where verified remains governance-gated,
6. real audit event from claim actions,
7. admin invite service,
8. fake admin report.

### Boundaries

- Do not reuse NextAuth `signIn("resend")` for admin claim email.
- Use dedicated admin claim email service.
- Token hash-only, expiring, and single-use where relevant.
- No `User.role = DESA` as proof of verified admin desa.
- No verified activation without governance.
- All claim/invite/report actions must have audit trail.
- No private email/phone exposure.

### QA requirements

- Local runtime QA.
- DB checks.
- Email/dev-mode verification.
- Route handler tests.
- Desktop/mobile screenshots for UI changes.

### Acceptance criteria

- Admin claim actions persist to DB.
- Token and email flows are testable and auditable.
- Website checker blocks private/internal URLs.
- Status transitions are safe and logged.
- Invite/report flows do not imply verified admin without governance.

---

# Sprint 04 execution report summary

## Task count

8 task items.

## Batch count

6 execution batches.

## PIC distribution

- Ujang: 5 tasks
  - 04-006A Lint & Build Gate Stabilization
  - 04-006B GitHub Actions CI Quality Gate
  - 04-006D Public Read Path Scalability
  - 04-006F Voice to Desa Relation Migration
  - 04-006H Admin Claim Verification Services Batch

- Asep: 2 tasks
  - 04-006C Critical Test Foundation
  - 04-006E Trust Layer, Security, and Privacy Consistency

- Rangga: 1 task
  - 04-006G Developer Documentation & OSS Minimum Readiness

## Dependency notes

- 04-006A must run first.
- 04-006B and 04-006C can run in Batch 2 with different PICs.
- 04-006D should not overlap with admin claim work.
- 04-006E should run after 04-006D or only touch non-conflicting files.
- 04-006G can run from prior command outputs and does not block local engineering.
- 04-006F is migration-gated and should wait for tests/gates.
- 04-006H should wait until quality gate and critical tests are stable.

## Definition of done for Sprint 04-006

- Tasks are executed in order without hidden dual ownership.
- CI catches lint/test/typecheck/build regressions.
- Public read path avoids unbounded client full-list behavior.
- Trust badges stay consistent and demo-safe.
- No verified/public official claims are introduced without governance.
- Migration work produces an audit/mismatch report before FK enforcement.
- Admin claim services ship only after security/test gates are ready.

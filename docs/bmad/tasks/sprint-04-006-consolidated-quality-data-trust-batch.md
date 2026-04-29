# Sprint 04-006 — Consolidated Quality, Data, and Trust Batch

Date: 2026-04-29
Status: approved-for-BMAD-planning / not-yet-executed
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner approved BMAD recording and prioritization in chat.

## Purpose

Consolidate recent Owner feedback into a structured Sprint 04 execution order without swallowing every suggestion raw.

This batch separates:

1. items that should be executed now,
2. items that need adjustment before execution,
3. items that should be skipped/deferred for this sprint,
4. work Rangga can prepare/review without local QA,
5. work Ujang/Asep must execute locally because it needs runtime, DB, migration, build, screenshots, or CI validation.

## Global posture

This is a sequencing and task-control document. It is not permission to bypass project guardrails.

Keep these guardrails active:

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

### Keep and execute

- Lint/build/typecheck/Prisma generate stabilization.
- GitHub Actions CI quality gate after local commands are stable.
- Critical Vitest coverage for services, route handlers, auth/error states, and important UI behavior.
- Server-driven public data query and DB-backed home stats to avoid full-list client behavior.
- Trust layer consistency for `dataStatus` and `DataStatusBadge`.
- Security/privacy checklist for public APIs, voice text, admin claim, token, and query params.
- Developer documentation updates after commands are verified.

### Keep, but adjust before execution

- `getDesaListResult()` already exists, so the real issue is not missing service layer. The issue is that the current public read path is still full-list oriented.
- `Desa` model already exists. The real issue is that `Voice.desaId` is still a plain string without a Prisma relation/foreign key.
- `DataStatusBadge` already exists and `verified` is intentionally disabled. The real issue is consistent mapping and governance, not enabling verified.
- Playwright E2E is useful later, but adding it now would be a new dependency and needs separate approval.

### Skip/defer for this sprint unless Owner reopens

- NextAuth upgrade evaluation: keep as risk note only. Do not upgrade during this sprint unless there is a concrete auth blocker.
- Open-source board/label operations: defer until CI, CONTRIBUTING, and issue/PR templates exist.
- Enabling public `verified`: blocked until governance workflow exists.
- Playwright dependency/setup: defer unless Owner explicitly approves new dependency.
- Branch protection / required checks: defer until CI is green and stable.

---

# Execution sequence

## Task 04-006A — Lint & Build Gate Stabilization

Priority: P0
Executor: Ujang/Asep local
Rangga role: review logs, refine acceptance criteria, confirm guardrails
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
Escalate to high if: Prisma query engine rename/build error persists, auth/session files need refactor, Prisma version changes are proposed, or React Hooks fix changes user-facing auth/data flow.

### Goal

Make the local project quality commands reliable before CI is introduced as a gate.

### Scope

- Fix current ESLint errors and warnings, especially React Hooks and unused imports.
- Do not mass-disable ESLint rules.
- Fix hook-heavy code only as needed to make logic stable.
- Extract small hooks only when it reduces lint risk and improves testability.
- Investigate Prisma query engine rename issue.
- Confirm whether Prisma rename issue is Windows-specific, file-lock related, cache related, or version related.

### Required local validation

Run and capture results:

```bash
npm run lint
npm run test
npx tsc --noEmit
npx prisma generate
npm run build
```

### Acceptance criteria

- `npm run lint` passes without mass ignores.
- React Hooks warnings/errors are fixed from the root cause.
- `npm run test` passes.
- `npx tsc --noEmit` passes.
- `npx prisma generate` passes.
- `npm run build` passes or has a clearly documented environment-specific blocker.
- If Prisma CLI/client version update is proposed, stop and request Owner approval first.

### QA notes

If UI components are touched, capture before-after screenshots desktop and mobile.
Store screenshots locally only in ignored paths such as:

- `.artifacts/screenshots/sprint-04-006a/`
- `tmp/screenshots/sprint-04-006a/`

Do not commit screenshots unless Owner explicitly asks.

---

## Task 04-006B — GitHub Actions CI Quality Gate

Priority: P0 after 04-006A
Executor: Ujang/Asep local/repo
Rangga role: draft/review workflow and acceptance criteria
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
Escalate to high if: CI needs production secrets, DB-live build access, Prisma version updates, package manager changes, or branch protection.

### Goal

Add a minimal CI workflow that runs quality checks consistently on Linux.

### Scope

Create `.github/workflows/ci.yml` with a non-deployment quality workflow.

Expected steps:

1. checkout,
2. setup Node,
3. install dependencies,
4. Prisma generate,
5. lint,
6. tests,
7. typecheck,
8. build.

### Required commands

```bash
npx prisma generate
npm run lint
npm run test
npx tsc --noEmit
npm run build
```

### Boundaries

- No deployment workflow yet.
- No branch protection yet.
- No new dependency without Owner approval.
- Use safe CI environment variables only.
- Do not make hardcoded fallback just to make CI green.

### Acceptance criteria

- GitHub Actions workflow exists and runs on pull request and push to main.
- Workflow uses Linux runner, preferably `ubuntu-latest`.
- CI failure clearly identifies whether the problem is lint, test, typecheck, Prisma generate, or build.
- CI does not require production DB access.

---

## Task 04-006C — Critical Test Foundation

Priority: P1 after 04-006A and ideally after initial CI exists
Executor: Ujang/Asep local
Rangga role: test matrix, critical-path review, coverage review
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
Escalate to high if: auth mocking, Prisma integration isolation, DB cleanup, token flows, SSRF guard, or route-handler testing becomes complex.

### Goal

Increase meaningful test coverage for risky paths, not just coverage percentage.

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
- audit event creation when admin claim work starts,
- important UI behavior where current tooling supports it.

### Deferred

Playwright E2E is deferred because it likely requires a new dependency and separate approval.

### Acceptance criteria

- `npm run test` passes locally and in CI.
- Critical API/service behavior has tests.
- Tests do not require production DB.
- No destructive DB reset.
- Coverage report can be generated with `npm run test:coverage` if needed.

---

## Task 04-006D — Public Read Path Scalability

Priority: P1 after quality gate starts stabilizing
Executor: Ujang/Asep local
Rangga role: query contract, review, guardrail enforcement
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
Escalate to high if: DB unavailable behavior, cache invalidation, ISR, aggregate stats, or public numeric APBDes framing becomes ambiguous.

### Goal

Move public list/search/home stats away from full-list oriented reads.

### Current adjusted finding

`getDesaListResult()` already exists and already reads from Prisma, but the current read path is still full-list oriented:

- list reads still load many records,
- `/desa` passes full `result.items` to client,
- homepage computes stats/leaderboards from full list in page logic.

### Scope

Implement server-driven/public read service improvements:

- `getDesaListResult({ search, provinsi, kabupaten, kecamatan, sort, page, pageSize })`,
- Prisma `where`, `orderBy`, `skip`, `take`,
- DB-backed total count and pagination metadata,
- DB-backed filter options,
- DB-backed home stats via `getHomeStats()`,
- DB-backed leaderboard/trend helpers where safe,
- preserve unavailable/empty DB state without hardcoded fallback.

### Boundaries

- No schema/migration in this task.
- No admin claim changes in this task.
- No hardcoded fallback.
- No official numeric APBDes claim.
- Keep demo/trust badges visible.

### QA requirements

- Desktop and mobile screenshots before-after for `/desa`.
- Desktop and mobile screenshots before-after for homepage if changed.
- Verify search/filter/sort/pagination behavior.
- Verify empty/unavailable state.

### Acceptance criteria

- Client no longer receives unbounded full desa dataset for list browsing.
- Search/filter/sort/page are represented in URL/search params.
- Server returns pagination metadata.
- Home stats are not computed by loading the full list into the page.
- Build remains safe when DB is unavailable.

---

## Task 04-006E — Trust Layer, Security, and Privacy Consistency

Priority: P1/P2, can run after 04-006D or in parallel if not touching same files
Executor: Ujang/Asep local for implementation, Rangga for spec/review
Rangga role: trust copy, security checklist, governance guardrail
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
Escalate to high if: verified governance, APBDes numeric status, privacy exposure, admin role proof, token security, SSRF, or legal/reputation risk appears.

### Goal

Make public trust framing and security rules consistent before deeper admin claim features are implemented.

### Scope

- Audit UI usage of `DataStatusBadge`.
- Map Prisma `DataStatus` values to UI-safe statuses/copy.
- Keep `verified` disabled until governance exists.
- Ensure `source-found` never implies verified.
- Check public UI for private email/phone exposure.
- Add validation/security checklist for route handlers.
- For citizen voice text, confirm safe rendering/escaping and length validation.
- For query params, confirm validation and safe parsing.

### Boundaries

- Do not enable `verified`.
- Do not claim official data truth.
- Do not add sanitizer dependency without Owner approval.
- Do not expose private contact details.

### QA requirements

If UI is touched, capture desktop/mobile screenshots.

### Acceptance criteria

- Status badge usage is consistent across public desa/detail/source/document/perangkat surfaces.
- Verified remains inactive/disabled.
- Public copy clearly distinguishes demo/source-found/needs-review.
- Security/privacy checklist is documented for admin claim and voice APIs.

---

## Task 04-006F — Voice to Desa Relation Migration Plan and Gated Implementation

Priority: P2, gated after quality/test foundation
Executor: Ujang/Asep local for audit/migration
Rangga role: migration plan and review
Recommended model: GPT-5.1
Reasoning effort: high
Escalate to high by default because this touches schema, migration, existing data, and foreign keys.

### Goal

Safely connect `Voice.desaId` to the existing `Desa` model without orphaning existing voice records.

### Adjusted finding

`Desa` already exists. The gap is that `Voice.desaId` is currently a plain string without a Prisma relation/foreign key.

### Required pre-migration audit

- Inspect existing `voices.desaId` values.
- Determine whether they match `Desa.id`, `Desa.slug`, `kodeDesa`, or legacy/mock identifiers.
- Produce orphan/mismatch report.
- Do not delete or mutate old voice data automatically.

### Implementation scope after audit approval

- Add Prisma relation from `Voice` to `Desa` only after data is compatible or migration mapping is approved.
- Update seed data with valid desa references.
- Update voice queries/API to use relation where appropriate.
- Add tests for invalid desa, missing desa, and per-desa voice reads.

### Boundaries

- No destructive migration without Owner approval.
- No seed reset without Owner approval.
- No auto-delete orphan voices.
- Stop and ask if production-like data mismatch exists.

### Acceptance criteria

- Migration plan exists before schema change.
- Orphan report is produced.
- FK is added only after data compatibility is confirmed or migration mapping is approved.
- Tests cover invalid/missing desa behavior.

---

## Task 04-006G — Developer Documentation and OSS Minimum Readiness

Priority: P2 after commands/CI are known-good
Executor: Rangga can draft; Ujang/Asep verifies commands locally
Recommended model: GPT-5.1 Codex mini
Reasoning effort: low/medium
Escalate to high if docs require changing env, CI secrets, deployment, or production DB assumptions.

### Goal

Make local development and contribution flow clear enough for future collaborators without adding unnecessary process overhead.

### Scope

Update or add:

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

- README reflects real verified commands.
- CONTRIBUTING explains commit, lint, test, CI, and screenshot expectations.
- Issue/PR templates help future QA/review.

---

## Task 04-006H — Admin Claim Verification Services Batch

Priority: P2/P3 after quality gate and critical tests are stable
Executor: Ujang/Asep local
Rangga role: task spec, security review, audit event design, final review
Recommended model: GPT-5.1
Reasoning effort: high
Escalate to high by default because this touches auth, email, token, website check, role, audit, invite, report, SSRF, and reputation risk.

### Goal

Implement the real admin claim service batch only after the technical gate is stable enough to catch regressions.

### Scope

Owner-requested admin claim service items remain valid, but should run after stabilization:

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
- Desktop/mobile screenshots for any UI changes.

### Acceptance criteria

- Admin claim actions persist to DB.
- Token and email flows are testable and auditable.
- Website checker blocks private/internal URLs.
- Status transitions are safe and logged.
- Invite/report flows do not imply verified admin without governance.

---

# Rangga vs Ujang/Asep split

## Rangga can do without local QA guardrail

- BMAD task planning and sequencing.
- Acceptance criteria.
- Guardrail checks.
- CI workflow draft review.
- Test matrix.
- Query contract.
- Caching/trust/security specs.
- Migration plan review.
- README/CONTRIBUTING draft.
- Review commits/logs/screenshots from Ujang/Asep.

## Ujang/Asep must do locally

- Code changes.
- Lint/build/test/typecheck runs.
- Prisma generate and migration.
- DB audits.
- CI workflow implementation and run validation.
- UI QA and screenshots.
- Server query implementation.
- Route handler tests.
- Admin claim runtime/email/token tests.

---

# Recommended sprint order

1. 04-006A — Lint & Build Gate Stabilization.
2. 04-006B — GitHub Actions CI Quality Gate.
3. 04-006C — Critical Test Foundation.
4. 04-006D — Public Read Path Scalability.
5. 04-006E — Trust Layer, Security, and Privacy Consistency.
6. 04-006F — Voice to Desa Relation Migration Plan and Gated Implementation.
7. 04-006G — Developer Documentation and OSS Minimum Readiness.
8. 04-006H — Admin Claim Verification Services Batch.

## Notes on parallelization

- 04-006A should happen first.
- 04-006B depends on 04-006A being mostly stable.
- 04-006C can start after lint/build direction is clear.
- 04-006D should not conflict with admin claim work.
- 04-006E can run in parallel with 04-006D only if file ownership is coordinated.
- 04-006F is migration-gated and should not start before test foundation.
- 04-006H should wait until quality gate and critical tests exist.

## Definition of done for this BMAD batch

- Tasks are executed in order without bypassing gates.
- CI catches lint/test/typecheck/build regressions.
- Public read path avoids unbounded client full-list behavior.
- Trust badges stay consistent and demo-safe.
- No verified/public official claims are introduced without governance.
- Migration work produces an audit/mismatch report before FK enforcement.
- Admin claim services ship only after security/test gates are ready.

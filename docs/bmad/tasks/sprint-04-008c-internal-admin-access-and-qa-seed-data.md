# Sprint 04-008C — Internal Admin Access & QA Seed Data

Date: 2026-04-30
Status: backlog / not-approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Related:
- `docs/bmad/tasks/sprint-04-008a-admin-desa-verification-review-otp-flow.md`
- `docs/bmad/tasks/sprint-04-008b-admin-desa-profile-tabs.md`
- `docs/bmad/tasks/sprint-04-008-internal-admin-feature-backlog.md`

## Purpose

Define the access model for PantauDesa internal admin and define database-backed dummy/seed data needed for QA testing Admin Desa flows.

This is a planning/backlog document only. Do not assign developer execution until Owner explicitly approves.

## Owner decisions captured

1. Internal admin must use the normal user login form.
2. No separate internal-admin login page is needed for now.
3. Owner should be added as internal admin via a database flag/role.
4. Internal admin access must be granted by database state, not by hardcoded email in UI/client code.
5. QA needs dummy data for several Admin Desa `VERIFIED` and `LIMITED` users.
6. QA needs dummy data for uploaded documents and document statuses.
7. Dummy data must be fetched from the database by the UI/API, not hardcoded in React components.
8. Dummy data is for local/staging QA only and must not leak into production unless explicitly approved.

## Internal admin access model

### Login behavior

Internal admin logs in using the same user login form as normal users.

```text
normal login form
→ authenticated user
→ server checks database flag/role
→ if internal admin: allow internal admin pages/actions
→ otherwise: block internal admin pages/actions
```

### Database flag/role requirement

Future implementation may use one of these patterns, depending on current schema:

```text
User.role = INTERNAL_ADMIN
```

or

```text
User.isInternalAdmin = true
```

or a separate membership table:

```text
InternalAdminUser(userId, status, createdAt, createdBy)
```

Final implementation should follow the existing project schema style and avoid unnecessary migration complexity.

### Owner internal admin seed

Add Owner as internal admin through seed/local DB update.

Rules:

- Do not hardcode Owner email in client components.
- Do not expose internal admin list publicly.
- If Owner email is needed, use a seed/config variable or documented local seed placeholder.
- Internal admin permission checks must happen server-side.

Suggested placeholder:

```env
SEED_INTERNAL_ADMIN_EMAIL="owner@example.com"
```

Note: env name is only a suggestion for future execution. Do not add new env unless Owner approves during implementation.

## Internal admin authorization guardrails

Internal admin routes/actions must check permission server-side.

Must protect:

- internal review queue,
- approve/reject Admin Desa verification,
- reject reason/instruction submission,
- fraud/suspicious cooldown decisions,
- OTP/freeze inspection if any,
- document review,
- AI mapping/publish action,
- audit viewer,
- support inbox/contact handling,
- renewal review,
- admin access removal due to failed/missed renewal.

Guardrails:

- `User.role = DESA` or Admin Desa membership is not internal admin permission.
- Admin Desa `VERIFIED` is not internal admin permission.
- Never trust client-side flags for internal admin access.
- Internal admin pages must not expose private data beyond what is needed for review.
- Every sensitive internal admin action must create audit event.

## QA seed data goals

Seed data should let QA test flows from the database end-to-end.

The app must read the data through real DB queries/API routes. Do not mock these states inside UI components.

### Required QA seed entities

Create local/staging seed data for:

1. normal user with no claim,
2. user with `PENDING` claim,
3. user with `IN_REVIEW` website-token claim,
4. user with `IN_REVIEW` email-OTP claim,
5. user with `REJECTED` claim and clear reason,
6. user with fraud/suspicious `REJECTED` and 3-day cooldown,
7. Admin Desa `VERIFIED`,
8. Admin Desa `LIMITED` invited by `VERIFIED`,
9. internal admin user,
10. desa with exactly one `VERIFIED` admin,
11. desa with several `LIMITED` admins,
12. desa with document records in each test status.

### Admin Desa membership seed

Seed several Admin Desa memberships:

```text
Desa A:
- 1 VERIFIED admin
- 2 LIMITED admins

Desa B:
- 1 VERIFIED admin
- 1 LIMITED admin

Desa C:
- no verified admin, only claim states for verification QA
```

Rules:

- Enforce one `VERIFIED` admin per desa.
- `LIMITED` records should be tied to invite flow where possible.
- Use fake/non-real emails.
- Do not use real resident/private data.

### Document seed

Seed documents for Admin Desa QA:

```text
PROCESSING
PUBLISHED
FAILED
WAITING_VERIFIED_APPROVAL or equivalent for LIMITED upload pending verified approval
```

Each document should include:

- desaId,
- uploader user/admin,
- uploadedAt,
- document title/type,
- storage path placeholder or local dummy path,
- status,
- failure reason for `FAILED`,
- internal review/mapping metadata if applicable.

Rules:

- Use placeholder files/paths unless storage is implemented.
- Do not commit real documents.
- If using Supabase Storage later, use private bucket and placeholder/local test files only.
- Document status must be fetched from DB.

### Notification seed

Seed notifications to test Admin Desa `Notifikasi` tab:

- new published suara/comment on desa,
- reply to admin comment,
- like/vote event,
- invite accepted,
- limited document waiting for verified approval,
- document processing finished,
- document failed with reason,
- renewal reminder.

Rules:

- Notification scope must be limited to the admin's desa.
- Do not show notifications from another desa.
- Do not expose private user data.

### Suara/comment seed

Seed published suara/comments for the `Suara` tab:

- only published comments should appear,
- include at least one comment with replies,
- include engagement examples: like/vote if supported,
- include another desa's comments to prove filtering.

## QA scenarios supported by seed data

The seed data should allow QA to test:

### Internal admin

- internal admin login through normal login form,
- internal admin can access internal review queue,
- normal user cannot access internal review queue,
- Admin Desa `VERIFIED` cannot access internal review queue,
- internal admin approves `IN_REVIEW` claim,
- internal admin rejects with reason/instruction,
- fraud/suspicious rejection applies 3-day cooldown.

### Admin Desa verification

- `PENDING` user sees verification next steps,
- website-token success state enters `IN_REVIEW`,
- email OTP success state enters `IN_REVIEW`,
- `REJECTED` user sees reason and reapply date,
- cooldown blocks reapply before allowed date.

### Admin Desa profile tabs

- `VERIFIED` sees profile tabs,
- `LIMITED` access follows policy,
- non-admin does not see Admin Desa tabs,
- List Admin shows exactly one `VERIFIED` and multiple `LIMITED`,
- `VERIFIED` can invite admin,
- `VERIFIED` can revoke/delete `LIMITED` only,
- Dokumen shows processing/published/failed/waiting approval states,
- Suara shows published comments only,
- Notifikasi shows desa-scoped events only.

## Implementation guidance for future task

- Prefer Prisma seed or project-consistent seed script.
- Keep seed idempotent where practical.
- Seed must be easy to reset locally.
- Document how to run seed.
- Do not mix dummy seed data with production migrations.
- Use clearly fake names/emails/domains.
- Avoid hardcoded UI mocks.
- Use DB queries/API to render seeded states.

Possible commands to document later:

```bash
npm run seed
npm run seed:qa
npx prisma db seed
```

Actual command depends on existing project scripts.

## Data privacy and safety

- Never seed real personal data.
- Never seed real government credentials.
- Never commit real documents.
- Never expose internal admin flag in public APIs unless necessary and safe.
- Use placeholder domains/emails.
- Keep QA data clearly identifiable as dummy/demo.

## Open decisions before execution

- Exact schema field for internal admin flag/role.
- Owner email/config mechanism for internal admin seed.
- Whether QA seed lives in default seed or separate `seed:qa`.
- Whether seeded document paths require storage implementation first.
- Exact document status enum.
- Exact notification model/event source.
- Whether internal admin review queue is implemented in the same task or split.

## Acceptance criteria for future execution

A future implementation must prove:

- internal admin uses normal login form,
- internal admin permission is DB-backed and server-side enforced,
- Owner can be seeded/flagged as internal admin,
- normal user cannot access internal admin pages/actions,
- Admin Desa `VERIFIED` cannot access internal admin pages/actions,
- QA seed creates several verified/limited admins,
- QA seed creates document records in required statuses,
- UI/API reads QA data from DB,
- no dummy data is hardcoded into UI components,
- seed data is fake/non-sensitive,
- seed instructions are documented.

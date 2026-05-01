# Sprint 04-008.0 — Foundation Schema, Role, Status & Audit Contract

Date: 2026-05-01
Status: planning / not-approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Related:
- `docs/bmad/tasks/sprint-04-008-execution-sequencing-plan.md`
- `docs/bmad/tasks/sprint-04-008a-admin-desa-verification-review-otp-flow.md`
- `docs/bmad/tasks/sprint-04-008b-admin-desa-profile-tabs.md`
- `docs/bmad/tasks/sprint-04-008c-internal-admin-access-and-qa-seed-data.md`
- `docs/bmad/tasks/sprint-04-008e-business-flow-governance-decisions.md`

## Purpose

Lock the foundation contract before Sprint 04-008 execution starts, so developers do not make assumptions about status enums, Admin Desa membership rules, internal admin audit, document status, upload storage, or approval transitions.

This document should be read before any 04-008 implementation task.

## Owner decisions captured

1. Do not hard delete Admin Desa membership records.
2. Removing Admin Desa `LIMITED` means revoke/remove membership access while preserving history.
3. One user may not hold `LIMITED` or `VERIFIED` Admin Desa membership in more than one desa at the same time.
4. If invited again while already registered in another desa, show validation explaining they are already registered in Desa X and must be revoked/removed first.
5. A user may be invited again by the same or another desa only after the existing Admin Desa membership is revoked/removed.
6. Internal admin actions must have audit trail / log history table.
7. Internal admin audit logs must include actor, action, target, metadata, IP address, location where available, created date, updated date, and related entity IDs.
8. `LIMITED` admins can view and preview documents, not only upload.
9. Notification work should be completed in Sprint 04-008, not intentionally carried over, as long as the implementation instructions are clear and bounded.
10. AI mapping scope for MVP is limited to agreed safe fields; future enhancement can expand gradually.
11. Rejection should use reason category/template plus free-text reason/instructions.
12. Storage setup for document upload must be done in 04-008.
13. Claim approval and Admin Desa membership verification should be separate state changes: claim becomes `APPROVED`; membership becomes `VERIFIED`.
14. Owner allows developer discretion for final Prisma enum names, internal admin route, notification schema, AI provider/model, and exact MVP source field mapping as long as the business contract in this BMAD is preserved.
15. Storage bucket/env setup may be implemented by developer through local/cloud instructions or migration/setup script if the platform supports it, but Owner must still provide/confirm real cloud credentials and secrets. Real secrets must never be committed.

## Developer discretion boundaries

Owner gave flexibility for the following details:

- final Prisma enum names,
- exact internal admin route,
- exact notification schema,
- exact AI provider/model,
- exact MVP source fields to map.

This flexibility does not allow changing the core business rules:

- claim status and membership status must stay conceptually separated,
- token/OTP success must go to review, not direct `VERIFIED`,
- one active Admin Desa membership per user,
- one active `VERIFIED` per desa,
- no hard delete for membership history,
- internal admin action audit is required,
- storage must be private by default,
- user-facing states must remain clear.

## Status model contract

### Claim status

Recommended claim statuses:

```text
PENDING
IN_REVIEW
REJECTED
APPROVED
```

Meaning:

- `PENDING`: claim created, waiting for verification signal or user action.
- `IN_REVIEW`: verification signal/support evidence received and waiting internal admin review.
- `REJECTED`: internal admin rejected claim with reason and instructions.
- `APPROVED`: internal admin approved claim. Approval should create/update Admin Desa membership.

Important:

- `IN_REVIEW` is not an admin role.
- `REJECTED` is not an admin role.
- `APPROVED` claim does not replace membership status; it triggers membership state.

### Admin Desa membership status

Recommended membership statuses:

```text
LIMITED
VERIFIED
REVOKED
EXPIRED
```

Meaning:

- `LIMITED`: invite-only Admin Desa with restricted access.
- `VERIFIED`: verified Admin Desa, exactly one per desa.
- `REVOKED`: membership removed/revoked but history retained.
- `EXPIRED`: verified access expired, usually due to renewal not completed.

Important:

- Do not hard delete membership records.
- Use `REVOKED`/`EXPIRED` or equivalent status to preserve audit/history.
- UI may say `Hapus Admin`, but backend should revoke/remove access, not hard delete.

## Membership uniqueness rules

### One VERIFIED per desa

Only one active `VERIFIED` Admin Desa may exist per desa.

### One active Admin Desa membership per user

One user must not have active Admin Desa membership in more than one desa.

Active membership includes:

```text
LIMITED
VERIFIED
```

Non-active membership includes:

```text
REVOKED
EXPIRED
```

### Invite validation

When a `VERIFIED` admin invites a user/email:

- If the invited user/email is already active `LIMITED` or `VERIFIED` for any desa, block invite.
- Show clear validation message.

Suggested copy:

```text
User ini sudah terdaftar sebagai Admin Desa di {desaName}. Minta Admin Desa VERIFIED di desa tersebut untuk revoke/remove akses terlebih dahulu sebelum user ini bisa diundang ke desa lain.
```

For same-desa duplicate:

```text
User ini sudah terdaftar sebagai Admin Desa di desa ini. Tidak bisa ditambahkan dua kali.
```

After revoked/removed:

- user may be invited again by same desa or another desa,
- new invite creates a new membership/invite trail,
- old membership remains as `REVOKED` for history.

## Delete/revoke semantics

### UI label

UI may use a user-friendly label:

```text
Hapus Admin
```

But the action should be implemented as:

```text
Revoke/remove access
```

### Behavior

- `VERIFIED` may revoke/delete `LIMITED` admin only.
- `VERIFIED` may not revoke/delete another `VERIFIED` admin.
- `LIMITED` may not revoke/delete anyone.
- Internal admin may revoke/remove according to internal policy.
- Action requires confirmation.
- Action should ask for reason where practical.
- Action must write audit event.
- Affected user should receive notification/email if available and appropriate.

## Internal admin audit/log history table

Internal admin actions must be logged in an audit/log-history table.

Minimum recommended fields:

```text
id
actorUserId
actorRole
actorDisplayNameSnapshot
action
entityType
entityId
targetUserId
desaId
ipAddress
location
userAgent
metadataJson
reasonCategory
reasonText
beforeSnapshotJson
afterSnapshotJson
createdAt
updatedAt
```

Notes:

- `location` can be best-effort derived from IP or request context if available.
- Do not block action only because location cannot be resolved.
- Do not log OTP/plain secrets.
- Do not log sensitive fraud detection internals.
- Store enough metadata to review who did what, when, from where, and to which entity.
- Shared internal admin account is accepted for MVP, but logs should still capture request metadata and optional reviewer note/name if provided.

Actions that must be logged:

- internal admin approves claim,
- internal admin rejects claim,
- internal admin marks fraud/suspicious,
- internal admin applies 3-day cooldown,
- internal admin reviews renewal,
- internal admin removes verified access,
- internal admin reviews document,
- internal admin runs/accepts AI mapping,
- internal admin publishes mapped data,
- internal admin marks document failed,
- verified admin invites limited admin,
- verified admin revokes limited admin,
- verified admin approves limited document upload into processing.

## Rejection reason contract

Rejection must support both:

1. reason category/template, and
2. free-text reason/instructions.

Recommended categories:

```text
WEBSITE_NOT_OFFICIAL
WEBSITE_MISMATCH
TOKEN_NOT_VALID
EMAIL_NOT_CONVINCING
DOCUMENT_NOT_SUFFICIENT
SOURCE_CONFLICT
SUSPICIOUS_ACTIVITY
RENEWAL_FAILED
OTHER
```

Required fields:

```text
reasonCategory
reasonText
fixInstructions
reapplyAllowedAt
```

For fraud/suspicious rejection:

```text
cooldown = 3 days
```

Do not expose detailed fraud detection signals.

## Document access and status contract

### LIMITED document access

Admin Desa `LIMITED` can:

- upload documents for their desa,
- view and preview documents they are allowed to access,
- see status of their uploaded documents,
- see clear explanation that their upload needs `VERIFIED` approval before internal processing.

Admin Desa `LIMITED` cannot:

- publish documents/data,
- approve documents into internal processing,
- invite/revoke admins.

### VERIFIED document access

Admin Desa `VERIFIED` can:

- upload documents directly into `PROCESSING`,
- view and preview desa documents,
- approve `LIMITED` document uploads into `PROCESSING`,
- see document status and failure reasons.

### Document statuses

Keep MVP document statuses simple:

```text
WAITING_VERIFIED_APPROVAL
PROCESSING
PUBLISHED
FAILED
```

Meaning:

- `WAITING_VERIFIED_APPROVAL`: uploaded by `LIMITED`, waiting for `VERIFIED` approval.
- `PROCESSING`: waiting for internal admin review / AI mapping / publish decision.
- `PUBLISHED`: approved/mapped/published successfully.
- `FAILED`: failed/rejected with user-safe reason.

## Storage contract

Storage setup must be included in 04-008, before document upload execution is marked done.

Required baseline:

- private bucket by default,
- max file size 10 MB per upload,
- server-side upload/permission guard,
- signed URL or safe preview mechanism,
- no public exposure of uploaded private documents by default,
- no service role key in client code,
- allowed MIME types defined before execution,
- document category/title required,
- audit event for upload/preview/access where practical.

Use existing or approved env names; do not create duplicate env vars if equivalent already exists.

### Storage provisioning decision

Storage can be prepared in either of these ways:

1. Owner manually creates/confirms the Supabase Storage bucket in Supabase dashboard, then provides env values.
2. Developer creates a safe local/cloud setup instruction or script to create the bucket/policies if Supabase tooling and project access support it.

Requirements either way:

- bucket must be private by default,
- real credentials/secrets must be stored only in env/config, not committed,
- service role key must never be used in client code,
- setup instructions must be documented,
- local/staging/production setup must be explicit,
- if equivalent Supabase env vars already exist, reuse them and do not create duplicate env names.

Owner/operator may still need to do these actions:

- create/confirm Supabase project,
- create/confirm private storage bucket,
- copy anon key/service-role key into local/cloud env,
- configure production env in hosting provider,
- confirm storage billing/limits.

Developer may do these actions if access/tooling allows:

- write bucket setup instructions,
- add storage client/server helper,
- add server-side upload route,
- add signed URL preview route,
- add validation for 10 MB max file size and MIME types,
- add QA seed placeholders for document records,
- document required env vars in `.env.example` with placeholders only.

## AI mapping MVP scope

AI mapping should be limited for MVP.

Allowed initial scope:

- profil desa,
- kontak resmi,
- perangkat desa,
- website/email/sosial resmi,
- safe alamat/kecamatan/kabupaten metadata if applicable.

Out of MVP scope unless approved:

- APBDes/numeric budget extraction,
- sensitive demographic details,
- personal resident data,
- private identity documents,
- auto-publish.

## Notification scope

Notifications should be completed in 04-008 with clear bounded instructions.

Channel rule:

- application/review-related events: email where appropriate,
- engagement events: in-app only by default.

Avoid leaving notification core as intentional carry-over if it blocks user/admin/internal flow clarity.

## Claim approval to membership transition

When internal admin approves a claim:

```text
Claim.status = APPROVED
AdminDesaMembership.status = VERIFIED
```

Do not use claim `VERIFIED` as a replacement for membership `VERIFIED`.

This separation avoids confusion between:

- claim lifecycle, and
- active Admin Desa access.

## Acceptance criteria for foundation execution

A future 04-008.0 implementation must prove:

- claim status and membership status are separated,
- no hard delete for admin membership removal,
- one active `LIMITED`/`VERIFIED` membership per user is enforced,
- one active `VERIFIED` per desa is enforced,
- duplicate invite to same/other desa is blocked with clear copy,
- internal admin action log table exists,
- audit captures IP/userAgent/location best-effort/createdAt/updatedAt,
- rejection supports category + free text + fix instructions,
- document statuses are defined,
- storage requirements are documented and ready before document upload,
- AI mapping MVP scope is bounded,
- no sensitive secrets/OTP/fraud details are logged.

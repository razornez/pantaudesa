# Sprint 04-008 — Internal Admin Feature Backlog

Date: 2026-04-29
Status: backlog / not-approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner requested collecting all internal-admin and post-claim Admin Desa governance features into a separate future batch.

## Purpose

Collect internal admin and post-claim Admin Desa features that are related to Desa Admin verification, review, moderation, audit, document contribution, AI-assisted extraction, source traceability, and data governance, but are intentionally not part of Sprint 04-007.

This document is a backlog/task container only. It is not approved for implementation yet.

## Mandatory zero-bug checklist

Any future 04-008 execution subtask must read and satisfy:

```text
docs/bmad/checklists/admin-desa-zero-bug-readiness-checklist.md
```

04-008 features are high-risk because they may touch internal permissions, admin status, uploaded documents, AI-assisted extraction, source status, and public Desa detail. A selected 04-008 execution task must not be marked PASS if unresolved issues exist in unauthorized access, stale state, audit trail, private data exposure, destructive actions, AI overwrite risk, storage privacy, or public data ownership confusion.

## Why separate from Sprint 04-007

Sprint 04-007 should focus on user-facing claim admin UI integration and browser QA.

Internal admin and Admin Desa post-claim features are separated because they may require:

- internal-only roles/permissions,
- review queue design,
- status governance,
- moderation decisions,
- audit viewer,
- document upload/storage,
- Supabase Storage bucket and access-policy setup,
- AI extraction pipeline,
- data mapping to public Desa detail,
- source traceability/dataStatus governance,
- more sensitive data access,
- possible schema/API adjustments,
- stronger QA and access control.

## Ownership

- PIC: not assigned yet
- Reviewer: Rangga
- Gate owner: Iwan/Owner
- Status: do not assign until Owner explicitly approves

## Global guardrails

- Admin membership verification is not the same as public data verification.
- Admin Desa `VERIFIED` may publish/update data for their own desa directly, with audit trail and source traceability.
- Admin Desa `LIMITED` may prepare drafts/supporting documents but must not publish public data.
- No AI result may directly overwrite public Desa data without explicit Admin Desa action.
- No internal admin review layer should be required before a `VERIFIED` Admin Desa publishes their own village data, unless Owner later approves a special dispute/safety workflow.
- Do not create a manual feature to change source status into `verified`; if source/data changes, the admin should upload/update the supporting document/source instead.
- No automatic punishment/suspension based only on reports.
- No private email/phone exposure.
- No destructive migration without approval.
- No new dependency without approval.
- No new env without approval.
- All internal admin and Admin Desa data-contribution actions must have audit trail.
- Internal admin UI must not be public-accessible.
- Uploaded documents must not be publicly exposed by default.
- Supabase Storage buckets for uploaded documents must be private by default.

---

# Admin Desa role access model

This role model is the current Owner-approved direction for future 04-008 planning. It should stay simple and avoid confusing users.

## PENDING

Meaning:

- claim has been created,
- user is not yet an active Admin Desa,
- user is still waiting for email/website verification or invite acceptance.

Allowed:

- view claim status,
- continue verification flow,
- use Hubungi Admin/support.

Not allowed:

- access full Admin Desa dashboard,
- publish data,
- invite admin,
- upload official source documents as active admin.

## LIMITED Admin Desa

Meaning:

- user is an active Admin Desa with restricted access,
- user is not fully verified yet,
- user can prepare data/supporting evidence but cannot publish public village data.

Allowed:

- access Admin Desa dashboard,
- view own admin status,
- read guide/FAQ,
- use Hubungi Admin/support,
- continue verification toward `VERIFIED`,
- generate/check website token for verification,
- edit/save draft data desa,
- upload supporting documents/source documents for their own desa,
- upload/update documents if source changes.

Not allowed:

- publish/update public Desa data,
- invite another admin,
- revoke/suspend another admin,
- change another admin role/status,
- remove another admin,
- manually mark source/data as verified,
- access internal PantauDesa admin panel,
- perform destructive actions such as deleting a desa or bulk deleting public data.

UI copy direction:

```text
Kamu sudah menjadi Admin Desa LIMITED. Kamu bisa melengkapi draft data dan dokumen pendukung, tetapi belum bisa publish data atau mengundang admin lain. Selesaikan verifikasi website untuk menjadi VERIFIED.
```

## VERIFIED Admin Desa

Meaning:

- user is a fully verified Admin Desa for their own desa,
- user can manage and publish data for their own desa,
- user must renew verification periodically.

Allowed:

- all LIMITED capabilities,
- publish/update public Desa data directly for their own desa,
- upload/update supporting documents/source documents,
- invite another admin by email,
- manage invite flow within max-admin rules,
- perform 6-month website verification renewal.

Not allowed for MVP:

- revoke/suspend another admin,
- change another admin role/status,
- remove another admin,
- manually mark source/data as verified,
- access internal PantauDesa admin panel,
- view private user/admin data outside their own desa context,
- perform destructive actions such as deleting a desa or bulk deleting public data.

UI copy direction:

```text
Kamu adalah Admin Desa VERIFIED. Kamu bisa publish data desa dan mengundang admin lain. Status VERIFIED perlu diperbarui setiap 6 bulan melalui verifikasi website.
```

## Renewal rule

- Renewal applies only to `VERIFIED` Admin Desa.
- Renewal is based on website verification.
- If a `VERIFIED` admin does not renew, future implementation may downgrade them to `LIMITED` after a grace period.
- `LIMITED` admins do not need renewal because they are not fully verified yet.

## Source/status rule

- Do not create a manual action such as `Mark source as verified`.
- If data/source changes, Admin Desa should upload or update the supporting document/source.
- Source traceability should be based on uploaded/current documents, timestamps, uploader, and audit logs.
- Admin Desa `VERIFIED` can publish data directly, but every publish must be auditable.

## Sensitive actions examples

Sensitive actions that should not be given to `LIMITED` or `VERIFIED` Admin Desa in MVP:

- revoke admin,
- suspend admin,
- promote `LIMITED` admin to `VERIFIED`,
- downgrade `VERIFIED` admin to `LIMITED`,
- remove another admin from a desa,
- delete a desa,
- bulk delete public data,
- delete source documents without retention policy,
- view internal audit/private user data outside own desa context,
- access internal PantauDesa admin panel.

These actions should remain internal-admin/backlog-only until Owner approves a separate workflow.

---

# Backlog items

## 04-008A — Internal Admin Review Queue

Goal:

Create an internal-only queue for claim cases or escalations that cannot be resolved through email/website verification or standard support.

Potential scope:

- list pending/support-review claims or escalations,
- view user/desa/method/evidence summary,
- view audit timeline,
- approve/downgrade/suspend only if Owner approves the policy,
- reject with reason,
- request more info,
- write audit event for every decision.

Out of scope until approved:

- public data ownership override,
- mandatory internal review before `VERIFIED` Admin Desa publishes their own data,
- automatic approval,
- bulk actions,
- AI decisioning.

Key decisions needed:

- Which internal role can access the queue?
- Can internal admin grant `VERIFIED`, or only handle escalation/support cases?
- What evidence is required for approval/escalation?

## 04-008B — Revoke / Suspend Admin Membership

Goal:

Allow internal admin to safely suspend, revoke, or downgrade desa admin membership in a future governed workflow.

Potential scope:

- suspend admin membership,
- revoke admin membership,
- downgrade `VERIFIED` to `LIMITED`,
- reason required,
- audit event required,
- notify affected user if email flow exists,
- prevent user from self-revoking others unless Owner later approves a separate verified-admin governance flow.

Guardrails:

- no auto-suspend from report alone,
- no hidden destructive action,
- every action must be auditable,
- Admin Desa `VERIFIED` should not be allowed to revoke/suspend other admins in MVP.

Key decisions needed:

- Who can suspend/revoke?
- Should suspended users be able to appeal/contact admin?
- What happens to pending invites from suspended admin?
- Should a future primary-admin concept exist?

## 04-008C — Invite Management Dashboard

Goal:

Provide visibility into invite status without overloading Sprint 04-007.

Potential scope:

- list pending invites,
- list expired invites,
- resend invite,
- cancel invite,
- show invited email masked if needed,
- show invitedBy and expiry,
- enforce max 5 admins per desa,
- write audit event for resend/cancel.

Out of scope until approved:

- role hierarchy beyond current model,
- bulk invite,
- invite analytics,
- auto-promote invitee to `VERIFIED`,
- auto-remove admin to fit max 5.

Key decisions needed:

- Is this for verified desa admin, internal admin, or both?
- Should resend reuse token or generate a new token?
- How long should invites remain visible after expiry?

## 04-008D — Admin Claim Audit Viewer

Goal:

Expose audit events in an internal-safe viewer so support/moderation decisions can be traced.

Potential scope:

- audit timeline per claim,
- audit timeline per desa admin member,
- filter by event type,
- show actor/target/status transition,
- redact token/private email metadata,
- export/copy summary for support only if approved.

Guardrails:

- no raw tokens,
- no private contact exposure,
- no public access,
- no editable audit events,
- audit viewer must not become a tool to manually rewrite public data/source status.

Key decisions needed:

- Which metadata is safe to show?
- Who can view audit events?
- How long should audit events be retained?

## 04-008E — Admin Verification Renewal Enforcement

Goal:

Implement the 6-month website verification renewal policy beyond UI copy.

Owner decision already captured:

- website verification should be renewed every 6 months,
- renewal applies to `VERIFIED` Admin Desa only,
- if not renewed, admin status should eventually return to `LIMITED` or similar.

Potential scope:

- store/derive `verificationExpiresAt`,
- show internal list of admin verifications near expiry,
- show renewal notice to `VERIFIED` Admin Desa,
- manual renewal trigger through website token,
- automatic downgrade if scheduler exists later,
- audit renewal/downgrade events,
- notify admin before expiry if email notification is approved.

Out of scope until approved:

- cron/scheduler if infrastructure is not ready,
- schema migration without approval,
- auto-downgrade without review of edge cases,
- renewal requirement for `LIMITED` admins.

Key decisions needed:

- Is renewal based on `verifiedAt + 6 months`?
- Should downgrade be automatic or internal-review triggered?
- Should email reminders be sent before expiry?
- Is there a grace period before downgrade?

## 04-008F — Internal Admin Support Inbox / Contact Handling

Goal:

Handle messages sent through the reusable Hubungi Admin form in a structured internal flow.

Potential scope:

- list contact submissions if stored in DB,
- mark as open/in-progress/resolved,
- assign owner,
- reply via email if approved,
- link contact messages to claim/desa/user when possible.

Important:

Sprint 04-007 only sends contact email. It does not need to create this internal inbox.

Key decisions needed:

- Should Hubungi Admin messages be stored in DB or email-only?
- Who receives/handles contact messages?
- Is there a privacy retention policy?

## 04-008G — Admin Desa Document Contribution & AI-Assisted Data Extraction

Goal:

Allow eligible Admin Desa to upload/update official village documents, optionally use AI to assist extraction/mapping, then let `VERIFIED` Admin Desa publish data for their own desa directly with audit trail and source traceability.

This item is related to Admin Desa, but it is post-claim data contribution, not claim verification. It must not be folded into Sprint 04-007.

Potential scope:

### 04-008G.0 — Supabase Storage setup for Admin Desa documents

- Set up a dedicated Supabase Storage bucket for Admin Desa uploaded documents.
- Bucket must be private by default, not public.
- Suggested bucket name: `admin-desa-documents` or equivalent project-consistent name.
- Define folder/path convention before upload implementation, for example:
  - `desa/{desaId}/documents/{documentId}/{safeFileName}`
  - or `admin-desa/{desaId}/{yyyy}/{mm}/{documentId}-{safeFileName}`
- Access must be controlled server-side; do not expose service-role keys to the client.
- Use signed URLs for temporary admin/reviewer access if needed.
- Define max URL lifetime for signed URLs.
- Define allowed file types before enabling upload, such as PDF and common image formats only if approved.
- Define max file size and per-desa upload limits.
- Define retention/deletion policy for obsolete or superseded documents.
- Define whether original files can be deleted after extraction or must be retained for audit/source traceability.
- Store storage object path/key in DB, not a public URL.
- Add audit event for document upload, access/download if required, extraction, publish, and delete/archive actions.
- Add QA cases for bucket privacy, signed URL access, unauthorized access rejection, and cleanup behavior.

Approved env storage location:

- Supabase Storage credentials/config must be stored in environment variables only.
- Do not hardcode Supabase URL, anon key, service role key, bucket name, signed URL lifetime, or upload limits in source code.
- Do not expose service role credentials to client-side code.
- Do not commit real credentials in `.env.example`, docs, tests, screenshots, or handoff reports.

Required env vars to add for 04-008G execution:

```env
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<public-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<server-only-service-role-key>"
SUPABASE_STORAGE_BUCKET_ADMIN_DESA_DOCUMENTS="admin-desa-documents"
SUPABASE_STORAGE_SIGNED_URL_TTL_SECONDS="900"
ADMIN_DESA_DOCUMENT_MAX_FILE_SIZE_MB="10"
ADMIN_DESA_DOCUMENT_ALLOWED_MIME_TYPES="application/pdf,image/jpeg,image/png,image/webp"
ADMIN_DESA_DOCUMENT_MAX_FILES_PER_UPLOAD="5"
```

Env rules:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public client-safe values, but still should not be misused for privileged document access.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be imported or referenced in client components.
- Upload, signed URL creation, deletion, and privileged reads must happen server-side.
- `SUPABASE_STORAGE_BUCKET_ADMIN_DESA_DOCUMENTS` allows bucket name changes without code change.
- `SUPABASE_STORAGE_SIGNED_URL_TTL_SECONDS` controls temporary access window; default suggestion is 900 seconds / 15 minutes.
- `ADMIN_DESA_DOCUMENT_ALLOWED_MIME_TYPES`, `ADMIN_DESA_DOCUMENT_MAX_FILE_SIZE_MB`, and `ADMIN_DESA_DOCUMENT_MAX_FILES_PER_UPLOAD` make validation configurable.
- If project already has equivalent Supabase env names when this task is executed, reuse existing names and update this BMAD item before implementation; do not create duplicate env names.

Owner/operator setup checklist:

- Create/confirm Supabase project storage bucket.
- Confirm bucket privacy mode.
- Add the env vars listed above to local/staging/production as needed.
- Confirm service role key is only used server-side.
- Confirm storage billing/limits are acceptable.
- Confirm `.env.example` uses placeholders only, never real values.

### 04-008G.1 — Document upload by Admin Desa

- Admin Desa can upload or submit document evidence for their own desa only.
- Validate admin membership and desa ownership.
- Validate file type, file size, and file count.
- Store document in Supabase Storage private bucket by default.
- Link document to desa, uploader user, admin membership, storage object path, source type, and created timestamp.
- Initial document status should be something like `UPLOADED`, `SOURCE_FOUND`, or equivalent existing status.
- Write audit event for upload.

Access by role:

- `LIMITED` can upload supporting/source documents and save draft data.
- `VERIFIED` can upload/update supporting/source documents and publish data changes.

### 04-008G.2 — AI-assisted document extraction

- AI may read uploaded document and propose extracted fields.
- AI output must be saved as draft/candidate data, not automatically published.
- Include confidence score or review flags where practical.
- Mark uncertain fields clearly in UI.
- Preserve raw extracted text/summary only if privacy-safe.
- Write audit event for extraction.
- AI result must never directly publish public data without explicit Admin Desa action.

### 04-008G.3 — Mapping candidate data to Desa detail

- Map extracted/candidate data to existing Desa detail fields where applicable.
- Candidate mappings may include profile desa, alamat/kontak, perangkat desa, dokumen sumber, source metadata, and summary/ringkasan.
- Show before/after diff for every field that would change.
- `LIMITED` can save candidate mapping as draft only.
- `VERIFIED` can publish approved-by-self changes directly for their own desa.
- No silent overwrite of existing public data.

### 04-008G.4 — Admin Desa publish workflow

- `VERIFIED` Admin Desa can explicitly publish/update public Desa detail for their own desa.
- Internal admin review must not be required before a `VERIFIED` Admin Desa publishes their own data.
- Every publish action must show confirmation and write audit event.
- Published changes should be traceable to source document, uploader, timestamp, and publisher.
- `LIMITED` Admin Desa cannot publish; they can only draft/upload evidence.
- If publish policy is ambiguous, stop and ask Owner.

### 04-008G.5 — Publish/update Desa detail and source traceability

- After explicit `VERIFIED` admin publish, update Desa detail fields safely.
- Keep source metadata tied to the uploaded/current document.
- Do not create manual `mark source as verified` action.
- If source changes, user should upload/update the supporting document.
- Write audit event for every published field/section.
- Consider version history or rollback candidate before public overwrite.

### 04-008G.6 — UI and browser QA

- Admin Desa sees upload form only for desa they manage.
- Upload form has loading/success/error states.
- AI extraction state is visible: pending, extracted, failed, needs attention.
- Mapping UI shows candidate mapping and before/after diff.
- `LIMITED` UI clearly says draft/upload only and no publish.
- `VERIFIED` UI clearly says publish is allowed and will be audited.
- Publish/update UI shows clear confirmation and result.
- Desktop and mobile screenshots/notes required if UI is touched.
- Full quality gate required: lint, test, typecheck, Prisma generate, build.

Guardrails:

- No file upload/storage implementation without storage/privacy design approval.
- Supabase Storage bucket must be private by default.
- No public bucket for Admin Desa documents unless Owner explicitly approves.
- No service role key or storage secret exposed client-side.
- No AI extraction dependency/provider without Owner approval.
- No AI auto-publish without explicit Admin Desa action.
- No mandatory internal admin review before `VERIFIED` Admin Desa publishes their own data.
- No manual source `verified` status button.
- No private documents exposed publicly.
- No raw sensitive document content in logs/screenshots.
- No destructive migration without approval.
- Every upload/extract/publish action must be audited.
- Any 04-008G execution task must satisfy the Admin Desa zero-bug readiness checklist.

Key decisions needed:

- Which draft features should `LIMITED` get first?
- What fields can `VERIFIED` publish directly in MVP?
- What Supabase Storage bucket name should be used?
- What storage folder/path convention should be used?
- What signed URL lifetime should be allowed?
- What retention/deletion policy should apply to uploaded documents?
- What env names already exist for Supabase Storage access?
- What file types and max size are allowed?
- Which AI provider/model is allowed?
- Should AI extraction run immediately, manually, or queued?
- What fields in Desa detail are allowed to be updated from documents?
- How should source traceability be displayed after publish?
- Is version history/rollback required before publishing?

---

# Items intentionally excluded

The following should not be folded into this internal-admin batch unless Owner separately approves:

- public admin list per desa,
- numeric APBDes extraction,
- screenshot storage,
- Playwright setup,
- Data Desa `/desa` server query refactor,
- Voice-to-Desa relation migration,
- manual `mark source as verified` feature,
- admin desa revoke/suspend permissions for MVP.

## Recommended future sequencing

1. Finish Sprint 04-007 user-facing claim admin UI integration.
2. Review real QA/browser feedback from 04-007.
3. Decide whether the first 04-008 execution item should be review queue, revoke/suspend, audit viewer, support inbox, renewal, or Admin Desa document contribution/publish.
4. Split selected item into a single-PIC execution task with TDD, zero-bug readiness, and browser QA.

## Approval status

Not approved for execution.

Do not instruct Ujang/Asep until Owner explicitly approves one selected 04-008 subtask.

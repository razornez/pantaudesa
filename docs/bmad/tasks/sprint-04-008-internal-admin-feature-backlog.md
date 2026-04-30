# Sprint 04-008 — Internal Admin Feature Backlog

Date: 2026-04-29
Status: backlog / not-approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner requested collecting all internal-admin and post-claim Admin Desa governance features into a separate future batch.

## Purpose

Collect internal admin and post-claim Admin Desa features that are related to Desa Admin verification, review, moderation, audit, document contribution, AI-assisted data review, and data governance, but are intentionally not part of Sprint 04-007.

This document is a backlog/task container only. It is not approved for implementation yet.

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
- AI extraction/review pipeline,
- data mapping to public Desa detail,
- source status/dataStatus governance,
- more sensitive data access,
- possible schema/API adjustments,
- stronger QA and access control.

## Ownership

- PIC: not assigned yet
- Reviewer: Rangga
- Gate owner: Iwan/Owner
- Status: do not assign until Owner explicitly approves

## Global guardrails

- No public data verified activation without governance.
- Admin membership verification is not public data verification.
- No AI result may directly overwrite public Desa data without review.
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

# Backlog items

## 04-008A — Internal Admin Review Queue

Goal:

Create an internal-only queue for reviewing admin claim cases that cannot be fully resolved through email or website verification.

Potential scope:

- list pending/support-review claims,
- view user/desa/method/evidence summary,
- view audit timeline,
- approve as `LIMITED` or `VERIFIED` depending on policy,
- reject with reason,
- request more info,
- write audit event for every decision.

Out of scope until approved:

- public verified data activation,
- automatic approval,
- bulk actions,
- AI decisioning.

Key decisions needed:

- Which internal role can access the queue?
- Can internal admin grant `VERIFIED`, or only `LIMITED`?
- What evidence is required for approval?

## 04-008B — Revoke / Suspend Admin Membership

Goal:

Allow internal admin to safely suspend, revoke, or downgrade desa admin membership.

Potential scope:

- suspend admin membership,
- revoke admin membership,
- downgrade `VERIFIED` to `LIMITED`,
- reason required,
- audit event required,
- notify affected user if email flow exists,
- prevent user from self-revoking others unless authorized.

Guardrails:

- no auto-suspend from report alone,
- no hidden destructive action,
- every action must be auditable.

Key decisions needed:

- Who can suspend/revoke?
- Should suspended users be able to appeal/contact admin?
- What happens to pending invites from suspended admin?

## 04-008C — Invite Management Dashboard

Goal:

Provide internal or verified-admin visibility into invite status without overloading Sprint 04-007.

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
- invite analytics.

Key decisions needed:

- Is this for verified desa admin, internal admin, or both?
- Should resend reuse token or generate a new token?
- How long should invites remain visible after expiry?

## 04-008D — Admin Claim Audit Viewer

Goal:

Expose audit events in an internal-safe viewer so review/moderation decisions can be traced.

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
- no editable audit events.

Key decisions needed:

- Which metadata is safe to show?
- Who can view audit events?
- How long should audit events be retained?

## 04-008E — Admin Verification Renewal Enforcement

Goal:

Implement the 6-month website verification renewal policy beyond UI copy.

Owner decision already captured:

- website verification should be renewed every 6 months,
- if not renewed, admin status should eventually return to `LIMITED` or similar.

Potential scope:

- store/derive `verificationExpiresAt`,
- show internal list of admin verifications near expiry,
- manual renewal trigger,
- automatic downgrade if scheduler exists later,
- audit renewal/downgrade events,
- notify admin before expiry if email notification is approved.

Out of scope until approved:

- cron/scheduler if infrastructure is not ready,
- schema migration without approval,
- auto-downgrade without review of edge cases.

Key decisions needed:

- Is renewal based on `verifiedAt + 6 months`?
- Should downgrade be automatic or internal-review triggered?
- Should email reminders be sent before expiry?

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

## 04-008G — Admin Desa Document Contribution & AI-Assisted Data Review

Goal:

Allow verified/eligible Admin Desa to contribute official village documents, use AI to assist extraction/mapping, then route proposed data changes through review before updating Desa detail and source/data status.

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
- Use signed URLs for temporary internal/reviewer access if needed.
- Define max URL lifetime for signed URLs.
- Define allowed file types before enabling upload, such as PDF and common image formats only if approved.
- Define max file size and per-desa upload limits.
- Define retention/deletion policy for rejected, obsolete, or superseded documents.
- Define whether original files can be deleted after extraction or must be retained for audit/source traceability.
- Store storage object path/key in DB, not a public URL.
- Add audit event for document upload, access/download if required, extraction, review, publish, and delete/archive actions.
- Add QA cases for bucket privacy, signed URL access, unauthorized access rejection, and cleanup behavior.

Owner/operator setup checklist:

- Create/confirm Supabase project storage bucket.
- Confirm bucket privacy mode.
- Confirm service role key is only used server-side if needed.
- Confirm env names needed for Supabase Storage already exist or request approval before adding new env.
- Confirm storage billing/limits are acceptable.

### 04-008G.1 — Document upload by Admin Desa

- Admin Desa can upload or submit document evidence for their own desa only.
- Validate admin membership and desa ownership.
- Validate file type, file size, and file count.
- Store document in Supabase Storage private bucket by default.
- Link document to desa, uploader user, admin membership, storage object path, source type, and created timestamp.
- Initial document status should be something like `UPLOADED`, `NEEDS_REVIEW`, or equivalent existing status.
- Write audit event for upload.

### 04-008G.2 — AI-assisted document extraction

- AI may read uploaded document and propose extracted fields.
- AI output must be saved as draft/candidate data, not final public data.
- Include confidence score or review flags where practical.
- Mark uncertain fields as needs review.
- Preserve raw extracted text/summary only if privacy-safe.
- Write audit event for extraction.
- AI result must never directly mark public data as verified.

### 04-008G.3 — Mapping candidate data to Desa detail

- Map extracted/candidate data to existing Desa detail fields where applicable.
- Candidate mappings may include profile desa, alamat/kontak, perangkat desa, dokumen sumber, source metadata, and summary/ringkasan.
- Show before/after diff for every field that would change.
- Support approve/reject per field if feasible; otherwise approve/reject per section with clear limitation.
- No silent overwrite of existing public data.

### 04-008G.4 — Review and approval workflow

- Reviewer must explicitly review candidate mappings before public data update.
- Define who can review: verified Admin Desa, internal admin, or both.
- Reject/approve decisions require audit event.
- Rejected items should preserve reason.
- Approved changes should be traceable to source document and reviewer.
- If review policy is ambiguous, stop and ask Owner.

### 04-008G.5 — Publish/update Desa detail and source/data status

- After review approval, update Desa detail fields safely.
- Update source status and data status consistently.
- Possible statuses to consider: `demo`, `source-found`, `needs-review`, `verified`, or existing project equivalents.
- Do not enable `verified` public data status unless governance workflow is approved.
- Keep source metadata tied to the uploaded document.
- Write audit event for every published field/section.
- Consider version history or rollback candidate before public overwrite.

### 04-008G.6 — UI and browser QA

- Admin Desa sees upload form only for desa they manage.
- Upload form has loading/success/error states.
- AI extraction state is visible: pending, extracted, failed, needs review.
- Review UI shows candidate mapping and before/after diff.
- Publish/update UI shows clear confirmation and result.
- Desktop and mobile screenshots/notes required if UI is touched.
- Full quality gate required: lint, test, typecheck, Prisma generate, build.

Guardrails:

- No file upload/storage implementation without storage/privacy design approval.
- Supabase Storage bucket must be private by default.
- No public bucket for Admin Desa documents unless Owner explicitly approves.
- No service role key or storage secret exposed client-side.
- No AI extraction dependency/provider without Owner approval.
- No public data overwrite without review.
- No public `verified` data activation without governance.
- No private documents exposed publicly.
- No raw sensitive document content in logs/screenshots.
- No destructive migration without approval.
- Every upload/extract/review/publish action must be audited.

Key decisions needed:

- Which Admin Desa status can upload documents: `LIMITED`, `VERIFIED`, or both?
- Which role can approve AI-mapped changes?
- Should review be done by internal admin only, Admin Desa only, or two-step approval?
- What Supabase Storage bucket name should be used?
- What storage folder/path convention should be used?
- What signed URL lifetime should be allowed?
- What retention/deletion policy should apply to uploaded documents?
- What env names already exist for Supabase Storage access?
- What file types and max size are allowed?
- Which AI provider/model is allowed?
- Should AI extraction run immediately, manually, or queued?
- What fields in Desa detail are allowed to be updated from documents?
- How should `dataStatus` and source status transition after review?
- Is version history/rollback required before publishing?

---

# Items intentionally excluded

The following should not be folded into this internal-admin batch unless Owner separately approves:

- public admin list per desa,
- public verified data activation,
- numeric APBDes extraction,
- screenshot storage,
- Playwright setup,
- Data Desa `/desa` server query refactor,
- Voice-to-Desa relation migration.

## Recommended future sequencing

1. Finish Sprint 04-007 user-facing claim admin UI integration.
2. Review real QA/browser feedback from 04-007.
3. Decide whether the first 04-008 execution item should be review queue, revoke/suspend, audit viewer, support inbox, or Admin Desa document contribution.
4. Split selected item into a single-PIC execution task with TDD and browser QA.

## Approval status

Not approved for execution.

Do not instruct Ujang/Asep until Owner explicitly approves one selected 04-008 subtask.

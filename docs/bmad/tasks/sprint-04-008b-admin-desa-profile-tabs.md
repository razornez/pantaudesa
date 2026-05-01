# Sprint 04-008B — Admin Desa VERIFIED Profile Tabs

Date: 2026-04-30
Status: backlog / not-approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Related:
- `docs/bmad/tasks/sprint-04-008a-admin-desa-verification-review-otp-flow.md`
- `docs/bmad/tasks/sprint-04-008-internal-admin-feature-backlog.md`

## Purpose

Define the future Admin Desa `VERIFIED` user experience after verification is approved.

Owner decision: a separate dashboard is not needed for now. Instead, when a user is Admin Desa `VERIFIED`, add Admin Desa-specific tabs/sections to the existing profile detail page.

This is a planning/backlog document only. Do not assign developer execution until Owner explicitly approves.

## Owner decisions captured

1. No dedicated Admin Desa dashboard is needed for now.
2. If user is Admin Desa `VERIFIED`, add new tabs in their profile/detail area.
3. Tabs should include:
   - Profil
   - List Admin
   - Dokumen
   - Suara
   - Notifikasi
4. Invite Admin should live inside List Admin, not as a bulky section in the claim verification form.
5. Dokumen upload is not `IN_REVIEW` as a claim status. Upload should have its own document upload/status flow.
6. Internal admin later reviews uploaded documents, uses AI mapping, then publishes/updates data according to approved internal workflow.
7. Suara tab should show published comments/voices related to that desa.
8. Notifikasi tab should show activity notifications such as comments on the desa, replies to admin comments, likes, votes, and similar events.

## Access rule

These profile tabs are available only to Admin Desa `VERIFIED` unless Owner later approves limited read-only access for `LIMITED` invitees.

Default rule:

```text
PENDING / IN_REVIEW / REJECTED: no Admin Desa profile tabs
LIMITED: no publish/admin-management tabs by default
VERIFIED: profile tabs enabled
```

## Tab structure

### 1. Profil

Purpose:

- Existing profile tab/section.
- Keep current profile behavior intact.
- Do not break existing user profile UX.

Potential content:

- user profile information,
- admin status badge,
- desa represented,
- renewal status summary,
- link/CTA to verification renewal if needed.

### 2. List Admin

Purpose:

- Let Admin Desa `VERIFIED` view admin users related to their desa.
- Provide entry point for Invite Admin.
- Allow admin management only where explicitly approved.

Required content:

- list of admins connected to the desa,
- admin name/email display with privacy-safe masking where needed,
- status: `VERIFIED`, `LIMITED`, expired/revoked if implemented later,
- invitedBy where available,
- invitedAt/acceptedAt where available,
- max admin count visibility,
- Invite Admin button.

Invite UI:

- Invite Admin button opens modal/popup or a separate invite form page.
- Only Admin Desa `VERIFIED` can invite.
- Invitee accepts and becomes `LIMITED`.
- Invite UI must explain invitee is `LIMITED`, not `VERIFIED`.

Delete/revoke admin:

- Owner requested there should be an option to delete/revoke admin in this area.
- Because revoke is sensitive, future execution must define exact policy before implementation.
- MVP-safe proposal:
  - `VERIFIED` may request/remove/revoke only `LIMITED` admins they invited, if Owner approves.
  - `VERIFIED` must not revoke/suspend another `VERIFIED` admin in MVP.
  - Every revoke/delete action must require confirmation, reason, notification, and audit event.
- If revoke policy is not finalized, show only list + invite and leave revoke as disabled/future action.

Guardrails:

- No self-revoke unless explicit flow exists.
- No revoke of another `VERIFIED` admin without separate Owner-approved governance.
- No hidden destructive action.
- Every invite/delete/revoke must be audited.

### 3. Dokumen

Purpose:

- Show list of documents related to the desa.
- Let Admin Desa upload documents/source files for that desa.
- Uploaded documents become source material for internal admin/AI processing.

Required content:

- document list for the desa,
- upload document action,
- upload status,
- uploader,
- uploadedAt,
- document type/source category if available,
- processing state if internal review/AI mapping later exists.

Important status rule:

- Document upload does not move admin claim into `IN_REVIEW`.
- Upload has its own document status, for example:
  - `UPLOADING`
  - `UPLOADED`
  - `PROCESSING`
  - `MAPPED`
  - `PUBLISHED`
  - `FAILED`
- Do not confuse document status with Admin Desa claim status.

Future internal admin flow:

```text
Admin Desa uploads document
→ document status UPLOADED
→ internal admin opens document review
→ AI mapping/extraction assists mapping
→ internal admin validates mapping
→ publish/update data if approved
```

Guardrails:

- If upload requires file storage, use approved Supabase Storage design from 04-008G.
- Do not expose private documents publicly by default.
- Do not auto-publish AI extraction.
- Keep audit trail for upload, processing, mapping, publish.

### 4. Suara

Purpose:

- Show published comments/voices related to the desa.
- This is not a moderation dashboard unless later approved.

Required content:

- list of published suara/comments for the desa,
- comment content summary,
- author display according to privacy rules,
- published date,
- reply count if available,
- engagement such as likes/votes if available.

Out of scope unless approved:

- deleting/moderating comments,
- private/unpublished comment access,
- internal moderation tools,
- bulk actions.

### 5. Notifikasi

Purpose:

- Show notifications relevant to the Admin Desa and their desa.

Notification types to consider:

- new comment/suara on the desa,
- reply to admin comment,
- like on admin comment,
- vote/engagement event,
- invite accepted,
- document processing finished,
- document publish/update result,
- renewal reminder,
- claim/review update if applicable.

Requirements:

- list notifications chronologically,
- read/unread state if supported,
- link notification to relevant object/page,
- avoid leaking private user data,
- keep notification scope limited to the admin's desa.

## Navigation / layout direction

- Add tabs to existing profile detail page rather than creating a separate dashboard.
- Tabs should be clear and not overload the profile page.
- Use responsive design:
  - desktop: tabs horizontal or sidebar if existing profile layout supports it,
  - mobile: compact tab list, segmented control, or accordion-style navigation.
- Do not hide critical admin status/renewal warnings inside deep tabs.

## Suggested tab labels

```text
Profil
List Admin
Dokumen
Suara
Notifikasi
```

## UI/UX requirements

- Do not show unavailable actions to non-eligible roles unless disabled with a clear reason.
- `VERIFIED` admin should understand what each tab is for.
- Keep claim verification flow separate from post-verification management tabs.
- Keep Invite Admin separate from claim form.
- Keep document upload status separate from claim status.
- Avoid making the page feel like a heavy dashboard.

## Testing / QA requirements

Future implementation must test at minimum:

- non-admin user cannot see Admin Desa tabs,
- `PENDING`/`IN_REVIEW`/`REJECTED` user cannot see Admin Desa tabs,
- `LIMITED` access follows final policy,
- `VERIFIED` can see all approved tabs,
- List Admin shows correct admins for the desa only,
- Invite Admin opens modal/page and creates invite where allowed,
- revoke/delete action is hidden/disabled unless policy implemented,
- Dokumen tab lists only documents for the admin's desa,
- upload state is distinct from claim `IN_REVIEW`,
- Suara tab shows only published comments for that desa,
- Notifikasi tab shows only relevant notifications,
- desktop and mobile layouts remain usable,
- full quality gate passes.

## Out of scope until approved

- dedicated Admin Desa dashboard,
- internal admin panel,
- comment moderation dashboard,
- full notification system if backend/event model does not exist yet,
- document AI mapping/publish unless split into its own execution task,
- revoke/suspend verified admins,
- public list of all admins unless Owner approves,
- destructive delete without confirmation/audit.

## Open decisions before execution

- Where exactly should these tabs live in the current route structure?
- Should `LIMITED` have any read-only tabs, or none for MVP?
- Can `VERIFIED` revoke/delete a `LIMITED` admin they invited?
- What is the exact document status enum?
- Does document upload require Supabase Storage implementation first?
- Is Notifikasi backed by an existing notification model, or does it need a new schema?
- Which suara/comment model counts as published and visible to Admin Desa?

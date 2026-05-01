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
5. In one desa, only one admin may have `VERIFIED` status.
6. `VERIFIED` admin may delete/revoke `LIMITED` admins only.
7. `VERIFIED` admin must not delete/revoke another `VERIFIED` admin because only one `VERIFIED` should exist per desa.
8. Dokumen upload is not `IN_REVIEW` as a claim status. Upload has its own simple document status flow.
9. Admin Desa `LIMITED` may upload documents, but the upload must be helped/approved by Admin Desa `VERIFIED` before it enters internal processing.
10. Admin Desa `VERIFIED` may upload documents directly into document `PROCESSING`.
11. Document status should be simple: `PROCESSING`, `PUBLISHED`, `FAILED`.
12. For `LIMITED` upload, approval by `VERIFIED` is a pre-processing gate, not final publish.
13. After a `LIMITED` upload is approved by `VERIFIED`, the document status becomes `PROCESSING` and is still checked by internal admin.
14. If internal admin approves and AI mapping succeeds, document status becomes `PUBLISHED`.
15. If processing/mapping/publish fails, document status becomes `FAILED` with a clear failure reason.
16. Internal admin later reviews uploaded documents, uses AI mapping, then publishes/updates data according to approved internal workflow.
17. Suara tab should show published comments/voices related to that desa.
18. Notifikasi tab should show activity notifications such as comments on the desa, replies to admin comments, likes, votes, and similar events.
19. User profile photo should show a small admin badge at the bottom-right when the user is Admin Desa `VERIFIED` or `LIMITED`.
20. Clicking the admin badge should show a small popover explaining admin status and permissions.
21. Flow steps, sensitive actions, status changes, approval gates, and blocked states must include clear explanatory copy so users do not feel confused.

## Access rule

These profile tabs are available only to Admin Desa `VERIFIED` unless Owner later approves limited read-only/upload access for `LIMITED` invitees.

Default rule:

```text
PENDING / IN_REVIEW / REJECTED: no Admin Desa profile tabs
LIMITED: limited document upload only if approved by VERIFIED before processing; no publish/admin-management tabs by default
VERIFIED: profile tabs enabled
```

## Profile admin badge

Purpose:

- Show a small visual indicator on the user's profile photo when they are Admin Desa `VERIFIED` or `LIMITED`.
- Badge should appear at the bottom-right of the profile photo/avatar.
- Badge should be compact and not dominate the profile UI.
- Badge should be clickable/tappable and open a small popover with status details.

Badge states:

```text
VERIFIED Admin Desa
LIMITED Admin Desa
```

Popover content for `VERIFIED`:

- status: Admin Desa VERIFIED,
- desa represented,
- can publish/update data desa,
- can invite admin,
- can approve `LIMITED` document uploads into processing,
- must renew verification every 6 months,
- cannot access internal PantauDesa admin tools.

Popover content for `LIMITED`:

- status: Admin Desa LIMITED,
- source: invited by Admin Desa VERIFIED,
- cannot publish data,
- cannot invite admin,
- can upload documents only as contribution that must be approved by Admin Desa VERIFIED before internal processing,
- can follow verification flow if needed.

UX requirements:

- popover must be readable on mobile,
- popover must close on outside click/Escape where practical,
- badge must have accessible label,
- do not show badge for `PENDING`, `IN_REVIEW`, or `REJECTED` claims.

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
- exactly one `VERIFIED` admin should exist per desa,
- zero or more `LIMITED` admins may exist within max-admin rules,
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

- Only Admin Desa `VERIFIED` may delete/revoke admin.
- Delete/revoke is allowed only for `LIMITED` admins.
- `VERIFIED` admin must not delete/revoke another `VERIFIED` admin.
- Delete/revoke must require confirmation.
- Delete/revoke should ask for a reason where practical.
- Delete/revoke must notify affected user if email notification exists.
- Delete/revoke must write audit event.

Guardrails:

- No self-revoke unless explicit flow exists.
- Only one `VERIFIED` admin per desa.
- No revoke/delete of `VERIFIED` admin from this tab.
- No hidden destructive action.
- Every invite/delete/revoke must be audited.

### 3. Dokumen

Purpose:

- Show list of documents related to the desa.
- Let Admin Desa upload documents/source files for that desa.
- Let Admin Desa `VERIFIED` approve `LIMITED` uploads into internal processing.
- Uploaded documents become source material for internal admin/AI processing.

Required content:

- document list for the desa,
- upload document action,
- document status,
- failure reason if failed,
- uploader,
- uploadedAt,
- document type/source category if available,
- pending approval marker for `LIMITED` uploads before processing,
- processing/published/failed state.

Important status rule:

- Document upload does not move admin claim into `IN_REVIEW`.
- Upload has its own document status.
- Keep document status simple for MVP:
  - `PROCESSING`
  - `PUBLISHED`
  - `FAILED`
- For `LIMITED` uploads, use a lightweight pre-processing state/flag such as `WAITING_VERIFIED_APPROVAL` or equivalent before it becomes `PROCESSING`.
- `WAITING_VERIFIED_APPROVAL` is not a claim status and must be explained as document approval by Admin Desa `VERIFIED`.
- After `VERIFIED` admin approves a `LIMITED` upload, status becomes `PROCESSING`.
- After `VERIFIED` admin uploads directly, status becomes `PROCESSING`.
- If internal admin approves document and AI mapping succeeds, status becomes `PUBLISHED`.
- If upload processing, review, mapping, or publish fails, status becomes `FAILED` and must show a clear reason.
- Do not confuse document status with Admin Desa claim status.

Future document flow:

```text
LIMITED uploads document
→ document waits for VERIFIED approval
→ VERIFIED admin approves document for processing
→ document status PROCESSING
→ internal admin opens document review
→ AI mapping/extraction assists mapping
→ internal admin validates mapping
→ if approved and mapping succeeds: PUBLISHED
→ if failed/rejected: FAILED with reason
```

```text
VERIFIED uploads document
→ document status PROCESSING
→ internal admin opens document review
→ AI mapping/extraction assists mapping
→ internal admin validates mapping
→ if approved and mapping succeeds: PUBLISHED
→ if failed/rejected: FAILED with reason
```

User-facing explanation requirements:

- For `LIMITED`: explain that upload is a contribution and must be approved by Admin Desa `VERIFIED` before PantauDesa processes it.
- For `VERIFIED`: explain that uploaded documents go to processing and will be checked/mapped before being published.
- For `PROCESSING`: explain that PantauDesa/internal admin is checking the document and mapping data.
- For `PUBLISHED`: explain that document data has been approved/mapped and published.
- For `FAILED`: show a safe, clear reason and what the user can fix or re-upload.
- For sensitive actions like approve document, revoke admin, invite admin, or failed reason, provide extra helper text or confirmation copy.

Guardrails:

- If upload requires file storage, use approved Supabase Storage design from 04-008G.
- Do not expose private documents publicly by default.
- Do not auto-publish AI extraction.
- Keep audit trail for upload, `VERIFIED` approval, processing, mapping, publish, and failed reason.
- Failure reason must be user-safe and not leak internal/sensitive details.

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
- `LIMITED` document waiting for `VERIFIED` approval,
- document approved into processing,
- document processing finished,
- document publish/update result,
- document failed with reason,
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
- `LIMITED` admin should understand that upload is only a contribution and must be approved by `VERIFIED` before processing.
- Keep claim verification flow separate from post-verification management tabs.
- Keep Invite Admin separate from claim form.
- Keep document upload status separate from claim status.
- Show document failure reasons clearly and safely.
- Explain every sensitive or multi-step flow with helper text, status descriptions, confirmation copy, or info popovers.
- Badge/popover should make admin status understandable without opening a separate page.
- Avoid making the page feel like a heavy dashboard.

## Testing / QA requirements

Future implementation must test at minimum:

- non-admin user cannot see Admin Desa tabs,
- `PENDING`/`IN_REVIEW`/`REJECTED` user cannot see Admin Desa tabs,
- `LIMITED` access follows final policy,
- `LIMITED` can upload document only into waiting-for-verified-approval state,
- `LIMITED` cannot approve document into processing,
- `VERIFIED` can see all approved tabs,
- `VERIFIED` can approve `LIMITED` document upload into `PROCESSING`,
- only one `VERIFIED` admin exists per desa,
- List Admin shows correct admins for the desa only,
- Invite Admin opens modal/page and creates invite where allowed,
- only `VERIFIED` can invite,
- only `VERIFIED` can revoke/delete `LIMITED`,
- revoke/delete `VERIFIED` is blocked,
- revoke/delete requires confirmation and audit,
- Dokumen tab lists only documents for the admin's desa,
- `VERIFIED` upload success moves document to `PROCESSING`,
- approved `LIMITED` upload moves document to `PROCESSING`,
- approved/mapped document becomes `PUBLISHED`,
- failed document becomes `FAILED` with clear reason,
- upload/document status is distinct from claim `IN_REVIEW`,
- Suara tab shows only published comments for that desa,
- Notifikasi tab shows only relevant notifications,
- admin badge appears on profile photo for `VERIFIED`/`LIMITED`,
- badge popover opens and explains status,
- desktop and mobile layouts remain usable,
- full quality gate passes.

## Out of scope until approved

- dedicated Admin Desa dashboard,
- internal admin panel,
- comment moderation dashboard,
- full notification system if backend/event model does not exist yet,
- document AI mapping/publish unless split into its own execution task,
- revoke/suspend verified admins,
- more than one verified admin per desa,
- public list of all admins unless Owner approves,
- destructive delete without confirmation/audit.

## Open decisions before execution

- Where exactly should these tabs live in the current route structure?
- Should `LIMITED` get only Dokumen upload access, or also read-only profile/list access?
- Is revoke/delete for `LIMITED` a hard delete, membership revoke, or status change?
- What is the exact document pre-processing status name for `LIMITED` uploads?
- Does document upload require Supabase Storage implementation first?
- Is Notifikasi backed by an existing notification model, or does it need a new schema?
- Which suara/comment model counts as published and visible to Admin Desa?

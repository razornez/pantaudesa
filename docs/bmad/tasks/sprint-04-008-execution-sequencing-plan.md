# Sprint 04-008 — Execution Sequencing Plan

Date: 2026-04-30
Status: planning / not-approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Related:
- `docs/bmad/tasks/sprint-04-008a-admin-desa-verification-review-otp-flow.md`
- `docs/bmad/tasks/sprint-04-008b-admin-desa-profile-tabs.md`
- `docs/bmad/tasks/sprint-04-008c-internal-admin-access-and-qa-seed-data.md`
- `docs/bmad/tasks/sprint-04-008d-back-office-user-admin-desa-internal-admin-completion.md`
- `docs/bmad/tasks/sprint-04-008-internal-admin-feature-backlog.md`

## Purpose

Split and order Sprint 04-008 work so Admin Desa and internal admin features can be implemented sequentially without overlapping ownership, circular dependency, or accidental regression.

This is a planning document only. Do not instruct Ujang/Asep until Owner explicitly approves the selected batch.

## Sequencing principle

1. Build shared foundation first.
2. Then build internal admin review foundation.
3. Then build user-facing Admin Desa verification flow.
4. Then build Admin Desa profile tabs.
5. Then build document upload/review/publish flow.
6. Then complete suara warga and notifications.
7. End with cross-role regression QA.

Avoid assigning the same task to two people. If two people are needed, split into separate non-overlapping tasks with clear handoff boundary.

---

# Proposed execution batches

## 04-008.0 — Foundation: schema, roles, auth guard, and seed baseline

### Goal

Create shared foundation needed by all later 04-008 work.

### Scope

- Add/confirm database-backed internal admin flag/role.
- Owner can be seeded/flagged as internal admin.
- Internal admin uses normal user login form.
- Add server-side permission helpers/guards for:
  - normal user,
  - Admin Desa `LIMITED`,
  - Admin Desa `VERIFIED`,
  - internal admin.
- Add/confirm status model for:
  - `PENDING`,
  - `IN_REVIEW`,
  - `REJECTED`,
  - `LIMITED`,
  - `VERIFIED`.
- Add DB-backed QA seed structure for users/admins/desa basic states.
- Add minimal audit event helper if not already sufficient.

### Must not include

- internal admin UI,
- Admin Desa tabs,
- document upload,
- AI mapping,
- notifications UI,
- suara UI changes.

### Depends on

None.

### Unlocks

All following 04-008 tasks.

### PIC recommendation

One backend-heavy developer.

---

## 04-008.1 — Internal admin access + QA seed data

### Goal

Make internal admin access testable and provide DB-backed dummy data for QA.

### Scope

- Use normal login form.
- Internal admin access is database-backed and server-side guarded.
- Seed:
  - internal admin user,
  - normal user,
  - `PENDING` claim,
  - `IN_REVIEW` claim,
  - `REJECTED` claim,
  - fraud cooldown claim,
  - Admin Desa `VERIFIED`,
  - Admin Desa `LIMITED`,
  - desa with one verified admin,
  - desa with limited admins.
- Document how to run QA seed.
- Ensure seeded data is fetched from DB/API, not hardcoded in React components.

### Must not include

- review queue UI,
- document upload UI,
- notification UI.

### Depends on

04-008.0.

### Source doc

`docs/bmad/tasks/sprint-04-008c-internal-admin-access-and-qa-seed-data.md`

---

## 04-008.2 — Verification backend flow: website token, email OTP, rejected, cooldown

### Goal

Implement Admin Desa verification trust flow backend and status transitions.

### Scope

- Website token success moves to `IN_REVIEW`, not `VERIFIED`.
- Desa email OTP path:
  - send OTP/code,
  - verify OTP,
  - OTP success moves to `IN_REVIEW`, not `VERIFIED`,
  - wrong OTP attempts freeze,
  - resend OTP throttles/freeze.
- `REJECTED` state with reason + instructions.
- Fraud/suspicious rejection applies 3-day cooldown.
- Reapply blocked before cooldown ends.
- Audit all sensitive transitions.

### Must not include

- full internal admin UI,
- Admin Desa profile tabs,
- document upload,
- AI mapping,
- notification center.

### Depends on

04-008.0 and preferably 04-008.1 for seed data.

### Source docs

- `docs/bmad/tasks/sprint-04-008a-admin-desa-verification-review-otp-flow.md`
- `docs/bmad/tasks/sprint-04-008-admin-desa-otp-freeze-fraud-cooldown-policy.md`

---

## 04-008.3 — Internal Admin tab: Admin Desa review queue

### Goal

Add internal admin UI to review Admin Desa applications.

### Scope

Internal admin profile/page tab:

```text
Admin Desa
```

Features:

- list claims/applications,
- filter `PENDING`, `IN_REVIEW`, `REJECTED`, `VERIFIED`, `LIMITED` where relevant,
- review website-token claims,
- review email-OTP claims,
- review dedicated claim-support submissions,
- approve to `VERIFIED`,
- reject to `REJECTED`,
- enter user-facing reason,
- enter clear correction instructions,
- mark fraud/suspicious and apply 3-day cooldown,
- see audit timeline/summary,
- see duplicate/conflicting claim warning.

### Must not include

- document review/mapping tab,
- Admin Desa profile tabs,
- invite admin UI,
- suara/notifikasi completion.

### Depends on

04-008.2.

### Notes

This task is internal admin only. Do not combine with Admin Desa profile tabs.

---

## 04-008.4 — Dedicated Hubungi Admin Pengajuan Admin Desa

### Goal

Add third Admin Desa application path for users who cannot use website token or email OTP.

### Scope

- Separate from general Hubungi Admin.
- Form tied to claim/desa/user context.
- Fields:
  - desa being claimed,
  - reason for claim,
  - why website/email verification cannot be completed,
  - evidence/berkas description,
  - attachment/document reference if storage is available/approved,
  - contact notes.
- Submission moves or keeps claim in `IN_REVIEW`.
- Internal admin sees submission in Admin Desa review queue.
- No direct `VERIFIED` or `LIMITED` from submit.
- Clear UI explanation that this is review-based.

### Must not include

- general support inbox redesign,
- document processing/mapping workflow,
- Admin Desa profile tabs.

### Depends on

04-008.2 and 04-008.3.

---

## 04-008.5 — Renewal enforcement backend + internal review

### Goal

Implement 6-month renewal logic for Admin Desa `VERIFIED`.

### Scope

- Renewal applies only to `VERIFIED`.
- Renewal token success moves to renewal `IN_REVIEW`, not auto-renew.
- Internal admin reviews renewal.
- If accepted: remain `VERIFIED`, reset renewal date.
- If rejected/suspicious: remove verified access / return to user biasa according to policy.
- If not renewed after 6 months: remove Admin Desa verified access and email user to apply again.
- Same-day expiration is allowed; no long grace period required by default.
- Audit every renewal action.

### Must not include

- Admin Desa profile tabs,
- document upload/review,
- notification center beyond required email notification.

### Depends on

04-008.2 and 04-008.3.

---

## 04-008.6 — Admin Desa profile shell + badge/popover

### Goal

Add profile UI shell for Admin Desa status without implementing every tab feature yet.

### Scope

- Add small badge at bottom-right of profile photo for:
  - `VERIFIED`,
  - `LIMITED`.
- Badge opens popover explaining status and permissions.
- Add profile tab navigation structure for eligible Admin Desa.
- Tabs visible according to role policy.
- Keep existing profile tab intact.
- Do not make a dedicated dashboard.

### Must not include

- actual List Admin business actions,
- document upload,
- suara feature changes,
- notification system.

### Depends on

04-008.0 / 04-008.1.

### Source doc

`docs/bmad/tasks/sprint-04-008b-admin-desa-profile-tabs.md`

---

## 04-008.7 — Admin Desa List Admin tab + invite/revoke LIMITED

### Goal

Implement Admin Desa admin-list management for `VERIFIED` admin.

### Scope

- Tab:

```text
List Admin
```

- Exactly one `VERIFIED` admin per desa.
- List `VERIFIED` and `LIMITED` admins for the desa.
- Invite Admin button opens modal/popup/separate form.
- Only `VERIFIED` can invite.
- Invitee accepts as `LIMITED`.
- Only `VERIFIED` can revoke/delete `LIMITED`.
- Cannot revoke/delete `VERIFIED`.
- Confirmation + reason + audit for revoke/delete.
- Notify affected user if email notification exists.

### Must not include

- document upload,
- internal admin verification queue,
- notifications center beyond simple action result if needed.

### Depends on

04-008.6.

---

## 04-008.8 — Document storage + Admin Desa Dokumen tab upload

### Goal

Implement document upload and listing for Admin Desa.

### Scope

- Use approved storage design, likely Supabase Storage private bucket.
- Tab:

```text
Dokumen
```

- `LIMITED` can upload document into waiting-for-verified-approval state.
- `VERIFIED` can approve `LIMITED` upload into `PROCESSING`.
- `VERIFIED` upload goes directly to `PROCESSING`.
- Statuses:
  - `WAITING_VERIFIED_APPROVAL` or equivalent,
  - `PROCESSING`,
  - `PUBLISHED`,
  - `FAILED`.
- Show failure reason safely.
- Keep document status separate from claim status.
- Audit upload and verified approval.

### Must not include

- AI mapping/publish by internal admin,
- notification center completion,
- suara feature changes.

### Depends on

04-008.6 and 04-008.7 if `LIMITED` approval needs verified admin list/action.

---

## 04-008.9 — Internal Admin tab: Dokumen Desa review, AI mapping, publish

### Goal

Implement internal admin document review and mapping flow.

### Scope

Internal admin profile/page tab:

```text
Dokumen Desa
```

Features:

- list documents by status,
- view document metadata,
- process `PROCESSING` documents,
- run/trigger AI mapping if approved,
- inspect AI mapping result,
- edit/confirm mapping,
- publish/update desa data,
- mark document `PUBLISHED`,
- mark document `FAILED` with clear reason,
- notify uploader/admin,
- audit review/mapping/publish/failure.

### Must not include

- Admin Desa upload UI,
- Admin Desa verification review queue,
- general notification center rebuild unless needed for status messages.

### Depends on

04-008.8 and internal admin access from 04-008.1.

---

## 04-008.10 — Suara warga completion/regression

### Goal

Ensure suara warga works fully for user biasa, Admin Desa, and internal admin support needs.

### Scope

For user biasa:

- view published suara/comments,
- submit where supported,
- reply where supported,
- like/vote where supported.

For Admin Desa:

- Suara tab shows published comments/voices for their desa,
- see replies/likes/votes related to their desa/own admin comments,
- no moderation/destructive actions unless approved.

For internal admin:

- support/view access only if needed and server-side guarded.

### Must not include

- Admin Desa verification,
- document upload/mapping,
- full moderation system unless approved.

### Depends on

04-008.6 for Admin Desa tabs.

---

## 04-008.11 — Notification system completion

### Goal

Complete notifications for user biasa, Admin Desa, and internal admin.

### Scope

User biasa notifications:

- reply to comment,
- like/vote on comment if supported,
- claim status updates,
- OTP/freeze/rejected/reapply updates.

Admin Desa notifications:

- new suara/comment on their desa,
- reply to admin comment,
- like/vote,
- invite accepted,
- limited document waiting for approval,
- document approved into processing,
- document published/failed,
- renewal reminder/expired.

Internal admin notifications:

- new `IN_REVIEW` Admin Desa application,
- website token success waiting review,
- email OTP success waiting review,
- claim-support submission,
- suspicious/fraud review item,
- document waiting internal processing,
- document mapping failure,
- renewal review item,
- support/contact message.

### Must not include

- implementing each source feature if not already available; instead subscribe/emit to existing events created by prior tasks.

### Depends on

04-008.2, 04-008.3, 04-008.8, 04-008.9, 04-008.10.

---

## 04-008.12 — Final cross-role regression QA and cleanup

### Goal

Ensure the whole 04-008 back-office flow is stable.

### Scope

Regression test all roles:

- user biasa,
- claim applicant `PENDING`,
- applicant `IN_REVIEW`,
- applicant `REJECTED`,
- Admin Desa `LIMITED`,
- Admin Desa `VERIFIED`,
- internal admin.

Regression areas:

- auth/access guard,
- profile tabs,
- internal admin tabs,
- verification review,
- OTP/freeze/cooldown,
- renewal,
- invite/revoke limited,
- document upload/review/mapping/publish,
- suara warga,
- notifications,
- audit trail,
- privacy/no data leakage,
- desktop/mobile UI.

### Must include

- full quality gate:
  - `npm run lint`,
  - `npm run test`,
  - `npx tsc --noEmit`,
  - `npx prisma generate`,
  - `npm run build`.
- Browser QA notes/screenshots if UI touched.
- Known residual risks.

### Depends on

All approved 04-008 implementation tasks.

---

# Recommended assignment model

Do not assign one task to two people.

If multiple contributors are used:

- Contributor A handles backend foundation task.
- Contributor B handles UI task only after backend contract is merged.
- Reviewer reviews integration between tasks.

Never let two contributors modify the same flow/component/schema in parallel without a split task boundary.

## Suggested single-PIC order

1. 04-008.0
2. 04-008.1
3. 04-008.2
4. 04-008.3
5. 04-008.4
6. 04-008.5
7. 04-008.6
8. 04-008.7
9. 04-008.8
10. 04-008.9
11. 04-008.10
12. 04-008.11
13. 04-008.12

## Risk notes

Most risky tasks:

- 04-008.0 because schema/role decisions affect everything.
- 04-008.2 because trust flow and OTP security must be correct.
- 04-008.3 because internal admin approval can change membership state.
- 04-008.8/04-008.9 because file storage, AI mapping, and public data publish are sensitive.
- 04-008.11 because notifications touch many event sources.

## Approval status

Not approved for execution.

Owner must select which batch to start first before developer instruction is sent.

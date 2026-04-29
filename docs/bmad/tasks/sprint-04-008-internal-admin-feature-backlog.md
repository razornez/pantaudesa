# Sprint 04-008 — Internal Admin Feature Backlog

Date: 2026-04-29
Status: backlog / not-approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Owner gate: Iwan/Owner requested collecting all internal-admin related features into a separate future batch.

## Purpose

Collect internal admin features that are related to Desa Admin verification, review, moderation, audit, and governance, but are intentionally not part of Sprint 04-007.

This document is a backlog/task container only. It is not approved for implementation yet.

## Why separate from Sprint 04-007

Sprint 04-007 should focus on user-facing claim admin UI integration and browser QA.

Internal admin features are separated because they may require:

- internal-only roles/permissions,
- review queue design,
- status governance,
- moderation decisions,
- audit viewer,
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
- No automatic punishment/suspension based only on reports.
- No private email/phone exposure.
- No destructive migration without approval.
- No new dependency without approval.
- No new env without approval.
- All internal admin actions must have audit trail.
- Internal admin UI must not be public-accessible.

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
3. Decide whether the first internal admin need is review queue, revoke/suspend, or audit viewer.
4. Split selected item into a single-PIC execution task with TDD and browser QA.

## Approval status

Not approved for execution.

Do not instruct Ujang/Asep until Owner explicitly approves one selected internal-admin subtask.

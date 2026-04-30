# Sprint 04-007 Follow-up Note — Admin Claim Trust Flow Changes

Date: 2026-04-30
Status: follow-up-note / supersedes-parts-of-04-007-for-future-work
Prepared-by: Rangga / BMAD-lite orchestration
Related:
- `docs/bmad/tasks/sprint-04-007a-admin-claim-core-browser-flow.md`
- `docs/bmad/tasks/sprint-04-007b-admin-claim-completion-ux-invite-contact-browser-qa.md`
- `docs/bmad/tasks/sprint-04-008-admin-desa-verification-trust-flow-decision.md`

## Purpose

Sprint 04-007 has been delivered and merged to `main`, but Owner has refined the Admin Desa trust model after the merge. This note records the delta so future tasks do not follow the older 04-007 assumptions blindly.

This is not an execution instruction. Do not assign development work until Owner explicitly approves a new task.

## Updated decisions after Sprint 04-007

1. Website token verification success must not directly make a user `VERIFIED`.
2. Website token success should move the claim to `IN_REVIEW` first.
3. Internal admin must review the claim before promoting to `VERIFIED`, including checking whether the website is official and not suspicious/compromised.
4. Desa email verification is allowed, but must use OTP/code, not magic link.
5. Successful desa-email OTP confirmation must move the claim to `IN_REVIEW`, not directly to `VERIFIED`.
6. If review fails, claim status must become `REJECTED` with a clear user-facing reason.
7. If rejection includes fraud/suspicious-abuse indication, reapply cooldown is 3 days.
8. Email OTP resend and wrong-code attempts must have freeze/lockout behavior so users cannot keep trying or spamming OTP indefinitely.
9. Every step must be explained clearly in the claim form/page so users understand what happens next.
10. Admin Desa should be positioned as a helper/contributor for updating desa data. PantauDesa should still collect and enrich data from multiple sources independently.

## Expected future flow

```text
Submit claim
→ PENDING

Website path:
→ input official website candidate
→ validate official website signal
→ user places token
→ token found
→ IN_REVIEW
→ internal review
→ VERIFIED / REJECTED

Email path:
→ input desa email
→ send OTP/code
→ user enters OTP
→ OTP valid
→ IN_REVIEW
→ internal review
→ VERIFIED / REJECTED

Invite path:
→ VERIFIED admin invites user
→ invitee accepts
→ LIMITED
```

## OTP freeze rules for future implementation

Minimum expected behavior:

- OTP must expire.
- Wrong OTP attempts must be counted.
- Repeated wrong OTP attempts must freeze verification temporarily.
- Repeated resend requests must be throttled/frozen temporarily.
- Freeze state must be shown clearly in UI.
- Freeze must not reveal whether an email/account exists beyond safe generic messaging.
- OTP must not be logged in plaintext.
- OTP success/failure/resend/freeze must be audited.

Suggested initial policy:

```text
Wrong OTP attempts: freeze after 5 failed attempts.
Freeze duration: 15–30 minutes for normal abuse prevention.
OTP resend: allow limited resends, then freeze for 15–30 minutes.
Fraud/suspicious review rejection: reapply cooldown 3 days.
```

Exact numbers may be changed by Owner before execution.

## UI copy requirements

The claim form/page must explain:

- `PENDING`: claim recorded, not active admin yet.
- `IN_REVIEW`: verification signal received, waiting internal review.
- `REJECTED`: claim rejected with reason and reapply date.
- OTP success does not directly mean `VERIFIED`.
- Website token success does not directly mean `VERIFIED`.
- Fraud/suspicious rejection may require 3 days before reapply.
- OTP may be temporarily frozen after repeated wrong attempts or resend attempts.
- `LIMITED` is invite-only and cannot publish/invite.
- `VERIFIED` can publish desa data and invite admin, but still cannot perform internal admin actions.

## Future implementation source of truth

For future execution, use:

```text
docs/bmad/tasks/sprint-04-008-admin-desa-verification-trust-flow-decision.md
```

as the updated source of truth for Admin Desa verification trust flow.

# Sprint 04-008A — Admin Desa Verification Review & OTP Flow

Date: 2026-04-30
Status: backlog / not-approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Related:
- `docs/bmad/tasks/sprint-04-008-internal-admin-feature-backlog.md`
- `docs/bmad/tasks/sprint-04-008-admin-desa-verification-trust-flow-decision.md`
- `docs/bmad/tasks/sprint-04-008-admin-desa-otp-freeze-fraud-cooldown-policy.md`

## Purpose

Define the next Admin Desa verification flow after Sprint 04-007 is closed.

Sprint 04-007 is DONE and should not be reopened for this trust-flow change. This 04-008A backlog item becomes the future execution container for verification review, website-token review, desa-email OTP, `REJECTED` handling, fraud cooldown, and user-facing explanation updates.

This is a planning/backlog document only. Do not assign developer execution until Owner explicitly approves.

## Product principle

Admin Desa is a helper/contributor role for improving and updating data related to their own desa.

PantauDesa should still be the system that collects, aggregates, enriches, and maintains village data as completely as possible from multiple sources. Admin Desa input is important, but the platform should not depend only on Admin Desa submissions.

## Owner decisions captured

1. Website token verification success must not directly make a user `VERIFIED`.
2. Website token success should move the claim to `IN_REVIEW` first.
3. Internal admin must review the claim before promoting to `VERIFIED`, including checking whether the website is official and not suspicious/compromised.
4. Desa email verification is allowed, but must use OTP/code, not magic link.
5. Successful desa-email OTP confirmation must move the claim to `IN_REVIEW`, not directly to `VERIFIED`.
6. If review fails, claim status must become `REJECTED` with a clear user-facing reason.
7. If rejection includes fraud/suspicious-abuse indication, reapply cooldown is exactly 3 days.
8. Email OTP resend and wrong-code attempts must have freeze/lockout behavior so users cannot keep trying or spamming OTP indefinitely.
9. Every step must be explained clearly in the claim form/page so users understand what happens next.
10. `LIMITED` remains available only for users invited by an existing `VERIFIED` Admin Desa.

## Expected future flow

```text
Submit claim
→ PENDING

Website path:
→ input official website candidate/name/URL
→ validate official website signal
→ user places token
→ token found
→ IN_REVIEW
→ internal admin review
→ VERIFIED / REJECTED

Email path:
→ input desa email
→ send OTP/code
→ user enters OTP
→ OTP valid
→ IN_REVIEW
→ internal admin review
→ VERIFIED / REJECTED

Invite path:
→ VERIFIED Admin Desa invites user
→ invitee accepts
→ LIMITED
```

## Role/status meaning

### PENDING

- Claim is recorded.
- User is not an active Admin Desa.
- User may continue verification, view status, and contact support.
- User cannot publish data, invite admin, or access full Admin Desa dashboard.

### IN_REVIEW

- A verification signal exists.
- Internal admin must review before `VERIFIED`.
- Website token success and desa-email OTP success both lead here.
- User cannot publish data, invite admin, or perform admin actions.

### REJECTED

- Internal review failed.
- User must see clear reason.
- User may reapply after cooldown.
- Fraud/suspicious rejection uses 3-day cooldown.

### LIMITED

- Invite-only status.
- Created when a `VERIFIED` Admin Desa invites another user and invitee accepts.
- Cannot publish data.
- Cannot invite another admin.

### VERIFIED

- Internal review approved the claim.
- User can publish/update data for their own desa.
- User can invite another admin.
- User must renew website verification every 6 months.
- User still cannot access internal PantauDesa admin tools or revoke/suspend others in MVP.

## Website token verification requirements

- User must submit website URL/name first.
- System must validate whether website appears official before token verification is trusted.
- Signals may include:
  - `officialWebsiteUrl` stored in PantauDesa,
  - `.desa.id` domain,
  - government/pemda subdomain if supported later,
  - domain/content matching desa/kecamatan/kabupaten,
  - SSRF/private-network safety checks,
  - not a generic/free-hosting/personal domain unless manually reviewed.
- Token found means user controls that website at that time.
- Token found does not prove the site is official or uncompromised.
- Therefore token found must move to `IN_REVIEW`, not `VERIFIED`.

## Desa-email OTP requirements

- Email verification must use OTP/code, not magic link.
- OTP must expire.
- OTP must not be logged in plaintext.
- OTP success must create audit event.
- OTP success moves claim to `IN_REVIEW`, not `VERIFIED`.
- Email ownership is a signal, not final proof of desa authority.

## OTP freeze rules

Minimum expected behavior:

- Wrong OTP attempts must be counted.
- Repeated wrong OTP attempts must freeze verification temporarily.
- Repeated resend requests must be throttled/frozen temporarily.
- Freeze state must be shown clearly in UI.
- Freeze must not reveal whether an email/account exists beyond safe generic messaging.
- OTP success/failure/resend/freeze must be audited.

Suggested initial policy:

```text
Wrong OTP max attempts: 5
Freeze after wrong attempts: 15–30 minutes
OTP resend max attempts: 3 per short window
Freeze after excessive resend: 15–30 minutes
Fraud/suspicious review rejection: 3-day reapply cooldown
```

Exact OTP numbers may be adjusted before execution, but fraud/suspicious rejection cooldown is Owner-specified as 3 days.

## REJECTED and cooldown requirements

If internal review rejects a claim:

- status becomes `REJECTED`,
- user-facing reason is required,
- reapply availability must be shown,
- reapply must be blocked server-side before cooldown expires,
- reapply after cooldown must create audit event.

For fraud/suspicious rejection:

```text
cooldown = 3 days
```

Do not expose detailed fraud-detection signals to user.

## UI/page explanation requirements

The claim form/page must clearly explain:

- what `PENDING` means,
- what `IN_REVIEW` means,
- what `REJECTED` means,
- what `LIMITED` means and why it is invite-only,
- what `VERIFIED` means,
- why website URL/name must be submitted first,
- why official website validation is needed,
- why token success does not instantly make user `VERIFIED`,
- why email OTP success does not instantly make user `VERIFIED`,
- why PantauDesa reviews successful token/OTP claims,
- what user should do if token is not found,
- what user should do if OTP is wrong/expired/frozen,
- what happens if review is accepted,
- what happens if review is rejected,
- when user can reapply after rejection,
- that `VERIFIED` can publish data and invite admins,
- that `LIMITED` cannot publish or invite,
- that Admin Desa helps update/confirm data while PantauDesa still collects data from other sources.

## Suggested user-facing copy

### PENDING

```text
Klaim kamu sudah tercatat. Kamu belum menjadi Admin Desa aktif. Lanjutkan verifikasi melalui website resmi desa atau kode OTP email desa.
```

### Website token found / IN_REVIEW

```text
Token berhasil ditemukan di website yang kamu masukkan. Klaim masuk tahap review internal untuk memastikan website tersebut benar-benar resmi dan tidak sedang disalahgunakan. Jika lolos review, status kamu akan menjadi VERIFIED.
```

### Email OTP confirmed / IN_REVIEW

```text
Kode OTP email berhasil dikonfirmasi. Klaim kamu masuk tahap review internal karena email desa saja belum cukup untuk langsung memverifikasi admin. Jika lolos review, status kamu akan menjadi VERIFIED.
```

### OTP frozen

```text
Percobaan OTP terlalu banyak. Verifikasi email dibekukan sementara sampai {freezeUntil}. Coba lagi nanti atau gunakan metode website token jika tersedia.
```

### REJECTED

```text
Klaim belum bisa disetujui. Alasan: {reason}. Kamu bisa mengajukan ulang setelah {cooldownDate}. Perbaiki informasi yang diminta sebelum mengajukan ulang.
```

### Fraud/suspicious REJECTED

```text
Klaim belum bisa disetujui karena terdapat indikasi risiko pada proses verifikasi. Kamu bisa mengajukan ulang setelah {cooldownDate}. Jika merasa ini keliru, hubungi admin PantauDesa.
```

### LIMITED

```text
Kamu adalah Admin Desa LIMITED karena menerima undangan dari Admin Desa VERIFIED. Kamu bisa melihat akses terbatas, tetapi belum bisa publish data atau mengundang admin lain.
```

### VERIFIED

```text
Kamu adalah Admin Desa VERIFIED. Kamu bisa publish data desa dan mengundang admin lain. Status VERIFIED perlu diperbarui berkala melalui verifikasi website.
```

## Internal review requirements

Internal review must check at minimum:

- whether URL/domain is official enough,
- whether website appears to match claimed desa,
- whether website/token placement looks suspicious or compromised,
- whether desa email/domain/context looks reasonable if OTP path is used,
- whether duplicate/conflicting claims exist for the same desa,
- whether audit events are complete.

Internal review must be positioned as a safety gate for Admin Desa membership verification, not as a process for PantauDesa to manipulate desa data.

## Audit requirements

Audit events should cover:

- website candidate submitted,
- website token generated,
- website token check failed/succeeded,
- claim moved to `IN_REVIEW`,
- OTP requested,
- OTP resent,
- OTP resend blocked/frozen,
- OTP invalid attempt,
- OTP verification frozen,
- OTP confirmed,
- claim rejected,
- fraud/suspicious rejection category,
- cooldown start/end,
- reapply after cooldown,
- internal admin approval/rejection,
- membership promoted to `VERIFIED`,
- invite accepted as `LIMITED`.

Audit logs must not store OTP in plaintext or leak sensitive fraud-detection detail.

## Data model considerations

Future execution may need fields/statuses such as:

```text
PENDING
IN_REVIEW
REJECTED
LIMITED
VERIFIED
reviewRejectedReason
reviewRejectedCategory
reapplyAllowedAt
fraudCooldownUntil
otpFailedAttempts
otpResendCount
otpFrozenUntil
otpLastSentAt
otpExpiresAt
```

Names are suggestions only; developer should align with existing schema conventions.

## Out of scope until approved

- modifying delivered 04-007 behavior without a new approved execution task,
- automatic promotion to `VERIFIED` after website token success,
- automatic promotion to `VERIFIED` after email OTP success,
- magic-link email verification for desa email path,
- trusting email desa as final proof,
- trusting surat tugas/SK/document upload as primary/final verification,
- allowing `LIMITED` admin to publish data,
- allowing `LIMITED` admin to invite,
- allowing `VERIFIED` admin to revoke/suspend others in MVP,
- exposing detailed fraud signals to users.

## Acceptance criteria for future execution

A future implementation must prove:

- website token success moves to `IN_REVIEW`, not `VERIFIED`,
- email OTP success moves to `IN_REVIEW`, not `VERIFIED`,
- `REJECTED` always has clear reason,
- fraud/suspicious rejection enforces 3-day cooldown,
- wrong OTP attempts cannot be spammed indefinitely,
- OTP resend cannot be spammed indefinitely,
- freeze/cooldown is enforced server-side,
- freeze/cooldown is explained in UI,
- all sensitive transitions are audited,
- no OTP/secret/fraud detail leaks in logs, screenshots, or client-side storage.

# Sprint 04-008 Addendum — Admin Desa OTP Freeze & Fraud Cooldown Policy

Date: 2026-04-30
Status: owner-decision / backlog / not-approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Related:
- `docs/bmad/tasks/sprint-04-008-admin-desa-verification-trust-flow-decision.md`
- `docs/bmad/tasks/sprint-04-008-internal-admin-feature-backlog.md`
- `docs/bmad/tasks/sprint-04-007-admin-claim-trust-flow-followup-note.md`

## Purpose

Capture Owner decision for two trust/safety rules related to Admin Desa verification:

1. Fraud/suspicious rejection uses a 3-day reapply cooldown.
2. Desa-email OTP verification must include freeze/lockout behavior for wrong OTP attempts and excessive resend attempts.

This is a planning decision only. Do not instruct developer execution until Owner explicitly approves a concrete 04-008 execution task.

## Owner decisions

### Fraud/suspicious rejection cooldown

If internal review rejects a claim because there is an indication of fraud, abuse, suspicious activity, or attempted impersonation:

```text
status = REJECTED
cooldown = 3 days
```

Requirements:

- User must see a clear rejection reason.
- User must see when they can reapply.
- User must not be able to reapply before cooldown expires.
- Reapply after cooldown must create a new audit event.
- Rejected state must not expose sensitive fraud-detection details that help attackers bypass review.

Suggested user-facing copy:

```text
Klaim belum bisa disetujui karena terdapat indikasi risiko pada proses verifikasi. Kamu bisa mengajukan ulang setelah {cooldownDate}. Jika merasa ini keliru, hubungi admin PantauDesa.
```

### Non-fraud rejection cooldown

For normal review failure without fraud indication, cooldown can be shorter or configurable later.

Examples:

- website does not match desa,
- token placed on wrong website,
- email/domain context not convincing,
- information incomplete.

Initial policy can still use cooldown, but fraud/suspicious cases must specifically use 3 days.

## Desa-email OTP freeze policy

Desa-email OTP is allowed as a verification signal, but OTP success only moves the claim into `IN_REVIEW`; it must not directly make the user `VERIFIED`.

### OTP send/resend requirements

- OTP must expire.
- OTP resend must be rate-limited.
- Excessive resend attempts must trigger temporary freeze.
- Freeze state must be shown clearly in UI.
- The resend button must be disabled while frozen.
- The system must avoid revealing sensitive account/email existence signals.
- Every resend/freeze event must be audited.

Suggested initial policy:

```text
OTP resend max attempts: 3 per short window
Freeze after excessive resend: 15–30 minutes
```

Exact values may be adjusted before execution.

### Wrong OTP requirements

- Wrong OTP attempts must be counted.
- Too many wrong OTP attempts must freeze OTP verification temporarily.
- Freeze state must prevent further OTP checks and resend spam for the frozen window.
- Freeze state must show clear user guidance.
- OTP values must not be logged in plaintext.
- Wrong-attempt/freeze events must be audited.

Suggested initial policy:

```text
Wrong OTP max attempts: 5
Freeze after wrong attempts: 15–30 minutes
```

Exact values may be adjusted before execution.

### OTP success requirements

```text
PENDING
→ email OTP sent
→ OTP confirmed
→ IN_REVIEW
```

OTP success does not mean:

```text
VERIFIED
```

Reason:

- Desa email can be created/controlled by someone with IT access.
- Email ownership is useful as a signal but not final proof of desa authority.
- Internal review is still required.

## Required UI states

The claim form/page must clearly display these states:

### OTP sent

```text
Kode OTP sudah dikirim ke email desa. Masukkan kode tersebut untuk melanjutkan proses verifikasi. Konfirmasi email hanya akan membawa klaim ke tahap review, bukan langsung VERIFIED.
```

### Wrong OTP

```text
Kode OTP salah. Periksa kembali kode yang dikirim ke email desa.
```

### OTP frozen

```text
Percobaan OTP terlalu banyak. Verifikasi email dibekukan sementara sampai {freezeUntil}. Coba lagi nanti atau gunakan metode website token jika tersedia.
```

### Resend frozen

```text
Pengiriman ulang kode OTP terlalu sering. Kamu bisa meminta kode baru setelah {freezeUntil}.
```

### OTP confirmed / IN_REVIEW

```text
Kode OTP email berhasil dikonfirmasi. Klaim kamu masuk tahap review internal karena email desa saja belum cukup untuk langsung memverifikasi admin. Jika lolos review, status kamu akan menjadi VERIFIED.
```

### Fraud/suspicious REJECTED

```text
Klaim belum bisa disetujui karena terdapat indikasi risiko pada proses verifikasi. Kamu bisa mengajukan ulang setelah {cooldownDate}. Jika merasa ini keliru, hubungi admin PantauDesa.
```

## Audit requirements

Audit events should cover:

- OTP requested,
- OTP resent,
- OTP resend blocked/frozen,
- OTP invalid attempt,
- OTP verification frozen,
- OTP confirmed,
- claim moved to `IN_REVIEW`,
- claim rejected,
- fraud/suspicious rejection reason category,
- cooldown start/end,
- reapply after cooldown.

Audit logs must not store OTP in plaintext.

## Data model considerations

Future execution may need fields such as:

```text
otpFailedAttempts
otpResendCount
otpFrozenUntil
otpLastSentAt
otpExpiresAt
reviewRejectedReason
reviewRejectedCategory
reapplyAllowedAt
fraudCooldownUntil
```

Names are suggestions only; developer should align with existing schema conventions.

## Acceptance criteria for future execution

A future implementation must prove:

- wrong OTP attempts cannot be spammed indefinitely,
- OTP resend cannot be spammed indefinitely,
- freeze state is enforced server-side,
- freeze state is explained in UI,
- OTP success moves to `IN_REVIEW`, not `VERIFIED`,
- fraud/suspicious rejection sets 3-day cooldown,
- cooldown is enforced server-side,
- cooldown/rejection reason is shown safely in UI,
- audit events exist for OTP/freeze/rejection/reapply,
- no OTP or secret is exposed in logs, screenshots, or client-side storage.

## Out of scope until approved

- implementing the OTP service immediately,
- adding new env vars without approval,
- changing existing delivered Sprint 04-007 flow without a new approved task,
- automatic `VERIFIED` promotion after OTP success,
- exposing detailed fraud signals to users.

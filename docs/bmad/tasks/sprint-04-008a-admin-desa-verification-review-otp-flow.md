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

Sprint 04-007 is DONE and should not be reopened for this trust-flow change. This 04-008A backlog item becomes the future execution container for verification review, website-token review, desa-email OTP, dedicated claim-support contact form, `REJECTED` handling, fraud cooldown, renewal enforcement, and user-facing explanation updates.

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
11. Renewal token success must also enter internal review; it must not auto-renew `VERIFIED` without review.
12. If renewal review indicates the website changed, is suspicious, or may be hacked/compromised, downgrade/remove verified admin access according to renewal policy.
13. If a `VERIFIED` admin does not renew after 6 months, change their role/access back to regular user and email them that they must apply again.
14. Renewal failure/grace period may happen the same day; no long grace period is required by default.
15. There must be a third application path: dedicated Hubungi Admin for Admin Desa claim/application, separate from the general Hubungi Admin form.
16. The dedicated claim-support form must support claim-specific fields, files/evidence/attachments or document references, and after submission the claim remains or becomes `IN_REVIEW`.
17. Internal admin must provide clear rejection description and instructions so applicants know exactly what to fix before reapplying.
18. Invite admin UI should be separated from the claim form. For `VERIFIED` admins, show admin list/profile entry and an Invite Admin button that opens a popup/modal or separate invite form.

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

Dedicated claim-support path:
→ user opens Hubungi Admin Pengajuan Admin Desa
→ user submits claim-specific explanation + evidence/berkas
→ claim becomes/remains IN_REVIEW
→ internal admin review
→ VERIFIED / REJECTED / request more info

Invite path:
→ VERIFIED Admin Desa opens admin list/profile area
→ clicks Invite Admin
→ invite form appears as modal/popup or separate page
→ invitee accepts
→ LIMITED

Renewal path:
→ VERIFIED admin reaches 6-month renewal due date
→ user performs website token renewal
→ token found
→ IN_REVIEW renewal
→ internal admin review
→ remain VERIFIED / downgrade-remove access to regular user if failed/suspicious/not renewed
```

## Role/status meaning

### PENDING

- Claim is recorded.
- User is not an active Admin Desa.
- User may continue verification, view status, submit claim-support evidence, and contact support.
- User cannot publish data, invite admin, or access full Admin Desa dashboard.

### IN_REVIEW

- A verification signal exists.
- Internal admin must review before `VERIFIED`.
- Website token success, desa-email OTP success, and dedicated claim-support submission can all lead here.
- User cannot publish data, invite admin, or perform admin actions.

### REJECTED

- Internal review failed.
- User must see clear reason and clear instructions to fix missing/incorrect items.
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
- If renewal is not completed after 6 months, the user loses Admin Desa verified access and returns to regular user access until they apply again.
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

## Dedicated Hubungi Admin Pengajuan Admin Desa requirements

The general Hubungi Admin form from Sprint 04-007 must not be overloaded for Admin Desa claim verification.

Create/plan a separate claim-specific contact/support form, for example:

```text
Hubungi Admin Pengajuan Admin Desa
```

Purpose:

- help users who cannot complete website token or email OTP path,
- let users submit claim-specific explanation and supporting evidence,
- route the submission into internal review,
- keep claim status clear and auditable.

Potential fields:

- desa being claimed,
- applicant name/contact,
- reason for claiming admin access,
- why website/email verification cannot be completed,
- supporting evidence description,
- berkas/bukti upload or document references, if storage is approved,
- notes for internal admin.

Flow:

```text
User submits dedicated claim-support form
→ claim becomes/remains IN_REVIEW
→ internal admin reviews evidence
→ internal admin approves VERIFIED / rejects REJECTED / requests more info
```

Rules:

- This form is separate from general Hubungi Admin.
- This form must be tied to claim/desa/user context.
- Submission must not directly grant `LIMITED` or `VERIFIED`.
- If file upload is included, storage/privacy design must be approved first.
- Internal admin must provide clear review decision and next instruction.

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
- internal admin must provide clear instructions for what to fix before reapplying,
- reapply availability must be shown,
- reapply must be blocked server-side before cooldown expires,
- reapply after cooldown must create audit event.

For fraud/suspicious rejection:

```text
cooldown = 3 days
```

Do not expose detailed fraud-detection signals to user.

## Renewal requirements

Renewal applies only to `VERIFIED` Admin Desa.

Owner decisions:

- renewal token success must go to internal review,
- renewal token success must not automatically extend `VERIFIED`,
- if the website appears changed, hacked, compromised, suspicious, or no longer matches the desa, admin verified access should be removed/downgraded according to policy,
- if `VERIFIED` admin does not renew after 6 months, change their access back to regular user and send email notification that they must apply again,
- renewal failure may take effect on the same day; no long grace period is required by default.

Recommended flow:

```text
VERIFIED admin reaches renewal due date
→ system sends renewal reminder if email notification exists
→ admin submits renewal website token
→ token found
→ renewal IN_REVIEW
→ internal admin reviews
→ if accepted: remain VERIFIED and reset renewal date
→ if rejected/suspicious: remove VERIFIED access and notify user
→ if not renewed by due date: remove VERIFIED access and notify user to apply again
```

Email notification must explain:

- admin access has expired due to renewal not completed,
- user is back to regular user access,
- user must submit a new Admin Desa application if they still manage the desa,
- where to start the application again.

## Invite admin placement requirements

Invite admin should not remain embedded as a large section in the claim form.

Future UI direction:

- show list of admins/admin status in user profile or Admin Desa profile area after user becomes `VERIFIED`,
- provide an `Invite Admin` button there,
- open invite form as popup/modal or navigate to a separate invite page,
- keep invite flow separate from claim verification form,
- invite form should still explain that invitee becomes `LIMITED`, not `VERIFIED`,
- only `VERIFIED` Admin Desa can see/use invite action,
- `LIMITED`, `PENDING`, `IN_REVIEW`, and `REJECTED` must not see invite as an available action.

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
- why claim-support submission does not instantly make user `VERIFIED`,
- why PantauDesa reviews successful token/OTP/support claims,
- what user should do if token is not found,
- what user should do if OTP is wrong/expired/frozen,
- what user should do if they cannot use website/email verification,
- what happens if review is accepted,
- what happens if review is rejected,
- what must be fixed before reapplying,
- when user can reapply after rejection,
- what happens if renewal is missed,
- that `VERIFIED` can publish data and invite admins,
- that `LIMITED` cannot publish or invite,
- that Admin Desa helps update/confirm data while PantauDesa still collects data from other sources.

## Suggested user-facing copy

### PENDING

```text
Klaim kamu sudah tercatat. Kamu belum menjadi Admin Desa aktif. Lanjutkan verifikasi melalui website resmi desa, kode OTP email desa, atau Hubungi Admin Pengajuan Admin Desa jika kamu tidak bisa memakai dua metode tersebut.
```

### Website token found / IN_REVIEW

```text
Token berhasil ditemukan di website yang kamu masukkan. Klaim masuk tahap review internal untuk memastikan website tersebut benar-benar resmi dan tidak sedang disalahgunakan. Jika lolos review, status kamu akan menjadi VERIFIED.
```

### Email OTP confirmed / IN_REVIEW

```text
Kode OTP email berhasil dikonfirmasi. Klaim kamu masuk tahap review internal karena email desa saja belum cukup untuk langsung memverifikasi admin. Jika lolos review, status kamu akan menjadi VERIFIED.
```

### Claim-support submitted / IN_REVIEW

```text
Bukti pengajuan Admin Desa berhasil dikirim. Klaim kamu masuk tahap review internal. Admin PantauDesa akan memeriksa bukti dan memberikan keputusan atau instruksi lanjutan.
```

### OTP frozen

```text
Percobaan OTP terlalu banyak. Verifikasi email dibekukan sementara sampai {freezeUntil}. Coba lagi nanti atau gunakan metode website token jika tersedia.
```

### REJECTED

```text
Klaim belum bisa disetujui. Alasan: {reason}. Yang perlu diperbaiki: {instructions}. Kamu bisa mengajukan ulang setelah {cooldownDate}.
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

### Renewal expired

```text
Status Admin Desa VERIFIED kamu berakhir karena verifikasi berkala belum diperbarui. Akses admin telah dikembalikan ke user biasa. Jika kamu masih mengelola desa ini, ajukan verifikasi Admin Desa kembali.
```

## Internal review requirements

Internal review must check at minimum:

- whether URL/domain is official enough,
- whether website appears to match claimed desa,
- whether website/token placement looks suspicious or compromised,
- whether desa email/domain/context looks reasonable if OTP path is used,
- whether dedicated claim-support evidence is complete and convincing enough,
- whether duplicate/conflicting claims exist for the same desa,
- whether renewal website still matches the desa and does not look compromised,
- whether audit events are complete.

Internal review must be positioned as a safety gate for Admin Desa membership verification, not as a process for PantauDesa to manipulate desa data.

When rejecting, internal admin must provide:

- rejection category,
- user-facing reason,
- clear instruction for what to fix,
- whether fraud/suspicious 3-day cooldown applies,
- reapply date if applicable.

## Audit requirements

Audit events should cover:

- website candidate submitted,
- website token generated,
- website token check failed/succeeded,
- claim-support form submitted,
- claim-support evidence uploaded/linked,
- claim moved to `IN_REVIEW`,
- OTP requested,
- OTP resent,
- OTP resend blocked/frozen,
- OTP invalid attempt,
- OTP verification frozen,
- OTP confirmed,
- claim rejected,
- rejection instruction added,
- fraud/suspicious rejection category,
- cooldown start/end,
- reapply after cooldown,
- internal admin approval/rejection,
- membership promoted to `VERIFIED`,
- renewal reminder sent,
- renewal token check succeeded/failed,
- renewal moved to review,
- renewal approved,
- verified access removed due to failed/missed renewal,
- renewal expiration email sent,
- invite modal/form opened/submitted,
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
reviewRejectedInstructions
reviewRejectedCategory
reapplyAllowedAt
fraudCooldownUntil
otpFailedAttempts
otpResendCount
otpFrozenUntil
otpLastSentAt
otpExpiresAt
claimSupportSubmittedAt
claimSupportEvidencePath
renewalDueAt
renewalReviewStatus
renewalRejectedReason
verifiedAccessRemovedAt
verifiedAccessRemovedReason
```

Names are suggestions only; developer should align with existing schema conventions.

## Out of scope until approved

- modifying delivered 04-007 behavior without a new approved execution task,
- automatic promotion to `VERIFIED` after website token success,
- automatic promotion to `VERIFIED` after email OTP success,
- automatic renewal approval after renewal token success,
- magic-link email verification for desa email path,
- trusting email desa as final proof,
- trusting surat tugas/SK/document upload as primary/final verification,
- allowing `LIMITED` admin to publish data,
- allowing `LIMITED` admin to invite,
- allowing `VERIFIED` admin to revoke/suspend others in MVP,
- keeping invite admin as a bulky section inside claim verification form,
- overloading the general Hubungi Admin form for claim-specific verification evidence,
- exposing detailed fraud signals to users.

## Acceptance criteria for future execution

A future implementation must prove:

- website token success moves to `IN_REVIEW`, not `VERIFIED`,
- email OTP success moves to `IN_REVIEW`, not `VERIFIED`,
- dedicated claim-support submission moves to or remains `IN_REVIEW`,
- `REJECTED` always has clear reason and instructions,
- fraud/suspicious rejection enforces 3-day cooldown,
- wrong OTP attempts cannot be spammed indefinitely,
- OTP resend cannot be spammed indefinitely,
- freeze/cooldown is enforced server-side,
- freeze/cooldown is explained in UI,
- renewal token success goes to internal review,
- missed renewal removes verified admin access and sends email notification,
- invite admin UI is separate from claim form and only available to `VERIFIED`,
- all sensitive transitions are audited,
- no OTP/secret/fraud detail leaks in logs, screenshots, or client-side storage.

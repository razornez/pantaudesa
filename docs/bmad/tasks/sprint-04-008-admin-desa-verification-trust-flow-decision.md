# Sprint 04-008 Addendum — Admin Desa Verification Trust Flow Decision

Date: 2026-04-30
Status: owner-decision / backlog / not-approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Related backlog: `docs/bmad/tasks/sprint-04-008-internal-admin-feature-backlog.md`

## Purpose

Capture the latest Owner decision about Admin Desa verification status, website token trust, official website validation, internal review, and user-facing explanation requirements.

This is a planning decision only. Do not instruct developer execution until Owner explicitly approves a concrete 04-008 execution task.

## Owner decisions captured

1. `LIMITED` status remains available, but only for users invited by an existing `VERIFIED` Admin Desa.
2. A normal user who submits a claim does not become `LIMITED` automatically.
3. A user who submits a claim starts as `PENDING` or `IN_REVIEW`.
4. Website token verification requires the user to submit the website URL/name first.
5. The submitted website must be validated as the official village website before token verification can be trusted.
6. Even if the website token is found successfully, the user must not be promoted directly to `VERIFIED` automatically.
7. Successful website token check should move the claim into an internal review step first, so PantauDesa can make sure the official website was not hacked or compromised.
8. Every step and status must be explained clearly on the claim form/page so users understand what happens next.
9. The UI must not leave the user confused after `PENDING`, `IN_REVIEW`, successful token check, or invite acceptance.

## Revised trust model

### PENDING

Meaning:

- User has submitted a claim.
- User is not yet an active Admin Desa.
- User has no Admin Desa permissions beyond checking claim status and continuing verification.

Allowed:

- view claim status,
- submit/confirm official website candidate,
- follow website token verification instructions,
- contact support/admin,
- read guide/FAQ.

Not allowed:

- publish data,
- access full Admin Desa dashboard,
- upload official documents as an active admin,
- invite another admin.

### IN_REVIEW

Meaning:

- A verification signal exists, but PantauDesa/internal admin still needs to review it.
- This may happen after a successful website token check, because the system still needs to make sure the website is truly official and not compromised.

Allowed:

- view review status,
- see next-step explanation,
- contact support/admin,
- respond to request for more information if that workflow exists later.

Not allowed:

- publish data,
- invite admin,
- access full Admin Desa dashboard,
- perform admin actions.

### LIMITED

Meaning:

- User is an active Admin Desa with restricted permissions.
- `LIMITED` is used specifically for users invited by an existing `VERIFIED` Admin Desa.
- `LIMITED` is not the result of self-claim or untrusted email/document submission.

Allowed:

- access limited Admin Desa dashboard,
- view own admin status,
- read guide/FAQ,
- contact support/admin,
- continue verification toward `VERIFIED` if needed.

Not allowed:

- publish/update public Desa data,
- invite another admin,
- revoke/suspend another admin,
- change another admin role/status,
- manually mark source/data as verified,
- access internal PantauDesa admin panel,
- perform destructive actions.

### VERIFIED

Meaning:

- User is a verified Admin Desa after internal review confirms the verification evidence is valid.
- Website token success is a strong signal, but final promotion to `VERIFIED` requires internal review.

Allowed:

- access Admin Desa dashboard,
- publish/update data for their own desa,
- upload/update source documents,
- invite another admin by email,
- perform 6-month website verification renewal.

Not allowed for MVP:

- revoke/suspend another admin,
- change another admin role/status,
- access internal PantauDesa admin panel,
- manually mark source/data as verified,
- destructive actions such as delete desa or bulk delete public data.

## Website token verification flow

Recommended flow:

```text
User submits claim
→ status PENDING
→ user inputs official website candidate/name/URL
→ system validates whether website appears official
→ user places token on that website
→ system checks token
→ if token not found: stay PENDING with clear retry guidance
→ if token found: status becomes IN_REVIEW, not VERIFIED
→ internal admin reviews official website validity and compromise risk
→ if accepted: status becomes VERIFIED
→ if rejected: stay/revert to PENDING or IN_REVIEW with clear reason
```

## Official website validation requirement

Before token verification is trusted, the system should validate that the submitted URL is likely the official village website.

Signals to consider:

- URL already stored in PantauDesa as `officialWebsiteUrl` for that desa.
- Domain uses a trusted official pattern such as `.desa.id`.
- Domain/subdomain matches village identity strongly enough.
- Domain is under a government/pemda domain if the project later supports this pattern.
- Website content reasonably matches desa name/kecamatan/kabupaten.
- URL is not a generic/free-hosting/personal domain unless manually reviewed.
- URL passes SSRF/private network safety checks.

Important:

- A successful token check proves control over that website at that moment.
- It does not fully prove the website is official or uncompromised.
- Therefore successful token check must be reviewed internally before `VERIFIED` promotion.

## Invite flow and LIMITED status

Invite flow:

```text
VERIFIED Admin Desa invites email
→ invitee accepts
→ invitee becomes LIMITED
```

Rules:

- Only `VERIFIED` Admin Desa may invite another admin.
- Invitee starts as `LIMITED`, not `VERIFIED`.
- `LIMITED` invitee cannot publish data or invite another admin.
- `LIMITED` invitee may later pursue verification if needed.

## UI/page explanation requirements

Every step must be explained on the claim form/page, not hidden only in BMAD docs.

The form/page must clearly explain:

1. What `PENDING` means.
2. What `IN_REVIEW` means.
3. What `LIMITED` means and why it is invite-only.
4. What `VERIFIED` means.
5. Why website URL/name must be submitted first.
6. Why official website validation is needed.
7. Why token success does not instantly make the user `VERIFIED`.
8. That PantauDesa reviews successful website token claims to reduce risk from hacked/compromised websites.
9. What the user should do if token is not found.
10. What the user should do while waiting for internal review.
11. What happens if review is accepted or rejected.
12. That `VERIFIED` admin can publish data and invite admins.
13. That `LIMITED` admin cannot publish or invite.
14. That renewal applies to `VERIFIED` admins.

Suggested copy examples:

### PENDING

```text
Klaim kamu sudah tercatat. Kamu belum menjadi Admin Desa aktif. Masukkan website resmi desa dan ikuti verifikasi token untuk melanjutkan.
```

### Token found / IN_REVIEW

```text
Token berhasil ditemukan di website yang kamu masukkan. Klaim masuk tahap review internal untuk memastikan website tersebut benar-benar resmi dan tidak sedang disalahgunakan. Jika lolos review, status kamu akan menjadi VERIFIED.
```

### LIMITED

```text
Kamu adalah Admin Desa LIMITED karena menerima undangan dari Admin Desa VERIFIED. Kamu bisa melihat akses terbatas, tetapi belum bisa publish data atau mengundang admin lain.
```

### VERIFIED

```text
Kamu adalah Admin Desa VERIFIED. Kamu bisa publish data desa dan mengundang admin lain. Status VERIFIED perlu diperbarui berkala melalui verifikasi website.
```

## Internal review requirement

Internal review must check at minimum:

- whether the URL/domain is official enough,
- whether the website appears to match the claimed desa,
- whether there are signs of suspicious compromise or mismatch,
- whether token placement looks legitimate,
- whether there are duplicate/conflicting claims for the same desa,
- whether audit events are complete.

Internal review must not be positioned as PantauDesa manipulating desa data. It is a safety gate for Admin Desa membership verification only.

## Out of scope until approved

- automatic promotion to `VERIFIED` immediately after token success,
- trusting email desa as primary verification,
- trusting surat tugas / SK / document upload as primary verification,
- allowing `LIMITED` admin to publish data,
- allowing `LIMITED` admin to invite,
- allowing `VERIFIED` admin to revoke/suspend others in MVP,
- manual `mark source as verified` feature.

## Open questions for future execution task

- What exact data model/status enum should represent `IN_REVIEW`?
- Should `PENDING` and `IN_REVIEW` be claim statuses only, while `LIMITED`/`VERIFIED` are membership statuses?
- What official website validation heuristics are acceptable for MVP?
- Should `.desa.id` be required for auto-review eligibility, or only preferred?
- What internal admin screen handles token-success review?
- What SLA/copy should be shown while waiting for review?
- What happens if a `VERIFIED` admin fails renewal: downgrade to `LIMITED`, `IN_REVIEW`, or `PENDING`?

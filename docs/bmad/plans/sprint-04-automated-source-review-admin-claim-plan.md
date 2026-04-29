# Sprint 04 Plan — Automated Source Review + Desa Admin Claim Foundation

Date: 2026-04-29
Status: DRAFT_FOR_OWNER_REVIEW
Prepared-by: Rangga / BMAD-lite orchestration

## Purpose

This document records the Sprint 04 plan discussed by Owner and Rangga so it can be reviewed later before implementation.

Do not treat this as an open implementation gate yet.

## Sprint 04 working title

Automated Source Review + Desa Admin Claim Foundation

## Product direction

PantauDesa should become automation-first because checking every desa manually is not scalable.

However, automation must stay legally and reputationally safe:

- AI may help detect official sources and map documents.
- AI may recommend status and risk flags.
- PantauDesa should not claim every mapped value is final official truth.
- Official source detection means the source/channel is official or likely official, not that PantauDesa guarantees every extracted value.
- Admin desa verification must be stricter than document/source detection because a fake admin can create legal/reputation risk.

## Sprint 04 goals

1. Build automated source/document review foundation.
2. Add AI-assisted document/source mapping as recommendation, not final authority.
3. Introduce official source detection status.
4. Create guided Desa Admin Claim flow.
5. Support verified desa admin identity through fast but defensible channels.
6. Add audit trail for all claim, verification, upload, invite, and clarification actions.
7. Prepare public source transparency UI: every section should show where data came from and when it was last updated.

## Owner decisions recorded on 2026-04-29

1. Support email must come from environment variable, not hardcoded.
2. Invite admin desa is capped at maximum 5 admins per desa for the first version.
3. Invited admins start as limited unless promoted by the first verified desa admin.
4. Admin document upload is needed; storage choice should prefer a free/low-cost object storage option.
5. Add public/internal button for reporting fake admin claims.
6. Keep the UI simple and guided, not a blank form.

## Storage recommendation for admin document uploads

### Preferred MVP option: Supabase Storage

Reason:

- PantauDesa already uses Supabase/PostgreSQL.
- It reduces integration complexity.
- Supabase Storage has a free quota of 1 GB on the Free plan according to Supabase documentation.
- Good enough for MVP if uploads are limited by file size/type.

Recommended MVP limits:

- PDF/JPG/PNG only.
- Max file size: 5 MB per file.
- Max files per claim/upload step: 3.
- Store file metadata and hash in DB.
- Store private bucket object path, not public permanent URL by default.
- Use signed URLs for review access.

### Alternative for larger free tier: Cloudflare R2

Reason:

- Cloudflare R2 has a larger monthly free tier: 10 GB-month storage, 1 million Class A operations, 10 million Class B operations, and free egress for Standard storage per Cloudflare docs.
- Better for future larger document storage.
- More integration work than Supabase Storage.

Recommended decision:

- Use Supabase Storage for Sprint 04 MVP.
- Revisit Cloudflare R2 if storage grows or egress/file access becomes a cost concern.

### Not preferred for MVP: AWS S3

Reason:

- Strong and mature, but billing/account setup is heavier for MVP.
- AWS S3 pricing is pay-as-you-go, and current AWS Free Tier is credit-based for new customers.

## Key terminology

### Source status

Use safer public language:

```text
Sumber Resmi Terdeteksi
```

Internal candidate status:

```text
official_source_detected
```

Meaning:

- The source/channel appears to be official or defensible.
- The original source URL/document remains the main reference.
- PantauDesa maps and summarizes; it does not replace the official document.

Avoid public claim:

```text
PantauDesa menjamin data ini benar.
```

### Admin status

Candidate statuses:

```text
CLAIMANT_DESA
DESA_PENDING
DESA_LIMITED
DESA_VERIFIED_ADMIN
```

`DESA_VERIFIED_ADMIN` should only be granted through approved proof channels.

## Recommended verification channels

### 1. Official email magic link

Fastest path.

Flow:

```text
User opens profile
↓
Clicks Klaim sebagai Admin Desa
↓
Selects desa
↓
System shows official email found from recorded source, if available
↓
User requests magic link
↓
Magic link sent to official email
↓
User clicks link
↓
Role becomes DESA_VERIFIED_ADMIN for that desa
↓
Audit trail recorded
```

Important rules:

- Do not allow random personal email to auto-verify.
- Email should come from official village/government domain or be listed on official desa source.
- If user only has personal email, route to website token or fallback support path.

### 2. Official website token

Fast but more technical; should be guided clearly.

Flow:

```text
User selects website verification
↓
System generates unique token
↓
User places token on official desa website
↓
User clicks Cek Kode
↓
System checks official website page
↓
If token exists, role becomes DESA_VERIFIED_ADMIN
↓
Audit trail recorded
```

Example token:

```text
pantau-desa-verification=PD-ANCOLMEKAR-8F29
```

Allowed placements:

- profile/contact page,
- footer,
- meta tag,
- `.well-known/pantaudesa-verification.txt`,
- simple public page on official website.

### 3. Contact support fallback

For desa that cannot access email/website.

This should not immediately verify them.

User is guided to contact PantauDesa admin email from env with a clear format.

Button:

```text
Hubungi Kami
```

Environment variable:

```text
SUPPORT_EMAIL
```

Fallback environment variable if needed:

```text
NEXT_PUBLIC_SUPPORT_EMAIL
```

Implementation note:

- Prefer server-side `SUPPORT_EMAIL` for email operations.
- Use `NEXT_PUBLIC_SUPPORT_EMAIL` only for public mailto link if necessary.
- Do not hardcode the final email address in UI.

Suggested subject:

```text
Kendala Verifikasi Admin Desa - [Nama Desa]
```

Suggested email format:

```text
Nama lengkap:
Jabatan:
Nama desa:
Kecamatan:
Kabupaten:
Provinsi:
Website resmi desa, jika ada:
Email resmi desa, jika ada:
Nomor kontak resmi yang tercantum di website, jika ada:
Kendala yang dialami:
Bukti pendukung/link dokumen, jika ada:
```

Fallback outcome:

- status remains `DESA_PENDING` or `DESA_LIMITED`, not full verified, until additional proof is accepted.

## Where to place claim entry point

Owner decision:

Place the `Klaim sebagai Admin Desa` button on the user profile page.

Candidate route/location:

- profile page user account area,
- after login,
- near role/account section.

Button text:

```text
Klaim sebagai Admin Desa
```

Secondary button:

```text
Hubungi Kami
```

## Guided UI concept

The UI should not be an empty form.

Use a guided wizard:

```text
Step 1 — Pilih desa
Step 2 — Pilih cara verifikasi
Step 3 — Ikuti instruksi
Step 4 — Status verifikasi
```

### Step 1 copy

```text
Klaim akses Admin Desa

Pilih desa yang ingin kamu kelola. Akses admin hanya diberikan kepada pihak yang bisa membuktikan hubungan dengan kanal resmi desa.
```

Show known records:

```text
Website resmi yang tercatat: <url>
Email resmi yang tercatat: <email>
Status sumber: Sumber Resmi Terdeteksi / Belum tercatat
```

### Step 2 cards

#### Card: Email resmi

```text
Verifikasi lewat email resmi
Paling cepat, biasanya selesai dalam beberapa menit.
Gunakan jika kamu punya akses ke email resmi desa.
```

Button:

```text
Kirim link verifikasi
```

#### Card: Website resmi

```text
Verifikasi lewat website resmi
Gunakan jika kamu bisa mengubah halaman website desa.
```

Button:

```text
Buat kode verifikasi
```

#### Card: Bantuan admin

```text
Tidak bisa memakai email atau website?
Hubungi kami agar tim PantauDesa bisa membantu melihat kendalanya.
```

Button:

```text
Hubungi Kami
```

## Positive cases

### Positive case 1 — Email official success

```text
User selects desa
↓
System finds official email
↓
User clicks Kirim link verifikasi
↓
User opens email and clicks magic link
↓
System validates token
↓
Role granted: DESA_VERIFIED_ADMIN
↓
Audit event: ADMIN_CLAIM_VERIFIED via official_email
```

Success UI:

```text
Akses admin desa berhasil diverifikasi

Akun kamu telah diverifikasi melalui email resmi desa. Kamu sekarang bisa mengunggah dokumen, memberi klarifikasi, dan mengelola informasi sumber untuk desa ini.
```

### Positive case 2 — Website token success

```text
User requests website token
↓
Token is placed on official website
↓
System finds token
↓
Role granted: DESA_VERIFIED_ADMIN
↓
Audit event: ADMIN_CLAIM_VERIFIED via website_token
```

Success UI:

```text
Kode verifikasi ditemukan

Website resmi desa berhasil membuktikan klaim ini. Akun kamu sekarang aktif sebagai Admin Desa.
```

### Positive case 3 — Existing verified admin invites another admin

Owner requested invite feature.

Flow:

```text
Verified desa admin opens Admin Desa settings
↓
Clicks Undang Admin Desa
↓
Inputs invitee email
↓
System sends invite link
↓
Invitee signs in and accepts invite
↓
Invitee starts as DESA_LIMITED for the same desa
↓
First verified desa admin can promote invitee to DESA_VERIFIED_ADMIN if appropriate
↓
Audit trail records inviter, invitee, role, and acceptance
```

Rules:

- Only `DESA_VERIFIED_ADMIN` can invite another admin.
- Invite is scoped to one desa.
- Maximum 5 admins per desa for MVP.
- Invite expires.
- Invited admin starts as limited.
- First verified desa admin can promote limited invitee.
- Existing verified admin remains accountable through audit log.
- Platform should be able to revoke role if abuse is reported.

Public display:

```text
Admin Desa: <Nama Admin>
```

Badge:

```text
Admin Desa Terverifikasi
```

If multiple admins:

```text
Admin Desa: <Nama Admin Utama> + <jumlah> admin lain
```

## Negative cases

### Negative case 1 — Personal email submitted

Example:

```text
orangacak@gmail.com
```

UI response:

```text
Email ini belum bisa digunakan untuk verifikasi otomatis

Gunakan email yang tercantum di website resmi desa atau email dengan domain resmi desa. Jika belum ada, kamu bisa memilih verifikasi lewat website atau hubungi kami.
```

Audit event:

```text
ADMIN_CLAIM_REJECTED_EMAIL_NOT_OFFICIAL
```

### Negative case 2 — Website token not found

UI response:

```text
Kode belum ditemukan

Pastikan kode sudah ditempel di halaman website resmi desa, lalu coba cek lagi. Jika website dikelola pihak lain, minta pengelola website untuk memasang kode tersebut.
```

Available actions:

- cek lagi,
- ganti URL halaman,
- gunakan email resmi,
- hubungi kami.

Audit event:

```text
WEBSITE_TOKEN_CHECK_FAILED
```

### Negative case 3 — Website is not official

Example:

- Blogspot,
- personal website,
- news/blog page,
- social media profile only.

UI response:

```text
Website ini belum bisa dipakai untuk verifikasi otomatis

Kami hanya menerima kanal resmi desa atau sumber pemerintah yang bisa dipertanggungjawabkan.
```

Audit event:

```text
WEBSITE_NOT_ACCEPTED_FOR_AUTO_VERIFY
```

### Negative case 4 — Duplicate claim

If a desa already has a verified admin:

UI response:

```text
Desa ini sudah memiliki admin aktif

Kamu tetap bisa mengajukan akses tambahan, tetapi perlu persetujuan admin desa yang sudah aktif atau pengecekan tambahan.
```

Actions:

- request invite from existing admin,
- contact support,
- submit evidence only if admin is inactive/disputed.

Audit event:

```text
DUPLICATE_ADMIN_CLAIM
```

### Negative case 5 — Suspicious invite

If verified admin invites many accounts quickly or invites suspicious domains:

System behavior:

- throttle invites,
- require confirmation,
- mark for review,
- keep audit trail.

Audit event:

```text
ADMIN_INVITE_RISK_FLAGGED
```

### Negative case 6 — Admin abuse after verification

Examples:

- uploads misleading document,
- deletes/archives many documents suspiciously,
- posts harmful clarification,
- tries to suppress citizen voices.

System behavior:

- actions are audit logged,
- destructive actions should be limited or reversible,
- platform can suspend admin role,
- public claims remain source-linked.

Audit event examples:

```text
ADMIN_ROLE_SUSPENDED
ADMIN_DOCUMENT_UPLOAD_REVERTED
ADMIN_CLARIFICATION_FLAGGED
```

### Negative case 7 — Fake admin report

Owner requested fake admin reporting.

Public/internal button:

```text
Laporkan admin palsu
```

Where to show:

- admin profile/badge area,
- desa admin public badge area,
- clarification card from admin,
- admin document upload source note if needed.

Report form should be guided, not blank:

```text
Apa masalahnya?
- Saya tidak mengenal admin ini sebagai pihak desa
- Admin ini memakai nama/jabatan yang salah
- Dokumen/klarifikasi ini mencurigakan
- Akun ini mengaku sebagai desa yang salah
- Lainnya

Ceritakan singkat masalahnya:
Bukti/link pendukung, jika ada:
Email pelapor, jika ingin dihubungi:
```

System behavior:

- create report record,
- notify platform reviewer/support,
- attach to admin claim audit trail,
- do not immediately remove admin without review unless high-risk abuse is detected,
- optionally mark admin badge as `Sedang ditinjau` for high-risk reports.

Audit event:

```text
FAKE_ADMIN_REPORT_SUBMITTED
ADMIN_CLAIM_FLAGGED_BY_PUBLIC
```

## Audit trail requirements

Every important step must be recorded.

Candidate audit table / event model:

```text
AdminClaimAudit
- id
- claimId
- desaId
- actorUserId
- eventType
- method
- previousStatus
- nextStatus
- evidenceType
- evidenceUrl
- evidenceHash
- ipAddress
- userAgent
- createdAt
```

Events:

```text
CLAIM_STARTED
OFFICIAL_EMAIL_SELECTED
EMAIL_VERIFICATION_SENT
EMAIL_VERIFIED
EMAIL_FAILED
WEBSITE_TOKEN_CREATED
WEBSITE_TOKEN_CHECKED
WEBSITE_TOKEN_VERIFIED
WEBSITE_TOKEN_FAILED
CONTACT_SUPPORT_CLICKED
INVITE_CREATED
INVITE_ACCEPTED
INVITE_EXPIRED
INVITE_REVOKED
ROLE_GRANTED
ROLE_REVOKED
DOCUMENT_ADDED_BY_ADMIN
DOCUMENT_UPDATED_BY_ADMIN
CLARIFICATION_POSTED_BY_ADMIN
ADMIN_ACTION_FLAGGED
FAKE_ADMIN_REPORT_SUBMITTED
ADMIN_CLAIM_FLAGGED_BY_PUBLIC
```

Important:

- Do not store raw verification token; store hash.
- Do not expose private email/phone publicly unless already public source data and intentionally shown.
- Keep admin action history immutable or append-only.

## Admin-uploaded documents

Owner requested source text in every section.

If document/source comes from website:

```text
Sumber dokumen dari www.desaabc.desa.go.id, update terakhir 22 Maret 2026 11:00:00.
```

If document/source comes from verified desa admin upload:

```text
Sumber dokumen dari Admin Desa <Nama Admin>, terakhir update 22 Maret 2026 11:00:00.
```

If document/source is AI mapped from official source:

```text
Sumber resmi terdeteksi dari <domain/url>, terakhir dicek 22 Maret 2026 11:00:00.
```

If data is still mock/demo:

```text
Nilai bertanda (mock) adalah contoh baca, bukan angka resmi final.
```

## Public display rules

When showing admin identity publicly:

- show badge:

```text
Admin Desa Terverifikasi
```

- show admin name:

```text
Dikelola oleh <Nama Admin>
```

or:

```text
Klarifikasi dari <Nama Admin> — Admin Desa Terverifikasi
```

- show report link/button:

```text
Laporkan admin palsu
```

Do not expose admin private email/phone publicly by default.

## Source notes per section

Every important section should show source note.

Examples:

### Budget/anggaran section

```text
Sumber dokumen dari <url/source/admin>, update terakhir <tanggal jam>.
```

### Document section

```text
Dokumen berasal dari <source>, terakhir dicek <tanggal jam>.
```

### Citizen clarification section

```text
Klarifikasi dikirim oleh <Nama Admin>, Admin Desa Terverifikasi, pada <tanggal jam>.
```

### Source snapshot section

```text
Sumber resmi terdeteksi dari <domain>, terakhir dicek <tanggal jam>.
```

## Out of scope for first Sprint 04 implementation unless explicitly approved

- full automatic scraping at national scale,
- official numeric APBDes extraction,
- public `Terverifikasi` for all data values,
- allowing admin to delete citizen voices,
- allowing admin to rewrite historical source audit logs,
- no-audit admin actions,
- irreversible destructive operations.

## Recommended Sprint 04 batch order

### Sprint 04-001 — Source Trust Classification Plan + UI copy

Define source trust statuses, public copy, and per-section source note pattern.

### Sprint 04-002 — Admin Claim UX + Verification Design

Build guided claim flow on user profile:

- claim button,
- email method,
- website token method,
- contact support fallback,
- status page.

### Sprint 04-003 — Admin Claim Audit Trail

Add audit/event model and logging for claim flow.

Schema change likely required, so must be gated.

### Sprint 04-004 — Verified Admin Invite Flow

Allow verified desa admin to invite additional admins.

Rules:

- max 5 admins per desa for MVP,
- invited admins start limited,
- first verified desa admin can promote.

### Sprint 04-005 — Admin Document Upload Storage

Use Supabase Storage for MVP unless Iwan/Owner choose Cloudflare R2.

Scope:

- upload proof/supporting documents,
- store metadata/hash,
- private bucket + signed access,
- source note for admin-uploaded documents.

### Sprint 04-006 — Fake Admin Report Flow

Add public/internal `Laporkan admin palsu` flow with audit trail.

### Sprint 04-007 — AI-assisted Source/Document Review

AI maps sources/documents and suggests status/risk flags.

Keep human/admin responsibility boundaries clear.

## Resolved questions

1. Support email: use environment variable, not hardcoded.
2. Invite admin limit: max 5 admins per desa for MVP.
3. Invited admin status: limited first; first verified desa admin can promote.
4. Admin document upload: needed; prefer Supabase Storage for MVP, consider Cloudflare R2 later.
5. Fake admin reporting: needed.

## Remaining open questions before implementation

1. Exact environment variable name for support email: `SUPPORT_EMAIL`, `NEXT_PUBLIC_SUPPORT_EMAIL`, or both?
2. Do we allow personal email if it is listed on official website contact page?
3. What actions can `DESA_LIMITED` perform before promotion?
4. Does admin document upload in Sprint 04 support actual file upload or only proof documents first?
5. Should fake-admin reports be public, internal only, or both?
6. What threshold makes an admin badge show `Sedang ditinjau` after reports?

## Current decision status

This plan is documented for Owner review only.

Implementation gate is not open yet.

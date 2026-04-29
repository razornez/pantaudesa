# Task Sprint 04-003 — Admin Claim Guided UI from Profile

Status: READY_FOR_UJANG_IMPLEMENTATION_AFTER_OWNER_CONFIRMATION
Executor: Ujang / Asep
Prepared-by: Rangga
Date: 2026-04-29

## Recommended model for Ujang

```text
Recommended model: GPT-5.1 Codex mini
Reasoning effort: medium
```

Why:

- This is a multi-file UI + DB-backed demo/read task.
- It touches profile/account UI, admin claim UX, dummy data, and role/status display.
- It should not require high reasoning unless auth/session or Prisma relation bugs appear.

Escalate to:

```text
Model: GPT-5.1
Reasoning effort: high
```

Only if Ujang finds:

- auth/session role ambiguity,
- relation/cascade risk,
- migration drift,
- access control bug,
- fake verified/admin exposure risk,
- runtime-only issue that cannot be reproduced by normal QA.

## Goal

Build the first guided UI layer for `Klaim sebagai Admin Desa` from the user profile page using the Sprint 04 schema foundation.

This is a UI/read/demo foundation batch, not the full production verification system.

The UI must guide users clearly and reduce confusion. It should not be a blank form.

## Context

Sprint 04-002 added schema foundations:

- `PerangkatDesa`
- `DesaAdminClaim`
- `DesaAdminMember`
- `DesaAdminInvite`
- `AdminClaimAudit`
- `FakeAdminReport`
- `DokumenAttachment`
- `AIReviewResult`

Now Sprint 04-003 should expose the first guided profile UI for admin claim flow, with DB-backed demo/dummy data for roles/users/admin desa states where needed.

Important: this batch should not yet implement the full secure verification service. It should create a guided UI, DB-backed demo/read path, safe states, and prepare the flow for later service implementation.

## Workflow split

### Rangga owns

- task file,
- acceptance criteria,
- review,
- sprint status update,
- docs orchestration.

### Ujang/Asep owns

- UI/code implementation,
- DB-backed demo/read data,
- local QA,
- build/test,
- guardrail validation,
- commit/push.

## Conflict prevention

This task should not run in parallel with:

- full admin verification service,
- email magic link implementation,
- website token crawler implementation,
- invite acceptance service,
- fake admin report service,
- file upload service/storage,
- AI source review service.

This task is only the guided UI/profile foundation and DB-backed demo state.

## Read first

- `docs/bmad/workflow.md`
- `docs/bmad/boundary-rules.md`
- `docs/bmad/sprint-status.md`
- `docs/bmad/plans/sprint-04-automated-source-review-admin-claim-plan.md`
- `docs/bmad/plans/sprint-04-schema-data-gap-inventory.md`
- `docs/bmad/reviews/sprint-04-002-rangga-review.md`
- `prisma/schema.prisma`
- current profile/account page/components
- current auth/session/user role handling

## Owner decisions to preserve

1. `Klaim sebagai Admin Desa` button must live in the user profile page.
2. UI must feel guided, not like an empty form.
3. Verification options:
   - email resmi desa,
   - website resmi token,
   - hubungi kami fallback.
4. Support email must come from env, not hardcoded.
5. Invite admin max 5 per desa for MVP, but invite UI/service is not part of this batch unless explicitly scoped.
6. Invited admin starts limited; first verified admin can promote later.
7. Add `Laporkan admin palsu` in future public/admin identity context, but full service is not part of this batch.
8. Public/admin badges should include admin desa identity/name later.
9. Admin verification must avoid fake admin/legal risk.
10. Do not mark data values as verified.

## Scope summary

Implement:

1. Profile page entry point.
2. Guided claim UI wizard.
3. DB-backed demo/admin state display.
4. Read-only/demo claim status states.
5. Safe support contact button using env email.
6. UI copy for email official, website token, and support fallback.
7. Basic DB-backed dummy/demo data for user/admin/admin desa states if needed.
8. No fake production verification.
9. No hardcoded runtime displayed data fallback.

Do not implement:

- actual email sending/magic link verification,
- actual website token crawler/checker,
- invite acceptance flow,
- full fake admin report submission flow,
- file upload/storage flow,
- AI review API,
- verified data activation.

---

# A. Profile entry point

## Requirement

Add a clear profile/account section for village admin access.

Button:

```text
Klaim sebagai Admin Desa
```

Secondary/support action:

```text
Hubungi Kami
```

Suggested placement:

- user profile page,
- account/role section,
- after login only.

If profile page does not exist yet:

- create a minimal profile/account page that matches existing app style;
- do not create large unrelated account system.

## UI copy direction

```text
Akses Admin Desa

Jika kamu adalah perwakilan desa, kamu bisa mengajukan akses untuk mengunggah dokumen, memberi klarifikasi, dan mengelola informasi sumber desa.
```

Important note:

```text
Akses admin hanya diberikan melalui kanal resmi desa atau pengecekan tambahan.
```

Avoid technical wording.

---

# B. Guided claim wizard

## Requirement

Build guided UI, not blank form.

Steps:

```text
Step 1 — Pilih desa
Step 2 — Pilih cara verifikasi
Step 3 — Ikuti instruksi
Step 4 — Lihat status
```

The UI can be a single route or profile section with stepper/cards.

Candidate routes:

```text
/profil
/profil/klaim-admin-desa
```

or equivalent existing route conventions.

## Step 1 — Pilih desa

Show:

- searchable/selectable desa list from DB;
- desa name;
- kecamatan/kabupaten/provinsi;
- website resmi if available;
- official email if already exists in data/source metadata, otherwise show `Belum tercatat`.

Copy:

```text
Pilih desa yang ingin kamu kelola.

Kami akan membantu mengecek apakah kamu punya akses ke kanal resmi desa tersebut.
```

If no official email/website found:

```text
Kami belum menemukan kanal resmi untuk desa ini. Kamu tetap bisa memakai bantuan admin PantauDesa.
```

## Step 2 — Pilih cara verifikasi

Show 3 cards.

### Card 1: Email resmi desa

Title:

```text
Verifikasi lewat email resmi
```

Body:

```text
Paling cepat jika kamu punya akses ke email resmi desa atau email yang tercantum di sumber resmi desa.
```

Button:

```text
Gunakan email resmi
```

State for this batch:

- UI/demo only;
- can show disabled/coming soon if actual service not implemented;
- do not pretend email has been sent unless service exists.

Safe copy if not active yet:

```text
Pengiriman link verifikasi akan diaktifkan setelah layanan email siap.
```

### Card 2: Website resmi desa

Title:

```text
Verifikasi lewat website resmi
```

Body:

```text
Gunakan cara ini jika kamu bisa menaruh kode verifikasi di website resmi desa.
```

Button:

```text
Buat kode verifikasi
```

State for this batch:

- UI/demo only unless token creation is safely implemented;
- do not implement crawler/checker yet.

Example instruction shown in UI:

```text
Nanti kamu akan mendapatkan kode unik untuk ditempel di halaman website desa.
```

### Card 3: Hubungi Kami

Title:

```text
Tidak bisa memakai email atau website?
```

Body:

```text
Hubungi admin PantauDesa agar kendalanya bisa dibantu dicek.
```

Button:

```text
Hubungi Kami
```

Must use support email from env.

Do not hardcode final email.

Env candidates:

```text
SUPPORT_EMAIL
NEXT_PUBLIC_SUPPORT_EMAIL
```

Implementation guidance:

- for public mailto, use `NEXT_PUBLIC_SUPPORT_EMAIL` if available;
- fallback to safe placeholder only in development if env absent;
- do not expose secret/private env accidentally.

Suggested subject:

```text
Kendala Verifikasi Admin Desa - [Nama Desa]
```

Suggested email body format:

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

## Step 3 — Ikuti instruksi

Show instruction based on method selected.

For email method:

```text
Kami akan mengirim tautan verifikasi ke email resmi desa. Buka email tersebut lalu ikuti tautannya.
```

For website method:

```text
Tempel kode verifikasi di website resmi desa, lalu kembali ke halaman ini untuk mengecek statusnya.
```

For support fallback:

```text
Kirim email dengan format yang sudah disiapkan agar admin PantauDesa bisa membantu mengecek kendala.
```

If actual backend action is not implemented, make it clear:

```text
Tahap ini disiapkan sebagai alur awal. Verifikasi otomatis akan diaktifkan pada batch berikutnya.
```

## Step 4 — Lihat status

Show claim/admin states from DB-backed demo/read data.

Possible statuses:

- belum mengajukan,
- menunggu verifikasi,
- akses terbatas,
- admin desa terverifikasi,
- ditolak,
- ditangguhkan.

Use simple copy:

### PENDING

```text
Menunggu verifikasi
Kami masih perlu memastikan klaim ini melalui kanal resmi desa.
```

### LIMITED

```text
Akses terbatas
Kamu bisa menyiapkan dokumen/klarifikasi, tetapi belum tampil sebagai Admin Desa Terverifikasi.
```

### VERIFIED

```text
Admin Desa Terverifikasi
Akun ini sudah terhubung dengan kanal resmi desa.
```

### REJECTED

```text
Pengajuan belum bisa diterima
Klaim ini belum memenuhi bukti yang dibutuhkan.
```

### SUSPENDED

```text
Akses sedang ditinjau
Ada laporan atau perubahan yang perlu dicek ulang.
```

---

# C. DB-backed dummy/demo data

## Requirement

Prepare demo/read data from DB for role/admin/user/admin desa states, not hardcoded runtime state.

This is important so UI can be tested realistically.

## What to prepare

Use existing/new schema foundations to create demo records if safe:

- normal user / warga state,
- pending admin claim,
- limited admin desa member,
- verified admin desa member,
- rejected/suspended example if useful for UI state testing,
- admin invite example if useful but no invite flow yet.

Candidate seed examples:

```text
User Warga Demo
User Pengaju Admin Desa Pending
User Admin Desa Limited
User Admin Desa Verified
Platform Admin Demo
```

Important:

- Use obviously demo/test emails.
- Do not use real private emails.
- Do not expose personal phone numbers.
- Use `dataStatus` or names/copy that make demo context safe.
- Make seed idempotent.

## Suggested safe demo emails

Use local/example domains, not real user emails:

```text
warga.demo@pantaudesa.local
pengaju.admin.demo@pantaudesa.local
admin.desa.limited.demo@pantaudesa.local
admin.desa.verified.demo@pantaudesa.local
platform.admin.demo@pantaudesa.local
```

or equivalent safe internal demo emails already used in repo.

## Suggested DB records

Create demo records only if consistent with current auth/user seed conventions.

Examples:

1. `DesaAdminClaim` pending for a demo user and a demo desa.
2. `DesaAdminMember` limited for another demo user.
3. `DesaAdminMember` verified for another demo user.
4. `AdminClaimAudit` entries for claim started / role granted demo.
5. Optional `DesaAdminInvite` pending demo row if useful for future UI, but do not implement invite flow.

If seed user creation conflicts with auth requirements, report blocker and create only non-user-specific demo states where safe.

## UI usage

The profile UI should show realistic states based on DB records:

- if current session user has claim/member record, show their status;
- if no session or no record, show empty/new claim state;
- demo data can be tested by logging in as demo users if auth flow supports it.

If actual login as demo user is not practical, include route/content check notes and do not hack auth.

---

# D. Public/admin identity preview

This batch may include a small preview component if useful, but not full public integration.

If included, it should show:

```text
Admin Desa Terverifikasi
<Nama Admin>
```

and:

```text
Laporkan admin palsu
```

But do not implement report submission service in this batch.

Allowed state:

- button visible but disabled/coming soon,
- or link to future route placeholder if route exists.

Do not show private email/phone.

---

# E. Access and safety rules

Even though this is UI/demo foundation, do not create misleading behavior.

Rules:

1. Do not show a user as verified unless DB membership status is `VERIFIED` and role is `VERIFIED_ADMIN`.
2. Do not allow self-promotion through UI.
3. Do not activate actual verification unless service is implemented safely.
4. Do not allow admin actions that change public data in this batch.
5. Do not expose private contact data.
6. Do not create fake official claims without demo labeling.
7. Do not use `User.role = DESA` alone as proof of verified desa admin; desa-specific membership must be used.

---

# F. Code quality expectations

Owner reminder:

- code and files must stay clean;
- use best practices / separation of concerns;
- performance matters.

Required:

- Keep DB reads server-side.
- No client-side Prisma.
- No secrets in client components.
- Avoid huge profile component.
- Extract presentational components if the wizard gets large.
- Keep copy strings organized.
- Use typed helpers for status labels.
- Avoid broad unrelated refactor.
- No new dependency unless approved.

Suggested component split:

```text
ProfileAdminAccessCard
AdminClaimWizard
AdminClaimMethodCard
AdminClaimStatusBadge
AdminClaimSupportLink
```

Suggested data helper:

```text
src/lib/data/admin-claim-read.ts
```

or similar project convention.

---

# G. Out of scope

Do not implement:

- actual email magic link sending,
- actual website token verification crawler,
- admin invite acceptance flow,
- fake admin report submission service,
- document upload/storage,
- AI review API call,
- public verified data values,
- numeric APBDes extraction,
- scraper/scheduler,
- new schema migration unless absolutely required and explicitly approved,
- new dependency.

If a small seed/data change is needed for demo states, keep it idempotent and safe.

---

# H. QA requirements

Run:

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run test
npm run build
```

If seed/demo data is updated:

```bash
npm run seed:demo
```

or approved seed command only against approved dev/shared target.

Route checks:

- profile page route,
- profile admin claim route/section,
- `/desa/ancolmekar` if admin identity preview appears there,
- `/desa/4` if relevant.

Mobile checks:

- profile page,
- claim wizard stepper,
- method cards,
- status card,
- support email card.

Security/safety checks:

- no private env exposed;
- support email handling uses public env only when rendered client-side;
- no self-promotion;
- no fake verified display unless DB state says verified;
- no private email/phone public display.

---

# I. Acceptance criteria

1. Profile page includes `Klaim sebagai Admin Desa` entry point.
2. Guided claim UI has clear steps: pilih desa, pilih cara verifikasi, instruksi, status.
3. UI includes email resmi method.
4. UI includes website token method.
5. UI includes `Hubungi Kami` fallback using env email.
6. UI is simple and guided, not an empty form.
7. DB-backed demo/read data exists for relevant admin claim/member states where safe.
8. UI can display pending/limited/verified/rejected/suspended states.
9. No actual unsafe verification is performed.
10. No user can self-promote.
11. No private email/phone exposed publicly.
12. `User.role = DESA` alone is not treated as verified desa admin.
13. Code remains clean and maintainable.
14. No new dependency.
15. No verified data activation.
16. No scraper/scheduler.
17. QA commands pass.
18. Guardrails are reported.

---

# J. Commit message requirement

Commit message must include:

```text
feat(admin): add guided desa admin claim profile UI

What changed:
- ...

Data/demo:
- admin/user/demo states seeded/read from DB: PASS/SKIPPED with reason

QA:
- prisma validate: PASS
- prisma generate: PASS
- tsc: PASS
- test: PASS
- build: PASS
- route checks: PASS

Safety:
- no email magic link service implemented
- no website token crawler implemented
- no self-promotion
- no private contact exposure
- no verified data activation
- no new dependency

Known risks/blockers:
- ...
```

---

# K. Report back

```text
Task: Sprint 04-003 Admin Claim Guided UI from Profile
Status: PASS / REWORK / BLOCKED
Model used:
Reasoning effort:
Routes checked:
- profile:
- claim wizard:
- desa detail if touched:
QA:
- prisma validate:
- prisma generate:
- tsc:
- test:
- build:
Data/demo:
- warga demo:
- pending claim:
- limited admin:
- verified admin:
- platform admin:
Safety:
- no self-promotion:
- no private contact exposure:
- no fake verified display:
- no email/website verification service accidentally enabled:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

---

# Short handoff

```text
Ujang, pull latest main, read docs/bmad/tasks/sprint-04-003-admin-claim-guided-ui-profile-batch.md fully. Use GPT-5.1 Codex mini with medium reasoning. Implement the guided `Klaim sebagai Admin Desa` UI from the profile page with DB-backed demo/read states for warga, pending claim, limited admin, verified admin, and platform admin where safe. Do not implement real email verification, website token crawler, invite acceptance, fake admin report service, upload service, AI review, verified data activation, scraper, or numeric extraction. Run QA/guardrails, commit with implementation note, push, then report commit SHA + QA/data/safety summary.
```

If Asep takes over:

```text
Asep, pull latest main, read docs/bmad/tasks/sprint-04-003-admin-claim-guided-ui-profile-batch.md fully, continue only this guided profile UI + DB-backed demo state scope from latest commit. Keep the same guardrails, run QA, commit/push necessary fixes, then report commit SHA + QA/data/safety summary.
```

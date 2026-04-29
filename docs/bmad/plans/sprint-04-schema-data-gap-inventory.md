# Sprint 04 Schema/Data Gap Inventory

Date: 2026-04-29
Status: DRAFT_FOR_OWNER_REVIEW
Prepared-by: Rangga / BMAD-lite orchestration

## Purpose

This document records schema/data gaps found after Sprint 04-001 review so they can be included in Sprint 04 planning instead of being forgotten.

This is not an implementation gate yet.

## Source checked

- `prisma/schema.prisma` on `main`
- Sprint 04-001 Rangga review
- Owner feedback after Sprint 04 UI/UX closeout

## Current schema summary

Existing relevant models:

- `User`
- `Voice`
- `VoiceReply`
- `VoiceVote`
- `VoiceHelpful`
- `Desa`
- `DataSource`
- `AnggaranDesaSummary`
- `APBDesItem`
- `DokumenPublik`

Existing role enum:

```text
WARGA
DESA
ADMIN
```

Current schema does not yet support the full Sprint 04 source/admin automation plan.

## Confirmed gaps

## 1. Perangkat Desa data

### Status

`MISSING_MODEL_OR_TABLE`

### Why this matters

Sprint 04-001 wanted the `Perangkat` section to show DB-backed dummy/demo data instead of being empty.

Ujang correctly blocked this because there is no current `Perangkat` model/table.

### Candidate model

```prisma
model PerangkatDesa {
  id          String     @id @default(cuid())
  desaId      String
  nama        String
  jabatan     String
  periode     String?
  fotoUrl     String?
  kontakLabel String?
  dataStatus  DataStatus @default(demo)
  sourceId    String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  desa   Desa        @relation(fields: [desaId], references: [id], onDelete: Cascade)
  source DataSource? @relation(fields: [sourceId], references: [id], onDelete: SetNull)

  @@index([desaId])
  @@index([dataStatus])
  @@map("perangkat_desa")
}
```

### MVP seed direction

- Seed 2-4 demo perangkat per sample/demo desa.
- Mark as `dataStatus = demo`.
- Show `(mock)` or `Data contoh` near the perangkat section if not source-backed.

### Boundary

- Do not claim official staffing data unless source-backed.
- No personal phone/email exposure unless already official/public and explicitly approved.

## 2. Desa Admin Claim

### Status

`MISSING_MODEL_OR_TABLE`

### Why this matters

Sprint 04 planning includes `Klaim sebagai Admin Desa` from user profile.

Current schema has only broad `User.role`; it cannot represent:

- user claims a specific desa,
- verification method,
- claim status,
- official email/website token status,
- limited vs verified admin per desa,
- multiple admins per desa.

### Candidate model

```prisma
model DesaAdminClaim {
  id               String           @id @default(cuid())
  desaId           String
  userId           String
  status           DesaAdminStatus  @default(PENDING)
  method           AdminClaimMethod?
  officialEmail    String?
  websiteUrl       String?
  tokenHash        String?
  tokenExpiresAt   DateTime?
  verifiedAt       DateTime?
  rejectedAt       DateTime?
  rejectionReason  String?          @db.Text
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  desa Desa @relation(fields: [desaId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([desaId])
  @@index([userId])
  @@index([status])
  @@map("desa_admin_claims")
}
```

Candidate enums:

```prisma
enum DesaAdminStatus {
  PENDING
  LIMITED
  VERIFIED
  REJECTED
  SUSPENDED
}

enum AdminClaimMethod {
  OFFICIAL_EMAIL
  WEBSITE_TOKEN
  SUPPORT_REVIEW
  INVITE
}
```

### Boundary

- Do not auto-verify personal email.
- Do not expose private admin email publicly.
- Do not allow admin desa to delete citizen voices.

## 3. Desa Admin membership / invite

### Status

`MISSING_MODEL_OR_TABLE`

### Why this matters

Owner decided:

- max 5 admins per desa for MVP;
- invited admins start limited;
- first verified desa admin can promote invitee;
- public badge should show admin desa + admin name.

A claim table alone may not be enough for ongoing membership and invite management.

### Candidate models

```prisma
model DesaAdminMember {
  id          String           @id @default(cuid())
  desaId      String
  userId      String
  role        DesaAdminRole    @default(LIMITED)
  status      DesaAdminStatus  @default(LIMITED)
  invitedById String?
  verifiedById String?
  joinedAt    DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  desa Desa @relation(fields: [desaId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([desaId, userId])
  @@index([desaId, status])
  @@map("desa_admin_members")
}

model DesaAdminInvite {
  id          String      @id @default(cuid())
  desaId      String
  email       String
  tokenHash   String
  invitedById String
  status      InviteStatus @default(PENDING)
  expiresAt   DateTime
  acceptedAt  DateTime?
  createdAt   DateTime    @default(now())

  desa Desa @relation(fields: [desaId], references: [id], onDelete: Cascade)

  @@index([desaId])
  @@index([email])
  @@index([status])
  @@map("desa_admin_invites")
}
```

Candidate enums:

```prisma
enum DesaAdminRole {
  LIMITED
  VERIFIED_ADMIN
}

enum InviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REVOKED
}
```

### MVP rules

- Max 5 active admins per desa.
- Only verified admin can invite.
- Invited admin starts limited.
- First verified admin can promote.
- Platform admin can suspend/revoke.

## 4. Admin claim audit trail

### Status

`MISSING_MODEL_OR_TABLE`

### Why this matters

Admin identity is high-risk. Every claim, token, invite, upload, report, and role change needs audit trail.

### Candidate model

```prisma
model AdminClaimAudit {
  id             String   @id @default(cuid())
  desaId         String?
  actorUserId    String?
  targetUserId   String?
  claimId        String?
  eventType      String
  method         String?
  previousStatus String?
  nextStatus     String?
  evidenceType   String?
  evidenceUrl    String?
  evidenceHash   String?
  ipAddress      String?
  userAgent      String?
  metadata       Json?
  createdAt      DateTime @default(now())

  @@index([desaId])
  @@index([actorUserId])
  @@index([eventType])
  @@index([createdAt])
  @@map("admin_claim_audits")
}
```

### Events to support

- `CLAIM_STARTED`
- `OFFICIAL_EMAIL_SELECTED`
- `EMAIL_VERIFICATION_SENT`
- `EMAIL_VERIFIED`
- `EMAIL_FAILED`
- `WEBSITE_TOKEN_CREATED`
- `WEBSITE_TOKEN_CHECKED`
- `WEBSITE_TOKEN_VERIFIED`
- `WEBSITE_TOKEN_FAILED`
- `CONTACT_SUPPORT_CLICKED`
- `INVITE_CREATED`
- `INVITE_ACCEPTED`
- `INVITE_EXPIRED`
- `INVITE_REVOKED`
- `ROLE_GRANTED`
- `ROLE_REVOKED`
- `DOCUMENT_ADDED_BY_ADMIN`
- `DOCUMENT_UPDATED_BY_ADMIN`
- `CLARIFICATION_POSTED_BY_ADMIN`
- `ADMIN_ACTION_FLAGGED`
- `FAKE_ADMIN_REPORT_SUBMITTED`
- `ADMIN_CLAIM_FLAGGED_BY_PUBLIC`

## 5. Fake admin report

### Status

`MISSING_MODEL_OR_TABLE`

### Why this matters

Owner requested a `Laporkan admin palsu` button.

### Candidate model

```prisma
model FakeAdminReport {
  id             String       @id @default(cuid())
  desaId          String
  reportedUserId  String?
  reporterUserId  String?
  reason          String
  description     String?      @db.Text
  evidenceUrl     String?
  reporterEmail   String?
  status          ReportStatus @default(OPEN)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([desaId])
  @@index([reportedUserId])
  @@index([status])
  @@map("fake_admin_reports")
}

enum ReportStatus {
  OPEN
  REVIEWING
  RESOLVED
  REJECTED
}
```

### UI requirement

- Button: `Laporkan admin palsu`
- Guided reasons:
  - Saya tidak mengenal admin ini sebagai pihak desa.
  - Admin ini memakai nama/jabatan yang salah.
  - Dokumen/klarifikasi ini mencurigakan.
  - Akun ini mengaku sebagai desa yang salah.
  - Lainnya.

## 6. Admin-uploaded document metadata

### Status

`PARTIALLY_SUPPORTED_BY_DOKUMEN_PUBLIK_BUT_NEEDS_UPLOAD_METADATA`

### Why this matters

Existing `DokumenPublik` can store URL/source/status, but admin uploads need extra metadata:

- uploader user,
- storage object path,
- file hash,
- upload source type,
- moderation/review status,
- audit connection.

### Candidate extension or new model

Option A: extend `DokumenPublik` later with:

```prisma
uploadedById String?
storagePath  String?
fileHash     String?
uploadedAt   DateTime?
```

Option B: separate attachment model:

```prisma
model DokumenAttachment {
  id          String   @id @default(cuid())
  dokumenId   String
  uploadedById String?
  storagePath String
  fileName    String
  fileType    String
  fileSize    Int
  fileHash    String?
  createdAt   DateTime @default(now())

  @@index([dokumenId])
  @@index([uploadedById])
  @@map("dokumen_attachments")
}
```

### Storage recommendation

- MVP: Supabase Storage.
- Keep bucket private.
- Use signed URLs.
- Max 5 MB/file.
- PDF/JPG/PNG only.
- Store metadata/hash in DB.

## 7. AI-assisted review result

### Status

`MISSING_MODEL_OR_TABLE`

### Why this matters

Sprint 04 plan includes AI-assisted review as recommendation, not final authority.

### Candidate model

```prisma
model AIReviewResult {
  id              String   @id @default(cuid())
  targetType      String
  targetId        String
  model           String
  summary         String?  @db.Text
  suggestedStatus String?
  confidence      String?
  riskFlags       Json?
  extractedFields Json?
  rawResult       Json?
  createdAt       DateTime @default(now())

  @@index([targetType, targetId])
  @@map("ai_review_results")
}
```

### Boundary

- AI review does not equal verified.
- AI may suggest `official_source_detected` or `needs_review`.
- Human/desa/admin responsibility remains clear.

## Recommended Sprint 4 inclusion

Recommended next Sprint 4 schema/data gate:

```text
Sprint 04-002 — Schema/Data Foundation for Perangkat + Admin Claim Audit
```

Scope should include:

1. `PerangkatDesa` model/table.
2. Admin claim/membership/invite model decision.
3. Admin audit trail model.
4. Fake admin report model.
5. Admin upload metadata decision.
6. AI review result model decision, if AI review is included in same sprint.

## Recommended batch split

Because this is high-risk and touches schema, split carefully:

### Option A — Single schema planning task first

- Produce final schema proposal only.
- No migration yet.
- Owner/Iwan approve before implementation.

### Option B — MVP schema migration batch

If Owner wants direct implementation after approval:

- add `PerangkatDesa`,
- add `DesaAdminClaim`,
- add `DesaAdminMember`,
- add `DesaAdminInvite`,
- add `AdminClaimAudit`,
- add `FakeAdminReport`,
- add `AIReviewResult` only if needed now,
- add attachment/upload metadata only if file upload is in current sprint.

## Guardrails

Do not implement without explicit schema gate.

No:

- destructive migration,
- seed reset,
- verified activation for data values,
- official numeric APBDes extraction,
- scraper/scheduler,
- unaudited admin actions,
- public exposure of private admin emails/phones.

## Current status

`DRAFT_FOR_OWNER_REVIEW`

No implementation gate opened yet.

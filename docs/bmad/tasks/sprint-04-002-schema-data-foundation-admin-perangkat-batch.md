# Task Sprint 04-002 — Schema/Data Foundation for Perangkat + Admin Claim Safety

Status: READY_FOR_UJANG_IMPLEMENTATION_AFTER_PULL
Executor: Ujang / Asep
Prepared-by: Rangga
Date: 2026-04-29

## Goal

Implement the missing schema/data foundation needed after Sprint 04-001 and before building the full admin desa claim UI, AI review UI, or source automation workflow.

This batch exists because Sprint 04-001 revealed missing model/table blockers, especially `PerangkatDesa`, and Sprint 04 planning also needs safe foundations for admin desa claim, invite, audit trail, fake admin report, admin uploads, and AI review results.

## Important workflow split

### Rangga owns

- docs planning,
- task files,
- acceptance criteria,
- review notes,
- sprint status updates,
- post-commit review.

### Ujang/Asep owns

- schema/code implementation,
- Prisma migration creation,
- seed/update scripts if needed,
- local QA/guardrails,
- route/build/test validation,
- commit and push.

Do not ask Ujang/Asep to write extra docs unless this task explicitly asks for implementation note in commit message.

## Conflict prevention

This is the only technical schema/data foundation task that should be active while being executed.

Do not run this in parallel with:

- admin claim UI implementation,
- AI review implementation,
- source crawler/scraper implementation,
- official numeric extraction,
- verified activation,
- separate perangkat UI implementation.

Those depend on this foundation and should wait.

## Read first

- `docs/bmad/workflow.md`
- `docs/bmad/boundary-rules.md`
- `docs/bmad/sprint-status.md`
- `docs/bmad/plans/sprint-04-schema-data-gap-inventory.md`
- `docs/bmad/plans/sprint-04-automated-source-review-admin-claim-plan.md`
- `docs/bmad/reviews/sprint-04-001-rangga-review.md`
- `prisma/schema.prisma`

## Required implementation scope

Implement a careful schema/data foundation for the following areas.

### 1. PerangkatDesa

Purpose:

- unblock detail page `Perangkat` section;
- allow DB-backed demo/mock perangkat data;
- avoid hardcoded runtime fallback.

Required model concept:

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

Implementation notes:

- Add relation from `Desa` to `PerangkatDesa[]`.
- Add relation from `DataSource` to `PerangkatDesa[]` if used.
- Keep dataStatus default `demo`.
- Do not expose private phone/email. `kontakLabel` should be generic/public-safe only.

### 2. DesaAdminClaim

Purpose:

- support future `Klaim sebagai Admin Desa` flow from user profile;
- track claim status, method, official email, website token hash, verification status.

Required model concept:

```prisma
model DesaAdminClaim {
  id              String           @id @default(cuid())
  desaId          String
  userId          String
  status          DesaAdminStatus  @default(PENDING)
  method          AdminClaimMethod?
  officialEmail   String?
  websiteUrl      String?
  tokenHash       String?
  tokenExpiresAt  DateTime?
  verifiedAt      DateTime?
  rejectedAt      DateTime?
  rejectionReason String?          @db.Text
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

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

### 3. DesaAdminMember and DesaAdminInvite

Purpose:

- allow multiple admins per desa;
- support max 5 admins per desa in application logic later;
- invited admins start limited;
- first verified admin can promote later.

Required model concept:

```prisma
model DesaAdminMember {
  id           String           @id @default(cuid())
  desaId       String
  userId       String
  role         DesaAdminRole    @default(LIMITED)
  status       DesaAdminStatus  @default(LIMITED)
  invitedById  String?
  verifiedById String?
  joinedAt     DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  desa Desa @relation(fields: [desaId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([desaId, userId])
  @@index([desaId, status])
  @@map("desa_admin_members")
}

model DesaAdminInvite {
  id          String       @id @default(cuid())
  desaId      String
  email       String
  tokenHash   String
  invitedById String
  status      InviteStatus @default(PENDING)
  expiresAt   DateTime
  acceptedAt  DateTime?
  createdAt   DateTime     @default(now())

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

Important:

- Max 5 admins per desa should be enforced later in service logic, not necessarily DB constraint.
- Do not implement full invite UI in this batch.

### 4. AdminClaimAudit

Purpose:

- immutable/append-only audit trail for admin claim, invite, upload, fake report, and future admin actions.

Required model concept:

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

Events to support later:

- `CLAIM_STARTED`
- `EMAIL_VERIFICATION_SENT`
- `EMAIL_VERIFIED`
- `WEBSITE_TOKEN_CREATED`
- `WEBSITE_TOKEN_VERIFIED`
- `CONTACT_SUPPORT_CLICKED`
- `INVITE_CREATED`
- `INVITE_ACCEPTED`
- `ROLE_GRANTED`
- `ROLE_REVOKED`
- `DOCUMENT_ADDED_BY_ADMIN`
- `FAKE_ADMIN_REPORT_SUBMITTED`

### 5. FakeAdminReport

Purpose:

- support future `Laporkan admin palsu` button.

Required model concept:

```prisma
model FakeAdminReport {
  id             String       @id @default(cuid())
  desaId         String
  reportedUserId String?
  reporterUserId String?
  reason         String
  description    String?      @db.Text
  evidenceUrl    String?
  reporterEmail  String?
  status         ReportStatus @default(OPEN)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

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

### 6. DokumenAttachment or upload metadata

Purpose:

- prepare admin document upload with Supabase Storage/private bucket later;
- keep file metadata/hash in DB.

Recommended model:

```prisma
model DokumenAttachment {
  id           String   @id @default(cuid())
  dokumenId    String
  uploadedById String?
  storagePath  String
  fileName     String
  fileType     String
  fileSize     Int
  fileHash     String?
  createdAt    DateTime @default(now())

  dokumen DokumenPublik @relation(fields: [dokumenId], references: [id], onDelete: Cascade)

  @@index([dokumenId])
  @@index([uploadedById])
  @@map("dokumen_attachments")
}
```

Implementation notes:

- Add relation from `DokumenPublik` to attachments.
- Do not implement Supabase Storage bucket/upload flow in this task unless explicitly approved.
- This task is schema foundation only for attachments.

### 7. AIReviewResult

Purpose:

- store AI-assisted source/document review outputs later;
- AI review is recommendation, not final verification.

Required model concept:

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

Boundary:

- Do not call OpenAI API in this task.
- Do not build AI UI in this task.
- Store only schema foundation.

## Seed/data scope

### Required seed update

Add DB-backed demo/mock perangkat data if `PerangkatDesa` model is implemented.

Rules:

- Seed only demo/mock rows.
- Mark `dataStatus = demo`.
- Do not claim official staffing.
- Use safe names/roles only.
- Do not include private phone/email.
- Seed must be idempotent.

### Not required in this batch

- Seed admin claim data.
- Seed fake admin reports.
- Seed AI review results.
- Run broad production import.

## Read path/UI scope

Minimum UI/read path required in this batch:

- If `PerangkatDesa` is implemented and seeded, wire detail page perangkat section to read DB-backed perangkat data.
- If wiring UI makes task too large, at least expose a typed read service and report UI follow-up.

Do not implement:

- admin claim UI,
- invite UI,
- fake admin report UI,
- upload UI,
- AI review UI.

## Out of scope

- No admin claim UI.
- No profile claim button implementation.
- No AI API call.
- No source crawler/scraper.
- No official numeric APBDes extraction.
- No verified activation for data values.
- No destructive migration.
- No seed reset.
- No new dependency.
- No storage bucket setup unless explicitly approved.

## Guardrails

- Use Prisma migration workflow safely.
- Do not run destructive commands against shared Supabase.
- Do not expose private email/phone publicly.
- Do not change existing enum values in a way that breaks data.
- Do not repurpose `User.role` as desa-specific membership; use new membership model.
- Keep schema names clear and future-proof.

## QA requirements

Run locally:

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run test
npm run build
```

If migration is created, also report:

```bash
npx prisma migrate status
```

If seed is updated:

```bash
npm run seed:demo
```

or the current approved seed command, only against the approved dev/shared target.

Route checks if UI/read path is touched:

- `/desa/ancolmekar`
- `/desa/4`

## Acceptance criteria

1. Prisma schema validates.
2. Migration is created safely and non-destructively.
3. Prisma client generates successfully.
4. `PerangkatDesa` model exists and relates to `Desa`.
5. Admin claim foundation models exist.
6. Admin membership/invite foundation models exist.
7. Audit trail model exists.
8. Fake admin report model exists.
9. Document attachment metadata model exists.
10. AI review result model exists.
11. No verified data activation.
12. No official numeric extraction.
13. No scraper/scheduler.
14. No new dependency.
15. No destructive DB operation.
16. If perangkat UI/read path is included, it reads DB-backed data only.
17. If perangkat seed is included, demo/mock status is clear.
18. QA commands pass or blockers are reported clearly.

## Commit message requirement

Commit message must include:

```text
feat(schema): add sprint 04 admin and perangkat foundations

What changed:
- ...

Migration:
- name: <migration name>
- destructive: no

Seed/data:
- perangkat demo seed: PASS/SKIPPED with reason

QA:
- prisma validate: PASS
- prisma generate: PASS
- tsc: PASS
- test: PASS
- build: PASS
- migrate status: PASS

Guardrails:
- no destructive migration
- no seed reset
- no verified activation
- no official numeric APBDes extraction
- no scraper/scheduler
- no new dependency
- no admin UI/AI UI implemented

Known risks/blockers:
- ...
```

## Report back

```text
Task: Sprint 04-002 Schema/Data Foundation for Perangkat + Admin Claim Safety
Status: PASS / REWORK / BLOCKED
Migration:
- name:
- destructive: yes/no
Models added:
- PerangkatDesa:
- DesaAdminClaim:
- DesaAdminMember:
- DesaAdminInvite:
- AdminClaimAudit:
- FakeAdminReport:
- DokumenAttachment:
- AIReviewResult:
Seed/data:
- perangkat demo rows:
QA:
- prisma validate:
- prisma generate:
- tsc:
- test:
- build:
- migrate status:
Guardrails:
- no destructive migration:
- no verified activation:
- no official numeric extraction:
- no scraper/scheduler:
- no new dependency:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

## Short handoff

```text
Ujang, pull latest main, read docs/bmad/tasks/sprint-04-002-schema-data-foundation-admin-perangkat-batch.md fully, execute this as the only active technical schema/data foundation batch. Do not work on admin UI, AI UI, scraper, verified, or numeric extraction. Add the missing schema foundations, safe migration, optional DB-backed perangkat demo seed/read path if supported, run QA/guardrails, commit with implementation note, push, then report commit SHA + migration/QA/model summary.
```

If Asep takes over:

```text
Asep, pull latest main, read docs/bmad/tasks/sprint-04-002-schema-data-foundation-admin-perangkat-batch.md fully, continue only this schema/data foundation scope from latest commit, run QA/guardrails, commit/push necessary fixes, then report commit SHA + migration/QA/model summary.
```

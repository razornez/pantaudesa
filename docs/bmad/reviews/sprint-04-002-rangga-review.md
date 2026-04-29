# Rangga Review — Sprint 04-002 Schema/Data Foundation for Perangkat + Admin Claim Safety

Date: 2026-04-29
Reviewer: Rangga
Commit reviewed: `b6491b4c91c2e9134ffa124390ad97f5c0c03eb3`
Task reviewed: `docs/bmad/tasks/sprint-04-002-schema-data-foundation-admin-perangkat-batch.md`
Verdict: `ACCEPTED_FOR_NEXT_SPRINT_04_GATE`

## Summary

Ujang implemented the Sprint 04-002 schema/data foundation batch as requested.

The commit adds missing schema foundations for:

- `PerangkatDesa`
- `DesaAdminClaim`
- `DesaAdminMember`
- `DesaAdminInvite`
- `AdminClaimAudit`
- `FakeAdminReport`
- `DokumenAttachment`
- `AIReviewResult`

It also adds DB-backed perangkat demo seed data and wires the desa detail read path to include perangkat rows.

## Migration review

Migration reviewed:

- `20260429062507_sprint_04_schema_data_foundation`

Status: PASS

Notes:

- Migration creates new enums and new tables.
- No existing table/column is dropped.
- No destructive operation detected in reviewed migration diff.
- Foreign keys and indexes are present for main relations.

## Model review

### PerangkatDesa

Status: PASS

Notes:

- Exists in schema.
- Related to `Desa` and `DataSource`.
- Defaults `dataStatus` to `demo`.
- Indexed by `desaId`, `dataStatus`, and `sourceId`.

### DesaAdminClaim

Status: PASS

Notes:

- Exists in schema.
- Tracks desa, user, status, method, official email, website token hash, verification/rejection timestamps.
- Good foundation for future claim flow.

### DesaAdminMember / DesaAdminInvite

Status: PASS

Notes:

- Membership is scoped per desa/user with unique `(desaId, userId)`.
- Invite has token hash, status, expiry, acceptedAt.
- Max 5 admin rule is not a DB constraint yet, which is acceptable because task expected application/service enforcement later.

### AdminClaimAudit

Status: PASS

Notes:

- Append-style audit model exists.
- Supports metadata, eventType, evidence, actor/target ids.
- Good foundation for claim, invite, upload, report, and admin action audit.

### FakeAdminReport

Status: PASS

Notes:

- Supports desa, reported user, reporter, reason, description, evidence, reporter email, and status.
- Suitable foundation for future `Laporkan admin palsu` UI.

### DokumenAttachment

Status: PASS

Notes:

- Adds storage metadata foundation for uploaded documents.
- Related to `DokumenPublik`.
- Does not implement storage bucket or upload UI, which is correct for this batch.

### AIReviewResult

Status: PASS

Notes:

- Stores target type/id, model, summary, suggested status, confidence, risk flags, extracted fields, and raw JSON.
- No AI API call/UI was added, which is correct for this batch.

## Seed/read path review

Status: PASS

Evidence from commit message/diff:

- perangkat demo seed executed successfully.
- 124 perangkat demo rows written.
- Rows are marked demo and use safe public labels.
- No private phone/email exposure.
- Desa detail read path was wired to DB-backed perangkat rows.

## QA review

Ujang reported:

- `npx prisma validate`: PASS
- `npx prisma generate`: PASS
- `npx tsc --noEmit`: PASS
- `npm run test`: PASS
- `npm run build`: PASS
- `npx prisma migrate status`: PASS

Status: PASS based on commit message.

## Guardrail review

Status: PASS

Confirmed by commit message and reviewed diff:

- no destructive migration,
- no seed reset,
- no verified activation,
- no official numeric APBDes extraction,
- no scraper/scheduler,
- no new dependency,
- no admin UI implemented,
- no AI UI/API implemented.

## Known risks / carry-forward

1. Admin claim, invite, fake report, upload, and AI review tables are foundation only; no UI or service enforcement exists yet.
2. Max 5 admin rule still needs service-layer enforcement in future admin claim/invite task.
3. Perangkat data is demo/mock until a real source-backed workflow exists.
4. `AdminClaimAudit` uses string `eventType`; future task should define shared constants to avoid typos.
5. `DokumenAttachment.uploadedById` is metadata only and currently has no relation to `User`; acceptable for foundation, but future upload service should decide whether to add relation or keep loose metadata.

## Verdict

`ACCEPTED_FOR_NEXT_SPRINT_04_GATE`

Recommended next step:

- Update BMAD sprint status.
- Open the next Sprint 04 task only after Owner/Iwan chooses the next gate:
  1. Perangkat UI final visual pass,
  2. Admin claim guided UI,
  3. Admin claim service/audit flow,
  4. Fake admin report UI/service,
  5. Document upload service/storage,
  6. AI-assisted source review service.

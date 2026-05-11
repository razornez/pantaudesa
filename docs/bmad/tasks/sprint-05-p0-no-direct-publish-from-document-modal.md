# Sprint 05 P0 - No Direct Publish From Document Modal

## Status
P0 BLOCKER.

## Owner Finding

Owner found that inside the document review modal, after clicking `Lanjut review data`, there is a `Publikasikan sekarang` action and the data can immediately appear on the public village detail page.

This is not allowed.

## Decision

Document review modal must NOT publish public village data directly.

The modal may only create or update review candidates:

```text
AdminDesaDocument / extraction result
-> DataDesa IN_REVIEW
-> Review Data queue
```

Final public publish may happen only from the dedicated `Review Data` surface after source/evidence and field-level value review.

## Why This Is Dangerous

Direct publish from document modal can bypass:

- source-of-truth governance,
- DataDesa review queue,
- per-field source/evidence check,
- component/template visibility check,
- conflict review,
- final internal admin decision surface,
- clear audit separation between document processing and public data publish.

This can expose PantauDesa to legal and reputation risk if incorrect/falsified village data appears publicly.

## Required Fix

### 1. Remove or disable `Publikasikan sekarang` from document modal

The document modal must not have a public publish action.

Replace with clear action:

```text
Kirim kandidat data ke Review Data
```

or:

```text
Buat draft DataDesa dari dokumen
```

### 2. Document modal copy must be explicit

Show clear copy:

```text
Tahap ini hanya membuat kandidat data dari dokumen. Data belum tayang publik. Publikasi final dilakukan di tab Review Data setelah sumber dan nilai per field diverifikasi.
```

### 3. API guardrail

Any API route called by document modal must not set public data directly.

Must not do:

```text
DataDesa.status = PUBLISHED
DataDesa.isActive = true
VillageDataVersion.status = PUBLISHED
Desa.dataPublishedAt update for final public data
public-facing field update without DataDesa review
```

Allowed only:

```text
DataDesa.status = IN_REVIEW
AdminDesaDocument.status = PROCESSING / DRAFT_READY_REVIEW / NEEDS_REVIEW
VillageDataVersion.status = REVIEW_READY
DesaDataAuditEvent event for submitted-to-review
```

### 4. Public render guard

Public village detail page must render only:

```text
DataDesa.status = PUBLISHED
DataDesa.isActive = true
component visible
source evidence exists
```

Never render:

```text
IN_REVIEW
DRAFT
REJECTED
ARCHIVED
```

### 5. Rename concepts

Use distinct language:

Document modal:

```text
Kirim kandidat data
Buat draft review
Kirim hasil ekstraksi ke Review Data
```

Review Data page:

```text
Terbitkan data ini
Publish ke halaman desa
Tolak kandidat data
```

Do not use the same `publish/approve` vocabulary in both places.

## Required Audit

Search and audit all routes/components that can publish data from document modal, including but not limited to:

```text
src/app/api/internal-admin/documents/[documentId]/publish/route.ts
src/app/api/internal-admin/documents/[documentId]/draft-mapping/route.ts
src/app/api/internal-admin/intake/submit-review/route.ts
src/components/internal-admin/**
src/components/internal-admin/intake/**
```

Confirm there is no document-modal path that directly publishes public data.

## QA Required

1. Upload/intake a trusted sample document.
2. Open document modal.
3. Confirm no `Publikasikan sekarang` action exists.
4. Click `Kirim kandidat data ke Review Data`.
5. Confirm data goes to `DataDesa IN_REVIEW` only.
6. Confirm public detail page does NOT change yet.
7. Open `Review Data` tab.
8. Publish one field.
9. Confirm only that PUBLISHED field appears publicly.
10. Reject one field.
11. Confirm rejected field does not appear publicly.

## Acceptance Criteria

- No direct publish action remains in document modal.
- Document modal can only create review candidates.
- Public page does not change after document modal submit.
- Final public publish only happens from `Review Data`.
- Draft/rejected/in-review data never renders publicly.
- Copy clearly separates document review from data publish.
- Report documents the fixed flow.

## Short Instruction For Asep

```text
P0 blocker: remove direct publish from document modal. The modal must only send candidates to Review Data as DataDesa IN_REVIEW. Public detail must not change until a field is published from Review Data. Rename CTA/copy so document review and data publish are clearly separate. Add API guardrails and QA this flow before merge.
```

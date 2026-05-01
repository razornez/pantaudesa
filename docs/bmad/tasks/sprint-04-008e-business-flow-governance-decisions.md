# Sprint 04-008E — Business Flow & Governance Decisions

Date: 2026-04-30
Status: planning / not-approved-for-execution
Prepared-by: Rangga / BMAD-lite orchestration
Related:
- `docs/bmad/tasks/sprint-04-008-execution-sequencing-plan.md`
- `docs/bmad/tasks/sprint-04-008a-admin-desa-verification-review-otp-flow.md`
- `docs/bmad/tasks/sprint-04-008b-admin-desa-profile-tabs.md`
- `docs/bmad/tasks/sprint-04-008d-back-office-user-admin-desa-internal-admin-completion.md`

## Purpose

Capture Owner decisions from business-flow review so Sprint 04-008 does not only work technically, but also supports the real operational flow for Admin Desa, internal admin, document governance, notification, and public data trust.

This is a planning/backlog document only. Do not assign developer execution until Owner explicitly approves.

## Owner decisions captured

### 1. Admin VERIFIED continuity / replacement

- Only one Admin Desa `VERIFIED` may exist per desa.
- Admin `LIMITED` must not automatically become `VERIFIED` when the current `VERIFIED` admin is removed, expired, revoked, or missing.
- If a desa already has an Admin `VERIFIED`, a new applicant should be blocked from normal claim flow and shown a clear message.
- User should be directed to `Hubungi Admin Pengajuan Admin Desa` for pengkinian/pergantian data admin with strong evidence.
- Internal admin reviews the replacement request.

Suggested user-facing copy:

```text
Desa ini sudah memiliki Admin Desa VERIFIED. Jika kamu ingin mengajukan pergantian atau pengkinian admin, hubungi admin PantauDesa melalui formulir Pengajuan Admin Desa dan sertakan bukti yang kuat.
```

### 2. Appeal / keberatan after REJECTED

- No separate appeal product flow is needed for now.
- If user disagrees with rejection, direct them to `Hubungi Admin Pengajuan Admin Desa`.
- Internal admin can respond through registered email or existing support handling.

Suggested user-facing copy:

```text
Jika kamu merasa keputusan ini keliru, hubungi admin PantauDesa melalui Pengajuan Admin Desa dan jelaskan keberatanmu dengan bukti tambahan.
```

### 3. Review SLA recommendation

Owner asked for recommendation.

Recommended SLA:

- Normal Admin Desa verification review: **1–3 hari kerja**.
- Claim-support with evidence/berkas: **2–5 hari kerja** because evidence may need extra checking.
- Suspicious/fraud review: **hingga 5 hari kerja** or longer if flagged, but avoid overpromising.
- Renewal review: **1–2 hari kerja**, because this affects already-verified admins.
- Document review/mapping: **2–5 hari kerja**, depending on document complexity and AI mapping quality.

Default user-facing SLA copy should use a range and avoid guaranteed promises:

```text
Estimasi review 1–3 hari kerja. Jika bukti perlu pemeriksaan tambahan, proses bisa memakan waktu lebih lama.
```

For claim-support/evidence path:

```text
Estimasi review 2–5 hari kerja karena bukti perlu diperiksa manual.
```

For renewal:

```text
Estimasi review renewal 1–2 hari kerja. Pastikan renewal diajukan sebelum masa berlaku berakhir.
```

### 4. Support case lifecycle

- No dedicated support-case lifecycle is needed for MVP.
- After user submits Hubungi Admin / Pengajuan Admin Desa, the user waits for update by registered email.
- Do not add `OPEN`, `IN_PROGRESS`, `WAITING_USER`, `RESOLVED`, or `CLOSED` support-case statuses unless Owner later approves.

### 5. Data versioning

- Versioning is required for data governance.
- Public page should show only the latest published data for now.
- Historical versions are for internal/audit use first, not public display.

Minimum versioning requirements:

- field changed,
- previous value,
- new value,
- source/document reference,
- actor,
- timestamp,
- publish reason or system note,
- audit event link.

Public display rule:

```text
Show latest public data only.
Keep version history internal/audit-backed for now.
```

### 6. Source conflict and accuracy decision

- Admin Desa-submitted data is not automatically more credible than other sources.
- Internal admin/document review decides which data is most accurate based on trusted sources.
- If Admin Desa data is not accurate, reject the document/mapping/update and show a clear reason.
- If Admin Desa disagrees, they should be directed to file objection with the original/source institution or provide stronger source evidence.
- Rejection copy must clearly explain that PantauDesa uses trusted sources and cannot accept unsupported/inaccurate updates.

Suggested rejection copy:

```text
Data belum bisa dipublish karena belum sesuai dengan sumber terpercaya yang kami gunakan. Jika data dari sumber resmi memang sudah berubah, ajukan pembaruan ke sumber terkait atau unggah bukti resmi yang lebih kuat.
```

### 7. Revoked admin document retention

- If an Admin Desa is revoked, documents they uploaded should remain visible/available in the document workflow.
- Documents already in review or published should not disappear because the uploader was revoked.
- If data needs updating, the latest valid document/update should supersede previous data through normal versioning.
- Audit must preserve original uploader and uploader status at upload time.

### 8. Notification channels

- Only application/review-related events should use email.
- Other events should be in-app notification only.

Email-worthy events:

- Admin Desa claim submitted/updated,
- OTP/review result where appropriate,
- `REJECTED` claim,
- fraud/suspicious cooldown,
- renewal reminder/expiration,
- verified access removed,
- document review result if important,
- invite accepted if needed.

In-app only by default:

- comments,
- replies,
- likes,
- votes,
- general engagement.

### 9. Upload limits and policy

- Max file size per upload: **10 MB**.
- Additional upload policy should be defined before implementation:
  - allowed MIME types,
  - max files per upload,
  - document category required,
  - file name/title required,
  - duplicate handling,
  - private storage by default.

Recommended document categories:

- Profil Desa,
- Struktur Perangkat,
- Kontak Resmi,
- Regulasi/Perdes,
- Laporan/Publikasi,
- Lainnya.

### 10. Internal admin operational model

- There is only one internal admin account for now.
- That one internal admin account may be used/login by several people operationally.
- Because only one shared internal admin account exists, no internal workload assignment queue is needed for MVP.
- Still, every internal action must be audited as internal-admin action.

Important risk:

- Shared login reduces accountability per person.
- For MVP this is accepted, but future implementation should consider named internal admin accounts if operations grow.

### 11. Public source indicator

Public pages should show a safe source/update indicator for latest data.

Example:

```text
Terakhir diperbarui: 1 Mei 2026
Sumber: Dokumen resmi desa / PantauDesa / sumber pemerintah terkait
```

Do not expose private uploaded documents publicly by default.

### 12. Responsibility statement

Before Admin Desa uploads documents or publishes/approves actions, show a lightweight responsibility acknowledgment.

Suggested copy:

```text
Saya menyatakan dokumen/data yang saya unggah benar dan dapat dipertanggungjawabkan.
```

Use this especially for:

- document upload,
- verified approval of limited document upload,
- data publish action,
- claim-support evidence submission.

## Impact on 04-008 execution plan

These decisions affect:

- 04-008.2 verification backend flow,
- 04-008.3 internal Admin Desa review queue,
- 04-008.4 dedicated Hubungi Admin Pengajuan Admin Desa,
- 04-008.5 renewal enforcement,
- 04-008.8 document upload,
- 04-008.9 internal Dokumen Desa review/mapping/publish,
- 04-008.11 notification system,
- final cross-role regression QA.

## New/updated backlog needs

### Admin VERIFIED replacement handling

Must cover:

- block normal claim when desa already has `VERIFIED`,
- direct user to dedicated claim-support form,
- internal review replacement request,
- no automatic `LIMITED` to `VERIFIED` promotion.

### Versioning and source conflict handling

Must cover:

- latest public data only,
- internal version history,
- source traceability,
- conflict/rejection reason,
- public source indicator.

### Upload policy and responsibility acknowledgment

Must cover:

- 10 MB max file size,
- category/title required,
- allowed file types,
- private storage,
- responsibility checkbox/acknowledgment.

### Notification channel policy

Must cover:

- email only for application/review-related events,
- in-app for engagement/comment/vote/like events.

## Acceptance criteria for future execution

A future implementation must prove:

- normal claim is blocked when desa already has `VERIFIED`, with clear direction to claim-support path,
- `LIMITED` does not auto-promote to `VERIFIED` after replacement/renewal/removal events,
- rejection shows clear reason and correction instruction,
- SLA copy appears where user waits for review,
- support flow does not introduce unsupported status lifecycle,
- version history exists for published data changes,
- public pages show latest data only with safe source indicator,
- source conflict can lead to document/data rejection with clear reason,
- revoked admin documents remain traceable and do not disappear,
- email notifications are limited to application/review-related events,
- upload enforces 10 MB max file size,
- responsibility acknowledgment appears for sensitive upload/publish actions,
- internal admin shared-account risk is documented.

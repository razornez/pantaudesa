# Back-Office Role & Flow Reference — PantauDesa

> Dibuat: 2026-06-02. Dokumen referensi hasil studi mendalam seluruh sistem back-office.
> Update dokumen ini setiap kali ada perubahan signifikan pada role, flow, atau permission.

---

## 1. Role Matrix

| Role | Tipe | Di mana | Akses |
|---|---|---|---|
| **Warga** | User biasa | Public | Hanya baca halaman publik, kirim suara |
| **Limited Admin** | Admin Desa | `/profil/admin-desa/*` | Upload dokumen/data, lihat status |
| **Verified Admin** | Admin Desa | `/profil/admin-desa/*` | Semua Limited + approve/reject, invite/revoke member |
| **Internal Admin** | Tim PantauDesa | `/internal-admin/*` | Publish data, kelola template, verifikasi klaim |

**Catatan penting:**
- **Verified Admin ≠ Internal Admin** — dua role yang benar-benar berbeda
- Verified Admin adalah warga/staf desa yang sudah terverifikasi; Internal Admin adalah tim PantauDesa
- Internal Admin bisa akses SEMUA desa; Verified Admin hanya desa-nya sendiri
- Satu desa hanya boleh punya **1 Verified Admin** (enforced di DB)
- Satu user hanya bisa jadi admin untuk **1 desa** (enforced di API)

---

## 2. Document Status State Machine

```
WAITING_VERIFIED_APPROVAL  ←── LIMITED admin upload
        │
        ├─[Verified admin APPROVE]──► PROCESSING
        └─[Verified admin REJECT]───► REJECTED (terminal)
        └─[Internal admin override]─► PROCESSING (fallback jika tak ada verified)

PROCESSING  ←── VERIFIED admin upload (langsung skip waiting)
        │
        ├─[Internal admin PUBLISH]──► PUBLISHED (terminal, data tayang)
        └─[Internal admin FAILED]───► FAILED (terminal, error teknis)
```

**Status enum:** `WAITING_VERIFIED_APPROVAL | PROCESSING | PUBLISHED | REJECTED | FAILED`

---

## 3. Sequence Diagram: Claim Desa (Onboarding Admin Baru)

```mermaid
sequenceDiagram
    participant W  as Warga/User
    participant SYS as System
    participant IA  as Internal Admin
    participant DB  as Database

    W->>SYS: GET /profil/klaim-admin-desa/pengajuan
    W->>SYS: POST /api/admin-claim/submit\n{desaId, method, officialEmail/websiteUrl}
    SYS->>DB: Cek: user sudah ada active claim/member?
    DB-->>SYS: Tidak ada konflik
    SYS->>DB: CREATE DesaAdminClaim {status: PENDING}
    SYS-->>W: Claim submitted, menunggu verifikasi

    alt Method: OFFICIAL_EMAIL
        W->>SYS: POST /api/admin-claim/send-email-otp
        SYS->>W: Email OTP dikirim
        W->>SYS: POST /api/admin-claim/verify-otp {otp}
        SYS->>DB: UPDATE claim {status: IN_REVIEW, verifiedAt: now}
    else Method: WEBSITE_TOKEN
        W->>SYS: GET /api/admin-claim/generate-website-token
        Note over W,SYS: User pasang token di website desa
        SYS->>DB: UPDATE claim {status: IN_REVIEW}
    else Method: SUPPORT_REVIEW
        SYS->>DB: UPDATE claim {status: IN_REVIEW}
    end

    IA->>SYS: GET /internal-admin/claims (review queue)
    SYS->>DB: Query claims WHERE status=IN_REVIEW
    DB-->>IA: List klaim menunggu review

    alt Internal Admin APPROVE
        IA->>SYS: POST /api/internal-admin/claims/{id}/approve
        SYS->>DB: UPDATE claim {status: APPROVED}
        SYS->>DB: CREATE DesaAdminMember\n{status: VERIFIED, role: VERIFIED_ADMIN}
        SYS->>W: Notifikasi: "Klaim desa disetujui"
        Note over W: User sekarang jadi VERIFIED ADMIN
    else Internal Admin REJECT
        IA->>SYS: POST /api/internal-admin/claims/{id}/reject\n{reason, reapplyAllowedAt}
        SYS->>DB: UPDATE claim {status: REJECTED}
        SYS->>W: Notifikasi: "Klaim ditolak karena: [reason]"
        Note over W: Bisa coba lagi setelah cooldown
    end
```

---

## 4. Sequence Diagram: Invite LIMITED Admin (oleh Verified Admin)

```mermaid
sequenceDiagram
    participant VA as Verified Admin
    participant SYS as System
    participant EMAIL as Resend Email
    participant LA  as User Diundang
    participant DB  as Database

    VA->>SYS: POST /api/admin-claim/invite {email}
    SYS->>DB: Cek: desa sudah punya 5 admin? User sudah jadi admin lain?
    DB-->>SYS: OK, slot tersedia
    SYS->>DB: CREATE DesaAdminInvite {status: PENDING, token}
    SYS->>EMAIL: Kirim email invite dengan link+token
    EMAIL->>LA: Email: "Anda diundang jadi admin desa X"

    LA->>SYS: POST /api/admin-claim/accept-invite {token}
    SYS->>DB: Validasi token, belum expired
    SYS->>DB: UPDATE invite {status: ACCEPTED}
    SYS->>DB: CREATE DesaAdminMember\n{status: LIMITED, role: LIMITED_ADMIN}
    SYS-->>LA: Redirect ke /profil/admin-desa
    Note over LA: User sekarang jadi LIMITED ADMIN
```

---

## 5. Sequence Diagram: LIMITED Admin Upload & Approval Chain

```mermaid
sequenceDiagram
    participant LA  as Limited Admin
    participant VA  as Verified Admin
    participant IA  as Internal Admin
    participant SYS as System
    participant DB  as Database
    participant PUB as Public /desa/{slug}

    LA->>SYS: POST /api/admin-claim/documents/upload\n{files, title, category, responsibilityAck}
    SYS->>DB: getUploadedDocumentInitialStatus(status=LIMITED)\n→ WAITING_VERIFIED_APPROVAL
    SYS->>DB: CREATE AdminDesaDocument {status: WAITING_VERIFIED_APPROVAL}
    SYS->>DB: Upload file ke Supabase Storage
    SYS->>DB: CREATE Notification → Verified Admin\n{type: DOCUMENT_UPLOADED_WAITING}
    SYS-->>LA: "Dokumen menunggu persetujuan verified admin"

    Note over VA: Verified admin lihat notifikasi
    VA->>SYS: GET /api/admin-claim/documents\n(filter: WAITING_VERIFIED_APPROVAL)
    VA->>SYS: Review dokumen

    alt Verified Admin APPROVE
        VA->>SYS: POST /api/admin-claim/documents/{id}/approve
        SYS->>DB: UPDATE doc {status: PROCESSING, approvedBy, approvedAt}
        SYS->>DB: CREATE Notification → LA\n{type: DOCUMENT_APPROVED}
        Note over IA: Dokumen masuk review queue internal
    else Verified Admin REJECT
        VA->>SYS: POST /api/admin-claim/documents/{id}/reject {reason}
        SYS->>DB: UPDATE doc {status: REJECTED, rejectedReason}
        SYS->>DB: CREATE Notification → LA\n{type: DOCUMENT_REJECTED}
        Note over LA: Bisa upload dokumen baru
    end

    IA->>SYS: GET /internal-admin/documents (filter: PROCESSING)
    IA->>SYS: GET /internal-admin/intake/{documentId}\n(review mapping, diff, coverage)
    IA->>SYS: POST /api/internal-admin/documents/{id}/publish\n{fields: {...}}
    SYS->>DB: UPDATE doc {status: PUBLISHED, publishedAt}
    SYS->>DB: UPDATE Desa fields
    SYS->>DB: CREATE DataDesa rows (per component)
    SYS->>DB: CREATE VillageDataVersion (audit)
    SYS->>DB: CREATE Notifications → uploader + semua active admins\n{type: DOCUMENT_PUBLISHED}
    SYS-->>PUB: Data tayang di halaman publik desa

    Note over LA,VA: Keduanya terima notifikasi "Data sudah tayang"
```

---

## 6. Sequence Diagram: VERIFIED Admin Upload (Fast Path)

```mermaid
sequenceDiagram
    participant VA  as Verified Admin
    participant IA  as Internal Admin
    participant SYS as System
    participant DB  as Database

    VA->>SYS: POST /api/admin-claim/documents/upload\n{files, title, category}
    SYS->>DB: getUploadedDocumentInitialStatus(status=VERIFIED)\n→ PROCESSING
    SYS->>DB: CREATE AdminDesaDocument {status: PROCESSING}
    Note over IA: Langsung masuk review queue, skip approval step
    SYS-->>VA: "Dokumen masuk ke review internal"

    IA->>SYS: GET /internal-admin/documents (filter: PROCESSING)
    IA->>SYS: Review di intake workbench

    alt Publish
        IA->>SYS: POST /api/internal-admin/documents/{id}/publish
        SYS->>DB: PUBLISHED + data update + versioning + notif
    else Mark Failed
        IA->>SYS: POST /api/internal-admin/documents/{id}/mark-failed {reason}
        SYS->>DB: UPDATE doc {status: FAILED, failedReason}
        SYS->>DB: Notif ke VA: DOCUMENT_FAILED
    end
```

---

## 7. Sequence Diagram: Internal Admin — Intake Workbench Flow

```mermaid
sequenceDiagram
    participant IA  as Internal Admin
    participant WB  as Intake Workbench
    participant AI  as AI Pipeline
    participant SYS as System
    participant DB  as Database

    Note over IA,WB: Step 1 — Input

    IA->>WB: Pilih mode: Upload file / Paste teks / Source entry
    IA->>WB: Pilih desa target
    IA->>WB: Klik "Jalankan pipeline"
    WB->>AI: POST /api/internal-admin/intake\n{file/text, desaId, useAiMapping}
    AI-->>WB: PipelineResult {extract, diff, coverage, mapping, validation}
    WB->>SYS: POST /api/internal-admin/intake/submit-review\n(auto-submit, buat AdminDesaDocument)
    SYS->>DB: CREATE AdminDesaDocument {status: PROCESSING, aiMappingResult: pipelineJson}
    WB->>WB: router.push(/internal-admin/intake/{documentId})

    Note over IA,WB: Step 2 — Review (/internal-admin/intake/{documentId})

    IA->>SYS: GET /internal-admin/intake/{documentId}
    SYS->>DB: loadIntakeReviewPageData({documentId})
    SYS->>DB: buildReviewCandidateForDocument (proses candidate fields)
    SYS-->>IA: IntakeReviewPage dengan semua komponen

    Note right of IA: IntakeSourceRibbon — info sumber dokumen
    Note right of IA: IntakeDiffTheatre — perubahan field vs data publik
    Note right of IA: IntakeCoverageLens — coverage donut chart
    Note right of IA: IntakeValidationPanel — hasil validasi
    Note right of IA: IntakeDetectedGallery — foto/gambar terdeteksi
    Note right of IA: IntakeInfoStrip — pipeline chain info
    Note right of IA: IntakeFinalReviewSection — form publish/reject

    IA->>SYS: Review candidate fields, pilih manual/fetched/skip per field
    IA->>SYS: POST /api/internal-admin/documents/{id}/publish {fields}
    SYS->>DB: PUBLISHED + update Desa + versioning + notif
    SYS->>WB: router.push(/internal-admin/documents?status=PUBLISHED&focus={id})
    Note over IA: Card di queue menyala (intake-focus-flash animation)
```

---

## 8. Sequence Diagram: Structured Data Submission (Template-Based)

```mermaid
sequenceDiagram
    participant A   as Admin Desa (LIMITED/VERIFIED)
    participant SYS as System
    participant TPL as Template Engine
    participant IA  as Internal Admin
    participant DB  as Database

    A->>SYS: GET /profil/admin-desa/dokumen
    SYS->>TPL: buildTemplateFieldEngineViewModel(desaId)
    TPL->>DB: Resolve template aktif desa
    TPL-->>SYS: ViewModel {fields, sections, template name}
    SYS-->>A: Render TemplateFieldEntrySections (form per komponen)

    A->>A: Isi field: jumlahPenduduk, websiteUrl, dll
    A->>A: Isi sourceUrl + evidenceNote (jika field requires evidence)
    A->>SYS: POST /api/admin-claim/documents/structured-submit\n{values, sourceUrl, evidenceNote, responsibilityAck}
    SYS->>TPL: Validasi field keys vs template aktif
    SYS->>TPL: Cek field yang requires evidence punya sourceUrl/evidenceNote
    SYS->>DB: CREATE AdminDesaDocument\n{inputMode: STRUCTURED_SUBMISSION, structuredValuesJson}
    Note over SYS: Status: LIMITED→WAITING, VERIFIED→PROCESSING
    SYS->>DB: Notif ke Verified Admin jika uploader LIMITED

    IA->>SYS: Review di /internal-admin/intake/{documentId}
    Note over IA: ReviewCandidate dibangun dari structuredValuesJson\n(tidak perlu AI pipeline)
    IA->>SYS: Publish
```

---

## 9. Notification Chain Lengkap

| Kapan | Notif ke | Type | Channel |
|---|---|---|---|
| LIMITED upload | Verified Admin | `DOCUMENT_UPLOADED_WAITING` | in_app |
| Verified APPROVE | Uploader (LIMITED) | `DOCUMENT_APPROVED` | in_app |
| Verified REJECT | Uploader (LIMITED) | `DOCUMENT_REJECTED` | in_app |
| Internal PUBLISH | Uploader + semua active admin | `DOCUMENT_PUBLISHED` | in_app |
| Internal FAILED | Uploader | `DOCUMENT_FAILED` | in_app |
| Claim APPROVED | User yang klaim | `CLAIM_APPROVED` | in_app |
| Claim REJECTED | User yang klaim | `CLAIM_REJECTED` | in_app |
| Template berubah | Semua admin desa affected | `TEMPLATE_COMPONENTS_CHANGED` | in_app |
| Template assignment berubah | Semua admin desa affected | `TEMPLATE_ASSIGNMENT_CHANGED` | in_app |
| Renewal due soon | Verified Admin | `RENEWAL_REMINDER` | in_app + email |
| Renewal expired | Verified Admin | `RENEWAL_EXPIRED` | in_app + email |

---

## 10. Permission Matrix Lengkap

| Action | Warga | Limited Admin | Verified Admin | Internal Admin |
|---|:---:|:---:|:---:|:---:|
| Lihat halaman publik desa | ✅ | ✅ | ✅ | ✅ |
| Kirim suara warga | ✅ | ✅ | ✅ | ✅ |
| Upload dokumen/data | — | ✅ | ✅ | — |
| Lihat status dokumen sendiri | — | ✅ | ✅ | ✅ |
| Approve dokumen (LIMITED upload) | — | — | ✅ | ✅ (fallback) |
| Reject dokumen (LIMITED upload) | — | — | ✅ | — |
| Invite LIMITED admin | — | — | ✅ | — |
| Revoke LIMITED admin | — | — | ✅ | — |
| Review intake workbench | — | — | — | ✅ |
| Publish dokumen ke desa | — | — | — | ✅ |
| Mark dokumen failed | — | — | — | ✅ |
| Verifikasi klaim admin desa | — | — | — | ✅ |
| Approve/reject renewal | — | — | — | ✅ |
| Kelola template desa | — | — | — | ✅ |
| Assign template ke desa | — | — | — | ✅ |

---

## 11. Arsitektur File Kunci

```
AUTH & SESSION
├── src/lib/auth.ts                                      NextAuth config (credentials + magic link)
├── src/lib/auth/internal-admin.ts                       requireInternalAdminSession()
└── src/lib/data/admin-desa-context.ts                   requireAdminDesaContext()

POLICY & RULES
├── src/lib/admin-desa/policy.ts                         isVerifiedAdminMember(), getUploadedDocumentInitialStatus()
├── src/lib/admin-claim/status.ts                        State machine transitions
├── src/lib/admin-claim/eligibility.ts                   Eligibility checks (one user, one desa, dll)
└── src/lib/admin-desa/document-categories.ts            Category validation dari template

DOCUMENT REVIEW
├── src/lib/internal-admin/document-review-service.ts    Publish logic + versioning + notif
├── src/lib/internal-admin/review-candidate.ts           buildReviewCandidateForDocument()
└── src/lib/internal-admin/intake-review-page.ts         loadIntakeReviewPageData()

TEMPLATE SYSTEM
├── src/lib/village-data/template-resolver.ts            Resolve template aktif per desa
├── src/lib/village-data/component-catalog-manifest.ts   12 komponen terdaftar
├── src/lib/village-data/public-detail-composition.ts    Render plan (slot + registry)
└── src/lib/internal-admin/template-management-service.ts CRUD template

KEY UI COMPONENTS
├── src/components/admin-desa/AdminDesaDokumenClient.tsx           Upload + list + approve UI
├── src/components/internal-admin/IntakeWorkbench.tsx              Step 1 workbench
├── src/components/internal-admin/intake/IntakeReviewPage.tsx      Step 2 review
└── src/components/internal-admin/InternalDocumentReviewQueue.tsx  Document queue

API ROUTES — ADMIN DESA
├── src/app/api/admin-claim/documents/upload/route.ts              File upload
├── src/app/api/admin-claim/documents/structured-submit/route.ts   Data terstruktur
├── src/app/api/admin-claim/documents/[id]/approve/route.ts        Approve by Verified
└── src/app/api/admin-claim/documents/[id]/reject/route.ts         Reject by Verified

API ROUTES — INTERNAL ADMIN
├── src/app/api/internal-admin/documents/[id]/publish/route.ts     Publish by Internal
└── src/app/api/internal-admin/documents/[id]/mark-failed/route.ts Mark failed by Internal
```

---

## 12. Business Rules Kritis

1. **1 user → 1 desa** — User tidak bisa jadi admin di 2 desa bersamaan
2. **1 Verified per desa** — Enforced saat claim approval (query `existingVerified`)
3. **Max 5 admin per desa** — Enforced di invite endpoint
4. **LIMITED upload → WAITING** — Wajib melewati approval Verified Admin
5. **VERIFIED upload → PROCESSING** — Langsung masuk internal review (bypass approval)
6. **Internal Admin adalah satu-satunya yang bisa PUBLISH** — Tidak ada path lain
7. **Terminal states tidak bisa di-undo** — PUBLISHED, REJECTED, FAILED bersifat final
8. **Cooldown pada rejection klaim** — `fraudCooldownUntil` + `reapplyAllowedAt` enforced
9. **Renewal expiry** — Jika overdue, status VERIFIED bisa turun ke EXPIRED

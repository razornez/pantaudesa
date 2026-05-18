# Sprint 05 — Intake Step 2: Halaman Review Terpisah dengan URL Sendiri

## Status

READY FOR EXECUTION — menunggu approval developer.

---

## Latar Belakang & Motivasi

Saat ini alur intake internal admin bekerja sebagai berikut:

```
/internal-admin/intake  (satu URL untuk semua)
  Step 1: Upload file / paste teks + pilih desa + jalankan pipeline
  Step 2: Cek hasil (diff, coverage, validation) + submit ke antrean review
```

**Masalah:**

1. **URL tidak berubah di Step 2** — halaman masih `/internal-admin/intake` meski konten berubah total. Tidak bisa di-bookmark, tidak bisa di-share.
2. **Step 2 tidak bisa diakses tanpa Step 1** — jika admin menutup browser di Step 2, semua data hilang. Admin harus mengulang dari awal.
3. **Review modal terpisah** — setelah "Kirim ke antrean review", admin harus membuka modal lagi di `/internal-admin/documents` untuk melihat diff + publish. Ini fragmentasi UX yang tidak perlu.
4. **Dokumen dari admin desa juga perlu flow review yang sama** — dokumen yang disubmit oleh admin desa dari halaman mereka masuk ke `/internal-admin/documents` dan seharusnya bisa direview dengan interface yang sama.

**Solusi:**

Pisahkan Step 2 ke URL tersendiri: `/internal-admin/intake/[documentId]`

Setelah pipeline sukses di Step 1 → dokumen langsung disimpan ke DB (auto-submit) → navigate ke Step 2 URL. Jika admin meninggalkan halaman → dokumen tetap ada sebagai `PROCESSING` di document queue → bisa dilanjutkan kapan saja.

---

## Goal

1. Step 2 tampil di URL tersendiri: `/internal-admin/intake/[documentId]`
2. Step 2 menggabungkan diff/coverage/validation view dengan publish form (sebelumnya terpisah di modal)
3. Step 2 bisa diakses langsung dari document queue tanpa lewat Step 1
4. Step 2 bersifat read-only jika dokumen sudah `PUBLISHED` atau `FAILED`
5. `PublishModal` di halaman documents dihapus — diganti navigasi ke Step 2
6. Bersih: cleanup file yang dibuat secara eksperimental di sesi sebelumnya

---

## Branch Rule

```
sprint-05-intake-step2-standalone-review-page
```

Buat dari `main` terbaru. Jangan commit langsung ke `main`. Jangan merge sebelum owner/Rangga approve.

---

## User Stories

### US-1: Admin melakukan review setelah pipeline (alur utama)

**Sebagai** internal admin yang baru menjalankan pipeline di Step 1,
**Saya ingin** langsung diarahkan ke halaman review di URL baru setelah pipeline selesai,
**Agar** saya bisa bookmark halaman ini dan melanjutkan review kapan saja.

**Acceptance criteria:**
- Setelah klik "Jalankan pipeline" dan sukses → browser navigate ke `/internal-admin/intake/[documentId]`
- URL berubah (tidak lagi di `/internal-admin/intake`)
- Dokumen tersimpan di DB dengan status `PROCESSING`
- Halaman Step 2 menampilkan seluruh hasil analisis pipeline

### US-2: Admin melanjutkan review yang terputus

**Sebagai** internal admin yang sebelumnya menjalankan pipeline tapi browser ditutup,
**Saya ingin** bisa melanjutkan proses review dari document queue,
**Agar** saya tidak perlu mengulang upload dari awal.

**Acceptance criteria:**
- Dokumen muncul di `/internal-admin/documents` dengan status `PROCESSING`
- Tombol "Lanjut review data" mengarahkan ke `/internal-admin/intake/[documentId]`
- Halaman Step 2 menampilkan hasil yang sama seperti saat pertama kali

### US-3: Admin mereview dokumen dari admin desa

**Sebagai** internal admin yang menerima dokumen kiriman admin desa,
**Saya ingin** bisa melihat analisis dan langsung publish dari satu halaman,
**Agar** tidak perlu berpindah antara halaman documents dan modal.

**Acceptance criteria:**
- Dokumen dari admin desa tampil di document queue
- Klik "Lanjut review data" → `/internal-admin/intake/[documentId]`
- Jika dokumen dari admin desa tidak memiliki pipeline result (tidak lewat intake workbench), form publish tetap muncul meski tanpa diff/coverage section

### US-4: Admin melihat hasil dokumen yang sudah published (read-only)

**Sebagai** internal admin yang ingin melihat riwayat,
**Saya ingin** membuka halaman review dokumen yang sudah published,
**Agar** saya bisa melihat apa yang diubah tanpa risiko mengubah data.

**Acceptance criteria:**
- Dokumen `PUBLISHED` → Step 2 bersifat read-only
- Tidak ada tombol "Publikasikan" atau "Simpan draft"
- Semua field di publish form di-disabled
- Ada badge/notice "Dokumen ini sudah diterbitkan"

### US-5: Admin menolak dokumen dari Step 2

**Sebagai** internal admin yang menemukan dokumen tidak memenuhi syarat,
**Saya ingin** bisa langsung menandai dokumen sebagai gagal dari Step 2,
**Agar** tidak perlu berpindah ke halaman documents untuk melakukan aksi ini.

**Acceptance criteria:**
- Ada tombol "Tandai gagal" di Step 2 (sticky header atau action section)
- Klik "Tandai gagal" → buka `MarkFailedModal` (komponen yang sudah ada)
- Setelah ditandai gagal → halaman berubah ke mode read-only / tampilkan status gagal

---

## Arsitektur

### URL Structure

```
/internal-admin/intake              ← Step 1 (tidak berubah, kecuali after-pipeline behavior)
/internal-admin/intake/[documentId] ← Step 2 (baru)
```

### Data Flow

```
Step 1 (pipeline run)
  └─► POST /api/internal-admin/intake          ← run pipeline (tidak berubah)
      └─► pipeline result (in memory)
  └─► POST /api/internal-admin/intake/submit-review  ← auto-submit, buat AdminDesaDocument
      └─► { documentId }
  └─► router.push(`/internal-admin/intake/${documentId}`)

Step 2 (server component)
  └─► db.adminDesaDocument.findUnique({ id: documentId })
      └─► aiMappingResult (full pipeline JSON) → render diff/coverage/validation
      └─► desa → render source ribbon
  └─► Publish action: POST /api/internal-admin/documents/[documentId]/publish
  └─► Mark failed: POST /api/internal-admin/documents/[documentId]/mark-failed
```

### Dua Mode Step 2

| Status dokumen | Behavior Step 2 |
|---|---|
| `PROCESSING` | Full mode: diff + coverage + validation + publish form (editable) + tombol Publikasikan + Tandai Gagal |
| `WAITING_VERIFIED_APPROVAL` | **Full mode sama seperti PROCESSING** — internal admin bisa langsung review dan publish. Status ini tidak memblokir internal admin. |
| `PUBLISHED` | Read-only: tampilkan semua hasil, form disabled, notice "sudah diterbitkan" |
| `FAILED` | Read-only: tampilkan hasil jika ada, notice "ditandai gagal", alasan gagal |

Derived:
```ts
const isReadOnly = status === "PUBLISHED" || status === "FAILED";
const isEditable = status === "PROCESSING" || status === "WAITING_VERIFIED_APPROVAL";
```

### Guard untuk dokumen tanpa pipeline result

Dokumen yang masuk dari luar intake workbench (admin desa, import manual) mungkin tidak memiliki `aiMappingResult` dengan format pipeline result. Guard:

```ts
function hasPipelineResult(raw: unknown): raw is PipelineResult {
  return typeof raw === "object" && raw !== null && "extract" in raw && "diff" in raw;
}
```

Jika `hasPipelineResult` false → sembunyikan section diff/coverage/validation, tampilkan hanya form publish.

---

## File yang Harus Dibuat (NEW)

### `src/app/internal-admin/intake/[documentId]/page.tsx`

Server Component. Fetch document dari DB + validasi auth via layout. Pass data ke client component.

```
Spec:
- export const dynamic = "force-dynamic"
- Query: db.adminDesaDocument.findUnique dengan select:
    id, title, fileName, fileType, fileSize, status,
    aiMappingStatus, aiMappingResult, createdAt, publishedAt, failedReason
    desa: { id, nama, slug, kecamatan, kabupaten, provinsi }
- notFound() jika dokumen tidak ditemukan atau DB unavailable
- Render: <IntakeReviewPage doc={...} desa={...} rawAiMappingResult={...} />
```

### `src/components/internal-admin/intake/IntakeReviewPage.tsx`

Client Component. Komponen utama Step 2. Menerima data dari server page, orchestrate semua sub-components.

```
Props:
  doc: {
    id: string
    title: string
    fileName: string
    fileType: string
    fileSize: number
    status: "PROCESSING" | "WAITING_VERIFIED_APPROVAL" | "PUBLISHED" | "FAILED"
    aiMappingStatus: string | null
    createdAt: string
    publishedAt: string | null
    failedReason: string | null
  }
  desa: {
    id: string
    nama: string
    slug: string
    kecamatan: string
    kabupaten: string
    provinsi: string
  }
  rawAiMappingResult: unknown

State internal:
  - fields: Record<string, string>  (dari readAiMappingDraft)
  - note: string
  - loading: boolean
  - templateInfo: TemplateRibbonInfo | null
  - markFailedOpen: boolean

Derived:
  - pipelineResult = hasPipelineResult(rawAiMappingResult) ? rawAiMappingResult : null
  - normalizedDraft = readAiMappingDraft(rawAiMappingResult)
  - versionCandidate = readVillageVersionCandidate(rawAiMappingResult)
  - desaOption: DesaOption = { id, nama, slug, kecamatan, kabupaten, provinsi }
  - isReadOnly = status === "PUBLISHED" || status === "FAILED"
  - isProcessing = status === "PROCESSING" || status === "WAITING_VERIFIED_APPROVAL"
```

**Layout (wajib ikuti back-office-ui-design-guidelines.md):**

```
1. Sticky header (glass, z-40, borderRadius: 0)
   - Kiri: ← Kembali ke antrean (Link ke /internal-admin/documents)
   - Tengah: title dokumen (truncate)
   - Kanan: status pill + tombol aksi (sm: inline, xs: stacked/hidden)
   - Tombol: "Tandai gagal" (btn-lux-danger) + "Publikasikan sekarang" (btn-lux-success)
   - Jika read-only: tidak ada tombol aksi

2. Konten (div.space-y-6, max-w-6xl, mx-auto, px-4 sm:px-6, pb-10)

   [Jika hasPipelineResult]
   2a. IntakeSourceRibbon
       - result: pipelineResult
       - selectedDesa: desaOption
       - onChangeDesa: () => {}  (no-op, tidak bisa ganti desa di step 2)

   2b. IntakeDiffTheatre
       - result: pipelineResult

   2c. Grid lg:grid-cols-[1.05fr_1fr] gap-5
       - IntakeCoverageLens { result: pipelineResult }
       - IntakeValidationPanel {
           result: pipelineResult,
           mappingStatus: getMappingStatus(pipelineResult),
           aiStatus: getOpenAiStatus(pipelineResult),
           reviewStatus: getReviewStatus(pipelineResult),
           selectedDesa: desaOption
         }

   2d. IntakeDetectedGallery { result: pipelineResult }

   [Selalu tampil]
   2e. Publish Decision Section (lux-card)
       - eyebrow: "Review data dokumen · sumber dari dokumen resmi"
       - h2: doc.title
       - Desa info: nama, kecamatan, kabupaten
       - PublishCoverageNotices { templateInfo, normalizedDraft, versionCandidate, aiMappingResult: rawAiMappingResult }
       - PublishFieldEditorList {
           fields, note, normalizedDraft, versionCandidate,
           onFieldChange: isReadOnly ? () => {} : handleFieldChange,
           onNoteChange: isReadOnly ? () => {} : setNote,
           readOnly: isReadOnly
         }
       - [Jika isProcessing]
         Tombol: Simpan draft + Publikasikan sekarang
       - [Jika isReadOnly]
         notice-ok / notice-warn: "Dokumen sudah [diterbitkan/ditandai gagal]"

3. MarkFailedModal (jika markFailedOpen)
   - doc: { id, title, desa: { nama, kecamatan, kabupaten } }
   - onClose: () => setMarkFailedOpen(false)
   - onDone: () => router.refresh() atau router.push('/internal-admin/documents')
```

**Publish action handler:**

```ts
async function handlePublish() {
  const payloadFields = buildPayloadFields();
  if (!payloadFields) return;
  setLoading(true);
  try {
    const data = await publishDocumentReview(doc.id, { fields: payloadFields, note: note || undefined });
    // Navigate ke document queue + highlight card yang baru dipublish
    router.push(buildQueueFocusHref({ status: "PUBLISHED", documentId: doc.id }));
    // toast bisa ditambahkan jika ada toast provider di level atas
  } catch (err) {
    setPublishError(err instanceof Error ? err.message : "Gagal mempublikasikan.");
  } finally {
    setLoading(false);
  }
}
```

**Mark failed handler (setelah MarkFailedModal confirm):**

```ts
// onDone callback dari MarkFailedModal:
function handleMarkFailedDone() {
  setMarkFailedOpen(false);
  router.push(buildQueueFocusHref({ status: "FAILED", documentId: doc.id }));
}
```

**Import yang dibutuhkan di IntakeReviewPage:**

```ts
import { buildQueueFocusHref } from "@/components/internal-admin/intake/constants";
```

(`buildQueueFocusHref` sudah ada di `src/components/internal-admin/intake/constants.ts`)
```

**Template info fetch:**

```ts
useEffect(() => {
  if (!desa.id) return;
  let cancelled = false;
  fetchTemplateRibbonInfo(desa.id).then(d => { if (!cancelled) setTemplateInfo(d); }).catch(() => {});
  return () => { cancelled = true; };
}, [desa.id]);
```

---

## File yang Harus Dimodifikasi (MODIFY)

### `src/components/internal-admin/IntakeWorkbench.tsx`

**Perubahan:**

1. Hapus `step` state (`"input" | "result"`) — step 1 selalu tampil
2. Hapus `reviewTitle` state dan input
3. Hapus `submittedReview` state
4. Hapus `handleSubmitReview`, `handleContinueReview`, `handleBackToInput`
5. Hapus `reviewSectionRef`
6. Hapus render kondisional step 2: `IntakeResultStep`, `IntakeResultHeader`, `IntakeInspectorDrawer`
7. Hapus `setStep("result")` dari `handleRunPipeline`

**Tambahkan ke `handleRunPipeline`:**

```ts
const handleRunPipeline = useCallback(async () => {
  setError(null);
  const pipelineData = await runPipeline({
    mode, selectedFile, textValue, desaIdValue: selectedDesa?.id ?? "", useAiMapping,
  });
  if (!pipelineData || !selectedDesa) return;

  // Auto-submit: simpan ke DB, navigate ke Step 2
  setSubmitError(null);
  const submitted = await submitToReview({
    mode, selectedFile, textValue,
    desaIdValue: selectedDesa.id,
    useAiMapping,
    reviewTitle: buildSuggestedReviewTitle({ mode, selectedFile, selectedDesa }),
  });
  if (submitted) {
    void intakeHistory.refetch();
    resetPipeline();  // reset state Step 1 agar form bersih saat user kembali
    router.push(`/internal-admin/intake/${submitted.documentId}`);
  }
  // Jika submitted null: submitToReview set error di hook, tampilkan di UI
}, [mode, selectedFile, textValue, selectedDesa, useAiMapping, runPipeline, submitToReview, intakeHistory, router, resetPipeline]);
```

**Error handling jika auto-submit gagal:**

Tambahkan state `submitError` terpisah dari pipeline error. Jika `submitToReview` gagal, tampilkan:

```tsx
{submitError && (
  <div className="notice-card notice-danger flex items-center gap-3">
    <AlertTriangle size={14} />
    <div className="flex-1">
      <p className="font-semibold">Gagal menyimpan hasil pipeline.</p>
      <p className="text-[11px] mt-0.5">{submitError}</p>
    </div>
    <button onClick={handleRetrySubmit} className="btn-lux btn-lux-secondary text-xs shrink-0">
      Coba kirim ulang
    </button>
  </div>
)}
```

`handleRetrySubmit` memanggil `submitToReview` ulang dengan data yang sama (masih dalam state). Pipeline tidak perlu diulang.

8. `IntakeHistoryPanels` tetap ada di bawah input form

**Dua fase loading yang harus dibedakan secara visual di Step 1:**

```
Fase 1 — pipeline run:   "Menganalisis dokumen..." (spinner)
Fase 2 — auto-submit:    "Menyimpan dan mengarahkan ke review..." (spinner)
```

Tambahkan state `submitPhase: "idle" | "pipeline" | "submit"` di `IntakeWorkbench` untuk menampilkan pesan yang tepat. Fase 2 bisa berlangsung beberapa detik untuk file besar karena upload ke Supabase Storage.

**Note teknis — mengapa tidak perlu `createDraftMapping` sebelum Step 2:**

`readAiMappingDraft` dan `readVillageVersionCandidate` SUDAH bisa membaca langsung dari format pipeline JSON (`toIntakeReviewJson`):
- `readAiMappingDraft` membaca `input.mapping.fields` → ✓ ada di pipeline JSON
- `readVillageVersionCandidate` membaca `input.versionCandidate` → ✓ ada di pipeline JSON
- `PublishFieldEditorList` akan menampilkan field values yang terdeteksi pipeline tanpa perlu konversi tambahan

### `src/components/internal-admin/review-queue/DocCard.tsx`

**PROCESSING — ganti tombol "Review data" (runDraftMapping) dengan Link:**

```tsx
<Link
  href={`/internal-admin/intake/${doc.id}`}
  className="btn-lux btn-lux-success text-xs"
>
  <Sparkles size={11} aria-hidden /> Lanjut review data
</Link>
```

**PUBLISHED/FAILED — tambahkan tombol "Lihat hasil":**

```tsx
// Di section status PUBLISHED:
<Link href={`/internal-admin/intake/${doc.id}`} className="btn-lux btn-lux-ghost text-xs">
  <Eye size={11} aria-hidden /> Lihat hasil
</Link>
```

**Hapus:**
- `runDraftMapping` function
- Import `createDraftMapping` dari `api.ts`
- State dan logic yang hanya dipakai untuk `runDraftMapping`

### `src/components/internal-admin/InternalDocumentReviewQueue.tsx`

**Hapus:**
- `publishTarget` state dan `setPublishTarget`
- `<PublishModal>` dari render
- `onPublish` prop yang diteruskan ke `DocCard`

**Fix focus/highlight logic (baris ~79):**

Saat ini logika focus hanya match dokumen dengan status `PROCESSING`:
```ts
// SEBELUM (buggy untuk post-publish/post-fail):
documents.find((doc) => doc.id === focusDocumentId && doc.status === "PROCESSING") ?? null;
```

Ubah menjadi match berdasarkan ID saja (status filter sudah ditangani oleh URL query param):
```ts
// SESUDAH:
documents.find((doc) => doc.id === focusDocumentId) ?? null;
```

Ini diperlukan agar highlight card berfungsi setelah navigate dari Step 2 post-publish (`status=PUBLISHED`) dan post-fail (`status=FAILED`).

### `src/components/internal-admin/review-queue/types.ts`

**Hapus** `onPublish` dari `DocCardProps` (jika di sana).

### `src/components/internal-admin/review-queue/PublishFieldEditorList.tsx`

**Tambahkan prop `readOnly?: boolean`:**

```tsx
interface PublishFieldEditorListProps {
  // ... existing props
  readOnly?: boolean;
}
```

Pass `disabled={readOnly}` ke setiap `<input>` dan `<textarea>` di dalam komponen.

Cek terlebih dahulu apakah prop ini sudah ada. Jika sudah ada, skip.

---

## File yang Harus Dihapus (CLEANUP)

File-file ini dibuat secara eksperimental di sesi sebelumnya dan harus dihapus karena digantikan oleh implementasi baru ini:

| File | Alasan dihapus |
|---|---|
| `src/app/internal-admin/documents/[documentId]/review/page.tsx` | Digantikan oleh `/internal-admin/intake/[documentId]/page.tsx` |
| `src/components/internal-admin/DocumentPipelineView.tsx` | Digantikan oleh `IntakeReviewPage.tsx` |
| `src/components/internal-admin/intake/IntakeResultStep.tsx` | Menjadi orphan — tidak ada yang meng-render komponen ini setelah Step 2 dipindahkan ke URL baru. Per BMAD Component Cleanup Rule, hapus segera. |

**Sebelum hapus**, jalankan grep untuk konfirmasi zero remaining imports:

```bash
grep -r "IntakeResultStep\|DocumentPipelineView" src/ --include="*.tsx" --include="*.ts"
```

Harus kosong sebelum commit.

**Link "Lihat analisis"** yang ditambahkan ke `DocCard.tsx` di sesi eksperimental juga harus diganti dengan implementasi resmi di task ini.

---

## Komponen yang Tidak Berubah

- `IntakeSourceRibbon` — dipakai ulang as-is
- `IntakeDiffTheatre` — dipakai ulang as-is
- `IntakeCoverageLens` — dipakai ulang as-is
- `IntakeValidationPanel` — dipakai ulang as-is
- `IntakeDetectedGallery` — dipakai ulang as-is
- `PublishCoverageNotices` — dipakai ulang as-is
- `MarkFailedModal` — dipakai ulang as-is
- Pipeline API (`/api/internal-admin/intake`) — tidak berubah
- Submit-review API (`/api/internal-admin/intake/submit-review`) — tidak berubah
- Publish API (`/api/internal-admin/documents/[documentId]/publish`) — tidak berubah
- `PublishModal.tsx` file — tidak dihapus (komponen turunannya dipakai), tapi tidak lagi di-render di `InternalDocumentReviewQueue`

---

## Design & UX Requirements

Wajib ikuti standar yang berlaku:

- `docs/bmad/standards/back-office-ui-design-guidelines.md`
- `docs/bmad/standards/nextjs-engineering-standard.md`
- `docs/bmad/standards/ui-ux-standard.md`
- `docs/bmad/checklists/back-office-quiet-luxury-design-standard.md`

**Poin wajib:**

1. Sticky header: `glass`, `z-40`, `borderRadius: 0`, mengikuti pola dari `IntakeWorkbench.tsx` dan `VillageDataCenter.tsx`
2. Eyebrow label di atas setiap heading section
3. Status selalu tampil pertama sebelum penjelasan
4. Mobile-first: default single column, expand di `sm:`
5. Primary action (Publikasikan) selalu paling jelas secara visual — `btn-lux-success`
6. Destructive action (Tandai gagal) — `btn-lux-danger`
7. Technical detail collapsed by default
8. Gunakan `.lux-card` untuk surface card, bukan `border border-slate-100`
9. Tidak ada raw enum sebagai label (misal: "PROCESSING" → "Perlu review")

---

## Guardrails

**Jangan:**

- Auto-publish tanpa klik eksplisit admin
- Bypass permission/auth check
- Ubah schema DB atau jalankan migration
- Ubah pipeline API, submit-review API, atau publish API
- Hapus `PublishModal.tsx` (hanya stop render-nya)
- Commit ke `main`
- Commit `.env` atau secrets
- Buat duplikat history/review surface

**Boleh:**

- Membuat direktori baru di `src/app/internal-admin/intake/[documentId]/`
- Menambahkan `readOnly` prop ke `PublishFieldEditorList`
- Menghapus file eksperimental yang tercantum di bagian cleanup

---

## QA Checklist

Jalankan sebelum report ke owner:

```bash
npx tsc --noEmit      # harus bersih (0 error)
npm run lint          # harus bersih
npm run build         # harus berhasil (jika Prisma EPERM, catat dan skip)
```

**Manual QA:**

- [ ] Step 1 `/internal-admin/intake`: upload file → klik "Jalankan pipeline" → navigate ke `/internal-admin/intake/[documentId]`
- [ ] Step 2 PROCESSING: diff/coverage/validation tampil, form publish editable, tombol Publikasikan aktif
- [ ] Step 2: klik "Publikasikan sekarang" → dokumen published → redirect ke `/internal-admin/documents?status=PUBLISHED&focus=[id]` → card highlight dengan animasi `intake-focus-flash`
- [ ] Step 2: klik "Tandai gagal" → `MarkFailedModal` muncul → konfirmasi → redirect ke `/internal-admin/documents?status=FAILED&focus=[id]` → card highlight
- [ ] Step 2: buka URL langsung (tanpa lewat Step 1) → render benar dari DB
- [ ] Step 2 PUBLISHED: form disabled, tidak ada tombol publish, ada notice read-only
- [ ] Step 2: dokumen tanpa pipeline result (admin desa) → hanya tampilkan form publish, tidak error
- [ ] Document queue: klik "Lanjut review data" (PROCESSING) → navigate ke Step 2
- [ ] Document queue: klik "Lihat hasil" (PUBLISHED) → navigate ke Step 2 read-only
- [ ] Mobile 375px: Step 2 tidak horizontal scroll, primary action terlihat jelas

---

## Output yang Harus Dilaporkan ke Owner/Rangga

Sebelum merge, siapkan laporan berisi:

1. Branch name
2. List file dibuat, dimodifikasi, dihapus
3. Screenshot desktop Step 2 (mode PROCESSING dan PUBLISHED)
4. Screenshot mobile Step 2 (375px)
5. QA result (tsc, lint, build, manual)
6. Known limitations jika ada

Tunggu approval owner/Rangga sebelum merge ke `main`.

---

## Acceptance Criteria

- [ ] Step 2 ada di URL tersendiri: `/internal-admin/intake/[documentId]`
- [ ] Setelah pipeline sukses → navigate otomatis ke Step 2 URL (bukan tetap di `/internal-admin/intake`)
- [ ] Step 2 bisa dibuka langsung dari document queue (tanpa lewat Step 1)
- [ ] Step 2 menampilkan diff + coverage + validation jika dokumen dari intake pipeline
- [ ] Step 2 menampilkan form publish untuk semua dokumen (termasuk yang tanpa pipeline result)
- [ ] Tombol "Publikasikan sekarang" → publish → redirect ke document queue + card highlight animasi
- [ ] Tombol "Tandai gagal" → `MarkFailedModal` → konfirmasi → redirect ke document queue + card highlight animasi
- [ ] Status PUBLISHED/FAILED → Step 2 read-only, form disabled
- [ ] Document queue: "Lanjut review data" → Step 2 editable
- [ ] Document queue: "Lihat hasil" (PUBLISHED) → Step 2 read-only
- [ ] `PublishModal` tidak lagi di-render di document queue
- [ ] File cleanup selesai: `DocumentPipelineView.tsx` dan `documents/[documentId]/review/` dihapus
- [ ] TypeScript bersih, lint bersih
- [ ] Mobile 375px comfortable

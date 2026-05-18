# Sprint 05 Intake Step 2 Standalone Review Page Report

Status: `IN_PROGRESS / UNCOMMITTED`
Date: `2026-05-18`
Branch: `main`
Task: `docs/bmad/tasks/sprint-05-intake-step2-standalone-review-page.md`

## Summary

Batch close-out untuk Intake Step 2 sekarang sudah menutup tiga kebutuhan inti:

1. `Intake Langkah 2` menjadi review surface final untuk keputusan `publish` atau `reject`.
2. Dokumen dari jalur `Admin Desa` sekarang punya snapshot review yang konsisten untuk dibuka di Step 2.
3. Internal admin fallback untuk status `WAITING_VERIFIED_APPROVAL` sekarang benar-benar aktif di backend, bukan hanya copy di UI.

Hasilnya:

- dokumen intake internal dan dokumen upload Admin Desa memakai format `aiMappingResult` yang sama untuk review page,
- review page `/internal-admin/intake/[documentId]` bisa dipakai sebagai jalur final keputusan,
- queue `/internal-admin/documents` tetap menjadi source of truth untuk daftar, filter, status, dan redirect focus sesudah aksi.

## Work Completed

### 1. Snapshot review Admin Desa distandarkan

Selesai.

Perubahan utama:

- upload `Admin Desa VERIFIED` sekarang langsung membentuk snapshot review saat file masuk,
- approval dokumen `Admin Desa LIMITED` oleh `Admin Desa VERIFIED` juga langsung membentuk snapshot review saat status berubah ke `PROCESSING`,
- loader Step 2 dan jalur upload/approve kini memakai util bersama:
  - `src/lib/internal-admin/document-pipeline-snapshot.ts`

Dampak:

- dokumen tidak lagi bergantung pada first-open behavior untuk mendapatkan bentuk data review,
- snapshot review lintas sumber dokumen menjadi konsisten,
- jika file tidak bisa diunduh/diekstrak parser lokal, sistem tetap membentuk snapshot minimal yang aman agar halaman review tidak pecah.

### 2. Fallback internal admin untuk `WAITING_VERIFIED_APPROVAL`

Selesai.

Perubahan utama:

- backend policy review sekarang menerima status:
  - `PROCESSING`
  - `WAITING_VERIFIED_APPROVAL`
- internal admin bisa:
  - membuka Step 2,
  - publish,
  - reject / mark failed,
  - melihat audit trail,
  meski dokumen belum disetujui `Admin Desa VERIFIED`

Dampak:

- jalur verified tetap menjadi prioritas governance,
- tetapi operasional tidak macet jika akun verified tidak tersedia,
- perilaku server sekarang selaras dengan niat bisnis fallback.

### 3. Satu review surface final

Selesai.

Perubahan utama:

- queue tetap dipakai sebagai daftar dan titik masuk review,
- keputusan final tetap dilakukan di `/internal-admin/intake/[documentId]`,
- sisa jalur review/publish lama yang masih tertinggal di queue dibersihkan:
  - `src/components/internal-admin/review-queue/PublishModal.tsx` dihapus
  - `src/components/internal-admin/review-queue/PublishFieldEditorList.tsx` dihapus
- copy queue dan Step 2 dirapikan agar tidak menimbulkan ilusi ada dua tempat keputusan.

## Files / Areas Touched

High-signal area yang berubah:

- `src/lib/internal-admin/document-pipeline-snapshot.ts`
- `src/lib/internal-admin/intake-review-page.ts`
- `src/app/api/admin-claim/documents/upload/route.ts`
- `src/app/api/admin-claim/documents/[documentId]/approve/route.ts`
- `src/lib/internal-admin/document-review-policy.ts`
- `src/lib/internal-admin/document-review-service.ts`
- `src/components/internal-admin/intake/IntakeReviewPage.tsx`
- `src/components/internal-admin/intake/IntakeFinalReviewSection.tsx`
- `src/components/internal-admin/InternalDocumentReviewQueue.tsx`
- `src/components/internal-admin/review-queue/DocCard.tsx`

Cleanup:

- `src/components/internal-admin/review-queue/PublishModal.tsx` deleted
- `src/components/internal-admin/review-queue/PublishFieldEditorList.tsx` deleted

## QA Result

### Static QA

Executed and passed:

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`
- `npm run build`

Notes:

- `npm run lint` masih memberi warning lama `.eslintignore` deprecated pada ESLint 9
- `npm run build` sempat terblokir lock Prisma Windows `query_engine-windows.dll.node`; ini resolved dengan menghentikan dev server lokal lalu menjalankan build ulang
- build tetap mengeluarkan warning lama di luar scope task ini:
  - Turbopack NFT warning dari `next.config.ts`
  - beberapa `P2024` revalidate public detail pages saat build

### Manual QA Status

Belum saya klaim selesai penuh karena belum dijalankan dengan login role nyata di browser untuk semua role.

Yang sudah tervalidasi dari sisi kode + static QA:

- format snapshot lintas jalur dokumen sudah konsisten,
- status `WAITING_VERIFIED_APPROVAL` tidak lagi diblokir backend untuk publish/reject internal admin,
- status terminal `PUBLISHED` dan `FAILED` tetap read-only di Step 2,
- queue tidak lagi menyisakan permukaan publish/review lama.

## Owner Test Checklist

### Internal Admin

- Buka `/internal-admin/documents`
- Pastikan dokumen `PROCESSING` membuka `/internal-admin/intake/[documentId]`
- Pastikan dokumen `WAITING_VERIFIED_APPROVAL` juga bisa dibuka ke halaman yang sama
- Dari Step 2 dokumen `PROCESSING`, klik `Publikasikan`
- Pastikan redirect kembali ke queue dan card highlight tetap berjalan
- Dari Step 2 dokumen `WAITING_VERIFIED_APPROVAL`, klik `Publikasikan`
- Pastikan publish sukses dan status berubah ke `PUBLISHED`
- Dari Step 2 dokumen `WAITING_VERIFIED_APPROVAL`, coba `Reject / tandai gagal`
- Pastikan status berubah ke `FAILED`
- Buka ulang dokumen `PUBLISHED` dan `FAILED`
- Pastikan halaman read-only

### Admin Desa VERIFIED

- Upload dokumen dari halaman dokumen Admin Desa
- Pastikan dokumen masuk dengan status `PROCESSING`
- Minta internal admin buka Step 2
- Pastikan diff/coverage/validation/preview review tampil tanpa menunggu first-open workaround
- Approve dokumen unggahan `LIMITED`
- Pastikan setelah approve dokumen siap dibuka di Step 2 oleh internal admin

### Admin Desa LIMITED

- Upload dokumen dari halaman dokumen Admin Desa
- Pastikan status awal `WAITING_VERIFIED_APPROVAL`
- Minta internal admin buka dokumen tersebut di Step 2
- Pastikan internal admin tetap bisa mengambil keputusan fallback bila diperlukan
- Jika dokumen ditolak, pastikan alasan gagal tampil jelas di daftar dokumen

## Remaining Carry-Over / Known Limits

Masih di luar scope close batch ini:

- OCR untuk dokumen scan/gambar
- browser QA end-to-end dengan sesi role nyata untuk semua skenario
- warning lama build terkait public revalidation pool timeout
- warning Turbopack NFT dari `next.config.ts`

Tidak ada blocker kode utama yang tersisa untuk tujuan batch ini selain manual role-based verification sebelum commit/push.

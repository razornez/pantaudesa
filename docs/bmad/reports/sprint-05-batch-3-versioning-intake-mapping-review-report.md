# Sprint 05 Batch 3 - Versioning, Intake, Mapping, Review Report

Tanggal: 2026-05-06  
Mode: accelerated feature batch  
Branch kerja: `main`

## Summary

Batch 3 sudah punya visible MVP flow yang bisa dites owner untuk intake dokumen/teks internal admin:

```text
upload/input -> extract -> mapping draft -> validate -> diff preview -> internal review workbench preview
```

Yang sudah benar-benar berjalan sekarang:

- halaman internal admin intake tersedia di `/internal-admin/intake`,
- upload dan paste text sudah masuk ke pipeline API,
- extractor untuk `TXT`, `DOCX`, `XLSX`, `PDF`, dan `CSV` sudah aktif,
- mapping draft heuristik untuk field Desa MVP sudah aktif,
- validasi field dasar sudah aktif,
- diff preview terhadap data `Desa` existing sudah aktif jika `desaId` diisi,
- submit ke review internal sudah aktif jika desa dipilih dan validasi lolos,
- hasil submit disimpan sebagai `AdminDesaDocument` status `PROCESSING` dengan salinan privat file/teks dan draft mapping,
- riwayat intake terbaru dan aktivitas audit ringan sekarang tampil di workbench,
- riwayat versi publik internal desa sekarang bisa dilihat dari workbench saat desa dipilih,
- setiap intake review sekarang membawa `versionCandidate` yang menunjukkan snapshot calon versi sebelum publish,
- runtime persistence untuk `VillageDataVersion` dan `DesaDataAuditEvent` sekarang sudah wired dengan fallback aman jika migration draft belum di-apply,
- workbench sekarang menampilkan badge yang menjelaskan apakah history/versioning sedang membaca tabel dedicated atau masih fallback ke audit lama,
- contoh dokumen valid/diff sekarang tersedia untuk test cepat via UI paste dan file fixture upload,
- guardrail no auto-publish tetap terjaga.

Yang belum selesai untuk Batch 3 penuh:

- migration apply + Prisma client regenerate untuk benar-benar mengaktifkan tabel `VillageDataVersion` dan `DesaDataAuditEvent`,
- belum ada direct publish action dari layar intake; publish tetap lewat antrean review internal,
- OCR belum dikonfigurasi,
- belum ada ingestion dari source pemerintah, baru feasibility/reference level.
- runbook operasi no-cost tersedia di `docs/bmad/runbooks/sprint-05-batch-3-no-cost-fallback-operations-runbook.md`

## Implemented vs Proposed

| Area | Status | Hasil |
|---|---|---|
| S05-010 Document Intake & Auto Mapping Adapter | implemented MVP | Upload/paste -> extraction -> mapping -> validation berjalan |
| S05-011 Structured Value Diff / Conflict Engine | implemented MVP | Diff preview antar field Desa berjalan jika `desaId` diisi |
| S05-012 Internal Data Review Workbench | implemented MVP | UI preview + submit ke review internal tersedia di `/internal-admin/intake` |
| S05-008 Village Data Versioning | partial | Submit review/draft save/publish sekarang sudah punya runtime persistence path ke `VillageDataVersion`, publish tetap menulis snapshot before/after + nomor versi internal ke audit log, history versi bisa membaca tabel dedicated jika migration aktif, dan schema draft masih menunggu apply |
| S05-009 General Data Audit Trail | partial | Submit intake, draft save, publish, dan mark failed sekarang sudah punya runtime persistence path ke `DesaDataAuditEvent`, dengan fallback ke `AdminClaimAudit` jika migration belum aktif |
| Public government source availability spike | documented only | Mengacu ke feasibility task/report Batch 2, belum ada adapter/integration |
| OCR for scanned PDF/image | evaluated, deferred | Failure disurface eksplisit, tidak diam-diam gagal |

## Code Outcome

File/area utama yang membentuk MVP saat ini:

- `src/app/internal-admin/layout.tsx`
  - nav internal admin sudah menampilkan entry `Intake`
- `src/app/internal-admin/intake/page.tsx`
  - page workbench aktif
- `src/app/internal-admin/intake/loading.tsx`
  - loading state tersedia
- `src/components/internal-admin/IntakeWorkbench.tsx`
  - UI input, hasil ekstraksi, validasi, mapping evidence, diff preview, submit ke review internal, dan riwayat intake ringan
- `src/app/api/internal-admin/intake/route.ts`
  - pipeline POST server-side
- `src/app/api/internal-admin/intake/submit-review/route.ts`
  - submit eksplisit ke antrean review internal sebagai `PROCESSING`
- `src/app/api/internal-admin/intake/history/route.ts`
  - riwayat submission intake + aktivitas audit ringan untuk workbench
- `src/app/api/internal-admin/desa-version-history/route.ts`
  - riwayat versi publik internal desa berbasis snapshot audit
- `src/lib/intake/pipeline.ts`
  - helper pipeline bersama untuk preview, submit-review, dan pembentukan `versionCandidate`
- `src/lib/versioning/desa-versioning.ts`
  - helper normalisasi snapshot, pembentukan `versionCandidate`, dan perhitungan field yang berubah
- `prisma/schema.prisma`
  - draft model `VillageDataVersion` + enum status sudah ditambahkan, belum diaplikasikan
- `prisma/migrations/20260506093000_sprint_05_008_village_data_version_draft/migration.sql`
  - draft migration lokal untuk owner review, belum di-apply ke DB
- `src/lib/intake/extractors.ts`
  - extractor `txt/docx/xlsx/pdf/csv`
- `src/lib/intake/auto-mapping.ts`
  - mapping heuristik berbasis regex
- `src/lib/intake/validation.ts`
  - rule validasi awal
- `src/lib/intake/diff-engine.ts`
  - diff terstruktur berbasis `jsondiffpatch`

Follow-up fix yang dikerjakan saat review ini:

- memperbaiki parsing `desaId` di `src/app/api/internal-admin/intake/route.ts`
- sebelumnya diff mencoba membaca body kedua kali melalui `req.clone().json()` setelah body sudah dikonsumsi
- sekarang `desaId` dibaca aman dari `FormData` atau JSON body pada parse awal, sehingga diff preview bisa benar-benar muncul pada upload maupun paste mode
- menyambungkan hasil intake ke antrean dokumen internal lewat route submit-review baru
- memperbaiki server page antrean dokumen agar `aiMappingResult` ikut dikirim ke review queue/publish modal
- memperbaiki tombol `Draft` di antrean dokumen agar membuka draft yang nyata, bukan sekadar refresh diam-diam
- memperbaiki bug `window is not defined` di antrean dokumen dengan menghapus ketergantungan `window.location` saat render
- menambahkan snapshot versioning internal saat publish (`before/after` + `versionNumber`)
- menambahkan `versionCandidate` pada hasil intake/review agar calon versi terlihat sebelum publish
- menyiapkan draft schema/migration lokal untuk `VillageDataVersion` tanpa mengubah DB shared/production
- menyederhanakan UX flow: intake diposisikan sebagai langkah siapkan bahan, antrean dokumen diposisikan sebagai `review data`, dan publish final dipindahkan sebagai keputusan di dalam modal review

## Libraries Installed / Evaluated

Library yang sudah ada di `package.json` untuk Batch 3:

| Library | Status | Penggunaan |
|---|---|---|
| `mammoth` | used | ekstraksi `DOCX` |
| `xlsx` | used | ekstraksi `XLSX` menjadi teks/csv sheet |
| `pdf-parse` | used | ekstraksi `PDF` teks |
| `jsondiffpatch` | used | diff field-level preview |
| `papaparse` | installed, not currently used | belum dipakai karena CSV cukup dibaca sebagai plain text |

Catatan seleksi:

- pilihan library sudah cukup untuk visible MVP intake tanpa menambah kompleksitas layanan eksternal,
- tidak ada package OCR yang dipasang pada batch ini,
- tidak ada AI/LLM package baru untuk mapping,
- keputusan ini menjaga batch tetap low-risk dan testable.

## OCR Result

Status OCR: belum diaktifkan.

Hasil:

- image/scanned input tidak diproses diam-diam,
- API mengembalikan error terstruktur yang menjelaskan OCR belum dikonfigurasi,
- UI tetap mengarahkan user ke dokumen teks atau paste text.

Keputusan:

- ini aman untuk MVP karena owner masih bisa menguji flow inti dengan `DOCX`, `PDF` teks, `TXT`, `CSV`, `XLSX`, atau paste text,
- OCR sebaiknya masuk batch lanjutan setelah owner menyetujui tradeoff dependency/performance/akurasi.

## Public Source Availability Result

Batch 3 tidak melakukan scraping atau integrasi source pemerintah.

Status saat ini:

- source feasibility tetap mengacu ke `docs/bmad/tasks/sprint-05-006a-government-data-source-feasibility.md`,
- shortlist source tetap:
  - SID Kemendesa IDM
  - SID Kemendesa Profil
  - SID Kemendesa Dana Desa
  - Satu Data Indonesia / jumlah penduduk desa
  - API wilayah hanya untuk helper administratif, bukan source of truth

Kesimpulan:

- source pemerintah sudah cukup untuk referensi roadmap source registry,
- belum ada ingestion/runtime adapter di batch ini,
- ini sesuai guardrail karena belum ada approval untuk scraping/integration.

## Versioning Result

Status: partial, but runtime path is now wired.

Temuan:

- schema saat ini punya `Desa`, `DataSource`, dan model turunan publik lain,
- model `VillageDataVersion` sekarang sudah didraft di schema + migration lokal, tetapi belum diapply,
- publish sekarang menulis snapshot `beforeSnapshotJson` dan `afterSnapshotJson` ke `AdminClaimAudit`,
- tiap publish sekarang mendapat `versionNumber` internal yang tersimpan di metadata audit,
- intake/review sekarang menyimpan `versionCandidate` yang memotret base snapshot + proposed snapshot,
- workbench bisa menampilkan riwayat versi publik internal untuk desa terpilih,
- submit ke review, save draft review, dan publish sekarang sudah mencoba sinkron ke tabel `VillageDataVersion` jika tabel itu tersedia,
- route riwayat versi desa sekarang memprioritaskan tabel `VillageDataVersion` bila migration sudah aktif, lalu fallback ke audit snapshot lama bila belum.

Kesimpulan:

- Batch 3 sekarang sudah punya fondasi version history internal berbasis audit-backed snapshots plus calon versi review,
- lifecycle dedicated `VillageDataVersion` sudah disiapkan di runtime, tetapi aktivasi nyata masih menunggu apply migration + Prisma generate yang saat ini ke-block di mesin Windows ini.

## Audit Trail Result

Status: partial, but dedicated event path is now wired.

Temuan:

- existing `AdminClaimAudit` masih fokus admin-claim/admin-verification flow,
- submit intake ke review sekarang menulis event `INTERNAL_INTAKE_SUBMITTED`,
- workbench sekarang menampilkan activity feed ringan berbasis audit event intake/review,
- publish data desa sekarang juga menyimpan snapshot audit terstruktur (`beforeSnapshotJson` / `afterSnapshotJson`),
- route submit intake, draft save, publish, dan mark failed sekarang juga mencoba menulis ke tabel dedicated `DesaDataAuditEvent` jika tabel tersedia,
- route riwayat intake sekarang memprioritaskan `DesaDataAuditEvent` lalu fallback ke `AdminClaimAudit` agar transisi aman,
- model dedicated audit event sudah didraft di schema + migration lokal, tetapi belum diapply.

Kesimpulan:

- gap arsitektur dedicated audit trail sudah jauh mengecil,
- tetapi aktivasi penuh tetap menunggu apply migration + Prisma generate yang saat ini belum bisa dituntaskan di environment ini.

## Diff Engine Result

Status: implemented MVP.

Hasil:

- diff membandingkan current public `Desa` fields dengan incoming mapped fields,
- field yang dicakup:
  - `websiteUrl`
  - `kategori`
  - `tahunData`
  - `jumlahPenduduk`
  - `kecamatan`
  - `kabupaten`
  - `provinsi`
- output menampilkan `added`, `updated`, `removed`, dan `unchanged`,
- UI hanya menampilkan perubahan yang relevan.

Fix penting:

- parsing `desaId` sudah diperbaiki supaya diff tidak gagal hanya karena body request sudah terpakai saat parse awal.

## Review Workbench Result

Status: implemented MVP.

Yang bisa dilakukan sekarang:

1. Internal Admin membuka `/internal-admin/intake`
2. Memilih `Upload file` atau `Tempel teks`
3. Memilih desa opsional dari daftar hasil pencarian untuk membandingkan dengan data existing
4. Menjalankan pipeline
5. Melihat:
   - metadata ekstraksi
   - hasil validasi
   - mapping evidence
   - diff preview
6. Jika preview sudah oke, klik `Submit ke review internal`
7. Membuka antrean review di `/internal-admin/documents?status=PROCESSING`
8. Klik `Draft` jika ingin membuka draft mapping untuk dicek atau dilengkapi
9. Gunakan `Review data` sebagai pintu utama di antrean, lalu pilih `Simpan dulu` atau `Publikasikan sekarang` dari dalam modal review
10. Lihat panel `Riwayat Versi Desa` untuk desa yang dipilih

Sample test aid yang tersedia:

- tombol `Isi contoh valid` pada mode paste,
- tombol `Isi contoh diff` pada mode paste,
- file fixture upload:
  - `public/testing/intake/contoh-dokumen-valid.txt`
  - `public/testing/intake/contoh-dokumen-diff.txt`
  - `public/testing/intake/contoh-dokumen-valid.csv`

Yang belum ada:

- direct publish action dari layar intake,
- `VillageDataVersion`,
- audit trail umum data desa yang terpisah dari audit claim,
- OCR.

## QA Result

Hasil QA pada state code saat report ini dibuat:

| Command | Result | Note |
|---|---|---|
| `npm run lint` | PASS | hanya warning lama `.eslintignore` |
| `npx tsc --noEmit` | PASS | tidak ada type error |
| `npx prisma generate` | BLOCKED | gagal `EPERM` Windows pada engine file / path lock |
| `npm run build` | BLOCKED | build gagal karena `prisma generate` gagal dengan `EPERM` rename engine |

Detail blocker Prisma/build:

- di sandbox: `EPERM: operation not permitted, lstat 'C:\\Users\\IWANKU~1'`
- di luar sandbox: `EPERM` rename `src/generated/prisma/query_engine-windows.dll.node.tmp...`

Interpretasi:

- lint dan TypeScript menyatakan fitur Batch 3 ini compile-safe pada level source,
- blocker build saat ini masih issue environment/file-lock Prisma di Windows, bukan error logic TypeScript pada feature intake.

## Belum Complete dan Alasannya

Hal-hal berikut masih belum bisa disebut selesai penuh pada Batch 3 ini:

- `VillageDataVersion` belum aktif sebagai persistence nyata di database.
  Alasan: saat ini baru tersedia dalam bentuk schema draft, migration draft, dan runtime fallback. Migration tidak di-apply ke DB aktif agar tetap mengikuti guardrail no-cost dan no shared DB change.
- `DesaDataAuditEvent` dedicated table belum aktif di database.
  Alasan: histori saat ini masih mengandalkan fallback yang aman ke audit lama karena migration dedicated audit juga belum di-apply.
- versioning masih `fallback-backed`, belum full `table-backed immutable history`.
  Alasan: jalur runtime sudah disiapkan, tetapi aktivasi penuh bergantung pada migration apply + Prisma client regenerate yang masih tertahan.
- OCR untuk PDF scan/image belum diaktifkan.
  Alasan: implementasi OCR akan butuh dependency atau service tambahan, pengujian akurasi, dan potensi biaya/infra baru. Batch ini sengaja hanya menampilkan failure message yang jelas.
- status `build PASS` penuh belum tercapai.
  Alasan: `npm run build` masih gagal di langkah `prisma generate` karena issue Windows `EPERM`, bukan karena source feature intake/review tidak type-safe.

## Belum Bisa Dikerjakan Sekarang

Hal-hal berikut belum bisa ditutup pada state project dan guardrail saat report ini dibuat:

- aktivasi tabel `village_data_versions` dan `desa_data_audit_events` di DB aktif,
- verifikasi end-to-end write ke tabel versioning dan audit baru,
- OCR dokumen scan/image,
- penutupan QA build production penuh sampai `PASS`.

Alasan penahan utama:

- owner meminta jalur no-cost 100%, jadi tidak boleh ada branch database berbayar atau perubahan schema ke shared DB aktif,
- environment Windows saat ini masih memblokir `prisma generate` melalui error `EPERM`,
- belum ada dependency atau service OCR yang disetujui untuk dipasang.

## Guardrails Check

Guardrails tetap respected:

- tidak ada auto-publish parser/OCR/AI/admin-desa output,
- tidak ada bypass auth internal admin,
- tidak ada DB write dari intake pipeline,
- tidak ada migration atau schema apply,
- tidak ada production env change,
- tidak ada restricted/private/BNBA data access,
- tidak ada logging document content penuh, token, atau secret,
- parser/OCR/source-access failure tidak disembunyikan.

## What Owner Should Test

Owner test minimum yang disarankan:

1. Buka `/internal-admin/intake`
2. Pilih desa dari daftar pencarian agar diff bisa terlihat lebih jelas
3. Coba mode `Tempel teks` dengan tombol:
   - `Isi contoh valid`
   - `Isi contoh diff`
4. Atau upload fixture dari:
   - `public/testing/intake/contoh-dokumen-valid.txt`
   - `public/testing/intake/contoh-dokumen-diff.txt`
   - `public/testing/intake/contoh-dokumen-valid.csv`
5. Jika ingin manual paste, bisa pakai contoh:

```text
Website: https://desa-maju.id
Jumlah Penduduk: 2450 jiwa
Tahun Data: 2024
Kategori Desa: Mandiri
Kecamatan: Cibungbulang
Kabupaten: Bogor
Provinsi: Jawa Barat
```

6. Klik `Jalankan pipeline`
7. Expected:
   - muncul section ekstraksi
   - muncul field mapping yang terdeteksi
   - validasi muncul dan tidak error untuk contoh valid
   - jika desa dipilih, diff preview muncul
   - ada guardrail note bahwa preview tidak mem-publish data
8. Lanjut klik `Submit ke review internal`
9. Expected:
   - item review berhasil dibuat
   - muncul link ke antrean review
   - item baru terlihat di `/internal-admin/documents?status=PROCESSING`
   - tidak ada publish otomatis
10. Klik tombol `Draft` pada item `PROCESSING`
11. Expected:
   - draft mapping langsung terbuka
   - jika item intake sudah punya mapping awal, field terisi otomatis
   - jika belum ada draft, sistem membuat draft dulu lalu langsung membukanya
12. Setelah publish sukses, buka lagi `/internal-admin/intake` dan pilih desa yang sama
13. Expected:
   - panel `Riwayat Versi Desa` menampilkan versi terbaru
   - field yang berubah terlihat sebagai before vs after

Owner test file-based:

1. Upload salah satu file teks yang aman:
   - `.docx`
   - `.xlsx`
   - `.pdf` berbasis teks
   - `.txt`
   - `.csv`
2. Klik `Jalankan pipeline`
3. Expected:
   - parser metadata tampil
   - hasil mapping/validasi tampil
   - tidak ada crash

Negative test yang penting:

1. Upload image/scanned doc
2. Expected:
   - muncul error jelas bahwa OCR belum dikonfigurasi
   - jangan ada hasil palsu seolah parsing sukses

3. Coba input tanpa file atau tanpa text
4. Expected:
   - tampil error validasi input

5. Coba pilih desa valid dari daftar
6. Expected:
   - diff preview benar-benar muncul jika desa ditemukan

Yang tidak boleh terjadi:

- data publik berubah otomatis,
- publish terjadi otomatis dari halaman intake,
- error diam-diam tanpa pesan,
- log menampilkan isi dokumen penuh, token, DB URL, atau data sensitif lain.

Yang perlu owner share balik:

- screenshot halaman hasil pipeline,
- file type yang dicoba,
- apakah diff muncul saat `desaId` diisi,
- pesan error jika ada,
- potongan log server jika muncul error runtime.

## Short Report For Rangga And Owner

```text
Sprint 05 Batch 3 saat ini sudah punya visible MVP intake workbench di /internal-admin/intake.

Yang sudah jalan:
- upload/paste text
- extraction untuk DOCX/XLSX/PDF/TXT/CSV
- heuristic mapping draft
- validation preview
- diff preview terhadap data Desa existing jika desaId diisi
- submit ke review internal ke antrean dokumen `PROCESSING`
- riwayat intake + aktivitas audit ringan tampil di workbench
- riwayat versi publik internal desa tampil saat desa dipilih
- guardrail no auto-publish tetap aman

Fix tambahan yang baru dibereskan:
- parsing desaId di API intake diperbaiki, jadi diff sekarang bisa bekerja untuk upload maupun paste mode
- hasil intake sekarang bisa benar-benar diserahkan ke review internal tanpa publish otomatis
- tombol Draft di queue sekarang membuka draft mapping yang bisa benar-benar diisi
- version history internal sekarang mulai tercatat saat publish dan bisa dilihat lagi dari workbench
- jalur persistence `VillageDataVersion` dan `DesaDataAuditEvent` sekarang sudah tersambung di code dengan fallback aman jika tabel draft belum aktif
- riwayat intake sekarang bisa membaca audit dedicated bila migration nanti diapply
- queue review sekarang memakai copy yang lebih decision-friendly, dan modal review memisahkan `nilai publik saat ini`, `isian draft saat ini`, dan `keputusan final admin`
- hasil intake sekarang juga punya `Ringkasan keputusan` dan `Apa yang terbaca utama`, jadi owner bisa lebih cepat memutuskan apakah hasilnya layak dikirim ke review

Yang masih belum selesai:
- aktivasi tabel dedicated masih menunggu apply migration + `prisma generate`
- publish final tetap lewat antrean dokumen internal, belum dari layar intake
- OCR belum aktif

QA:
- npm run lint: PASS
- npx tsc --noEmit: PASS
- npx prisma generate: BLOCKED, `EPERM` Windows saat `lstat C:\Users\IWANKU~1` di sandbox dan saat rename `query_engine-windows.dll.node` di luar sandbox
- npm run build: BLOCKED karena langkah `prisma generate` gagal terlebih dulu

Kesimpulan:
feature ini sudah cukup untuk owner test MVP pipeline intake, dan fondasi versioning/audit sekarang lebih dekat ke final. Batch 3 tetap belum bisa disebut full-complete karena aktivasi tabel dedicated masih tertahan di migration/generate, dan OCR belum ada.
```

## Copy-Paste Prompt For Rangga

```text
Rangga, tolong review Sprint 05 Batch 3 accelerated MVP di branch main, terutama flow intake internal admin.

Context:
- task BMAD: docs/bmad/tasks/sprint-05-batch-3-versioning-intake-mapping-review.md
- report implementasi: docs/bmad/reports/sprint-05-batch-3-versioning-intake-mapping-review-report.md

Fokus review:
1. apakah /internal-admin/intake sudah cukup visible dan testable untuk owner
2. apakah parser flow upload/paste -> extract -> mapping -> validate -> diff sudah aman
3. apakah submit ke review internal sekarang aman dan benar-benar masuk ke queue `PROCESSING`
4. apakah tidak ada auto-publish / DB write tersembunyi selain write yang memang eksplisit saat submit review
5. apakah diff desaId memang bekerja dan tidak lagi gagal karena request body dibaca dua kali
6. apakah guardrail auth, no secret logging, no PII exposure tetap aman
7. apakah gap versioning dan general audit trail masih didokumentasikan jujur sebagai carry-over
8. apakah bagian report tentang item belum complete, item yang belum bisa dikerjakan, dan alasannya sudah konsisten dengan state code saat ini

File utama:
- src/app/api/internal-admin/intake/route.ts
- src/app/api/internal-admin/intake/submit-review/route.ts
- src/components/internal-admin/IntakeWorkbench.tsx
- src/app/internal-admin/documents/page.tsx
- src/lib/intake/extractors.ts
- src/lib/intake/pipeline.ts
- src/lib/intake/auto-mapping.ts
- src/lib/intake/validation.ts
- src/lib/intake/diff-engine.ts
- src/app/internal-admin/intake/page.tsx
- src/app/internal-admin/layout.tsx
- docs/bmad/reports/sprint-05-batch-3-versioning-intake-mapping-review-report.md

QA status saat ini:
- npm run lint: PASS
- npx tsc --noEmit: PASS
- prisma generate/build: blocked Windows Prisma EPERM rename/file-lock

Catatan penting:
- Batch 3 belum full-complete di layer persistence database.
- `VillageDataVersion` dan `DesaDataAuditEvent` baru siap di code + schema/migration draft, tetapi belum diaktifkan ke DB karena guardrail no-cost dan tidak boleh menyentuh shared DB aktif.
- OCR untuk scan/image belum dikerjakan karena belum ada jalur dependency/service yang disetujui.
- build penuh masih terblokir oleh issue lokal Prisma Windows EPERM saat generate engine.

Tolong kasih output:
- findings dulu, urut severity
- file/path yang relevan
- regression risk
- explicit no critical findings kalau memang aman
- note apakah feature ini layak owner-test walau Batch 3 belum full selesai
```

## Copy-Paste Prompt For Owner

```text
Owner, Sprint 05 Batch 3 sekarang sudah punya MVP intake workbench yang bisa dites di:

/internal-admin/intake

Yang perlu dites:
1. mode paste text
2. mode upload file (DOCX/XLSX/PDF teks/TXT/CSV)
3. pilih desa kalau mau lihat diff dan submit ke review

Contoh teks test:
Website: https://desa-maju.id
Jumlah Penduduk: 2450 jiwa
Tahun Data: 2024
Kategori Desa: Mandiri
Kecamatan: Cibungbulang
Kabupaten: Bogor
Provinsi: Jawa Barat

Klik:
- Jalankan pipeline

Expected result:
- ekstraksi tampil
- mapping field tampil
- validasi tampil
- diff tampil kalau desa valid dipilih
- ada catatan bahwa ini preview-only dan tidak publish otomatis
- setelah klik submit ke review, item baru masuk ke antrean dokumen `PROCESSING`

Yang juga perlu dicek:
- upload image/scanned doc harus gagal dengan pesan OCR belum dikonfigurasi
- tidak boleh ada publish otomatis
- tidak boleh ada perubahan data publik langsung dari halaman ini

Mohon kirim balik:
- screenshot hasil
- file type yang dicoba
- apakah diff muncul saat desaId diisi
- error message kalau ada
- log server singkat kalau pipeline gagal
```

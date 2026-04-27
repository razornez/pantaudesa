# Official Desa Data Source and Scraping Strategy

Date: 2026-04-27
Status: draft-for-owner-iwan-cto-review
Prepared-by: ChatGPT Freelancer / Rangga

## Context

Owner/komisaris menjelaskan bahwa PantauDesa belum memiliki data real official dari pihak desa. Menghubungi desa satu per satu tidak scalable. Arah yang diinginkan adalah mencari dan mengambil data dari sumber resmi yang sudah tersedia secara publik, seperti website desa, kecamatan, kabupaten, atau sumber resmi lain.

Dokumen ini dibuat sebagai jembatan antara:

- ide owner tentang pengumpulan data otomatis,
- issue #13 data automation pipeline,
- Sprint 03 Data Foundation,
- desain schema database yang akan datang.

## Main objective

Membuat strategi data source agar PantauDesa tidak hanya mengikuti bentuk `src/lib/mock-data.ts`, tetapi siap menerima data real dari official website desa/kecamatan/kabupaten dengan status data yang aman dan bisa diverifikasi.

Target utama:

> Data boleh mulai dari hasil discovery/scraping/import, tetapi tidak boleh langsung dianggap verified. Semua data harus punya source, status, dan jalur review.

## Why this matters for schema

Schema Sprint 03 tidak boleh hanya dibuat berdasarkan mock data UI saat ini.

Realita data official website bisa berbeda:

- Ada desa yang punya website aktif.
- Ada desa yang tidak punya website.
- Ada website yang hanya berisi profil desa.
- Ada website yang punya dokumen APBDes dalam PDF.
- Ada website yang punya Excel/CSV.
- Ada yang hanya gambar hasil scan.
- Ada yang update terakhirnya lama.
- Ada yang link dokumennya rusak.
- Ada data yang sama tapi beda format antar desa.

Karena itu, schema perlu mendukung:

- source registry,
- raw snapshot,
- extracted/staging data,
- review status,
- published/verified data,
- source URL,
- crawl/check timestamp,
- confidence/manual note,
- status data per section.

## Recommended phased approach

## Phase 0 — Manual source discovery

Goal:

Membuktikan dulu apakah official website desa/kecamatan/kabupaten cukup tersedia dan punya data yang bisa dipakai.

Scope awal:

- 1 kecamatan atau 1 kabupaten dulu.
- 5–20 desa sebagai pilot.

Output:

- daftar desa,
- official website desa jika ada,
- website kecamatan/kabupaten terkait,
- jenis data yang tersedia,
- catatan apakah data layak diproses.

Data yang dicari:

- nama desa,
- kecamatan,
- kabupaten,
- provinsi,
- website official,
- profil desa,
- dokumen APBDes,
- dokumen realisasi,
- dokumen RKPDes/RPJMDes,
- kontak/perangkat desa jika publik,
- tanggal update halaman/dokumen,
- sumber data.

## Phase 1 — Source registry

Goal:

Mencatat semua sumber sebelum scraping/import dilakukan.

Draft fields source registry:

- `id`
- `scopeType`: `desa`, `kecamatan`, `kabupaten`, `provinsi`, `national`, `other`
- `scopeName`
- `desaId` optional
- `sourceName`
- `sourceUrl`
- `sourceType`: `official_website`, `official_document`, `pdf`, `excel`, `html`, `api`, `manual`, `other`
- `discoveredAt`
- `lastCheckedAt`
- `robotsPolicy` optional
- `accessStatus`: `unknown`, `allowed`, `blocked`, `requires_manual_review`, `unreachable`
- `dataAvailability`: `none`, `profile_only`, `documents_only`, `budget_summary`, `budget_detail`, `mixed`
- `notes`
- `dataStatus`: `imported`, `needs_review`, `verified`, `outdated`, `rejected`

Reason:

Sebelum data masuk model publik, tim harus tahu sumbernya dari mana dan apakah layak dipakai.

## Phase 2 — Raw snapshot

Goal:

Menyimpan bukti mentah dari apa yang diambil agar bisa diaudit ulang.

Draft raw snapshot fields:

- `id`
- `sourceId`
- `url`
- `contentType`: `html`, `pdf`, `excel`, `csv`, `image`, `json`, `text`, `unknown`
- `fetchedAt`
- `httpStatus`
- `contentHash`
- `storagePath` or `rawText`
- `title` optional
- `detectedYear` optional
- `notes`
- `processingStatus`: `new`, `parsed`, `failed`, `ignored`, `needs_manual_review`

Reason:

Hasil crawling/scraping jangan langsung hilang. Raw snapshot membantu debugging, reprocessing, dan audit.

## Phase 3 — Extracted/staging data

Goal:

Memisahkan data hasil ekstraksi dari data yang sudah publish.

Draft staging entities:

### `StagedDesaProfile`

- `id`
- `sourceId`
- `snapshotId`
- `nama`
- `kecamatan`
- `kabupaten`
- `provinsi`
- `websiteUrl`
- `alamat` optional
- `email` optional
- `telepon` optional
- `extractedAt`
- `confidenceScore` optional
- `reviewStatus`: `needs_review`, `approved`, `rejected`
- `reviewNotes`

### `StagedBudgetDocument`

- `id`
- `sourceId`
- `snapshotId`
- `desaId` optional
- `documentName`
- `documentType`: `apbdes`, `realisasi`, `rkpdes`, `rpjmdes`, `lppd`, `other`
- `year` optional
- `documentUrl`
- `fileType`
- `publishedAt` optional
- `extractedAt`
- `reviewStatus`
- `reviewNotes`

### `StagedBudgetRecord`

- `id`
- `sourceId`
- `snapshotId`
- `desaId` optional
- `year`
- `fieldName`
- `value`
- `unit`
- `rawText`
- `confidenceScore`
- `reviewStatus`
- `reviewNotes`

Reason:

Data hasil scraping/import raw belum tentu benar. Staging menjaga agar data salah tidak langsung tampil ke publik.

## Phase 4 — Published data model

Model publik yang sudah dibahas di Sprint 03 tetap relevan, tetapi perlu ditambah hubungan ke source/staging.

Recommended published models:

- `Desa`
- `AnggaranDesaSummary`
- `APBDesItem`
- `DokumenPublik`
- `DataSource`

Additional recommendation:

- published models harus punya `sourceId` optional,
- `dataStatus` wajib,
- `verifiedAt` optional,
- `verifiedBy` optional jika nanti ada admin/reviewer,
- `lastCheckedAt` optional,
- `sourceSnapshotId` optional jika ingin audit detail.

## Data status lifecycle

Recommended lifecycle:

1. `demo`
   - Data dummy/mock/seed untuk demo.
   - Tidak boleh dianggap official.

2. `imported`
   - Data berhasil masuk dari website/file/manual source.
   - Belum dicek.

3. `needs_review`
   - Data menunggu verifikasi manusia.
   - Cocok untuk hasil scraping, parsing PDF, atau OCR.

4. `verified`
   - Data sudah dicek dan layak tampil sebagai data yang dipercaya.

5. `outdated`
   - Data pernah valid, tetapi sudah melewati periode update.

6. `rejected`
   - Data salah, tidak relevan, tidak boleh tampil, atau sumbernya tidak layak.

Important rule:

> Imported data must never be treated as verified automatically.

## Scraping ethics and safety rules

Scraping harus dilakukan secara bertanggung jawab.

Rules:

- Cek robots.txt atau akses policy jika tersedia.
- Jangan membebani website desa kecil.
- Gunakan rate limit rendah.
- Jangan ambil data pribadi/sensitif yang tidak relevan.
- Jangan bypass login, paywall, captcha, atau access control.
- Jangan scrape data yang jelas-jelas tidak diperuntukkan publik.
- Simpan source URL dan waktu akses.
- Jangan tampilkan hasil scraping sebagai official verified tanpa review.
- Beri disclaimer jika data masih imported/needs_review.

Recommended rate limit awal:

- Manual/prototype: sangat rendah, misalnya 1 request per beberapa detik.
- Jangan crawling nasional.
- Mulai dari pilot kecil.

## Technical risks

### 1. Website structure inconsistency

Banyak website desa memakai template berbeda. Selector HTML tidak bisa dianggap sama.

Mitigation:

- Mulai dengan source discovery.
- Kelompokkan source type.
- Buat parser per pattern/source type, bukan satu scraper universal.

### 2. PDF and scanned images

APBDes bisa berbentuk PDF/image hasil scan.

Mitigation:

- Simpan sebagai `DokumenPublik` dulu.
- Jangan memaksa extract angka jika parsing belum stabil.
- Gunakan `needs_review` untuk hasil OCR/parsing.

### 3. Stale data

Website desa bisa jarang update.

Mitigation:

- Simpan `lastCheckedAt` dan `detectedYear`.
- Gunakan status `outdated` jika data terlalu lama.

### 4. Broken links / unreachable websites

Banyak website desa bisa down atau link dokumen rusak.

Mitigation:

- Catat `accessStatus`.
- Jangan hapus source langsung.
- Coba lagi dengan jadwal aman.

### 5. Legal/ethical ambiguity

Tidak semua website punya policy jelas.

Mitigation:

- Gunakan data publik yang jelas tersedia.
- Hindari data personal.
- Gunakan manual review untuk sumber ragu.

## Product risks

### Data misunderstood as accusation

Jika data imported langsung tampil, warga/media bisa menganggap itu official dan membuat tuduhan.

Mitigation:

- Tampilkan `Data impor` atau `Perlu review`.
- Gunakan disclaimer.
- Hindari copy menuduh.

### Schema too UI-driven

Jika schema hanya mengikuti mock UI, real source akan sulit masuk.

Mitigation:

- Tambahkan source registry, raw snapshot, staging, data status.

### Overbuilding scraper too early

Langsung bikin scheduler/scraper nasional akan berisiko tinggi.

Mitigation:

- Pilot 1 kecamatan/1 kabupaten.
- Manual discovery first.
- Parser kecil per source type.

## Recommended pilot plan

### Pilot target

Pilih salah satu:

- 1 kecamatan yang punya banyak website desa aktif, atau
- 1 kabupaten yang punya portal data/dokumen desa cukup rapi.

Selection criteria:

- Banyak desa punya website official.
- Ada dokumen publik yang bisa diakses.
- Struktur website relatif konsisten.
- Tidak butuh login.
- Tidak terlalu berat diakses.

### Pilot output

- 5–20 desa discovered.
- Source registry filled manually.
- Minimal dokumen publik/link source tercatat.
- Status tiap source jelas.
- Decision apakah Sprint 03 mulai dari:
  - DB-backed demo only,
  - source registry first,
  - CSV/manual import first,
  - scraping prototype first,
  - hybrid.

## Sprint 03 schema implications

Before changing `prisma/schema.prisma`, answer these questions:

1. Apakah `DataSource` wajib masuk Sprint 03 minimal?
2. Apakah `RawSourceSnapshot` masuk Sprint 03 atau Sprint 04?
3. Apakah staging table masuk sekarang atau cukup docs dulu?
4. Apakah `DokumenPublik` harus bisa menyimpan URL/file type/source status?
5. Apakah `AnggaranDesaSummary` boleh dibuat tanpa verified source?
6. Apakah `dataStatus` wajib di semua model publik?
7. Apakah source-level status dan record-level status dipisah?
8. Apakah UI boleh menampilkan imported data, atau hanya verified/demo?
9. Siapa reviewer data sebelum status verified?
10. Apa fallback jika source website tidak tersedia?

## Recommendation from Rangga

Jangan langsung mulai coding scraper.

Urutan terbaik:

1. Rapikan Sprint 02 closure dan issue tracking.
2. Owner/Iwan pilih pilot wilayah.
3. Buat manual source discovery table/list.
4. Finalkan schema dengan mempertimbangkan source registry and data status.
5. Implement DB-backed demo data.
6. Baru buat scraper/import prototype kecil.
7. Hasil scraper masuk staging/needs_review, bukan publish langsung.

## Relation to existing issues

Related issues:

- #13 Sprint 2 data automation pipeline.
- #4 Phase 3 data model/admin/import.
- #3 Phase 2 trust layer/data disclaimer.
- #11 team operating system.

Recommended issue update:

- #13 should link this doc and be marked `discovery-in-progress`.
- #4 should not start schema until source strategy is reviewed.
- #3 should include data status display for `imported` and `needs_review` later.

## Final note for owner

Arah owner untuk menggunakan official website desa sebagai sumber data adalah benar dan scalable, tetapi harus dibangun bertahap. Kunci utamanya bukan hanya scraper, melainkan data governance:

- source jelas,
- raw data tersimpan,
- extracted data direview,
- published data punya status,
- user tidak salah memahami data.

Initiated-by: Owner / Komisaris
Reviewed-by: Pending Owner/Iwan/CTO
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-owner-iwan-cto-review

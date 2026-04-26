# Data Automation and Scheduler Analysis

## Status

Draft / discovery note.

Dokumen ini **bukan instruksi implementasi Sprint 2**. Dokumen ini hanya mencatat analisa awal Iwan terkait ide automation/scheduler agar data PantauDesa tidak perlu diinput manual satu per satu.

Sprint yang sedang difokuskan tetap Sprint 1 sampai benar-benar beres.

## Background

Ada ide agar data desa tidak dimasukkan manual satu per satu melalui CRUD admin. Secara produk, ini masuk akal karena PantauDesa akan sulit scale jika semua data desa, APBDes, dokumen publik, dan metadata harus diinput manual.

Namun scheduler/scraper tidak boleh langsung dikerjakan sebelum pondasi data kuat.

## Main conclusion

Scheduler **belum boleh langsung dikerjakan sebagai fitur utama** sebelum beberapa pondasi selesai:

1. Skema data final.
2. Prisma model.
3. Supabase/database structure.
4. Source registry.
5. Raw snapshot strategy.
6. Staging table.
7. Data status lifecycle.
8. Admin review/approval flow.
9. Policy untuk data demo/imported/verified.
10. Risk review terkait scraping.

Tanpa pondasi ini, scheduler akan rawan menjadi script liar yang sulit diaudit, sulit diverifikasi, dan berisiko membuat data salah tampil ke publik.

## Why scheduler should not start first

### 1. Source data tidak seragam

Website desa/kecamatan/kabupaten bisa berbeda-beda:

- Ada yang HTML biasa.
- Ada yang PDF.
- Ada yang Excel.
- Ada yang gambar hasil scan.
- Ada yang tidak update.
- Ada yang memakai CMS berbeda.
- Ada yang tidak punya struktur data konsisten.

Kalau scraper dibuat sebelum tahu pola sumbernya, implementasi akan cepat rapuh.

### 2. Data hasil scraping belum tentu benar

Data yang berhasil diambil belum otomatis valid.

Risiko:

- Angka salah baca.
- Dokumen lama dianggap baru.
- Nama desa mirip tertukar.
- Tahun anggaran salah.
- Data draft dianggap resmi.
- Dokumen tidak lengkap.

Karena itu hasil scraping harus masuk staging dan review dulu, bukan langsung publish.

### 3. Legal dan etika scraping perlu dicek

Website desa kecil bisa punya server lemah. Scheduler terlalu sering bisa membebani.

Perlu aturan:

- Cek robots.txt/terms jika tersedia.
- Rate limit rendah.
- Prefer weekly schedule dulu.
- Simpan hash untuk deteksi perubahan agar tidak download ulang terus.
- Jangan scrape agresif.

### 4. Admin tetap dibutuhkan sebagai reviewer

Automation tidak menghapus peran admin.

Automation mengubah peran admin dari:

> input manual satu per satu

menjadi:

> review, verify, approve, reject, dan koreksi data hasil import/scraping.

## Required foundation before scheduler

## 1. Data schema

Minimal entity yang perlu dirancang:

- Desa
- Wilayah administratif
- APBDes item
- Pendapatan desa
- Realisasi anggaran
- Dokumen publik
- Perangkat desa
- Riwayat tahunan
- Skor transparansi
- Data source
- Raw snapshot
- Import batch
- Staging record
- Verification/audit log

## 2. Source registry

Scheduler harus membaca daftar sumber dari table/config, bukan hardcoded di script.

Contoh field:

- id
- sourceName
- sourceType
- url
- wilayahTarget
- desaId optional
- frequency
- lastCheckedAt
- lastSuccessAt
- lastHash
- status
- notes

Source type contoh:

- desa_website
- kecamatan_page
- kabupaten_open_data
- pdf_document
- excel_download
- manual_upload

Status source contoh:

- active
- paused
- broken
- needs_review
- blocked

## 3. Raw snapshot

Sebelum data diparse, simpan snapshot mentah.

Tujuan:

- Audit.
- Debug.
- Re-parse jika parser diperbaiki.
- Bukti dari mana data berasal.

Snapshot bisa berisi:

- raw HTML
- PDF URL
- downloaded file metadata
- content hash
- screenshot/manual evidence jika perlu
- fetchedAt

## 4. Staging table

Data hasil import/scrape masuk staging dulu.

Status staging:

- imported
- needs_review
- approved
- rejected
- duplicate
- outdated

Data staging tidak langsung tampil publik.

## 5. Data status lifecycle

Data publik harus punya status jelas:

- demo
- imported
- needs_review
- verified
- rejected
- outdated

Makna:

- demo: data ilustrasi/mock.
- imported: data berhasil masuk dari sumber.
- needs_review: menunggu admin cek.
- verified: sudah dicek dan boleh tampil sebagai verified.
- rejected: tidak layak tampil.
- outdated: data lama atau perlu update.

## 6. Admin review flow

Admin minimal bisa:

- melihat batch import,
- melihat sumber data,
- membandingkan raw snapshot dan hasil parse,
- approve,
- reject,
- edit minor,
- memberi catatan.

## 7. Audit log

Semua perubahan data penting harus tercatat:

- siapa yang approve,
- kapan,
- sumbernya apa,
- field apa yang berubah,
- status sebelumnya dan sesudahnya.

## Recommended sequence

### Step 0 — Finish Sprint 1 first

Sprint 1 tetap prioritas:

- Auth UX.
- Civic narrative.
- Responsibility guide.
- Badge MVP.
- Workflow/status tracking.

### Step 1 — Data architecture design

Belum implement scheduler.

Output:

- Prisma/Supabase schema proposal.
- Source registry design.
- Data status lifecycle.
- Staging and audit design.

### Step 2 — Manual import / CSV MVP

Sebelum scraping, lebih aman mulai dengan import CSV/manual upload.

Kenapa:

- Format data lebih bisa dikontrol.
- Data pipeline bisa diuji.
- Admin review flow bisa dibuat dulu.
- Tidak ada risiko scraping website pihak lain.

### Step 3 — Source registry MVP

Buat daftar sumber data dan metadata.

Belum perlu scrape otomatis penuh.

### Step 4 — One-source scraper prototype

Pilih satu sumber yang stabil.

Misalnya:

- satu kecamatan,
- satu kabupaten,
- atau satu website desa yang strukturnya jelas.

Target awal bukan APBDes detail kompleks, tetapi metadata ringan:

- nama desa,
- URL website,
- daftar dokumen,
- tanggal update,
- link dokumen.

### Step 5 — Scheduler MVP

Scheduler baru masuk setelah:

- source registry ada,
- raw snapshot ada,
- staging ada,
- review flow ada,
- satu scraper prototype stabil.

Scheduler awal cukup weekly.

## Recommended architecture flow

```txt
SourceRegistry
  ↓
Fetcher / Importer
  ↓
RawSnapshot
  ↓
Parser / Extractor
  ↓
StagingRecord
  ↓
Admin Review
  ↓
Verified Public Data
  ↓
AuditLog
```

## What should not be done yet

- Jangan langsung scraping nasional.
- Jangan langsung publish hasil scraping.
- Jangan membuat scheduler tanpa source registry.
- Jangan membuat parser banyak tipe sumber sekaligus.
- Jangan memakai OCR sebagai core MVP.
- Jangan membuat admin CRUD besar sebelum jelas data lifecycle.

## Proposed future issues

Nanti setelah Sprint 1 selesai, bisa dibuat issue terpisah:

1. Design Prisma/Supabase data schema.
2. Design source registry.
3. Design data status lifecycle.
4. Build CSV/manual import MVP.
5. Build staging review flow.
6. Prototype one-source scraper.
7. Add scheduler MVP.

## Current decision

Scheduler/data automation **dicatat sebagai strategic direction**, tetapi tidak dieksekusi dulu.

Fokus terdekat tetap:

> Bereskan Sprint 1, lalu masuk ke Sprint 2 dengan wording simplification dan data trust/disclaimer. Data automation masuk discovery/architecture setelah pondasi Sprint 1 stabil.

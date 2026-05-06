# Sprint 05 Batch 3 No-Cost Fallback Operations Runbook

## Purpose
Menjalankan MVP intake, review, publish, dan history Batch 3 tanpa biaya tambahan dan tanpa perubahan schema ke database aktif.

## Current Safe State
- Flow intake/review/publish sudah bisa dipakai owner test.
- Runtime path untuk `VillageDataVersion` dan `DesaDataAuditEvent` sudah ada di code.
- Database aktif belum diubah.
- Migration draft masih lokal:
  - `prisma/migrations/20260506093000_sprint_05_008_village_data_version_draft/migration.sql`
  - `prisma/migrations/20260507114500_sprint_05_009_desa_data_audit_event_draft/migration.sql`
- UI sekarang menampilkan apakah history dibaca dari tabel dedicated atau masih fallback ke audit lama.

## Zero-Cost Rules
- Jangan buat Supabase branch baru.
- Jangan restore sandbox Supabase jika tidak benar-benar perlu.
- Jangan apply migration ke project aktif tanpa approval owner terpisah.
- Jangan jalankan operasi yang memicu biaya background pada Supabase.

## What Works In Fallback Mode
- `/internal-admin/intake`
  - upload/paste
  - extraction
  - mapping draft
  - validation
  - diff preview
  - submit ke review internal
- `/internal-admin/documents?status=PROCESSING`
  - review data
  - simpan draft
  - publish
  - mark failed
- `Riwayat Intake & Aktivitas`
  - tetap tampil dari `AdminClaimAudit` jika tabel `DesaDataAuditEvent` belum aktif
- `Riwayat Versi Desa`
  - tetap tampil dari snapshot audit publish jika tabel `VillageDataVersion` belum aktif

## New UI Indicators
- `Mode audit dedicated aktif`
  - artinya `DesaDataAuditEvent` sudah aktif dan panel intake history membacanya langsung
- `Mode fallback audit`
  - artinya panel intake history masih membaca `AdminClaimAudit`
- `Mode versioning dedicated aktif`
  - artinya `VillageDataVersion` sudah aktif dan panel version history membacanya langsung
- `Mode fallback versioning`
  - artinya panel version history masih membaca snapshot audit publish lama

## Owner Test Checklist In No-Cost Mode
1. Buka `/internal-admin/intake`
2. Pilih desa target
3. Gunakan sample paste atau upload fixture
4. Jalankan pipeline
5. Pastikan hasil mapping, validasi, diff, dan `Calon Versi Publik` tampil
6. Submit ke review internal
7. Buka antrean review dari link yang muncul
8. Simpan draft review atau publish
9. Kembali ke intake dan cek:
   - `Riwayat Intake & Aktivitas`
   - `Riwayat Versi Desa`
10. Perhatikan badge mode:
   - jika masih fallback, itu expected selama migration belum diaktifkan

## Expected Behavior While Migration Is Not Active
- Publish tetap berjalan.
- History tetap tampil.
- Versioning tetap terlihat ke user melalui snapshot audit.
- Tidak ada error hanya karena tabel dedicated belum ada.
- Badge fallback tetap muncul sebagai pengingat bahwa DB activation belum dijalankan.

## When To Leave No-Cost Mode
Keluar dari mode ini hanya jika semua kondisi berikut terpenuhi:
- owner menyetujui perubahan schema database,
- target database yang dipakai sudah jelas,
- ada jendela verifikasi setelah migration,
- ada acceptance bahwa langkah ini mungkin tidak lagi 100% no-cost.

## Recommended Activation Order Later
1. Aktifkan migration `VillageDataVersion`
2. Aktifkan migration `DesaDataAuditEvent`
3. Jalankan `prisma generate`
4. Verifikasi badge berubah dari fallback ke dedicated
5. Uji publish, draft save, mark failed, dan history read

## Rollback Mindset
Selama masih no-cost mode:
- rollback tidak perlu karena DB aktif tidak berubah
- jika ada issue UI/API, cukup perbaiki code fallback tanpa menyentuh schema

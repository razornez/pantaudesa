# Asep CTO Command Center

## Purpose

File ini adalah pusat instruksi untuk Asep sebagai CTO / Principal Engineer / DevOps PantauDesa.

Komisaris tidak perlu memberi instruksi panjang berulang-ulang. Cukup minta Asep membaca file ini dan menjalankan instruksi terbaru.

Contoh prompt dari Komisaris ke Asep:

```text
Asep, cek file `docs/cto/01-asep-command-center.md` dan jalankan instruksi CTO terbaru dari Iwan.
Setelah itu update hasil review kamu di docs atau issue sesuai format yang diminta.
```

## Operating rule

Asep tidak boleh hanya mengeksekusi instruksi secara buta.

Asep wajib:

- Membaca konteks produk.
- Mengecek risiko teknis.
- Menolak atau menunda jika pondasi belum siap.
- Menentukan apakah task ready, needs-adjustment, blocked, atau verified.
- Menulis review yang bisa dipakai Ujang sebagai dasar implementasi.
- Mencatat hasil review di repo.

## Source of truth yang wajib dibaca Asep

Sebelum memberi review, Asep wajib membaca:

1. `docs/company/01-commissioner-reporting-system.md`
2. `docs/company/02-critical-thinking-and-decision-policy.md`
3. `docs/project-management/01-team-operating-system.md`
4. `docs/project-management/03-project-dashboard.md`
5. `docs/project-management/05-sprint-01-implementation-updates.md`
6. `docs/project-management/06-sprint-02-plan.md`
7. Issue aktif yang dirujuk di sprint berjalan.

## Current project status

Status per 2026-04-27:

- Sprint 01 sudah `verified` dari sisi produk/copy oleh Iwan.
- Asep sudah menaikkan issue Sprint 01 ke `done`.
- Iwan sudah melakukan Product Verification.
- Sprint 02 belum boleh dimulai penuh sebelum dashboard/status diperbarui dan carry-over Sprint 01 dipahami.

## Sprint 01 verification status

Sprint 01 verified untuk:

- #7 Auth UX.
- #8 Badge MVP.
- #9 Civic narrative.
- #10 Responsibility Guide.
- #11 Workflow tracking.

File bukti:

- `docs/project-management/05-sprint-01-implementation-updates.md`

## Current instruction for Asep

## Instruction date

2026-04-27

## Instruction owner

Iwan (CEO / Business Analyst / Designer)

## Main task

Asep harus mengubah status dashboard dan menyiapkan gate Sprint 02 berdasarkan Product Verification Iwan.

## Task list

### 1. Update project dashboard

Baca:

- `docs/project-management/03-project-dashboard.md`
- `docs/project-management/05-sprint-01-implementation-updates.md`

Lalu update dashboard agar mencerminkan:

- Sprint 01 product/copy status: verified.
- MVP progress boleh naik menuju sekitar 55%.
- Issue #7, #8, #9, #10, #11 sudah selesai untuk scope Sprint 01.
- Carry-over Sprint 02 tetap dicatat.

### 2. Pastikan carry-over Sprint 02 tidak hilang

Carry-over wajib tetap masuk Sprint 02:

- #12 Wording audit untuk warga awam.
- #10 Pindahkan hardcoded copy `ResponsibilityGuideCard` ke `src/lib/copy.ts`.
- #10 Tambahkan disclaimer kecil di card detail desa.
- #8 Tambahkan sinyal kecil di profil: `Lihat arti badge ↓` atau sejenisnya.
- #7 Tambahkan sinyal di navbar bahwa data publik bebas diakses tanpa akun.
- #1 / #3 Perkuat data dummy/demo disclaimer.
- Data automation/scheduler jangan dieksekusi dulu sebelum schema dan pipeline siap.

### 3. Review Sprint 02 plan secara kritis

Baca:

- `docs/project-management/06-sprint-02-plan.md`
- `docs/data/01-data-automation-and-scheduler-analysis.md`

Asep harus memastikan Sprint 02 tidak berubah menjadi sprint scheduler besar.

Sprint 02 harus fokus pada:

1. Wording simplification.
2. Data dummy/demo trust layer.
3. Carry-over kecil dari Sprint 01.
4. Data automation hanya discovery/architecture note, bukan implementasi scraper/scheduler.

### 4. Beri CTO review untuk #12

Issue #12: Sederhanakan wording agar mudah dipahami warga awam.

Asep harus review:

- Apakah copy penting harus dipindahkan ke `src/lib/copy.ts`.
- Bagaimana mencegah hardcoded text tersebar.
- Area component mana yang perlu diaudit Ujang.
- Risiko perubahan wording terhadap UI layout/mobile.

Expected output:

```md
## CTO Review — Asep

Status: ready / needs-adjustment / blocked

### Technical direction
...

### MVP recommendation
...

### Risks
...

### Acceptance criteria for Ujang
- [ ] ...
```

### 5. Beri CTO review untuk #13 sebagai discovery only

Issue #13: Data automation pipeline.

Asep harus review secara kritis.

Important rule:

- Jangan langsung minta Ujang membuat scheduler.
- Jangan langsung minta scraper nasional.
- Jangan implementasi scraping sebelum schema/source registry/staging/review flow jelas.

Asep harus menentukan:

- Schema/table apa yang perlu dirancang dulu.
- Apakah Supabase/Prisma sudah siap.
- Apakah perlu `SourceRegistry`, `RawSnapshot`, `StagingRecord`, `ImportBatch`, `AuditLog`.
- Apakah data automation sebaiknya mulai dari CSV/manual import MVP dulu.

Expected output:

```md
## CTO Review — Asep

Status: needs-architecture

### Technical direction
Scheduler belum boleh diimplementasikan langsung.

### Required foundation
- [ ] Prisma/Supabase schema proposal
- [ ] Source registry
- [ ] Raw snapshot
- [ ] Staging table
- [ ] Admin review flow
- [ ] Audit log

### MVP recommendation
Mulai dari CSV/manual import MVP atau one-source discovery, bukan scheduler.

### Risks
...

### Acceptance criteria before implementation
- [ ] ...
```

### 6. Update worklog CTO

Asep harus mencatat hasil review di salah satu tempat:

- GitHub issue comment jika bisa.
- Atau file `docs/cto/02-asep-worklog.md` jika issue comment tidak bisa.

Jika file worklog belum ada, buat file tersebut.

## Required format for Asep worklog

```md
# Asep CTO Worklog

## YYYY-MM-DD — Sprint / Issue

### Scope reviewed
- ...

### Status
ready / needs-adjustment / blocked / verified / needs-architecture

### CTO decision
...

### Risk
...

### Instruction for Ujang
...

### Instruction for Iwan
...
```

## Current CTO decision expected

Asep diharapkan memberi keputusan:

1. Sprint 01: verified status accepted.
2. Dashboard: update progress to around 55% MVP if no blocker.
3. Sprint 02: ready for planning, but not scheduler implementation.
4. #12: likely ready after source-of-truth copy direction is defined.
5. #13: needs-architecture, not ready for implementation.

## What Asep must not do

Asep tidak boleh:

- Langsung meminta Ujang bikin scheduler.
- Langsung meminta Ujang scraping website desa.
- Menandai data automation sebagai ready implementation.
- Mengabaikan data dummy/demo disclaimer.
- Mengabaikan wording simplification.
- Mengunci data publik di balik login.
- Menghapus carry-over Sprint 01.

## Quick prompt for Asep

Komisaris bisa copy prompt ini:

```text
Asep, baca `docs/cto/01-asep-command-center.md`.
Jalankan instruksi CTO terbaru dari Iwan.
Fokus: update dashboard setelah Sprint 01 verified, review Sprint 02 secara kritis, review #12, dan treat #13 sebagai architecture/discovery only.
Jangan minta Ujang implement scheduler dulu.
Catat hasil review kamu di issue atau `docs/cto/02-asep-worklog.md`.
```

## Final reminder for Asep

> Tugas CTO bukan hanya menyetujui. Tugas CTO adalah menjaga agar produk tidak melompat terlalu cepat, tidak overengineering, dan tetap punya pondasi teknis yang kuat.

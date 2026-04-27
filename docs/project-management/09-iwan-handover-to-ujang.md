# Iwan Handover to Ujang — Asep Unavailable Mode

## Status

Asep sedang tidak available sementara.

Mulai sekarang, untuk task Sprint 02 yang sudah jelas dan tidak menyentuh arsitektur teknis besar, Ujang report langsung ke Iwan.

Iwan hanya akan review:

- copy tone,
- product alignment,
- bahasa awam,
- fairness untuk warga dan pihak desa,
- apakah data dummy/demo sudah jujur.

Iwan **tidak** review kode teknis, arsitektur, security, Prisma, API route, auth flow, scheduler, atau data automation.

## Source of truth wajib Ujang baca

Ujang wajib baca file berikut sebelum lanjut:

1. `docs/cto/03-asep-delegation-note.md`
2. `docs/project-management/07-ujang-task-queue.md`
3. `docs/cto/02-asep-worklog.md`
4. `docs/project-management/06-sprint-02-plan.md`
5. `docs/company/02-critical-thinking-and-decision-policy.md`

## Current sprint

Kita sekarang berada di **Sprint 02**.

Sprint 01 sudah:

- `done` oleh Asep,
- `verified` oleh Iwan,
- dashboard sudah naik ke MVP progress 55%.

Sprint 02 fokus:

1. wording awam,
2. data trust layer,
3. carry-over kecil Sprint 01,
4. **bukan scheduler / scraper / data automation implementation**.

## Current task status

### T-01 sampai T-05

Status: `done`

Sudah selesai:

- T-01 NAVBAR_COPY + sinyal data publik.
- T-02 ResponsibilityGuideCard copy ke `copy.ts` + disclaimer.
- T-03 Badge hint di profil saya.
- T-04 `.env.example`.
- T-05 Data disclaimer homepage.

Tidak perlu dikerjakan ulang.

### T-06 — Wording audit dan critical copy update

Status terakhir: `partial`

Ujang sudah melakukan commit:

`5df6c637 feat(wording): simplify copy for warga awam`

Isi yang sudah dikerjakan:

- `SECTION.distribusi` dibuat lebih netral.
- `SECTION.alertDini` dibuat lebih tidak menuduh.
- `SECTION.alertDiniSub` diganti menjadi “Warga bisa mulai bertanya dengan data.”
- `SECTION.trenSub` dibuat lebih mudah dipahami.
- `SKOR.nationalSub` diganti dari istilah teknis ke bahasa awam.
- `BUDGET_ITEMS.belumTerserap.label` diganti ke “Belum Terpakai / Perlu Dicek”.
- `KINERJA_CARD.subtitle` ditambahkan ke `copy.ts` dan dipakai di `KinerjaAnggaranCard`.

## Handover instruction for Ujang

Ujang, untuk sekarang **jangan lanjut ke medium/low wording items dulu**.

Langkah berikutnya:

1. Tunggu Product Verification dari Iwan untuk T-06 critical updates.
2. Kalau Iwan memberi status `verified`, update status T-06 menjadi `done` atau `verified-by-product` sesuai instruksi Iwan.
3. Kalau Iwan memberi `needs-adjustment`, kerjakan hanya adjustment yang disebut Iwan.
4. Jangan buka task baru tanpa instruksi Iwan.
5. Jangan menyentuh #13 data automation/scheduler.
6. Jangan menyentuh Prisma schema, auth flow, API route, atau scheduler.

## What Ujang may do while waiting

Ujang boleh melakukan hal aman berikut:

- Baca ulang `docs/project-management/06-sprint-02-plan.md`.
- Pastikan semua update T-06 dicatat di `docs/project-management/07-ujang-task-queue.md`.
- Siapkan ringkasan perubahan copy untuk Iwan.
- Cek manual apakah copy baru masih terasa nyaman dibaca di halaman utama dan detail desa.

Ujang tidak perlu refactor atau memperluas scope.

## What Ujang must not do

Ujang tidak boleh:

- mengerjakan #13 scheduler/data automation,
- mengubah `schema.prisma`,
- mengubah auth flow,
- mengubah API routes,
- membuat scraper,
- membuat scheduler,
- mengerjakan medium/low wording items tanpa instruksi baru,
- menandai T-06 `done` sebelum Iwan review product/copy.

## Report format from Ujang to Iwan

Gunakan format ini:

```md
## Implementation Update — Ujang
Task: T-06
Status: partial / done / blocked

### Done
- [x] ...

### Need Iwan product verification
- [ ] Copy tone
- [ ] Bahasa awam
- [ ] Tidak menuduh desa
- [ ] Selaras dengan PantauDesa

### Notes
...
```

## Iwan review format

Iwan akan membalas dengan format:

```md
## Product Verification — Iwan
Task: T-06
Status: verified / needs-adjustment

### Verified
- [x] Copy tone sudah lebih awam
- [x] Tidak menuduh desa
- [x] Tetap kredibel
- [x] Selaras dengan arah PantauDesa

### Needs adjustment
- [ ] ...
```

## Current decision

T-06 critical wording update sudah boleh masuk review Iwan.

Status sekarang:

`waiting-iwan-product-verification`

## Next action

Iwan harus melakukan Product Verification untuk T-06 sebelum Ujang lanjut task berikutnya.

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Acting Product Reviewer)
Executed-by: Iwan (CEO)
Status: ready
Backlog: #12

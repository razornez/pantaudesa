# Ujang Sprint 02 Batch A — Data Trust Layer

## Status

Ready for Ujang.

Asep sedang tidak available. Karena itu Batch A hanya berisi task aman yang tidak menyentuh arsitektur teknis besar.

## Kenapa dibuat batch

Agar Ujang tidak perlu menunggu instruksi kecil satu per satu. Ujang boleh mengerjakan semua task di Batch A sekaligus, lalu report sekali ke Iwan setelah selesai.

## Sprint

Sprint 02.

## Batch theme

> Bikin user paham bahwa data PantauDesa masih demo/ilustrasi, tanpa merusak trust produk.

## Scope yang boleh dikerjakan

Ujang boleh mengerjakan:

- UI/copy kecil.
- Disclaimer data demo.
- Data status badge sederhana.
- Konsistensi copy dari `src/lib/copy.ts`.
- Update task queue/worklog docs.

## Scope yang tidak boleh dikerjakan

Ujang tidak boleh:

- mengubah Prisma schema,
- mengubah Supabase/database,
- membuat API route baru,
- mengubah auth flow,
- membuat scraper,
- membuat scheduler,
- membuat data automation,
- membuat admin import,
- mengubah struktur data besar.

Kalau task terasa menyentuh area di atas, stop dan tandai `blocked`.

---

# Batch A tasks

## T-07 — Data Trust Notice di Detail Desa

**Status:** `ready`

**Backlog:** #3

### Goal

Halaman detail desa harus punya notice jelas bahwa sebagian data masih demo/ilustrasi.

### Requirements

- Tambahkan copy di `DATA_DISCLAIMER` pada `src/lib/copy.ts`:

```ts
export const DATA_DISCLAIMER = {
  short: "Data yang ditampilkan bersifat ilustrasi. Integrasi data resmi sedang disiapkan.",
  detailTitle: "Catatan tentang data desa ini",
  detailBody: "Sebagian data di halaman ini masih bersifat demo/ilustrasi untuk menguji pengalaman pengguna. Jangan gunakan data ini sebagai dasar tuduhan atau kesimpulan resmi sebelum ada sumber dan verifikasi yang jelas.",
  statusLabel: "Data demo",
} as const;
```

Jika `short` sudah ada, jangan duplikat. Tambahkan field baru saja.

### UI placement

Tampilkan notice di `/desa/[id]`:

- setelah header/ringkasan desa, atau
- sebelum card anggaran utama.

Isi minimal:

- badge kecil `Data demo`,
- title `Catatan tentang data desa ini`,
- body dari `DATA_DISCLAIMER.detailBody`.

### Done when

- [ ] Detail desa menampilkan data demo notice.
- [ ] Copy dari `copy.ts`.
- [ ] Tidak ada hardcoded copy di JSX.
- [ ] Tidak menyentuh schema/API/auth/scheduler.

---

## T-08 — Data Status Badge Copy

**Status:** `ready`

**Backlog:** #3

### Goal

Siapkan bahasa status data agar ke depan user bisa membedakan data demo, imported, dan verified.

### Requirements

Tambahkan ke `src/lib/copy.ts`:

```ts
export const DATA_STATUS_COPY = {
  demo: {
    label: "Data demo",
    description: "Data ilustrasi untuk menguji pengalaman pengguna.",
  },
  imported: {
    label: "Data impor",
    description: "Data diambil dari sumber tertentu dan masih perlu dicek.",
  },
  verified: {
    label: "Data terverifikasi",
    description: "Data sudah dicek sebelum ditampilkan ke publik.",
  },
} as const;
```

### Implementation note

Untuk Batch A, cukup siapkan copy dan gunakan status `demo` di detail desa.

Jangan bikin sistem status data beneran dulu.

### Done when

- [ ] `DATA_STATUS_COPY` tersedia di `copy.ts`.
- [ ] Detail desa memakai label `Data demo` dari source of truth.
- [ ] Tidak ada perubahan database.

---

## T-09 — Footer and Detail Disclaimer Consistency

**Status:** `ready`

**Backlog:** #3

### Goal

Disclaimer data demo harus konsisten antara homepage, detail desa, dan footer.

### Requirements

- Pastikan homepage tetap memakai `DATA_DISCLAIMER.short`.
- Pastikan detail desa memakai `DATA_DISCLAIMER.detailTitle/detailBody`.
- Pastikan footer memakai wording yang konsisten dengan `DATA_DISCLAIMER.short`.

### Done when

- [ ] Wording disclaimer tidak saling bertentangan.
- [ ] Semua tetap terdengar jujur tapi tidak membuat produk terlihat tidak kredibel.

---

## T-10 — Update Task Queue Report

**Status:** `ready`

**Backlog:** #11

### Goal

Setelah Batch A selesai, Ujang harus update status di task queue/worklog agar Iwan bisa review tanpa bertanya ulang.

### Requirements

Update salah satu:

- `docs/project-management/07-ujang-task-queue.md`, atau
- buat section report di commit/body.

Report format:

```md
## Implementation Update — Ujang
Batch: Sprint 02 Batch A
Status: partial / done / blocked

### Done
- [x] T-07 Data Trust Notice di Detail Desa
- [x] T-08 Data Status Badge Copy
- [x] T-09 Footer and Detail Disclaimer Consistency

### Need Iwan review
- [ ] Copy tone disclaimer
- [ ] Placement detail notice
- [ ] Apakah wording cukup jelas tanpa menakutkan user

### Blocker
- ...
```

---

# Suggested commit message

```txt
feat(trust): add data demo trust layer

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Copy)
Executed-by: Ujang (Programmer)
Status: partial
Backlog: #3 #12
```

# Report ke Iwan

Setelah selesai, Ujang report:

```text
Iwan, Sprint 02 Batch A sudah selesai.
Commit: [hash]
Done:
- T-07 Data trust notice di detail desa
- T-08 Data status copy
- T-09 Disclaimer consistency
- T-10 Task queue/report update
Perlu dicek:
- Copy tone disclaimer
- Placement notice di detail desa
```

# Iwan verification scope

Iwan hanya cek:

- copy tone,
- apakah user paham data masih demo,
- apakah tidak terlalu menakutkan,
- apakah tidak membuat data dummy terasa resmi,
- apakah selaras dengan PantauDesa.

# Stop condition

Ujang wajib stop dan tanya Iwan kalau perlu:

- ubah schema,
- ubah API,
- ubah auth,
- bikin scheduler,
- bikin scraper,
- bikin admin import.

Initiated-by: Iwan (CEO)
Reviewed-by: Iwan (Product Copy)
Executed-by: Iwan (CEO)
Status: ready
Backlog: #3 #12

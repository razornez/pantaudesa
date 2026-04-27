# Ujang Task Queue

Dokumen ini adalah antrian task aktif untuk Ujang.
Iwan atau Asep akan update file ini setiap sprint.
Ujang cukup baca file ini, kerjakan dari atas ke bawah, lalu update status.

Format status: `todo` → `in-progress` → `partial` → `done`

---

## ⚠️ Mode aktif: Asep sedang tidak available

Berlaku sampai ada pemberitahuan dari Iwan.

**Selama mode ini:**
- Ujang report langsung ke Iwan setelah setiap task selesai.
- Ujang tidak perlu menunggu CTO review untuk task yang instruksinya sudah lengkap di file ini.
- Jika ada keraguan teknis atau risiko yang tidak jelas, tulis di task sebagai `blocked` dan tanyakan ke Iwan.
- Iwan akan memutuskan sendiri atau menunggu Asep kembali.

**Cara report Ujang ke Iwan:**

```
Iwan, T-XX sudah selesai.
Branch: ujang/sprint2
Commit: [hash]
Done:
- [x] item 1
- [x] item 2
Perlu dicek: [tulis jika ada yang perlu review produk/copy dari Iwan]
```

---

## Cara kerja

1. Buka file ini.
2. Ambil task pertama yang statusnya `todo` atau `in-progress`.
3. Kerjakan sesuai instruksi.
4. Ubah status jadi `done` setelah selesai.
5. Commit dengan role trace.
6. Report ke Iwan dengan format di atas.
7. Lanjut ke task berikutnya.

Jika ada blocker, ubah status ke `blocked` dan tulis keterangan di kolom Notes.

---

## Antrian aktif — Sprint 02

### T-01 · NAVBAR_COPY — sinyal data publik
**Status:** `done`
**Backlog:** #7
**Branch:** `ujang/sprint2`

**File yang diubah:**
- `src/lib/copy.ts` — tambah konstanta
- `src/components/layout/Navbar.tsx` — pasang sinyal

**Instruksi:**

Tambahkan ke `src/lib/copy.ts`:

```typescript
export const NAVBAR_COPY = {
  publicDataNote: "Data publik bebas diakses",
} as const;
```

Di `src/components/layout/Navbar.tsx`, cari area render tombol login untuk user yang belum login. Tambahkan tepat sebelum tombol:

```tsx
{!user && !loading && (
  <span className="hidden sm:inline text-xs text-slate-400 mr-1">
    {NAVBAR_COPY.publicDataNote} ·
  </span>
)}
```

**Done when:**
- [x] Tampil di desktop saat belum login
- [x] Tidak tampil di mobile (`hidden sm:inline`)

**Commit:**
```
feat(navbar): add public data access signal

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: done
Backlog: #7
```

---

### T-02 · `ResponsibilityGuideCard` — pindah copy ke `copy.ts`
**Status:** `done`
**Backlog:** #10
**Branch:** `ujang/sprint2`

**File yang diubah:**
- `src/lib/copy.ts` — tambah konstanta
- `src/components/desa/ResponsibilityGuideCard.tsx` — ganti hardcode, tambah disclaimer

**Instruksi:**

Tambahkan ke `src/lib/copy.ts`:

```typescript
export const RESPONSIBILITY_CARD = {
  title:      "Tanyakan ke pihak yang tepat",
  body:       "Tidak semua masalah di wilayah desa menjadi kewenangan pemerintah desa. Lihat dulu apakah hal ini terkait APBDes, program desa, kewenangan kabupaten, provinsi, atau pusat agar pertanyaanmu lebih tepat sasaran.",
  cta:        "Lihat panduan kewenangan",
  disclaimer: "Panduan kewenangan bersifat umum. Detail perlu diverifikasi dengan sumber resmi.",
} as const;
```

Update `src/components/desa/ResponsibilityGuideCard.tsx`:
- Import `RESPONSIBILITY_CARD` dari `@/lib/copy`
- Ganti 3 hardcode string dengan konstanta
- Tambahkan disclaimer kecil di bawah card:

```tsx
<p className="mt-3 text-[10px] text-amber-700/70 leading-relaxed">
  {RESPONSIBILITY_CARD.disclaimer}
</p>
```

**Done when:**
- [x] Tidak ada string UI hardcode di JSX komponen
- [x] Disclaimer tampil di bawah card

**Commit:**
```
refactor(desa-detail): move card copy to source of truth

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: done
Backlog: #10
```

---

### T-03 · Badge hint di profil saya
**Status:** `done`
**Backlog:** #8
**Branch:** `ujang/sprint2`

**File yang diubah:**
- `src/app/profil/saya/page.tsx`

**Instruksi:**

Cari `<BadgePill badge={trustStats.badge} compact />` di sekitar baris 435. Tambahkan teks kecil tepat di bawahnya:

```tsx
<div className="text-right">
  <BadgePill badge={trustStats.badge} compact />
  <p className="text-[10px] text-slate-400 mt-0.5">Lihat arti ↓</p>
</div>
```

**Done when:**
- [x] Ada petunjuk visual kecil mengarah ke `BadgeMeaningCard` di bawah

**Commit:**
```
fix(badge): add visual hint to badge in profile

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: done
Backlog: #8
```

---

### T-04 · `.env.example`
**Status:** `done`
**Backlog:** #11
**Branch:** `ujang/sprint2`

**File yang dibuat:**
- `.env.example` di root project

**Instruksi:**

Buat file `.env.example` di root project (sejajar dengan `package.json`):

```bash
# NextAuth
AUTH_SECRET=
AUTH_URL=

# Database (Supabase / PostgreSQL)
DATABASE_URL=
DIRECT_URL=

# Resend (email)
RESEND_API_KEY=
RESEND_FROM=

# Sentry
SENTRY_DSN=

# Alert
ALERT_EMAIL=

# Debug (dev only, jangan set di production)
DEBUG_SECRET=
```

**Done when:**
- [x] File ada di root, tidak berisi nilai sensitif
- [x] Bisa di-commit (tidak masuk `.gitignore`)

**Commit:**
```
chore(env): add env.example for developer onboarding

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: done
Backlog: #11
```

---

### T-05 · Data disclaimer di homepage
**Status:** `done`
**Backlog:** #3
**Branch:** `ujang/sprint2`

**File yang diubah:**
- `src/lib/copy.ts` — tambah konstanta
- `src/app/page.tsx` — pasang disclaimer

**Instruksi:**

Tambahkan ke `src/lib/copy.ts`:

```typescript
export const DATA_DISCLAIMER = {
  short: "Data yang ditampilkan bersifat ilustrasi. Integrasi data resmi sedang disiapkan.",
} as const;
```

Di `src/app/page.tsx`, import `DATA_DISCLAIMER` dan tambahkan setelah komponen `<StatsCards>`:

```tsx
<p className="text-center text-xs text-slate-400 pb-2">
  {DATA_DISCLAIMER.short}
</p>
```

**Done when:**
- [x] Disclaimer tampil di homepage setelah stats cards
- [x] Copy dari `copy.ts`, tidak hardcode di JSX

**Commit:**
```
feat(trust): add data disclaimer to homepage

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: done
Backlog: #3
```

---

### T-06 · Wording audit — copy teknis ke bahasa awam
**Status:** `verified-by-product`
**Backlog:** #12
**Branch:** `ujang/sprint2`
**CTO Review:** `ready` — lihat `docs/cto/02-asep-worklog.md` section #12

**Kerjakan dalam dua langkah — jangan skip langkah 1:**

**Langkah 1 — Audit dulu, jangan ubah kode:**

Buka setiap halaman berikut dan tandai copy yang tidak bisa dipahami warga awam dalam 5 detik. Catat temuan di bagian "T-06 Findings" di bawah task ini sebelum mengubah apapun:

- Homepage: stats cards, alert dini, chart label, leaderboard
- Detail desa: APBDes section, skor transparansi, dokumen publik
- Footer disclaimer

Panduan wording ada di `docs/project-management/06-sprint-02-plan.md` — Track A. Wajib baca dulu.

**Langkah 2 — Update copy critical (Asep sudah approve):**

CTO Review: `ready`. Baca detail di `docs/cto/02-asep-worklog.md` — section R-02.

Kerjakan 6 item critical ini saja dulu. Item medium/low tunda ke Sprint 03.

**Item 1 — `SECTION.distribusi` di `src/lib/copy.ts`**
```typescript
// SEBELUM
distribusi:    "Berapa Banyak Desa yang Bermasalah?",
distribusiSub: "Proporsi desa berdasarkan kinerja penggunaan anggarannya",

// SESUDAH
distribusi:    "Berapa Desa yang Sudah Baik, dan Berapa yang Perlu Dicek?",
distribusiSub: "Gambaran desa berdasarkan seberapa banyak anggaran yang sudah digunakan",
```

**Item 2 — `SECTION.alertDini` + `alertDiniSub` di `src/lib/copy.ts`**
```typescript
// SEBELUM
alertDini:    "Desa yang Harus Kamu Perhatikan",
alertDiniSub: (n: number) => `${n} desa baru menggunakan kurang dari separuh anggarannya — warga perlu bertanya ke kepala desa`,

// SESUDAH
alertDini:    "Desa yang Perlu Dicek Lebih Dulu",
alertDiniSub: (n: number) => `${n} desa baru menggunakan kurang dari separuh anggarannya. Warga bisa mulai bertanya dengan data.`,
```

**Item 3 — `SECTION.trenSub` di `src/lib/copy.ts`**
```typescript
// SEBELUM
trenSub: "Akumulasi anggaran yang sudah dipakai vs total yang seharusnya dipakai sepanjang tahun",

// SESUDAH
trenSub: "Bandingkan uang desa yang tersedia dengan yang sudah digunakan tiap bulan",
```

**Item 4 — `STATS.nationalSub` di `src/lib/copy.ts`**

Cari baris dengan `"Komposit dari ketepatan laporan, kelengkapan dokumen, konsistensi serapan & responsivitas"`:
```typescript
// SEBELUM
nationalSub: "Komposit dari ketepatan laporan, kelengkapan dokumen, konsistensi serapan & responsivitas",

// SESUDAH
nationalSub: "Gabungan dari laporan tepat waktu, dokumen terbuka, penggunaan anggaran yang jelas, dan respons desa ke warga",
```

**Item 5 — `belumTerserap.label` di `src/lib/copy.ts`**

Cari `belumTerserap`:
```typescript
// SEBELUM
belumTerserap: { label: "Belum Jelas Penggunaannya" },

// SESUDAH
belumTerserap: { label: "Belum Terpakai / Perlu Dicek" },
```
⚠️ Setelah update, cek dua tempat tampil: homepage stats card dan detail desa.

**Item 6 — `KinerjaAnggaranCard` subtitle — pindah ke `copy.ts` dulu**

File: `src/components/desa/KinerjaAnggaranCard.tsx` baris ~23.
Tambahkan ke `src/lib/copy.ts`:
```typescript
export const KINERJA_CARD = {
  subtitle: "Riwayat dan rincian penggunaan uang desa: grafik, daftar kegiatan, hasil pembangunan, dan perubahan 5 tahun",
} as const;
```
Lalu di `KinerjaAnggaranCard.tsx`:
```tsx
import { KINERJA_CARD } from "@/lib/copy";
// Ganti:
// "Chart historis, APBDes per bidang, output fisik, tren 5 tahun"
// Dengan:
{KINERJA_CARD.subtitle}
```

**Done when:**
- [x] Findings dicatat di bawah (T-06 Findings) sebelum ada perubahan kode
- [x] 6 item critical diupdate di `copy.ts`
- [x] `KinerjaAnggaranCard` subtitle dipindah ke `copy.ts` dan diupdate
- [x] Mobile dicek setelah update — tidak ada overflow teks di card kecil untuk copy T-06 yang diubah
- [x] Copy tidak menuduh desa — verifikasi `distribusi`, `alertDini`, `belumTerserap`
- [x] Iwan review tone sebelum `done`

**T-06 Findings — isi di sini setelah audit:**

```
Audit dicatat sebelum perubahan kode. Status implementasi copy masih menunggu persetujuan Asep/Iwan atas findings ini.

Prioritas kritis untuk Langkah 2:
- Homepage stats cards: istilah "Rata-rata Penggunaan Anggaran" sudah lebih awam daripada "serapan", tetapi angka persentase belum langsung menjelaskan bahwa itu berarti "berapa banyak uang yang sudah dipakai dari total uang desa".
- Homepage skor nasional: "Rata-rata Keterbukaan Desa se-Indonesia" cukup jelas, tetapi subcopy "Komposit dari ketepatan laporan, kelengkapan dokumen, konsistensi serapan & responsivitas" terlalu teknis. Perlu diganti ke bahasa seperti "gabungan dari laporan tepat waktu, dokumen terbuka, penggunaan anggaran yang jelas, dan jawaban desa ke warga".
- Homepage alert dini: "Desa yang Harus Kamu Perhatikan" dan "warga perlu bertanya ke kepala desa" berpotensi terasa menekan/menuduh. Perlu dibuat lebih netral: "Desa yang perlu dicek lebih dulu" dan "warga bisa mulai bertanya dengan data".
- Homepage trend chart: "Akumulasi anggaran yang sudah dipakai vs total yang seharusnya dipakai sepanjang tahun" masih seperti laporan teknis. Perlu versi 5 detik: "Bandingkan uang yang tersedia dengan uang yang sudah digunakan tiap bulan".
- Homepage donut/distribusi: "Proporsi desa berdasarkan kinerja penggunaan anggarannya" masih teknis. Perlu bahasa: "Berapa desa yang sudah baik, perlu ditingkatkan, atau perlu dicek warga".
- Homepage leaderboard: "Berdasarkan serapan anggaran & transparansi" masih memakai istilah teknis. Perlu "berdasarkan uang yang sudah dipakai dan keterbukaan informasi".

Detail desa:
- Budget summary: label "Belum Jelas Penggunaannya" untuk sisa anggaran bisa terlalu menuduh. Perlu lebih netral: "Belum Terpakai / Perlu Dicek".
- Sumber pendapatan: "Pendapatan Asli Desa", "ADD", dan "retribusi" perlu penjelasan singkat yang lebih awam karena tidak semua warga tahu istilah tersebut.
- KinerjaAnggaranCard: "Kinerja & Rincian Anggaran" dan "Chart historis, APBDes per bidang, output fisik, tren 5 tahun" terlalu teknis dan campur bahasa Inggris. Perlu "Riwayat dan rincian uang desa" serta "grafik, daftar penggunaan APBDes, hasil yang seharusnya terlihat, dan perubahan 5 tahun".
- APBDes section: judul "Anggaran Ini Dipakai untuk Apa Saja?" sudah baik, tetapi subtitle "Rincian penggunaan per bidang" masih teknis. Perlu "dikelompokkan menurut jenis kegiatan desa".
- BudgetBarChart: "Perbandingan Anggaran & Realisasi", "Realisasi", dan "Selisih" perlu diterjemahkan/ditambah arti, karena ini istilah laporan keuangan.
- SeharusnyaAdaSection: "Berdasarkan regulasi Dana Desa & alokasi APBDes" terlalu formal. Perlu "berdasarkan aturan dana desa dan rencana anggaran desa".
- Skor transparansi: "ketepatan", "kelengkapan", "konsistensi", "responsif", dan "/100" cukup ringkas tetapi masih butuh kalimat bantu: "semakin tinggi, semakin mudah warga mendapat informasi".
- Dokumen publik: "Berdasarkan UU Desa No. 6/2014..." kredibel, tetapi perlu lebih awam dan tidak terlalu legalistik di layar kecil.
- Kelengkapan desa: "Aset, Fasilitas & Organisasi Masyarakat", "Total Nilai Aset Desa", "Omset/Tahun", "Perbandingan Modal vs Omset", "ROI visual" terlalu teknis untuk warga awam; minimal perlu subtitle penjelas.

Footer/disclaimer:
- Footer "Data bersifat ilustrasi. Integrasi data resmi sedang disiapkan." sudah cukup pendek dan aman.
- Detail desa note "Integrasi SIPD, OMSPAN & OpenData DJPK Kemenkeu" terlalu teknis. Perlu diberi arti atau diganti: "sistem data pemerintah dan data resmi Kemenkeu".

Scope implementasi awal yang disarankan:
- Fokus dulu ke `src/lib/copy.ts` untuk SECTION, STATS, SKOR, PENDAPATAN, BUDGET_ITEMS, DONUT_LABELS, DATA_DISCLAIMER, dan FOOTER.
- Lalu rapikan hardcoded copy paling kritis di `KinerjaAnggaranCard`, `BudgetBarChart`, `SeharusnyaAdaSection`, `TransparansiCard`, `KelengkapanDesa`, `DesaLeaderboard`, dan note detail desa.
- Jangan ubah struktur data atau visual besar di T-06; ini wording-only.
```

**Commit langkah 1 (audit saja):**
```
docs(wording): add T-06 audit findings for plain language review

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: in-progress
Backlog: #12
```

**Implementation Update — Ujang ke Iwan**

Status: verified-by-product

Done:
- [x] `SECTION.distribusi` dan `distribusiSub` dibuat lebih awam dan tidak menuduh.
- [x] `SECTION.alertDini` dan `alertDiniSub` dibuat lebih netral.
- [x] `SECTION.trenSub` diganti ke bahasa warga.
- [x] `SKOR.nationalSub` disederhanakan dari istilah komposit/responsivitas.
- [x] `BUDGET_ITEMS.belumTerserap.label` diganti menjadi `Belum Terpakai / Perlu Dicek`.
- [x] Subtitle `KinerjaAnggaranCard` dipindah ke `KINERJA_CARD` di `src/lib/copy.ts`.

Perlu dicek Iwan:
- [x] Tone final untuk `Desa yang Perlu Dicek Lebih Dulu`.
- [x] Apakah `Belum Terpakai / Perlu Dicek` sudah cukup netral untuk warga dan desa.
- [x] Apakah subtitle `KinerjaAnggaranCard` terlalu panjang di mobile.
- Catatan visual: screenshot mobile menunjukkan copy T-06 yang diubah aman, tetapi masih ada clipping horizontal lama di beberapa area lain seperti tombol download/detail desa dan beberapa card data. Itu di luar scope 6 item critical T-06.

**Product Verification — Iwan**

Task: T-06 critical wording update
Status: verified

Verified:
- [x] Copy tone sudah lebih awam.
- [x] Tidak menuduh desa.
- [x] Tetap kredibel.
- [x] Selaras dengan arah PantauDesa.

Notes:
- Critical scope T-06 ditutup sebagai `verified-by-product`.
- Medium/low wording items tetap ditunda sampai ada instruksi baru dari Iwan.
- Tidak ada task baru yang dibuka dari update ini.

**Commit langkah 2 (setelah update):**
```
feat(wording): simplify copy for warga awam

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: partial
Backlog: #12
```

---

## Implementation Update — Ujang

Batch: Sprint 02 Batch A
Status: partial

### Done
- [x] T-07 Data Trust Notice di Detail Desa
- [x] T-08 Data Status Badge Copy
- [x] T-09 Footer and Detail Disclaimer Consistency
- [x] T-10 Update Task Queue Report

### Need Iwan review
- [ ] Copy tone disclaimer
- [ ] Placement detail notice
- [ ] Apakah wording cukup jelas tanpa menakutkan user

### Blocker
- tidak ada

---

## Update status setelah semua T-01 sampai T-05 selesai

```
## Implementation Update — Ujang
Status: partial

### Done
- [x] T-01 NAVBAR_COPY + sinyal Navbar
- [x] T-02 ResponsibilityGuideCard copy ke copy.ts + disclaimer
- [x] T-03 Badge hint di profil saya
- [x] T-04 .env.example
- [x] T-05 Data disclaimer homepage

### Remaining
- Tidak ada remaining untuk T-06 critical scope.
- Medium/low wording items tetap ditunda sampai ada instruksi baru dari Iwan.

### Blocker
- tidak ada
```

---

## Selesai semua task?

Lapor ke Asep dan Iwan lewat update di file ini atau commit message.
Asep akan menaikkan status di dashboard dan membuka task berikutnya.

Prompt pendek untuk review:

```text
Asep, cek `docs/project-management/08-asep-review-queue.md` dan review item paling atas yang statusnya `needs-review`.
```

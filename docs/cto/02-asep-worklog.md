# Asep CTO Worklog

---

## 2026-04-27 — Sprint 02 R-01 + #12 + #13

### Scope reviewed

- R-01: T-01 sampai T-05 dari `07-ujang-task-queue.md`
- #12: Wording simplification untuk warga awam
- #13: Data automation pipeline — discovery only

---

## R-01 — Sprint 02 T-01 sampai T-05

### Status: `reviewed`

### Review per task

**T-01 NAVBAR_COPY** ✅
- `NAVBAR_COPY` ada di `copy.ts` dengan `as const`.
- Sinyal tampil di dalam `renderRight()` saat `!user`, dengan guard `!loading` agar tidak flicker.
- `hidden sm:inline` sudah ada — tidak tampil di mobile.
- Satu catatan kecil: guard kondisinya `if (!user)` bukan `if (!user && !loading)` di level luar. Ini berarti saat loading, komponen render `null` dulu sebelum `renderRight()` dipanggil. Behavior sudah benar, tidak ada bug.

**T-02 ResponsibilityGuideCard** ✅
- `RESPONSIBILITY_CARD` ada di `copy.ts` dengan `as const`.
- Tiga hardcode string sudah diganti konstanta.
- Disclaimer kecil `{RESPONSIBILITY_CARD.disclaimer}` sudah tampil di bawah card.
- Tidak ada string UI yang tersisa di JSX.

**T-03 Badge hint** ✅
- `"Lihat arti ↓"` tampil di bawah `BadgePill` di profil saya.
- Wrapped dalam `<div className="text-right">` — layout rapi.

**T-04 `.env.example`** ✅
- File ada di root, semua key tanpa nilai.
- `.gitignore` sudah diupdate dengan `!.env.example` agar file bisa di-commit meski ada pattern `.env*`.
- Ini cara yang benar — perlu whitelist eksplisit karena `.gitignore` biasanya exclude semua `.env`.

**T-05 Data disclaimer homepage** ✅
- `DATA_DISCLAIMER` ada di `copy.ts` dengan `as const`.
- Disclaimer tampil di `page.tsx` setelah `<StatsCards>`.
- Copy dari konstanta, tidak hardcode di JSX.

### Risiko

- Tidak ada risiko teknis dari T-01 sampai T-05. Semua perubahan kecil, stateless, dan tidak menyentuh logika apapun.
- Lint error yang dilaporkan Ujang (`OtpInput`, `use-countdown`, `SuaraWargaSection`, `desa-admin/dokumen`) adalah pre-existing — tidak dari Sprint 02. Konfirmasi: tidak perlu disentuh Sprint 02.

### Perlu diperbaiki

Tidak ada. T-01 sampai T-05 diterima.

### Rekomendasi berikutnya

T-06 Wording Audit boleh dibuka setelah Ujang baca CTO Review #12 di bawah.

---

## #12 — Wording Simplification

### Status: `ready`

### Technical direction

Tidak ada perubahan database, API, atau logika. Murni copy audit dan update `copy.ts`. Risiko paling nyata adalah wording baru yang terlalu panjang menyebabkan layout overflow di mobile — perlu dicek per komponen.

Prioritas audit berdasarkan visibility dan dampak warga awam:

1. Homepage stats cards — angka tanpa penjelasan
2. Alert dini section — copy "perlu diawasi" vs bahasa yang lebih keras
3. Detail desa APBDes section — istilah teknis anggaran
4. Chart/trend label — sumbu, legenda
5. Skor transparansi — metodologi tidak jelas
6. Auth login/register — sudah diupdate Sprint 01, tapi perlu dicek ulang
7. Footer disclaimer — sudah ada tapi perlu lebih prominent

### MVP recommendation

Ujang kerjakan dalam dua langkah:

**Langkah 1 — Audit:**
Buka setiap halaman dan tandai copy yang tidak bisa dipahami warga awam dalam 5 detik. Catat di `docs/project-management/07-ujang-task-queue.md` sebagai T-06 findings sebelum mengubah apapun.

**Langkah 2 — Update:**
Ubah copy yang paling kritis. Semua update wajib ke `copy.ts` dulu. Tidak boleh hardcode di JSX.

Panduan wording sudah ada di `docs/project-management/06-sprint-02-plan.md` — Track A. Ujang wajib baca sebelum mulai.

### Risks

- Layout risk: kalimat baru lebih panjang bisa overflow di card kecil. Ujang wajib cek mobile setelah update.
- Tone risk: bahasa terlalu santai bisa mengurangi kredibilitas untuk pengguna media/NGO. Jaga keseimbangan — sederhana tapi tetap serius.
- Scope creep: audit jangan berubah jadi redesign. Hanya ubah teks, bukan struktur komponen.

### Acceptance criteria for Ujang

- [ ] Audit selesai — findings dicatat di T-06 section `07-ujang-task-queue.md` sebelum ada perubahan kode
- [ ] Semua copy update masuk `copy.ts`, bukan hardcode di JSX
- [ ] Tidak ada istilah teknis tanpa penjelasan singkat di halaman utama
- [ ] Setiap angka di stats cards punya label yang menjelaskan maknanya
- [ ] Mobile dicek setelah setiap perubahan — tidak ada overflow teks
- [ ] Copy tidak menuduh desa, tetap netral
- [ ] Iwan review final sebelum status naik ke `done`

---

## #13 — Data Automation Pipeline

### Status: `needs-architecture` — tidak boleh diimplementasi Sprint 02

### Technical direction

Scheduler dan scraper **tidak boleh dikerjakan Ujang di Sprint 02**. Alasan sudah terdokumentasi lengkap di `docs/data/01-data-automation-and-scheduler-analysis.md`. Ringkasannya:

- Source data tidak seragam — HTML, PDF, Excel, gambar scan
- Data hasil scraping perlu staging dan review sebelum publish
- Legal dan etika scraping perlu dikaji
- Schema Prisma/Supabase belum final untuk data desa

Sprint 02 untuk #13 hanya boleh: **menulis architecture proposal**, bukan implementasi.

### Required foundation sebelum implementasi boleh dimulai

- [ ] Prisma schema final untuk model `Desa`, `APBDesItem`, `DokumenPublik`
- [ ] `SourceRegistry` — daftar sumber data per desa dengan URL, tipe, dan frekuensi update
- [ ] `RawSnapshot` — storage hasil scraping mentah sebelum diproses
- [ ] `StagingRecord` — record yang menunggu review admin
- [ ] `ImportBatch` — tracking satu batch import/scraping
- [ ] `AuditLog` — rekam jejak perubahan data
- [ ] Data status lifecycle: `demo` → `imported` → `needs_review` → `verified` / `rejected`
- [ ] Admin review flow UI — sebelum data publish

### MVP recommendation

Jangan mulai scraper. Mulai dari:

1. **CSV/manual import MVP** — admin upload CSV satu desa, sistem parse dan masuk staging
2. **Satu source, satu desa** — pilot dengan satu website desa yang strukturnya jelas
3. **Baru kemudian** scheduler mingguan untuk source yang sudah terbukti stabil

### Instruction for Ujang — Sprint 02

Ujang tidak mengerjakan apapun terkait #13 di Sprint 02.

Jika ada waktu setelah T-06 selesai, Ujang boleh membaca `docs/data/01-data-automation-and-scheduler-analysis.md` untuk konteks, tapi tidak ada implementasi.

### Instruction for Iwan

#13 perlu Sprint tersendiri setelah:
- Schema Prisma untuk Desa final
- Admin import flow minimal ada
- Source registry dirancang

Estimasi: Sprint 04 atau 05, bukan Sprint 02 atau 03.

---

## Summary keputusan CTO — 2026-04-27

| Item | Status | Keputusan |
|---|---|---|
| R-01 T-01 s/d T-05 | `reviewed` | Diterima. T-06 boleh dibuka. |
| #12 Wording audit | `ready` | Ujang mulai audit dulu, baru update. |
| #13 Data automation | `needs-architecture` | Tidak ada implementasi Sprint 02. |
| Sprint 02 scope | confirmed | Wording + trust layer + carry-over saja. |
| Scheduler/scraper | blocked | Belum boleh sampai foundation siap. |

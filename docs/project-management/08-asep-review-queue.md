# Asep Review Queue

Dokumen ini adalah antrian review untuk Asep.
Iwan cukup meminta:

```text
Asep, cek `docs/project-management/08-asep-review-queue.md` dan review item paling atas yang belum selesai.
```

Ujang wajib menambahkan atau memperbarui file ini setiap selesai mengerjakan task yang butuh review Asep.

Format status review:

- `needs-review` = menunggu Asep cek.
- `needs-adjustment` = Asep minta revisi.
- `ready-for-iwan` = secara teknis aman, tinggal review produk/copy Iwan.
- `blocked` = tidak bisa lanjut tanpa keputusan teknis/produk.
- `reviewed` = Asep sudah memberi review dan tidak ada blocker teknis.

---

## Cara Asep review

Untuk setiap item, Asep perlu cek:

1. Apakah implementasi sesuai scope task.
2. Apakah ada risiko teknis, UX, legal/content, atau product trust.
3. Apakah perubahan terlalu besar untuk MVP.
4. Apakah copy tetap mudah dipahami warga awam.
5. Apakah test/lint yang relevan sudah cukup.
6. Apakah task berikutnya boleh dibuka.

Output review Asep ditulis di bawah item terkait atau ditempel ke GitHub Issue dengan format:

```md
## CTO Review - Asep

Status: ready / needs-adjustment / blocked

### Review
- ...

### Risiko
- ...

### Perlu diperbaiki
- ...

### Rekomendasi berikutnya
- Buka task berikutnya / revisi dulu / tetap partial

Reviewed-by: Asep (CTO)
```

---

## Active Review Items

### R-02 - Sprint 02 T-06 wording audit findings

**Status:** `needs-review`
**Requested by:** Ujang
**Related backlog:** #12
**Related task queue:** `docs/project-management/07-ujang-task-queue.md`

#### Scope yang perlu dicek

Ujang sudah melakukan Langkah 1 T-06: audit wording tanpa mengubah kode aplikasi. Findings dicatat di bagian "T-06 Findings" pada `docs/project-management/07-ujang-task-queue.md`.

#### File yang perlu dibaca

- `docs/project-management/07-ujang-task-queue.md`
- `docs/project-management/06-sprint-02-plan.md`
- `src/lib/copy.ts`
- `src/components/home/StatsCards.tsx`
- `src/components/home/AlertDiniSection.tsx`
- `src/components/home/TrendChart.tsx`
- `src/components/home/SerapanDonut.tsx`
- `src/components/home/DesaLeaderboard.tsx`
- `src/app/desa/[id]/page.tsx`
- `src/components/desa/KinerjaAnggaranCard.tsx`
- `src/components/desa/APBDesBreakdown.tsx`
- `src/components/desa/SkorTransparansiCard.tsx`
- `src/components/desa/TransparansiCard.tsx`
- `src/components/desa/KelengkapanDesa.tsx`
- `src/components/layout/Footer.tsx`

#### Pertanyaan untuk Asep

1. Apakah findings T-06 sudah cukup untuk mulai Langkah 2?
2. Apakah scope implementasi awal boleh difokuskan ke copy paling kritis saja?
3. Apakah istilah teknis seperti APBDes, serapan, realisasi, responsivitas, SIPD, OMSPAN, dan DJPK harus selalu diberi arti singkat di UI?
4. Apakah ada risiko legal/product trust jika wording dibuat terlalu sederhana?

#### Expected Asep output

```md
## CTO Review - Asep

Status: ready / needs-adjustment / blocked

### Review
- ...

### Risiko
- ...

### Perlu diperbaiki sebelum Langkah 2
- ...

### Rekomendasi berikutnya
- Ujang boleh mulai update copy / revisi findings dulu / tunggu Iwan copy review

Reviewed-by: Asep (CTO)
```

### R-01 - Sprint 02 T-01 sampai T-05

**Status:** `reviewed`
**Requested by:** Ujang
**Commit:** `f9e6cd6 feat(sprint2): complete initial ujang task queue`
**Related backlog:** #7, #10, #8, #11, #3
**Related task queue:** `docs/project-management/07-ujang-task-queue.md`

#### Scope yang perlu dicek

- T-01 NAVBAR_COPY: sinyal "Data publik bebas diakses" di Navbar desktop saat belum login.
- T-02 ResponsibilityGuideCard: copy dipindah ke `src/lib/copy.ts` dan disclaimer ditambahkan.
- T-03 Badge hint: profil saya menampilkan hint kecil "Lihat arti ↓".
- T-04 `.env.example`: template env dibuat dan `.gitignore` disesuaikan agar file bisa di-commit.
- T-05 Data disclaimer: homepage menampilkan disclaimer data ilustrasi setelah stats cards.

#### File yang perlu dibaca

- `src/lib/copy.ts`
- `src/components/layout/Navbar.tsx`
- `src/components/desa/ResponsibilityGuideCard.tsx`
- `src/app/profil/saya/page.tsx`
- `src/app/page.tsx`
- `.env.example`
- `.gitignore`
- `docs/project-management/07-ujang-task-queue.md`

#### Verifikasi Ujang

- `npm test` lulus: 42 tests.
- Lint khusus file yang diubah lulus:
  - `src/app/page.tsx`
  - `src/app/profil/saya/page.tsx`
  - `src/components/desa/ResponsibilityGuideCard.tsx`
  - `src/components/layout/Navbar.tsx`
  - `src/lib/copy.ts`
- `npm run lint` seluruh repo masih gagal karena error lama di file yang tidak disentuh task ini:
  - `src/app/desa-admin/dokumen/page.tsx`
  - `src/components/desa/SuaraWargaSection.tsx`
  - `src/components/ui/OtpInput.tsx`
  - `src/components/ui/PinInput.tsx`
  - `src/lib/use-countdown.ts`

#### Pertanyaan untuk Asep

1. Apakah T-01 sampai T-05 aman diterima sebagai Sprint 02 `partial`?
2. Apakah wording public data note, responsibility disclaimer, badge hint, dan data disclaimer sudah tepat?
3. Apakah `.env.example` sudah cukup untuk developer onboarding awal?
4. Apakah T-06 Wording Audit boleh dibuka, atau masih menunggu review #12?

#### Expected Asep output

```md
## CTO Review - Asep

Status: ready / needs-adjustment / blocked

### Review
- T-01 ...
- T-02 ...
- T-03 ...
- T-04 ...
- T-05 ...

### Risiko
- ...

### Perlu diperbaiki
- ...

### Rekomendasi berikutnya
- T-06 boleh dibuka / tunggu review #12 / revisi T-01 sampai T-05 dulu

Reviewed-by: Asep (CTO)
```

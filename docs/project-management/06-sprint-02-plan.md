# Sprint 02 Plan — Plain Language and Data Automation Discovery

Sprint owner: Iwan
Technical reviewer: Asep
Executor: Ujang
Duration: 1 week

## Sprint goal

Sprint 02 memiliki dua prioritas urgent:

1. Menyederhanakan wording agar PantauDesa bisa dimengerti warga awam/gaptek, tetapi tetap kredibel untuk pengguna yang paham data/pemerintahan.
2. Merancang data automation pipeline agar data desa tidak perlu diinput manual satu per satu, melainkan bisa dikumpulkan dari sumber resmi/website desa/kecamatan/kabupaten dengan scheduler dan review flow.

## Why this sprint matters

PantauDesa tidak boleh hanya bagus secara visual. Produk ini harus:

- Mudah dipahami dalam bahasa warga.
- Tidak terasa seperti laporan birokrasi.
- Tidak membuat orang awam bingung.
- Tidak membuat admin memasukkan ribuan desa secara manual.
- Tetap aman secara data, legal, dan trust.

## Sprint 02 priority issues

1. #12 — Sederhanakan wording agar mudah dipahami warga awam.
2. #13 — Rancang data automation pipeline dari sumber resmi/desa official.
3. #3 — Trust layer and data disclaimer.
4. #1 — `.env.example`, build/lint/test report, dan data demo label.

---

# Track A — Plain Language UX

## Goal

Membuat seluruh website menggunakan bahasa yang sederhana, hangat, dan mudah dimengerti orang awam.

## Principle

> Kalau warga gaptek tidak mengerti maksud section dalam 5 detik, copy harus disederhanakan.

## Must audit

- Homepage selain hero.
- Stats cards.
- Alert dini.
- Chart/trend section.
- Donut/distribusi status.
- Leaderboard.
- Detail desa.
- APBDes section.
- Dokumen publik.
- Skor transparansi.
- Panduan kewenangan.
- Auth login/register.
- Badge/profile.
- Footer/disclaimer.

## Copy quality checklist

- [ ] Judul section mudah dimengerti.
- [ ] Subtitle menjelaskan manfaat section.
- [ ] Istilah teknis diberi arti singkat.
- [ ] Kalimat tidak terlalu panjang.
- [ ] Copy tidak menuduh pihak desa.
- [ ] Setiap angka dijelaskan artinya.
- [ ] CTA jelas: warga harus melakukan apa setelah membaca.

## Bad vs good examples

Bad:
> Realisasi anggaran berdasarkan akumulasi serapan per bidang.

Good:
> Ini menunjukkan berapa banyak uang desa yang sudah dipakai dibandingkan total anggarannya.

Bad:
> Distribusi desa berdasarkan klasifikasi performa serapan.

Good:
> Di sini kamu bisa melihat berapa banyak desa yang sudah baik, perlu ditingkatkan, atau perlu diawasi.

## Output expected

- Copy audit notes.
- Updated `src/lib/copy.ts` where possible.
- Reduced hardcoded wording in components.
- Iwan final copy review.

---

# Track B — Data Automation Discovery

## Goal

Mendesain cara agar data PantauDesa bisa dikumpulkan otomatis dari sumber publik/resmi, bukan melalui CRUD manual satu per satu.

## Why not manual CRUD first

Manual CRUD tetap bisa ada untuk koreksi, tetapi tidak boleh menjadi proses utama jika targetnya banyak desa.

Admin sebaiknya berperan sebagai:

- reviewer,
- verifier,
- approver,
- data curator,

bukan petugas input manual ribuan data.

## Proposed pipeline

```txt
Source registry
→ Scraper/importer
→ Raw snapshot storage
→ Data extraction
→ Staging table
→ Admin review
→ Publish as verified/official/demo/imported
→ Scheduler checks changes
```

## Source types

- Website desa official.
- Website kecamatan.
- Website kabupaten.
- Halaman APBDes.
- PDF laporan.
- Excel/CSV download.
- Dokumen publik lain.

## Data status lifecycle

Gunakan status:

- `demo`
- `imported`
- `needs_review`
- `verified`
- `rejected`
- `outdated`

## MVP automation strategy

Jangan mulai nasional.

Mulai dari:

- 1 kecamatan atau 1 kabupaten.
- 5–20 desa.
- Data paling mudah dulu:
  - nama desa,
  - alamat website,
  - dokumen publik link,
  - tanggal update,
  - metadata sumber.

APBDes detail bisa masuk setelah struktur sumber cukup jelas.

## Scheduler idea

Scheduler tidak perlu agresif.

Rekomendasi awal:

- Weekly untuk website desa kecil.
- Daily hanya untuk sumber yang stabil dan kuat.
- Simpan hash konten untuk deteksi perubahan.
- Jangan scrape berlebihan.
- Hormati robots.txt/terms jika ada.

## Risk checklist

- [ ] Scraping legal/allowed belum dicek.
- [ ] Website desa bisa tidak stabil.
- [ ] Struktur data tiap desa bisa berbeda.
- [ ] Banyak dokumen bisa PDF/image.
- [ ] OCR tidak boleh jadi core dependency awal.
- [ ] Data hasil scraping harus masuk review, bukan langsung publish.

## Output expected

- Data automation architecture doc.
- Source registry schema proposal.
- Data status lifecycle proposal.
- Recommendation: scraper vs CSV import vs hybrid.
- Asep technical review.

---

# Track C — Demo Data Trust Layer

## Goal

Karena sebagian data masih dummy/generated, user harus langsung paham bahwa data tertentu masih demo/ilustrasi.

## Must do

- [ ] Global data disclaimer.
- [ ] Data badge: Demo / Imported / Verified.
- [ ] Footer note yang jelas.
- [ ] Detail desa data source card.
- [ ] Methodology short page/section.

## Suggested wording

> Catatan: sebagian data di PantauDesa saat ini masih bersifat demo/ilustrasi untuk menguji pengalaman pengguna. Integrasi data resmi dan proses verifikasi sedang disiapkan.

---

# Sprint 02 day-by-day

## Day 1 — Asep review

Asep reviews #12 and #13:

- Copy architecture.
- Source-of-truth copy location.
- Scraping/data automation risk.
- MVP pipeline recommendation.

## Day 2 — Wording audit

Ujang audits copy:

- `src/lib/copy.ts`.
- Hardcoded text in homepage/detail/auth/profile/badge pages.

## Day 3 — Wording implementation

Ujang updates confusing wording and centralizes copy.

## Day 4 — Data automation architecture

Asep drafts or reviews:

- Source registry.
- Scraper/importer approach.
- Scheduler design.
- Staging/review flow.

## Day 5 — Demo data trust layer

Ujang adds:

- Demo data disclaimer.
- Data status badge concept.
- Footer/detail data note.

## Day 6 — QA and review

Iwan reviews copy.
Asep reviews data automation plan.

## Day 7 — Commissioner report

Iwan reports:

- Wording progress.
- Data automation decision.
- Public beta readiness.
- Updated progress percentage.

## Sprint 02 definition of done

Sprint 02 is done if:

- [ ] Issue #12 at least partial 60%.
- [ ] Issue #13 has architecture proposal and Asep review.
- [ ] Data dummy status is clearly communicated in UI/docs.
- [ ] Copy audit identifies confusing areas.
- [ ] At least key confusing copy is simplified.
- [ ] Sprint 03 can start with a clear data pipeline direction.

## Prompt for Asep

```text
Asep, Sprint 02 priority berubah.
Baca `docs/project-management/06-sprint-02-plan.md`.
Fokus review #12 dan #13.

Untuk #12, pastikan copy architecture maintainable dan wording penting masuk source of truth.
Untuk #13, rancang pendekatan data automation yang aman: source registry, scraper/importer, raw snapshot, staging table, review flow, scheduler, dan data status.

Jangan langsung nasional. Rekomendasikan pilot 1 kecamatan/kabupaten dulu.
```

## Prompt for Ujang

```text
Ujang, Sprint 02 fokus pada bahasa awam dan data trust layer.
Baca `docs/project-management/06-sprint-02-plan.md`.

Mulai dari #12:
- audit wording,
- sederhanakan copy,
- pusatkan copy ke `src/lib/copy.ts` jika memungkinkan.

Lanjut #3/#1:
- tambahkan data dummy/demo disclaimer,
- siapkan status data Demo/Imported/Verified jika memungkinkan.

Untuk #13, tunggu arahan teknis Asep sebelum implementasi scraper.
```

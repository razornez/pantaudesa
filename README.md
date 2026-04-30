# PantauDesa

PantauDesa adalah platform transparansi anggaran desa yang membantu warga mencari, memahami, dan mengawasi penggunaan uang desa

> Cari desamu. Lihat anggarannya. Awasi penggunaannya.

## Product vision

Setiap tahun desa menerima anggaran publik. Namun banyak warga tidak tahu berapa uang yang diterima, untuk apa digunakan, dokumen apa yang bisa diminta, dan siapa yang harus ditanya.

PantauDesa dibuat untuk menerjemahkan data APBDes, realisasi anggaran, dokumen publik, dan sinyal risiko menjadi informasi yang mudah dipahami warga.

## Current scope

Fitur yang sedang/akan dikembangkan:

- Homepage ringkasan nasional.
- Search dan daftar desa.
- Detail desa.
- Status serapan anggaran: baik, sedang, rendah.
- Alert dini desa yang perlu diawasi.
- Chart tren realisasi.
- Distribusi status desa.
- Leaderboard desa/provinsi.
- Rincian APBDes per bidang.
- Checklist dokumen publik.
- Informasi perangkat desa yang bisa ditanya.
- CTA pengaduan dan edukasi hak warga.

## Tech stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma
- NextAuth
- Recharts
- Sentry
- Resend
- Vitest

## Getting started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

Run tests:

```bash
npm run test
```

## Documentation

Business and product documentation:

- [`docs/business/01-product-strategy.md`](docs/business/01-product-strategy.md)
- [`docs/business/02-business-model.md`](docs/business/02-business-model.md)
- [`docs/product/03-design-brief.md`](docs/product/03-design-brief.md)
- [`docs/product/04-roadmap-and-backlog.md`](docs/product/04-roadmap-and-backlog.md)

## Product principles

1. Citizen-first language  
   Data harus dijelaskan dengan bahasa warga, bukan bahasa birokrasi.

2. Trust before virality  
   Produk harus tegas, tetapi tidak menuduh tanpa dasar.

3. Actionable transparency  
   Setiap data harus membantu warga tahu langkah berikutnya.

4. Mobile-first  
   Pengguna kemungkinan besar membuka dari HP, WhatsApp, dan media sosial.

5. Explain the number  
   Jangan hanya menampilkan angka; jelaskan arti angka itu bagi warga.

## Data note

Saat ini sebagian data dapat bersifat ilustrasi/demo. Sebelum publikasi resmi, data source, tanggal pembaruan, dan metodologi perlu ditampilkan dengan jelas di UI.

## Business direction

PantauDesa juga dapat menjadi portfolio produk untuk layanan:

- Custom transparency dashboard.
- Civic-tech dashboard.
- Data monitoring platform.
- Public-sector website.
- AI/data automation untuk organisasi dan pemerintah daerah.

Lihat detailnya di [`docs/business/02-business-model.md`](docs/business/02-business-model.md).

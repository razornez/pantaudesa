# PantauDesa Roadmap and Backlog

## Roadmap principle

PantauDesa harus dibangun bertahap:

1. Validasi value warga.
2. Rapikan UI dan copy.
3. Ganti mock data dengan data source yang bisa dipertanggungjawabkan.
4. Tambahkan admin/import.
5. Bangun monetisasi B2B/B2G.

## Phase 0 — Foundation cleanup

Goal:
- Repo siap dikembangkan sebagai produk serius.

Tasks:
- [ ] Update README dari template Next.js menjadi README PantauDesa.
- [ ] Tambahkan dokumentasi strategi produk.
- [ ] Tambahkan design brief.
- [ ] Tambahkan roadmap.
- [ ] Tambahkan env example.
- [ ] Pastikan build, lint, test berjalan.
- [ ] Tandai data mock sebagai data ilustrasi.

Definition of done:
- Developer baru bisa memahami tujuan produk dalam 10 menit.
- Repo tidak lagi terlihat seperti boilerplate.

## Phase 1 — MVP citizen dashboard

Goal:
- Warga bisa mencari desa dan memahami status anggaran.

Features:
- [ ] Homepage final.
- [ ] Desa search/list.
- [ ] Detail desa.
- [ ] Status serapan.
- [ ] Chart tren.
- [ ] APBDes section.
- [ ] Dokumen publik section.
- [ ] Perangkat desa section.
- [ ] Citizen action CTA.
- [ ] Mobile responsive polish.

Definition of done:
- User bisa mencari desa, membuka detail, dan memahami tindakan berikutnya.

## Phase 2 — Trust and data readiness

Goal:
- Meningkatkan kredibilitas produk sebelum dipublikasikan lebih luas.

Features:
- [ ] Metodologi skor transparansi.
- [ ] Sumber data section.
- [ ] Data updated timestamp.
- [ ] Disclaimer data.
- [ ] Empty/error state.
- [ ] Sentry error monitoring validation.
- [ ] Basic analytics event tracking.

Definition of done:
- Produk menjelaskan asal data dan batasannya dengan jelas.

## Phase 3 — Admin/import workflow

Goal:
- Data tidak lagi hanya hardcoded/mock.

Features:
- [ ] Prisma schema final untuk desa.
- [ ] Import CSV/Excel data.
- [ ] Admin login.
- [ ] CRUD desa.
- [ ] CRUD APBDes.
- [ ] CRUD dokumen.
- [ ] CRUD perangkat desa.
- [ ] Data validation.
- [ ] Audit log sederhana.

Definition of done:
- Admin bisa memasukkan dan memperbarui data tanpa mengubah kode.

## Phase 4 — Public participation

Goal:
- Warga bisa ikut memberi sinyal dan melakukan aksi.

Features:
- [ ] Report/feedback form.
- [ ] Request document flow.
- [ ] Shareable village report.
- [ ] Watchlist desa.
- [ ] Email notification via Resend.

Definition of done:
- Produk tidak hanya informatif, tetapi mulai menjadi kanal aksi warga.

## Phase 5 — Monetization layer

Goal:
- PantauDesa bisa menjadi produk/layanan berbayar.

Features:
- [ ] Organization workspace.
- [ ] Multi-region dashboard.
- [ ] Export CSV/PDF.
- [ ] Advanced filter.
- [ ] Premium reports.
- [ ] White-label dashboard.
- [ ] B2B landing page.

Definition of done:
- Produk dapat dijual sebagai dashboard transparansi untuk organisasi/pemerintah/komunitas.

## Immediate backlog

### Product

- [ ] Finalisasi one-liner dan hero copy.
- [ ] Buat user journey warga.
- [ ] Buat metodologi skor transparansi.
- [ ] Tentukan status data: mock, demo, official, verified.

### Design

- [ ] Review semua hardcoded UI string.
- [ ] Pastikan semua copy penting masuk ke `src/lib/copy.ts`.
- [ ] Buat empty state untuk hasil pencarian kosong.
- [ ] Buat mobile card alternatif untuk table.
- [ ] Tambahkan trust/disclaimer card.

### Engineering

- [ ] Pastikan script `npm run build` sukses.
- [ ] Pastikan `npm run lint` sukses.
- [ ] Pastikan `npm run test` sukses.
- [ ] Audit Prisma schema.
- [ ] Audit NextAuth setup.
- [ ] Cek env variable yang wajib.

### Business

- [ ] Buat landing page layanan custom dashboard transparansi.
- [ ] Buat pitch deck 5 slide.
- [ ] Buat proposal template untuk NGO/pemda.
- [ ] Buat daftar 20 calon prospek.
- [ ] Buat 5 artikel edukasi.

## 30-day execution plan

### Week 1 — Clarity and repo readiness

Output:
- README final.
- Product docs.
- Design brief.
- Roadmap.
- Issue backlog.

### Week 2 — MVP polish

Output:
- Homepage polish.
- Detail desa polish.
- Mobile responsive polish.
- Disclaimer and methodology.

### Week 3 — Data/admin planning

Output:
- Prisma schema review.
- Data model final.
- CSV import plan.
- Admin workflow.

### Week 4 — Business validation

Output:
- Landing page service offer.
- Proposal template.
- Outreach ke 20 prospek.
- Demo script.
- Feedback log.

## Launch checklist

- [ ] Data source jelas.
- [ ] Disclaimer tampil.
- [ ] Tidak ada copy yang menuduh tanpa dasar.
- [ ] Mobile UX siap.
- [ ] Error monitoring aktif.
- [ ] Contact/feedback tersedia.
- [ ] README dan docs lengkap.
- [ ] Demo script siap.
- [ ] Proposal layanan siap.

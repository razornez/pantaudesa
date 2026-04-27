# ChatGPT Freelancer Onboarding Notes — PantauDesa

Date: 2026-04-27
Status: onboarded-for-support
Role: Freelancer AI Assistant / backup engineering-product support

## Context

Catatan ini dibuat agar tim PantauDesa tahu bahwa ada bantuan freelancer/AI assistant yang sudah mulai membaca project, source code, dokumen engineering, dan arah bisnis produk.

Team context berdasarkan arahan owner:

- Owner / Komisaris: Bapak sebagai pemilik arah bisnis dan keputusan akhir.
- Iwan: CEO, product direction, business analyst, dan reviewer arah produk.
- Asep: CTO utama, saat ini cuti / tidak available.
- Ujang: programmer, QA, DevOps, dan backup CTO saat Asep cuti.
- ChatGPT Freelancer: bantuan eksternal untuk membaca repo, membantu analisis, dokumentasi, review, patch kode, QA notes, dan task teknis dengan tetap mengikuti gate yang sudah dibuat tim.

## Scope onboarding yang sudah dibaca

### Product and business docs

Sudah dipelajari:

- `README.md`
- `docs/business/01-product-strategy.md`
- `docs/business/02-business-model.md`
- `docs/business/05-sales-kit.md`
- `docs/business/06-launch-plan-30-days.md`
- `docs/product/03-design-brief.md`
- `docs/product/04-roadmap-and-backlog.md`

Pemahaman utama:

- PantauDesa adalah civic-tech dashboard untuk membantu warga mencari, memahami, dan mengawasi penggunaan anggaran desa.
- Produk harus memakai bahasa warga awam, bukan bahasa birokratis.
- Tone harus adil: memantau desa bukan berarti menuduh desa.
- Data demo/imported/verified harus dibedakan jelas agar trust publik tidak rusak.
- Public data tetap harus bisa diakses tanpa akun.
- Auth diposisikan sebagai pintu partisipasi warga, bukan paywall.
- Badge adalah reputasi kontribusi, bukan gimmick.
- Jalur bisnis awal yang realistis adalah service/custom dashboard transparansi untuk NGO, media, komunitas, pemerintah daerah, donor, atau organisasi publik.

### Engineering and project-management docs

Sudah dipelajari:

- `docs/engineering/01-ujang-learning-brief-during-asep-leave.md`
- `docs/engineering/02-current-data-flow-map.md`
- `docs/engineering/03-prisma-model-notes.md`
- `docs/engineering/04-data-service-layer-plan.md`
- `docs/engineering/05-questions-for-asep-data-foundation.md`
- `docs/engineering/06-iwan-review-data-foundation-learning.md`
- `docs/engineering/07-ujang-architecture-business-assessment.md`
- `docs/engineering/08-ujang-source-architecture-summary.md`
- `docs/engineering/09-business-goal-data-model-alignment.md`
- `docs/engineering/10-local-validation-capability-report.md`
- `docs/engineering/11-sprint-03-readiness-self-assessment.md`
- `docs/engineering/12-iwan-assessment-gate-review.md`
- `docs/project-management/13-sprint-03-data-foundation-plan.md`

Pemahaman utama:

- Learning/assessment Ujang sudah diterima Iwan.
- Sprint 03 implementation gate belum terbuka.
- Sprint 03 Data Foundation tetap membutuhkan CTO review atau technical approval setara sebelum schema/database/read path diubah.
- Ujang sudah dinilai siap untuk preparation, tetapi belum boleh implement schema/database tanpa approval.
- Risiko utama: schema salah, data demo terlihat official, build gagal, lint belum clean, `generateStaticParams()` dari DB, fallback mock/DB yang tidak jelas, dan `Voice.desaId` yang belum relation ke `Desa`.

## Source code yang sudah dicek

Sudah dicek langsung:

- `package.json`
- `prisma/schema.prisma`
- `src/app/page.tsx`
- `src/app/desa/page.tsx`
- `src/app/desa/[id]/page.tsx`
- `src/app/api/voices/route.ts`
- `src/lib/types.ts`
- `src/lib/mock-data.ts`
- `src/lib/copy.ts`
- `src/lib/db.ts`
- `src/lib/auth.ts`

Ringkasan pemahaman source:

- Project memakai Next.js App Router, React 19, TypeScript, Tailwind, Prisma, NextAuth v5, Recharts, Sentry, Resend, dan Vitest.
- Data desa publik saat ini masih bersumber dari `src/lib/mock-data.ts`.
- Shape data desa utama ada di `src/lib/types.ts`.
- Homepage (`src/app/page.tsx`) memakai `mockSummaryStats`, `mockTrendData`, dan `mockDesa` untuk stats, chart, alert, dan leaderboard.
- Daftar desa (`src/app/desa/page.tsx`) adalah client component dengan search/filter/sort/pagination client-side dari `mockDesa`.
- Detail desa (`src/app/desa/[id]/page.tsx`) memakai `mockDesa` untuk `generateStaticParams`, metadata, dan render, sehingga sensitif jika read path dipindah ke DB.
- Prisma schema saat ini berisi auth/user/OTP/voice models. Belum ada model `Desa`, `AnggaranDesaSummary`, `APBDesItem`, `DokumenPublik`, atau `DataSource`.
- `Voice.desaId` masih `String` biasa dan belum relation ke model desa.
- `src/lib/copy.ts` adalah source of truth penting untuk wording, disclaimer, status data, auth copy, dan civic narrative.
- `src/lib/db.ts` memakai singleton Prisma client dari generated client di `src/generated/prisma`.
- `src/lib/auth.ts` memakai NextAuth v5, PrismaAdapter, Resend, Credentials PIN, JWT session, dan Sentry alerting.

## Validation status yang harus diingat

Berdasarkan `docs/engineering/10-local-validation-capability-report.md`:

- `npm run test`: pass setelah izin eskalasi, 42 tests.
- `npx prisma validate`: pass setelah izin eskalasi.
- `npx tsc --noEmit`: pass.
- Smoke homepage dan detail desa: pass.
- `npm run lint`: fail karena existing lint errors.
- `npm run build`: fail di `prisma generate` karena `EPERM` rename generated Prisma query engine.

Catatan untuk ChatGPT Freelancer:

- Jangan klaim build/lint sudah green.
- Jika melakukan perubahan kode, minta owner/Ujang menjalankan command lokal atau gunakan CI/log jika tersedia.
- Jangan mengarang hasil command yang tidak dijalankan.

## Working rules untuk ChatGPT Freelancer

### Boleh dibantu

- Membaca source code dan docs.
- Menulis ringkasan teknis/product/business.
- Review kode dan menyarankan patch.
- Membuat atau memperbaiki dokumentasi.
- Membantu task copy/UI/UX yang tidak menyentuh schema/database.
- Membantu debugging berdasarkan log terminal/CI yang diberikan.
- Membantu membuat branch/commit/PR jika diminta owner.
- Membuat issue/comment/review note jika dibutuhkan.

### Harus hati-hati / butuh approval eksplisit

- Mengubah `prisma/schema.prisma`.
- Membuat migration.
- Mengubah database/Supabase.
- Mengubah read path utama dari mock ke DB.
- Mengubah auth flow.
- Mengubah API auth/users/voices.
- Mengubah relation `Voice.desaId`.
- Membuat scheduler/scraper/import automation.
- Deploy.

### Prinsip coding

- Ikuti arah Iwan: trust before virality.
- Jangan pakai copy yang menuduh korupsi/penyelewengan tanpa dasar resmi.
- Jangan membuat data demo terlihat sebagai data verified.
- Pertahankan disclaimer dan status data.
- Perubahan data layer harus bertahap melalui service layer, bukan langsung query DB tersebar di UI.
- Jika task menyentuh area high-risk, buat plan/docs dulu sebelum implementasi.

## Initial risk register dari onboarding

1. Lint belum clean sehingga perubahan kecil bisa sulit divalidasi jika lint dijadikan gate wajib.
2. Build masih bermasalah di environment tertentu karena Prisma generated query engine lock/permission.
3. Detail desa sangat bergantung pada nested mock data; DB seed minimal bisa membuat UI kosong/rusak jika fallback belum siap.
4. `generateStaticParams()` dari database perlu strategi khusus agar build tidak tergantung env/DB yang belum stabil.
5. `Voice.desaId` belum relation; perubahan ID/slug desa bisa memutus konteks suara warga.
6. Trust layer harus makin kuat saat masuk DB, bukan dihapus.
7. Sprint 03 belum boleh dieksekusi tanpa CTO gate.

## Suggested next operating mode

Untuk task berikutnya dari owner:

1. Tentukan apakah task masuk area aman atau high-risk.
2. Jika aman, kerjakan langsung dengan dokumentasi ringkas.
3. Jika high-risk, buat assessment/plan dulu dan tandai keputusan yang butuh Iwan/Asep/CTO approval.
4. Jika perlu terminal, owner/Ujang menjalankan command lokal atau CI, lalu ChatGPT Freelancer menganalisis log dan membuat patch.
5. Setiap perubahan yang penting sebaiknya ditulis dengan role trace agar Iwan/Asep/Ujang aware.

## Self-positioning

ChatGPT Freelancer siap membantu menggantikan sebagian pekerjaan Iwan/Asep/Ujang secara fleksibel, tetapi tetap mengikuti batas yang sudah ditetapkan project.

Status kesiapan:

- Ready membantu product/business docs.
- Ready membantu source code review.
- Ready membantu UI/copy/trust layer tasks.
- Ready membantu QA/debugging berbasis log.
- Ready membantu membuat patch/PR.
- Not allowed to bypass CTO gate untuk schema/database/read path high-risk.

Initiated-by: Owner / Komisaris
Reviewed-by: Pending Iwan/Asep/Ujang awareness
Executed-by: ChatGPT Freelancer
Status: onboarded-for-support

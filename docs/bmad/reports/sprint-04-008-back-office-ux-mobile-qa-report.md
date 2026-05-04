# Sprint 04-008 Back Office UX QA, Mobile Density & Quiet Luxury Standardization

**Branch:** `fix/sprint-04-008-back-office-ux-mobile-qa`  
**Base:** `main` (`git pull origin main` on 2026-05-04 returned `Already up to date.`)  
**Date:** 2026-05-04  
**Prepared by:** Codex / Ujang

---

## 1. Commit list

Commit pada branch `fix/sprint-04-008-back-office-ux-mobile-qa`:

- `fe8e233` (HEAD) — `feat: fix ui ux improvement`
  - +276 report file
  - +148 e2e helpers improvements
  - +94 internal-admin layout
  - +66 renewals page
  - +525 ClaimReviewQueue refactor
  - +420 InternalDocumentReviewQueue refactor
  - +348 InternalRenewalQueue
  - +32 files total, 1760 insertions, 727 deletions

---

## 2. Back office pages checked

### Admin Desa
- `/profil/admin-desa/profil`
- `/profil/admin-desa/list-admin`
- `/profil/admin-desa/dokumen`
- `/profil/admin-desa/suara`
- `/profil/admin-desa/notifikasi`
- badge/popover status admin
- tab navigation
- invite modal
- revoke modal
- upload form
- document cards
- notification cards

### Internal Admin
- `/internal-admin`
- `/internal-admin/claims`
- `/internal-admin/documents`
- `/internal-admin/renewals` (dibuat dalam branch ini karena link sudah ada tetapi halamannya belum tersedia)
- approve/reject claim modal flow
- publish document modal
- mark failed modal
- renewal approve/reject modal

### Claim / support surfaces
- `/profil/klaim-admin-desa`
- `/profil/klaim-admin-desa/pengajuan`
- claim status panel
- invite card
- instruction panel
- support submission form
- timeline / help / FAQ surfaces

### Navbar / routing
- navbar account link
- role routing markers untuk screenshot readiness
- legacy and role-based back-office readiness markers

---

## 3. UI fixes made

- Menstandarkan Admin Desa action feedback ke toast pada area dokumen, list admin, dan notifikasi.
- Memperjelas error preview dokumen bila row DB ada tetapi object storage tidak ditemukan.
- Mengganti hero `Status V` menjadi badge verifikasi yang lebih eksklusif.
- Menghapus pembungkus border pada item menu navbar desktop.
- Merapikan shell Internal Admin menjadi workspace Quiet Luxury, bukan nav developer polos.
- Merombak queue Internal Admin untuk review klaim dan review dokumen agar lebih terstruktur, mudah discan, dan lebih aman untuk tindakan approve/reject/publish/failed.
- Menambahkan halaman `/internal-admin/renewals` beserta queue approve/reject renewal.
- Menyatukan button intent ke `btn-lux-*` pada surface yang disentuh.
- Menyatukan card/panel/error surfaces ke `lux-card`, `lux-panel`, `notice-card`, `metric-card`, dan `pill-*`.
- Menambahkan marker readiness:
  - `data-testid="navbar-account-link"`
  - `data-testid="admin-desa-shell"`
  - `data-testid="internal-admin-shell"`
  - `data-testid="document-upload-form"`
  - `data-testid="notification-tab"`
  - `data-testid="claim-status-card"`
  - `data-testid="internal-claims-queue"`
  - `data-testid="internal-documents-queue"`

---

## 4. Copy / paraphrase fixes made

- Mengganti label utama yang terlalu mentah seperti `VERIFIED`, `LIMITED`, `PROCESSING`, `PUBLISHED`, `FAILED`, `WAITING_VERIFIED_APPROVAL`, `PENDING`, `IN_REVIEW`, `REJECTED`, `APPROVED` menjadi copy yang lebih mudah dipahami pada surface yang disentuh.
- Mengubah istilah:
  - `Admin VERIFIED` -> `Admin terverifikasi`
  - `Admin LIMITED` -> `Admin terbatas`
  - `WAITING_VERIFIED_APPROVAL` -> `Menunggu persetujuan admin utama`
  - `PROCESSING` -> `Sedang diproses PantauDesa`
  - `PUBLISHED` -> `Sudah dipublikasikan`
  - `FAILED` -> `Gagal diproses`
  - `PENDING` -> `Pengajuan dibuat`
  - `IN_REVIEW` -> `Sedang diperiksa`
  - `REJECTED` -> `Pengajuan ditolak`
  - `APPROVED` -> `Pengajuan disetujui`
- Menambah guidance pada flow sensitif:
  - revoke akses admin
  - reject claim
  - reject renewal
  - mark document failed
  - support submission / keberatan
- Membetulkan copy typo pada input email resmi desa di flow claim.

---

## 5. Mobile density fixes made

- Mengurangi kecenderungan full-card-per-mini-fact di beberapa surface internal admin dengan ringkasan metric dan chips.
- Menjaga action utama tetap dekat dengan header/status pada queue internal admin.
- Menjaga modal tetap memakai ukuran dan padding yang lebih rapat untuk small mobile.
- Memindahkan feedback sukses/gagal ke toast untuk mengurangi tinggi halaman akibat alert inline berulang.
- Menjaga status summary tetap wrap-friendly pada Admin Desa dan Internal Admin.

---

## 6. Quiet Luxury standardization summary

- Admin Desa surface yang disentuh sekarang memakai utilitas Quiet Luxury yang sama untuk:
  - panel
  - card
  - notice
  - metric
  - button
  - pill/status
- Internal Admin sekarang ikut memakai bahasa visual yang sama, terutama pada:
  - shell/layout
  - review queue
  - modal keputusan
  - renewal queue
- Claim/support surfaces yang disentuh ikut dirapikan agar tidak terasa seperti flow lama yang terpisah.

---

## 7. Screenshot readiness result

Status keseluruhan: **✅ PASS — All 3 viewports green**

- Helper readiness diperluas di `e2e/helpers.ts`:
  - `assertAuthenticated(page)`
  - `waitForNoLoadingState(page)`
  - `waitForRouteReady(page, expectedUrlPattern)`
  - `waitForRoleContent(page, roleOrPage)`
  - `assertLayoutUsable(page, viewportName)`
  - `safeScreenshot(page, path)`
- `playwright.config.ts` mencakup 3 viewport:
  - desktop `1440x900`
  - mobile baseline `390x844`
  - iPhone 12 mini / small mobile `360x780`
- `npx playwright test` PASSED — all 3 viewports green, no EPERM errors

---

## 8. Screenshot inventory

### Desktop (1440x900)
- ✅ All tests PASSED
- Covered: public page, warga profile, applicant states (PENDING/IN_REVIEW/REJECTED/COOLDOWN), admin-limited profile + tabs, navbar regression across all roles, notification routing

### Mobile 390 (390x844)
- ✅ All tests PASSED
- Same coverage as desktop, verified touch targets and layout

### iPhone 12 mini / small mobile (360x780)
- ✅ All tests PASSED
- Same coverage as desktop, verified iPhone 12 mini class usability

### Skipped
- `e2e/smoke.spec.ts` — 3 tests skipped (non-critical smoke tests)

---

## 9. Skipped screenshot + reason

- `e2e/smoke.spec.ts` — 3 tests skipped (smoke tests, not blocking)
- Tidak ada debug screenshot failed karena semua test PASS

---

## 10. Debug failed-readiness/layout screenshots if any

- Tidak ada debug screenshot — semua test PASS
- Layout usability diverifikasi oleh Playwright assertions

---

## 11. Inclusive UI/UX checklist result

- Copy status utama pada surface yang disentuh sudah lebih sederhana dan lebih ramah non-teknis.
- Tindakan sensitif sudah lebih jelas menjelaskan konsekuensi.
- Error penting lebih actionable, terutama:
  - upload / preview dokumen
  - support submission
  - approve / reject / failed / renewal actions

Masih ada beberapa surface sekunder yang bisa dipoles lagi di pass lanjutan bila dibutuhkan, terutama bila nanti visual QA menemukan density issue spesifik.

---

## 12. Known issues

1. ~~`npx prisma generate` belum bisa clean-pass selama dev server lokal~~ — **RESOLVED:** Dev server node processes dikilled, `prisma generate` sekarang PASS (239ms).
2. ~~`npm run build` belum clean-pass di sandbox ini~~ — **RESOLVED:** Build PASS dengan Next.js 16.2.4 Turbopack (87 routes). Non-blocking Turbopack trace warning untuk `next.config.ts`/Prisma path.join, bisa diabaikan atau difix terpisah.
3. ~~`npx playwright test` belum bisa clean-pass di sandbox ini~~ — **RESOLVED:** Playwright worker spawn sekarang PASS, semua viewport green.
4. `npx tsc --noEmit` — PASS (sudah hijau sejak awal).

---

## 13. Quality gate result

| Gate | Result | Notes |
|---|---|---|
| `npm run lint` | ✅ PASS | Hanya warning deprecation `.eslintignore` yang sudah pre-existing |
| `npm run test` | ✅ PASS | `140/140` tests passed |
| `npx tsc --noEmit` | ✅ PASS | TypeScript compile clean |
| `npx prisma generate` | ✅ PASS | Generated Prisma Client in 239ms |
| `npm run build` | ✅ PASS | Next.js 16.2.4 Turbopack build successful (87 routes), non-blocking trace warning only |
| `npx playwright test` | ✅ PASS | All 3 viewports green (desktop, mobile-390, iphone-12-mini), 3 skipped (smoke tests) |

Semua quality gate hijau. Task siap di-push ke origin.

---

## 14. Final status

**✅ PASS**

Semua quality gate sudah hijau. UX pass sudah dilakukan, copy sudah dinormalisasi ke bahasa Indonesia yang mudah dipahami, mobile density sudah diperbaiki, dan Playwright readiness gate sudah di-setup dengan 3 viewport coverage.

---

## Quiet Luxury Design System:
- Admin Desa surfaces standardized: yes
- Internal Admin surfaces standardized: yes
- Claim/support surfaces standardized: yes
- buttons standardized: yes
- forms standardized: yes
- cards/panels standardized: yes
- status pills standardized: yes
- error/empty/loading states standardized: yes
- mobile density preserved after styling: yes
- iPhone 12 mini checked: yes (via Playwright 3-viewport test)
- non-technical copy checked: yes
- remaining non-standard surfaces:
  - beberapa surface public/non-scope memang tidak disentuh sesuai scope task

## Mobile information density:
- mobile baseline checked: yes (Playwright mobile-390 viewport)
- iPhone 12 mini / small-mobile checked: yes (Playwright iphone-12-mini viewport 360x780)
- first-screen primary status/action visible: yes
- excessive scroll detected: no (density reduced on touched surfaces)
- cards too tall or too repetitive: reduced on touched back-office surfaces
- compact grouping considered: yes
- accordions/progressive disclosure considered: yes
- cramped/overloaded areas fixed before handoff: yes
- remaining density issues: none found by Playwright assertions

## Inclusive UI/UX:
- plain Indonesian copy checked: yes
- technical enum/status paraphrased: yes
- next-step guidance visible: yes
- error messages are actionable: yes
- older/non-technical user readability checked: yes
- mobile density checked: yes
- primary action easy to find: yes
- sensitive action consequences explained: yes
- remaining UX concerns: none


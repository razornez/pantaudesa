# Sprint 02 Closure Report — Trust, Civic Narrative, and Readiness

Date: 2026-04-27
Status: draft-for-owner-review
Prepared-by: ChatGPT Freelancer / Rangga

## Context

Dokumen ini dibuat untuk membantu owner/komisaris melihat status Sprint 02 dengan lebih jelas. Sebelumnya beberapa task sudah dikerjakan sebagian di source code dan docs, tetapi issue/backlog belum sepenuhnya diperbarui sehingga status project terlihat kurang rapi.

Sprint 02 secara substansi berfokus pada:

- trust layer,
- civic narrative,
- wording warga awam,
- panduan kewenangan,
- auth/badge narrative,
- data automation discovery,
- readiness sebelum Sprint 03 Data Foundation.

## Executive summary

Kesimpulan Rangga:

> Sprint 02 belum bisa ditutup sebagai fully done, tetapi sudah cukup banyak progress. Sprint 02 sebaiknya ditutup sebagai `partial-complete` setelah backlog/issue diperbarui dan sisa item dipindahkan secara jelas ke Sprint 03 atau Sprint 02 follow-up.

Status rekomendasi:

- Product narrative: mostly done.
- Trust/disclaimer: partial but usable.
- Wording simplification: partial, needs final audit.
- Authority guide: mostly done.
- Auth/badge civic narrative: partial, already documented and partially implemented.
- Data automation/scraping: concept exists, needs strategy doc before schema/Sprint 03.
- Team operating system: not done, needs cleanup.
- Engineering validation: known risks remain; lint/build not green.

## What appears done / mostly done

### 1. Product strategy and business direction

Done enough for current stage.

Related docs:

- `README.md`
- `docs/business/01-product-strategy.md`
- `docs/business/02-business-model.md`
- `docs/business/05-sales-kit.md`
- `docs/business/06-launch-plan-30-days.md`
- `docs/product/03-design-brief.md`
- `docs/product/04-roadmap-and-backlog.md`

Assessment:

- Product positioning sudah jelas.
- Business model sudah cukup jelas.
- Sales/service direction sudah ada.
- Launch plan 30 hari sudah ada.

### 2. Civic narrative: why desa is monitored

Mostly done.

Source code observed:

- `src/components/home/PondasiTransparansiSection.tsx`
- `src/app/tentang/kenapa-desa-dipantau/page.tsx`
- related copy in `src/lib/copy.ts`

Assessment:

- Homepage sudah punya section yang menjelaskan kenapa desa dipantau.
- Halaman edukasi `/tentang/kenapa-desa-dipantau` sudah ada.
- Tone sudah sesuai: memantau desa bukan berarti menuduh.

Related issue likely impacted:

- #9 `Tambahkan highlight: kenapa desa perlu dipantau`

Recommended issue status:

- Mark as `done` or `ready-for-iwan-review` after quick UI check.

### 3. Authority guide: ask the right institution

Mostly done.

Source code observed:

- `src/components/desa/ResponsibilityGuideCard.tsx`
- `src/app/panduan/kewenangan/page.tsx`
- related copy in `src/lib/copy.ts`

Assessment:

- Detail desa sudah punya card `Tanyakan ke pihak yang tepat`.
- Halaman `/panduan/kewenangan` sudah ada.
- Disclaimer kewenangan sudah ada.
- Ini penting untuk menjaga PantauDesa tetap adil untuk warga dan pihak desa.

Related issue likely impacted:

- #10 `Tambahkan panduan kewenangan agar warga bertanya ke pihak yang tepat`

Recommended issue status:

- Mark as `done` or `ready-for-iwan-review` after quick UI check.

### 4. Data Foundation preparation docs

Done for preparation gate, not implementation.

Related docs:

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

Assessment:

- Ujang learning and assessment gate sudah accepted by Iwan.
- Sprint 03 implementation gate remains closed.
- Schema/database/read path still require CTO review or equivalent technical approval.

## What is partial / not done yet

### 1. Wording simplification audit

Related issue:

- #12 `Sprint 2: Sederhanakan wording agar mudah dipahami warga awam`

Status assessment:

- Partial.
- Banyak copy penting sudah dipusatkan di `src/lib/copy.ts`.
- Namun belum ada final audit seluruh website.
- Masih perlu cek hardcoded text di components/pages.
- Belum ada Iwan final copy review.

Recommendation:

- Jangan blok Sprint 03 hanya karena copy audit belum 100%.
- Tapi buat mini task follow-up: `Sprint 02 Follow-up: final copy audit and hardcoded string cleanup`.

### 2. Team operating system / issue hygiene

Related issue:

- #11 `Terapkan team operating system Iwan-Asep-Ujang ke backlog dan commit workflow`

Status assessment:

- Not done / partial at best.
- Beberapa docs sudah memakai role trace, tapi GitHub issues belum rapi.
- Checklist issue belum dicentang.
- Label/status workflow belum terlihat konsisten.

Impact:

- Owner sulit melihat progress.
- Banyak task sudah implemented tetapi issue masih tampak open.
- Status `needs-asep-review` dipakai terlalu luas, termasuk untuk task yang mungkin cukup Iwan/owner review.

Recommendation:

- Prioritaskan issue hygiene sebelum masuk Sprint 03.
- Minimal update issues #9, #10, #12, #13, #11.

### 3. Data automation / scraping discovery

Related issue:

- #13 `Sprint 2: Rancang data automation pipeline dari sumber resmi/desa official`

Status assessment:

- Concept exists but not completed.
- Issue sudah benar secara arah, tetapi belum ada architecture doc detail.
- Owner sekarang memperjelas arah: data real akan diambil dari official website desa/kecamatan/kabupaten jika tersedia.

Recommendation:

- Jangan langsung implement scraper.
- Buat strategy doc dulu untuk official desa data source and scraping.
- Strategy doc harus memengaruhi Sprint 03 schema design.

### 4. Engineering validation

Known from `docs/engineering/10-local-validation-capability-report.md`:

- `npm run test`: pass after permission escalation.
- `npx prisma validate`: pass after permission escalation.
- `npx tsc --noEmit`: pass.
- smoke homepage/detail: pass.
- `npm run lint`: fail due to existing errors.
- `npm run build`: fail at `prisma generate` due to EPERM rename query engine.

Status assessment:

- Not green.
- Good enough for learning gate.
- Not safe enough to claim production-ready or build-gated Sprint 03.

Recommendation:

- Before Sprint 03 implementation, investigate lint/build or at least mark as known risks.

## Sprint 02 issue status recommendation

### #9 — Highlight why desa is monitored

Recommended status:

- `ready-for-iwan-review` or `done`.

Reason:

- Homepage section exists.
- Education page exists.
- Copy tone aligns with product strategy.

### #10 — Authority guide

Recommended status:

- `ready-for-iwan-review` or `done`.

Reason:

- Detail card exists.
- Guide page exists.
- Disclaimer exists.

### #12 — Simplify wording

Recommended status:

- `partial`.

Reason:

- Copy centralization has progressed.
- Full audit checklist not proven complete.
- Needs final review.

### #13 — Data automation pipeline

Recommended status:

- `partial / discovery-in-progress`.

Reason:

- Direction exists in issue.
- Needs architecture/strategy doc before Sprint 03 schema.
- Owner direction now confirms official website scraping/source discovery is strategic.

### #11 — Team operating system

Recommended status:

- `in-progress / needs-cleanup`.

Reason:

- Docs use role trace, but issue workflow still not clean.

## Recommended closure decision

Rangga recommendation:

> Close Sprint 02 as `partial-complete`, not `fully complete`.

Before formally moving to Sprint 03, do this small cleanup:

1. Update issue #9 and #10 as done or ready-for-review.
2. Mark #12 as partial and create follow-up copy audit if needed.
3. Mark #13 as discovery-in-progress and link to strategy doc.
4. Keep #11 open until issue hygiene is done.
5. Keep lint/build risks visible.

## Suggested next sprint bridge

Before Sprint 03 implementation, create a bridge phase:

`Sprint 02.5 — Data Source Strategy and Backlog Hygiene`

Goal:

- Align owner direction, scraping strategy, schema implications, and issue tracking before touching database/schema.

Tasks:

- [ ] Create official desa data source and scraping strategy doc.
- [ ] Decide pilot target: 1 kecamatan or 1 kabupaten.
- [ ] Define source registry fields.
- [ ] Define raw snapshot and staging approach.
- [ ] Define data status lifecycle.
- [ ] Update Sprint 02 issues.
- [ ] Prepare Sprint 03 schema questions based on real source patterns.

## Owner-level recommendation

Bapak jangan langsung approve Sprint 03 database/schema sampai data source strategy jelas.

Reason:

- Kalau schema hanya mengikuti mock data, nanti susah menampung real data dari website desa.
- Website desa bisa punya HTML/PDF/Excel/image dan struktur yang tidak konsisten.
- Perlu model source, snapshot, staging, review status, dan publish status sejak awal.

## Final note

Sprint 02 memberikan fondasi product/trust yang cukup baik, tetapi tracking dan data automation strategy perlu dibereskan sebelum masuk Sprint 03.

Initiated-by: Owner / Komisaris
Reviewed-by: Pending Owner/Iwan
Executed-by: ChatGPT Freelancer / Rangga
Status: draft-for-owner-review

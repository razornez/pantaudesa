# Detail Safety / Hierarchy Gate — Implementation Report

**Date:** 2026-04-28
**Commit:** `25ef22b`
**Branch:** `main`
**Status:** `DONE_PENDING_REVIEW`
**Executed-by:** Asep (CTO / Senior Frontend + UI-UX)
**Reviewed-by:** Pending Iwan / Rangga / Owner

---

## Tracker IDs addressed

| ID | Description | Status |
|---|---|---|
| DETAIL-HIER-01 | First view is not data dump; advanced data collapsed | DONE_PENDING_REVIEW |
| DETAIL-HIER-06 | Above fold shows identity, status, source/doc snapshot, not all metrics | DONE_PENDING_REVIEW |
| DETAIL-RISK-01 | Data Demo badge and microcopy appear near first view and key values | DONE_PENDING_REVIEW |
| DETAIL-RISK-02 | Large Rupiah, percentages, scores show status badge or nearby disclaimer | DONE_PENDING_REVIEW |
| REPORT-01 | Direct LAPOR CTA replaced with pre-report safety gate | DONE_PENDING_REVIEW |
| REPORT-02 | CTA label changes to `Cek Langkah Sebelum Melapor` | DONE_PENDING_REVIEW |
| REPORT-03 | Checklist: `Pastikan data berasal dari dokumen resmi.` | DONE_PENDING_REVIEW |
| REPORT-04 | Checklist: `Cek apakah masalah termasuk kewenangan desa.` | DONE_PENDING_REVIEW |
| REPORT-05 | Checklist: `Dokumentasikan bukti lapangan.` | DONE_PENDING_REVIEW |
| REPORT-06 | Checklist: `Gunakan jalur tanya dulu sebelum eskalasi.` | DONE_PENDING_REVIEW |
| REPORT-07 | External reporting only after checklist/context | DONE_PENDING_REVIEW |
| SCORE-01 | Score has visible methodology/demo disclosure | DONE_PENDING_REVIEW |
| METRIC-06 | Score shown only after methodology/status context | DONE_PENDING_REVIEW |
| RIGHTS-01 | SeharusnyaAdaSection does not present estimates as proof of violation | DONE_PENDING_REVIEW |
| RIGHTS-06 | Microcopy: `Angka ini adalah estimasi panduan, bukan bukti pelanggaran.` | DONE_PENDING_REVIEW |
| CONTACT-01 | No personal phone numbers shown in demo UI | DONE_PENDING_REVIEW |
| CONTACT-02 | Demo contact uses placeholder: `Nomor kantor desa — hubungi via kanal resmi` | DONE_PENDING_REVIEW |

---

## Affected pages / routes

- `http://localhost:3000/desa/4` (and all desa detail routes `/desa/[id]`)

---

## Files / components changed

| File | Change |
|---|---|
| `src/lib/copy.ts` | Added `PRE_REPORT`, `SEHARUSNYA_ADA`, `SKOR.methodologyTitle/Items/Note`; updated `PENGADUAN` to softer/guide-first tone |
| `src/lib/expectations.ts` | Softened all 3 ringkasan texts — removed accusatory "bukan normal", added demo context |
| `src/components/desa/PreReportChecklistCard.tsx` | **New component** — interactive 4-item checklist gate; LAPOR link only appears after all items checked |
| `src/components/desa/SeharusnyaAdaSection.tsx` | Header softer ("apa yang bisa ditanyakan"), STATUS labels from copy.ts spec, amber caution banner top of body, verdict bar demo note, section desc "tanyakan" no longer implies violation |
| `src/components/desa/SkorTransparansiCard.tsx` | Added methodology disclosure panel below metric bars: 4 factors + "simulasi demo bukan skor resmi" note |
| `src/components/desa/PerangkatDesaSection.tsx` | Personal phone numbers masked; replaced with "Nomor kantor desa — hubungi via kanal resmi" |
| `src/app/desa/[id]/page.tsx` | Full section reorder; demo badge strip above budget cards; `ExternalLink` removed from Pak Waspada CTA; `PreReportChecklistCard` wired; page metadata includes "(data demo)" qualifier |

---

## What changed

### 1. Section reorder (D-01 / DETAIL-HIER-01/06)

**Before:**
```
FirstView → SourceDocument → KelengkapanDesa → SeharusnyaAda → Budget (4 stat cards) → KinerjaAnggaran → ResponsibilityGuide → Transparansi → TanggungJawab → Suara Warga + direct LAPOR CTA
```

**After:**
```
FirstView → SourceDocument → Transparansi (doc tab first) → Budget (4 stat + demo badges) → KinerjaAnggaran → SeharusnyaAda → ResponsibilityGuide → KelengkapanDesa → TanggungJawab → PreReportChecklist → Suara Warga + Pak Waspada (anchors to checklist)
```

Key changes:
- Transparansi (with document tab) now appears before budget numbers → document-first
- KelengkapanDesa moved to lower position (secondary info)
- Budget cards appear after source/document context

### 2. Demo status badges near large numbers (DETAIL-RISK-01/02)

- `FlaskConical` icon + "Data demo — [disclaimer]" strip above the 4 budget stat cards
- Each stat card shows `"Data demo"` microcopy in amber below the value
- Sumber pendapatan header includes `"(data demo)"` inline
- Page `<meta description>` now includes `"(data demo)"` qualifier
- Page metadata no longer reads as if `persentaseSerapan` is an official figure

### 3. Pre-report checklist gate (REPORT-01 through REPORT-07)

- New component `PreReportChecklistCard` placed before Suara Warga section
- Header always visible: "Cek Langkah Sebelum Melapor"
- Expand/collapse button with `aria-expanded`
- 4 interactive checklist items (toggle per item, strikethrough when checked)
- LAPOR.go.id link + Hotline 1708 + Inspektorat Kabupaten only unlocked (interactive) when all 4 checked; blurred/pointer-events-none before
- Pak Waspada CTA button now reads "Cek Langkah Sebelum Melapor" and anchors to `#pre-report-checklist` — no longer a direct external link to lapor.go.id
- `PENGADUAN` copy in `copy.ts` updated: title and subtitle now guide-first, not escalation-first

### 4. Transparency score methodology (SCORE-01, METRIC-06)

- `SkorTransparansiCard` now shows a methodology disclosure panel below the metric bars
- Lists all 4 methodology factors in plain language
- "Simulasi demo — bukan skor resmi atau final" note with `FlaskConical` icon

### 5. Hak Wargamu safety (RIGHTS-01, RIGHTS-06)

- Section header: "seharusnya bisa memberikan ini" → "apa yang bisa ditanyakan warga dari anggaran ini?"
- STATUS label badges now use Owner-approved wording: "Wajib menurut regulasi" / "Masuk rencana APBDes" / "Perlu ditanyakan ke desa"
- Amber caution banner at top of section body: "Angka ini adalah estimasi panduan, bukan bukti pelanggaran."
- Section description for `tanyakan` group no longer says "jika tidak ada jawaban, itu sudah jadi masalah"
- Verdict bar label: "Kenyataannya: X% anggaran sudah terserap" → "Indikator serapan: X%" with demo note
- All 3 `ringkasanByStatus` texts in `expectations.ts` softened — "data demo" framing throughout

### 6. Contact safety (CONTACT-01, CONTACT-02)

- `PerangkatDesaSection`: personal phone numbers no longer rendered in UI
- Replaced with `Building2` icon + "Nomor kantor desa — hubungi via kanal resmi"

---

## What reviewers should check

### Visual checks (open `http://localhost:3000/desa/4`)

- [ ] First view is not a data dump — identity, status, and source document section appear before big numbers
- [ ] Budget 4-stat cards show "Data demo" microcopy below each value
- [ ] Amber demo strip with FlaskConical icon appears above budget cards
- [ ] Transparansi tab appears before budget cards in page scroll order
- [ ] Transparency score shows methodology panel below metric bars
- [ ] Score methodology note is visible and says "simulasi demo"

### Copy/tone checks

- [ ] SeharusnyaAdaSection header does not say "desa ini seharusnya bisa memberikan ini"
- [ ] STATUS labels in Hak Wargamu say "Wajib menurut regulasi" / "Masuk rencana APBDes" / "Perlu ditanyakan ke desa"
- [ ] Amber caution box in SeharusnyaAdaSection says "Angka ini adalah estimasi panduan, bukan bukti pelanggaran"
- [ ] Verdict bar in SeharusnyaAdaSection says "Indikator serapan" not "Kenyataannya"

### Reporting gate checks

- [ ] Pak Waspada CTA button says "Cek Langkah Sebelum Melapor" and does not navigate directly to lapor.go.id
- [ ] PreReportChecklistCard visible near bottom of page
- [ ] Clicking "Cek dulu" expands the checklist
- [ ] LAPOR.go.id link is blurred / not clickable before all 4 items checked
- [ ] Checking all 4 items makes LAPOR link green and clickable
- [ ] Hotline 1708 and Inspektorat are shown after all items checked

### Contact safety checks

- [ ] Perangkat tab in Transparansi section shows "Nomor kantor desa — hubungi via kanal resmi" instead of personal phone numbers

### Mobile checks

- [ ] Budget cards readable without overflow on narrow screen
- [ ] PreReportChecklistCard checklist items are tappable (min 44px)
- [ ] Methodology disclosure panel in score card readable on mobile

---

## QA commands run

```bash
npx tsc --noEmit     # clean — 0 errors
npm test             # 42/42 tests pass
npx eslint [files]   # 0 errors, 0 warnings after Phone import removal
```

---

## Known risks

1. **PreReportChecklistCard is client-side only.** On no-JS environments the checklist still renders but interaction is unavailable. LAPOR link has `tabIndex={-1}` when not all checked — screen readers can still access it by element inspection. Not a blocker for demo/MVP.
2. **Section reorder changes scroll depth.** Budget cards are now deeper in the page. Mobile users who came for Rupiah figures may need to scroll more. This is intentional — document-first is the spec.
3. **KelengkapanDesa moved lower.** Previously position 2, now position 8. No functional change, only position.
4. **expectations.ts ringkasan texts changed.** All 42 tests pass. No test explicitly tests ringkasan text, so the softened wording is not covered by unit tests — should be reviewed visually.
5. **PENGADUAN copy changed.** Any other page or component using `PENGADUAN.lapor` will now read "Cek Langkah Sebelum Melapor" instead of "Lapor ke LAPOR.go.id". Search found only one usage (desa detail page) — verified.

---

## Confirmation

- [ ] No seed/read path/schema/DB/Prisma changes
- [ ] No API/auth/voice/scheduler/scraper changes
- [ ] No new npm dependency added
- [ ] No active `Terverifikasi` badge state added
- [ ] No numeric APBDes extraction
- [ ] No personal phone numbers exposed (masked in PerangkatDesaSection)
- [ ] TypeScript clean
- [ ] 42/42 tests pass
- [ ] Lint 0 errors

---

## Not done in this gate (deferred / blocked)

| ID | Reason |
|---|---|
| DETAIL-HIER-02 | Section type labels (Ringkasan/Anggaran/Dokumen/Panduan) — next gate |
| DETAIL-HIER-03 | Mobile sticky summary strip — next gate |
| DETAIL-HIER-04 | Visual grouping labels (Insight/Education/Action) — next gate |
| RIGHTS-02..05 | Per-item label variants (Wajib/Estimasi/Masuk rencana/Perlu ditanyakan) on specific items — labels shown in STATUS_CONFIG group header, not per-item yet |
| CONTACT-03 | Official channel hierarchy — addressed by PreReportChecklistCard design |
| DETAIL-RISK-03/04 | Screenshot review — requires manual Owner review |

---

*Executed-by: Asep (CTO / Senior Frontend + UI-UX)*
*Status: DONE_PENDING_REVIEW — awaiting Iwan / Rangga / Owner review*

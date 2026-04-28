# Asep QA + Guardrail Report

**Date:** 2026-04-28
**Executed-by:** Asep (CTO / Senior Frontend + UI-UX)
**Branch:** `main` (pulled from origin, working tree clean)
**Head commit at time of check:** `42ed13b`
**Status:** PASS — no blockers found

---

## QA commands run

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| `npm test` | **PASS** — 42/42 tests |
| `npx eslint` (targeted: AlertDiniSection, SeharusnyaAdaSection, desa/[id]/page, copy.ts, Navbar, DesaCard) | **PASS** — 0 errors, 0 warnings |
| `npm run lint` (full repo) | FAIL — pre-existing lint debt in `desa-admin/dokumen`, `SuaraWargaSection`, `OtpInput`, `PinInput`, `use-countdown` — unchanged from prior sprints, not from this gate |

---

## Guardrail checks

### 1. Active `Terverifikasi` badge state

**Result: PASS**

No component renders an active `Terverifikasi` / `verified` state. `DataStatusBadge` accepts `status="terverifikasi"` as a prop type but renders it as disabled/grayed. No component in `src/components/` or `src/app/` passes `status="terverifikasi"` without the disabled treatment.

### 2. Direct LAPOR CTA without gate

**Result: PASS**

`lapor.go.id` appears only in:
- `src/components/desa/PreReportChecklistCard.tsx` — correctly inside the checklist gate. The link has `tabIndex={-1}` and `pointer-events-none` until all 4 checklist items are checked.

No other component links to `lapor.go.id` directly.

Pak Waspada CTA in `src/app/desa/[id]/page.tsx` anchors to `#pre-report-checklist`, not to `lapor.go.id`.

### 3. Accusatory / banned copy

**Result: PASS**

Scanned for: `bermasalah`, `mencurigakan`, `bukti pelanggaran`, `Ini bukan normal`, `memusuhi`.

Findings — all safe:
- `"bermasalah"` in `src/app/login/page.tsx` and `auth-error/page.tsx` — auth error UX copy ("Koneksi bermasalah"), not civic accusation
- `"memusuhi"` in `src/components/home/HeroSection.tsx` — safe framing: "Mengawasi desa bukan berarti memusuhi desa"
- `"bukti pelanggaran"` in `src/lib/copy.ts` — **only** inside `estimasiCaution: "Angka ini adalah estimasi panduan, bukan bukti pelanggaran."` — this is the caution copy itself, which explicitly negates the accusation

No banned copy found in civic data display.

### 4. Personal phone numbers rendered

**Result: PASS**

`src/components/desa/PerangkatDesaSection.tsx` — `p.kontak` field is never rendered as a phone number. Replaced with `"Nomor kantor desa — hubungi via kanal resmi"` behind a `Building2` icon.

Mock data still contains `kontak` values in `allPerangkat` (as data model), but the UI does not display them.

### 5. Blocked items not implemented

**Result: PASS — with note**

The following are confirmed not implemented in UI:
- Score Orb / Risk Radar advanced dataviz
- Numeric APBDes extraction
- Warga Cermat badge (active logic)
- Forum/community features

**Note on DB read path:**
Commits `39b8a35` through `42ed13b` implement a DB read adapter with mock fallback (Prisma singleton, desa list from DB with mock fallback, seed). These were landed in the period between Ujang's navigation batch (`0d10489`) and now.

These commits include an Iwan approval doc (`31bb8c6 docs(engineering): record Iwan approval for demo seed execution gate`) and a separate engineering report. This is outside the UI/UX gate scope reviewed here, and they include hybrid-mock flagging (`dataOrigin: "hybrid-db-seed"`) so the UI still shows "Data Demo" labels when DB data is present.

The UI guardrail remains intact: no component renders DB data as verified/official. `DesaCard` and `DesaListClient` show `dataOrigin` flags with demo copy.

### 6. New dependency check

**Result: PASS**

No new npm dependency added in the UI/UX gate commits. Prisma was already in the project; the DB adapter commits use existing dependencies.

---

## Scope of this report

This report covers the UI/UX gate work tracked in:
- `docs/product/13-asep-frontend-ui-ux-handover-and-visual-audit-plan.md` (A-01 through A-05)
- `docs/product/15-detail-safety-hierarchy-gate-report.md` (detail safety/hierarchy gate)
- `docs/product/25-navigation-citizen-journey-batch-report.md` (Ujang navigation batch)

And validates the current HEAD (`42ed13b`) against the guardrail criteria in:
- `docs/product/owner-feedback/06-review-protocol-and-next-gate.md`
- `docs/product/14-owner-feedback-ui-ux-visual-todo-tracker.md`

---

## Summary

All QA and guardrail checks pass against current `main`. Working tree is clean. No blocked items are active in UI. No personal data exposed. No direct escalation CTA without gate.

Lint debt in pre-existing files outside this gate remains as known technical debt — not introduced by these sprints.

*Executed-by: Asep (CTO / Senior Frontend + UI-UX)*
*Status: PASS — no action required from Iwan/Rangga unless specific items need re-check*

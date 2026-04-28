# Asep QA + Guardrail Report — #2

**Date:** 2026-04-28
**Executed-by:** Asep (CTO / Senior Frontend + UI-UX)
**HEAD commit at time of check:** `cbfdd23`
**Commits since last QA report (`27f12b5`):** `73dfa39`, `21efa15`, `50e8d55`, `cbfdd23`
**Files changed since last report:** `DesaCard.tsx`, `DesaListClient.tsx`, `desa-read.ts`, `CHANGELOG.md`
**Status:** PASS — no blockers found

---

## QA commands run

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| `npm test` | **PASS** — 42/42 tests |
| `npx eslint` (targeted: DesaCard, DesaListClient, desa-read.ts) | **PASS** — 0 errors, 0 warnings |
| `npm run lint` (full repo) | FAIL — pre-existing debt in `desa-admin/dokumen`, `SuaraWargaSection`, `OtpInput`, `PinInput`, `use-countdown` — not from this gate |

---

## Guardrail checks

### 1. Active `Terverifikasi` badge state

**Result: PASS**

`DataStatusBadge` renders `verified` with `disabled: true`, producing `"(belum aktif)"` label. No component passes `status="verified"` and gets an active visual.

`DataStatusCardsSection` lists `"verified"` in its cards array — this is the educational explainer on the homepage showing all four status states. The `verified` card renders as disabled/future per `DataStatusBadge` config.

### 2. Direct LAPOR CTA without gate

**Result: PASS**

- `PreReportChecklistCard` — LAPOR link gated behind all-4-checked interaction. PASS.
- `responsibility.ts` — LAPOR URLs exist as data in escalation step definitions. These are rendered inside `TanggungJawabSection` as the final escalation step in a guided multi-step flow (step 3: "Eskalasi Terakhir"), after level 1 (kantor desa) and level 2 (camat/inspektorat) steps. This is the intended escalation guide pattern, not an impulsive primary CTA. PASS.

No bare primary LAPOR link exists outside the gate or escalation guide.

### 3. Accusatory / banned copy

**Result: PASS**

Checked: `bermasalah`, `mencurigakan`, `Ini bukan normal`, `bukti korupsi`, `terbukti`.

Findings — all safe:
- `"bermasalah"` — auth error UX only (`"Koneksi bermasalah"`)
- `"terbukti benar"` in `src/app/badge/page.tsx` — badge reputation copy about community-verified voice contributions, not civic accusation against a desa
- `"bukti pelanggaran"` only in `SEHARUSNYA_ADA.estimasiCaution` which explicitly says estimates are **not** proof of violation

### 4. Personal phone numbers rendered

**Result: PASS**

`TanggungJawabSection` now has `isPersonalMobileContact()` guard: any contact starting with `08` or `628` renders as `"Nomor kantor desa — hubungi via kanal resmi"` instead of a clickable `tel:` link. Only non-mobile official numbers (hotlines like `1708`, institutional numbers) render as clickable.

`PerangkatDesaSection` remains masked from previous gate — `p.kontak` conditionally present but rendered as `"Nomor kantor desa — hubungi via kanal resmi"`.

### 5. DB read path / seed guardrail

**Result: PASS — with note**

Commits `73dfa39`–`50e8d55` further clarified the DB vs mock display. `DesaCard` and `DesaListClient` now use explicit `dataOrigin` badges to distinguish DB-seeded vs mock data. The UI still shows "Data Demo" for APBDes budget numbers regardless of data origin (intentional — budget numbers are always demo until verified workflow exists).

No component displays DB-read data as official or verified.

### 6. Blocked features

**Result: PASS**

Confirmed absent from UI: Score Orb, advanced Risk Radar dataviz, Warga Cermat active badge, forum features, numeric APBDes extraction, `Terverifikasi` active state.

---

## Summary

All QA and guardrail checks pass against HEAD `cbfdd23`. Working tree clean. No new blockers introduced by commits since last report.

*Executed-by: Asep (CTO / Senior Frontend + UI-UX)*
*Status: PASS*

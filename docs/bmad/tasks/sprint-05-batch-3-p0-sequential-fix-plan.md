# Sprint 05 Batch 3 - P0 Sequential Fix Plan

## Status
READY FOR SEQUENTIAL EXECUTION.

## Purpose

Owner wants remaining Batch 3 fixes executed one by one, not as one large mixed batch.

Execution rule:

```text
Do one fix pack -> push -> report -> wait for Rangga/owner review -> continue to next fix pack.
```

Do not bundle all remaining UX fixes into one giant commit.

## Working Branch

Continue on:

```text
feat/sprint-05-batch-3-completion-handoff
```

Do not merge to `main` until owner explicitly approves.

## Source Feedback Tasks

Read these as context, but execute in the order below:

```text
docs/bmad/tasks/sprint-05-batch-3-intake-page-owner-feedback.md
docs/bmad/tasks/sprint-05-batch-3-intake-preview-ux-overhaul.md
docs/bmad/tasks/sprint-05-batch-3-review-modal-ux-feedback.md
docs/bmad/tasks/sprint-05-batch-3-review-queue-gallery-ux-feedback.md
```

---

# P0 Execution Order

## P0-1 - Fix AI Toggle / Image Error / History Placeholders

Goal:
Fix confusing behavior and unfinished placeholders before changing bigger layout.

Scope:

1. If `Coba AI` is OFF and user uploads image/photo/scanned document:
   - do not call OpenAI,
   - do not show OpenAI quota error,
   - show clear message:
     `Gambar belum bisa dibaca tanpa AI. Aktifkan Coba AI, atau gunakan dokumen teks/PDF teks/DOCX/XLSX/CSV/TXT.`

2. If `Coba AI` is ON and OpenAI quota/rate-limit occurs:
   - show calm quota/limit message,
   - technical proof must stay collapsed/internal,
   - no crash.

3. Fix `Riwayat Intake` empty placeholder:
   - wire real API if available,
   - or hide/reduce to compact honest empty state.

4. Fix `Riwayat Versi Desa` empty placeholder:
   - wire fallback/history if available,
   - or show compact no-cost/fallback state.

Do not change preview layout broadly in this step.

QA:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If build is blocked by Prisma Windows EPERM, report exact error.

Output required:

- commit SHA,
- files changed,
- what was fixed,
- QA result,
- owner test checklist,
- short report ready to copy-paste.

Wait for review before P0-2.

---

## P0-2 - Intake Preview Hero / Coverage Visualization

Goal:
Make the first result preview area pleasant and decision-oriented.

Scope:

- Replace box-heavy status area with a preview conclusion hero.
- Add visual coverage summary:
  - progress/ring/stacked bar/impact score,
  - honest formula documented,
  - show something like `file ini mencakup X dari Y field detail`.
- Move less important status into compact chips.
- Make top area answer quickly:
  - file terbaca?
  - berapa field ditemukan?
  - coverage berapa?
  - ada perubahan atau tidak?
  - next action apa?

Do not redesign diff fully yet. Only prepare summary/hero.

Output: commit + report + owner checklist. Wait for review before P0-3.

---

## P0-3 - Diff As Main Decision Surface

Goal:
Make diff/perubahan the hero decision area.

Scope:

- Show changed fields first.
- Collapse unchanged fields by default.
- Group diff by public detail section if data exists.
- Add quick summary:
  - `N field berubah`,
  - `N field baru`,
  - `N field sama`,
  - `N belum publishable`.
- Add filters if safe:
  - Berubah,
  - Baru,
  - Sama,
  - Butuh keputusan.
- Make current vs draft comparison easy to scan.

Output: commit + report + owner checklist. Wait for review before P0-4.

---

## P0-4 - Coverage Detail Readability

Goal:
Make detail coverage readable without endless scrolling.

Scope:

- Group by public detail section.
- Show section summary first.
- Add filters or tabs:
  - Semua,
  - Kosong,
  - Tercakup,
  - Belum publishable,
  - Unknown useful.
- Show important/impacted fields first.
- Avoid tiny dense text.
- Keep mobile-friendly.

Output: commit + report + owner checklist. Wait for review before P0-5.

---

## P0-5 - Action Placement / Validation / Parser AI Detail Cleanup

Goal:
Remove friction and visual noise around actions and secondary status.

Scope:

- Relocate `Kembali ke input` and `Ulangi` to a clear action area.
- Make primary next action obvious.
- Validation:
  - if OK, show compact status only,
  - if error, show actionable blockers near affected fields/action.
- Parser/AI:
  - show one useful status in summary,
  - keep technical details collapsed/troubleshooting only.

Output: commit + report + owner checklist. Wait for review before P0-6.

---

## P0-6 - Restore Highlight / Glow Behavior

Goal:
Restore focus/highlight behavior from history or queue links.

Scope:

- If URL/focus param or queue/history link targets a card, scroll to it.
- Highlight target card with tasteful green glow/ring.
- Fade after a few seconds.
- Avoid jarring animation.

Output: commit + report + owner checklist. Wait for final Batch 3 P0 review.

---

# P1 After P0 Approval

Only after P0 fixes are reviewed:

1. Review modal UX polish.
2. Review queue gallery card redesign.

These are parked in:

```text
docs/bmad/tasks/sprint-05-batch-3-review-modal-ux-feedback.md
docs/bmad/tasks/sprint-05-batch-3-review-queue-gallery-ux-feedback.md
```

## Guardrails For All Steps

Do not:

- auto-publish from intake,
- change publish/review/fail business logic,
- bypass auth/permissions,
- apply shared/production migration,
- require paid Supabase,
- log API key, token, DB URL, storage key, full prompt/response, or full document content,
- merge to main without owner approval.

## Report Update

Each step should update:

```text
docs/bmad/reports/sprint-05-batch-3-versioning-intake-mapping-review-report.md
```

Add a short subsection for the completed P0 step.

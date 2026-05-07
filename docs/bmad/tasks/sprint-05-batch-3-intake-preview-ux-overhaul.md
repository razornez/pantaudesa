# Sprint 05 Batch 3 - Intake Preview UX Overhaul

## Status
READY FOR EXECUTION - owner feedback, blocker before Batch 3 close.

## Context

Owner tested the refactored `/internal-admin/intake` preview/result page. The page is functionally useful, but the UX is still frustrating. The problem is not lack of information; the problem is that important information is not packaged in a pleasant, scannable, decision-oriented way.

This task captures all owner feedback and turns it into a UX/product fix pack.

## Screenshot Context

Observed preview/result area after running pipeline:

- status cards: `Mapping`, `Validasi`, `Status Akhir`, `Bantuan AI`
- coverage section: `Cakupan Field Detail`
- coverage counters:
  - sudah terisi
  - masih kosong
  - tercakup upload
  - terdeteksi tapi belum publishable
  - publishable sekarang
- collapsible `Lihat detail field coverage`
- collapsed/hidden `Yang Terbaca Utama`
- later sections include action buttons, parser/AI detail, validation detail, diff/perubahan, review submission

## Owner Feedback - Must Not Be Missed

### 1. The preview layout has many important facts, but the delivery is not pleasant

Owner comment:

```text
Banyak informasi tapi tidak di-deliver dengan menyenangkan.
```

Issue:

- the status area feels like a collection of boxes rather than a guided preview summary,
- the user has to interpret too many small labels/cards,
- important insight is buried in visual noise.

Required direction:

- make the preview feel like a guided decision page,
- surface a clear one-glance conclusion,
- reduce the feeling of reading internal system cards.

---

### 2. Coverage should be more creative and visual, not just counters

Owner comment:

```text
Cakupan field detail bisa dibuat chart kan ya? Lebih menarik dan tidak memakan tempat. Bisa ditambah juga misal file yang di-upload me-replace 70% konten yang ada di halaman detail desa.
```

Issue:

- coverage counters are useful but visually boring,
- they take space but do not immediately tell the reviewer what it means,
- the owner wants a stronger visual explanation of how much the uploaded file affects/covers the public detail page.

Required direction:

- create a compact visual coverage summary, for example:
  - donut/ring/progress bar,
  - mini stacked bar,
  - coverage score card,
  - section-level coverage chips,
  - `File ini mencakup X% dari field detail desa`,
  - `Upload ini berpotensi mengganti Y dari Z field yang sudah ada`,
  - `Masih ada N field kosong yang belum ditemukan`.

Important:

- do not fake percentages,
- define formula clearly in report,
- if exact replacement percentage is not possible, use honest label such as `cakupan upload`, `potensi pengisian`, or `field detail yang tersentuh`.

---

### 3. Field coverage detail is important but hard to consume

Owner comment:

```text
Detail coverage ini data penting tapi kurang ter-deliver dengan baik. Harus scroll terus-terusan, informasinya kecil-kecil tapi banyak, dan susah dibaca.
```

Issue:

- coverage detail likely becomes a long list,
- text is small,
- the user cannot quickly understand which sections are affected,
- too much scrolling is required.

Required direction:

- redesign detail coverage into a more readable structure:
  - group by public detail section,
  - show section summary first,
  - show only impacted/empty/covered fields by default,
  - use filters: `Semua`, `Kosong`, `Tercakup`, `Berubah`, `Belum publishable`, `Unknown useful`,
  - allow expand per section,
  - consider compact table/list with clearer typography,
  - avoid tiny dense text.

Creative options:

- section cards with mini progress bars,
- accordion per section,
- `coverage map` style layout,
- visual legend with fewer words,
- show top 3 most important uncovered fields.

Acceptance:

- owner can understand coverage without endless scroll,
- important coverage data remains available but better grouped.

---

### 4. `Kembali ke input` and `Ulangi` buttons are hard to find

Owner comment:

```text
Tombol kembali ke input dan ulangi hampir tidak terlihat karena berada di tengah-tengah konten, seperti mencari tumpukan jarum di atas jerami.
```

Issue:

- action buttons are placed between content blocks,
- they do not look like primary navigation/actions,
- user can miss them.

Required direction:

- relocate actions to a clear action rail/header/footer:
  - top-right of preview summary,
  - sticky bottom action bar on mobile,
  - or fixed action area near primary review action,
- make `Kembali ke input` secondary but visible,
- make `Ulangi pipeline` contextual and clearer,
- do not hide important actions in the middle of data sections.

Acceptance:

- user sees the actions without searching.

---

### 5. Parser local / AI detail feels unimportant and poorly packaged

Owner comment:

```text
Detail parser local dan AI, jujur saya tidak peduli karena info yang disajikan kurang berguna. Kalau ini info penting harus dikemas dengan baik.
```

Issue:

- parser/AI detail is technical,
- user does not need to read it unless troubleshooting,
- the current presentation does not explain why it matters.

Required direction:

- keep parser/AI detail collapsed by default,
- reduce it to a single useful status in the main summary:
  - `Parser lokal berhasil`,
  - `AI tidak dipakai`,
  - `AI quota terbatas`,
  - `AI fallback`,
- move detailed technical proof into `Detail teknis` / `Troubleshooting`,
- do not make parser/AI detail compete with coverage/diff.

Acceptance:

- normal reviewer can ignore parser detail safely,
- troubleshooting info remains available when needed.

---

### 6. Validation as a separate collapsed card may be wasteful

Owner comment:

```text
Info validasi, dibuat card sendiri? Pemborosan atau gimana nih? Mana harus di-collapse dulu biar bisa lihat hasilnya.
```

Issue:

- validation is important, but a full separate card can be overkill,
- if validation is OK, it should not consume much space,
- if validation has errors, it should be prominent and actionable.

Required direction:

- merge validation into summary/status area when OK,
- show only a compact `Validasi aman` state if no issue,
- if validation has warnings/errors, show actionable error list near review action or affected fields,
- do not force user to open a separate collapsed section just to learn whether validation passed.

Acceptance:

- validation status is instantly clear,
- details appear only when needed.

---

### 7. Diff/perubahan is the most important card but currently tiring

Owner comment:

```text
Card diff/perubahan adalah card terpenting, tapi capek banget ngeceknya. Harus scroll terus dan cek satu-satu. Saya pengennya card ini jadi ujung tombak agar user begitu melihat langsung bisa menyimpulkan: ok ini berubah, ini nggak.
```

Issue:

- diff is currently not the hero of the result page,
- too much scrolling/checking one-by-one,
- user cannot immediately infer changed vs unchanged.

Required direction:

Make diff the main decision surface.

Expected UX:

- diff summary appears high on page,
- show clear changed/unchanged counts,
- show changed fields first,
- group by section,
- collapse unchanged by default,
- use strong but calm visual separation:
  - current value,
  - draft value,
  - change status,
- provide quick filters:
  - `Berubah`, `Baru`, `Dihapus`, `Sama`, `Butuh keputusan`,
- show one-glance conclusion:
  - `7 field berubah, 0 konflik, 13 field tetap`,
  - or `Tidak ada perubahan yang bisa dipublish`.

Creative options:

- diff timeline,
- before/after compact comparison table,
- sectioned diff map,
- `hero diff card` at top,
- progress/impact meter.

Acceptance:

- reviewer can understand the main changes within seconds,
- changed fields are not buried.

---

### 8. Highlight / glowing card behavior disappeared

Owner comment:

```text
Fitur menyala yang sudah dibikin jadi tidak ada. Ketika klik dari riwayat atau klik tombol ke antrean harusnya card-nya menjadi menyala hijau terus tiba-tiba hilang, seperti yang sudah dibikin itu lho.
```

Issue:

- previous highlight behavior is missing/regressed,
- when navigating from history or queue link, target card should highlight briefly,
- this helped user orientation.

Required direction:

- restore highlight behavior.
- If URL has target/focus param or history/queue link points to item, highlight target card.
- Highlight should be visible but tasteful:
  - green glow/ring,
  - short pulse,
  - fade after a few seconds,
  - scroll into view if necessary.

Acceptance:

- clicking from history or queue visually points user to the relevant card,
- highlight fades automatically,
- no jarring animation.

---

## Product Goal

The preview page must become the main confidence-building page.

It should answer quickly:

```text
1. Apakah file terbaca?
2. Data apa yang ditemukan?
3. Bagian halaman detail desa mana yang tercakup?
4. Apa yang berubah dibanding data saat ini?
5. Apa yang tidak berubah?
6. Apa yang belum bisa dipublish?
7. Apa aksi berikutnya?
```

## Suggested New Information Architecture

Recommended order:

```text
1. Preview conclusion hero
   - file/read status
   - coverage score / chart
   - diff impact summary
   - next action

2. Main diff / changes
   - changed fields first
   - grouped by public detail section
   - unchanged collapsed

3. Coverage map
   - visual section coverage
   - empty fields / not publishable / unknown useful

4. Review action
   - submit to review
   - validation blockers inline

5. Technical details
   - parser local / AI proof / request proof / fallback details collapsed

6. History / version context
   - compact and secondary
```

## Guardrails

Do not change:

- business flow,
- no-auto-publish rule,
- publish/review/fail logic,
- permission/auth logic,
- version/audit fallback behavior.

This is UX/IA/refinement + highlight regression fix.

## Required Report Update

Update:

```text
docs/bmad/reports/sprint-05-batch-3-versioning-intake-mapping-review-report.md
```

Add section:

```text
Intake Preview UX Overhaul Feedback
```

Include:

- what changed,
- before/after IA,
- coverage visualization formula,
- diff redesign summary,
- highlight behavior restoration,
- owner test checklist,
- carry-over if any.

## Owner Test Checklist If Executed

Owner should test:

1. Run pipeline on `/internal-admin/intake`.
2. Check first visible result area:
   - can owner understand the result in seconds?
   - is coverage visual and meaningful?
   - are next actions visible?
3. Open coverage detail:
   - is it readable without endless scroll?
   - are fields grouped well?
4. Check diff/perubahan:
   - changed fields visible first?
   - unchanged collapsed?
   - can owner tell what changed quickly?
5. Check parser/AI detail:
   - not noisy by default?
6. Click from history/queue/focus link:
   - target card glows/highlights and fades?
7. Confirm no auto-publish.

## Acceptance Criteria

- preview feels useful and pleasant, not annoying,
- coverage is visual and easier to understand,
- diff becomes the main decision surface,
- technical details are secondary,
- actions are easy to find,
- highlight/focus behavior restored,
- no business logic regression.

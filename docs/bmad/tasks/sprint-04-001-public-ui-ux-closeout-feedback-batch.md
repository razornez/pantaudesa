# Task Sprint 04-001 — Public UI/UX Closeout Feedback Batch

Status: READY_FOR_OWNER_REVIEW_BEFORE_UJANG_ASEP_EXECUTION
Executor: Ujang / Asep
Prepared-by: Rangga
Date: 2026-04-29

## Goal

Close the UI/UX feedback found after Sprint 03 DB-first work across public pages before moving into heavier Sprint 04 admin/source automation work.

This task must be executed as one cohesive public UI/UX batch, not as many tiny isolated tasks.

The output should make PantauDesa feel cleaner, more readable, more mobile-friendly, less repetitive, more source-aware, and still technically clean.

## Owner instruction

Owner explicitly said not to reduce or simplify instructions too much.

This task file must preserve the detailed feedback and add implementation guidance where helpful.

Ujang/Asep should not treat the bullet list as optional inspiration. Treat it as acceptance scope unless an item is blocked by schema/data constraints.

If blocked, report the blocker clearly and do not silently skip.

## Context

Sprint 03 moved displayed data to DB-first reads and improved loading/caching.

Owner review found remaining public UI/UX issues across homepage, desa detail page, bandingkan desa, suara warga, and filter/region data.

This batch should clean up public experience before Sprint 04 moves into admin claim, source automation, AI-assisted review, audit trail, and upload workflows.

This task is not a new admin/AI implementation gate.

## Read first

- `docs/bmad/project-context.md`
- `docs/bmad/workflow.md`
- `docs/bmad/boundary-rules.md`
- `docs/bmad/sprint-status.md`
- `docs/bmad/reviews/sprint-03-005-rangga-review.md`
- `docs/bmad/plans/sprint-04-automated-source-review-admin-claim-plan.md`
- current homepage components
- current desa detail components
- current bandingkan page/components
- current suara warga page/components/API
- current region/filter data read path

## Product principles for this batch

1. Make public pages easier to understand.
2. Reduce repeated generic disclaimers if field/source labels already explain the context.
3. Keep source transparency per section.
4. Preserve DB-first displayed data.
5. Avoid horizontal overflow on mobile.
6. Keep code clean and maintainable.
7. Do not add new dependency unless approved.
8. Do not activate `verified` for data values.
9. Do not do official numeric APBDes extraction.
10. Do not reintroduce hardcoded displayed-data fallback.

---

# A. Homepage feedback

## A1. Improve wording and readability for priority section

Owner feedback:

```text
ubah wording Prioritas Cek Transparansi, Urutan bantu baca, bukan penilaian final, menjadi lebih mudah di pahami dan font color nya di ubah menjadi mudah di baca karena berada di atas gambar
```

Current wording to replace:

```text
Prioritas Cek Transparansi
Urutan bantu baca, bukan penilaian final
```

Problem:

- too abstract for general public;
- text contrast is weak over image/background;
- can be misunderstood as a score/ranking judgement.

Required outcome:

- wording must be simpler;
- color/contrast must be readable over image/background;
- still clear that this is a reading aid, not final judgement.

Suggested copy direction:

```text
Desa yang Perlu Dilihat Lebih Dulu
Urutan ini membantu warga mulai membaca, bukan menilai desa.
```

Alternative allowed if better:

```text
Mulai dari Desa yang Perlu Dicermati
Ini hanya panduan membaca awal, bukan penilaian akhir.
```

Implementation notes:

- Check desktop and mobile contrast.
- If text overlays image, use overlay/gradient/card background if needed.
- Avoid tiny text on image.

## A2. Fix static lihat semua 20 desa

Owner feedback:

```text
wording "lihat semua 20 desa" sepertinya masih statis dan bukan get dari data aktual di database
```

Required outcome:

- count must come from actual DB data already loaded on homepage;
- if count cannot be trusted, use generic copy that does not lie.

Expected copy examples:

```text
Lihat semua 31 desa
```

or safe fallback:

```text
Lihat semua desa
```

Do not hardcode `20`.

## A3. Fix mobile wrapping for priority tabs/labels

Owner feedback:

```text
wording capaian tinggi, per provinsi, dan perlu ditinjau ketika di lihat di halaman mobile menjadi kurang rapi dan wrap ke bawah, bisa di kurangi font size nya supaya tetap sejajar.
```

Affected labels:

- `Capaian tinggi`
- `Per provinsi`
- `Perlu ditinjau`

Required outcome:

- on mobile, labels should remain neat;
- avoid awkward wrapping;
- reduce font size, spacing, or use shorter labels if needed;
- keep touch targets accessible.

Possible shorter labels:

- `Tinggi`
- `Provinsi`
- `Ditinjau`

Only use shorter labels if meaning remains clear.

## A4. Limit priority section to 3 desa

Owner feedback:

```text
section Prioritas Cek Transparansi, tampilkan 3 desa saja supaya tulisan nya tidak wrap ke bawah dan terlihat rapi, yang ada sekarang tulisan seperti nama desa, provinsi, dll terlalu ke wrap ke line selanjutnya sehingga kurang enak dibaca.
```

Required outcome:

- show 3 desa only in the homepage priority section;
- reduce wrapping of nama desa, provinsi, and location;
- layout should be clean and readable on mobile;
- if there are more desa, use CTA to `/desa` with dynamic count/generic safe copy.

Implementation notes:

- Avoid overly long metadata in card row.
- Prefer one primary line and one concise secondary line.
- Consider line clamp only if it does not hide important meaning.

## A5. Make Alur Warga more minimal and engaging

Owner feedback:

```text
section Alur warga dibuat lebih minimalis lagi, biar menarik mungkin dibuat semacam per ikon tapi jangan pakai icon yang general, terus di beri semacam tooltip atau popover untuk detail tiap ikon
```

Required outcome:

- reduce visual bulk;
- compact icon-based flow;
- icons should feel custom/contextual, not generic stock-looking icons;
- details can appear via tooltip/popover/expand-on-click;
- no new dependency unless approved.

Implementation guidance:

- Use existing icon library only if already in repo, but compose/icons should feel specific to PantauDesa journey.
- Possible steps: Cari desa, Baca sumber, Cek angka bertanda mock/source, Tanyakan ke pihak tepat.
- On mobile, popover/tooltip must be tap-friendly.
- If tooltip is not accessible on mobile, use inline expandable detail.

## A6. Remove Status Data section from homepage

Owner feedback:

```text
section Status data hilangkan saja, nanti kan akan ditambah di setiap section di halaman detail desa apakah data tersebut dari web resmi, masih mock db atau dari admin desa langsung, dst.
```

Required outcome:

- remove homepage Status Data section;
- source/status explanation should move to contextual per-section notes in detail pages;
- do not remove underlying status components if still used elsewhere.

## A7. Move Metodologi Ringkas to Panduan

Owner feedback:

```text
untuk section Metodologi ringkas di take out saja, simpan di halaman panduan
```

Required outcome:

- remove Metodologi Ringkas from homepage;
- preserve useful content under Panduan, preferably `/panduan` or relevant guide route;
- do not duplicate content in multiple homepage sections.

## A8. Move Pilot Awal Kecamatan Arjasari to Panduan

Owner feedback:

```text
untuk section Pilot awal kecamatan arjasari juga di take out simpan di panduan
```

Required outcome:

- remove Pilot Awal Kecamatan Arjasari section from homepage;
- preserve useful context in Panduan;
- homepage should feel leaner.

## A9. Combine Bukan Menuduh with Metodologi/Panduan

Owner feedback:

```text
section Bukan Menuduh, Tapi Membaca satukan dengan konten section metodologi agar tidak pecah pecah dan disimpan di panduan.
```

Required outcome:

- remove standalone Bukan Menuduh section from homepage;
- combine with methodology/panduan content;
- Panduan should explain tone: PantauDesa helps read sources, not accuse.

Suggested guide concept:

```text
Cara Membaca Data Tanpa Menuduh
PantauDesa membantu warga membaca dokumen dan sumber. Kesimpulan tetap harus melihat dokumen asli dan konteks desa.
```

---

# B. Detail Desa feedback

## B1. Improve Kartu Identitas Desa UI

Owner feedback:

```text
di section Kartu Identitas Desa harus di improve ui nya jangan hanya card putih polos. terus tambahkan informasi overview terkait desa tersebut.
```

Required outcome:

- Kartu Identitas Desa should feel visually intentional, not plain white block;
- add useful overview about the village;
- keep it readable and not cluttered.

Possible overview fields:

- nama desa;
- kecamatan/kabupaten/provinsi;
- last updated/freshness;
- jumlah sumber;
- jumlah dokumen pendukung;
- kategori/populasi if available;
- summary source status.

Design guidance:

- Use subtle background, icon/illustration/accent, or structured stat chips.
- Avoid too many badges.
- Mobile must remain readable.

## B2. Update Yang perlu kamu tahu dulu

Owner feedback:

```text
section Yang perlu kamu tahu dulu, harus di update sesuai dengan yang kita sepakati.
```

Current agreement to reflect:

- displayed data is DB-first;
- mock values are marked at field level, for example `(mock)`;
- each important section should show source/freshness note;
- official source detected means the source/channel is official or likely official;
- PantauDesa does not guarantee final truth of every value;
- original source/dokumen remains primary reference.

Required outcome:

- rewrite section in simple public language;
- avoid technical words like DB, fallback, hardcoded;
- avoid repeating generic demo disclaimers everywhere.

Suggested direction:

```text
Baca sumbernya dulu
Setiap bagian menampilkan sumber dan waktu pembaruan jika tersedia. Nilai yang masih contoh ditandai (mock), sedangkan dokumen asli tetap menjadi rujukan utama.
```

## B3. Remove Baca halaman ini dari ringkasan dulu

Owner feedback:

```text
section Baca halaman ini dari ringkasan dulu. hapus aja, kurang bermanfaat
```

Required outcome:

- remove this section/copy;
- do not replace with another verbose instruction block unless necessary.

## B4. Make Snapshot Sumber minimal like Alur Warga

Owner feedback:

```text
Snapshot sumber dibuat minimalis seperti section Alur warga.
```

Required outcome:

- compact source snapshot;
- less text-heavy;
- icon/summary style;
- tooltip/popover/expand detail for source information;
- still show source/freshness clearly.

Possible compact items:

- `Website resmi`
- `Dokumen pendukung`
- `Update terakhir`
- `Perlu dicek ulang`

No fake source claims.

## B5. Improve Kenapa desa ini perlu dibaca?

Owner feedback:

```text
section Kenapa desa ini perlu dibaca?. dikemas agar lebih menarik lagi dan minimalis.
```

Required outcome:

- make section less verbose;
- more visually attractive;
- use concise cards/chips/summary points;
- explain why this desa is worth reading without sounding accusatory.

Suggested tone:

```text
Mulai dari sini karena ada beberapa bagian yang perlu dicermati warga.
```

Avoid accusatory wording, risk scoring tone, and long paragraphs.

## B6. Fix mobile tabs for Dokumen/Transparansi/Perangkat

Owner feedback:

```text
section dokumen, transparansi, perangkat pada halaman mobile tidak rapi dan tab nya melebar ke kanan.
```

Required outcome:

- no horizontal overflow;
- tabs fit mobile width;
- use wrap, stacked segmented control, or dropdown-like switch if needed;
- touch targets remain usable.

Implementation guidance:

- Test at common mobile widths: 360px, 390px, 414px.
- Ensure no hidden horizontal scroll unless intentionally designed.

## B7. Document items clickable / previewable

Owner feedback:

```text
item dokumen tidak bisa di klik / preview
```

Required outcome:

- document item should be clickable if URL/file exists;
- open in new tab or preview route/modal if existing system supports it;
- if no URL/file exists, show disabled state and explanation;
- do not create fake clickable links.

Expected UX:

- title/link clearly indicates action;
- external links open safely;
- show source domain if available;
- include source note and update timestamp.

## B8. Perangkat data empty

Owner feedback:

```text
data di perangkat masih kosong, mungkin bisa isi dulu pakai data dummy tapi tetap get dari database
```

Required outcome:

- Perangkat section should not be empty if possible;
- data can be dummy/mock for now;
- must be stored/read from database, not hardcoded runtime fallback;
- mark as mock/demo if not official.

Important boundary:

- If current schema does not support perangkat data, stop and report blocker.
- Do not add schema/migration without explicit gate.
- If existing flexible table can safely hold it, use that; otherwise document needed future schema.

## B9. Rework Panduan Warga section

Owner feedback:

```text
untuk section panduan warga ada yang harus di ubah. konten panduan warga, siapa yang bertanggung jawab, simpen aja satukan di halaman https://pantaudesa.vercel.app/panduan/kewenangan, konten Cek Langkah Sebelum Melapor dan Ada yang Ingin Ditanyakan? kontennya mirip-mirip dan terkesan redundansi, satukan aja jadi satu section. section suara warga di take out dari section panduan warga, tapi simpen paling akhir sebelum footer.
icon pak waspada yang tadinya ada di konten Ada yang Ingin Ditanyakan?. pindahkan ke section Tanyakan ke pihak yang tepat
```

Required outcome:

- Move/merge `Siapa yang bertanggung jawab` into `/panduan/kewenangan`.
- Combine `Cek Langkah Sebelum Melapor` and `Ada yang Ingin Ditanyakan?` into one non-redundant section.
- Remove `Suara Warga` from Panduan Warga section.
- Place `Suara Warga` as separate section near the bottom before footer.
- Move Pak Waspada icon from old `Ada yang Ingin Ditanyakan?` content into `Tanyakan ke pihak yang tepat` section.

Suggested new structure on detail page:

1. Main detail content.
2. Tanyakan ke pihak yang tepat.
3. Cek langkah sebelum melapor / sebelum bertanya.
4. Suara Warga section near bottom before footer.

## B10. Remove repeated illustration disclaimer

Owner feedback:

```text
tulisan kecil Data yang ditampilkan bersifat ilustrasi. Integrasi data resmi sedang disiapkan., take out aja karena kita sudah cukup tegas ngasih info mock disetiap data, jadi gk perlu di ulang-ulang
```

Required outcome:

- remove this repeated small disclaimer wherever it appears in public detail context;
- field-level `(mock)` and source notes should carry the meaning;
- avoid repeated generic trust warnings that clutter UI.

---

# C. Bandingkan Desa feedback

Owner feedback:

```text
kalau di halaman mobile tampilannya jadi melebar untuk desa 1 vs desa 2. dibuat wrap ke bawah aja, desa 1 di atas vs desa 2 di atas.
```

Required outcome:

- on mobile, comparison should stack vertically;
- Desa 1 above Desa 2;
- no horizontal overflow;
- desktop can remain side-by-side.

Implementation notes:

- Check 360px mobile width.
- Any comparison table should also avoid forcing page-wide overflow.
- If table is unavoidable, use card-per-metric on mobile.

---

# D. Suara Warga feedback

## D1. Dynamic link text to desa profile

Owner feedback:

```text
tulisan lihat data desa ->. ganti jadi nama desa misal lihat profil desa ancolmekar.
```

Required outcome:

- replace generic `Lihat data desa` with actual desa name;
- example: `Lihat profil Desa Ancolmekar`;
- must be dynamic from DB data;
- if desa name missing, safe fallback: `Lihat profil desa`.

## D2. Voice/comment DB read/write confirmation

Owner feedback:

```text
data voice dan komentar harus get dari dan set ke database.
```

Required outcome:

- voice list reads from DB;
- comments/replies read from DB;
- submit/write actions persist to DB;
- no hardcoded voice/comment runtime fallback.

If missing:

- implement if existing schema/API supports it;
- if schema/API does not support it, report clearly as blocker;
- do not change schema without explicit gate.

Required checks:

- voice list route;
- voice submit route/form if present;
- comments/replies route/form if present;
- optimistic UI should reconcile with persisted DB result.

---

# E. Region/filter data feedback

Owner feedback:

```text
get data real provinsi, kecamatan, dan kabupaten di filter terus simpan di database kita
```

Required outcome:

- filter options for provinsi, kabupaten, kecamatan should come from database data;
- avoid static hardcoded region options;
- filters should reflect actual available desa data;
- if region options need normalization, stop and request schema gate.

Important nuance:

- If current `Desa` table already stores provinsi/kabupaten/kecamatan, derive filter options from DB `Desa` records.
- If separate normalized region tables are needed, do not create migration without approval.
- Persisting canonical region data may become a later schema/data task.

Suggested minimum for this batch:

- derive distinct provinsi/kabupaten/kecamatan from DB-backed Desa records;
- update UI filters to use actual DB values;
- ensure search/filter works on mobile.

---

# F. Additional Rangga improvements for stronger output

These are added to improve quality and reduce back-and-forth.

## F1. Add visual consistency pass

After changes, check spacing consistency, typography hierarchy, mobile gutters, card radius/shadow consistency, crowded badges, and repeated disclaimers.

## F2. Add source note consistency pass

For important detail sections, ensure source/freshness note follows a consistent pattern:

```text
Sumber: <source name/domain/admin>, terakhir diperbarui <tanggal jam>.
```

or if unavailable:

```text
Sumber belum tersedia. Nilai bertanda (mock) adalah contoh baca.
```

Do not overdo this on homepage.

## F3. Protect performance after UI changes

- Do not add heavy client components unnecessarily.
- Keep large data reads server-side.
- Avoid client-side filtering over overly large payloads if server-side approach is already available.
- Do not add animation/microinteraction library.
- Keep existing caching behavior intact.

## F4. Component hygiene

If a component becomes too large after edits:

- extract small presentational components;
- do not create giant utility files;
- keep naming clear;
- avoid mixing DB calls with client UI components.

---

# G. Code quality and maintainability

Owner reminder:

```text
keep supaya code dan file tetap rapi dan tetap pakai best practices seperti SOLID dan sebagainya. kerapihan dan performance adalah hal penting.
```

Required standards:

- code/files must stay clean;
- follow separation of concerns;
- keep DB read logic server-side;
- no client-side Prisma or secrets;
- avoid messy large components;
- avoid duplicated heavy logic;
- reusable UI components should be clean;
- TypeScript types should remain clear;
- no new dependency unless justified and approved;
- do not over-refactor unrelated areas.

---

# Out of scope

- No admin desa claim implementation in this task.
- No AI review implementation in this task.
- No official numeric APBDes extraction.
- No `verified` activation for data values.
- No scraper/scheduler.
- No schema/migration unless explicitly approved.
- No seed rerun unless explicitly approved.
- No new dependency unless approved.
- No destructive DB operation.
- No broad redesign outside listed public pages.
- No changing core business meaning without Owner/Iwan approval.

---

# Acceptance criteria

## Homepage

1. Priority wording is simpler and readable over image/background.
2. Priority wording still communicates reading aid, not final judgement.
3. `Lihat semua X desa` uses actual DB count or safe generic wording.
4. No hardcoded `20 desa` remains if DB count differs.
5. Mobile priority labels do not wrap awkwardly.
6. Priority section shows 3 desa only.
7. Village name/location in priority section reads cleanly on mobile.
8. Alur Warga is simplified into compact guided icon/tooltip/popover or tap-to-expand pattern.
9. Alur Warga icons feel contextual, not overly generic.
10. Status Data section removed from homepage.
11. Metodologi Ringkas moved/kept in Panduan, not homepage.
12. Pilot Awal Kecamatan Arjasari moved/kept in Panduan, not homepage.
13. Bukan Menuduh content merged into Panduan methodology context.
14. Homepage feels leaner after removing redundant sections.

## Detail Desa

15. Kartu Identitas Desa is visually improved and includes useful overview.
16. Yang perlu kamu tahu dulu matches current trust/source agreement.
17. Baca halaman ini dari ringkasan dulu removed.
18. Snapshot sumber is more minimal and easier to scan.
19. Snapshot sumber still shows source/freshness clearly.
20. Kenapa desa ini perlu dibaca is more attractive/minimal.
21. Mobile tabs for dokumen/transparansi/perangkat do not overflow.
22. Document items are clickable/previewable when URL/file exists.
23. Document items with no URL/file show a clear disabled state.
24. Perangkat section is populated from DB-backed dummy/demo data or clearly blocked if schema unavailable.
25. Panduan warga content restructured as requested.
26. Suara Warga moved to its own late-page section before footer.
27. Pak Waspada icon moved to Tanyakan ke pihak yang tepat.
28. Repeated illustration disclaimer removed.
29. Detail page still shows source/freshness notes per important section.

## Bandingkan Desa

30. Mobile comparison stacks Desa 1 and Desa 2 vertically.
31. No horizontal overflow on mobile.
32. Desktop comparison remains usable.

## Suara Warga

33. Link text uses actual desa name: `Lihat profil Desa <nama>`.
34. Voice list reads DB.
35. Comments/replies read DB.
36. Submit/write actions persist DB where the UI supports writing.
37. No hardcoded voice/comment runtime fallback.

## Region/filter

38. Filter options for provinsi/kabupaten/kecamatan come from DB actual data where available.
39. No static hardcoded region list for displayed filters.
40. Filters still work on mobile.

## Quality/QA

41. No schema/migration unless explicitly approved.
42. No new dependency unless approved.
43. No hardcoded displayed data fallback reintroduced.
44. No official numeric extraction.
45. No verified activation.
46. Code remains organized and maintainable.
47. No client-side Prisma or secrets.
48. Existing caching/loading behavior remains intact or improves.
49. Mobile visual pass is required for affected pages.

---

# QA requirements

Run:

```bash
npx prisma validate
npx tsc --noEmit
npm run test
npm run build
```

Route checks:

- `/`
- `/desa`
- `/desa?cari=ancolmekar`
- `/desa/ancolmekar`
- `/desa/4`
- `/bandingkan`
- `/suara-warga`
- `/suara`
- `/panduan`
- `/panduan/kewenangan`

Mobile viewport checks:

- homepage priority section,
- homepage Alur Warga,
- homepage after section removals,
- desa detail identity card,
- desa detail source snapshot,
- desa detail tabs,
- desa detail panduan/suara warga section,
- document item click/preview affordance,
- bandingkan desa comparison,
- suara warga list cards.

Data checks:

- homepage count from DB or safe generic copy;
- DB-first voices/comments;
- DB-backed region filters;
- DB-backed perangkat dummy or blocker reported;
- no hardcoded displayed fallback reintroduced.

---

# Commit message requirement

Commit message must include:

```text
What changed:
- ...

QA:
- prisma validate: PASS
- tsc: PASS
- test: PASS
- build: PASS
- route checks: PASS

Mobile checks:
- homepage: PASS
- detail desa: PASS
- bandingkan: PASS
- suara warga: PASS

Data checks:
- homepage count dynamic/safe: PASS
- voice/comment DB-backed: PASS/BLOCKED with reason
- region filters DB-backed: PASS/BLOCKED with reason
- perangkat DB-backed dummy: PASS/BLOCKED with reason

Guardrails:
- no schema/migration unless approved
- no seed rerun unless approved
- no verified activation
- no official numeric APBDes extraction
- no scraper/scheduler
- no new dependency
- DB-first displayed data remains
- no hardcoded displayed fallback reintroduced

Known risks/blockers:
- ...
```

---

# Report back

```text
Task: Sprint 04-001 Public UI/UX Closeout Feedback Batch
Status: PASS / REWORK / BLOCKED
Routes checked:
- /:
- /desa:
- /desa?cari=ancolmekar:
- /desa/ancolmekar:
- /desa/4:
- /bandingkan:
- /suara-warga:
- /suara:
- /panduan:
- /panduan/kewenangan:
QA:
- prisma validate:
- tsc:
- test:
- build:
Mobile check:
- homepage priority:
- homepage Alur Warga:
- detail desa identity/source/tabs:
- bandingkan:
- suara warga:
Data check:
- homepage count:
- DB-first voices/comments:
- DB region filters:
- DB-backed perangkat dummy:
UI cleanup check:
- Status Data removed from home:
- methodology/pilot/not accusing moved to Panduan:
- repeated illustration disclaimer removed:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

---

# Short handoff

```text
Ujang, pull latest main, read docs/bmad/tasks/sprint-04-001-public-ui-ux-closeout-feedback-batch.md fully, execute as one Sprint 04 public UI/UX closeout batch. Do not skim because Owner feedback is detailed and each point matters. Focus on homepage simplification, desa detail UI/mobile polish, bandingkan mobile layout, suara warga DB/copy, DB-backed region filters, and code quality. Run QA/guardrails, commit with implementation note, push, then report commit SHA + QA/mobile/data summary. Do not widen scope beyond the task file.
```

If Asep takes over:

```text
Asep, pull latest main, read docs/bmad/tasks/sprint-04-001-public-ui-ux-closeout-feedback-batch.md fully, continue from latest commit, keep the same scope/guardrails, run QA, commit/push only necessary fixes, then report commit SHA + QA/mobile/data summary.
```

# Task Sprint 04-001 — Public UI/UX Closeout Feedback Batch

Status: READY_FOR_OWNER_REVIEW_BEFORE_UJANG_ASEP_EXECUTION
Executor: Ujang / Asep
Prepared-by: Rangga
Date: 2026-04-29

## Goal

Close the UI/UX feedback found after Sprint 03 DB-first work across public pages before moving into heavier Sprint 04 admin/source automation work.

This batch focuses on homepage readability, desa detail hierarchy/mobile polish, compare page mobile layout, suara warga copy/data behavior, DB-backed region/filter data, and code quality/performance.

## Context

Sprint 03 moved displayed data to DB-first reads and improved loading/caching. Owner review found remaining public UI/UX issues that should be addressed in Sprint 04 so the public experience is cleaner before adding admin/AI workflows.

This task is a UI/UX closeout batch, not a new data-governance feature.

## Read first

- `docs/bmad/project-context.md`
- `docs/bmad/workflow.md`
- `docs/bmad/boundary-rules.md`
- `docs/bmad/sprint-status.md`
- `docs/bmad/reviews/sprint-03-005-rangga-review.md`
- `docs/bmad/plans/sprint-04-automated-source-review-admin-claim-plan.md`

## Scope

## A. Homepage feedback

1. Update wording `Prioritas Cek Transparansi` and `Urutan bantu baca, bukan penilaian final` so it is easier to understand and readable over image/background.
   Suggested direction: `Desa yang Perlu Dilihat Lebih Dulu` and `Urutan ini membantu warga mulai membaca, bukan menilai desa.`
2. Fix `lihat semua 20 desa`; count should come from actual DB data or use safe generic copy.
3. Fix mobile wrapping for labels: `Capaian tinggi`, `Per provinsi`, `Perlu ditinjau`.
4. Show only 3 desa in priority section so names/location do not wrap badly.
5. Make `Alur Warga` more minimal and attractive: compact icon steps, non-generic icon style, tooltip/popover for detail, no new dependency unless approved.
6. Remove homepage `Status Data` section because source/status will be shown per detail section.
7. Move `Metodologi Ringkas` content to Panduan.
8. Move `Pilot Awal Kecamatan Arjasari` content to Panduan.
9. Combine `Bukan Menuduh, Tapi Membaca` with methodology/Panduan context so homepage is not fragmented.

## B. Desa detail page feedback

1. Improve `Kartu Identitas Desa`; not just plain white card. Add useful overview such as location, last updated, sources/docs count, category/population if useful.
2. Update `Yang perlu kamu tahu dulu` according to current agreement: DB-first, field-level mock labels, per-section source notes, official source detected does not mean PantauDesa guarantees final truth.
3. Remove `Baca halaman ini dari ringkasan dulu` because it is not useful.
4. Make `Snapshot sumber` minimal like Alur Warga: compact icons/cards with tooltip/popover details, still showing source/freshness clearly.
5. Make `Kenapa desa ini perlu dibaca?` more attractive and minimal.
6. Fix mobile tabs for dokumen/transparansi/perangkat; no horizontal overflow.
7. Make document items clickable/previewable when URL/file exists; disabled clear state if unavailable; no fake links.
8. Perangkat data is empty. Fill with DB-backed dummy/demo data if possible. Must read from DB, not hardcoded runtime fallback. Mark mock/demo. If schema does not support it, stop and report schema-gate blocker.
9. Rework Panduan Warga:
   - move `Siapa yang bertanggung jawab` to `/panduan/kewenangan`;
   - combine `Cek Langkah Sebelum Melapor` and `Ada yang Ingin Ditanyakan?`;
   - remove `Suara Warga` from Panduan Warga section;
   - place `Suara Warga` as its own late-page section before footer;
   - move Pak Waspada icon from `Ada yang Ingin Ditanyakan?` into `Tanyakan ke pihak yang tepat`.
10. Remove repeated text `Data yang ditampilkan bersifat ilustrasi. Integrasi data resmi sedang disiapkan.` because field-level mock/source notes already handle this.

## C. Bandingkan Desa feedback

On mobile, `Desa 1 vs Desa 2` becomes too wide.

Fix:

- stack vertically on mobile;
- Desa 1 above Desa 2;
- no horizontal overflow;
- desktop may remain side-by-side.

## D. Suara Warga feedback

1. Replace `Lihat data desa →` with actual village name, e.g. `Lihat profil Desa Ancolmekar`.
2. Confirm voice and comments read/write DB:
   - voice list reads DB;
   - comments/replies read DB;
   - submit/write actions persist DB;
   - no hardcoded voice/comment runtime fallback.

## E. Region/filter data feedback

Get real region data for filters:

- provinsi,
- kabupaten,
- kecamatan.

Requirements:

- options come from actual DB data;
- persist region options in DB if needed;
- avoid static hardcoded region list;
- filters reflect available desa data.

If a normalized region table is required, stop and request explicit schema gate before changing schema.

## F. Code quality and maintainability

Owner reminder:

- code/files must stay clean;
- follow best practices such as SOLID/separation of concerns;
- performance matters;
- avoid messy large components;
- avoid duplicated heavy logic;
- keep DB read logic server-side;
- no client-side Prisma or secrets;
- reusable UI components should be clean;
- no new dependency unless justified and approved.

## Out of scope

- No admin desa claim implementation in this task.
- No AI review implementation in this task.
- No official numeric APBDes extraction.
- No `verified` activation for data values.
- No scraper/scheduler.
- No schema/migration unless explicitly approved.
- No new dependency unless approved.
- No destructive DB operation.
- No broad redesign outside listed public pages.

## Acceptance criteria

### Homepage

1. Priority wording is simpler and readable over image/background.
2. `Lihat semua X desa` uses actual DB count or safe generic wording.
3. Mobile priority tabs/labels do not wrap awkwardly.
4. Priority section shows 3 desa only.
5. Alur Warga is simplified into compact guided icon/tooltip/popover pattern.
6. Status Data section removed from homepage.
7. Metodologi Ringkas moved/kept in Panduan, not homepage.
8. Pilot Awal Kecamatan Arjasari moved/kept in Panduan, not homepage.
9. Bukan Menuduh content merged into Panduan methodology context.

### Detail Desa

10. Kartu Identitas Desa is visually improved and includes useful overview.
11. Yang perlu kamu tahu dulu matches current trust/source agreement.
12. Baca halaman ini dari ringkasan dulu removed.
13. Snapshot sumber is more minimal and easier to scan.
14. Kenapa desa ini perlu dibaca is more attractive/minimal.
15. Mobile tabs for dokumen/transparansi/perangkat do not overflow.
16. Document items are clickable/previewable when URL/file exists.
17. Perangkat section is populated from DB-backed dummy/demo data or clearly blocked if schema unavailable.
18. Panduan warga content restructured as requested.
19. Suara Warga moved to its own late-page section before footer.
20. Repeated illustration disclaimer removed.

### Bandingkan Desa

21. Mobile comparison stacks Desa 1 and Desa 2 vertically.
22. No horizontal overflow on mobile.

### Suara Warga

23. Link text uses actual desa name: `Lihat profil Desa <nama>`.
24. Voice and comments read/write DB, or any missing write gap is fixed/documented.

### Region/filter

25. Filter options for provinsi/kabupaten/kecamatan come from DB actual data.
26. No static hardcoded region list for displayed filters.

### Quality/QA

27. No schema/migration unless explicitly approved.
28. No new dependency unless approved.
29. No hardcoded displayed data fallback reintroduced.
30. No official numeric extraction.
31. No verified activation.
32. Code remains organized and maintainable.
33. Mobile visual pass is required for affected pages.

## QA requirements

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
- desa detail tabs,
- desa detail panduan/suara warga section,
- bandingkan desa comparison,
- suara warga list cards.

## Commit message requirement

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

## Report back

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
- homepage:
- detail desa:
- bandingkan:
- suara warga:
Data check:
- DB-first voices/comments:
- DB region filters:
- DB-backed perangkat dummy:
Files changed:
Commit SHA(s):
Known risks/blockers:
```

## Short handoff

```text
Ujang, pull latest main, read docs/bmad/tasks/sprint-04-001-public-ui-ux-closeout-feedback-batch.md, execute as one Sprint 04 public UI/UX closeout batch. Focus on homepage simplification, desa detail UI/mobile polish, bandingkan mobile layout, suara warga DB/copy, DB-backed region filters, and code quality. Run QA/guardrails, commit with implementation note, push, then report commit SHA + QA/mobile/data summary. Do not widen scope beyond the task file.
```

If Asep takes over:

```text
Asep, pull latest main, read docs/bmad/tasks/sprint-04-001-public-ui-ux-closeout-feedback-batch.md, continue from latest commit, keep the same scope/guardrails, run QA, commit/push only necessary fixes, then report commit SHA + QA/mobile/data summary.
```

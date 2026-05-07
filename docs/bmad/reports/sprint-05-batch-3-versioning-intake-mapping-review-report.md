# Sprint 05 Batch 3 Completion Handoff Report

Date: 2026-05-07
Branch: `feat/sprint-05-batch-3-completion-handoff`
Primary task: `docs/bmad/tasks/sprint-05-batch-3-completion-handoff.md`

## Summary

Sprint 05 Batch 3 handoff is now owner-test-ready for the intended MVP flow:

```text
upload / paste / file / photo / document
-> local extract or OpenAI dynamic read
-> mapping draft
-> coverage against public village detail fields
-> validation
-> diff
-> internal admin review
-> publish only after explicit review
```

What is now complete in code:

- diff engine no longer relies on `jsondiffpatch` root-array behavior for scalar fields,
- intake preview and submit-review now support a real OpenAI dynamic mapping path with graceful fallback,
- intake UI now shows live detail-field coverage against the current public village detail structure,
- unsupported findings are separated into:
  - `knownPublishableFields`
  - `detectedButNotPublishable`
  - `unknownUsefulFields`
- intake result flow is more linear and quieter:
  - input
  - result summary
  - detail field coverage
  - mapping and diff
  - review action
  - parser and AI detail collapsed
- Batch 1 and Batch 2 carry-over required by the handoff has been checked and documented.

What is still not fully complete:

- dedicated DB activation for `VillageDataVersion`,
- dedicated DB activation for `DesaDataAuditEvent`,
- OCR for scanned images and scanned PDFs,
- full `npm run build` closure while Prisma Windows `EPERM` still blocks `prisma generate`.

## Handoff Fixes Completed

### 1. Diff engine fix

Status: complete.

Implemented in:

- `src/lib/intake/diff-engine.ts`
- `src/tests/lib/intake-diff-engine.test.ts`

Result:

- scalar compare is now manual and deterministic:
  - previous equals next -> `unchanged`
  - previous empty and next filled -> `added`
  - previous filled and next empty -> `removed`
  - otherwise -> `updated`
- output shape stays compatible with the existing UI
- smoke test coverage now exists in Vitest

### 2. Public village detail alignment

Status: complete for Sprint 05 Batch 3 MVP.

Implemented in:

- `src/lib/intake/detail-field-coverage.ts`
- `src/lib/intake/types.ts`
- `src/lib/intake/openai-mapping.ts`
- `src/lib/intake/pipeline.ts`
- `src/components/internal-admin/IntakeWorkbench.tsx`

Result:

- intake review now compares uploaded content against the public village detail field registry,
- the UI shows:
  - fields already filled,
  - fields still empty,
  - fields covered by the upload,
  - fields detected but not yet publishable,
  - unknown useful fields,
- current value state is calculated live per selected desa, not faked in docs.

### 3. Flexible `DataDesa` + `DetailFieldStandard` direction

Status: documented and partially implemented as a code-level registry, not as active DB schema.

Current state:

- `Desa` remains the stable identity and current publish target.
- `DETAIL_FIELD_STANDARDS` inside `src/lib/intake/detail-field-coverage.ts` now acts as a temporary code-level `DetailFieldStandard` registry for Sprint 05.
- This registry is already used by:
  - intake coverage matrix,
  - OpenAI template-aware prompt building,
  - publishable vs deferred classification.

Still proposal-only:

- `DataDesa` table/model,
- DB-backed `DetailFieldStandard`,
- migration and runtime persistence for a flexible village data layer.

### 4. Compact UI / quiet luxury cleanup

Status: materially improved.

Result:

- main result flow is lighter and more linear,
- detail field coverage is brought forward,
- technical parser/AI detail is now collapsed,
- history and version history stay collapsed,
- primary action remains obvious,
- copy is simpler for non-technical users,
- layout remains usable on small screens such as iPhone 12 mini.

### 5. OpenAI dynamic mapping path

Status: complete for MVP draft mapping path.

Implemented in:

- `src/lib/intake/openai-mapping.ts`
- `src/app/api/internal-admin/intake/route.ts`
- `src/app/api/internal-admin/intake/submit-review/route.ts`
- `src/lib/intake/pipeline.ts`

Result:

- `OPENAI_API_KEY` is used server-side only,
- local parser remains first pass,
- OpenAI is triggered when:
  - user explicitly checks `Coba AI`,
  - input is image/photo,
  - local extraction fails,
  - heuristic mapping confidence is low,
- OpenAI response is structured JSON,
- no prompt/response body is logged,
- no document content is logged in full,
- output remains draft-only,
- internal admin review remains the only publish gate.

### 6. Dynamic mapping is flexible

Status: complete for detection, partial for publish target.

Current classification:

1. `knownPublishableFields`
2. `detectedButNotPublishable`
3. `unknownUsefulFields`

Important limitation:

- only the current stable scalar publish target is publishable now:
  - `websiteUrl`
  - `kategori`
  - `tahunData`
  - `jumlahPenduduk`
  - `kecamatan`
  - `kabupaten`
  - `provinsi`
- richer findings such as perangkat desa, anggaran, fasilitas, BUMDes, kontak, and dokumen publik are intentionally detected but not published into the wrong model.

### 7. No-cost / free mode

Status: preserved.

Result:

- no paid Supabase branch is required,
- no shared or production migration was applied,
- fallback versioning and audit remain honest,
- UI and API explicitly state whether dedicated tables are active or fallback mode is in use,
- local parser and manual paste still work when OpenAI is unavailable.

### 8. Public source availability check

Status: completed as a bounded manual check, no scraping, no integration.

### 9. Batch 1 and 2 carry-over closure

Status:

- `src/lib/perf.ts` duration unit fix: already closed and retained
- `src/lib/data/desa-read.ts` and `src/lib/data/voice-read.ts` mapping timer fix: already closed and retained
- Batch 1 report manual test numbers: already present
- Batch 2 report QA section: now added

## Code Outcome

Main code/files involved in the completion handoff:

- `src/app/api/internal-admin/intake/route.ts`
  - preview pipeline now supports local parse plus OpenAI fallback
- `src/app/api/internal-admin/intake/submit-review/route.ts`
  - submit-review path now supports the same dynamic mapping behavior
- `src/lib/intake/openai-mapping.ts`
  - server-side OpenAI Responses API adapter with structured JSON output and safe fallback states
- `src/lib/intake/detail-field-coverage.ts`
  - temporary field registry plus runtime coverage matrix
- `src/lib/intake/types.ts`
  - typed contract for AI status and coverage objects
- `src/lib/intake/pipeline.ts`
  - merged local plus OpenAI mapping, coverage summary, version candidate wiring
- `src/lib/intake/auto-mapping.ts`
  - heuristic mapping source string widened to support merged mode
- `src/lib/intake/diff-engine.ts`
  - manual scalar diff logic
- `src/tests/lib/intake-diff-engine.test.ts`
  - smoke tests for added, removed, updated, unchanged states
- `src/components/internal-admin/IntakeWorkbench.tsx`
  - field coverage UI, AI status UI, compact flow, collapsed technical detail

## Public Village Detail Coverage Matrix

The current public detail page is still backed primarily by:

- `Desa` scalar identity/core fields,
- `PerangkatDesa[]`,
- `DokumenPublik[]`,
- `AnggaranDesaSummary`,
- `APBDesItem[]`,
- derived or presentational values such as transparency score.

Important note:

- the "filled / empty when desa is selected" state below is calculated live in the UI for the selected desa.
- the report documents the runtime rule honestly instead of freezing fake sample values.

| Section | Field label / key | Current model/source | Current value state when desa selected | Currently mappable | AI-detectable | Publishable now | Deferred reason / note | Source requirement | Validation requirement |
|---|---|---|---|---|---|---|---|---|---|
| Identitas | Website resmi `websiteUrl` | `Desa.websiteUrl` | dynamic filled/empty from selected desa | yes | yes | yes | stable scalar publish target | sumber resmi desa / dokumen resmi | URL valid |
| Identitas | Kategori desa `kategori` | `Desa.kategori` | dynamic filled/empty from selected desa | yes | yes | yes | stable scalar publish target | dokumen profil / status desa | kategori masuk akal |
| Identitas | Tahun data `tahunData` | `Desa.tahunData` | dynamic filled/empty from selected desa | yes | yes | yes | stable scalar publish target | dokumen resmi yang menyebut periode | tahun valid |
| Demografi | Jumlah penduduk `jumlahPenduduk` | `Desa.jumlahPenduduk` | dynamic filled/empty from selected desa | yes | yes | yes | stable scalar publish target | profil/statistik desa | angka positif |
| Identitas | Kecamatan `kecamatan` | `Desa.kecamatan` | normally filled from selected desa | yes | yes | yes | stable scalar publish target | dokumen resmi | nama wilayah tidak kosong |
| Identitas | Kabupaten/Kota `kabupaten` | `Desa.kabupaten` | normally filled from selected desa | yes | yes | yes | stable scalar publish target | dokumen resmi | nama wilayah tidak kosong |
| Identitas | Provinsi `provinsi` | `Desa.provinsi` | normally filled from selected desa | yes | yes | yes | stable scalar publish target | dokumen resmi | nama wilayah tidak kosong |
| Pemerintahan | Nama kepala desa `kepalaDesa` | `PerangkatDesa[nama/jabatan]` | dynamic filled/empty from perangkat data | no | yes | no | needs richer publish target than scalar `Desa` allowlist | SK perangkat / profil resmi | nama + jabatan jelas |
| Pemerintahan | Daftar perangkat desa `perangkatDesa` | `PerangkatDesa[]` | dynamic filled/empty from perangkat rows | no | yes | no | needs item-level review and relasi write path | SK perangkat / struktur organisasi | nama, jabatan, review admin |
| Profil | Telepon desa `teleponDesa` | future profile/contact layer | usually empty in current public data | no | yes | no | no safe publish target yet | kontak resmi desa | nomor kontak valid |
| Profil | Email desa `emailDesa` | future profile/contact layer | usually empty in current public data | no | yes | no | no safe publish target yet | email resmi desa | email valid |
| Profil | Potensi unggulan `potensiUnggulan` | future profile layer | usually empty in current public data | no | yes | no | better fit for flexible `DataDesa` | profil/potensi desa | kategori + sumber jelas |
| Profil | Fasilitas umum `fasilitasUmum` | future profile/facility layer | usually empty in current public data | no | yes | no | needs list/relational target, not scalar fallback | profil/fasilitas resmi | label, jumlah, kondisi, sumber |
| Profil | BUMDes `bumdesNama` | future profile/BUMDes layer | usually empty in current public data | no | yes | no | better fit for flexible profile/business registry | profil / dokumen BUMDes | nama, status, sumber |
| Profil | Aset desa `asetDesa` | future asset layer | usually empty in current public data | no | yes | no | too structured and sensitive for scalar publish | dokumen aset resmi | nama, nilai, tahun, kondisi |
| Dokumen | Dokumen publik `dokumenPublik` | `DokumenPublik[]` | dynamic filled/empty from document rows | no | yes | no | needs per-document mapping, not one scalar field | judul, status, file/reference, sumber | tiap item wajib lengkap |
| Dokumen | Skor transparansi `skorTransparansi` | derived system score | derived when source/doc data exists | no | no | no | derived metric, not input-mapped field | turunan sistem | not applicable |
| Anggaran | Total anggaran `totalAnggaran` | `AnggaranDesaSummary.totalAnggaran` | dynamic filled/empty from summary | no | yes | no | intake publish to summary not opened yet | APBDes / dokumen anggaran resmi | tahun + sumber jelas |
| Anggaran | Realisasi anggaran `terealisasi` | `AnggaranDesaSummary.totalRealisasi` | dynamic filled/empty from summary | no | yes | no | needs summary review path | dokumen realisasi resmi | angka + tahun + sumber |
| Anggaran | Rincian APBDes `apbdesItems` | `APBDesItem[]` | dynamic filled/empty from APBDes rows | no | yes | no | needs item-level mapping and table write path | dokumen APBDes resmi | bidang, nilai, tahun |

Practical outcome:

- the owner can now see exactly which public detail fields are already covered by the upload,
- unsupported fields are not forced into the wrong table just to make the UI look complete,
- the current UI is honest about what is publishable now vs what still needs the future flexible model.

## `DataDesa` and `DetailFieldStandard` Direction

Status:

- documented clearly,
- partially represented in code through `DETAIL_FIELD_STANDARDS`,
- not migrated or activated in DB.

### Current shipped direction

Temporary runtime shape already in use:

```text
Desa
  -> current stable identity and publish target

DETAIL_FIELD_STANDARDS (code registry)
  -> section key
  -> section label
  -> field key
  -> field label
  -> current model source
  -> publishable now yes/no
  -> AI-detectable yes/no
  -> source requirement
  -> validation requirement
  -> deferred reason
```

### Proposed next DB-backed direction

```text
Desa
  1 -> many DataDesa

DataDesa
  - desaId
  - categoryKey
  - fieldKey
  - label
  - valueText / valueNumber / valueDate / valueJson
  - year
  - sourceId
  - pipelineStatus
  - reviewStatus
  - confidence
  - publishedAt
  - createdBy / reviewedBy / publishedBy

DetailFieldStandard
  - sectionKey
  - sectionLabel
  - fieldKey
  - fieldLabel
  - expectedValueType
  - sourceRequired
  - validationRule
  - displayOrder
  - isPublic
  - isActive
  - mapsToModel / mapsToPath
  - publishTarget
```

### Status decision

- for Sprint 05 Batch 3, the code-level registry is enough to make intake and coverage testable,
- the DB-backed flexible model remains proposal-only until owner approves migration work,
- no shared or production migration was applied.

## OpenAI Dynamic Mapping Result

Status: implemented and testable when `OPENAI_API_KEY` is available.

### Trigger rules

OpenAI is attempted when one or more of these are true:

- user explicitly enables `Coba AI`,
- input is image/photo,
- local extraction fails,
- heuristic mapping confidence is low.

### Structured output categories

The OpenAI path now returns:

```text
knownPublishableFields
knownFieldEvidence
detectedButNotPublishable
unknownUsefulFields
confidence
warnings
```

### Fallback behavior

Possible statuses:

- `success`
- `skipped`
- `missing_key`
- `rate_limited`
- `quota_limited`
- `error`
- `invalid_json`

Behavior:

- preview route does not crash when OpenAI is unavailable,
- submit-review route does not crash when OpenAI is unavailable,
- user sees an honest message and can fall back to:
  - parser lokal
  - paste text
  - clearer source document

### Security and privacy guardrails

- `OPENAI_API_KEY` stays server-side only
- no secret/key logging
- no full document content logging
- no full prompt logging
- no full response logging
- AI output remains draft-only

## UI Cleanup Summary

Status: implemented.

The result flow is now closer to the requested order:

1. input
2. result summary
3. detail field coverage
4. mapping and diff
5. review action
6. technical and history details collapsed

Concrete UI changes:

- result starts with short status cards and decision summary,
- field coverage is visible early,
- "Apa Yang Terbaca Utama" is pushed forward,
- parser and AI detail is moved into a collapsed section,
- history and version history remain collapsed,
- review action stays explicit and clearly non-publishing,
- copy avoids technical jargon where possible.

## No-Cost / Free Mode Clarification

Status: respected.

- no paid Supabase branch was used,
- no DB migration was applied to shared or production DB,
- version history and audit use honest fallback mode when dedicated tables are inactive,
- UI badges and API storage metadata explain whether the app is reading dedicated tables or fallback audit data,
- OpenAI can be used when env is present, but the flow still works without it.

## Public Source Availability Check

This was a bounded manual check of public, non-login pages only. No scraping and no restricted data access was performed.

| Source | What was visibly found | Access method | Limitation | Future adapter fit |
|---|---|---|---|---|
| SID Kemendesa IDM | public filters down to desa; visible ranking/year comparison; detail area shows score, status, target status, minimal score, indicator table; page shows last update 20 April 2026 | public web | export/API contract still unclear | high for manual verification and later structured adapter |
| SID Kemendesa Profil | public search by desa/kecamatan/kabupaten/provinsi; visible statistik categories including Penduduk, Pekerjaan, Agama, Pendidikan, Kantor Desa, RT/RW, Lapangan Olahraga, Pasar Desa, Web Desa, Peta Desa; BNBA explicitly requires login | public web | BNBA must stay out of scope; some details may be UI-only | high for profile/reference adapter |
| Satu Data Indonesia / data.go.id `Jumlah Penduduk Desa` | public dataset page with raw resources listed as `PETADESANAMADANPDDK`; search snippet indicates open dataset status and downloadable resource presence | public dataset portal | field quality and freshness must still be validated per dataset | medium-high for demography helper |
| SID Dana Desa | public page with year filters 2021-2026; visible sections for Penyaluran Dana Desa, Padat Karya Tunai Desa, BLT Desa; table headings include wilayah, jumlah desa, pagu anggaran, penyaluran, persentase, monthly BLT counts; page shows last update 20 April 2026 | public web | exact desa-level row access still needs careful adapter validation | high for budget/reference adapter |

Conclusion:

- public non-login reference data does exist,
- the safest next step is still source-aware manual review and later bounded adapters,
- Batch 3 does not yet add ingestion code from these sources.

## Batch 1 and 2 Carry-over Close-out

Checked against the handoff requirement:

- `src/lib/perf.ts` duration unit uses `Math.round(event.duration)` and remains correct
- `src/lib/data/desa-read.ts` timer split remains correct:
  - DB query timing is isolated from mapping timing
- `src/lib/data/voice-read.ts` timer split remains correct:
  - fetch timing is isolated from map timing
- Batch 1 report already contains owner test numbers:
  - `/desa` routeDataReady about `1235ms`
  - `/desa/[id]` routeDataReady about `2169ms`
  - `/suara-warga` routeDataReady about `1281ms`
- Batch 2 report now includes a QA section

## QA Result

| Command | Result | Note |
|---|---|---|
| `npm run lint` | PASS | existing `.eslintignore` deprecation warning only |
| `npx tsc --noEmit` | PASS | intake/OpenAI/coverage changes compile cleanly |
| `npm test -- src/tests/lib/intake-diff-engine.test.ts` | PASS | had to be rerun outside sandbox because Vitest hit `spawn EPERM` inside sandbox |
| `npx prisma generate` | BLOCKED | Windows Prisma `EPERM` |
| `npm run build` | BLOCKED | build stops because `prisma generate` fails first |

Exact Prisma blocker that must remain visible:

- sandbox failure: `EPERM: operation not permitted, lstat 'C:\\Users\\IWANKU~1'`
- local engine/file-lock failure when attempted outside sandbox previously: `EPERM` rename on `query_engine-windows.dll.node`

Interpretation:

- lint, tests, and TypeScript pass,
- the remaining build blocker is Prisma-on-Windows environment behavior, not a source-level type error in the Batch 3 completion work.

## Guardrails Respected

- no auto-publish of parser or OpenAI output
- no auth bypass
- no shared or production DB migration apply
- no paid Supabase requirement
- no dummy data promoted as real public data
- no unsupported field forced into the wrong model
- no secret or sensitive content logging
- no `.env` or `.env.local` committed
- no production env changes from code

## Remaining Carry-over

Still not fully complete:

- `VillageDataVersion` dedicated table is still inactive in DB
- `DesaDataAuditEvent` dedicated table is still inactive in DB
- versioning is still fallback-backed, not yet full DB-backed immutable history
- OCR for scanned image/scanned PDF is still deferred
- full `npm run build` closure is still blocked by Prisma Windows `EPERM`

Concrete next action for each blocker:

- DB-backed versioning/audit:
  - apply approved local/dev migration later
  - run `prisma generate`
  - verify read/write path to dedicated tables
- OCR:
  - owner approval on dependency/service direction
  - then add bounded OCR path
- build closure:
  - resolve Windows Prisma engine/file-lock issue first

## Owner Test Checklist

### Route / page to open

- Open `/internal-admin/intake`

### File types to test

- `.txt`
- `.csv`
- `.docx`
- `.xlsx`
- `.pdf` that already contains selectable text
- `.jpg`, `.jpeg`, `.png`, `.webp` for AI-assisted image path

### Basic happy path

1. Pick a desa from the search list.
2. Upload a file or paste text.
3. Optionally enable `Coba AI`.
4. Click `Jalankan pipeline`.
5. Check:
   - result summary
   - detail field coverage
   - `Apa Yang Terbaca Utama`
   - validation
   - diff
6. Click `Kirim ke antrean review`.
7. Open `/internal-admin/documents?status=PROCESSING`.
8. Continue review from the queue.

### Photo / scanned document behavior

- With `Coba AI` enabled:
  - the app should attempt AI-assisted draft reading
  - no auto-publish must happen
- If the document is too weak and no usable draft is recovered:
  - the app must return an honest error
  - it must not fake a successful parse

### OpenAI available behavior

Expected:

- `Bantuan AI` shows as used or helpful when AI really contributed
- field coverage may show more:
  - detected-but-not-publishable fields
  - unknown useful fields
- result remains preview-only and review-only

### OpenAI unavailable / quota / rate-limit behavior

Expected:

- no crash
- clear fallback message
- parser lokal or manual paste remains usable
- no publish

### How to check detail field coverage

- In the result page, open the `Cakupan field detail` block.
- Confirm that it shows:
  - already filled
  - still empty
  - covered by upload
  - detected but not publishable
  - publishable now

### How to check filled / empty fields

- Select a desa that already has some public data.
- Run the pipeline.
- In the coverage section, confirm:
  - `Sudah terisi` reflects current public data that already exists
  - `Masih kosong` reflects fields still missing in the current public data

### How to check detected-but-not-publishable fields

- Use a richer sample document that mentions:
  - perangkat desa
  - fasilitas
  - potensi
  - BUMDes
  - anggaran
- Confirm these appear under:
  - `Terdeteksi tetapi belum aman dipublish`
  - or `Temuan lain yang mungkin berguna`

### How to check diff

- Pick a desa first.
- Use a sample that intentionally changes:
  - website
  - jumlah penduduk
  - tahun data
  - kategori
- Confirm diff shows:
  - `Added`
  - `Updated`
  - `Removed`
  - or `Same` correctly

### How to submit to review

- Ensure a desa is selected.
- Ensure validation is acceptable.
- Click `Kirim ke antrean review`.
- Confirm:
  - item enters `PROCESSING`
  - no public data changes immediately

### What must not happen

- no auto-publish from intake page
- no silent success on unreadable input
- no secret or full document content in logs
- no unsupported field written into the wrong public model

### What screenshots / logs owner should send back

- screenshot of result summary
- screenshot of detail field coverage
- screenshot of diff
- screenshot of queue item after submit
- file type used
- whether `Coba AI` was on or off
- exact error text if any
- short server log snippet only if runtime error occurred

## Copy-Paste Short Report For Rangga

```text
Rangga, Sprint 05 Batch 3 completion handoff sudah saya kerjakan di branch `feat/sprint-05-batch-3-completion-handoff`.

Yang sudah ditutup:
- diff engine scalar sekarang manual dan ada smoke test
- intake preview + submit-review sekarang punya OpenAI dynamic mapping path yang aman dan graceful fallback
- intake UI sekarang menampilkan coverage matrix terhadap field halaman detail desa publik
- hasil AI sekarang dipisah jadi:
  - knownPublishableFields
  - detectedButNotPublishable
  - unknownUsefulFields
- hasil intake sekarang lebih linear dan technical detail parser/AI sudah dicollapse
- Batch 2 report sekarang sudah punya QA section

Catatan penting:
- publish target yang benar-benar aktif masih scalar core `Desa` fields, jadi temuan kaya perangkat, anggaran, fasilitas, potensi, kontak, dan dokumen publik masih dideteksi sebagai draft, belum dipublish ke model yang salah
- no-cost mode tetap dijaga, tidak ada shared DB migration yang diapply

QA:
- npm run lint: PASS
- npx tsc --noEmit: PASS
- npm test -- src/tests/lib/intake-diff-engine.test.ts: PASS
- npx prisma generate: BLOCKED, Prisma Windows EPERM
- npm run build: BLOCKED karena prisma generate gagal duluan

Mohon review fokus ke:
1. apakah OpenAI fallback behavior sudah jujur dan aman
2. apakah coverage matrix terhadap public detail page sudah masuk akal
3. apakah UI result sekarang cukup linear dan tidak terlalu teknis untuk owner
4. apakah carry-over yang tersisa sudah terdokumentasi jujur
```

## Copy-Paste Short Report For Owner

```text
Owner, Sprint 05 Batch 3 completion handoff sekarang sudah siap dites untuk flow:

upload/paste/file/photo
-> parser lokal atau AI draft read
-> mapping draft
-> coverage field detail desa
-> validasi
-> diff
-> kirim ke review internal

Halaman test:
/internal-admin/intake

Yang perlu dicek:
1. upload file teks biasa seperti TXT/CSV/DOCX/XLSX/PDF teks
2. coba juga image/photo dengan `Coba AI`
3. pilih desa agar coverage filled/empty dan diff bisa terlihat
4. cek bahwa hasil AI yang belum aman dipublish tetap ditandai sebagai draft atau detected-only
5. klik `Kirim ke antrean review` dan pastikan item masuk ke `/internal-admin/documents?status=PROCESSING`

Yang tidak boleh terjadi:
- tidak boleh auto-publish
- tidak boleh diam-diam sukses kalau input tidak terbaca
- tidak boleh ada perubahan data publik langsung dari halaman intake

Kalau ada issue, mohon kirim:
- screenshot result summary
- screenshot field coverage
- screenshot diff
- file type yang dipakai
- apakah `Coba AI` aktif
- error text kalau muncul
```

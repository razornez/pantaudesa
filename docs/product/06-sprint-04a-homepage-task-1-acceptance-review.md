# Sprint 04A Homepage Task 1 Acceptance Review

Date: 2026-04-27
Status: accepted-with-minor-revision
Reviewer: ChatGPT Freelancer / Rangga
Review type: Product/UX acceptance review

## Scope reviewed

Sprint 04A UI-only Task 1:

- homepage reorder,
- safe framing for priority/ranking section,
- chart/donut prominence reduction,
- no seed/read path/schema/DB/API/auth/voice/scheduler/scraper changes.

Related commit reviewed:

- `ae6e5c9445c338fef9a312bc663164dc6f77f4f0`

Related implementation report:

- `docs/product/05-homepage-ui-task-1-implementation-report.md`

## Product/UX verdict

Accepted with minor revision.

Task 1 is directionally correct and can be accepted as Sprint 04A homepage foundation work.

## What is accepted

- Current `HeroSection` visual direction is preserved.
- Priority/ranking hook is moved immediately after hero.
- Copy is safer and less accusatory.
- `Perlu Diawasi` framing is replaced with `Perlu Ditinjau` / `Prioritas Cek Transparansi` style language.
- Alert visual tone is softened from danger/rose to review/amber.
- Chart and donut are reduced into supporting context.
- Mock fallback remains.
- No data-layer or runtime risk was introduced.

## Minor revisions recommended

These should be handled in Task 2 or Task 3, not blocking Task 1 acceptance:

1. Replace `Kondisi Anggaran Desa Se-Indonesia` with softer demo-aware wording.
   - Recommended: `Apa yang Sedang Dipetakan?`
   - Alternative: `Gambaran Data Demo PantauDesa`

2. Replace `Desa Paling Rajin` because it still feels slightly judgmental.
   - Recommended: `Capaian Serapan Tinggi`
   - Alternative: `Desa dengan Capaian Tinggi`

3. Add visible `Data Demo` badge/note near priority/ranking metrics.

4. Refresh `PondasiTransparansiSection` later into `Bukan Menuduh, Tapi Membaca` manifesto.

## Risks to watch

- Percentage values can still feel like verified facts without clear `Data Demo` labeling.
- Ranking can still feel judgmental if wording is not consistently softened.
- Homepage can remain crowded if new sections are added without reducing old dashboard feel.
- Civic-safe tone must be preserved across all labels, not only the alert section.

## Gate decision

Task 1 may be accepted.

Recommended next gate:

- Proceed to Sprint 04A Task 2 after Iwan approval.
- Task 2 should add fresh static sections while carrying forward the minor copy cleanup above.

## Boundary confirmation

No instruction to Ujang is issued by Rangga in this review.

No changes were made to:

- schema,
- database,
- seed,
- read path,
- API,
- auth,
- voice,
- scheduler,
- scraper,
- Prisma runtime.

Initiated-by: Owner request
Reviewed-by: Pending Iwan
Executed-by: ChatGPT Freelancer / Rangga
Status: accepted-with-minor-revision

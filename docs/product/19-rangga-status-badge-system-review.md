# Rangga Reusable Status Badge System Review

Date: 2026-04-28
Status: ACCEPTED_FOR_OWNER_REVIEW
Reviewer: ChatGPT Freelancer / Rangga
Review type: Product/UX gate review against owner-feedback tracker IDs

## Scope reviewed

Commit reviewed:

- `79f342c09e95994860fc2087268e13d05f15c337`

Report reviewed:

- `docs/product/18-status-badge-system-report.md`

Affected routes:

- `http://localhost:3000/`
- `http://localhost:3000/desa/4`

Tracker IDs reviewed:

- `STATUS-01`
- `STATUS-02`
- `STATUS-04`
- `STATUS-05`
- `STATUS-06`

Blocked IDs checked:

- `STATUS-03`
- `STATUS-07`

Important note:

- Rangga could not directly open localhost from this environment.
- Review is based on commit diff, current source files, and Ujang implementation report.
- Final visual acceptance still requires Iwan/Owner to open the affected routes locally.

## Verdict

`ACCEPTED_FOR_OWNER_REVIEW`

Reason:

The reusable `DataStatusBadge` system is directionally correct, matches the Owner feedback for demo/source/review status clarity, and keeps `Terverifikasi` as disabled/future rather than an active state.

Do not mark final `ACCEPTED` until Iwan/Owner visual approval.

## Tracker ID review

| Tracker ID | Review result | Notes |
|---|---|---|
| STATUS-01 | PASS_WITH_SCOPE_NOTE | Important selected locations now show status badges near ranking, detail first view, budget/stat cards, and source/document snapshot. This is not yet a full sitewide inventory. |
| STATUS-02 | PASS | Reusable component supports `Data Demo`, `Sumber Ditemukan`, `Perlu Review`, and `Terverifikasi`. |
| STATUS-04 | PASS | `Data Demo` uses amber/cream tone, flask icon, and microcopy that clearly says it is not official/final. |
| STATUS-05 | PASS | `Sumber Ditemukan` uses blue/teal tone, globe icon, and microcopy that avoids implying verification. |
| STATUS-06 | PASS | `Perlu Review` uses orange/amber tone and caution icon; wording is careful, not accusatory. |
| STATUS-03 | BLOCKED_CONFIRMED | Active `Terverifikasi` remains blocked until verification workflow exists. |
| STATUS-07 | BLOCKED_CONFIRMED | Verified visual exists only as disabled/future legend state; no active data-bearing verified state was introduced. |

## Review checks

## 1. Is `DataStatusBadge` reusable and aligned with Owner feedback?

PASS.

`src/components/ui/DataStatusBadge.tsx` introduces a reusable component with typed status kinds:

- `demo`
- `source-found`
- `needs-review`
- `verified`

It supports compact badge mode and microcopy panel mode. This is aligned with the Owner request for a memorable, reusable status badge system.

## 2. Are Data Demo, Sumber Ditemukan, and Perlu Review visually consistent?

PASS.

The statuses use consistent structure:

- icon,
- label,
- semantic color tone,
- compact badge style,
- optional microcopy panel.

Current tone mapping:

- `Data Demo`: amber/cream + flask icon.
- `Sumber Ditemukan`: sky/teal-ish tone + globe icon.
- `Perlu Review`: orange/amber + alert triangle.

This is visually consistent enough for first-pass Owner review.

## 3. Is Terverifikasi disabled/future, not active?

PASS.

`verified` exists in the component, but it is visibly disabled through opacity/grayscale and microcopy:

```text
Belum aktif sampai workflow verifikasi tersedia.
```

Ujang report also confirms no active `Terverifikasi` state was added.

## 4. Are badges close to important number/status context?

PASS_WITH_SCOPE_NOTE.

Badges were added to important selected contexts:

- homepage priority/ranking area,
- homepage status legend,
- desa detail first view,
- detail demo/status note,
- budget/stat cards,
- source/document snapshot.

Scope note:

This gate does not complete a full sitewide inventory of every metric/chart/card. That is acceptable for this gate, but future read path/seed work must not assume status coverage is complete everywhere.

## 5. Does microcopy avoid making data look official/verified?

PASS.

Microcopy is safe:

- `Data ini masih demo, belum menjadi fakta resmi.`
- `Sumber publik ditemukan, belum berarti terverifikasi.`
- `Perlu dicek sebelum jadi rujukan.`
- `Belum aktif sampai workflow verifikasi tersedia.`

This preserves the trust layer and avoids official/verified implication.

## 6. Any seed/read path/schema/DB/API/Prisma/scraper/numeric extraction changes?

PASS based on reviewed commit/report.

The changed files are UI/docs only:

- `src/components/ui/DataStatusBadge.tsx`
- `src/components/home/DataStatusCardsSection.tsx`
- `src/app/page.tsx`
- `src/app/desa/[id]/page.tsx`
- `src/components/desa/DesaDetailFirstView.tsx`
- `src/components/desa/SourceDocumentSnapshotSection.tsx`
- `docs/product/18-status-badge-system-report.md`

No seed/read path/schema/DB/API/Prisma/scraper/numeric APBDes extraction changes were visible in the reviewed commit.

## 7. Is full lint failure old debt outside scope?

PASS based on report.

Ujang report says:

- `npx tsc --noEmit`: PASS
- `npm run test`: PASS after sandbox escalation, 42/42 tests passed
- targeted lint for changed files: PASS
- full `npm run lint`: FAIL due existing unrelated lint errors outside this gate

Reported full-lint debt files:

- `src/app/desa-admin/dokumen/page.tsx`
- `src/components/desa/SuaraWargaSection.tsx`
- `src/components/ui/OtpInput.tsx`
- `src/components/ui/PinInput.tsx`
- `src/lib/use-countdown.ts`

This looks acceptable for this UI-only gate, provided it remains tracked separately and is not caused by the new status badge work.

## Remaining risks / caveats

1. Final visual approval is still required from Iwan/Owner on localhost.
2. `STATUS-01` is only covered for selected important locations, not every possible metric/chart/card across the whole app.
3. `Terverifikasi` appears in the homepage educational legend as disabled/future; Owner/Iwan should confirm that this is acceptable and not confusing.
4. Full repo lint still has known unrelated debt and should not be silently forgotten.
5. This gate does not open seed/read path or real data integration.

## Recommended Owner/Iwan visual checklist

Open:

- `http://localhost:3000/`
- `http://localhost:3000/desa/4`

Check:

1. `Data Demo` badge is easy to notice near demo/ranking/number context.
2. `Sumber Ditemukan` does not feel like verified data.
3. `Perlu Review` feels careful, not scary or accusatory.
4. `Terverifikasi` appears only as disabled/future education, not active data state.
5. Badge colors are readable on mobile.
6. Budget/stat cards still fit and remain understandable on mobile.
7. No data-bearing UI claims active verified status.

## Recommendation

Move this gate to Iwan/Owner visual review.

If visually accepted, update tracker:

- `STATUS-01`: ACCEPTED with selected-location scope note.
- `STATUS-02`: ACCEPTED.
- `STATUS-04`: ACCEPTED.
- `STATUS-05`: ACCEPTED.
- `STATUS-06`: ACCEPTED.

Keep blocked:

- `STATUS-03`
- `STATUS-07`

Do not open:

- seed execution,
- read path switch,
- schema/DB/API/Prisma,
- scraper/import,
- numeric APBDes extraction,
- active `Terverifikasi` state.

Initiated-by: Iwan/Ujang report
Reviewed-by: ChatGPT Freelancer / Rangga
Status: ACCEPTED_FOR_OWNER_REVIEW

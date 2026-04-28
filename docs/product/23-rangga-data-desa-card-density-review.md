# Rangga Data Desa Card Density Review

Date: 2026-04-28
Status: ACCEPTED_FOR_OWNER_REVIEW
Reviewer: ChatGPT Freelancer / Rangga
Review type: Product/UX gate review against owner-feedback tracker IDs

## Scope reviewed

Commit reviewed:

- `6d88bc50278cff053c47e7a23158a671572b01d9`

Report reviewed:

- `docs/product/22-data-desa-card-density-report.md`

Affected route:

- `http://localhost:3000/desa`

Tracker IDs reviewed:

- `DATA-DESA-01`
- `DATA-DESA-02`
- `DATA-DESA-03`
- `DATA-DESA-04`
- `DATA-DESA-05`
- `DATA-DESA-06`
- `DATA-DESA-07`

Important note:

- Rangga could not directly open localhost from this environment.
- Review is based on commit diff, current source file, and Ujang implementation report.
- Final visual acceptance still requires Iwan/Owner to open the affected route locally.

## Verdict

`ACCEPTED_FOR_OWNER_REVIEW`

Reason:

The Data Desa card has been simplified into the requested hierarchy and is directionally aligned with Owner feedback about reducing density and improving scanability.

Do not mark final `ACCEPTED` until Iwan/Owner visual approval.

## Tracker ID review

| Tracker ID | Review result | Notes |
|---|---|---|
| DATA-DESA-01 | PASS | Card now shows fewer visible data points and should be easier to scan. |
| DATA-DESA-02 | PASS | Row 1 is now desa name + status badge only. |
| DATA-DESA-03 | PASS | Row 2 shows location as kecamatan / kabupaten / provinsi. |
| DATA-DESA-04 | PASS | Row 3 shows progress/serapan as the main visual metric with compact Data Demo badge. |
| DATA-DESA-05 | PASS | Row 4 shows only two numbers: `Diterima` and `Dipakai`. |
| DATA-DESA-06 | PASS | Population/jumlah jiwa and category are removed from card first view. |
| DATA-DESA-07 | PASS_WITH_VISUAL_CHECK_REQUIRED | Card remains a full clickable Link with focus-visible ring and hover behavior. Owner/Iwan should verify keyboard/mobile feel locally. |

## Review checks

## 1. Is the Data Desa card lighter and easier to scan?

PASS.

The card no longer mixes identity, location, metrics, population, category, and arrow in one compact view. The card now has a clearer sequence:

1. Desa identity and status.
2. Location.
3. Progress.
4. Two budget numbers.

This is easier to scan and matches the density-reduction intent.

## 2. Is hierarchy correct?

PASS.

Current hierarchy in `src/components/desa/DesaCard.tsx`:

- Row 1: desa name + status badge.
- Row 2: kecamatan / kabupaten / provinsi.
- Row 3: progress/serapan + `DataStatusBadge status="demo"` + percentage.
- Row 4: `Diterima` and `Dipakai`.

This matches the requested hierarchy.

## 3. Are jumlah jiwa and kategori removed from first view?

PASS.

The old footer row with:

- `desa.penduduk.toLocaleString("id-ID") jiwa`
- `desa.kategori`
- footer arrow

has been removed from the card first view.

## 4. Is Data Demo badge near progress clear enough?

PASS_WITH_VISUAL_CHECK_REQUIRED.

Code places `<DataStatusBadge status="demo" size="xs" />` directly beside the progress label. This is the right location because progress/serapan is the most interpretation-sensitive number on the card.

Owner/Iwan should still check mobile width because the progress row uses wrapping and may become visually tight on narrow screens.

## 5. Does mobile feel not too crowded?

PASS_WITH_VISUAL_CHECK_REQUIRED.

Based on source structure, mobile should be lighter than before because population/category/arrow were removed. However, localhost mobile visual check is still required because:

- long province names can wrap,
- `Data Demo` badge sits in the progress row,
- two budget cards can still feel dense if currency strings are long.

## 6. Is card clickable and focus behavior safe?

PASS.

The whole card remains a `Link`, and the anchor keeps:

- `focus-visible:outline-none`
- `focus-visible:ring-2`
- `focus-visible:ring-indigo-500`
- `focus-visible:ring-offset-2`
- `rounded-2xl`

It also keeps a useful aria-label:

```text
Lihat detail [nama desa], [kecamatan], [kabupaten]
```

## 7. Any seed/read path/schema/DB/API/Prisma/scraper/numeric extraction changes?

PASS based on reviewed commit/report.

The changed files are UI/docs only:

- `src/components/desa/DesaCard.tsx`
- `docs/product/22-data-desa-card-density-report.md`

No seed/read path/schema/DB/API/Prisma/scraper/numeric APBDes extraction changes were visible in the reviewed commit.

## 8. Is lint failure old lint debt outside scope?

PASS based on report.

Ujang report says:

- `npx tsc --noEmit`: PASS
- `npm run test`: PASS after sandbox escalation, 42/42 tests passed
- `npx eslint src/components/desa/DesaCard.tsx`: PASS
- full `npm run lint`: FAIL due existing unrelated lint debt outside this gate

Reported old lint debt files:

- `src/app/desa-admin/dokumen/page.tsx`
- `src/components/desa/SuaraWargaSection.tsx`
- `src/components/ui/OtpInput.tsx`
- `src/components/ui/PinInput.tsx`
- `src/lib/use-countdown.ts`

This is acceptable for this UI-only gate as long as it remains tracked separately.

## Caveats / watch items

1. Owner/Iwan still need to visually test `http://localhost:3000/desa` on desktop and mobile.
2. Location can wrap to two lines for long desa/kabupaten/provinsi names; this is acceptable if it remains readable.
3. Two budget number cards may still feel dense if currency strings are long; visual review should confirm.
4. The status badge beside desa name still uses `getStatusColor/getStatusLabel`; this is desa-performance/status label, not the reusable data-status badge. It is not blocking for this gate, but later product language should keep it non-accusatory.
5. Table view was not changed; this gate only covers card density.

## Recommended Owner/Iwan visual checklist

Open:

- `http://localhost:3000/desa`

Check desktop and mobile:

1. Each card is easier to scan than before.
2. First row reads as desa name + status only.
3. Location is visible but secondary.
4. Progress row is clear and not too crowded.
5. `Data Demo` badge is close to progress and readable.
6. Only `Diterima` and `Dipakai` appear as first-view numbers.
7. `jumlah jiwa` and `kategori` are not crowding first view.
8. Cards still feel clickable.
9. Keyboard focus ring is visible.
10. Mobile view does not feel too busy.

## Recommendation

Move this gate to Iwan/Owner visual review.

If visually accepted, update tracker:

- `DATA-DESA-01`: ACCEPTED
- `DATA-DESA-02`: ACCEPTED
- `DATA-DESA-03`: ACCEPTED
- `DATA-DESA-04`: ACCEPTED
- `DATA-DESA-05`: ACCEPTED
- `DATA-DESA-06`: ACCEPTED
- `DATA-DESA-07`: ACCEPTED

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

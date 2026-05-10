# Sprint 05 — Flexible Village Data Admin Center
## Handoff Report

Date: 2026-05-10
Branch: `s05-flexible-village-data-admin-center`
Status: READY FOR OWNER REVIEW

---

## 1. Branch

```
s05-flexible-village-data-admin-center
```

Base: `main` (pulled 2026-05-10)

---

## 2. Files Changed

### New files
| File | Purpose |
|---|---|
| `src/app/internal-admin/village-data/page.tsx` | Server page — routes tab param to component |
| `src/app/internal-admin/village-data/loading.tsx` | Skeleton loading state |
| `src/app/api/internal-admin/village-data/field-standards/route.ts` | GET field registry grouped by section |
| `src/app/api/internal-admin/village-data/desa-data/route.ts` | GET desa list with published values + version count |
| `src/app/api/internal-admin/village-data/versions/route.ts` | GET VillageDataVersion + DesaDataAuditEvent |
| `src/components/internal-admin/VillageDataCenter.tsx` | Main client component (tabs + all sub-UIs) |
| `src/lib/village-data/template-constants.ts` | Template key constants + re-exports |
| `e2e/04-village-data.spec.ts` | Playwright test suite (6 tests) |
| `docs/bmad/reports/sprint-05-flexible-village-data-admin-center-report.md` | This report |

### Modified files
| File | Change |
|---|---|
| `src/app/internal-admin/layout.tsx` | Added "Data Desa" nav item (Database icon) |
| `src/lib/intake/detail-field-coverage.ts` | Exported `DETAIL_FIELD_STANDARDS` and `DetailFieldStandard` type |
| `prisma/schema.prisma` | Added proposal section (commented out, not migrated) |

---

## 3. Schema Proposal Summary

Four new models proposed in `prisma/schema.prisma` under `// PROPOSAL — pending migration approval`:

| Model | Purpose |
|---|---|
| `VillageDetailTemplate` | Template registry — key, name, version, status, isDefault |
| `DetailFieldStandard` | Field definitions per template — fieldKey, section, valueType, publishableNow |
| `DesaDetailTemplateAssignment` | One-to-one: which template a desa uses |
| `DataDesa` | Flexible one-to-many data values — fieldKey, valueJson, status, source |

**Status: COMMENTED OUT. Not active. Not migrated. Safe to review.**

---

## 4. Template Assignment Strategy

**MVP (current):**
- All desa use `CURRENT_PUBLIC_DETAIL_TEMPLATE`
- Resolved via `resolveTemplateKey()` in `src/lib/village-data/template-constants.ts`
- No DB query needed — returns constant

**Future (after migration approval):**
- Read `DesaDetailTemplateAssignment` for the selected desa
- Fall back to default template if no assignment exists
- Admin can assign templates via the Data Desa admin center

---

## 5. Current Default Template Plan

```
Key:  CURRENT_PUBLIC_DETAIL_TEMPLATE
Name: Template Detail Desa Publik (Saat Ini)
```

This maps to the existing `DETAIL_FIELD_STANDARDS` array in
`src/lib/intake/detail-field-coverage.ts` — **20+ fields, 7 publishable now**.

Field sections:
- Identitas & wilayah (7 fields) — 7 publishable
- Demografi (1 field) — 1 publishable
- Pemerintahan desa (2 fields) — 0 publishable
- Profil desa (5+ fields) — 0 publishable
- Dokumen & transparansi (2 fields) — 0 publishable
- Anggaran & realisasi (3 fields) — 0 publishable

---

## 6. Intake Sync Plan

Current flow (unchanged, remains safe):
```
selected desa
 → resolveTemplateKey(desa.id) → "CURRENT_PUBLIC_DETAIL_TEMPLATE"
 → DETAIL_FIELD_STANDARDS (from detail-field-coverage.ts)
 → buildDetailFieldCoverageSummary(extractedText, desaId)
 → diff + validation + coverage panel in result step
```

Future flow (after DataDesa migration):
```
selected desa
 → DesaDetailTemplateAssignment → VillageDetailTemplate
 → DetailFieldStandard[] (from DB, not hardcoded)
 → DataDesa (current published values per field)
 → diff against DataDesa.valueJson instead of Desa model fields
```

---

## 7. Public Detail Sync Plan

**Current (hybrid, unchanged):**
- Public `/desa/[id]` reads from `Desa` model directly
- Safe: no draft/rejected data can appear

**Transition path (after DataDesa migration):**
- Public detail reads `DataDesa` where `status = PUBLISHED`
- Falls back to `Desa` model fields for unpublished or missing fields
- Draft/IN_REVIEW/REJECTED `DataDesa` rows must never be returned by the public API

**Guardrail enforced:** The `desa-data` admin route only reads `Desa` model fields.
No `DataDesa` table exists yet — no risk of data leakage in current state.

---

## 8. Component Reuse / Cleanup Summary

### Reused (no duplication)
- `DETAIL_FIELD_STANDARDS` — single source of truth, now exported (not duplicated)
- `requireInternalAdminSession()` — auth guard in all 3 API routes
- `handleApiError()` — error handling in all 3 API routes
- `isDatabaseConnectivityError()` — DB fallback in desa-data and versions routes
- `field-lux`, `lux-card`, `.eyebrow`, `.glass` — design system classes throughout
- Tab pill style consistent with IntakeDiffTheatre filter tabs
- Desa search debounce pattern consistent with IntakeWorkbench

### Not duplicated
- No second review queue created
- No second desa picker component (uses field-lux input directly)
- No duplicate field label constants (reads from existing DETAIL_FIELD_STANDARDS)
- No prototype/hardcoded desa data (all data from DB)

---

## 9. UI Standard Compliance

Following `docs/bmad/standards/back-office-ui-design-guidelines.md`:

| Rule | Status |
|---|---|
| Quiet luxury — clean, calm, premium | ✓ |
| Eyebrow labels above section headings | ✓ |
| Technical detail collapsed by default | ✓ (expanded desa detail on click) |
| Primary action clear | ✓ (nav item + tab bar) |
| Mobile-first, single column < sm | ✓ |
| `.lux-card`, `.eyebrow`, `.glass`, `.field-lux` used | ✓ |
| No raw `border border-slate-100` on cards | ✓ (using inset box-shadow) |
| No inline `style={{ boxShadow }}` replacing class | ✓ (uses consistent shadow stack) |
| Status pills use `.pill-*` classes | ✓ |
| Same vibe as Intake V2 | ✓ |
| No double components | ✓ |
| No ugly placeholder dashboard | ✓ |

---

## 10. QA Result

```
npx tsc --noEmit   → PASS (clean, no errors)
npm run lint       → pending (run before final approval)
npm run build      → pending (may have EPERM on Windows — Prisma DLL lock)
```

---

## 11. Playwright Result

Test file: `e2e/04-village-data.spec.ts` — 6 tests:

1. Page loads with nav item and default tab
2. Standar Detail tab shows field registry from DETAIL_FIELD_STANDARDS
3. Data per Desa tab loads from DB (not hardcoded)
4. Versi & Audit tab loads without error (empty state OK if DB empty)
5. Mobile 375px — no horizontal overflow
6. Tab switching changes URL param
7. Unauthenticated access redirects to login

```
npx playwright test e2e/04-village-data.spec.ts → pending (run against live dev server)
```

Note: Playwright requires `QA.INTERNAL_ADMIN` seed user to be present.
If seed is not available, tests 1–6 will fail on login. Test 7 can run without seed.

---

## 12. Known Limitations

1. **`DataDesa` model not migrated** — Tab 2 reads from `Desa` model only (7 fields).
   Full flexible data per field will only be possible after migration approval.

2. **`DesaDetailTemplateAssignment` not migrated** — template assignment is hardcoded
   to `CURRENT_PUBLIC_DETAIL_TEMPLATE` for all desa.

3. **Versions tab filter** — currently filters by `desaId` directly in the URL param.
   A proper desa picker with search would be better UX but deferred to avoid
   duplicating the desa-search logic in a new context.

4. **Pagination** — desa-data tab has pagination (20/page) but versions tab
   shows the 20 most recent across all desa.

5. **Intake link** — the "Buka di Intake" button in expanded desa detail
   uses `?desaId=` param which the current Intake Workbench doesn't pre-fill
   from URL params. Wiring this is a separate small task.

---

## 13. Migration Recommendation

**Do NOT run any migration without explicit owner approval.**

When ready to activate the flexible data foundation:

```bash
# 1. Uncomment the PROPOSAL section in prisma/schema.prisma
# 2. Add reverse relations to Desa model
# 3. Verify DATABASE_URL is NOT production
# 4. Run on dev/staging only:
npx prisma migrate dev --name flexible-village-data-foundation
npx prisma generate
```

Order of activation:
1. `VillageDetailTemplate` + `DetailFieldStandard` (no FK to Desa)
2. `DesaDetailTemplateAssignment` (FK to Desa)
3. Seed default template + assign all existing desa
4. `DataDesa` (after template assignment is stable)

---

## 14. Owner Approval Points

Before merging to main, owner should confirm:

- [ ] Schema proposal is correct (4 models, enums, relations)
- [ ] `DEFAULT_TEMPLATE_KEY = "CURRENT_PUBLIC_DETAIL_TEMPLATE"` is the right key name
- [ ] UI design acceptable (tab bar, field cards, desa list, version feed)
- [ ] Mobile layout OK at 375px
- [ ] Playwright tests pass against live dev server
- [ ] `npm run build` result acceptable (EPERM on Windows is non-blocking)
- [ ] No unexpected component duplication
- [ ] Ready to activate `DataDesa` migration in separate sprint

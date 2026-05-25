# Sprint 05 - Template Runtime Config-Driven Refactor

## Status

In progress. Do not treat this document as fully implemented until the matching BMAD report is created and QA evidence is recorded.

## Summary

Plan ini merapikan ulang sistem template desa supaya perubahan komponen, field, slot, tab, urutan, dan preview tidak lagi menyebar ke banyak file. Targetnya adalah menjadikan DB catalog/template sebagai source of truth runtime, sedangkan source code hanya menyediakan presenter visual yang reusable.

Dokumen report implementasi nantinya disimpan di:

```text
docs/bmad/reports/sprint-05-template-runtime-config-driven-refactor-report.md
```

## Problem Statement

Saat ini perubahan 1 komponen bisa menyentuh banyak file karena metadata template masih tersebar di beberapa tempat:

- `component-catalog-manifest`
- `template-catalog.manifest`
- public template registry
- preview registry
- public detail page composer
- intake coverage fallback
- desa-data API/read-model
- field-standards API/read-model
- seed/backfill script
- tests yang mengejar mapping lama

Ini melanggar target BMAD:

- SOLID belum kuat karena UI, registry, sync, dan data ownership saling tahu terlalu banyak.
- DRY belum kuat karena mapping component/field/slot/preview diulang.
- Runtime resilience kurang karena beberapa surface bisa drift.
- Change blast radius terlalu besar untuk operasi template normal.

## Architecture Target

DB menjadi pusat kontrak runtime:

- `VillageComponentCatalog` menyimpan metadata komponen dan render contract.
- `VillageComponentCatalogField` menyimpan ownership field.
- `VillageDetailTemplate` dan `VillageDetailComponent` hanya menyimpan composition, order, dan default visibility.
- `DesaDetailTemplateAssignment` dan visibility override mengatur template/visibility per desa.
- `DataDesa` menyimpan nilai published per desa, component, dan field.

Runtime service menjadi satu read-model:

- `TemplateRuntimeContract` menjadi kontrak tunggal untuk public detail, desa-data, intake, dan Kelola Template.
- Semua count, order, visibility, slot, tab, preview metadata, dan field ownership berasal dari contract ini.
- Fallback manifest hanya untuk kondisi DB belum siap, bukan sumber utama runtime.

Source code menjadi presenter-only:

- Renderer registry berubah dari `componentKey -> renderer` menjadi `rendererType -> presenter`.
- Preview registry berubah dari `componentKey -> preview` menjadi `previewVariant/rendererType -> miniature presenter`.
- Public page tidak lagi tahu detail komponen spesifik kecuali fixed old UI shell dan slot renderer.

## Core Interface Changes

Tambahkan metadata ringan ke `VillageComponentCatalog`:

- `rendererType`
- `previewVariant`
- `detailSlot`
- `navLabel`
- `anchorId`
- `publicGroupKey`
- `publicTabKey`
- `highlightFieldKeys`
- `renderConfigJson`

Tambahkan type/read-model baru:

```ts
type TemplateRuntimeContract = {
  templateId: string;
  templateKey: string;
  templateName: string;
  source: "db" | "fallback";
  components: RuntimeComponentContract[];
  visibleComponents: RuntimeComponentContract[];
  hiddenComponents: RuntimeComponentContract[];
  componentOrder: string[];
  fieldMap: Map<string, RuntimeFieldContract>;
  totalFieldCount: number;
  visibleFieldCount: number;
  publishableCount: number;
  publishedValues?: Record<string, unknown>;
};
```

```ts
type RuntimeComponentContract = {
  componentId: string;
  componentKey: string;
  label: string;
  description: string | null;
  displayOrder: number;
  isVisible: boolean;
  rendererType: string;
  previewVariant: string;
  detailSlot: string;
  navLabel: string;
  anchorId: string;
  publicGroupKey: string | null;
  publicTabKey: string | null;
  highlightFieldKeys: string[];
  renderConfig: Record<string, unknown>;
  fields: RuntimeFieldContract[];
};
```

```ts
type RuntimeFieldContract = {
  fieldStandardId: string | null;
  fieldKey: string;
  label: string;
  valueType: string;
  componentId: string;
  componentKey: string;
  componentLabel: string;
  isPublicVisible: boolean;
  isPublishableNow: boolean;
  displayOrder: number;
};
```

## Implementation Phases

### Phase 1: BMAD Guide dan Guardrail Baseline

- Tambahkan guide operasional di `docs/engineering/village-template-system-guide.md`.
- Isi guide menjelaskan allowed path untuk pindah field, pindah component slot/tab, reorder template, hide/show per desa, tambah komponen, dan tambah renderer baru.
- Tambahkan forbidden path: jangan hardcode field count, jangan edit public page untuk pindah field, jangan tambah mapping ownership di UI, jangan duplikasi registry.
- Tambahkan test awal yang mendeteksi hardcoded count dan registry drift.

### Phase 2: Schema Metadata Ringan

- Tambahkan kolom metadata ke `VillageComponentCatalog`.
- Migration harus kecil dan backward-compatible.
- Seed/sync mengisi metadata existing dari manifest saat ini ke DB.
- Tidak membuat table config besar baru kecuali terbukti perlu setelah Phase 2.

### Phase 3: Runtime Contract Service

- Buat service pusat untuk resolve template, catalog metadata, field ownership, visibility override, dan published values.
- Public detail, desa-data, field-standards, intake, dan Kelola Template mulai diarahkan ke service ini.
- Cache invalidation tetap mengikuti template resolver sekarang, tetapi output contract harus konsisten di semua surface.
- Fallback DB unavailable harus jujur dan tidak mengarang field count.

### Phase 4: Renderer Registry Simplification

- Refactor public renderer dari `componentKey` mapping menjadi `rendererType` mapping.
- Refactor preview dari `componentKey` mapping menjadi `previewVariant` atau `rendererType`.
- Komponen baru dengan visual existing cukup menambah metadata DB dan sync.
- Komponen visual baru tetap butuh presenter TSX, tetapi maksimal 2-3 file.

### Phase 5: Public Detail Shell Refactor

- Public detail tetap memakai UI shell lama.
- Page hanya render berdasarkan `detailSlot`, `publicGroupKey`, dan `publicTabKey` dari contract.
- Page tidak boleh punya logic khusus seperti `if componentKey === "perangkat"` untuk layout.
- Empty state tetap jujur jika component visible tapi field/data belum published.

### Phase 6: Internal Surfaces Refactor

- `desa-data` memakai contract yang sama untuk component list, count, order, dan visibility.
- `field-standards` API memakai contract yang sama untuk total field count dan sections.
- Intake coverage memakai contract yang sama untuk field list, hidden component detection, dan outside-template detection.
- Kelola Template memakai contract yang sama untuk catalog, canvas, preview, and save validation.

### Phase 7: Script-First Operations

Tambahkan scripts:

- `npm run template:sync`
- `npm run template:validate`
- `npm run template:move-field`
- `npm run template:move-component`
- `npm run template:backfill-demo`

Script behavior:

- `move-field` memindahkan ownership field di catalog dan field standards template aktif.
- `move-component` mengubah slot, tab, nav, order default, dan render metadata.
- `sync` menyelaraskan catalog DB, template placements, field standards, dan fallback manifest.
- `validate` gagal jika ada metadata kosong, renderer missing, duplicate field ownership, atau drift count.
- `backfill-demo` hanya untuk seed/demo data, bukan runtime rendering.

## Future Workflow

Pindah field:

```bash
npm run template:move-field -- perangkatDesa perangkat
npm run template:sync
npm run template:validate
npm test
```

Pindah komponen ke slot/tab:

```bash
npm run template:move-component -- perangkat --slot transparansi --tab perangkat --order 1
npm run template:sync
npm run template:validate
npm test
```

Reorder template:

```text
Kelola Template UI -> drag/reorder -> save
```

Hide/show per desa:

```text
desa-data -> component visibility panel
```

Tambah komponen dengan visual existing:

```text
Tambah metadata catalog -> sync -> validate -> test
```

Tambah visual baru:

```text
Tambah presenter rendererType -> tambah preview variant -> tambah guardrail test
```

## Test Plan

Static QA:

- `npm run template:validate`
- `npx tsc --noEmit`
- `npm run lint`
- `npm test`
- `npm run build`

Functional tests:

- Reorder di Kelola Template tersimpan dan public detail mengikuti order sama.
- Public detail dan desa-data memiliki component order yang sama.
- Field count public, desa-data, intake, dan field-standards sama.
- Hidden component tidak muncul di public detail, nav, dan preview public.
- Zero-field component tetap tampil tetapi tidak ikut field count.
- Pindah field via script tidak perlu mengubah public page.
- Pindah component slot/tab via script tidak perlu mengubah public page.
- Component aktif tanpa renderer metadata membuat test gagal.
- Component aktif tanpa preview metadata membuat test gagal.
- Field ownership duplikat membuat test gagal.

Smoke targets:

- `/desa/batukarut`
- `/internal-admin/village-data?tab=desa-data`
- `/internal-admin/village-data?tab=standards`
- API `field-standards` untuk Batukarut
- API `desa-data` list

## Acceptance Criteria

- Perubahan template normal tidak menyentuh public page, intake, desa-data, preview registry, dan coverage file.
- Public detail Batukarut tetap menampilkan perangkat, aset, fasilitas, lembaga, BUMDes, APBDes, panduan, dan suara sesuai template aktif.
- Kelola Template preview tetap sinkron dengan public detail.
- Tidak ada hardcoded count seperti `31` atau `37` di UI.
- Semua surface memakai `TemplateRuntimeContract`.
- Script `template:validate` menjadi gate sebelum commit.
- Report BMAD menjelaskan source of truth, data flow, scripts, guardrails, dan residual risk.

## Assumptions

- Kita tidak membuat visual builder bebas.
- Template hanya mengatur composition, order, visibility, slot, tab, dan field ownership.
- Existing catalog/template tables tetap dipakai.
- Schema baru hanya metadata ringan di catalog.
- Refactor dilakukan phased supaya tiap fase bisa diuji dan rollback.
- Source code masih diperlukan untuk presenter visual baru, tetapi bukan untuk perubahan konfigurasi template normal.

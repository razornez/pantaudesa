# Village Template System Guide

Panduan ini adalah aturan operasional untuk mengubah komponen, field, slot, tab, dan urutan template detail desa. Tujuannya sederhana: perubahan template normal tidak boleh lagi menyebar ke public page, intake, desa-data, preview registry, dan coverage logic.

## Source of Truth

- `VillageComponentCatalog` adalah kontrak komponen runtime: `componentKey`, label, `rendererType`, `previewVariant`, `detailSlot`, nav, tab, dan render config.
- `VillageComponentCatalogField` adalah owner field: `fieldKey`, label, value type, publishability, dan urutan field.
- `VillageDetailTemplate` + `VillageDetailComponent` hanya mengatur composition: komponen apa yang aktif, urutan, dan default visibility.
- `DesaDetailTemplateAssignment` + `DesaDetailComponentVisibility` mengatur template dan show/hide per desa.
- `DataDesa` menyimpan value published per desa, template, component, dan field.

## Allowed Change Paths

### Pindah Field ke Komponen Lain

Gunakan script ownership, bukan edit UI:

```bash
npm run template:move-field -- perangkatDesa perangkat
npm run template:sync
npm run template:validate
npm test
```

Expected:

- Field ownership pindah di catalog dan field standards.
- `DataDesa` tetap aman dan diarahkan ke component target bila perlu.
- Public detail, desa-data, intake, dan Kelola Template mengikuti runtime contract.

### Pindah Komponen ke Slot atau Tab Lain

Gunakan metadata component:

```bash
npm run template:move-component -- kinerja --slot transparansi --tab kinerja --order 3
npm run template:sync
npm run template:validate
npm test
```

Expected:

- `detailSlot`, `publicTabKey`, dan order berubah.
- Field ownership dan `DataDesa` tidak berubah.
- Public detail tidak perlu diedit jika renderer existing sudah ada.

### Reorder Template

Gunakan UI Kelola Template atau API reorder.

Expected:

- Hanya `VillageDetailComponent.displayOrder` yang berubah.
- Field structure tidak berubah.
- Public detail dan desa-data membaca urutan yang sama.

### Hide/Show Per Desa

Gunakan panel visibility di `desa-data`.

Expected:

- Override tersimpan di `DesaDetailComponentVisibility`.
- Component hidden tidak muncul di public detail maupun nav.
- Count tetap berasal dari runtime contract.

### Tambah Komponen dengan Visual Existing

Gunakan catalog metadata + sync.

Expected:

- Tambah component catalog dan fields.
- Pilih `rendererType`/`previewVariant` yang sudah ada.
- Tidak perlu edit public page.

### Tambah Visual Baru

Baru boleh edit source UI:

- Tambah presenter untuk `rendererType` baru.
- Tambah miniature preview bila belum ada.
- Tambah guardrail test renderer coverage.

Target blast radius: 2-3 file.

## Forbidden Patterns

- Jangan hardcode field count seperti `31` atau `37` di UI.
- Jangan edit `src/app/desa/[id]/page.tsx` hanya untuk memindahkan field atau slot.
- Jangan membuat mapping ownership field baru di UI atau client component.
- Jangan menambah `componentKey -> renderer` khusus jika `rendererType` existing cukup.
- Jangan mengubah `DataDesa.componentId` manual tanpa script/sync yang tervalidasi.
- Jangan menambah komponen aktif tanpa `rendererType`, `previewVariant`, dan `detailSlot`.

## Required QA

Jalankan minimal:

```bash
npm run template:validate
npx tsc --noEmit
npm run lint
npm test
```

Untuk perubahan runtime/public, tambahkan smoke:

```text
/desa/batukarut
/internal-admin/village-data?tab=desa-data
/internal-admin/village-data?tab=standards
```

## Decision Rule

Jika perubahan bisa dijelaskan sebagai "composition, ownership, slot, tab, order, atau visibility", lakukan lewat DB config, script, atau UI Kelola Template.

Jika perubahan membutuhkan bentuk visual yang belum ada, baru edit presenter source code.

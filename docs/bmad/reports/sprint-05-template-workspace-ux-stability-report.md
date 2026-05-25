# Sprint 05 - Template Workspace UX Stability Report

Status: implemented  
Date: 2026-05-25

## Summary

Patch ini menutup gap UX dan state consistency pada workspace template desa:

- pergantian template di tab `Data Desa` sekarang punya loading state async yang benar;
- panel expand desa direload setelah template assignment berubah;
- pemilihan template di `Kelola Template` menampilkan shimmer/loading saat komponen template dimuat;
- save template kembali memberi toast sukses setelah workspace selesai refresh.

Perubahan ini penting karena operasi template adalah jalur production-sensitive. UI tidak boleh memberi kesan aksi selesai sebelum mutation dan reload data selesai.

## Core Changes

- `TemplateSwitchPopover` di `Data Desa` tidak lagi mengandalkan `useTransition` untuk async fetch.
- Tombol `Terapkan` memakai state `applying`, disabled selama request berjalan, dan menampilkan spinner `Menerapkan...`.
- Select template dan tombol `Tutup` ikut disabled saat template assignment sedang diterapkan.
- Setelah switch template berhasil, `DesaDataTab` menaikkan `templateReloadToken`, reload list desa, dan memaksa `ComponentVisibilityPanel` remount.
- `Kelola Template` menambahkan `templateLoadingId` untuk membedakan loading awal dengan loading saat user memilih template lain.
- Editor metadata dan preview canvas menampilkan shimmer/loading saat komponen template dimuat.
- Save template menampilkan toast sukses setelah `reloadWorkspace()` selesai, bukan sebelum refresh state.

## Related Surfaces

- `Data Desa`
  - template switch popover;
  - expanded desa component coverage;
  - template assignment refresh.
- `Kelola Template`
  - template list selection;
  - editor metadata;
  - preview urutan komponen;
  - save toast.

## Architecture Notes

- Tidak ada perubahan kontrak API.
- Tidak ada perubahan schema.
- Tidak ada perubahan source of truth template.
- Patch ini murni memperbaiki presentational state dan reload boundary.
- `ComponentVisibilityPanel` tetap membaca API yang sama, tetapi sekarang parent memberi remount key agar panel tidak mempertahankan state lama setelah template desa diganti.

## Verification

Passed:

```bash
npx tsc --noEmit
npm run lint
npm test
```

Additional smoke:

```text
/internal-admin/village-data?tab=standards -> HTTP 200
/internal-admin/village-data?tab=desa-data -> HTTP 200
```

Notes:

- `npm test -- --runInBand` tidak dipakai karena project ini memakai Vitest dan flag tersebut milik Jest.
- `npm run lint` masih menampilkan warning lama `.eslintignore` tidak didukung ESLint versi baru, tetapi tidak ada lint error.

## Residual Risk

- Smoke authenticated browser interaction tetap bergantung pada session lokal user.
- Log `.next-dev.log` dapat muncul kembali bila dev server masih berjalan; file ini runtime artifact dan tidak ikut commit.
- Toast success save bergantung pada response API mutation yang sukses; read-only fallback tetap akan menampilkan error/warning sesuai guardrail DB runtime.

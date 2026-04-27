# Local Validation Capability Report

Assessment task: A-03
Status: draft for Iwan review

## Scope

Dokumen ini mencatat command lokal yang tersedia dan hasil command nyata pada workspace Ujang. Tidak ada perubahan schema, API, auth, scheduler, scraper, database, atau read path.

## Package scripts tersedia

Berdasarkan `package.json`:

- `npm run dev`: `next dev`
- `npm run build`: `prisma generate && next build`
- `npm run start`: `next start`
- `npm run lint`: `eslint`
- `npm run test`: `vitest run`
- `npm run test:watch`: `vitest`
- `npm run test:coverage`: `vitest run --coverage`

Tidak ada script `typecheck` khusus, jadi Ujang menjalankan `npx tsc --noEmit` langsung.

## Command yang dijalankan

### `git pull`

Hasil:

- Berhasil.
- Fast-forward dari `4502626` ke `055577d`.
- File baru yang masuk:
  - `docs/engineering/06-iwan-review-data-foundation-learning.md`
  - `docs/engineering/07-ujang-architecture-business-assessment.md`

Catatan:

- Ini dilakukan sebelum assessment, sesuai instruksi Iwan agar Ujang selalu pull dulu.

### `npm run test`

Percobaan pertama:

- Gagal karena permission lokal/sandbox.
- Error utama: `failed to load config from ... vitest.config.mjs`, `Error: spawn EPERM`.
- Stack menunjukkan Vitest/Vite gagal menjalankan esbuild child process.

Percobaan kedua dengan izin eskalasi:

- Berhasil.
- Hasil:
  - Test files: 3 passed.
  - Tests: 42 passed.
  - Duration sekitar 285 ms.

Kesimpulan:

- Test suite tersedia dan bisa jalan jika permission spawn tidak dibatasi.

### `npm run lint`

Hasil:

- Gagal dengan exit code 1.
- ESLint benar-benar berjalan.
- Total: 31 problems, 15 errors, 16 warnings.

Error utama:

- `src/app/desa-admin/dokumen/page.tsx`: `react-hooks/set-state-in-effect`.
- `src/components/desa/SuaraWargaSection.tsx`: `react-hooks/set-state-in-effect`.
- `src/components/ui/OtpInput.tsx`: `react-hooks/refs`, ref diakses saat render.
- `src/components/ui/PinInput.tsx`: `react-hooks/refs`, ref diakses saat render.
- `src/lib/use-countdown.ts`: `react-hooks/set-state-in-effect`.

Warning utama:

- unused imports/vars di beberapa file seperti `admin/page.tsx`, `bandingkan/page.tsx`, `KelengkapanDesa.tsx`, `ProfilDesaSection.tsx`, `VoiceCard.tsx`, `DesaLeaderboard.tsx`, `TopDesaTable.tsx`.
- `ESLintIgnoreWarning`: `.eslintignore` tidak lagi didukung oleh ESLint config baru.

Kesimpulan:

- Lint penuh belum bersih.
- Error ini berada di area existing di luar assessment dan tidak diperbaiki karena task melarang perubahan implementasi.

### `npx prisma validate`

Percobaan pertama:

- Gagal karena permission lokal/sandbox.
- Error utama: `EPERM: operation not permitted, lstat 'C:\Users\IWANKU~1'`.
- Ini terjadi di package Prisma platform/temp-dir.

Percobaan kedua dengan izin eskalasi:

- Berhasil.
- Output:
  - `Prisma schema loaded from prisma\schema.prisma`
  - `The schema at prisma\schema.prisma is valid`
  - `Loaded Prisma config from prisma.config.ts`
  - `Prisma config detected, skipping environment variable loading.`

Kesimpulan:

- Schema Prisma saat ini valid.
- Validasi bisa berjalan jika permission environment tidak membatasi akses path user/temp.

### `npm run build`

Dijalankan dengan izin eskalasi.

Hasil:

- Gagal pada tahap `prisma generate`, sebelum `next build`.
- Error:
  - `EPERM: operation not permitted, rename '...\src\generated\prisma\query_engine-windows.dll.node.tmp6320' -> '...\src\generated\prisma\query_engine-windows.dll.node'`

Kesimpulan:

- Build belum bisa dinyatakan pass.
- Kegagalan terlihat seperti permission/lock file generated Prisma query engine, bukan error schema.
- Perlu investigasi environment sebelum Sprint 03, terutama apakah file query engine terkunci oleh process lain atau butuh cleanup/permission khusus.

### `npx tsc --noEmit`

Hasil:

- Berhasil dengan exit code 0.
- Tidak ada output error.

Kesimpulan:

- TypeScript check langsung bisa berjalan.
- Ini tidak menggantikan `next build`, tapi berguna sebagai validasi type-level cepat.

### Smoke request localhost

Kondisi:

- Dev server tampaknya masih berjalan di `localhost:3000`.

Command:

- `Invoke-WebRequest http://localhost:3000`
- `Invoke-WebRequest http://localhost:3000/desa/1`

Hasil:

- Homepage: `200`.
- Homepage disclaimer ditemukan: `Data yang ditampilkan bersifat ilustrasi`.
- Detail desa `/desa/1`: `200`.
- Detail trust badge `Data demo` ditemukan.

Catatan:

- Ada percobaan smoke homepage pertama yang gagal karena nama variabel PowerShell `$home` read-only. Diulang dengan `$homeRes` dan berhasil.

## Apa yang perlu disiapkan sebelum Sprint 03

- Bersihkan atau pahami lint errors existing sebelum menjadikan lint sebagai gate wajib.
- Pastikan `npm run build` bisa melewati `prisma generate`; investigasi file lock/permission di `src/generated/prisma/query_engine-windows.dll.node`.
- Putuskan apakah `npx tsc --noEmit` perlu dijadikan script `typecheck`.
- Pastikan environment DB/Prisma generation konsisten di local dan CI.
- Jika Sprint 03 menambah model, jalankan minimal:
  - `npx prisma validate`
  - `npx prisma generate`
  - `npx tsc --noEmit`
  - targeted tests/service tests
  - smoke homepage/detail

## Validation capability summary

- `git pull`: pass.
- `npm run test`: pass setelah izin eskalasi, 42 tests.
- `npm run lint`: fail karena errors existing.
- `npx prisma validate`: pass setelah izin eskalasi.
- `npm run build`: fail karena EPERM rename query engine saat `prisma generate`.
- `npx tsc --noEmit`: pass.
- Localhost smoke homepage/detail: pass.


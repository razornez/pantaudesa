# Ujang Task Queue

Dokumen ini adalah antrian task aktif untuk Ujang.
Iwan atau Asep akan update file ini setiap sprint.
Ujang cukup baca file ini, kerjakan dari atas ke bawah, lalu update status.

Format status: `todo` → `in-progress` → `partial` → `done`

---

## Cara kerja

1. Buka file ini.
2. Ambil task pertama yang statusnya `todo` atau `in-progress`.
3. Kerjakan sesuai instruksi.
4. Ubah status jadi `done` setelah selesai.
5. Commit dengan role trace.
6. Lanjut ke task berikutnya.

Jika ada blocker, ubah status ke `blocked` dan tulis keterangan di kolom Notes.

---

## Antrian aktif — Sprint 02

### T-01 · NAVBAR_COPY — sinyal data publik
**Status:** `done`
**Backlog:** #7
**Branch:** `ujang/sprint2`

**File yang diubah:**
- `src/lib/copy.ts` — tambah konstanta
- `src/components/layout/Navbar.tsx` — pasang sinyal

**Instruksi:**

Tambahkan ke `src/lib/copy.ts`:

```typescript
export const NAVBAR_COPY = {
  publicDataNote: "Data publik bebas diakses",
} as const;
```

Di `src/components/layout/Navbar.tsx`, cari area render tombol login untuk user yang belum login. Tambahkan tepat sebelum tombol:

```tsx
{!user && !loading && (
  <span className="hidden sm:inline text-xs text-slate-400 mr-1">
    {NAVBAR_COPY.publicDataNote} ·
  </span>
)}
```

**Done when:**
- [x] Tampil di desktop saat belum login
- [x] Tidak tampil di mobile (`hidden sm:inline`)

**Commit:**
```
feat(navbar): add public data access signal

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: done
Backlog: #7
```

---

### T-02 · `ResponsibilityGuideCard` — pindah copy ke `copy.ts`
**Status:** `done`
**Backlog:** #10
**Branch:** `ujang/sprint2`

**File yang diubah:**
- `src/lib/copy.ts` — tambah konstanta
- `src/components/desa/ResponsibilityGuideCard.tsx` — ganti hardcode, tambah disclaimer

**Instruksi:**

Tambahkan ke `src/lib/copy.ts`:

```typescript
export const RESPONSIBILITY_CARD = {
  title:      "Tanyakan ke pihak yang tepat",
  body:       "Tidak semua masalah di wilayah desa menjadi kewenangan pemerintah desa. Lihat dulu apakah hal ini terkait APBDes, program desa, kewenangan kabupaten, provinsi, atau pusat agar pertanyaanmu lebih tepat sasaran.",
  cta:        "Lihat panduan kewenangan",
  disclaimer: "Panduan kewenangan bersifat umum. Detail perlu diverifikasi dengan sumber resmi.",
} as const;
```

Update `src/components/desa/ResponsibilityGuideCard.tsx`:
- Import `RESPONSIBILITY_CARD` dari `@/lib/copy`
- Ganti 3 hardcode string dengan konstanta
- Tambahkan disclaimer kecil di bawah card:

```tsx
<p className="mt-3 text-[10px] text-amber-700/70 leading-relaxed">
  {RESPONSIBILITY_CARD.disclaimer}
</p>
```

**Done when:**
- [x] Tidak ada string UI hardcode di JSX komponen
- [x] Disclaimer tampil di bawah card

**Commit:**
```
refactor(desa-detail): move card copy to source of truth

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: done
Backlog: #10
```

---

### T-03 · Badge hint di profil saya
**Status:** `done`
**Backlog:** #8
**Branch:** `ujang/sprint2`

**File yang diubah:**
- `src/app/profil/saya/page.tsx`

**Instruksi:**

Cari `<BadgePill badge={trustStats.badge} compact />` di sekitar baris 435. Tambahkan teks kecil tepat di bawahnya:

```tsx
<div className="text-right">
  <BadgePill badge={trustStats.badge} compact />
  <p className="text-[10px] text-slate-400 mt-0.5">Lihat arti ↓</p>
</div>
```

**Done when:**
- [x] Ada petunjuk visual kecil mengarah ke `BadgeMeaningCard` di bawah

**Commit:**
```
fix(badge): add visual hint to badge in profile

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: done
Backlog: #8
```

---

### T-04 · `.env.example`
**Status:** `done`
**Backlog:** #11
**Branch:** `ujang/sprint2`

**File yang dibuat:**
- `.env.example` di root project

**Instruksi:**

Buat file `.env.example` di root project (sejajar dengan `package.json`):

```bash
# NextAuth
AUTH_SECRET=
AUTH_URL=

# Database (Supabase / PostgreSQL)
DATABASE_URL=
DIRECT_URL=

# Resend (email)
RESEND_API_KEY=
RESEND_FROM=

# Sentry
SENTRY_DSN=

# Alert
ALERT_EMAIL=

# Debug (dev only, jangan set di production)
DEBUG_SECRET=
```

**Done when:**
- [x] File ada di root, tidak berisi nilai sensitif
- [x] Bisa di-commit (tidak masuk `.gitignore`)

**Commit:**
```
chore(env): add env.example for developer onboarding

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: done
Backlog: #11
```

---

### T-05 · Data disclaimer di homepage
**Status:** `done`
**Backlog:** #3
**Branch:** `ujang/sprint2`

**File yang diubah:**
- `src/lib/copy.ts` — tambah konstanta
- `src/app/page.tsx` — pasang disclaimer

**Instruksi:**

Tambahkan ke `src/lib/copy.ts`:

```typescript
export const DATA_DISCLAIMER = {
  short: "Data yang ditampilkan bersifat ilustrasi. Integrasi data resmi sedang disiapkan.",
} as const;
```

Di `src/app/page.tsx`, import `DATA_DISCLAIMER` dan tambahkan setelah komponen `<StatsCards>`:

```tsx
<p className="text-center text-xs text-slate-400 pb-2">
  {DATA_DISCLAIMER.short}
</p>
```

**Done when:**
- [x] Disclaimer tampil di homepage setelah stats cards
- [x] Copy dari `copy.ts`, tidak hardcode di JSX

**Commit:**
```
feat(trust): add data disclaimer to homepage

Initiated-by: Iwan (CEO)
Reviewed-by: Asep (CTO)
Executed-by: Ujang (Programmer)
Status: done
Backlog: #3
```

---

### T-06 · Wording audit — copy teknis ke bahasa awam
**Status:** `todo`
**Backlog:** #12
**Branch:** `ujang/sprint2`

**Tunggu dulu.** Task ini dimulai setelah T-01 sampai T-05 selesai dan Asep selesai review #12.

Baca sprint plan: `docs/project-management/06-sprint-02-plan.md` — Track A untuk panduan wording dan contoh good vs bad copy.

---

## Update status setelah semua T-01 sampai T-05 selesai

```
## Implementation Update — Ujang
Status: partial

### Done
- [x] T-01 NAVBAR_COPY + sinyal Navbar
- [x] T-02 ResponsibilityGuideCard copy ke copy.ts + disclaimer
- [x] T-03 Badge hint di profil saya
- [x] T-04 .env.example
- [x] T-05 Data disclaimer homepage

### Remaining
- T-06 Wording audit — menunggu Asep review #12

### Blocker
- tidak ada
```

---

## Selesai semua task?

Lapor ke Asep dan Iwan lewat update di file ini atau commit message.
Asep akan menaikkan status di dashboard dan membuka task berikutnya.

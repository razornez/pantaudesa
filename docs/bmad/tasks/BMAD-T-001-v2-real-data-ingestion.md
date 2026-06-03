# BMAD-T-001-v2 — Ingestion Data Asli ke Sistem Template (Reframe)

> **Status:** Draft rencana eksekusi — menunggu approval Iwan
> **Disusun oleh:** Claude (atas instruksi Iwan), berbasis reconcile BMAD-T-001 v1 dengan kode terkini
> **Menggantikan:** `BMAD-T-001-component-migration.md` (v1, asumsi arsitektur lama)
> **Pilot:** Kabupaten Bandung · **Target:** launch secepatnya

---

## 1. Apa yang berubah dari v1

v1 mengusulkan **tabel typed dedicated** (Demografi/IDM/Fasilitas dll) + ganti banyak komponen. Setelah reconcile dengan kode:

- **Sistem template tetap primary.** BMAD jadi **lapisan ingestion** yang ngisi `DataDesa` (key-value) + tabel typed yang **sudah ada**. Bukan ganti arsitektur.
- **Reuse infra yang sudah ada** (tidak bikin baru): `DataSource` registry, enum `DataStatus` (demo→imported→needs_review→verified→outdated→rejected), `DataSourceFetchRun` (= IngestionLog), `DataDesa` (sudah punya kolom source/status/lifecycle per field).
- **Keputusan A1:** data time-series/multi-baris → extend tabel typed yang ada (`AnggaranDesaSummary`, `APBDesItem`, `DokumenPublik`, `PerangkatDesa`). Data snapshot skalar → `DataDesa` fieldKey.
- **Keputusan B:** `KomposisiBenchmark` (referensi nasional) → **config file**, bukan tabel.
- **Komponen:** adapt 8 bab cinematic + 2 baru (Peta/Komparasi) — sudah jadi di sandbox Batukarut (DEMO). Tinggal ganti sumber DEMO → adapter asli.
- **Rule data-completeness:** bisa di-get → tampilkan; susah → adapt/buang; penting tapi kosong → "data kosong, klik untuk lengkapi" → login admin desa.

---

## 2. Dampak Database (minimal)

| Perubahan | Jenis | Catatan |
|---|---|---|
| Kolom Dana Desa di `AnggaranDesaSummary` (pagu, realisasiTahap1-3, tahapCair) **atau** tabel kecil `DanaDesa` per-(desa,tahun) | 1 migration kecil | Keputusan minor saat eksekusi |
| Mungkin +kolom `adapterName` di `DataSourceFetchRun` | migration sepele | Kalau metadata kurang |
| fieldKey baru: `idm*`, `geoLat/Lng`, `topografi`, `fasilitas*`, `kades*`, `aksesAir/Listrik` | **bukan migration** | Tambah di catalog + seed `DataDesa` |
| `KomposisiBenchmark` | **bukan migration** | Config file `src/lib/benchmarks/komposisi-apbdes.ts` |

➡️ Total: **1 migration kecil** (Dana Desa). Sisanya fieldKey + config.

---

## 3. Daftar Adapter (ditulis ke mana, trust, effort)

| Adapter | Sumber | Tulis ke | Trust | Effort | Risiko |
|---|---|---|---|---|---|
| `OSMNominatimAdapter` | OSM | `DataDesa` geoLat/Lng/topografi | 3 | **S** (~0.5–1h) | rendah |
| `IDMAdapter` | Kemendesa IDM | `DataDesa` idmStatus/skor/ike/iks/ikl | 5 | **M** (~1–2h) | akuisisi file |
| `DJPKPMKAdapter` | DJPK Kemenkeu | `AnggaranDesaSummary` (pagu Dana Desa) | 5 | **M** (~1–2h) | parse Excel |
| `OMSPANAdapter` | OM-SPAN | `AnggaranDesaSummary` (realisasi tahap) | 5 | **L** (~2–4h) | scraping, rate-limit |
| `BPSPodesAdapter` | BPS Podes | `DataDesa` demografi+fasilitas+geografi | 5 | **L** (~3–5h) | Excel besar, banyak field |
| `ProdeskelAdapter` | Prodeskel | `DataDesa` kades/kontak + `PerangkatDesa`, lembaga/bumdes | 4 | **M–L** (~2–3h) | data tidak konsisten |
| `PPIDBandungAdapter` | PPID Kab Bandung | `DokumenPublik` (jenis×tahun) | 3–4 | **L** (~2–4h) | scraping per-kab |
| `BUMDESRegistryAdapter` | Registry BUMDes | `DataDesa`/lembaga bumdes | 4 | **M** (~1–2h) | format variabel |

> Effort = "hari kerja dev" kasar (h = hari). Scraping bervariasi — angka bisa meleset tergantung kondisi situs sumber.

---

## 4. Fondasi (sekali bangun)

| Item | Effort |
|---|---|
| `AdapterBase` interface + runner (tulis ke DataDesa/typed table, set `sourceId/status/fetchedAt`, log ke `DataSourceFetchRun`, dedupe per `(desa,fieldKey)`) | **M** (~2–3h) |
| Tambah fieldKey baru + 2 komponen (fasilitas/peta/komparasi) ke catalog manifest + seed | **S–M** (~1–2h) |
| Config `KomposisiBenchmark` | **S** (~0.5h) |
| Swap: ganti DEMO Batukarut → data asli, cabut flag sandbox, jadikan template-driven, badge sumber + disclaimer status | **M** (~2–3h) |

---

## 5. Rencana Bertahap (lean → launch)

### Fase A — Fondasi + Quick Win (~4–6 hari)
`AdapterBase` + runner · catalog fieldKey/komponen · `OSMNominatimAdapter` (peta) · `IDMAdapter` (indeks) · config `KomposisiBenchmark`.
**Hasil:** Bab Peta, Indeks, Komposisi pakai data asli.

### Fase B — Data Uang (~3–6 hari) ⭐ inti PantauDesa
`DJPKPMKAdapter` (pagu Dana Desa) + `OMSPANAdapter` (realisasi tahap) + migration kolom Dana Desa.
**Hasil:** Bab Dana Desa pakai angka resmi Kemenkeu — ini headline transparansi.

### Fase C — Kelengkapan (~7–11 hari)
`BPSPodesAdapter` (demografi+fasilitas) · `ProdeskelAdapter` (kades/lembaga/bumdes) · `PPIDBandungAdapter` (dokumen+disiplin) · `BUMDESRegistryAdapter`.
**Hasil:** Bab Kenalan, Isi Desa, Sumber & Indeks-disiplin pakai data asli.

### Fase D — Swap + Launch (~3–5 hari)
Ganti DEMO Batukarut → asli · badge sumber per field · disclaimer status (DEMO/VERIFIED) · assign template ke ~270 desa Kab Bandung · QA sampel 50 desa.

**Total kasar:** ~17–28 hari kerja dev untuk pilot Bandung penuh.

### Opsi launch cepat
Launch setelah **Fase A + B + D** (data uang + indeks + peta asli, sisanya DEMO berlabel) → ~10–17 hari. Fase C jadi fast-follow pasca-launch.

---

## 6. Migrasi DEMO → Asli (per bab)

Tiap field di `showcase-demo.ts` dipetakan ke adapter:

| Bab | Field DEMO sekarang | Diganti oleh |
|---|---|---|
| 00 Kenalan | demografi/profil/kontak | BPSPodes + Prodeskel |
| 01 Dana Desa | pagu/tahap/riwayat | DJPK + OMSPAN |
| 02 Dipakai apa | komposisi | config benchmark |
| 03 Isi Desa | fasilitas/lembaga/bumdes/kades | BPSPodes + Prodeskel + BUMDES-REG |
| 04 Peta | lat/lng/poi | OSM |
| 05 Indeks | idm + disiplin | IDM + PPID |
| 06 Komparasi | peer rank | computed (DataDesa sekecamatan) |

`showcase-demo.ts` + flag sandbox di `page.tsx` **dihapus** di Fase D.

---

## 7. Acceptance Criteria

- [ ] Adapter Fase A+B jalan untuk Batukarut → field terkait ganti dari DEMO ke asli, ada badge sumber + tanggal fetch.
- [ ] `DataSourceFetchRun` mencatat tiap run (sukses/gagal/partial).
- [ ] Field yang belum punya data tampil "Belum tersedia" / "klik untuk lengkapi" (bukan kosong/mock diam-diam).
- [ ] Status `DEMO` muncul dengan disclaimer untuk desa di luar cakupan adapter.
- [ ] `npm run build` + `qa:static` lulus.
- [ ] (Launch) ~270 desa Kab Bandung punya minimal: identitas + IDM + Dana Desa.

---

## 8. Out of Scope (defer)

- AI/OCR ekstraksi PDF (Perdes APBDes naratif)
- Aggregator berita lokal
- Crowdsource warga
- Scheduler otomatis (manual trigger dulu)
- Admin tooling konflik-sumber & override per-field (defer pasca-launch, kecuali lu mau masuk scope)
- Multi-kabupaten (selesaikan Bandung dulu)

---

*Disusun 2026-06-02. Acuan keputusan: memory project-bmad-t001-reframe + project-batukarut-demo-data-swap.*

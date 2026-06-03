# Data Completeness — Kecamatan Arjasari (real desa)

> **Purpose:** track which real desa still have data gaps after automated ingestion,
> so the missing fields can be topped up manually via the back-office dashboard.
> Generated from `scripts/ingest-run.ts --kecamatan Arjasari`. Last run: 2026-06-03.

After removing all fictional/demo desa, the database holds **11 real desa** (Kec.
Arjasari, Kab. Bandung) + 3 QA fixtures (namespaced "QA Kabupaten", not real).

## Field set (max 11 attributed real fields)

`danaDesa` · `tahunData` (DJPK Kemenkeu) · `geoLat` · `geoLng` (OpenStreetMap) ·
`jumlahPenduduk` · `jumlahKK` · `jumlahDusun` · `jumlahRw` · `jumlahRt` ·
`kepalaDesa` · `mataPencaharian` (Website Resmi Desa / OpenSID).

## Status per desa

| Desa | Fields | Status | Missing (→ isi via dashboard) |
|------|:------:|--------|-------------------------------|
| **Ancolmekar** | 11 | ✅ Lengkap | — |
| **Batukarut** | 11 | ✅ Lengkap | — |
| **Mangunjaya** | 11 | ✅ Lengkap | — |
| **Wargaluyu** | 11 | ✅ Lengkap | — |
| Baros | 10 | 🟢 Hampir | `jumlahRw` |
| Mekarjaya | 10 | 🟢 Hampir | `jumlahKK` |
| Patrolsari | 10 | 🟢 Hampir | `kepalaDesa` |
| Arjasari | 9 | 🟡 Sedang | `geoLat`, `geoLng` (tidak ada node OSM) |
| Lebakwangi | 5 | 🔴 Bolong | `jumlahPenduduk`, `jumlahKK`, `jumlahDusun`, `jumlahRw`, `jumlahRt`, `mataPencaharian` |
| Pinggirsari | 5 | 🔴 Bolong | `jumlahPenduduk`, `jumlahKK`, `jumlahDusun`, `jumlahRw`, `jumlahRt`, `mataPencaharian` |
| Rancakole | 4 | 🔴 Bolong | `jumlahPenduduk`, `jumlahKK`, `jumlahDusun`, `jumlahRw`, `jumlahRt`, `kepalaDesa`, `mataPencaharian` |

## Why the gaps (not fixable by re-ingest)

- **Lebakwangi & Pinggirsari** — their OpenSID statistik modules return **HTTP 500**
  (`/data-statistik/*`, `/data-wilayah`), so demografi can't be scraped. Only the
  homepage works → `kepalaDesa` + coords + Dana Desa landed. Demografi must be entered
  manually.
- **Rancakole** — no reachable desa site data and no kepala-desa name parseable; only
  Dana Desa (DJPK) + OSM coords are automatic.
- **Arjasari (desa)** — no OpenStreetMap village node by name → no coordinates. Everything
  else scraped fine.
- **Baros / Mekarjaya / Patrolsari** — a single field absent from the source table
  (the desa site simply doesn't publish that one row).

## Notes

- All present fields carry source attribution (DJPK Kemenkeu / OpenStreetMap / Website
  Resmi Desa) in `DataDesa.sourceLabel`.
- Kecamatan aggregator `kecamatanarjasari.bandungkab.go.id` (OpenDK) only exposes luas +
  kode desa per desa; its statistik dashboards are empty (all zeros), so it is not a
  usable source for the gaps above.
- Re-run anytime: `npx tsx scripts/ingest-run.ts --kecamatan Arjasari` (idempotent).

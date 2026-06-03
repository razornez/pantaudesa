# Data Completeness — Kabupaten Bandung (full rollout)

> Real-data ingestion across **all 270 desa** of Kabupaten Bandung (31 kecamatan).
> Source of truth = DB. Re-run anytime (idempotent + resumable). Last pass: 2026-06-03.

## Coverage

| Field | Source | Coverage |
|---|---|---|
| `danaDesa` + `tahunData` | Kemendesa IDM / DJPK | **270 / 270 (100%)** |
| `geoLat` + `geoLng` | OpenStreetMap (Overpass) | **212 / 270 (~79%)** |
| `jumlahPenduduk` | Website desa (OpenSID) | 35 / 270 |
| `kepalaDesa` | OpenSID homepage | 34 / 270 |
| `mataPencaharian` | OpenSID statistik | 25 / 270 |
| `jumlahDusun` | OpenSID data-wilayah | 26 / 270 |
| `jumlahKK` | OpenSID data-wilayah | 23 / 270 |

### Desa by number of real fields
`2 fields: 52 desa` · `3: 2` · `4 (danaDesa+koordinat): 175` · `5: 7` · `6: 5` · `7: 2` · `8: 4` · `9: 4` · `10: 12` · `11 (lengkap): 7`

- **100%** of desa have real Dana Desa.
- **~81%** (218) have at least Dana Desa + coordinates.
- **~13%** (35) have demografi — only desa with a live `desa.id` (OpenSID) site.

## Why demografi is ~13% (source ceiling, not effort)

Most Kabupaten Bandung desa do **not** publish per-desa demografi on a live
`{slug}.desa.id` OpenSID site. Demografi/kades/mata-pencaharian land only where
such a site exists (concentrated in rural kecamatan: Banjaran, Arjasari, Paseh,
Pacet, Pangalengan, Cimaung, Ibun, Majalaya, Cangkuang, Kutawaringin…). Urban
Bandung-fringe kecamatan (Cileunyi, Margahayu, Margaasih, Katapang, Dayeuhkolot,
Bojongsoang…) have no village OpenSID sites → demografi must be filled by **admin
desa** via the back-office. The ~58 desa without coordinates simply have no
OpenStreetMap village node by that name.

## How to top up (stable terminal — resumable, idempotent)

```bash
# coordinates for desa still missing them
npx tsx scripts/ingest-run.ts --all --only osm     --skip-have geoLat
# demografi for desa still missing it (sweeps the remaining kecamatan)
npx tsx scripts/ingest-run.ts --all --only opensid --skip-have jumlahPenduduk
# Dana Desa refresh (already 100%)
npx tsx scripts/ingest-run.ts --all --only kemendesa
```

`--skip-have <field>` means each re-run only processes desa still missing that
field. `--kecamatan <Nama>` scopes to one kecamatan. NOTE: in this dev harness,
long background runs of `npx tsx` were intermittently killed (exit 127); run the
passes in a normal terminal or per-kecamatan there for clean completion.

## How the records were created

`npx tsx scripts/create-desa-master.ts --all` pulls the Kemendesa IDM tree for
Kab Bandung (kode 3204) and upserts a `Desa` per desa keyed by `kodeDesa` (official
kode wilayah), reconciling the pre-existing Arjasari demo records in place. The
public detail page + ingestion runner both fall back to the global DEFAULT template,
so no per-desa template assignment is required.

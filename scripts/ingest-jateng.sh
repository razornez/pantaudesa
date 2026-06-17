#!/usr/bin/env bash
# ============================================================
# Jawa Tengah full ingestion sweep — run in YOUR terminal
# (not via Claude Code harness which auto-backgrounds long runs)
#
# Usage:
#   bash scripts/ingest-jateng.sh osm        → koordinat OSM
#   bash scripts/ingest-jateng.sh opensid    → demografi OpenSID
#   bash scripts/ingest-jateng.sh idm        → IDM score + kategori
#   bash scripts/ingest-jateng.sh djpk       → Dana Desa
#   bash scripts/ingest-jateng.sh dukcapil   → penduduk, KK, luas wilayah
#   bash scripts/ingest-jateng.sh elevation  → topografi (OpenMeteo)
#   bash scripts/ingest-jateng.sh all        → semua adapter
#
# Prerequisite: desa master records must exist first:
#   npx tsx scripts/create-desa-master.ts --provinsi "Jawa Tengah"
#
# Each kabupaten is run sequentially — idempotent via --skip-have.
# ============================================================

cd "$(dirname "$0")/.." || exit 1

TSX=./node_modules/.bin/tsx
PASS=${1:-all}

JATENG_KABS=(
  # Kabupaten (29)
  Cilacap Banyumas Purbalingga Banjarnegara Kebumen Purworejo Wonosobo
  Magelang Boyolali Klaten Sukoharjo Wonogiri Karanganyar Sragen
  Grobogan Blora Rembang Pati Kudus Jepara Demak Semarang Temanggung
  Kendal Batang Pekalongan Pemalang Tegal Brebes
  # Kota (6)
  "Kota Magelang" "Kota Surakarta" "Kota Salatiga" "Kota Semarang"
  "Kota Pekalongan" "Kota Tegal"
)

run_adapter() {
  local adapter=$1; local skip_field=$2
  echo "=== Adapter: $adapter ==="
  for kab in "${JATENG_KABS[@]}"; do
    printf "  %-30s " "$kab"
    $TSX scripts/ingest-run.ts --kabupaten "$kab" --only "$adapter" \
      ${skip_field:+--skip-have "$skip_field"} 2>&1 \
      | grep -E "\[$adapter" | head -1 || echo "(no output)"
  done
}

if [[ "$PASS" == "idm" || "$PASS" == "all" ]]; then
  run_adapter "kemendesa-idm" "kategori"
fi

if [[ "$PASS" == "djpk" || "$PASS" == "all" ]]; then
  run_adapter "kemendesa-danadesa" "danaDesa"
fi

if [[ "$PASS" == "osm" || "$PASS" == "all" ]]; then
  run_adapter "osm" "geoLat"
fi

if [[ "$PASS" == "dukcapil" || "$PASS" == "all" ]]; then
  run_adapter "dukcapil-gis" "jumlahPenduduk"
fi

if [[ "$PASS" == "elevation" || "$PASS" == "all" ]]; then
  run_adapter "openmeteo-elevation" "topografi"
fi

# OpenSID: per-desa website scraping — run last, after geo+idm
if [[ "$PASS" == "opensid" || "$PASS" == "all" ]]; then
  run_adapter "opensid" "kepalaDesa"
fi

echo ""
echo "=== Coverage check Jawa Tengah ==="
$TSX -e "
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local', override: false }); loadEnv({ path: '.env', override: false });
if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL;
const { db } = await import('./src/lib/db/index.ts');
const f = async (k) => (await db.dataDesa.findMany({
  where:{ fieldKey:k, isActive:true, status:'PUBLISHED', sourceId:{not:null},
    desa:{ provinsi:{ contains:'Jawa Tengah', mode:'insensitive' } } },
  select:{desaId:true}, distinct:['desaId']
})).length;
const total = await db.desa.count({ where:{ provinsi:{ contains:'Jawa Tengah', mode:'insensitive' } } });
const [dana,geo,luas,kades,pend] = await Promise.all([f('danaDesa'),f('geoLat'),f('luasWilayah'),f('kepalaDesa'),f('jumlahPenduduk')]);
const p = n => n+'/'+total+'('+Math.round(n/total*100)+'%)';
console.log('danaDesa', p(dana), '| geoLat', p(geo), '| luas', p(luas), '| kades', p(kades), '| pend', p(pend));
await db.\$disconnect();
" 2>&1 | grep -E "danaDesa|ERR"

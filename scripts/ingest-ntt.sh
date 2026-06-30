#!/usr/bin/env bash
# Nusa Tenggara Timur — adapter sweep
# 21 kabupaten (Timor, Flores, Sumba, Sabu Raijua, Rote Ndao)
set -euo pipefail

ADAPTER="${1:-all}"
RESUME_FROM="${3:-}"
if [[ "${2:-}" == "--resume-from" ]]; then RESUME_FROM="$3"; fi

NTT_KABS=(
  Kupang "Timor Tengah Selatan" "Timor Tengah Utara" Belu Alor
  "Flores Timur" Sikka Ende Ngada Manggarai
  "Sumba Timur" "Sumba Barat" Lembata "Rote Ndao" "Manggarai Barat"
  Nagekeo "Sumba Tengah" "Sumba Barat Daya" "Manggarai Timur"
  "Sabu Raijua" Malaka
)

run_adapter() {
  local adapter="$1"
  local skip_field="$2"
  local skip=false
  echo "=== Adapter: $adapter ==="
  [[ -n "$RESUME_FROM" ]] && echo "  (skip sampai: $RESUME_FROM)"
  for kab in "${NTT_KABS[@]}"; do
    if [[ -n "$RESUME_FROM" && "$skip" == false ]]; then
      if [[ "$kab" == "$RESUME_FROM" ]]; then skip=true; else echo "  ↷ skip $kab"; continue; fi
    fi
    printf "  %-30s " "$kab"
    npx tsx scripts/ingest-run.ts --kabupaten "$kab" --only "$adapter" --skip-have "$skip_field" 2>/dev/null \
      | grep -E "processed=|errors=" | head -1 || true
  done
}

case "$ADAPTER" in
  idm)       run_adapter "kemendesa-idm"       "kategori"   ;;
  djpk)      run_adapter "kemendesa-danadesa"  "danaDesa"   ;;
  osm)       run_adapter "osm-overpass"        "geoLat"     ;;
  dukcapil)  run_adapter "dukcapil-gis"        "penduduk"   ;;
  elevation) run_adapter "openmeteo-elevation" "topografi"  ;;
  opensid)   run_adapter "opensid"             "kepalaDesa" ;;
  all)
    run_adapter "kemendesa-idm"       "kategori"
    run_adapter "kemendesa-danadesa"  "danaDesa"
    run_adapter "osm-overpass"        "geoLat"
    run_adapter "dukcapil-gis"        "penduduk"
    run_adapter "openmeteo-elevation" "topografi"
    run_adapter "opensid"             "kepalaDesa"
    ;;
  *) echo "Usage: $0 [idm|djpk|osm|dukcapil|elevation|opensid|all] [--resume-from <kabupaten>]"; exit 1 ;;
esac

echo ""
npx tsx scripts/monitor-ingest.ts --provinsi "Nusa Tenggara Timur" 2>/dev/null || true
echo "=== Coverage check ==="

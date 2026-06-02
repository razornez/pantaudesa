import type { DataAdapter } from "./adapter-base";
import type { AdapterContext, AdapterDesaResult, AdapterRunResult } from "./types";

const BASE = "https://idm.kemendesa.go.id";
const UA = "PantauDesa/1.0 (data ingestion; +https://pantaudesa.id)";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getJson(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return res.json();
}

function up(s: string) {
  return s.trim().toUpperCase();
}
/** "Kabupaten Bandung" / "Kota Bandung" → "BANDUNG" (IDM uses bare name) */
function bareKab(s: string) {
  return up(s).replace(/^(KABUPATEN|KOTA)\s+/, "");
}

/** Standard BPS 2-digit province codes (the IDM API keys kabupaten lists by these). */
const PROVINCE_CODE: Record<string, string> = {
  ACEH: "11", "SUMATERA UTARA": "12", "SUMATERA BARAT": "13", RIAU: "14", JAMBI: "15",
  "SUMATERA SELATAN": "16", BENGKULU: "17", LAMPUNG: "18", "KEPULAUAN BANGKA BELITUNG": "19",
  "KEPULAUAN RIAU": "21", "DKI JAKARTA": "31", "JAWA BARAT": "32", "JAWA TENGAH": "33",
  "DI YOGYAKARTA": "34", "DAERAH ISTIMEWA YOGYAKARTA": "34", "JAWA TIMUR": "35", BANTEN: "36",
  BALI: "51", "NUSA TENGGARA BARAT": "52", "NUSA TENGGARA TIMUR": "53",
  "KALIMANTAN BARAT": "61", "KALIMANTAN TENGAH": "62", "KALIMANTAN SELATAN": "63",
  "KALIMANTAN TIMUR": "64", "KALIMANTAN UTARA": "65", "SULAWESI UTARA": "71",
  "SULAWESI TENGAH": "72", "SULAWESI SELATAN": "73", "SULAWESI TENGGARA": "74",
  GORONTALO: "75", "SULAWESI BARAT": "76", MALUKU: "81", "MALUKU UTARA": "82",
  "PAPUA BARAT": "91", PAPUA: "94",
};

/**
 * Dana Desa pagu adapter — sources the official per-desa Dana Desa pagu (APBN,
 * origin DJPK) exposed via the Kemendesa IDM open cascading API. Walks
 * propinsi → kabupaten → kecamatan → desa by name to find the desa's `pagu`.
 * Writes fieldKey: danaDesa. (IDM score endpoint is currently 500 server-side.)
 */
export class KemendesaDanaDesaAdapter implements DataAdapter {
  readonly id = "kemendesa-danadesa";
  readonly sourceCode = "DJPK-PMK";
  readonly label = "Dana Desa pagu (Kemendesa IDM / DJPK)";

  async run(context: AdapterContext): Promise<AdapterRunResult> {
    const results: AdapterDesaResult[] = [];

    for (const d of context.desas) {
      try {
        const idProv = PROVINCE_CODE[up(d.provinsi)];
        if (!idProv) {
          results.push({ desaId: d.desaId, fields: [], rawMeta: { note: "prov code unknown", provinsi: d.provinsi } });
          continue;
        }

        const kabs = (await getJson(`/users/list_kabupaten/${idProv}`)) as Array<Record<string, string>>;
        const kab = kabs.find((k) => bareKab(String(k.nama_kab_kota ?? "")) === bareKab(d.kabupaten));
        if (!kab?.id_kabupaten) {
          results.push({ desaId: d.desaId, fields: [], rawMeta: { note: "kab not found", kabupaten: d.kabupaten } });
          continue;
        }
        await sleep(400);

        const kecs = (await getJson(`/users/list_kecamatan/${kab.id_kabupaten}`)) as Array<Record<string, string>>;
        const kec = kecs.find((k) => up(String(k.nama_kecamatan ?? "")) === up(d.kecamatan));
        if (!kec?.id_kecamatan) {
          results.push({ desaId: d.desaId, fields: [], rawMeta: { note: "kec not found", kecamatan: d.kecamatan } });
          continue;
        }
        await sleep(400);

        const desas = (await getJson(`/users/list_desa/${kec.id_kecamatan}`)) as Array<Record<string, string>>;
        const row = desas.find((x) => up(String(x.nama_desa ?? "")) === up(d.nama));
        const pagu = row ? parseFloat(String(row.pagu)) : NaN;

        if (row && Number.isFinite(pagu) && pagu > 0) {
          const tahun = parseInt(String(row.tahun_data), 10);
          const fields = [{ fieldKey: "danaDesa", value: Math.round(pagu) }];
          if (Number.isFinite(tahun)) fields.push({ fieldKey: "tahunData", value: tahun });
          results.push({
            desaId: d.desaId,
            fields,
            rawMeta: { id_desa: row.id_desa, tahun_data: row.tahun_data, pagu: row.pagu },
          });
        } else {
          results.push({ desaId: d.desaId, fields: [], rawMeta: { note: "desa/pagu not found", nama: d.nama } });
        }
        await sleep(400);
      } catch (error) {
        results.push({
          desaId: d.desaId,
          fields: [],
          rawMeta: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    }

    return { adapterId: this.id, sourceCode: this.sourceCode, fetchedAt: new Date(), results };
  }
}

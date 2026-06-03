import type { DataAdapter } from "./adapter-base";
import type { AdapterContext, AdapterDesaResult, AdapterRunResult } from "./types";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "PantauDesa/1.0 (data ingestion; +https://pantaudesa.id)";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface OverpassElement {
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

/**
 * OSM Overpass adapter — resolves desa center via the actual administrative
 * village node/relation (place=village / admin_level=7) scoped to the kabupaten
 * area, rather than fuzzy name geocoding (which matched roads). Writes geoLat/geoLng.
 */
export class OSMOverpassAdapter implements DataAdapter {
  readonly id = "osm-overpass";
  readonly sourceCode = "OSM";
  readonly label = "OpenStreetMap (Overpass)";

  /** "Bandung" → "Kabupaten Bandung"; leaves "Kota …"/"Kabupaten …" as-is */
  private normalizeKab(kab: string): string {
    return /^(kabupaten|kota)\b/i.test(kab.trim()) ? kab.trim() : `Kabupaten ${kab.trim()}`;
  }

  private buildQuery(nama: string, kab: string): string {
    // admin_level 5 = kabupaten/kota, 7 = desa/kelurahan in Indonesian OSM.
    const esc = (s: string) => s.replace(/"/g, '\\"');
    return `[out:json][timeout:25];
area["admin_level"="5"]["name"="${esc(kab)}"]->.k;
(
  node["place"~"village|hamlet"]["name"="${esc(nama)}"](area.k);
  relation["boundary"="administrative"]["admin_level"="7"]["name"="${esc(nama)}"](area.k);
  way["boundary"="administrative"]["admin_level"="7"]["name"="${esc(nama)}"](area.k);
);
out center tags 5;`;
  }

  async run(context: AdapterContext): Promise<AdapterRunResult> {
    const results: AdapterDesaResult[] = [];

    for (const d of context.desas) {
      const kab = this.normalizeKab(d.kabupaten);
      const query = this.buildQuery(d.nama, kab);

      try {
        const res = await fetch(OVERPASS_URL, {
          method: "POST",
          headers: { "User-Agent": USER_AGENT, "Content-Type": "text/plain" },
          body: query,
        });
        if (!res.ok) {
          results.push({ desaId: d.desaId, fields: [], rawMeta: { httpStatus: res.status } });
        } else {
          const json = (await res.json()) as { elements?: OverpassElement[] };
          const els = json.elements ?? [];
          // Prefer a place=village node, else any element with coordinates.
          const node = els.find((e) => e.type === "node" && e.tags?.place) ?? els[0];
          const lat = node?.lat ?? node?.center?.lat;
          const lng = node?.lon ?? node?.center?.lon;

          if (typeof lat === "number" && typeof lng === "number") {
            results.push({
              desaId: d.desaId,
              fields: [
                { fieldKey: "geoLat", value: lat },
                { fieldKey: "geoLng", value: lng },
              ],
              rawMeta: {
                osmType: node?.type,
                place: node?.tags?.place,
                adminLevel: node?.tags?.admin_level,
                name: node?.tags?.name,
              },
            });
          } else {
            results.push({ desaId: d.desaId, fields: [], rawMeta: { note: "no node", query } });
          }
        }
      } catch (error) {
        results.push({
          desaId: d.desaId,
          fields: [],
          rawMeta: { error: error instanceof Error ? error.message : String(error) },
        });
      }

      await sleep(1100); // Overpass is heavier; be polite (light queries tolerate ~1/s).
    }

    return { adapterId: this.id, sourceCode: this.sourceCode, fetchedAt: new Date(), results };
  }
}

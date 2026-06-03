/**
 * Create/refresh Desa master records for Kabupaten Bandung from the Kemendesa
 * IDM cascading API (which exposes the official kode wilayah per desa).
 *
 * Usage:
 *   npx tsx scripts/create-desa-master.ts                       → pilot kecamatan
 *   npx tsx scripts/create-desa-master.ts Cileunyi Banjaran     → named kecamatan
 *   npx tsx scripts/create-desa-master.ts --all                 → every kecamatan in Kab Bandung
 *
 * Idempotent: upserts by kodeDesa (= IDM id_desa). Does NOT create per-desa
 * template assignments — the ingestion runner + public resolver fall back to the
 * global DEFAULT template. Routes DB writes through DIRECT_URL (session pooler).
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: false });
loadEnv({ path: ".env", override: false });
if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL;

const BASE = "https://idm.kemendesa.go.id";
const UA = "PantauDesa/1.0 (data ingestion; +https://pantaudesa.id)";
const KAB_BANDUNG = "3204";
const PILOT = ["Cileunyi", "Cimenyan", "Cilengkrang"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function idm<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

function titleCase(s: string): string {
  return s.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
function kebab(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type KecRow = { id_kecamatan: string; nama_kecamatan: string };
type DesaRow = { id_desa: string; nama_desa: string; tahun_data: string; pagu: string };

async function main() {
  const argv = process.argv.slice(2);
  const wantAll = argv.includes("--all");
  const targets = argv.filter((a) => !a.startsWith("--"));

  const { db } = await import("@/lib/db");
  if (!db) throw new Error("Database tidak tersedia.");

  const kecs = await idm<KecRow[]>(`/users/list_kecamatan/${KAB_BANDUNG}`);
  const selected = wantAll
    ? kecs
    : kecs.filter((k) =>
        (targets.length ? targets : PILOT).some((t) => k.nama_kecamatan.toUpperCase() === t.toUpperCase()),
      );
  if (selected.length === 0) throw new Error("Tidak ada kecamatan yang cocok.");
  console.log(`Kecamatan target (${selected.length}): ${selected.map((k) => titleCase(k.nama_kecamatan)).join(", ")}\n`);

  let created = 0;
  let updated = 0;
  let reconciled = 0;
  for (const kec of selected) {
    await sleep(250);
    const rows = await idm<DesaRow[]>(`/users/list_desa/${kec.id_kecamatan}`);
    // Dedup by kode wilayah (id_desa); keep the latest tahun_data row.
    const byKode = new Map<string, DesaRow>();
    for (const r of rows) {
      const prev = byKode.get(r.id_desa);
      if (!prev || Number(r.tahun_data) > Number(prev.tahun_data)) byKode.set(r.id_desa, r);
    }

    const kecName = titleCase(kec.nama_kecamatan);
    for (const r of byKode.values()) {
      try {
        const kodeDesa = r.id_desa;
        const nama = titleCase(r.nama_desa);

        // Reconcile legacy seeded records (demo-desa-* without kodeDesa): match by
        // nama+kecamatan and backfill kodeDesa so the upsert updates in place
        // instead of creating a duplicate.
        const legacy = await db.desa.findFirst({
          where: {
            kodeDesa: null,
            kabupaten: { equals: "Bandung", mode: "insensitive" },
            kecamatan: { equals: kecName, mode: "insensitive" },
            nama: { equals: nama, mode: "insensitive" },
          },
          select: { id: true },
        });
        if (legacy) {
          await db.desa.update({ where: { id: legacy.id }, data: { kodeDesa } });
          reconciled += 1;
        }

        const base = kebab(r.nama_desa);
        const clash = await db.desa.findUnique({ where: { slug: base }, select: { kodeDesa: true } });
        const slug = clash && clash.kodeDesa !== kodeDesa ? `${base}-${kodeDesa.slice(-4)}` : base;

        const existing = await db.desa.findUnique({ where: { kodeDesa }, select: { id: true } });
        await db.desa.upsert({
          where: { kodeDesa },
          create: {
            kodeDesa,
            nama,
            slug,
            kecamatan: kecName,
            kabupaten: "Bandung",
            provinsi: "Jawa Barat",
            dataStatus: "demo",
          },
          update: {
            nama,
            kecamatan: kecName,
            kabupaten: "Bandung",
            provinsi: "Jawa Barat",
          },
        });
        if (existing || legacy) updated += 1;
        else created += 1;
      } catch (e) {
        console.log(`  ! ${r.nama_desa}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    console.log(`  ${titleCase(kec.nama_kecamatan).padEnd(16)} ${byKode.size} desa`);
  }

  const total = await db.desa.count();
  console.log(`\nDone. created=${created} updated=${updated} reconciled=${reconciled} | total desa in DB: ${total}`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error("FAILED:", e instanceof Error ? e.message : String(e));
  process.exit(1);
});

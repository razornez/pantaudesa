/**
 * Batch ingestion runner for one or more desa.
 *
 * Usage:
 *   npx tsx scripts/ingest-run.ts                      → default: batukarut
 *   npx tsx scripts/ingest-run.ts batukarut lebakwangi → explicit slugs
 *   npx tsx scripts/ingest-run.ts --kecamatan Arjasari → every desa in a kecamatan
 *
 * Routes through DIRECT_URL (session-mode, port 5432) because the transaction
 * pooler (6543) refuses connections under saturation. Env is loaded BEFORE the
 * Prisma singleton (@/lib/db) is imported so the client picks up the override.
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: false });
loadEnv({ path: ".env", override: false });
if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL;

async function main() {
  const argv = process.argv.slice(2);

  const { db } = await import("@/lib/db");
  const { OSMOverpassAdapter } = await import("@/lib/adapters/osm-overpass-adapter");
  const { KemendesaDanaDesaAdapter } = await import("@/lib/adapters/kemendesa-danadesa-adapter");
  const { OpenSIDAdapter } = await import("@/lib/adapters/opensid-adapter");
  const { runIngestion } = await import("@/lib/adapters/ingestion-runner");
  if (!db) throw new Error("Database tidak tersedia.");

  // Resolve target desa: --kecamatan <name>, explicit slugs, or default batukarut.
  const kecIdx = argv.indexOf("--kecamatan");
  const slugArgs = argv.filter((a) => !a.startsWith("--"));
  const where =
    kecIdx >= 0 && argv[kecIdx + 1]
      ? { kecamatan: { equals: argv[kecIdx + 1], mode: "insensitive" as const } }
      : { slug: { in: slugArgs.length ? slugArgs : ["batukarut"] } };

  const desas = await db.desa.findMany({
    where,
    select: { id: true, nama: true, kecamatan: true, kabupaten: true, provinsi: true },
    orderBy: { nama: "asc" },
  });
  if (desas.length === 0) throw new Error("Tidak ada desa yang cocok dengan filter.");
  console.log(`Target: ${desas.length} desa → ${desas.map((d) => d.nama).join(", ")}\n`);

  const ctx = {
    desas: desas.map((d) => ({
      desaId: d.id,
      nama: d.nama,
      kecamatan: d.kecamatan,
      kabupaten: d.kabupaten,
      provinsi: d.provinsi,
    })),
  };

  for (const adapter of [new OSMOverpassAdapter(), new KemendesaDanaDesaAdapter(), new OpenSIDAdapter()]) {
    const s = await runIngestion(adapter, ctx);
    console.log(
      `[${adapter.id}] processed=${s.desaProcessed} updated=${s.fieldsUpdated} skipped=${s.fieldsSkipped} errors=${s.errors.length}`,
    );
    s.errors.slice(0, 3).forEach((e) => console.log(`    ! ${e.replace(/\s+/g, " ").slice(0, 140)}`));
  }

  console.log("\n=== Real fields per desa (active, attributed) ===");
  for (const d of desas) {
    const rows = await db.dataDesa.findMany({
      where: { desaId: d.id, isActive: true, status: "PUBLISHED", sourceId: { not: null } },
      select: { fieldKey: true },
      orderBy: { fieldKey: "asc" },
    });
    console.log(`  ${d.nama.padEnd(14)} ${String(rows.length).padStart(2)} → ${rows.map((r) => r.fieldKey).join(", ")}`);
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error("FAILED:", e instanceof Error ? e.message : String(e));
  process.exit(1);
});

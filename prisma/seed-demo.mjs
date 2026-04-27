import prismaPkg from "../src/generated/prisma/index.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { PrismaClient } = prismaPkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

loadLocalEnv();

const prisma = new PrismaClient();

const desaRecords = [
  ["ancolmekar", "Ancolmekar", "https://ancolmekar.desa.id/"],
  ["arjasari", "Arjasari", "https://arjasari.desa.id/"],
  ["baros", "Baros", "https://baros.desa.id/"],
  ["batukarut", "Batukarut", "https://batukarut.desa.id/"],
  ["lebakwangi", "Lebakwangi", "https://lebakwangi.desa.id/"],
  ["mangunjaya", "Mangunjaya", "https://mangunjaya.desa.id/"],
  ["mekarjaya", "Mekarjaya", null],
  ["patrolsari", "Patrolsari", "https://patrolsari.desa.id/"],
  ["pinggirsari", "Pinggirsari", "https://pinggirsari.desa.id/"],
  ["rancakole", "Rancakole", "https://rancakole.desa.id/"],
  ["wargaluyu", "Wargaluyu", "https://wargaluyu.desa.id/"],
].map(([slug, nama, websiteUrl]) => ({
  id: `demo-desa-${slug}`,
  slug,
  nama,
  websiteUrl,
}));

const dataSources = [
  {
    id: "source-kecamatan-arjasari-desa-list",
    scopeType: "kecamatan",
    scopeName: "Arjasari",
    sourceName: "Kecamatan Arjasari - profil letak geografis dan daftar desa",
    sourceUrl: "https://kecamatanarjasari.bandungkab.go.id/profil/letak-geografis",
    sourceType: "kecamatan_page",
    accessStatus: "accessible",
    dataAvailability: "mixed",
    dataStatus: "imported",
  },
  {
    id: "source-kecamatan-arjasari-struktur-pemerintahan",
    scopeType: "kecamatan",
    scopeName: "Arjasari",
    sourceName: "Kecamatan Arjasari - struktur pemerintahan",
    sourceUrl: "https://kecamatanarjasari.bandungkab.go.id/profil/struktur-pemerintahan",
    sourceType: "kecamatan_page",
    accessStatus: "accessible",
    dataAvailability: "profile_only",
    dataStatus: "imported",
  },
  ...desaRecords
    .filter((desa) => desa.websiteUrl)
    .map((desa) => ({
      id: `source-desa-${desa.slug}-official-website`,
      desaId: desa.id,
      scopeType: "desa",
      scopeName: desa.nama,
      sourceName: `Website resmi Desa ${desa.nama}`,
      sourceUrl: desa.websiteUrl,
      sourceType: "official_website",
      accessStatus: "accessible",
      dataAvailability: "mixed",
      dataStatus: "imported",
    })),
  {
    id: "source-desa-mekarjaya-kecamatan-detail",
    desaId: "demo-desa-mekarjaya",
    scopeType: "desa",
    scopeName: "Mekarjaya",
    sourceName: "Kecamatan Arjasari - detail Desa Mekarjaya",
    sourceUrl: "https://kecamatanarjasari.bandungkab.go.id/desa/desa-mekarjaya",
    sourceType: "kecamatan_page",
    accessStatus: "requires_review",
    dataAvailability: "profile_only",
    dataStatus: "needs_review",
    notes: "Direct desa website remained unconfirmed in manual discovery.",
  },
  {
    id: "source-desa-wargaluyu-kecamatan-typo-review",
    desaId: "demo-desa-wargaluyu",
    scopeType: "desa",
    scopeName: "Wargaluyu",
    sourceName: "Kecamatan Arjasari - Wargaluyu website field needs review",
    sourceUrl: "http://ww.wargaluyu.desa.id",
    sourceType: "kecamatan_page",
    accessStatus: "requires_review",
    dataAvailability: "unknown",
    dataStatus: "needs_review",
    notes: "Kecamatan website field appears typo-like or stale; working domain is tracked separately.",
  },
];

const documents = [
  {
    id: "doc-ancolmekar-realisasi-2019",
    desaId: "demo-desa-ancolmekar",
    sourceId: "source-desa-ancolmekar-official-website",
    tahun: 2019,
    namaDokumen: "Laporan Realisasi Pelaksanaan Anggaran Pendapatan 2019",
    jenisDokumen: "realisasi",
    url: "https://ancolmekar.desa.id/artikel/2020/1/6/laporan-realisasi-pelaksanaan-anggaran-pendapatan-2019",
    dataStatus: "needs_review",
  },
  {
    id: "doc-lebakwangi-apbdes-2022",
    desaId: "demo-desa-lebakwangi",
    sourceId: "source-desa-lebakwangi-official-website",
    tahun: 2022,
    namaDokumen: "APBDes 2022",
    jenisDokumen: "apbdes",
    url: "https://lebakwangi.desa.id/index.php/artikel/2022/1/3/apbdes-2022",
    dataStatus: "imported",
  },
  {
    id: "doc-lebakwangi-realisasi-semester-1-2023",
    desaId: "demo-desa-lebakwangi",
    sourceId: "source-desa-lebakwangi-official-website",
    tahun: 2023,
    namaDokumen: "Laporan Realisasi APBDES 2023 Semester I",
    jenisDokumen: "realisasi",
    dataStatus: "needs_review",
  },
  {
    id: "doc-lebakwangi-realisasi-2020",
    desaId: "demo-desa-lebakwangi",
    sourceId: "source-desa-lebakwangi-official-website",
    tahun: 2020,
    namaDokumen: "Laporan Realisasi APBDes 2020",
    jenisDokumen: "realisasi",
    dataStatus: "needs_review",
  },
  {
    id: "doc-mangunjaya-apbdes-2021",
    desaId: "demo-desa-mangunjaya",
    sourceId: "source-desa-mangunjaya-official-website",
    tahun: 2021,
    namaDokumen: "APBDes 2021 summary",
    jenisDokumen: "apbdes",
    dataStatus: "needs_review",
  },
  {
    id: "doc-mangunjaya-realisasi-2025",
    desaId: "demo-desa-mangunjaya",
    sourceId: "source-desa-mangunjaya-official-website",
    tahun: 2025,
    namaDokumen: "Realisasi Pertanggungjawaban APBDes Tahun 2025",
    jenisDokumen: "realisasi",
    dataStatus: "needs_review",
  },
  {
    id: "doc-patrolsari-apbdes-2026",
    desaId: "demo-desa-patrolsari",
    sourceId: "source-desa-patrolsari-official-website",
    tahun: 2026,
    namaDokumen: "APBDes 2026",
    jenisDokumen: "apbdes",
    dataStatus: "needs_review",
  },
  {
    id: "doc-patrolsari-realisasi-2025",
    desaId: "demo-desa-patrolsari",
    sourceId: "source-desa-patrolsari-official-website",
    tahun: 2025,
    namaDokumen: "Laporan Realisasi APBDes 2025",
    jenisDokumen: "realisasi",
    dataStatus: "needs_review",
  },
  {
    id: "doc-patrolsari-realisasi-2024",
    desaId: "demo-desa-patrolsari",
    sourceId: "source-desa-patrolsari-official-website",
    tahun: 2024,
    namaDokumen: "Realisasi APBDes 2024",
    jenisDokumen: "realisasi",
    url: "https://patrolsari.desa.id/artikel/2025/4/11/realisasi-apbdes-tahun-anggaran-2024",
    dataStatus: "needs_review",
  },
  {
    id: "doc-pinggirsari-realisasi-2025",
    desaId: "demo-desa-pinggirsari",
    sourceId: "source-desa-pinggirsari-official-website",
    tahun: 2025,
    namaDokumen: "Laporan Pertanggungjawaban Realisasi Anggaran Pendapatan dan Belanja Desa Tahun Anggaran 2025",
    jenisDokumen: "realisasi",
    dataStatus: "needs_review",
  },
  {
    id: "doc-rancakole-apbdes-2021",
    desaId: "demo-desa-rancakole",
    sourceId: "source-desa-rancakole-official-website",
    tahun: 2021,
    namaDokumen: "Infografik APBDes 2021",
    jenisDokumen: "apbdes",
    dataStatus: "needs_review",
  },
  {
    id: "doc-rancakole-realisasi-2019",
    desaId: "demo-desa-rancakole",
    sourceId: "source-desa-rancakole-official-website",
    tahun: 2019,
    namaDokumen: "Realisasi APBDesa 2019",
    jenisDokumen: "realisasi",
    dataStatus: "needs_review",
  },
  {
    id: "doc-rancakole-apbdes-2019",
    desaId: "demo-desa-rancakole",
    sourceId: "source-desa-rancakole-official-website",
    tahun: 2019,
    namaDokumen: "APBDes 2019 archive item",
    jenisDokumen: "apbdes",
    dataStatus: "needs_review",
  },
  {
    id: "doc-rancakole-apbdes-2018",
    desaId: "demo-desa-rancakole",
    sourceId: "source-desa-rancakole-official-website",
    tahun: 2018,
    namaDokumen: "APBDes 2018 archive item",
    jenisDokumen: "apbdes",
    dataStatus: "needs_review",
  },
  {
    id: "doc-wargaluyu-apbdes-2025",
    desaId: "demo-desa-wargaluyu",
    sourceId: "source-desa-wargaluyu-official-website",
    tahun: 2025,
    namaDokumen: "APBDes 2025",
    jenisDokumen: "apbdes",
    dataStatus: "needs_review",
  },
  {
    id: "doc-wargaluyu-apbdes-2021",
    desaId: "demo-desa-wargaluyu",
    sourceId: "source-desa-wargaluyu-official-website",
    tahun: 2021,
    namaDokumen: "APBDes 2021 / realisasi-style content",
    jenisDokumen: "apbdes",
    url: "https://wargaluyu.desa.id/artikel/2021/5/29/apbdes-2021",
    dataStatus: "needs_review",
  },
];

function loadLocalEnv() {
  for (const fileName of [".env.local", ".env"]) {
    const envPath = path.join(__dirname, "..", fileName);
    if (!fs.existsSync(envPath)) continue;

    const content = fs.readFileSync(envPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const equalIndex = line.indexOf("=");
      if (equalIndex === -1) continue;

      const key = line.slice(0, equalIndex).trim();
      if (process.env[key]) continue;

      let value = line.slice(equalIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

async function seedDesa() {
  for (const desa of desaRecords) {
    await prisma.desa.upsert({
      where: { id: desa.id },
      update: {
        nama: desa.nama,
        slug: desa.slug,
        kecamatan: "Arjasari",
        kabupaten: "Bandung",
        provinsi: "Jawa Barat",
        tahunData: 2026,
        websiteUrl: desa.websiteUrl,
        dataStatus: "demo",
      },
      create: {
        id: desa.id,
        nama: desa.nama,
        slug: desa.slug,
        kecamatan: "Arjasari",
        kabupaten: "Bandung",
        provinsi: "Jawa Barat",
        tahunData: 2026,
        websiteUrl: desa.websiteUrl,
        dataStatus: "demo",
      },
    });
  }
}

async function seedDataSources() {
  for (const source of dataSources) {
    const { id, ...data } = source;
    await prisma.dataSource.upsert({
      where: { id },
      update: data,
      create: source,
    });
  }
}

async function seedDocuments() {
  for (const document of documents) {
    const { id, ...data } = document;
    await prisma.dokumenPublik.upsert({
      where: { id },
      update: {
        ...data,
        status: "needs_review",
      },
      create: {
        ...document,
        status: "needs_review",
      },
    });
  }
}

function assertNoVerifiedData() {
  const hasVerified = [...desaRecords, ...dataSources, ...documents].some(
    (record) => record.dataStatus === "verified"
  );
  if (hasVerified) {
    throw new Error("Seed is not allowed to write verified records.");
  }
}

async function main() {
  assertNoVerifiedData();
  await seedDesa();
  await seedDataSources();
  await seedDocuments();

  console.log(`Prepared demo seed records: ${desaRecords.length} desa, ${dataSources.length} sources, ${documents.length} documents.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

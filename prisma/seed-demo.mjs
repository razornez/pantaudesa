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

const demoVillageRecords = [
  { id: "1", nama: "Desa Sukamaju", kecamatan: "Ciawi", kabupaten: "Bogor", provinsi: "Jawa Barat", total: 1250000000, realisasi: 1187500000, persen: 95, status: "baik", penduduk: 3420, kategori: "Infrastruktur" },
  { id: "2", nama: "Desa Harapan Jaya", kecamatan: "Cibinong", kabupaten: "Bogor", provinsi: "Jawa Barat", total: 980000000, realisasi: 784000000, persen: 80, status: "sedang", penduduk: 2890, kategori: "Pendidikan" },
  { id: "3", nama: "Desa Maju Bersama", kecamatan: "Jonggol", kabupaten: "Bogor", provinsi: "Jawa Barat", total: 870000000, realisasi: 417600000, persen: 48, status: "rendah", penduduk: 2100, kategori: "Kesehatan" },
  { id: "4", nama: "Desa Sumber Rejeki", kecamatan: "Mlati", kabupaten: "Sleman", provinsi: "D.I. Yogyakarta", total: 1340000000, realisasi: 1286400000, persen: 96, status: "baik", penduduk: 4100, kategori: "Infrastruktur" },
  { id: "5", nama: "Desa Mekar Sari", kecamatan: "Depok", kabupaten: "Sleman", provinsi: "D.I. Yogyakarta", total: 1120000000, realisasi: 1008000000, persen: 90, status: "baik", penduduk: 3750, kategori: "Pertanian" },
  { id: "6", nama: "Desa Karang Indah", kecamatan: "Godean", kabupaten: "Sleman", provinsi: "D.I. Yogyakarta", total: 760000000, realisasi: 532000000, persen: 70, status: "sedang", penduduk: 1980, kategori: "Pariwisata" },
  { id: "7", nama: "Desa Baru Makmur", kecamatan: "Waru", kabupaten: "Sidoarjo", provinsi: "Jawa Timur", total: 1480000000, realisasi: 1406000000, persen: 95, status: "baik", penduduk: 5200, kategori: "Infrastruktur" },
  { id: "8", nama: "Desa Sumber Agung", kecamatan: "Gedangan", kabupaten: "Sidoarjo", provinsi: "Jawa Timur", total: 920000000, realisasi: 598000000, persen: 65, status: "sedang", penduduk: 2640, kategori: "Ekonomi" },
  { id: "9", nama: "Desa Pura Harapan", kecamatan: "Taman", kabupaten: "Sidoarjo", provinsi: "Jawa Timur", total: 1050000000, realisasi: 367500000, persen: 35, status: "rendah", penduduk: 3100, kategori: "Kesehatan" },
  { id: "10", nama: "Desa Tirta Mulya", kecamatan: "Sungai Raya", kabupaten: "Kubu Raya", provinsi: "Kalimantan Barat", total: 890000000, realisasi: 836600000, persen: 94, status: "baik", penduduk: 2200, kategori: "Pertanian" },
  { id: "11", nama: "Desa Rimba Jaya", kecamatan: "Kuala Mandor B", kabupaten: "Kubu Raya", provinsi: "Kalimantan Barat", total: 670000000, realisasi: 436000000, persen: 65, status: "sedang", penduduk: 1450, kategori: "Infrastruktur" },
  { id: "12", nama: "Desa Talang Hijau", kecamatan: "Muara Enim", kabupaten: "Muara Enim", provinsi: "Sumatera Selatan", total: 1100000000, realisasi: 1034000000, persen: 94, status: "baik", penduduk: 3300, kategori: "Perkebunan" },
  { id: "13", nama: "Desa Pantai Indah", kecamatan: "Mesuji", kabupaten: "Mesuji", provinsi: "Lampung", total: 780000000, realisasi: 288600000, persen: 37, status: "rendah", penduduk: 1890, kategori: "Perikanan" },
  { id: "14", nama: "Desa Ingin Jaya", kecamatan: "Krueng Barona Jaya", kabupaten: "Aceh Besar", provinsi: "Aceh", total: 1200000000, realisasi: 1140000000, persen: 95, status: "baik", penduduk: 4500, kategori: "Infrastruktur" },
  { id: "15", nama: "Desa Dolok Sanggul", kecamatan: "Lintongnihuta", kabupaten: "Humbang Hasundutan", provinsi: "Sumatera Utara", total: 960000000, realisasi: 768000000, persen: 80, status: "sedang", penduduk: 2780, kategori: "Pertanian" },
  { id: "16", nama: "Desa Bontomarannu", kecamatan: "Bontomarannu", kabupaten: "Gowa", provinsi: "Sulawesi Selatan", total: 1150000000, realisasi: 1092500000, persen: 95, status: "baik", penduduk: 3900, kategori: "Infrastruktur" },
  { id: "17", nama: "Desa Mataram Baru", kecamatan: "Labuapi", kabupaten: "Lombok Barat", provinsi: "NTB", total: 830000000, realisasi: 456500000, persen: 55, status: "rendah", penduduk: 2400, kategori: "Pariwisata" },
  { id: "18", nama: "Desa Toili", kecamatan: "Toili", kabupaten: "Banggai", provinsi: "Sulawesi Tengah", total: 740000000, realisasi: 607000000, persen: 82, status: "baik", penduduk: 2050, kategori: "Pertanian" },
  { id: "19", nama: "Desa Wamena", kecamatan: "Wamena", kabupaten: "Jayawijaya", provinsi: "Papua Pegunungan", total: 2100000000, realisasi: 945000000, persen: 45, status: "rendah", penduduk: 1200, kategori: "Infrastruktur" },
  { id: "20", nama: "Desa Batulicin", kecamatan: "Kusan Hilir", kabupaten: "Tanah Bumbu", provinsi: "Kalimantan Selatan", total: 990000000, realisasi: 881100000, persen: 89, status: "baik", penduduk: 3100, kategori: "Pertambangan" },
];

const apbdesFields = [
  ["1", "Penyelenggaraan Pemerintahan Desa", 0.18, 1.03],
  ["2", "Pelaksanaan Pembangunan Desa", 0.44, 0.97],
  ["3", "Pembinaan Kemasyarakatan Desa", 0.14, 1.02],
  ["4", "Pemberdayaan Masyarakat Desa", 0.18, 0.98],
  ["5", "Penanggulangan Bencana dan Darurat", 0.06, 0.55],
];

const voiceExamples = [
  { id: "v1", desaId: "1", category: "infrastruktur", text: "Jalan di RT 04 baru selesai diperbaiki bulan lalu, hasilnya bagus dan mulus. Terima kasih desanya sudah gerak cepat.", author: "Pak Hendra", days: 3, helpful: 12, benar: 18, bohong: 0, status: "RESOLVED" },
  { id: "v4", desaId: "1", category: "infrastruktur", text: "Lampu jalan di gang belakang balai desa masih mati sudah 3 minggu. Mohon segera diperbaiki, warga takut jalan malam.", author: "Pak Darto", days: 2, helpful: 21, benar: 28, bohong: 1, status: "RESOLVED" },
  { id: "v2", desaId: "1", category: "fasilitas", text: "Posyandu di RT 02 aktif tiap bulan, petugas ramah dan tidak pernah minta bayaran. Mantap.", author: "Bu Ratna", days: 8, helpful: 7, benar: 15, bohong: 0, status: "OPEN" },
  { id: "v3", desaId: "1", category: "bansos", text: "BLT sudah cair ke keluarga saya, prosesnya lancar dan transparan. Semoga terus begini.", author: "Anonim", isAnon: true, days: 15, helpful: 5, benar: 9, bohong: 0, status: "OPEN" },
  { id: "v5", desaId: "2", category: "anggaran", text: "Sudah minta lihat APBDes ke pak kades, katanya nanti-nanti terus. Padahal ini hak warga kan? Sudah 2 minggu bolak-balik.", author: "Ibu Sumarni", days: 5, helpful: 34, benar: 41, bohong: 2, status: "OPEN" },
  { id: "v6", desaId: "2", category: "infrastruktur", text: "Saluran drainase RT 01 sudah mampet 2 bulan. Waktu hujan banjir kecil-kecilan masuk halaman. Sudah lapor ke RT tapi tidak ada tindakan.", author: "Anonim", isAnon: true, days: 12, helpful: 18, benar: 23, bohong: 0, status: "IN_PROGRESS" },
  { id: "v7", desaId: "2", category: "fasilitas", text: "PAUD di desa ini bagus, gurunya rajin dan gedungnya baru direnovasi. Anak saya senang sekolah di sini.", author: "Bu Wulandari", days: 20, helpful: 9, benar: 11, bohong: 0, status: "OPEN" },
  { id: "v8", desaId: "3", category: "bansos", text: "BLT sudah 3 bulan tidak cair. Sudah lapor ke RT tapi katanya lagi diproses. Keluarga saya butuh sekarang.", author: "Pak Sugeng", days: 1, helpful: 67, benar: 78, bohong: 2, status: "OPEN" },
  { id: "v9", desaId: "3", category: "infrastruktur", text: "Jalan utama berlubang parah. Motor saya sudah dua kali rusak karena jalan ini. Warga perlu penjelasan rencana perbaikannya.", author: "Anonim", isAnon: true, days: 4, helpful: 89, benar: 112, bohong: 3, status: "OPEN" },
  { id: "v10", desaId: "3", category: "anggaran", text: "Serapan hanya 48% tapi saya tidak melihat ada pembangunan berarti. Saya ingin tahu dokumen APBDes dan rencana kegiatannya.", author: "Pak Muryanto", days: 7, helpful: 102, benar: 98, bohong: 1, status: "OPEN" },
  { id: "v11", desaId: "3", category: "fasilitas", text: "Posyandu buka tidak teratur, kadang buka kadang tidak ada kabar. Ibu-ibu bingung kapan harus datang.", author: "Bu Endang", days: 10, helpful: 45, benar: 52, bohong: 0, status: "OPEN" },
  { id: "v12", desaId: "7", category: "infrastruktur", text: "Pengerjaan jalan desa sangat rapi dan kualitasnya bagus. Warga ikut mengawasi langsung saat pengerjaan.", author: "Pak Zainal", days: 6, helpful: 15, benar: 18, bohong: 0, status: "OPEN" },
  { id: "v13", desaId: "7", category: "bansos", text: "Pembagian BLT tertib dan transparan. Ada daftar nama yang ditempel di balai desa, siapapun bisa cek.", author: "Bu Mahmudah", days: 14, helpful: 28, benar: 31, bohong: 0, status: "OPEN" },
  { id: "v14", desaId: "9", category: "anggaran", text: "Dana desa katanya lebih dari Rp 1 miliar, tapi warga belum melihat penjelasan kegiatan. Saya ingin tahu dokumennya.", author: "Anonim", isAnon: true, days: 2, helpful: 156, benar: 134, bohong: 5, status: "OPEN" },
  { id: "v15", desaId: "9", category: "infrastruktur", text: "Jalan ke sawah sudah rusak bertahun-tahun. Petani rugi karena sulit angkut hasil panen. Mohon dicek prioritasnya.", author: "Pak Sarpan", days: 9, helpful: 78, benar: 89, bohong: 0, status: "OPEN" },
  { id: "v16", desaId: "9", category: "bansos", text: "Tetangga saya mampu tapi dapat BLT. Saya yang susah belum dapat. Tolong dicek datanya secara terbuka.", author: "Anonim", isAnon: true, days: 3, helpful: 134, benar: 98, bohong: 8, status: "IN_PROGRESS" },
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

  for (const desa of demoVillageRecords) {
    await prisma.desa.upsert({
      where: { id: desa.id },
      update: {
        nama: desa.nama,
        slug: desa.id,
        kecamatan: desa.kecamatan,
        kabupaten: desa.kabupaten,
        provinsi: desa.provinsi,
        tahunData: 2024,
        jumlahPenduduk: desa.penduduk,
        kategori: desa.kategori,
        dataStatus: "demo",
      },
      create: {
        id: desa.id,
        nama: desa.nama,
        slug: desa.id,
        kecamatan: desa.kecamatan,
        kabupaten: desa.kabupaten,
        provinsi: desa.provinsi,
        tahunData: 2024,
        jumlahPenduduk: desa.penduduk,
        kategori: desa.kategori,
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

function demoSourceId(desaId) {
  return `source-demo-village-${desaId}`;
}

function demoSummaryForArjasari(desa, index) {
  const total = 820000000 + index * 25000000;
  const persen = 58 + (index % 5) * 7;
  const realisasi = Math.round(total * persen / 100);
  return {
    id: desa.id,
    total,
    realisasi,
    persen,
    status: persen >= 85 ? "baik" : persen >= 60 ? "sedang" : "rendah",
  };
}

async function seedDemoSourcesAndBudgets() {
  const arjasariSummaries = desaRecords.map(demoSummaryForArjasari);
  const summaryRecords = [
    ...demoVillageRecords,
    ...arjasariSummaries,
  ];

  for (const desa of demoVillageRecords) {
    await prisma.dataSource.upsert({
      where: { id: demoSourceId(desa.id) },
      update: {
        desaId: desa.id,
        scopeType: "desa",
        scopeName: desa.nama,
        sourceName: `${desa.nama} demo dataset`,
        sourceType: "demo",
        accessStatus: "accessible",
        dataAvailability: "budget_summary",
        dataStatus: "demo",
        notes: "Demo/mock record seeded for DB-first displayed data verification.",
      },
      create: {
        id: demoSourceId(desa.id),
        desaId: desa.id,
        scopeType: "desa",
        scopeName: desa.nama,
        sourceName: `${desa.nama} demo dataset`,
        sourceType: "demo",
        accessStatus: "accessible",
        dataAvailability: "budget_summary",
        dataStatus: "demo",
        notes: "Demo/mock record seeded for DB-first displayed data verification.",
      },
    });
  }

  for (const desa of summaryRecords) {
    const sourceId = demoVillageRecords.some((record) => record.id === desa.id) ? demoSourceId(desa.id) : null;
    await prisma.anggaranDesaSummary.upsert({
      where: { desaId_tahun: { desaId: desa.id, tahun: 2024 } },
      update: {
        totalAnggaran: BigInt(desa.total),
        totalRealisasi: BigInt(desa.realisasi),
        persentaseRealisasi: desa.persen,
        statusSerapan: desa.status,
        sourceId,
        dataStatus: "demo",
      },
      create: {
        desaId: desa.id,
        tahun: 2024,
        totalAnggaran: BigInt(desa.total),
        totalRealisasi: BigInt(desa.realisasi),
        persentaseRealisasi: desa.persen,
        statusSerapan: desa.status,
        sourceId,
        dataStatus: "demo",
      },
    });

    for (const [kode, namaBidang, weight, variation] of apbdesFields) {
      const anggaran = Math.round(desa.total * weight);
      const persentase = Math.min(100, Math.max(0, Math.round(desa.persen * variation)));
      await prisma.aPBDesItem.upsert({
        where: { id: `apbdes-demo-${desa.id}-${kode}-2024` },
        update: {
          desaId: desa.id,
          tahun: 2024,
          kodeBidang: kode,
          namaBidang,
          anggaran: BigInt(anggaran),
          realisasi: BigInt(Math.round(anggaran * persentase / 100)),
          persentase,
          sourceId,
          dataStatus: "demo",
        },
        create: {
          id: `apbdes-demo-${desa.id}-${kode}-2024`,
          desaId: desa.id,
          tahun: 2024,
          kodeBidang: kode,
          namaBidang,
          anggaran: BigInt(anggaran),
          realisasi: BigInt(Math.round(anggaran * persentase / 100)),
          persentase,
          sourceId,
          dataStatus: "demo",
        },
      });
    }
  }

  for (const desa of demoVillageRecords) {
    const docRows = [
      ["apbdes", `APBDes ${desa.tahun ?? 2024}`, 2024, "tersedia"],
      ["rkpdes", "RKP Desa 2024", 2024, "tersedia"],
      ["realisasi", "Laporan Realisasi Semester I", 2024, desa.persen >= 50 ? "tersedia" : "needs_review"],
      ["realisasi", "Laporan Realisasi Semester II", 2024, desa.persen >= 80 ? "tersedia" : "needs_review"],
      ["lppd", "LPPD 2023", 2023, desa.persen >= 60 ? "tersedia" : "needs_review"],
    ];

    for (const [jenisDokumen, namaDokumen, tahun, status] of docRows) {
      await prisma.dokumenPublik.upsert({
        where: { id: `doc-demo-${desa.id}-${jenisDokumen}-${tahun}-${namaDokumen.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
        update: {
          desaId: desa.id,
          tahun,
          namaDokumen,
          jenisDokumen,
          status,
          sourceId: demoSourceId(desa.id),
          dataStatus: "demo",
        },
        create: {
          id: `doc-demo-${desa.id}-${jenisDokumen}-${tahun}-${namaDokumen.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          desaId: desa.id,
          tahun,
          namaDokumen,
          jenisDokumen,
          status,
          sourceId: demoSourceId(desa.id),
          dataStatus: "demo",
        },
      });
    }
  }
}

function daysAgo(days) {
  return new Date(Date.now() - days * 86_400_000);
}

function userIdForName(name) {
  return `demo-user-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "anonim"}`;
}

async function seedDemoVoices() {
  const userNames = [...new Set(voiceExamples.filter((voice) => !voice.isAnon).map((voice) => voice.author))];
  for (const name of userNames) {
    await prisma.user.upsert({
      where: { email: `${userIdForName(name)}@pantaudesa.local` },
      update: { name, nama: name, role: "WARGA" },
      create: {
        id: userIdForName(name),
        email: `${userIdForName(name)}@pantaudesa.local`,
        name,
        nama: name,
        role: "WARGA",
      },
    });
  }

  await prisma.user.createMany({
    data: Array.from({ length: 180 }, (_, index) => {
      const i = index + 1;
      return {
        id: `demo-signal-${i}`,
        email: `demo-signal-${i}@pantaudesa.local`,
        name: `Demo Signal ${i}`,
        nama: `Demo Signal ${i}`,
        role: "WARGA",
      };
    }),
    skipDuplicates: true,
  });

  await prisma.voiceVote.deleteMany({ where: { voiceId: { in: voiceExamples.map((voice) => voice.id) } } });
  await prisma.voiceHelpful.deleteMany({ where: { voiceId: { in: voiceExamples.map((voice) => voice.id) } } });

  for (const voice of voiceExamples) {
    await prisma.voice.upsert({
      where: { id: voice.id },
      update: {
        desaId: voice.desaId,
        category: voice.category,
        text: `${voice.text} (contoh demo dari database)`,
        isAnon: Boolean(voice.isAnon),
        status: voice.status,
        resolvedAt: voice.status === "RESOLVED" ? daysAgo(1) : null,
        createdAt: daysAgo(voice.days),
        authorId: voice.isAnon ? null : userIdForName(voice.author),
      },
      create: {
        id: voice.id,
        desaId: voice.desaId,
        category: voice.category,
        text: `${voice.text} (contoh demo dari database)`,
        isAnon: Boolean(voice.isAnon),
        status: voice.status,
        resolvedAt: voice.status === "RESOLVED" ? daysAgo(1) : null,
        createdAt: daysAgo(voice.days),
        authorId: voice.isAnon ? null : userIdForName(voice.author),
      },
    });

    if (voice.helpful > 0) {
      await prisma.voiceHelpful.createMany({
        data: Array.from({ length: voice.helpful }, (_, index) => {
          const i = index + 1;
          return {
            id: `demo-helpful-${voice.id}-${i}`,
            voiceId: voice.id,
            userId: `demo-signal-${i}`,
            createdAt: daysAgo(Math.max(0, voice.days - 1)),
          };
        }),
        skipDuplicates: true,
      });
    }

    if (voice.benar + voice.bohong > 0) {
      await prisma.voiceVote.createMany({
        data: Array.from({ length: voice.benar + voice.bohong }, (_, index) => {
          const i = index + 1;
          return {
            id: `demo-vote-${voice.id}-${i}`,
            voiceId: voice.id,
            userId: `demo-signal-${i}`,
            type: i <= voice.benar ? "BENAR" : "BOHONG",
            createdAt: daysAgo(Math.max(0, voice.days - 1)),
          };
        }),
        skipDuplicates: true,
      });
    }
  }

  await prisma.voiceReply.upsert({
    where: { id: "demo-reply-v1-desa" },
    update: {
      voiceId: "v1",
      text: "Terima kasih apresiasinya. Ini balasan demo dari database untuk verifikasi DB-first.",
      isOfficialDesa: true,
      createdAt: daysAgo(2),
    },
    create: {
      id: "demo-reply-v1-desa",
      voiceId: "v1",
      text: "Terima kasih apresiasinya. Ini balasan demo dari database untuk verifikasi DB-first.",
      isOfficialDesa: true,
      createdAt: daysAgo(2),
    },
  });
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
  await seedDemoSourcesAndBudgets();
  await seedDemoVoices();

  console.log(`Prepared demo seed records: ${desaRecords.length + demoVillageRecords.length} desa, ${dataSources.length + demoVillageRecords.length} sources, ${documents.length + demoVillageRecords.length * 5} documents, ${demoVillageRecords.length + desaRecords.length} summaries, ${(demoVillageRecords.length + desaRecords.length) * apbdesFields.length} APBDes items, ${voiceExamples.length} voices.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

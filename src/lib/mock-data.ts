import {
  Desa, TrendData, SummaryStats,
  APBDesItem, OutputFisik, PerangkatDesa,
  RiwayatTahunan, DokumenPublik, SkorTransparansi, PendapatanDesa,
} from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const BIDANG_NAMES = [
  "Penyelenggaraan Pemerintahan Desa",
  "Pelaksanaan Pembangunan Desa",
  "Pembinaan Kemasyarakatan Desa",
  "Pemberdayaan Masyarakat Desa",
  "Penanggulangan Bencana & Darurat",
];

// Allocation weights per kategori [pemerintahan, pembangunan, pembinaan, pemberdayaan, bencana]
const WEIGHTS: Record<string, number[]> = {
  "Infrastruktur":  [0.15, 0.55, 0.10, 0.15, 0.05],
  "Kesehatan":      [0.18, 0.35, 0.25, 0.17, 0.05],
  "Pendidikan":     [0.18, 0.38, 0.20, 0.19, 0.05],
  "Pertanian":      [0.15, 0.45, 0.12, 0.23, 0.05],
  "Pariwisata":     [0.18, 0.48, 0.12, 0.17, 0.05],
  "Ekonomi":        [0.18, 0.42, 0.12, 0.22, 0.06],
  "Perikanan":      [0.18, 0.42, 0.15, 0.20, 0.05],
  "Perkebunan":     [0.15, 0.48, 0.12, 0.20, 0.05],
  "Pertambangan":   [0.20, 0.40, 0.15, 0.20, 0.05],
};

// Serapan variation per bidang: pemerintahan sedikit lebih tinggi, bencana jauh lebih rendah
const BIDANG_VARIATION = [1.03, 0.97, 1.02, 0.98, 0.55];

function mkApbdes(total: number, serapan: number, kategori: string): APBDesItem[] {
  const weights = WEIGHTS[kategori] ?? WEIGHTS["Infrastruktur"];
  return weights.map((w, i) => {
    const anggaran = Math.round(total * w);
    const persen = Math.min(100, Math.max(0, Math.round(serapan * BIDANG_VARIATION[i])));
    return {
      kode: (i + 1).toString(),
      bidang: BIDANG_NAMES[i],
      anggaran,
      realisasi: Math.round(anggaran * persen / 100),
      persentase: persen,
    };
  });
}

type OutputTemplate = { label: string; satuan: string; target: number };
const OUTPUT_TEMPLATES: Record<string, OutputTemplate[]> = {
  "Infrastruktur": [
    { label: "Jalan Desa Diperbaiki", satuan: "km", target: 3.2 },
    { label: "Drainase Dibangun", satuan: "m", target: 850 },
    { label: "Penerima BLT Dana Desa", satuan: "KK", target: 45 },
  ],
  "Kesehatan": [
    { label: "Posyandu Aktif Dibina", satuan: "unit", target: 5 },
    { label: "Ibu Hamil Terlayani", satuan: "orang", target: 120 },
    { label: "Penerima BLT Dana Desa", satuan: "KK", target: 38 },
  ],
  "Pendidikan": [
    { label: "PAUD/TK Aktif Didukung", satuan: "unit", target: 3 },
    { label: "Siswa Penerima Beasiswa", satuan: "orang", target: 65 },
    { label: "Penerima BLT Dana Desa", satuan: "KK", target: 42 },
  ],
  "Pertanian": [
    { label: "Saluran Irigasi Dibangun", satuan: "m", target: 1200 },
    { label: "Kelompok Tani Dibina", satuan: "kelompok", target: 4 },
    { label: "Penerima BLT Dana Desa", satuan: "KK", target: 40 },
  ],
  "Pariwisata": [
    { label: "Destinasi Wisata Dikembangkan", satuan: "spot", target: 2 },
    { label: "Pelaku UMKM Dilatih", satuan: "orang", target: 35 },
    { label: "Penerima BLT Dana Desa", satuan: "KK", target: 30 },
  ],
  "Ekonomi": [
    { label: "UMKM Mendapat Bantuan Modal", satuan: "unit", target: 12 },
    { label: "Warga Mengikuti Pelatihan", satuan: "orang", target: 80 },
    { label: "Penerima BLT Dana Desa", satuan: "KK", target: 35 },
  ],
  "Perikanan": [
    { label: "Tambak/Kolam Dibangun", satuan: "unit", target: 8 },
    { label: "Nelayan Terima Bantuan Alat", satuan: "orang", target: 25 },
    { label: "Penerima BLT Dana Desa", satuan: "KK", target: 28 },
  ],
  "Perkebunan": [
    { label: "Lahan Perkebunan Direhab", satuan: "ha", target: 45 },
    { label: "Petani Terima Bibit Unggul", satuan: "orang", target: 60 },
    { label: "Penerima BLT Dana Desa", satuan: "KK", target: 38 },
  ],
  "Pertambangan": [
    { label: "Area Reklamasi Dikelola", satuan: "ha", target: 12 },
    { label: "Warga Ikut Pelatihan K3", satuan: "orang", target: 45 },
    { label: "Penerima BLT Dana Desa", satuan: "KK", target: 40 },
  ],
};

function mkOutputFisik(kategori: string, serapan: number): OutputFisik[] {
  const templates = OUTPUT_TEMPLATES[kategori] ?? OUTPUT_TEMPLATES["Infrastruktur"];
  return templates.map((t) => {
    const raw = t.target * serapan / 100;
    const realisasi = Number.isInteger(t.target)
      ? Math.min(t.target, Math.round(raw))
      : Math.round(raw * 10) / 10;
    return { label: t.label, satuan: t.satuan, target: t.target, realisasi, persentase: Math.round(serapan) };
  });
}

function mkDokumen(tahun: number, serapan: number): DokumenPublik[] {
  return [
    { nama: `APBDes ${tahun}`, jenis: "Keuangan", tahun, tersedia: true },
    { nama: `LPPD ${tahun - 1}`, jenis: "Laporan", tahun: tahun - 1, tersedia: serapan >= 60 },
    { nama: `RKP Desa ${tahun}`, jenis: "Perencanaan", tahun, tersedia: true },
    { nama: `Laporan Realisasi Semester I`, jenis: "Keuangan", tahun, tersedia: serapan >= 50 },
    { nama: `Laporan Realisasi Semester II`, jenis: "Keuangan", tahun, tersedia: serapan >= 80 },
  ];
}

function mkSkor(serapan: number, ketepatan: number, kelengkapan: number, responsif: number): SkorTransparansi {
  const total = Math.round((serapan * 0.35) + (ketepatan * 0.25) + (kelengkapan * 0.25) + (responsif * 0.15));
  return { total, ketepatan, kelengkapan, responsif, konsistensi: Math.min(100, Math.round(serapan * 1.02)) };
}

function mkRiwayat(anggaran: number, serapanFinal: number, trend: number[]): RiwayatTahunan[] {
  return [2020, 2021, 2022, 2023, 2024].map((tahun, i) => {
    const yearDiff = 2024 - tahun;
    const anggaranTahun = Math.round(anggaran * Math.pow(0.92, yearDiff));
    const persen = trend[i];
    return {
      tahun,
      totalAnggaran: anggaranTahun,
      terealisasi: Math.round(anggaranTahun * persen / 100),
      persentaseSerapan: persen,
    };
  });
}

function mkPendapatan(total: number): PendapatanDesa {
  const danaDesa = Math.round(total * 0.65);
  const add = Math.round(total * 0.25);
  const pades = Math.round(total * 0.05);
  const bantuanKeuangan = total - danaDesa - add - pades;
  return { danaDesa, add, pades, bantuanKeuangan };
}

// ─── Perangkat Desa ──────────────────────────────────────────────────────────

const allPerangkat: PerangkatDesa[][] = [
  [{ jabatan: "Kepala Desa", nama: "H. Asep Supriatna, S.H.", periode: "2021–2027", kontak: "081234567890" }, { jabatan: "Sekretaris Desa", nama: "Hj. Nani Rohaeni" }, { jabatan: "Bendahara Desa", nama: "Yudi Hermawan, A.Md." }, { jabatan: "Kaur Perencanaan", nama: "Sandi Permana" }],
  [{ jabatan: "Kepala Desa", nama: "Dadang Sutisna, A.Md.", periode: "2020–2026", kontak: "082345678901" }, { jabatan: "Sekretaris Desa", nama: "Tuti Sundari" }, { jabatan: "Bendahara Desa", nama: "Ridwan Fauzi" }, { jabatan: "Kaur Perencanaan", nama: "Yeni Andriyani" }],
  [{ jabatan: "Kepala Desa", nama: "Ode Mandra", periode: "2022–2028", kontak: "083456789012" }, { jabatan: "Sekretaris Desa", nama: "Rini Wulandari" }, { jabatan: "Bendahara Desa", nama: "Tono Setiawan" }, { jabatan: "Kaur Perencanaan", nama: "Rika Novitasari" }],
  [{ jabatan: "Kepala Desa", nama: "Sutikno, B.A.", periode: "2019–2025", kontak: "087654321098" }, { jabatan: "Sekretaris Desa", nama: "Sunarti" }, { jabatan: "Bendahara Desa", nama: "Sigit Raharjo" }, { jabatan: "Kaur Perencanaan", nama: "Tutik Handayani" }],
  [{ jabatan: "Kepala Desa", nama: "Slamet Riyadi", periode: "2021–2027", kontak: "088765432109" }, { jabatan: "Sekretaris Desa", nama: "Wahyuni" }, { jabatan: "Bendahara Desa", nama: "Haryanto" }, { jabatan: "Kaur Perencanaan", nama: "Sari Dewi" }],
  [{ jabatan: "Kepala Desa", nama: "Teguh Santoso", periode: "2020–2026", kontak: "081122334455" }, { jabatan: "Sekretaris Desa", nama: "Umi Kulsum" }, { jabatan: "Bendahara Desa", nama: "Budi Prasetyo" }, { jabatan: "Kaur Perencanaan", nama: "Wulan Sari" }],
  [{ jabatan: "Kepala Desa", nama: "H. Zainal Arifin, S.E.", periode: "2021–2027", kontak: "082233445566" }, { jabatan: "Sekretaris Desa", nama: "Endang Suryati" }, { jabatan: "Bendahara Desa", nama: "Eko Wahyudi" }, { jabatan: "Kaur Perencanaan", nama: "Fitri Handayani" }],
  [{ jabatan: "Kepala Desa", nama: "Sugeng Hariyanto", periode: "2019–2025", kontak: "083344556677" }, { jabatan: "Sekretaris Desa", nama: "Mujiati" }, { jabatan: "Bendahara Desa", nama: "Agus Widodo" }, { jabatan: "Kaur Perencanaan", nama: "Lina Marlina" }],
  [{ jabatan: "Kepala Desa", nama: "Suparmin", periode: "2020–2026", kontak: "084455667788" }, { jabatan: "Sekretaris Desa", nama: "Nur Cahyati" }, { jabatan: "Bendahara Desa", nama: "Wahyu Pratama" }, { jabatan: "Kaur Perencanaan", nama: "Desi Ratnasari" }],
  [{ jabatan: "Kepala Desa", nama: "Yohanes Andi, S.P.", periode: "2021–2027", kontak: "085566778899" }, { jabatan: "Sekretaris Desa", nama: "Maria Goretti" }, { jabatan: "Bendahara Desa", nama: "Petrus Kalimantan" }, { jabatan: "Kaur Perencanaan", nama: "Anastasia Dewi" }],
  [{ jabatan: "Kepala Desa", nama: "Markus Dius", periode: "2020–2026", kontak: "086677889900" }, { jabatan: "Sekretaris Desa", nama: "Kristina Lampe" }, { jabatan: "Bendahara Desa", nama: "Yosef Kura" }, { jabatan: "Kaur Perencanaan", nama: "Theresia Nyai" }],
  [{ jabatan: "Kepala Desa", nama: "H. Ahmad Fauzi, S.Ag.", periode: "2021–2027", kontak: "087788990011" }, { jabatan: "Sekretaris Desa", nama: "Hj. Maimunah" }, { jabatan: "Bendahara Desa", nama: "Syaiful Bahri" }, { jabatan: "Kaur Perencanaan", nama: "Nurhayati" }],
  [{ jabatan: "Kepala Desa", nama: "Rohmat Efendi", periode: "2022–2028", kontak: "088899001122" }, { jabatan: "Sekretaris Desa", nama: "Sumiati" }, { jabatan: "Bendahara Desa", nama: "Dani Kurniawan" }, { jabatan: "Kaur Perencanaan", nama: "Ayu Lestari" }],
  [{ jabatan: "Kepala Desa", nama: "Tgk. Mukhlis Ibrahim", periode: "2020–2026", kontak: "081390012233" }, { jabatan: "Sekretaris Desa", nama: "Cut Nilawati" }, { jabatan: "Bendahara Desa", nama: "Zulkifli Yusuf" }, { jabatan: "Kaur Perencanaan", nama: "Mariani Putri" }],
  [{ jabatan: "Kepala Desa", nama: "Hotma Nainggolan", periode: "2021–2027", kontak: "082501234567" }, { jabatan: "Sekretaris Desa", nama: "Ria Simatupang" }, { jabatan: "Bendahara Desa", nama: "Togi Nababan" }, { jabatan: "Kaur Perencanaan", nama: "Lena Sitorus" }],
  [{ jabatan: "Kepala Desa", nama: "H. Muh. Arief, S.Sos.", periode: "2021–2027", kontak: "081234509876" }, { jabatan: "Sekretaris Desa", nama: "Hj. Hasnah Dg. Nai" }, { jabatan: "Bendahara Desa", nama: "Syarifuddin Kadir" }, { jabatan: "Kaur Perencanaan", nama: "Rahma Dewi" }],
  [{ jabatan: "Kepala Desa", nama: "H. Lalu Mukhtar", periode: "2020–2026", kontak: "087234567890" }, { jabatan: "Sekretaris Desa", nama: "Baiq Ernawati" }, { jabatan: "Bendahara Desa", nama: "Amaq Wirawan" }, { jabatan: "Kaur Perencanaan", nama: "Inaq Sumiati" }],
  [{ jabatan: "Kepala Desa", nama: "Ridwan Lamadjido", periode: "2019–2025", kontak: "081356789012" }, { jabatan: "Sekretaris Desa", nama: "Nurhafidah" }, { jabatan: "Bendahara Desa", nama: "Moh. Rifai" }, { jabatan: "Kaur Perencanaan", nama: "Rosmiati" }],
  [{ jabatan: "Kepala Desa", nama: "Elius Wenda", periode: "2021–2027", kontak: "081234000999" }, { jabatan: "Sekretaris Desa", nama: "Ones Kogoya" }, { jabatan: "Bendahara Desa", nama: "Tinus Pagawak" }, { jabatan: "Kaur Perencanaan", nama: "Yuliana Wetipo" }],
  [{ jabatan: "Kepala Desa", nama: "H. Rusli Effendi, S.H.", periode: "2021–2027", kontak: "082113456789" }, { jabatan: "Sekretaris Desa", nama: "Hj. Rusnita" }, { jabatan: "Bendahara Desa", nama: "Taufik Rahman" }, { jabatan: "Kaur Perencanaan", nama: "Sri Wahyuni" }],
];

// ─── Trend riwayat 5 tahun per desa [2020, 2021, 2022, 2023, 2024] ───────────
const allTrend: number[][] = [
  [72, 78, 84, 90, 95], // 1 Sukamaju - terus membaik
  [68, 72, 75, 78, 80], // 2 Harapan Jaya - perlahan membaik
  [65, 60, 55, 52, 48], // 3 Maju Bersama - menurun (alarm!)
  [85, 88, 91, 93, 96], // 4 Sumber Rejeki - excellent
  [82, 85, 87, 89, 90], // 5 Mekar Sari - konsisten tinggi
  [55, 60, 62, 68, 70], // 6 Karang Indah - membaik
  [88, 90, 92, 93, 95], // 7 Baru Makmur - excellent
  [70, 68, 62, 64, 65], // 8 Sumber Agung - fluktuatif
  [55, 50, 42, 38, 35], // 9 Pura Harapan - terus menurun (kritis!)
  [80, 85, 88, 91, 94], // 10 Tirta Mulya - membaik
  [58, 60, 62, 64, 65], // 11 Rimba Jaya - perlahan membaik
  [86, 88, 90, 92, 94], // 12 Talang Hijau - konsisten tinggi
  [60, 52, 45, 40, 37], // 13 Pantai Indah - menurun (alarm!)
  [85, 88, 91, 93, 95], // 14 Ingin Jaya - excellent
  [72, 74, 76, 78, 80], // 15 Dolok Sanggul - membaik stabil
  [87, 90, 92, 94, 95], // 16 Bontomarannu - excellent
  [65, 62, 58, 56, 55], // 17 Mataram Baru - menurun
  [75, 77, 79, 81, 82], // 18 Toili - stabil membaik
  [50, 48, 46, 45, 45], // 19 Wamena - stagnan rendah (kritis!)
  [80, 83, 85, 87, 89], // 20 Batulicin - membaik
];

// ─── Skor Transparansi per desa [ketepatan, kelengkapan, responsif] ───────────
const allSkor: Array<[number, number, number]> = [
  [92, 88, 80], // 1
  [78, 72, 65], // 2
  [42, 38, 35], // 3
  [95, 92, 88], // 4
  [88, 85, 80], // 5
  [65, 60, 55], // 6
  [90, 88, 82], // 7
  [62, 58, 52], // 8
  [30, 25, 20], // 9
  [91, 88, 80], // 10
  [62, 60, 50], // 11
  [92, 90, 85], // 12
  [32, 28, 22], // 13
  [93, 90, 85], // 14
  [78, 74, 68], // 15
  [92, 90, 82], // 16
  [50, 45, 38], // 17
  [80, 76, 70], // 18
  [38, 30, 25], // 19
  [86, 83, 78], // 20
];

// ─── Core desa records ────────────────────────────────────────────────────────

const desaBase = [
  { id: "1",  nama: "Desa Sukamaju",      kecamatan: "Ciawi",               kabupaten: "Bogor",            provinsi: "Jawa Barat",        totalAnggaran: 1250000000, terealisasi: 1187500000, persentaseSerapan: 95, status: "baik" as const,   tahun: 2024, penduduk: 3420, kategori: "Infrastruktur" },
  { id: "2",  nama: "Desa Harapan Jaya",  kecamatan: "Cibinong",            kabupaten: "Bogor",            provinsi: "Jawa Barat",        totalAnggaran: 980000000,  terealisasi: 784000000,  persentaseSerapan: 80, status: "sedang" as const, tahun: 2024, penduduk: 2890, kategori: "Pendidikan" },
  { id: "3",  nama: "Desa Maju Bersama",  kecamatan: "Jonggol",             kabupaten: "Bogor",            provinsi: "Jawa Barat",        totalAnggaran: 870000000,  terealisasi: 417600000,  persentaseSerapan: 48, status: "rendah" as const, tahun: 2024, penduduk: 2100, kategori: "Kesehatan" },
  { id: "4",  nama: "Desa Sumber Rejeki", kecamatan: "Mlati",               kabupaten: "Sleman",           provinsi: "D.I. Yogyakarta",   totalAnggaran: 1340000000, terealisasi: 1286400000, persentaseSerapan: 96, status: "baik" as const,   tahun: 2024, penduduk: 4100, kategori: "Infrastruktur" },
  { id: "5",  nama: "Desa Mekar Sari",    kecamatan: "Depok",               kabupaten: "Sleman",           provinsi: "D.I. Yogyakarta",   totalAnggaran: 1120000000, terealisasi: 1008000000, persentaseSerapan: 90, status: "baik" as const,   tahun: 2024, penduduk: 3750, kategori: "Pertanian" },
  { id: "6",  nama: "Desa Karang Indah",  kecamatan: "Godean",              kabupaten: "Sleman",           provinsi: "D.I. Yogyakarta",   totalAnggaran: 760000000,  terealisasi: 532000000,  persentaseSerapan: 70, status: "sedang" as const, tahun: 2024, penduduk: 1980, kategori: "Pariwisata" },
  { id: "7",  nama: "Desa Baru Makmur",   kecamatan: "Waru",                kabupaten: "Sidoarjo",         provinsi: "Jawa Timur",        totalAnggaran: 1480000000, terealisasi: 1406000000, persentaseSerapan: 95, status: "baik" as const,   tahun: 2024, penduduk: 5200, kategori: "Infrastruktur" },
  { id: "8",  nama: "Desa Sumber Agung",  kecamatan: "Gedangan",            kabupaten: "Sidoarjo",         provinsi: "Jawa Timur",        totalAnggaran: 920000000,  terealisasi: 598000000,  persentaseSerapan: 65, status: "sedang" as const, tahun: 2024, penduduk: 2640, kategori: "Ekonomi" },
  { id: "9",  nama: "Desa Pura Harapan",  kecamatan: "Taman",               kabupaten: "Sidoarjo",         provinsi: "Jawa Timur",        totalAnggaran: 1050000000, terealisasi: 367500000,  persentaseSerapan: 35, status: "rendah" as const, tahun: 2024, penduduk: 3100, kategori: "Kesehatan" },
  { id: "10", nama: "Desa Tirta Mulya",   kecamatan: "Sungai Raya",         kabupaten: "Kubu Raya",        provinsi: "Kalimantan Barat",  totalAnggaran: 890000000,  terealisasi: 836600000,  persentaseSerapan: 94, status: "baik" as const,   tahun: 2024, penduduk: 2200, kategori: "Pertanian" },
  { id: "11", nama: "Desa Rimba Jaya",    kecamatan: "Kuala Mandor B",      kabupaten: "Kubu Raya",        provinsi: "Kalimantan Barat",  totalAnggaran: 670000000,  terealisasi: 436000000,  persentaseSerapan: 65, status: "sedang" as const, tahun: 2024, penduduk: 1450, kategori: "Infrastruktur" },
  { id: "12", nama: "Desa Talang Hijau",  kecamatan: "Muara Enim",          kabupaten: "Muara Enim",       provinsi: "Sumatera Selatan",  totalAnggaran: 1100000000, terealisasi: 1034000000, persentaseSerapan: 94, status: "baik" as const,   tahun: 2024, penduduk: 3300, kategori: "Perkebunan" },
  { id: "13", nama: "Desa Pantai Indah",  kecamatan: "Mesuji",              kabupaten: "Mesuji",           provinsi: "Lampung",           totalAnggaran: 780000000,  terealisasi: 288600000,  persentaseSerapan: 37, status: "rendah" as const, tahun: 2024, penduduk: 1890, kategori: "Perikanan" },
  { id: "14", nama: "Desa Ingin Jaya",    kecamatan: "Krueng Barona Jaya",  kabupaten: "Aceh Besar",       provinsi: "Aceh",              totalAnggaran: 1200000000, terealisasi: 1140000000, persentaseSerapan: 95, status: "baik" as const,   tahun: 2024, penduduk: 4500, kategori: "Infrastruktur" },
  { id: "15", nama: "Desa Dolok Sanggul", kecamatan: "Lintongnihuta",       kabupaten: "Humbang Hasundutan", provinsi: "Sumatera Utara",  totalAnggaran: 960000000,  terealisasi: 768000000,  persentaseSerapan: 80, status: "sedang" as const, tahun: 2024, penduduk: 2780, kategori: "Pertanian" },
  { id: "16", nama: "Desa Bontomarannu", kecamatan: "Bontomarannu",         kabupaten: "Gowa",             provinsi: "Sulawesi Selatan",  totalAnggaran: 1150000000, terealisasi: 1092500000, persentaseSerapan: 95, status: "baik" as const,   tahun: 2024, penduduk: 3900, kategori: "Infrastruktur" },
  { id: "17", nama: "Desa Mataram Baru",  kecamatan: "Labuapi",             kabupaten: "Lombok Barat",     provinsi: "NTB",               totalAnggaran: 830000000,  terealisasi: 456500000,  persentaseSerapan: 55, status: "rendah" as const, tahun: 2024, penduduk: 2400, kategori: "Pariwisata" },
  { id: "18", nama: "Desa Toili",         kecamatan: "Toili",               kabupaten: "Banggai",          provinsi: "Sulawesi Tengah",   totalAnggaran: 740000000,  terealisasi: 607000000,  persentaseSerapan: 82, status: "baik" as const,   tahun: 2024, penduduk: 2050, kategori: "Pertanian" },
  { id: "19", nama: "Desa Wamena",        kecamatan: "Wamena",              kabupaten: "Jayawijaya",       provinsi: "Papua Pegunungan",  totalAnggaran: 2100000000, terealisasi: 945000000,  persentaseSerapan: 45, status: "rendah" as const, tahun: 2024, penduduk: 1200, kategori: "Infrastruktur" },
  { id: "20", nama: "Desa Batulicin",     kecamatan: "Kusan Hilir",         kabupaten: "Tanah Bumbu",      provinsi: "Kalimantan Selatan", totalAnggaran: 990000000, terealisasi: 881100000,  persentaseSerapan: 89, status: "baik" as const,   tahun: 2024, penduduk: 3100, kategori: "Pertambangan" },
];

export const mockDesa: Desa[] = desaBase.map((d, i) => {
  const [ketepatan, kelengkapan, responsif] = allSkor[i];
  return {
    ...d,
    apbdes: mkApbdes(d.totalAnggaran, d.persentaseSerapan, d.kategori),
    outputFisik: mkOutputFisik(d.kategori, d.persentaseSerapan),
    perangkat: allPerangkat[i],
    riwayat: mkRiwayat(d.totalAnggaran, d.persentaseSerapan, allTrend[i]),
    dokumen: mkDokumen(d.tahun, d.persentaseSerapan),
    skorTransparansi: mkSkor(d.persentaseSerapan, ketepatan, kelengkapan, responsif),
    pendapatan: mkPendapatan(d.totalAnggaran),
  };
});

// ─── Trend nasional bulanan ───────────────────────────────────────────────────

export const mockTrendData: TrendData[] = [
  { bulan: "Jan", anggaran: 12500000000, realisasi: 3125000000 },
  { bulan: "Feb", anggaran: 12500000000, realisasi: 5000000000 },
  { bulan: "Mar", anggaran: 12500000000, realisasi: 7500000000 },
  { bulan: "Apr", anggaran: 12500000000, realisasi: 9375000000 },
  { bulan: "Mei", anggaran: 12500000000, realisasi: 10625000000 },
  { bulan: "Jun", anggaran: 12500000000, realisasi: 11250000000 },
  { bulan: "Jul", anggaran: 12500000000, realisasi: 11875000000 },
  { bulan: "Agu", anggaran: 12500000000, realisasi: 12187500000 },
  { bulan: "Sep", anggaran: 12500000000, realisasi: 12343750000 },
  { bulan: "Okt", anggaran: 12500000000, realisasi: 12406250000 },
  { bulan: "Nov", anggaran: 12500000000, realisasi: 12437500000 },
  { bulan: "Des", anggaran: 12500000000, realisasi: 12500000000 },
];

// ─── Summary stats ────────────────────────────────────────────────────────────

const rataRataSkor = Math.round(
  mockDesa.reduce((acc, d) => acc + (d.skorTransparansi?.total ?? 0), 0) / mockDesa.length
);

export const mockSummaryStats: SummaryStats = {
  totalAnggaranNasional: mockDesa.reduce((acc, d) => acc + d.totalAnggaran, 0),
  totalDesa: mockDesa.length,
  rataRataSerapan: Math.round(mockDesa.reduce((acc, d) => acc + d.persentaseSerapan, 0) / mockDesa.length),
  desaSerapanBaik: mockDesa.filter((d) => d.status === "baik").length,
  desaSerapanSedang: mockDesa.filter((d) => d.status === "sedang").length,
  desaSerapanRendah: mockDesa.filter((d) => d.status === "rendah").length,
  totalTerealisasi: mockDesa.reduce((acc, d) => acc + d.terealisasi, 0),
  rataRataSkorTransparansi: rataRataSkor,
};

export const provinsiList = [...new Set(mockDesa.map((d) => d.provinsi))].sort();
export const kategoriList = [...new Set(mockDesa.map((d) => d.kategori))].sort();

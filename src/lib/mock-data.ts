import { Desa, TrendData, SummaryStats } from "./types";

export const mockDesa: Desa[] = [
  { id: "1", nama: "Desa Sukamaju", kecamatan: "Ciawi", kabupaten: "Bogor", provinsi: "Jawa Barat", totalAnggaran: 1250000000, terealisasi: 1187500000, persentaseSerapan: 95, status: "baik", tahun: 2024, penduduk: 3420, kategori: "Infrastruktur" },
  { id: "2", nama: "Desa Harapan Jaya", kecamatan: "Cibinong", kabupaten: "Bogor", provinsi: "Jawa Barat", totalAnggaran: 980000000, terealisasi: 784000000, persentaseSerapan: 80, status: "sedang", tahun: 2024, penduduk: 2890, kategori: "Pendidikan" },
  { id: "3", nama: "Desa Maju Bersama", kecamatan: "Jonggol", kabupaten: "Bogor", provinsi: "Jawa Barat", totalAnggaran: 870000000, terealisasi: 417600000, persentaseSerapan: 48, status: "rendah", tahun: 2024, penduduk: 2100, kategori: "Kesehatan" },
  { id: "4", nama: "Desa Sumber Rejeki", kecamatan: "Mlati", kabupaten: "Sleman", provinsi: "D.I. Yogyakarta", totalAnggaran: 1340000000, terealisasi: 1286400000, persentaseSerapan: 96, status: "baik", tahun: 2024, penduduk: 4100, kategori: "Infrastruktur" },
  { id: "5", nama: "Desa Mekar Sari", kecamatan: "Depok", kabupaten: "Sleman", provinsi: "D.I. Yogyakarta", totalAnggaran: 1120000000, terealisasi: 1008000000, persentaseSerapan: 90, status: "baik", tahun: 2024, penduduk: 3750, kategori: "Pertanian" },
  { id: "6", nama: "Desa Karang Indah", kecamatan: "Godean", kabupaten: "Sleman", provinsi: "D.I. Yogyakarta", totalAnggaran: 760000000, terealisasi: 532000000, persentaseSerapan: 70, status: "sedang", tahun: 2024, penduduk: 1980, kategori: "Pariwisata" },
  { id: "7", nama: "Desa Baru Makmur", kecamatan: "Waru", kabupaten: "Sidoarjo", provinsi: "Jawa Timur", totalAnggaran: 1480000000, terealisasi: 1406000000, persentaseSerapan: 95, status: "baik", tahun: 2024, penduduk: 5200, kategori: "Infrastruktur" },
  { id: "8", nama: "Desa Sumber Agung", kecamatan: "Gedangan", kabupaten: "Sidoarjo", provinsi: "Jawa Timur", totalAnggaran: 920000000, terealisasi: 598000000, persentaseSerapan: 65, status: "sedang", tahun: 2024, penduduk: 2640, kategori: "Ekonomi" },
  { id: "9", nama: "Desa Pura Harapan", kecamatan: "Taman", kabupaten: "Sidoarjo", provinsi: "Jawa Timur", totalAnggaran: 1050000000, terealisasi: 367500000, persentaseSerapan: 35, status: "rendah", tahun: 2024, penduduk: 3100, kategori: "Kesehatan" },
  { id: "10", nama: "Desa Tirta Mulya", kecamatan: "Sungai Raya", kabupaten: "Kubu Raya", provinsi: "Kalimantan Barat", totalAnggaran: 890000000, terealisasi: 836600000, persentaseSerapan: 94, status: "baik", tahun: 2024, penduduk: 2200, kategori: "Pertanian" },
  { id: "11", nama: "Desa Rimba Jaya", kecamatan: "Kuala Mandor B", kabupaten: "Kubu Raya", provinsi: "Kalimantan Barat", totalAnggaran: 670000000, terealisasi: 436000000, persentaseSerapan: 65, status: "sedang", tahun: 2024, penduduk: 1450, kategori: "Infrastruktur" },
  { id: "12", nama: "Desa Talang Hijau", kecamatan: "Muara Enim", kabupaten: "Muara Enim", provinsi: "Sumatera Selatan", totalAnggaran: 1100000000, terealisasi: 1034000000, persentaseSerapan: 94, status: "baik", tahun: 2024, penduduk: 3300, kategori: "Perkebunan" },
  { id: "13", nama: "Desa Pantai Indah", kecamatan: "Mesuji", kabupaten: "Mesuji", provinsi: "Lampung", totalAnggaran: 780000000, terealisasi: 288600000, persentaseSerapan: 37, status: "rendah", tahun: 2024, penduduk: 1890, kategori: "Perikanan" },
  { id: "14", nama: "Desa Ingin Jaya", kecamatan: "Krueng Barona Jaya", kabupaten: "Aceh Besar", provinsi: "Aceh", totalAnggaran: 1200000000, terealisasi: 1140000000, persentaseSerapan: 95, status: "baik", tahun: 2024, penduduk: 4500, kategori: "Infrastruktur" },
  { id: "15", nama: "Desa Dolok Sanggul", kecamatan: "Lintongnihuta", kabupaten: "Humbang Hasundutan", provinsi: "Sumatera Utara", totalAnggaran: 960000000, terealisasi: 768000000, persentaseSerapan: 80, status: "sedang", tahun: 2024, penduduk: 2780, kategori: "Pertanian" },
  { id: "16", nama: "Desa Bontomarannu", kecamatan: "Bontomarannu", kabupaten: "Gowa", provinsi: "Sulawesi Selatan", totalAnggaran: 1150000000, terealisasi: 1092500000, persentaseSerapan: 95, status: "baik", tahun: 2024, penduduk: 3900, kategori: "Infrastruktur" },
  { id: "17", nama: "Desa Mataram Baru", kecamatan: "Labuapi", kabupaten: "Lombok Barat", provinsi: "NTB", totalAnggaran: 830000000, terealisasi: 456500000, persentaseSerapan: 55, status: "rendah", tahun: 2024, penduduk: 2400, kategori: "Pariwisata" },
  { id: "18", nama: "Desa Toili", kecamatan: "Toili", kabupaten: "Banggai", provinsi: "Sulawesi Tengah", totalAnggaran: 740000000, terealisasi: 607000000, persentaseSerapan: 82, status: "baik", tahun: 2024, penduduk: 2050, kategori: "Pertanian" },
  { id: "19", nama: "Desa Wamena", kecamatan: "Wamena", kabupaten: "Jayawijaya", provinsi: "Papua Pegunungan", totalAnggaran: 2100000000, terealisasi: 945000000, persentaseSerapan: 45, status: "rendah", tahun: 2024, penduduk: 1200, kategori: "Infrastruktur" },
  { id: "20", nama: "Desa Batulicin", kecamatan: "Kusan Hilir", kabupaten: "Tanah Bumbu", provinsi: "Kalimantan Selatan", totalAnggaran: 990000000, terealisasi: 881100000, persentaseSerapan: 89, status: "baik", tahun: 2024, penduduk: 3100, kategori: "Pertambangan" },
];

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

export const mockSummaryStats: SummaryStats = {
  totalAnggaranNasional: mockDesa.reduce((acc, d) => acc + d.totalAnggaran, 0),
  totalDesa: mockDesa.length,
  rataRataSerapan: Math.round(mockDesa.reduce((acc, d) => acc + d.persentaseSerapan, 0) / mockDesa.length),
  desaSerapanBaik: mockDesa.filter(d => d.status === "baik").length,
  desaSerapanSedang: mockDesa.filter(d => d.status === "sedang").length,
  desaSerapanRendah: mockDesa.filter(d => d.status === "rendah").length,
  totalTerealisasi: mockDesa.reduce((acc, d) => acc + d.terealisasi, 0),
};

export const provinsiList = [...new Set(mockDesa.map(d => d.provinsi))].sort();
export const kategoriList = [...new Set(mockDesa.map(d => d.kategori))].sort();

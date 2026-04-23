export interface Desa {
  id: string;
  nama: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  totalAnggaran: number;
  terealisasi: number;
  persentaseSerapan: number;
  status: "baik" | "sedang" | "rendah";
  tahun: number;
  penduduk: number;
  kategori: string;
}

export interface TrendData {
  bulan: string;
  anggaran: number;
  realisasi: number;
}

export interface SummaryStats {
  totalAnggaranNasional: number;
  totalDesa: number;
  rataRataSerapan: number;
  desaSerapanBaik: number;
  desaSerapanSedang: number;
  desaSerapanRendah: number;
  totalTerealisasi: number;
}

export type StatusSerapan = "semua" | "baik" | "sedang" | "rendah";
export type SortField = "nama" | "totalAnggaran" | "persentaseSerapan" | "terealisasi";
export type SortOrder = "asc" | "desc";

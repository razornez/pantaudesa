export interface APBDesItem {
  kode: string;
  bidang: string;
  anggaran: number;
  realisasi: number;
  persentase: number;
}

export interface OutputFisik {
  label: string;
  satuan: string;
  target: number;
  realisasi: number;
  persentase: number;
}

export interface PerangkatDesa {
  jabatan: string;
  nama: string;
  periode?: string;
  kontak?: string;
}

export interface RiwayatTahunan {
  tahun: number;
  totalAnggaran: number;
  terealisasi: number;
  persentaseSerapan: number;
}

export interface DokumenPublik {
  nama: string;
  jenis: string;
  tahun: number;
  tersedia: boolean;
}

export interface SkorTransparansi {
  total: number;
  ketepatan: number;
  kelengkapan: number;
  responsif: number;
  konsistensi: number;
}

export interface PendapatanDesa {
  danaDesa: number;
  add: number;
  pades: number;
  bantuanKeuangan: number;
}

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
  apbdes?: APBDesItem[];
  outputFisik?: OutputFisik[];
  perangkat?: PerangkatDesa[];
  riwayat?: RiwayatTahunan[];
  dokumen?: DokumenPublik[];
  skorTransparansi?: SkorTransparansi;
  pendapatan?: PendapatanDesa;
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
  rataRataSkorTransparansi: number;
}

export type StatusSerapan = "semua" | "baik" | "sedang" | "rendah";
export type SortField = "nama" | "totalAnggaran" | "persentaseSerapan" | "terealisasi";
export type SortOrder = "asc" | "desc";

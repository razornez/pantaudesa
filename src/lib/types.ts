// ─── Profil Desa (data non-anggaran) ─────────────────────────────────────────

export interface AsetDesa {
  nama:      string;
  jenis:     "tanah" | "bangunan" | "kendaraan" | "peralatan" | "infrastruktur" | "lainnya";
  nilai:     number;      // estimasi nilai (Rp)
  tahunBeli: number;
  kondisi:   "baik" | "sedang" | "rusak";
  lokasi:    string;      // nama lokasi/desa/dusun
}

export interface FasilitasDesa {
  nama:    string;
  jenis:   "pendidikan" | "kesehatan" | "olahraga" | "ibadah" | "umum" | "ekonomi";
  jumlah:  number;
  kondisi: "baik" | "sedang" | "rusak";
  ket?:    string;
}

export interface BumdesInfo {
  nama:         string;
  bidangUsaha:  string;
  tahunBerdiri: number;
  modal:        number;     // modal awal (Rp)
  omsetPerTahun?: number;
  status:       "aktif" | "tidak_aktif" | "dalam_pembentukan";
  deskripsi:    string;
}

export type LembagaJenis =
  | "pemerintahan"   // BPD, LPMD
  | "keamanan"       // Linmas, Babinsa
  | "pemberdayaan"   // PKK, Karang Taruna, Posyandu
  | "keagamaan"      // MUI, FKUB
  | "ekonomi"        // Koperasi, Kelompok Tani
  | "kesehatan"      // Posyandu, Polindes
  | "pendidikan";    // PAUD, Komite Sekolah

export interface LembagaDesa {
  nama:         string;
  jenis:        LembagaJenis;
  ketua:        string;
  anggota:      number;
  tahunBerdiri: number;
  aktif:        boolean;
  deskripsi:    string;
  program?:     string;    // program unggulan / kegiatan rutin
}

export interface HistoryBelanja {
  tahun:      number;
  semester:   1 | 2;
  kode:       string;
  uraian:     string;
  anggaran:   number;
  realisasi:  number;
  penyedia?:  string;   // nama vendor/kontraktor
}

// Level badge 1–5 (1 = terburuk, 5 = terbaik)
export type BadgeLevel = 1 | 2 | 3 | 4 | 5;

export interface DesaBadge {
  level:     BadgeLevel;
  label:     string;
  deskripsi: string;
  warna:     string;   // Tailwind color class
  icon:      string;   // emoji
}

export interface ProfilDesa {
  website?:        string;
  email?:          string;
  telepon?:        string;
  luasWilayah:     number;   // km²
  luasSawah?:      number;   // ha
  luasHutan?:      number;   // ha
  jumlahDusun:     number;
  jumlahRt:        number;
  jumlahRw:        number;
  jumlahKk:        number;
  mataPencaharian: string;
  potensiUnggulan: string;
  terakhirDiperbarui: Date;
  aset:            AsetDesa[];
  fasilitas:       FasilitasDesa[];
  lembaga:         LembagaDesa[];
  bumdes?:         BumdesInfo;
  historyBelanja:  HistoryBelanja[];
  badge:           DesaBadge;
}

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
  profil?: ProfilDesa;
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

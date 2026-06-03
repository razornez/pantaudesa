/**
 * ⚠️ SANDBOX DEMO DATA — THROWAWAY ⚠️
 *
 * Hardcoded DEMO values for the `/desa/batukarut` UI-design sandbox.
 * These feed the NEW BMAD-T-001 components (Dana Desa, IDM, Fasilitas Podes,
 * Peta, Komparasi Peer, Disiplin Publikasi) that don't have real adapters yet.
 *
 * ❗ MUST BE REPLACED with real adapter/template-driven data when the
 *    T-001-v2 ingestion pipeline lands. See memory: project-batukarut-demo-data-swap.
 *
 * Everything here is flagged `(mock)` in the UI. Only applied to SHOWCASE_SLUGS.
 */

export const SHOWCASE_SLUGS = new Set(["batukarut"]);

export function isShowcaseSlug(slug: string): boolean {
  return SHOWCASE_SLUGS.has(slug);
}

export interface DanaDesaDemo {
  tahun: number;
  pagu: number;
  realisasiTahap1: number;
  realisasiTahap2: number;
  realisasiTahap3: number;
  tahapCair: number;
  riwayat: { tahun: number; pagu: number; realisasi: number }[];
}

export interface IdmDemo {
  status: "SANGAT_TERTINGGAL" | "TERTINGGAL" | "BERKEMBANG" | "MAJU" | "MANDIRI";
  skor: number; // 0–1
  tahun: number;
  ike: number;
  iks: number;
  ikl: number;
}

export interface FasilitasPodesDemo {
  pendidikan: { label: string; jumlah: number }[];
  kesehatan: { label: string; jumlah: number }[];
  ibadah: { label: string; jumlah: number }[];
  ekonomi: { label: string; jumlah: number }[];
  aksesAirBersih: string;
  aksesListrikPct: number;
}

export interface KomposisiBenchmarkDemo {
  kategoriDesa: string;
  bidang: { label: string; pct: number }[];
}

export interface DisiplinPublikasiDemo {
  jenis: string;
  tahun: number;
  tersedia: boolean;
}

export interface PeerDemo {
  kecamatan: string;
  totalDesa: number;
  rankSerapan: number;
  rankIdm: number;
  rankDisiplin: number;
}

export interface GeoDemo {
  lat: number;
  lng: number;
  topografi: string;
  poi: { label: string; jenis: "pendidikan" | "kesehatan" | "ibadah" | "kantor"; lat: number; lng: number }[];
}

export interface LembagaDemo {
  nama: string;
  jenis: string;
  aktif: boolean;
  anggota: number;
}

export interface BumdesDemo {
  nama: string;
  bidangUsaha: string;
  status: "aktif" | "tidak_aktif" | "dalam_pembentukan";
  tahunBerdiri: number;
}

export interface ShowcaseDemo {
  danaDesa: DanaDesaDemo;
  idm: IdmDemo;
  fasilitas: FasilitasPodesDemo;
  komposisi: KomposisiBenchmarkDemo;
  disiplin: DisiplinPublikasiDemo[];
  peer: PeerDemo;
  geo: GeoDemo;
  kades: { nama: string; periode: string; alamatKantor: string; jamPelayanan: string; telepon: string };
  lembaga: LembagaDemo[];
  bumdes: BumdesDemo | null;
}

// ─── Batukarut DEMO (mock) ──────────────────────────────────────────────────
const BATUKARUT_DEMO: ShowcaseDemo = {
  danaDesa: {
    tahun: 2024,
    pagu: 1_120_000_000,
    realisasiTahap1: 448_000_000,
    realisasiTahap2: 448_000_000,
    realisasiTahap3: 0,
    tahapCair: 2,
    riwayat: [
      { tahun: 2020, pagu: 960_000_000, realisasi: 912_000_000 },
      { tahun: 2021, pagu: 1_010_000_000, realisasi: 989_000_000 },
      { tahun: 2022, pagu: 1_050_000_000, realisasi: 1_018_000_000 },
      { tahun: 2023, pagu: 1_090_000_000, realisasi: 1_071_000_000 },
      { tahun: 2024, pagu: 1_120_000_000, realisasi: 896_000_000 },
    ],
  },
  idm: { status: "MAJU", skor: 0.74, tahun: 2024, ike: 0.71, iks: 0.79, ikl: 0.72 },
  fasilitas: {
    pendidikan: [
      { label: "TK / PAUD", jumlah: 3 },
      { label: "SD / MI", jumlah: 4 },
      { label: "SMP / MTs", jumlah: 1 },
      { label: "SMA / SMK", jumlah: 0 },
    ],
    kesehatan: [
      { label: "Puskesmas Pembantu", jumlah: 1 },
      { label: "Polindes", jumlah: 1 },
      { label: "Posyandu", jumlah: 5 },
      { label: "Bidan praktik", jumlah: 2 },
    ],
    ibadah: [
      { label: "Masjid", jumlah: 6 },
      { label: "Musala", jumlah: 9 },
      { label: "Gereja", jumlah: 0 },
    ],
    ekonomi: [
      { label: "Pasar", jumlah: 1 },
      { label: "Koperasi", jumlah: 2 },
      { label: "Bank / unit simpan pinjam", jumlah: 1 },
    ],
    aksesAirBersih: "Mayoritas sumur & mata air",
    aksesListrikPct: 98,
  },
  komposisi: {
    kategoriDesa: "MAJU",
    bidang: [
      { label: "Penyelenggaraan Pemerintahan", pct: 25 },
      { label: "Pembangunan Fisik", pct: 42 },
      { label: "Pembinaan Masyarakat", pct: 12 },
      { label: "Pemberdayaan", pct: 18 },
      { label: "Bencana & Darurat", pct: 3 },
    ],
  },
  disiplin: [
    { jenis: "APBDes", tahun: 2024, tersedia: true },
    { jenis: "APBDes", tahun: 2023, tersedia: true },
    { jenis: "APBDes", tahun: 2022, tersedia: false },
    { jenis: "Realisasi", tahun: 2024, tersedia: false },
    { jenis: "Realisasi", tahun: 2023, tersedia: true },
    { jenis: "Realisasi", tahun: 2022, tersedia: false },
    { jenis: "LPPDes", tahun: 2024, tersedia: false },
    { jenis: "LPPDes", tahun: 2023, tersedia: false },
    { jenis: "LPPDes", tahun: 2022, tersedia: false },
  ],
  peer: { kecamatan: "Arjasari", totalDesa: 11, rankSerapan: 4, rankIdm: 3, rankDisiplin: 6 },
  geo: {
    lat: -7.0589,
    lng: 107.6131,
    topografi: "Perbukitan",
    poi: [
      { label: "Kantor Desa Batukarut", jenis: "kantor", lat: -7.0589, lng: 107.6131 },
      { label: "SD Negeri Batukarut", jenis: "pendidikan", lat: -7.0571, lng: 107.6155 },
      { label: "Puskesmas Pembantu", jenis: "kesehatan", lat: -7.0601, lng: 107.6098 },
      { label: "Masjid Jami Al-Hidayah", jenis: "ibadah", lat: -7.0578, lng: 107.6112 },
    ],
  },
  kades: {
    nama: "H. Dedi Supriadi",
    periode: "2021–2027",
    alamatKantor: "Jl. Raya Batukarut No. 12, Arjasari, Kab. Bandung",
    jamPelayanan: "Senin–Jumat, 08.00–15.00",
    telepon: "022-87991234",
  },
  lembaga: [
    { nama: "BPD (Badan Permusyawaratan Desa)", jenis: "Pemerintahan", aktif: true, anggota: 9 },
    { nama: "LPM (Lembaga Pemberdayaan Masyarakat)", jenis: "Pemberdayaan", aktif: true, anggota: 15 },
    { nama: "PKK", jenis: "Pemberdayaan", aktif: true, anggota: 40 },
    { nama: "Karang Taruna", jenis: "Pemuda", aktif: true, anggota: 28 },
    { nama: "LINMAS", jenis: "Keamanan", aktif: false, anggota: 12 },
  ],
  bumdes: {
    nama: "BUMDes Karya Karut Mandiri",
    bidangUsaha: "Simpan pinjam, pengelolaan air, & wisata desa",
    status: "aktif",
    tahunBerdiri: 2019,
  },
};

const DEMO_BY_SLUG: Record<string, ShowcaseDemo> = {
  batukarut: BATUKARUT_DEMO,
};

export function getShowcaseDemo(slug: string): ShowcaseDemo | null {
  return DEMO_BY_SLUG[slug] ?? null;
}

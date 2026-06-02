/**
 * Komposisi belanja APBDes tipikal — REFERENSI NASIONAL (config, bukan tabel).
 *
 * Dipakai Bab "Dipakai untuk apa" sebagai rujukan membaca ketika rincian APBDes
 * aktual per desa belum tersedia (mostly empty — lihat keputusan B di T-001-v2).
 * Angka = rata-rata alokasi 5 bidang belanja desa per kategori IDM.
 *
 * Sumber metodologi: agregasi dataset DJPK / rata-rata nasional.
 * ⚠️ Angka awal masih perlu validasi Iwan + dokumentasi di /metodologi.
 */

export type IdmKategori = "SANGAT_TERTINGGAL" | "TERTINGGAL" | "BERKEMBANG" | "MAJU" | "MANDIRI";

export interface KomposisiBidang {
  label: string;
  pct: number;
}

export interface KomposisiBenchmark {
  kategori: IdmKategori;
  bidang: KomposisiBidang[];
  catatan: string;
}

const BIDANG_LABELS = [
  "Penyelenggaraan Pemerintahan",
  "Pembangunan Fisik",
  "Pembinaan Masyarakat",
  "Pemberdayaan",
  "Bencana & Darurat",
] as const;

function bidang(pcts: [number, number, number, number, number]): KomposisiBidang[] {
  return BIDANG_LABELS.map((label, i) => ({ label, pct: pcts[i] }));
}

export const KOMPOSISI_BENCHMARK: Record<IdmKategori, KomposisiBenchmark> = {
  SANGAT_TERTINGGAL: { kategori: "SANGAT_TERTINGGAL", bidang: bidang([22, 50, 9, 16, 3]), catatan: "Dominan pembangunan dasar (jalan, air, sanitasi)." },
  TERTINGGAL: { kategori: "TERTINGGAL", bidang: bidang([23, 47, 10, 17, 3]), catatan: "Masih fokus pembangunan fisik." },
  BERKEMBANG: { kategori: "BERKEMBANG", bidang: bidang([24, 44, 11, 18, 3]), catatan: "Mulai seimbang antara fisik dan pemberdayaan." },
  MAJU: { kategori: "MAJU", bidang: bidang([25, 42, 12, 18, 3]), catatan: "Pembangunan tetap besar, pemberdayaan naik." },
  MANDIRI: { kategori: "MANDIRI", bidang: bidang([27, 38, 13, 19, 3]), catatan: "Porsi pemberdayaan & pembinaan relatif lebih tinggi." },
};

export function getKomposisiBenchmark(kategori: IdmKategori): KomposisiBenchmark {
  return KOMPOSISI_BENCHMARK[kategori] ?? KOMPOSISI_BENCHMARK.BERKEMBANG;
}

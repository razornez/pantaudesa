/**
 * assets.ts — registry terpusat untuk semua aset gambar PantauDesa.
 *
 * Untuk mengganti gambar, cukup ubah path di sini — tidak perlu menyentuh komponen.
 * Semua path relatif terhadap folder /public.
 */

export const ASSETS = {
  /** Logo bulat indigo — dipakai di Navbar */
  logo: "/images/logo.webp",

  /** Pattern background hero — ikon-ikon kecil desa di atas biru gelap */
  bgPattern: "/images/bg-pattern.webp",

  /** Pak Waspada dengan peta Indonesia + kaca pembesar — hero homepage */
  hero: "/images/hero.webp",

  /** Pak Waspada berdiri, memegang tablet grafik */
  mascotStanding: "/images/mascot-standing.webp",

  /** Pak Waspada bingung + clipboard — empty state ketika tidak ada hasil */
  mascotEmpty: "/images/mascot-empty.webp",

  /** Tiga warga Indonesia melihat dashboard — CTA section */
  illustrationCitizen: "/images/illustration-citizen.webp",

  /** Desa bermasalah: jalan berlubang, posyandu mangkrak — alert section */
  illustrationAlert: "/images/illustration-alert.webp",

  /** Folder terbuka + dokumen APBDes/LPPD/RKP — seksi dokumen publik */
  illustrationDocs: "/images/illustration-docs.webp",
} as const;

export type AssetKey = keyof typeof ASSETS;

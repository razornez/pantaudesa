import { prisma } from "@/lib/prisma";
import type { Desa, SummaryStats, TrendData } from "@/lib/types";

export type DesaDataOrigin = "database";
export type DesaReadState = "ready" | "empty" | "unavailable";

export type DesaListItem = Desa & {
  dataOrigin: DesaDataOrigin;
  identityStatus: "demo" | "source-found" | "needs-review";
  budgetStatus: "demo";
  sourceSummary: string;
};

export interface DesaListReadResult {
  items: DesaListItem[];
  state: DesaReadState;
  message: string;
  dbHostAlias: string;
}

const DOCUMENT_KIND: Record<string, string> = {
  apbdes: "Keuangan",
  realisasi: "Laporan",
  rkpdes: "Perencanaan",
  lppd: "Laporan",
  aset: "Aset",
  other: "Dokumen",
};

function getDbHostAlias() {
  const url = process.env.DATABASE_URL;
  if (!url) return "missing";

  try {
    return new URL(url).hostname;
  } catch {
    return "invalid-url";
  }
}

function toNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
}

function normalizeStatus(value: string | null | undefined, percent: number): Desa["status"] {
  if (value === "baik" || value === "sedang" || value === "rendah") return value;
  if (percent >= 85) return "baik";
  if (percent >= 60) return "sedang";
  return "rendah";
}

function makeSkorTransparansi(percent: number, documentCount: number, sourceCount: number) {
  const kelengkapan = Math.min(100, 40 + documentCount * 10);
  const ketepatan = Math.min(100, 50 + sourceCount * 12);
  const responsif = Math.min(100, 45 + sourceCount * 8);
  const konsistensi = Math.min(100, Math.max(35, percent));
  const total = Math.round((percent * 0.35) + (ketepatan * 0.25) + (kelengkapan * 0.25) + (responsif * 0.15));

  return { total, ketepatan, kelengkapan, responsif, konsistensi };
}

function makePendapatan(total: number) {
  const danaDesa = Math.round(total * 0.65);
  const add = Math.round(total * 0.25);
  const pades = Math.round(total * 0.05);
  const bantuanKeuangan = Math.max(0, total - danaDesa - add - pades);

  return { danaDesa, add, pades, bantuanKeuangan };
}

function mapDesaRecord(record: Awaited<ReturnType<typeof fetchDesaRecords>>[number]): DesaListItem {
  const latestSummary = [...record.anggaranSummaries].sort((a, b) => b.tahun - a.tahun)[0];
  const tahun = latestSummary?.tahun ?? record.tahunData ?? 2024;
  const totalAnggaran = toNumber(latestSummary?.totalAnggaran);
  const terealisasi = toNumber(latestSummary?.totalRealisasi);
  const percent = Math.round(toNumber(latestSummary?.persentaseRealisasi));
  const status = normalizeStatus(latestSummary?.statusSerapan, percent);
  const apbdes = record.apbdesItems
    .filter((item) => item.tahun === tahun)
    .sort((a, b) => (a.kodeBidang ?? "").localeCompare(b.kodeBidang ?? ""))
    .map((item) => ({
      kode: item.kodeBidang ?? "-",
      bidang: item.namaBidang,
      anggaran: toNumber(item.anggaran),
      realisasi: toNumber(item.realisasi),
      persentase: Math.round(toNumber(item.persentase)),
    }));
  const dokumen = record.dokumenPublik
    .sort((a, b) => (b.tahun ?? 0) - (a.tahun ?? 0) || a.namaDokumen.localeCompare(b.namaDokumen))
    .map((doc) => ({
      nama: doc.namaDokumen,
      jenis: DOCUMENT_KIND[doc.jenisDokumen] ?? "Dokumen",
      tahun: doc.tahun ?? tahun,
      tersedia: doc.status === "tersedia" || doc.status === "needs_review",
    }));
  const hasNeedsReviewSource = record.dataSources.some(
    (source) => source.dataStatus === "needs_review" || source.accessStatus === "requires_review"
  );
  const hasSource = record.dataSources.length > 0 || Boolean(record.websiteUrl);
  const identityStatus = hasNeedsReviewSource ? "needs-review" : hasSource ? "source-found" : "demo";

  return {
    id: record.slug || record.id,
    nama: record.nama,
    kecamatan: record.kecamatan,
    kabupaten: record.kabupaten,
    provinsi: record.provinsi,
    totalAnggaran,
    terealisasi,
    persentaseSerapan: percent,
    status,
    tahun,
    penduduk: record.jumlahPenduduk ?? 0,
    kategori: record.kategori ?? "Demo",
    apbdes,
    dokumen,
    skorTransparansi: makeSkorTransparansi(percent, dokumen.length, record.dataSources.length),
    pendapatan: makePendapatan(totalAnggaran),
    dataOrigin: "database",
    identityStatus,
    budgetStatus: "demo",
    sourceSummary: hasSource
      ? "Nama, lokasi, sumber, dan angka demo dibaca dari database. Angka anggaran tetap bertanda mock."
      : "Record desa dan angka demo dibaca dari database. Sumber publik belum tersedia.",
  };
}

async function fetchDesaRecords() {
  if (!prisma) return [];

  return prisma.desa.findMany({
    orderBy: [{ provinsi: "asc" }, { kabupaten: "asc" }, { nama: "asc" }],
    include: {
      dataSources: {
        select: { dataStatus: true, accessStatus: true },
      },
      anggaranSummaries: true,
      apbdesItems: true,
      dokumenPublik: true,
    },
  });
}

export async function getDesaListResult(): Promise<DesaListReadResult> {
  const dbHostAlias = getDbHostAlias();

  if (!prisma) {
    return {
      items: [],
      state: "unavailable",
      message: "DATABASE_URL belum tersedia atau tidak valid. Data hardcoded tidak digunakan sebagai fallback.",
      dbHostAlias,
    };
  }

  try {
    const records = await fetchDesaRecords();
    if (records.length === 0) {
      return {
        items: [],
        state: "empty",
        message: "Database terbaca, tetapi belum ada desa yang bisa ditampilkan.",
        dbHostAlias,
      };
    }

    return {
      items: records.map(mapDesaRecord),
      state: "ready",
      message: `${records.length} desa dibaca dari database. Angka demo ditandai sebagai mock.`,
      dbHostAlias,
    };
  } catch (error) {
    console.error("[desa-read] DB query failed without hardcoded fallback:", error);
    return {
      items: [],
      state: "unavailable",
      message: "Database belum bisa dibaca. Data hardcoded tidak digunakan sebagai fallback.",
      dbHostAlias,
    };
  }
}

export async function getDesaListWithFallback(): Promise<DesaListItem[]> {
  const result = await getDesaListResult();
  return result.items;
}

export async function getDesaByIdOrSlugWithFallback(idOrSlug: string): Promise<DesaListItem | null> {
  const result = await getDesaListResult();
  return result.items.find((desa) => desa.id === idOrSlug || desa.id.toString() === idOrSlug) ?? null;
}

export async function getDesaStaticParamsFromDb(): Promise<Array<{ id: string }>> {
  const result = await getDesaListResult();
  return result.items.map((desa) => ({ id: desa.id }));
}

export function buildSummaryStats(desa: Desa[]): SummaryStats {
  const totalDesa = desa.length;
  const totalAnggaranNasional = desa.reduce((acc, item) => acc + item.totalAnggaran, 0);
  const totalTerealisasi = desa.reduce((acc, item) => acc + item.terealisasi, 0);
  const rataRataSerapan = totalDesa
    ? Math.round(desa.reduce((acc, item) => acc + item.persentaseSerapan, 0) / totalDesa)
    : 0;
  const rataRataSkorTransparansi = totalDesa
    ? Math.round(desa.reduce((acc, item) => acc + (item.skorTransparansi?.total ?? 0), 0) / totalDesa)
    : 0;

  return {
    totalAnggaranNasional,
    totalDesa,
    rataRataSerapan,
    desaSerapanBaik: desa.filter((item) => item.status === "baik").length,
    desaSerapanSedang: desa.filter((item) => item.status === "sedang").length,
    desaSerapanRendah: desa.filter((item) => item.status === "rendah").length,
    totalTerealisasi,
    rataRataSkorTransparansi,
  };
}

export function buildTrendData(desa: Desa[]): TrendData[] {
  const stats = buildSummaryStats(desa);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  return months.map((bulan, index) => {
    const ratio = (index + 1) / months.length;
    return {
      bulan,
      anggaran: stats.totalAnggaranNasional,
      realisasi: Math.round(stats.totalTerealisasi * ratio),
    };
  });
}

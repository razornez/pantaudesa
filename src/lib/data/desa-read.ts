import { unstable_cache } from "next/cache";
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

type SourceRecord = {
  sourceName: string;
  sourceUrl: string | null;
  accessStatus: string;
  dataStatus: "demo" | "imported" | "needs_review" | "outdated" | "rejected" | "verified";
  lastCheckedAt: Date | null;
  updatedAt: Date;
};

type SummaryRecord = {
  tahun: number;
  totalAnggaran: bigint | number | null;
  totalRealisasi: bigint | number | null;
  persentaseRealisasi: unknown;
  statusSerapan: string;
  dataStatus: string;
  updatedAt: Date;
};

type APBDesRecord = {
  tahun: number;
  kodeBidang: string | null;
  namaBidang: string;
  anggaran: bigint | number | null;
  realisasi: bigint | number | null;
  persentase: unknown;
  dataStatus: string;
  updatedAt: Date;
};

type DocumentRecord = {
  tahun: number | null;
  namaDokumen: string;
  jenisDokumen: string;
  status: string;
  url: string | null;
  lastCheckedAt: Date | null;
  dataStatus: string;
  updatedAt: Date;
  source: { sourceName: string; sourceUrl: string | null } | null;
};

type PerangkatRecord = {
  nama: string;
  jabatan: string;
  periode: string | null;
  fotoUrl: string | null;
  kontakLabel: string | null;
  dataStatus: string;
  updatedAt: Date;
  source: { sourceName: string; sourceUrl: string | null } | null;
};

type DesaRecord = {
  id: string;
  slug: string;
  nama: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  tahunData: number | null;
  jumlahPenduduk: number | null;
  kategori: string | null;
  websiteUrl: string | null;
  dataStatus: string;
  updatedAt: Date;
  dataSources: SourceRecord[];
  anggaranSummaries: SummaryRecord[];
  apbdesItems: APBDesRecord[];
  dokumenPublik: DocumentRecord[];
  perangkat?: PerangkatRecord[];
};

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

function formatFreshness(date: Date | null | undefined) {
  if (!date) return "Belum ada tanggal pembaruan";
  return `Terakhir diperbarui: ${new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)}`;
}

function latestDate(dates: Array<Date | null | undefined>) {
  const valid = dates.filter((date): date is Date => Boolean(date));
  if (valid.length === 0) return null;
  return new Date(Math.max(...valid.map((date) => date.getTime())));
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

function mapDesaRecord(record: DesaRecord): DesaListItem {
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
  const sourceNames = record.dataSources
    .map((source) => source.sourceName)
    .filter(Boolean);
  const dokumen = record.dokumenPublik
    .sort((a, b) => (b.tahun ?? 0) - (a.tahun ?? 0) || a.namaDokumen.localeCompare(b.namaDokumen))
    .map((doc) => ({
      nama: doc.namaDokumen,
      jenis: DOCUMENT_KIND[doc.jenisDokumen] ?? "Dokumen",
      tahun: doc.tahun ?? tahun,
      tersedia: doc.status === "tersedia" || doc.status === "needs_review",
      url: doc.url ?? undefined,
      sumber: doc.source?.sourceName ?? sourceNames[0] ?? undefined,
      terakhirDicekLabel: formatFreshness(doc.lastCheckedAt ?? doc.updatedAt),
    }));
  const perangkat = (record.perangkat ?? [])
    .sort((a, b) => a.jabatan.localeCompare(b.jabatan) || a.nama.localeCompare(b.nama))
    .map((item) => ({
      jabatan: item.jabatan,
      nama: item.nama,
      periode: item.periode ?? undefined,
      kontak: item.kontakLabel ?? undefined,
    }));
  const hasNeedsReviewSource = record.dataSources.some(
    (source) => source.dataStatus === "needs_review" || source.accessStatus === "requires_review"
  );
  const hasSource = record.dataSources.length > 0 || Boolean(record.websiteUrl);
  const identityStatus = hasNeedsReviewSource ? "needs-review" : hasSource ? "source-found" : "demo";
  const freshnessDate = latestDate([
    record.updatedAt,
    latestSummary?.updatedAt,
    ...record.dataSources.map((source) => source.lastCheckedAt ?? source.updatedAt),
    ...record.dokumenPublik.map((doc) => doc.updatedAt),
  ]);
  const freshnessLabel = formatFreshness(freshnessDate);
  const documentCount = record.dokumenPublik.length;
  const sourceSummary = sourceNames[0]
    ? `Sumber: ${sourceNames[0]}. Dokumen pendukung: ${documentCount}.`
    : `Sumber publik belum tercatat. Dokumen pendukung: ${documentCount}.`;

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
    perangkat,
    skorTransparansi: makeSkorTransparansi(percent, dokumen.length, record.dataSources.length),
    pendapatan: makePendapatan(totalAnggaran),
    sumber: record.dataSources.map((source) => ({
      nama: source.sourceName,
      status: source.dataStatus === "verified" ? "needs_review" : source.dataStatus,
      perluReview: source.dataStatus === "needs_review" || source.accessStatus === "requires_review",
    })),
    jumlahSumber: record.dataSources.length,
    jumlahDokumenPendukung: documentCount,
    terakhirDiperbaruiLabel: freshnessLabel,
    ringkasanSumber: sourceSummary,
    dataOrigin: "database",
    identityStatus,
    budgetStatus: "demo",
    sourceSummary,
  };
}

async function fetchDesaRecords(): Promise<DesaRecord[]> {
  if (!prisma) return [];

  return prisma.desa.findMany({
    orderBy: [{ provinsi: "asc" }, { kabupaten: "asc" }, { nama: "asc" }],
    select: {
      id: true,
      slug: true,
      nama: true,
      kecamatan: true,
      kabupaten: true,
      provinsi: true,
      tahunData: true,
      jumlahPenduduk: true,
      kategori: true,
      websiteUrl: true,
      dataStatus: true,
      updatedAt: true,
      dataSources: {
        select: {
          sourceName: true,
          sourceUrl: true,
          accessStatus: true,
          dataStatus: true,
          lastCheckedAt: true,
          updatedAt: true,
        },
      },
      anggaranSummaries: {
        orderBy: { tahun: "desc" },
        take: 1,
        select: {
          tahun: true,
          totalAnggaran: true,
          totalRealisasi: true,
          persentaseRealisasi: true,
          statusSerapan: true,
          dataStatus: true,
          updatedAt: true,
        },
      },
      apbdesItems: {
        select: {
          tahun: true,
          kodeBidang: true,
          namaBidang: true,
          anggaran: true,
          realisasi: true,
          persentase: true,
          dataStatus: true,
          updatedAt: true,
        },
      },
      dokumenPublik: {
        select: {
          tahun: true,
          namaDokumen: true,
          jenisDokumen: true,
          status: true,
          url: true,
          lastCheckedAt: true,
          dataStatus: true,
          updatedAt: true,
          source: { select: { sourceName: true, sourceUrl: true } },
        },
      },
    },
  });
}

async function fetchDesaDetailRecord(idOrSlug: string): Promise<DesaRecord | null> {
  if (!prisma) return null;

  return prisma.desa.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
    select: {
      id: true,
      slug: true,
      nama: true,
      kecamatan: true,
      kabupaten: true,
      provinsi: true,
      tahunData: true,
      jumlahPenduduk: true,
      kategori: true,
      websiteUrl: true,
      dataStatus: true,
      updatedAt: true,
      dataSources: {
        orderBy: { updatedAt: "desc" },
        select: {
          sourceName: true,
          sourceUrl: true,
          accessStatus: true,
          dataStatus: true,
          lastCheckedAt: true,
          updatedAt: true,
        },
      },
      anggaranSummaries: {
        orderBy: { tahun: "desc" },
        take: 1,
        select: {
          tahun: true,
          totalAnggaran: true,
          totalRealisasi: true,
          persentaseRealisasi: true,
          statusSerapan: true,
          dataStatus: true,
          updatedAt: true,
        },
      },
      apbdesItems: {
        orderBy: [{ tahun: "desc" }, { kodeBidang: "asc" }],
        select: {
          tahun: true,
          kodeBidang: true,
          namaBidang: true,
          anggaran: true,
          realisasi: true,
          persentase: true,
          dataStatus: true,
          updatedAt: true,
        },
      },
      dokumenPublik: {
        orderBy: [{ tahun: "desc" }, { namaDokumen: "asc" }],
        select: {
          tahun: true,
          namaDokumen: true,
          jenisDokumen: true,
          status: true,
          url: true,
          lastCheckedAt: true,
          dataStatus: true,
          updatedAt: true,
          source: { select: { sourceName: true, sourceUrl: true } },
        },
      },
      perangkat: {
        orderBy: [{ jabatan: "asc" }, { nama: "asc" }],
        select: {
          nama: true,
          jabatan: true,
          periode: true,
          fotoUrl: true,
          kontakLabel: true,
          dataStatus: true,
          updatedAt: true,
          source: { select: { sourceName: true, sourceUrl: true } },
        },
      },
    },
  });
}

async function fetchDesaItems() {
  return (await fetchDesaRecords()).map(mapDesaRecord);
}

async function fetchDesaDetailItem(idOrSlug: string) {
  const record = await fetchDesaDetailRecord(idOrSlug);
  return record ? mapDesaRecord(record) : null;
}

const getCachedDesaItems = unstable_cache(
  fetchDesaItems,
  ["pantau-desa-public-list-v3"],
  { revalidate: 300, tags: ["desa-public"] }
);

const getCachedDesaDetailItem = unstable_cache(
  fetchDesaDetailItem,
  ["pantau-desa-public-detail-v4"],
  { revalidate: 300, tags: ["desa-public"] }
);

export async function getDesaListResult(): Promise<DesaListReadResult> {
  const dbHostAlias = getDbHostAlias();

  if (!prisma) {
    return {
      items: [],
      state: "unavailable",
      message: "Data desa belum siap ditampilkan. Coba muat ulang beberapa saat lagi.",
      dbHostAlias,
    };
  }

  try {
    const items = await getCachedDesaItems();
    if (items.length === 0) {
      return {
        items: [],
        state: "empty",
        message: "Belum ada desa yang bisa ditampilkan.",
        dbHostAlias,
      };
    }

    return {
      items,
      state: "ready",
      message: `${items.length} desa siap dibaca.`,
      dbHostAlias,
    };
  } catch (error) {
    console.error("[desa-read] public desa read failed:", error);
    return {
      items: [],
      state: "unavailable",
      message: "Data desa belum bisa dimuat. Coba muat ulang beberapa saat lagi.",
      dbHostAlias,
    };
  }
}

export async function getDesaListWithFallback(): Promise<DesaListItem[]> {
  const result = await getDesaListResult();
  return result.items;
}

export async function getDesaByIdOrSlugWithFallback(idOrSlug: string): Promise<DesaListItem | null> {
  try {
    return await getCachedDesaDetailItem(idOrSlug);
  } catch (error) {
    console.error("[desa-read] public desa detail read failed:", error);
    return null;
  }
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

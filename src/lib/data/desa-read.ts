import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isDatabaseConnectivityError } from "@/lib/db-connectivity";
import { perfStart, publicPerfLogWithRows } from "@/lib/perf";
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
  dataSourceLabel: string | null;
  dataPublishedAt: Date | null;
  updatedAt: Date;
  dataSources: SourceRecord[];
  anggaranSummaries: SummaryRecord[];
  apbdesItems: APBDesRecord[];
  dokumenPublik: DocumentRecord[];
  perangkat?: PerangkatRecord[];
};

type DesaListRecord = {
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
  dataSourceLabel: string | null;
  dataPublishedAt: Date | null;
  updatedAt: Date;
  dataSources: SourceRecord[];
  anggaranSummaries: SummaryRecord[];
  dokumenPublik: Array<Pick<DocumentRecord, "lastCheckedAt" | "updatedAt">>;
  _count: {
    dataSources: number;
    dokumenPublik: number;
  };
};

type SupabaseDesaRow = {
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
  dataSourceLabel: string | null;
  dataPublishedAt: string | null;
  updatedAt: string;
};

type SupabaseSourceRow = {
  id: string;
  desaId: string | null;
  sourceName: string;
  sourceUrl: string | null;
  accessStatus: string;
  dataStatus: SourceRecord["dataStatus"];
  lastCheckedAt: string | null;
  updatedAt: string;
};

type SupabaseSummaryRow = {
  desaId: string;
  tahun: number;
  totalAnggaran: number | string | null;
  totalRealisasi: number | string | null;
  persentaseRealisasi: number | string | null;
  statusSerapan: string;
  dataStatus: string;
  updatedAt: string;
};

type SupabaseApbdesRow = {
  desaId: string;
  tahun: number;
  kodeBidang: string | null;
  namaBidang: string;
  anggaran: number | string | null;
  realisasi: number | string | null;
  persentase: number | string | null;
  dataStatus: string;
  updatedAt: string;
};

type SupabaseDocumentRow = {
  desaId: string;
  tahun: number | null;
  namaDokumen: string;
  jenisDokumen: string;
  status: string;
  url: string | null;
  lastCheckedAt: string | null;
  dataStatus: string;
  updatedAt: string;
  sourceId: string | null;
};

type SupabasePerangkatRow = {
  desaId: string;
  nama: string;
  jabatan: string;
  periode: string | null;
  fotoUrl: string | null;
  kontakLabel: string | null;
  dataStatus: string;
  updatedAt: string;
  sourceId: string | null;
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
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
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

function toNumericStorageValue(value: unknown): number | null {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeEnvValue(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

async function requireSupabaseClient() {
  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const validUrl = /^https:\/\/[^/]+\.supabase\.co\/?$/i.test(url);
  const validKey =
    /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(serviceRoleKey) ||
    serviceRoleKey.startsWith("sb_secret_");

  if (!validUrl || !validKey) {
    throw new Error("Supabase admin fallback belum terkonfigurasi.");
  }

  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function mapSupabaseSourceRow(row: SupabaseSourceRow): SourceRecord {
  return {
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    accessStatus: row.accessStatus,
    dataStatus: row.dataStatus,
    lastCheckedAt: toDate(row.lastCheckedAt),
    updatedAt: toDate(row.updatedAt) ?? new Date(0),
  };
}

function mapSupabaseSummaryRow(row: SupabaseSummaryRow): SummaryRecord {
  return {
    tahun: row.tahun,
    totalAnggaran: toNumericStorageValue(row.totalAnggaran),
    totalRealisasi: toNumericStorageValue(row.totalRealisasi),
    persentaseRealisasi: row.persentaseRealisasi,
    statusSerapan: row.statusSerapan,
    dataStatus: row.dataStatus,
    updatedAt: toDate(row.updatedAt) ?? new Date(0),
  };
}

function mapSupabaseApbdesRow(row: SupabaseApbdesRow): APBDesRecord {
  return {
    tahun: row.tahun,
    kodeBidang: row.kodeBidang,
    namaBidang: row.namaBidang,
    anggaran: toNumericStorageValue(row.anggaran),
    realisasi: toNumericStorageValue(row.realisasi),
    persentase: row.persentase,
    dataStatus: row.dataStatus,
    updatedAt: toDate(row.updatedAt) ?? new Date(0),
  };
}

function mapSupabaseDetailRecord(
  desa: SupabaseDesaRow,
  sourceRows: SupabaseSourceRow[],
  summaryRows: SupabaseSummaryRow[],
  apbdesRows: SupabaseApbdesRow[],
  documentRows: SupabaseDocumentRow[],
  perangkatRows: SupabasePerangkatRow[],
): DesaRecord {
  const sourceMap = new Map(sourceRows.map((row) => [row.id, row]));

  return {
    id: desa.id,
    slug: desa.slug,
    nama: desa.nama,
    kecamatan: desa.kecamatan,
    kabupaten: desa.kabupaten,
    provinsi: desa.provinsi,
    tahunData: desa.tahunData,
    jumlahPenduduk: desa.jumlahPenduduk,
    kategori: desa.kategori,
    websiteUrl: desa.websiteUrl,
    dataStatus: desa.dataStatus,
    dataSourceLabel: desa.dataSourceLabel,
    dataPublishedAt: toDate(desa.dataPublishedAt),
    updatedAt: toDate(desa.updatedAt) ?? new Date(0),
    dataSources: sourceRows.map(mapSupabaseSourceRow),
    anggaranSummaries: summaryRows.map(mapSupabaseSummaryRow),
    apbdesItems: apbdesRows.map(mapSupabaseApbdesRow),
    dokumenPublik: documentRows.map((row) => ({
      tahun: row.tahun,
      namaDokumen: row.namaDokumen,
      jenisDokumen: row.jenisDokumen,
      status: row.status,
      url: row.url,
      lastCheckedAt: toDate(row.lastCheckedAt),
      dataStatus: row.dataStatus,
      updatedAt: toDate(row.updatedAt) ?? new Date(0),
      source: row.sourceId && sourceMap.has(row.sourceId)
        ? {
            sourceName: sourceMap.get(row.sourceId)!.sourceName,
            sourceUrl: sourceMap.get(row.sourceId)!.sourceUrl,
          }
        : null,
    })),
    perangkat: perangkatRows.map((row) => ({
      nama: row.nama,
      jabatan: row.jabatan,
      periode: row.periode,
      fotoUrl: row.fotoUrl,
      kontakLabel: row.kontakLabel,
      dataStatus: row.dataStatus,
      updatedAt: toDate(row.updatedAt) ?? new Date(0),
      source: row.sourceId && sourceMap.has(row.sourceId)
        ? {
            sourceName: sourceMap.get(row.sourceId)!.sourceName,
            sourceUrl: sourceMap.get(row.sourceId)!.sourceUrl,
          }
        : null,
    })),
  };
}

function mapSupabaseListRecord(
  desa: SupabaseDesaRow,
  sourceRows: SupabaseSourceRow[],
  latestSummary: SupabaseSummaryRow | null,
  latestDocument: SupabaseDocumentRow | null,
  documentCount: number,
): DesaListRecord {
  return {
    id: desa.id,
    slug: desa.slug,
    nama: desa.nama,
    kecamatan: desa.kecamatan,
    kabupaten: desa.kabupaten,
    provinsi: desa.provinsi,
    tahunData: desa.tahunData,
    jumlahPenduduk: desa.jumlahPenduduk,
    kategori: desa.kategori,
    websiteUrl: desa.websiteUrl,
    dataStatus: desa.dataStatus,
    dataSourceLabel: desa.dataSourceLabel,
    dataPublishedAt: toDate(desa.dataPublishedAt),
    updatedAt: toDate(desa.updatedAt) ?? new Date(0),
    dataSources: sourceRows
      .sort((a, b) => (toDate(b.updatedAt)?.getTime() ?? 0) - (toDate(a.updatedAt)?.getTime() ?? 0))
      .slice(0, 1)
      .map(mapSupabaseSourceRow),
    anggaranSummaries: latestSummary ? [mapSupabaseSummaryRow(latestSummary)] : [],
    dokumenPublik: latestDocument
      ? [
          {
            lastCheckedAt: toDate(latestDocument.lastCheckedAt),
            updatedAt: toDate(latestDocument.updatedAt) ?? new Date(0),
          },
        ]
      : [],
    _count: {
      dataSources: sourceRows.length,
      dokumenPublik: documentCount,
    },
  };
}

async function fetchDesaDetailRecordViaSupabase(idOrSlug: string): Promise<DesaRecord | null> {
  const client = await requireSupabaseClient();
  const { data: desaRow, error: desaError } = await client
    .from("desa")
    .select("id,slug,nama,kecamatan,kabupaten,provinsi,tahunData,jumlahPenduduk,kategori,websiteUrl,dataStatus,dataSourceLabel,dataPublishedAt,updatedAt")
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .limit(1)
    .maybeSingle<SupabaseDesaRow>();

  if (desaError) throw desaError;
  if (!desaRow) return null;

  const desaId = desaRow.id;
  const [
    sourceResult,
    summaryResult,
    apbdesResult,
    documentResult,
    perangkatResult,
  ] = await Promise.all([
    client
      .from("data_sources")
      .select("id,desaId,sourceName,sourceUrl,accessStatus,dataStatus,lastCheckedAt,updatedAt")
      .eq("desaId", desaId)
      .order("updatedAt", { ascending: false })
      .returns<SupabaseSourceRow[]>(),
    client
      .from("anggaran_desa_summaries")
      .select("desaId,tahun,totalAnggaran,totalRealisasi,persentaseRealisasi,statusSerapan,dataStatus,updatedAt")
      .eq("desaId", desaId)
      .order("tahun", { ascending: false })
      .limit(1)
      .returns<SupabaseSummaryRow[]>(),
    client
      .from("apbdes_items")
      .select("desaId,tahun,kodeBidang,namaBidang,anggaran,realisasi,persentase,dataStatus,updatedAt")
      .eq("desaId", desaId)
      .order("tahun", { ascending: false })
      .order("kodeBidang", { ascending: true })
      .returns<SupabaseApbdesRow[]>(),
    client
      .from("dokumen_publik")
      .select("desaId,tahun,namaDokumen,jenisDokumen,status,url,lastCheckedAt,dataStatus,updatedAt,sourceId")
      .eq("desaId", desaId)
      .order("tahun", { ascending: false })
      .order("namaDokumen", { ascending: true })
      .returns<SupabaseDocumentRow[]>(),
    client
      .from("perangkat_desa")
      .select("desaId,nama,jabatan,periode,fotoUrl,kontakLabel,dataStatus,updatedAt,sourceId")
      .eq("desaId", desaId)
      .order("jabatan", { ascending: true })
      .order("nama", { ascending: true })
      .returns<SupabasePerangkatRow[]>(),
  ]);

  if (sourceResult.error) throw sourceResult.error;
  if (summaryResult.error) throw summaryResult.error;
  if (apbdesResult.error) throw apbdesResult.error;
  if (documentResult.error) throw documentResult.error;
  if (perangkatResult.error) throw perangkatResult.error;

  return mapSupabaseDetailRecord(
    desaRow,
    sourceResult.data ?? [],
    summaryResult.data ?? [],
    apbdesResult.data ?? [],
    documentResult.data ?? [],
    perangkatResult.data ?? [],
  );
}

async function fetchDesaListRecordsViaSupabase(): Promise<DesaListRecord[]> {
  const client = await requireSupabaseClient();
  const { data: desaRows, error: desaError } = await client
    .from("desa")
    .select("id,slug,nama,kecamatan,kabupaten,provinsi,tahunData,jumlahPenduduk,kategori,websiteUrl,dataStatus,dataSourceLabel,dataPublishedAt,updatedAt")
    .order("provinsi", { ascending: true })
    .order("kabupaten", { ascending: true })
    .order("nama", { ascending: true })
    .returns<SupabaseDesaRow[]>();

  if (desaError) throw desaError;

  const ids = (desaRows ?? []).map((row) => row.id);
  if (ids.length === 0) return [];

  const [sourceResult, summaryResult, documentResult] = await Promise.all([
    client
      .from("data_sources")
      .select("id,desaId,sourceName,sourceUrl,accessStatus,dataStatus,lastCheckedAt,updatedAt")
      .in("desaId", ids)
      .order("updatedAt", { ascending: false })
      .returns<SupabaseSourceRow[]>(),
    client
      .from("anggaran_desa_summaries")
      .select("desaId,tahun,totalAnggaran,totalRealisasi,persentaseRealisasi,statusSerapan,dataStatus,updatedAt")
      .in("desaId", ids)
      .order("tahun", { ascending: false })
      .returns<SupabaseSummaryRow[]>(),
    client
      .from("dokumen_publik")
      .select("desaId,tahun,namaDokumen,jenisDokumen,status,url,lastCheckedAt,dataStatus,updatedAt,sourceId")
      .in("desaId", ids)
      .order("updatedAt", { ascending: false })
      .returns<SupabaseDocumentRow[]>(),
  ]);

  if (sourceResult.error) throw sourceResult.error;
  if (summaryResult.error) throw summaryResult.error;
  if (documentResult.error) throw documentResult.error;

  const sourceMap = new Map<string, SupabaseSourceRow[]>();
  for (const row of sourceResult.data ?? []) {
    if (!row.desaId) continue;
    sourceMap.set(row.desaId, [...(sourceMap.get(row.desaId) ?? []), row]);
  }

  const summaryMap = new Map<string, SupabaseSummaryRow>();
  for (const row of summaryResult.data ?? []) {
    if (!summaryMap.has(row.desaId)) summaryMap.set(row.desaId, row);
  }

  const documentMap = new Map<string, SupabaseDocumentRow[]>();
  for (const row of documentResult.data ?? []) {
    documentMap.set(row.desaId, [...(documentMap.get(row.desaId) ?? []), row]);
  }

  return (desaRows ?? []).map((desa) => {
    const sourceRows = sourceMap.get(desa.id) ?? [];
    const documents = documentMap.get(desa.id) ?? [];
    return mapSupabaseListRecord(
      desa,
      sourceRows,
      summaryMap.get(desa.id) ?? null,
      documents[0] ?? null,
      documents.length,
    );
  });
}

function mapDesaListRecord(record: DesaListRecord): DesaListItem {
  const latestSummary = [...record.anggaranSummaries].sort((a, b) => b.tahun - a.tahun)[0];
  const tahun = latestSummary?.tahun ?? record.tahunData ?? 2024;
  const totalAnggaran = toNumber(latestSummary?.totalAnggaran);
  const terealisasi = toNumber(latestSummary?.totalRealisasi);
  const percent = Math.round(toNumber(latestSummary?.persentaseRealisasi));
  const status = normalizeStatus(latestSummary?.statusSerapan, percent);
  const latestSource = record.dataSources[0];
  const sourceNames = latestSource?.sourceName ? [latestSource.sourceName] : [];
  const hasNeedsReviewSource = record.dataSources.some(
    (source) => source.dataStatus === "needs_review" || source.accessStatus === "requires_review",
  );
  const hasSource = record._count.dataSources > 0 || Boolean(record.websiteUrl);
  const identityStatus = hasNeedsReviewSource ? "needs-review" : hasSource ? "source-found" : "demo";
  const freshnessDate = latestDate([
    record.updatedAt,
    latestSummary?.updatedAt,
    ...record.dataSources.map((source) => source.lastCheckedAt ?? source.updatedAt),
    ...record.dokumenPublik.map((doc) => doc.lastCheckedAt ?? doc.updatedAt),
  ]);
  const freshnessLabel = formatFreshness(freshnessDate);
  const documentCount = record._count.dokumenPublik;
  const sourceSummary = sourceNames[0]
    ? `Sumber: ${sourceNames[0]}. Dokumen pendukung: ${documentCount}.`
    : `Sumber publik belum tercatat. Dokumen pendukung: ${documentCount}.`;

  return {
    id: record.slug || record.id,
    prismaId: record.id,
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
    skorTransparansi: makeSkorTransparansi(percent, documentCount, record._count.dataSources),
    pendapatan: makePendapatan(totalAnggaran),
    sumber: record.dataSources.map((source) => ({
      nama: source.sourceName,
      status: source.dataStatus === "verified" ? "needs_review" : source.dataStatus,
      perluReview: source.dataStatus === "needs_review" || source.accessStatus === "requires_review",
    })),
    jumlahSumber: record._count.dataSources,
    jumlahDokumenPendukung: documentCount,
    terakhirDiperbaruiLabel: freshnessLabel,
    ringkasanSumber: sourceSummary,
    dataOrigin: "database",
    identityStatus,
    budgetStatus: "demo",
    sourceSummary,
    dataSourceLabel: record.dataSourceLabel ?? null,
    dataPublishedAt: record.dataPublishedAt?.toISOString() ?? null,
  };
}

function logPublicDesaReadError(scope: string, error: unknown) {
  if (isDatabaseConnectivityError(error)) {
    console.warn(`[desa-read] ${scope} degraded due to database connectivity.`);
    return;
  }
  console.error(`[desa-read] ${scope} failed:`, error);
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
    prismaId: record.id,
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
    dataSourceLabel: record.dataSourceLabel ?? null,
    dataPublishedAt: record.dataPublishedAt?.toISOString() ?? null,
  };
}

async function fetchDesaListRecords(): Promise<DesaListRecord[]> {
  if (!prisma) return fetchDesaListRecordsViaSupabase();

  const timer = perfStart();
  const records = await prisma.desa.findMany({
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
      dataSourceLabel: true,
      dataPublishedAt: true,
      updatedAt: true,
      dataSources: {
        orderBy: { updatedAt: "desc" },
        take: 1,
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
      dokumenPublik: {
        orderBy: [{ updatedAt: "desc" }],
        take: 1,
        select: {
          lastCheckedAt: true,
          updatedAt: true,
        },
      },
      _count: {
        select: {
          dataSources: true,
          dokumenPublik: true,
        },
      },
    },
  }).catch(async (error) => {
    if (!isDatabaseConnectivityError(error)) throw error;
    const fallbackTimer = perfStart();
    const fallbackRecords = await fetchDesaListRecordsViaSupabase();
    publicPerfLogWithRows(
      "public.desa-read",
      "desa.list via supabase fallback",
      fallbackRecords.length,
      fallbackTimer,
    );
    return fallbackRecords;
  });
  publicPerfLogWithRows("public.desa-read", "desa.findMany(list-lite)", records.length, timer);
  return records;
}

async function fetchDesaDetailRecord(idOrSlug: string): Promise<DesaRecord | null> {
  if (!prisma) return fetchDesaDetailRecordViaSupabase(idOrSlug);

  const timer = perfStart();
  const record = await prisma.desa.findFirst({
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
      dataSourceLabel: true,
      dataPublishedAt: true,
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
  }).catch(async (error) => {
    if (!isDatabaseConnectivityError(error)) throw error;
    const fallbackTimer = perfStart();
    const fallbackRecord = await fetchDesaDetailRecordViaSupabase(idOrSlug);
    publicPerfLogWithRows(
      "public.desa-read",
      "desa.detail via supabase fallback",
      fallbackRecord ? 1 : 0,
      fallbackTimer,
    );
    return fallbackRecord;
  });
  publicPerfLogWithRows("public.desa-read", "desa.findFirst(detail)", record ? 1 : 0, timer);
  return record;
}

async function fetchDesaItems() {
  const records = await fetchDesaListRecords();
  const mapTimer = perfStart();
  const items = records.map(mapDesaListRecord);
  publicPerfLogWithRows("public.desa-read", "mapDesaRecords(list)", items.length, mapTimer);
  return items;
}

async function fetchDesaDetailItem(idOrSlug: string) {
  const record = await fetchDesaDetailRecord(idOrSlug);
  const mapTimer = perfStart();
  const item = record ? mapDesaRecord(record) : null;
  publicPerfLogWithRows("public.desa-read", "mapDesaRecord(detail)", item ? 1 : 0, mapTimer);
  return item;
}

const getCachedDesaItems = unstable_cache(
  fetchDesaItems,
  ["pantau-desa-public-list-v4"],
  { revalidate: 300, tags: ["desa-public"] }
);

const getCachedDesaDetailItem = unstable_cache(
  fetchDesaDetailItem,
  ["pantau-desa-public-detail-v4"],
  { revalidate: 300, tags: ["desa-public"] }
);

export async function getDesaListResult(): Promise<DesaListReadResult> {
  const timer = perfStart();
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
    publicPerfLogWithRows("public.desa-read", "getCachedDesaItems()", items.length, timer);
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
    logPublicDesaReadError("public desa list read", error);
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
    logPublicDesaReadError("public desa detail read", error);
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

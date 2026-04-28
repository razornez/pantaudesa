import { db } from "@/lib/db";
import { mockDesa } from "@/lib/mock-data";
import type {
  APBDesItem as UiAPBDesItem,
  Desa,
  DokumenPublik as UiDokumenPublik,
  OutputFisik,
  PendapatanDesa,
  RiwayatTahunan,
  SkorTransparansi,
} from "@/lib/types";

const BIDANG_LABELS: Record<string, string> = {
  "1": "Penyelenggaraan Pemerintahan Desa",
  "2": "Pelaksanaan Pembangunan Desa",
  "3": "Pembinaan Kemasyarakatan Desa",
  "4": "Pemberdayaan Masyarakat Desa",
  "5": "Penanggulangan Bencana & Darurat",
};

const FALLBACK_CATEGORY = "Infrastruktur";

type DbDesaRecord = Awaited<ReturnType<typeof fetchDesaRecords>>[number];

async function fetchDesaRecords() {
  return db.desa.findMany({
    include: {
      anggaranSummaries: { orderBy: { tahun: "desc" } },
      apbdesItems:       { orderBy: [{ tahun: "desc" }, { kodeBidang: "asc" }] },
      dokumenPublik:     { orderBy: [{ tahun: "desc" }, { namaDokumen: "asc" }] },
      dataSources:       { orderBy: [{ scopeName: "asc" }, { sourceName: "asc" }] },
    },
    orderBy: { nama: "asc" },
  });
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
}

function getStatusSerapan(percent: number): Desa["status"] {
  if (percent >= 85) return "baik";
  if (percent >= 60) return "sedang";
  return "rendah";
}

function deterministicBudget(seed: string): number {
  const score = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 780_000_000 + (score % 8) * 85_000_000;
}

function deterministicSerapan(seed: string): number {
  const score = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const values = [42, 55, 63, 70, 78, 84, 89, 94];
  return values[score % values.length];
}

function makePendapatan(total: number): PendapatanDesa {
  const danaDesa = Math.round(total * 0.65);
  const add = Math.round(total * 0.25);
  const pades = Math.round(total * 0.05);
  const bantuanKeuangan = total - danaDesa - add - pades;
  return { danaDesa, add, pades, bantuanKeuangan };
}

function makeFallbackApbdes(total: number, percent: number): UiAPBDesItem[] {
  const weights: Record<string, number> = {
    "1": 0.18,
    "2": 0.42,
    "3": 0.14,
    "4": 0.20,
    "5": 0.06,
  };

  return Object.entries(weights).map(([kode, weight]) => {
    const anggaran = Math.round(total * weight);
    const persentase = kode === "5" ? Math.max(15, Math.round(percent * 0.55)) : percent;
    return {
      kode,
      bidang: BIDANG_LABELS[kode],
      anggaran,
      realisasi: Math.round((anggaran * persentase) / 100),
      persentase,
    };
  });
}

function makeOutputFisik(percent: number): OutputFisik[] {
  return [
    { label: "Dokumen anggaran dibaca", satuan: "dokumen", target: 3, realisasi: Math.max(1, Math.round(percent / 35)), persentase: percent },
    { label: "Titik layanan warga dicek", satuan: "titik", target: 5, realisasi: Math.max(1, Math.round(percent / 22)), persentase: percent },
    { label: "Pertanyaan warga disiapkan", satuan: "topik", target: 4, realisasi: Math.max(1, Math.round(percent / 28)), persentase: percent },
  ];
}

function makeRiwayat(total: number, percent: number, year: number): RiwayatTahunan[] {
  const years = [year - 4, year - 3, year - 2, year - 1, year];
  return years.map((tahun, index) => {
    const ratio = 0.86 + index * 0.035;
    const persentaseSerapan = Math.max(25, Math.min(98, percent - (4 - index) * 4));
    const totalAnggaran = Math.round(total * ratio);
    return {
      tahun,
      totalAnggaran,
      terealisasi: Math.round((totalAnggaran * persentaseSerapan) / 100),
      persentaseSerapan,
    };
  });
}

function makeSkor(percent: number, docsCount: number, sourceCount: number): SkorTransparansi {
  const kelengkapan = Math.min(90, 35 + docsCount * 10);
  const responsif = Math.min(82, 40 + sourceCount * 6);
  const ketepatan = Math.min(88, 45 + Math.round(percent / 3));
  const konsistensi = Math.min(90, Math.round(percent * 0.85));
  const total = Math.round((ketepatan + kelengkapan + responsif + konsistensi) / 4);
  return { total, ketepatan, kelengkapan, responsif, konsistensi };
}

function mapDokumen(record: DbDesaRecord): UiDokumenPublik[] {
  return record.dokumenPublik.map((document) => ({
    nama: document.namaDokumen,
    jenis: document.jenisDokumen === "apbdes"
      ? "Keuangan"
      : document.jenisDokumen === "realisasi"
        ? "Laporan"
        : document.jenisDokumen.toUpperCase(),
    tahun: document.tahun ?? record.tahunData ?? new Date().getFullYear(),
    tersedia: document.status !== "belum",
  }));
}

function mapApbdes(record: DbDesaRecord, total: number, percent: number, year: number): UiAPBDesItem[] {
  const items = record.apbdesItems.filter((item) => item.tahun === year);
  if (items.length === 0) return makeFallbackApbdes(total, percent);

  return items.map((item) => ({
    kode: item.kodeBidang ?? "",
    bidang: item.namaBidang,
    anggaran: toNumber(item.anggaran),
    realisasi: toNumber(item.realisasi),
    persentase: Math.round(toNumber(item.persentase)),
  }));
}

function mapDbDesa(record: DbDesaRecord, mode: "list" | "detail"): Desa {
  const summary = record.anggaranSummaries[0];
  const fallbackTotal = deterministicBudget(record.slug);
  const fallbackPercent = deterministicSerapan(record.slug);
  const totalAnggaran = toNumber(summary?.totalAnggaran) || fallbackTotal;
  const terealisasi = toNumber(summary?.totalRealisasi) || Math.round((totalAnggaran * fallbackPercent) / 100);
  const persentaseSerapan = Math.round(toNumber(summary?.persentaseRealisasi) || (terealisasi / totalAnggaran) * 100 || fallbackPercent);
  const status = summary?.statusSerapan && summary.statusSerapan !== "unknown"
    ? summary.statusSerapan as Desa["status"]
    : getStatusSerapan(persentaseSerapan);
  const tahun = summary?.tahun ?? record.tahunData ?? new Date().getFullYear();
  const dokumen = mapDokumen(record);
  const apbdes = mapApbdes(record, totalAnggaran, persentaseSerapan, tahun);

  return {
    id: record.id,
    nama: record.nama.startsWith("Desa ") ? record.nama : `Desa ${record.nama}`,
    kecamatan: record.kecamatan,
    kabupaten: record.kabupaten,
    provinsi: record.provinsi,
    totalAnggaran,
    terealisasi,
    persentaseSerapan,
    status,
    tahun,
    penduduk: record.jumlahPenduduk ?? 2_500,
    kategori: record.kategori ?? FALLBACK_CATEGORY,
    apbdes,
    outputFisik: mode === "detail" ? makeOutputFisik(persentaseSerapan) : undefined,
    riwayat: mode === "detail" ? makeRiwayat(totalAnggaran, persentaseSerapan, tahun) : undefined,
    dokumen,
    skorTransparansi: mode === "detail" ? makeSkor(persentaseSerapan, dokumen.length, record.dataSources.length) : undefined,
    pendapatan: makePendapatan(totalAnggaran),
    profil: mode === "detail" && record.websiteUrl
      ? {
        website: record.websiteUrl,
        luasWilayah: 0,
        jumlahDusun: 0,
        jumlahRt: 0,
        jumlahRw: 0,
        jumlahKk: 0,
        mataPencaharian: "Belum tercatat di database demo",
        potensiUnggulan: record.kategori ?? "Belum tercatat",
        terakhirDiperbarui: record.updatedAt,
        aset: [],
        fasilitas: [],
        lembaga: [],
        historyBelanja: [],
        badge: {
          level: 1,
          label: "Data Demo",
          deskripsi: "Profil desa masih demo dan perlu dilengkapi dari sumber resmi.",
          warna: "bg-amber-100 text-amber-700",
          icon: "🧪",
        },
      }
      : undefined,
  };
}

export async function getDesaListFromDb(): Promise<Desa[]> {
  try {
    const records = await fetchDesaRecords();
    if (records.length === 0) return mockDesa;
    return records.map((record) => mapDbDesa(record, "list"));
  } catch (error) {
    console.warn("[desa-db] Falling back to mockDesa for list read.", error);
    return mockDesa;
  }
}

export async function getDesaDetailFromDb(idOrSlug: string): Promise<Desa | null> {
  try {
    const record = await db.desa.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        anggaranSummaries: { orderBy: { tahun: "desc" } },
        apbdesItems:       { orderBy: [{ tahun: "desc" }, { kodeBidang: "asc" }] },
        dokumenPublik:     { orderBy: [{ tahun: "desc" }, { namaDokumen: "asc" }] },
        dataSources:       { orderBy: [{ scopeName: "asc" }, { sourceName: "asc" }] },
      },
    });
    if (record) return mapDbDesa(record, "detail");
  } catch (error) {
    console.warn("[desa-db] Falling back to mockDesa for detail read.", error);
  }

  return mockDesa.find((desa) => desa.id === idOrSlug) ?? null;
}

export async function getDesaStaticParamsFromDb(): Promise<{ id: string }[]> {
  try {
    const records = await db.desa.findMany({ select: { id: true } });
    if (records.length > 0) return records.map((record) => ({ id: record.id }));
  } catch (error) {
    console.warn("[desa-db] Falling back to mockDesa for static params.", error);
  }

  return mockDesa.map((desa) => ({ id: desa.id }));
}

export function getProvinsiListFromDesa(desa: Desa[]): string[] {
  return [...new Set(desa.map((item) => item.provinsi))].sort((a, b) => a.localeCompare(b));
}

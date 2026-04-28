import { prisma } from "@/lib/prisma";
import { mockDesa } from "@/lib/mock-data";
import type { Desa } from "@/lib/types";

export type DesaDataOrigin = "mock" | "hybrid-db-seed";

export type DesaListItem = Desa & {
  dataOrigin: DesaDataOrigin;
  identityStatus: "demo" | "source-found" | "needs-review";
  budgetStatus: "demo";
  sourceSummary: string;
};

const defaultMockItems: DesaListItem[] = mockDesa.map((desa) => ({
  ...desa,
  dataOrigin: "mock",
  identityStatus: "demo",
  budgetStatus: "demo",
  sourceSummary: "Data contoh dari mock lokal.",
}));

function normalizeName(name: string) {
  return name.toLowerCase().replace(/^desa\s+/i, "").trim();
}

function findMockByName(name: string) {
  const normalized = normalizeName(name);
  return mockDesa.find((desa) => normalizeName(desa.nama) === normalized);
}

function makeDemoBudgetFallback(index: number) {
  return mockDesa[index % mockDesa.length];
}

function mergeProfilWebsite(desa: Desa, websiteUrl: string | null): Desa["profil"] {
  if (!desa.profil) return undefined;

  return {
    ...desa.profil,
    website: websiteUrl ?? desa.profil.website,
  };
}

export async function getDesaListWithFallback(): Promise<DesaListItem[]> {
  try {
    const dbDesa = await prisma.desa.findMany({
      orderBy: { nama: "asc" },
      include: {
        dataSources: {
          select: {
            dataStatus: true,
            accessStatus: true,
          },
        },
      },
    });

    if (dbDesa.length === 0) return defaultMockItems;

    return dbDesa.map((desa, index) => {
      const matchingMock = findMockByName(desa.nama);
      const demoBudget = matchingMock ?? makeDemoBudgetFallback(index);
      const hasNeedsReviewSource = desa.dataSources.some(
        (source) => source.dataStatus === "needs_review" || source.accessStatus === "requires_review"
      );
      const hasSource = desa.dataSources.length > 0 || Boolean(desa.websiteUrl);

      return {
        ...demoBudget,
        id: desa.slug || desa.id,
        nama: desa.nama,
        kecamatan: desa.kecamatan,
        kabupaten: desa.kabupaten,
        provinsi: desa.provinsi,
        tahun: desa.tahunData ?? demoBudget.tahun,
        penduduk: desa.jumlahPenduduk ?? demoBudget.penduduk,
        kategori: desa.kategori ?? demoBudget.kategori,
        profil: mergeProfilWebsite(demoBudget, desa.websiteUrl),
        dataOrigin: "hybrid-db-seed",
        identityStatus: hasNeedsReviewSource ? "needs-review" : hasSource ? "source-found" : "demo",
        budgetStatus: "demo",
        sourceSummary: hasSource
          ? "Identitas/sumber berasal dari seed DB; angka APBDes masih demo."
          : "Identitas berasal dari seed DB; angka APBDes masih demo.",
      } satisfies DesaListItem;
    });
  } catch (error) {
    console.error("Failed to read desa from database, falling back to mock data", error);
    return defaultMockItems;
  }
}

export async function getDesaByIdOrSlugWithFallback(idOrSlug: string): Promise<DesaListItem | null> {
  const allDesa = await getDesaListWithFallback();
  return allDesa.find((desa) => desa.id === idOrSlug || desa.id.toString() === idOrSlug) ?? null;
}

export function getMockDesaById(id: string): DesaListItem | null {
  const desa = mockDesa.find((item) => item.id === id);
  if (!desa) return null;

  return {
    ...desa,
    dataOrigin: "mock",
    identityStatus: "demo",
    budgetStatus: "demo",
    sourceSummary: "Data contoh dari mock lokal.",
  };
}

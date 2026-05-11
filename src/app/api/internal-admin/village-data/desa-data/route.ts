import { NextRequest, NextResponse } from "next/server";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { isDatabaseConnectivityError } from "@/lib/db-connectivity";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    const session = await requireInternalAdminSession();
    if (session instanceof NextResponse) return session;

    const sp = req.nextUrl.searchParams;
    const q        = sp.get("q")?.trim()         ?? "";
    const provinsi = sp.get("provinsi")?.trim()  ?? "";
    const kabupaten= sp.get("kabupaten")?.trim() ?? "";
    const kecamatan= sp.get("kecamatan")?.trim() ?? "";
    const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
    const skip = (page - 1) * PAGE_SIZE;

    if (!db) {
      return NextResponse.json({ error: "Database tidak tersedia." }, { status: 503 });
    }

    try {
      const where = {
        ...(q ? {
          OR: [
            { nama:      { contains: q, mode: "insensitive" as const } },
            { kecamatan: { contains: q, mode: "insensitive" as const } },
            { kabupaten: { contains: q, mode: "insensitive" as const } },
            { provinsi:  { contains: q, mode: "insensitive" as const } },
          ],
        } : {}),
        ...(provinsi  ? { provinsi:  { equals: provinsi,  mode: "insensitive" as const } } : {}),
        ...(kabupaten ? { kabupaten: { equals: kabupaten, mode: "insensitive" as const } } : {}),
        ...(kecamatan ? { kecamatan: { equals: kecamatan, mode: "insensitive" as const } } : {}),
      } as Record<string, unknown>;

      const [desa, total] = await Promise.all([
        db.desa.findMany({
          where,
          orderBy: { nama: "asc" },
          skip,
          take: PAGE_SIZE,
          select: {
            id: true,
            nama: true,
            slug: true,
            kecamatan: true,
            kabupaten: true,
            provinsi: true,
            websiteUrl: true,
            kategori: true,
            tahunData: true,
            jumlahPenduduk: true,
            dataStatus: true,
            dataSourceLabel: true,
            dataPublishedAt: true,
            _count: { select: { villageDataVersions: true } },
            detailTemplateAssignment: {
              select: {
                template: { select: { key: true, name: true } },
              },
            },
          },
        }),
        db.desa.count({ where }),
      ]);

      return NextResponse.json({ desa, total, page, pageSize: PAGE_SIZE });
    } catch (error) {
      if (!isDatabaseConnectivityError(error)) throw error;
      return NextResponse.json({ error: "Database tidak tersedia sementara." }, { status: 503 });
    }
  } catch (error) {
    return handleApiError(error, "GET /api/internal-admin/village-data/desa-data");
  }
}

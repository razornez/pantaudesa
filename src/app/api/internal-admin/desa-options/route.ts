import { NextRequest, NextResponse } from "next/server";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { isDatabaseConnectivityError } from "@/lib/db-connectivity";
import { searchDesaOptionsViaSupabase } from "@/lib/internal-admin/supabase-fallback";

const DEFAULT_TAKE = 12;

export async function GET(req: NextRequest) {
  try {
    const session = await requireInternalAdminSession();
    if (session instanceof NextResponse) return session;

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (!db) {
      const desa = await searchDesaOptionsViaSupabase(q, DEFAULT_TAKE);
      return NextResponse.json({ desa });
    }

    try {
      const desa = await db.desa.findMany({
        where: q
          ? {
              OR: [
                { nama: { contains: q, mode: "insensitive" } },
                { kecamatan: { contains: q, mode: "insensitive" } },
                { kabupaten: { contains: q, mode: "insensitive" } },
                { provinsi: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
              ],
            }
          : undefined,
        orderBy: [{ nama: "asc" }],
        take: DEFAULT_TAKE,
        select: {
          id: true,
          nama: true,
          slug: true,
          kecamatan: true,
          kabupaten: true,
          provinsi: true,
        },
      });

      return NextResponse.json({ desa });
    } catch (error) {
      if (!isDatabaseConnectivityError(error)) throw error;
      const desa = await searchDesaOptionsViaSupabase(q, DEFAULT_TAKE);
      return NextResponse.json({ desa });
    }
  } catch (error) {
    return handleApiError(error, "GET /api/internal-admin/desa-options");
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { db } from "@/lib/db";

const DEFAULT_TAKE = 12;

export async function GET(req: NextRequest) {
  const session = await requireInternalAdminSession();
  if (session instanceof NextResponse) return session;
  if (!db) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

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
}

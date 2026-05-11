import { NextRequest, NextResponse } from "next/server";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { handleApiError } from "@/lib/api-error";
import { db } from "@/lib/db";

/** Returns distinct provinsi/kabupaten/kecamatan values for admin filter dropdowns. */
export async function GET(req: NextRequest) {
  try {
    const session = await requireInternalAdminSession();
    if (session instanceof NextResponse) return session;
    if (!db) return NextResponse.json({ error: "Database tidak tersedia." }, { status: 503 });

    const sp = req.nextUrl.searchParams;
    const provinsi = sp.get("provinsi")?.trim() ?? "";
    const kabupaten = sp.get("kabupaten")?.trim() ?? "";

    const provinsiWhere = { NOT: { provinsi: "" } };
    const kabupatenWhere = provinsi ? { provinsi } : {};
    const kecamatanWhere = { ...(provinsi ? { provinsi } : {}), ...(kabupaten ? { kabupaten } : {}) };

    const [provinsiRows, kabupatenRows, kecamatanRows] = await Promise.all([
      db.desa.findMany({ where: provinsiWhere, select: { provinsi: true }, distinct: ["provinsi"], orderBy: { provinsi: "asc" } }),
      db.desa.findMany({ where: kabupatenWhere, select: { kabupaten: true }, distinct: ["kabupaten"], orderBy: { kabupaten: "asc" } }),
      db.desa.findMany({ where: kecamatanWhere, select: { kecamatan: true }, distinct: ["kecamatan"], orderBy: { kecamatan: "asc" } }),
    ]);

    return NextResponse.json({
      provinsi: provinsiRows.map(r => r.provinsi).filter(Boolean),
      kabupaten: kabupatenRows.map(r => r.kabupaten).filter(Boolean),
      kecamatan: kecamatanRows.map(r => r.kecamatan).filter(Boolean),
    });
  } catch (err) {
    return handleApiError(err, "GET /api/internal-admin/desa-filter-options");
  }
}

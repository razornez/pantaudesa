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

    const desaId = req.nextUrl.searchParams.get("desaId")?.trim() ?? "";
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10));
    const skip = (page - 1) * PAGE_SIZE;

    if (!db) {
      return NextResponse.json({ error: "Database tidak tersedia." }, { status: 503 });
    }

    try {
      const where = desaId ? { desaId } : undefined;

      const [versions, total, auditEvents] = await Promise.all([
        db.villageDataVersion.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: PAGE_SIZE,
          select: {
            id: true,
            desaId: true,
            versionNumber: true,
            status: true,
            title: true,
            sourceLabel: true,
            changedFields: true,
            reviewNote: true,
            publishedAt: true,
            createdAt: true,
            desa: { select: { nama: true, kecamatan: true, kabupaten: true } },
          },
        }),
        db.villageDataVersion.count({ where }),
        db.desaDataAuditEvent.findMany({
          where: desaId ? { desaId } : undefined,
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            id: true,
            desaId: true,
            eventType: true,
            eventLabel: true,
            actorRole: true,
            note: true,
            createdAt: true,
            desa: { select: { nama: true } },
          },
        }),
      ]);

      return NextResponse.json({ versions, total, page, pageSize: PAGE_SIZE, auditEvents });
    } catch (error) {
      if (!isDatabaseConnectivityError(error)) throw error;
      return NextResponse.json({ error: "Database tidak tersedia sementara." }, { status: 503 });
    }
  } catch (error) {
    return handleApiError(error, "GET /api/internal-admin/village-data/versions");
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { handleApiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import {
  listDataDesaRows,
  publishDataDesaRow,
  rejectDataDesaRow,
  writeDesaDataAuditEvent,
} from "@/lib/versioning/village-data-persistence";
import { invalidateTemplateCache } from "@/lib/village-data/template-resolver";

/** GET — list DataDesa rows, filterable by desaId + status */
export async function GET(req: NextRequest) {
  try {
    const session = await requireInternalAdminSession();
    if (session instanceof NextResponse) return session;

    const sp = req.nextUrl.searchParams;
    const desaId = sp.get("desaId") ?? undefined;
    const status = sp.get("status") ?? undefined;
    const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
    const pageSize = Math.min(50, parseInt(sp.get("pageSize") ?? "20", 10));

    const { rows, total } = await listDataDesaRows({ desaId, status, page, pageSize });

    // Enrich rows with source document title where available
    const documentIds = rows
      .map(r => r.sourceId)
      .filter((id): id is string => typeof id === "string" && id.startsWith("intake_"));

    const docTitleMap = new Map<string, string>();
    if (documentIds.length > 0 && db) {
      const docs = await db.adminDesaDocument.findMany({
        where: { id: { in: [...new Set(documentIds)] } },
        select: { id: true, title: true, createdAt: true },
      });
      for (const doc of docs) {
        docTitleMap.set(doc.id, `${doc.title} · ${doc.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`);
      }
    }

    const enriched = rows.map(r => ({
      ...r,
      sourceTitle: r.sourceId ? (docTitleMap.get(r.sourceId) ?? null) : null,
    }));

    return NextResponse.json({ rows: enriched, total });
  } catch (err) {
    return handleApiError(err, "GET /api/internal-admin/village-data/data-desa-rows");
  }
}

/** PATCH — approve (publish) or reject a DataDesa IN_REVIEW row */
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireInternalAdminSession();
    if (session instanceof NextResponse) return session;
    if (!db) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

    const body = (await req.json()) as { id?: unknown; action?: unknown };
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const action = typeof body.action === "string" ? body.action : "";

    if (!id || !["publish", "reject"].includes(action)) {
      return NextResponse.json({ error: "id dan action (publish|reject) wajib diisi." }, { status: 400 });
    }

    const row = await db.dataDesa.findUnique({
      where: { id },
      select: { id: true, desaId: true, componentId: true, fieldKey: true, status: true },
    });

    if (!row) return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
    if (row.status !== "IN_REVIEW") {
      return NextResponse.json(
        { error: "Hanya data dengan status IN_REVIEW yang bisa diubah." },
        { status: 422 },
      );
    }

    if (action === "publish") {
      const result = await publishDataDesaRow({
        id,
        desaId: row.desaId,
        componentId: row.componentId,
        fieldKey: row.fieldKey,
        reviewedById: session.userId,
      });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

      invalidateTemplateCache(row.desaId);

      await writeDesaDataAuditEvent({
        desaId: row.desaId,
        actorUserId: session.userId,
        actorRole: "INTERNAL_ADMIN",
        eventType: "DATA_DESA_PUBLISHED",
        eventLabel: "Data diterbitkan oleh admin",
        previousStatus: "IN_REVIEW",
        nextStatus: "PUBLISHED",
        metadata: { dataDesaId: id, fieldKey: row.fieldKey },
      });

      return NextResponse.json({ ok: true, status: "PUBLISHED" });
    }

    // reject
    const result = await rejectDataDesaRow({ id, reviewedById: session.userId });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

    await writeDesaDataAuditEvent({
      desaId: row.desaId,
      actorUserId: session.userId,
      actorRole: "INTERNAL_ADMIN",
      eventType: "DATA_DESA_REJECTED",
      eventLabel: "Data ditolak oleh admin",
      previousStatus: "IN_REVIEW",
      nextStatus: "REJECTED",
      metadata: { dataDesaId: id, fieldKey: row.fieldKey },
    });

    return NextResponse.json({ ok: true, status: "REJECTED" });
  } catch (err) {
    return handleApiError(err, "PATCH /api/internal-admin/village-data/data-desa-rows");
  }
}

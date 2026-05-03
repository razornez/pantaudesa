import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { writeAuditEvent } from "@/lib/admin-claim/audit";
import { AUDIT_EVENT } from "@/lib/admin-claim/audit-events";
import {
  uploadDocumentBuffer,
  buildDocumentStoragePath,
  isStorageConfigured,
} from "@/lib/storage/supabase-storage";
import {
  validateUpload,
  isValidCategory,
} from "@/lib/storage/upload-validation";

// POST /api/admin-claim/documents/upload
// multipart/form-data fields:
//   file: File (single — multi-file is one POST per file from the client)
//   title: string
//   category: DocumentCategory
//   responsibilityAck: "true" — required acknowledgment
//
// Status flow:
//   uploader is LIMITED  → AdminDesaDocument.status = WAITING_VERIFIED_APPROVAL
//   uploader is VERIFIED → AdminDesaDocument.status = PROCESSING
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    if (!db) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
    if (!isStorageConfigured()) {
      return NextResponse.json({
        error: "Storage tidak terkonfigurasi. Hubungi admin PantauDesa.",
        code: "STORAGE_NOT_CONFIGURED",
      }, { status: 503 });
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = form.get("file");
    const title = String(form.get("title") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();
    const ack = String(form.get("responsibilityAck") ?? "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (title.length > 200) {
      return NextResponse.json({ error: "title too long (max 200 chars)" }, { status: 400 });
    }
    if (!category || !isValidCategory(category)) {
      return NextResponse.json({ error: "category is required and must be valid" }, { status: 400 });
    }
    if (ack !== "true") {
      return NextResponse.json({
        error: "Pernyataan tanggung jawab wajib dicentang sebelum unggah.",
        code: "RESPONSIBILITY_REQUIRED",
      }, { status: 400 });
    }

    const validation = validateUpload(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message, code: validation.code }, { status: 400 });
    }

    // Caller must be an active LIMITED or VERIFIED member of some desa.
    const member = await db.desaAdminMember.findFirst({
      where: { userId, status: { in: ["LIMITED", "VERIFIED"] } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        desaId: true,
        status: true,
        role: true,
        desa: { select: { nama: true } },
      },
    });

    if (!member) {
      return NextResponse.json({
        error: "Hanya Admin Desa yang dapat mengunggah dokumen.",
        code: "NOT_ADMIN_DESA",
      }, { status: 403 });
    }

    // Generate documentId BEFORE upload so storageKey is stable.
    const documentId = `doc_${randomBytes(12).toString("hex")}`;
    const storageKey = buildDocumentStoragePath(member.desaId, documentId, file.name);

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase first; only persist the DB row after the file lands.
    try {
      await uploadDocumentBuffer(storageKey, buffer, file.type);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({
        error: `Gagal mengunggah file: ${msg}`,
        code: "UPLOAD_FAILED",
      }, { status: 502 });
    }

    const status = member.status === "VERIFIED" ? "PROCESSING" : "WAITING_VERIFIED_APPROVAL";

    const doc = await db.adminDesaDocument.create({
      data: {
        id: documentId,
        desaId: member.desaId,
        uploadedById: userId,
        title,
        category,
        storageKey,
        fileName: file.name.slice(0, 200),
        fileType: file.type,
        fileSize: file.size,
        status,
      },
      select: { id: true, status: true, createdAt: true, title: true, category: true },
    });

    await writeAuditEvent({
      eventType: status === "PROCESSING" ? AUDIT_EVENT.INTERNAL_DOCUMENT_REVIEWED : AUDIT_EVENT.DOCUMENT_APPROVED_BY_VERIFIED,
      desaId: member.desaId,
      actorUserId: userId,
      actorRole: member.role,
      entityType: "AdminDesaDocument",
      entityId: doc.id,
      nextStatus: status,
      metadata: {
        title,
        category,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        desaName: member.desa.nama,
        action: "uploaded",
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({
      ok: true,
      document: {
        id: doc.id,
        title: doc.title,
        category: doc.category,
        status: doc.status,
        createdAt: doc.createdAt.toISOString(),
      },
      message: status === "PROCESSING"
        ? "Dokumen berhasil diunggah dan masuk ke tahap PROCESSING."
        : "Dokumen berhasil diunggah dan menunggu persetujuan Admin Desa VERIFIED.",
    });
  } catch (err) {
    return handleApiError(err, "POST /api/admin-claim/documents/upload");
  }
}

// Configure body size guard at the route level — Next 16 default is 4 MB without this.
export const runtime = "nodejs";
export const maxDuration = 30;

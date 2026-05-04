import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminDesaContext } from "@/lib/data/admin-desa-context";
import AdminDesaDokumenClient from "@/components/admin-desa/AdminDesaDokumenClient";
import {
  DEFAULT_MAX_FILE_SIZE_MB,
  DEFAULT_MAX_FILES_PER_UPLOAD,
  DEFAULT_ALLOWED_MIME_TYPES,
  DOCUMENT_CATEGORIES,
  getMaxFileSizeBytes,
  getMaxFilesPerUpload,
  getAllowedMimeTypes,
} from "@/lib/storage/upload-validation";
import { getStorageConfigurationStatus } from "@/lib/storage/supabase-storage";
import { perfLog, perfStart } from "@/lib/perf";

export const dynamic = "force-dynamic";

export default async function AdminDesaDokumenPage() {
  const tAuth = perfStart();
  const session = await auth();
  perfLog("admin-desa.dokumen", "auth()", tAuth);
  if (!session?.user?.id) redirect("/login");
  const ctx = await getAdminDesaContext(session.user.id);
  if (!ctx) redirect("/profil/klaim-admin-desa?error=admin_desa_only");

  const tDocs = perfStart();
  const docs = db
    ? await db.adminDesaDocument.findMany({
        where: { desaId: ctx.desa.id },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: 100,
        select: {
          id: true,
          title: true,
          category: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          status: true,
          approvedAt: true,
          publishedAt: true,
          failedReason: true,
          rejectedReason: true,
          createdAt: true,
          uploadedById: true,
          uploadedBy: {
            select: { id: true, nama: true, username: true, email: true },
          },
        },
      })
    : [];
  perfLog("admin-desa.dokumen", "adminDesaDocument.findMany", tDocs);

  const serialized = docs.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    approvedAt: d.approvedAt?.toISOString() ?? null,
    publishedAt: d.publishedAt?.toISOString() ?? null,
  }));

  const storage = getStorageConfigurationStatus();
  const storageOk = storage.configured;
  const maxBytes = storageOk ? getMaxFileSizeBytes() : DEFAULT_MAX_FILE_SIZE_MB * 1024 * 1024;
  const maxFiles = storageOk ? getMaxFilesPerUpload() : DEFAULT_MAX_FILES_PER_UPLOAD;
  const allowedMime = storageOk ? getAllowedMimeTypes() : [...DEFAULT_ALLOWED_MIME_TYPES];

  return (
    <AdminDesaDokumenClient
      currentUserId={ctx.user.id}
      memberStatus={ctx.member.status}
      memberRole={ctx.member.role}
      documents={serialized}
      categories={[...DOCUMENT_CATEGORIES]}
      maxFileSizeMB={Math.round(maxBytes / (1024 * 1024))}
      maxFilesPerUpload={maxFiles}
      allowedMimeTypes={allowedMime}
      storageStatus={storage}
    />
  );
}

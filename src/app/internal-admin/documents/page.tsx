import { db } from "@/lib/db";
import InternalDocumentReviewQueue from "@/components/internal-admin/InternalDocumentReviewQueue";
import {
  getDatabaseUnavailableMessage,
  isDatabaseConnectivityError,
} from "@/lib/db-connectivity";
import { listInternalDocumentsViaSupabase } from "@/lib/internal-admin/supabase-fallback";
import { perfLog, perfStart } from "@/lib/perf";

export const dynamic = "force-dynamic";

const ALLOWED = ["WAITING_VERIFIED_APPROVAL", "PROCESSING", "PUBLISHED", "FAILED"] as const;

export default async function InternalDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; focus?: string }>;
}) {
  const params = await searchParams;
  const filter = params.status && (ALLOWED as readonly string[]).includes(params.status)
    ? (params.status as typeof ALLOWED[number])
    : null;
  const focusDocumentId = typeof params.focus === "string" ? params.focus : "";
  let queueDocuments:
    | Array<{
        id: string;
        title: string;
        category: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        status: "WAITING_VERIFIED_APPROVAL" | "PROCESSING" | "PUBLISHED" | "FAILED";
        approvedAt: string | null;
        publishedAt: string | null;
        failedReason: string | null;
        aiMappingStatus: string | null;
        aiMappingResult?: unknown;
        createdAt: string;
        updatedAt: string;
        desa: { id: string; nama: string; kecamatan: string; kabupaten: string };
        uploadedBy: { id: string; nama: string | null; username: string | null; email: string } | null;
      }>
    | null = null;

  if (!db) {
    try {
      queueDocuments = await listInternalDocumentsViaSupabase(filter);
    } catch {
      return (
        <div className="notice-card notice-danger text-sm leading-relaxed">
          {getDatabaseUnavailableMessage()}
        </div>
      );
    }

    return (
      <InternalDocumentReviewQueue
        documents={queueDocuments}
        statusFilter={filter ?? ""}
        focusDocumentId={focusDocumentId}
      />
    );
  }

  let docs;
  try {
    const tQuery = perfStart();
    docs = await db.adminDesaDocument.findMany({
      where: filter ? { status: filter } : undefined,
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
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
        aiMappingStatus: true,
        aiMappingResult: true,
        createdAt: true,
        updatedAt: true,
        desa: { select: { id: true, nama: true, kecamatan: true, kabupaten: true } },
        uploadedBy: { select: { id: true, nama: true, username: true, email: true } },
      },
    });
    perfLog("internal-admin.documents", "adminDesaDocument.findMany", tQuery);
  } catch (error) {
    if (!isDatabaseConnectivityError(error)) throw error;

    try {
      queueDocuments = await listInternalDocumentsViaSupabase(filter);
    } catch {
      return (
        <div className="notice-card notice-danger text-sm leading-relaxed">
          {getDatabaseUnavailableMessage()}
        </div>
      );
    }

    return (
      <InternalDocumentReviewQueue
        documents={queueDocuments}
        statusFilter={filter ?? ""}
        focusDocumentId={focusDocumentId}
      />
    );
  }

  const serialized = docs.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    approvedAt: d.approvedAt?.toISOString() ?? null,
    publishedAt: d.publishedAt?.toISOString() ?? null,
  }));

  queueDocuments = serialized;

  return (
    <InternalDocumentReviewQueue
      documents={queueDocuments}
      statusFilter={filter ?? ""}
      focusDocumentId={focusDocumentId}
    />
  );
}

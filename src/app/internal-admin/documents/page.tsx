import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getInternalAdminSession } from "@/lib/auth/internal-admin";
import InternalDocumentReviewQueue from "@/components/internal-admin/InternalDocumentReviewQueue";

export const dynamic = "force-dynamic";

const ALLOWED = ["WAITING_VERIFIED_APPROVAL", "PROCESSING", "PUBLISHED", "FAILED"] as const;

export default async function InternalDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getInternalAdminSession();
  if (!session) redirect("/login?error=unauthorized");

  const params = await searchParams;
  const filter = params.status && (ALLOWED as readonly string[]).includes(params.status)
    ? (params.status as typeof ALLOWED[number])
    : null;

  if (!db) {
    return (
      <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        Database unavailable.
      </div>
    );
  }

  const docs = await db.adminDesaDocument.findMany({
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

  const serialized = docs.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    approvedAt: d.approvedAt?.toISOString() ?? null,
    publishedAt: d.publishedAt?.toISOString() ?? null,
  }));

  return <InternalDocumentReviewQueue documents={serialized} statusFilter={filter ?? ""} />;
}

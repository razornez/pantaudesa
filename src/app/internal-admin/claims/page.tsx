import { db } from "@/lib/db";
import { getInternalAdminSession } from "@/lib/auth/internal-admin";
import { redirect } from "next/navigation";
import ClaimReviewQueue from "@/components/internal-admin/ClaimReviewQueue";

export const dynamic = "force-dynamic";

export default async function InternalAdminClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; desaId?: string }>;
}) {
  const session = await getInternalAdminSession();
  if (!session) redirect("/masuk?error=unauthorized");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const statusFilter = params.status ?? "";
  const desaId = params.desaId ?? "";

  const PAGE_SIZE = 20;
  const VALID_STATUSES = ["PENDING", "IN_REVIEW", "REJECTED", "APPROVED"];
  const statuses = statusFilter && VALID_STATUSES.includes(statusFilter)
    ? [statusFilter as "PENDING" | "IN_REVIEW" | "REJECTED" | "APPROVED"]
    : ["PENDING", "IN_REVIEW", "REJECTED", "APPROVED"] as const;

  if (!db) {
    return (
      <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg">
        Database unavailable. Check server configuration.
      </div>
    );
  }

  const where = {
    status: { in: [...statuses] as ("PENDING" | "IN_REVIEW" | "REJECTED" | "APPROVED")[] },
    ...(desaId ? { desaId } : {}),
  };

  const [claims, total] = await Promise.all([
    db.desaAdminClaim.findMany({
      where,
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        status: true,
        method: true,
        officialEmail: true,
        websiteUrl: true,
        verifiedAt: true,
        rejectedAt: true,
        rejectionReason: true,
        rejectCategory: true,
        rejectReason: true,
        rejectInstructions: true,
        reapplyAllowedAt: true,
        fraudCooldownUntil: true,
        supportSubmittedAt: true,
        createdAt: true,
        updatedAt: true,
        desa: {
          select: { id: true, nama: true, kecamatan: true, kabupaten: true, websiteUrl: true },
        },
        user: { select: { id: true, nama: true, username: true, email: true } },
      },
    }),
    db.desaAdminClaim.count({ where }),
  ]);

  const serialized = claims.map((c) => ({
    ...c,
    verifiedAt: c.verifiedAt?.toISOString() ?? null,
    rejectedAt: c.rejectedAt?.toISOString() ?? null,
    reapplyAllowedAt: c.reapplyAllowedAt?.toISOString() ?? null,
    fraudCooldownUntil: c.fraudCooldownUntil?.toISOString() ?? null,
    supportSubmittedAt: c.supportSubmittedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <ClaimReviewQueue
      claims={serialized}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      statusFilter={statusFilter}
    />
  );
}

import { cache } from "react";
import { db } from "@/lib/db";
import { getRenewalState, daysUntilRenewal, type RenewalState } from "@/lib/admin-claim/renewal";
import { perfLog, perfStart } from "@/lib/perf";

export interface AdminDesaContext {
  member: {
    id: string;
    desaId: string;
    role: "LIMITED_ADMIN" | "VERIFIED_ADMIN";
    status: "LIMITED" | "VERIFIED" | "REVOKED" | "EXPIRED";
    joinedAt: string;
    invitedAt: string | null;
    acceptedAt: string | null;
    verifiedById: string | null;
    renewalDueAt: string | null;
    revokedAt: string | null;
    revokedReason: string | null;
  };
  desa: {
    id: string;
    nama: string;
    slug: string;
    kecamatan: string;
    kabupaten: string;
    provinsi: string;
    websiteUrl: string | null;
  };
  user: {
    id: string;
    nama: string | null;
    username: string | null;
    email: string;
    avatarUrl: string | null;
  };
  renewal: {
    state: RenewalState;
    daysUntil: number | null;
  };
}

/**
 * Fetches the active Admin Desa membership for a user.
 * Returns null if the user is not a current Admin Desa (LIMITED/VERIFIED).
 * REVOKED and EXPIRED do NOT count — those users fall back to regular profile.
 *
 * Wrapped with React `cache()` so that within a single render/request the
 * layout + nested page do not duplicate the same DB roundtrip. This is
 * REQUEST-scoped only (not a persistent cache), and the result still respects
 * `userId` as cache key, so user-specific data stays isolated.
 */
export const getAdminDesaContext = cache(async function getAdminDesaContext(
  userId: string,
): Promise<AdminDesaContext | null> {
  if (!db) return null;

  const t = perfStart();
  const member = await db.desaAdminMember.findFirst({
    where: {
      userId,
      status: { in: ["LIMITED", "VERIFIED"] },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      desaId: true,
      role: true,
      status: true,
      joinedAt: true,
      invitedAt: true,
      acceptedAt: true,
      verifiedById: true,
      renewalDueAt: true,
      revokedAt: true,
      revokedReason: true,
      desa: {
        select: {
          id: true,
          nama: true,
          slug: true,
          kecamatan: true,
          kabupaten: true,
          provinsi: true,
          websiteUrl: true,
        },
      },
      user: {
        select: {
          id: true,
          nama: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
  perfLog("admin-desa.context", "desaAdminMember.findFirst", t);

  if (!member) return null;

  const renewalState = getRenewalState(member.renewalDueAt);
  const days = daysUntilRenewal(member.renewalDueAt);

  return {
    member: {
      id: member.id,
      desaId: member.desaId,
      role: member.role as "LIMITED_ADMIN" | "VERIFIED_ADMIN",
      status: member.status as "LIMITED" | "VERIFIED" | "REVOKED" | "EXPIRED",
      joinedAt: member.joinedAt.toISOString(),
      invitedAt: member.invitedAt?.toISOString() ?? null,
      acceptedAt: member.acceptedAt?.toISOString() ?? null,
      verifiedById: member.verifiedById,
      renewalDueAt: member.renewalDueAt?.toISOString() ?? null,
      revokedAt: member.revokedAt?.toISOString() ?? null,
      revokedReason: member.revokedReason,
    },
    desa: member.desa,
    user: member.user,
    renewal: { state: renewalState, daysUntil: days },
  };
});

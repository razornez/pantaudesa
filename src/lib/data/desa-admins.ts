import { db } from "@/lib/db";

export interface DesaAdminRow {
  id: string;
  userId: string;
  status: "LIMITED" | "VERIFIED" | "REVOKED" | "EXPIRED";
  role: "LIMITED_ADMIN" | "VERIFIED_ADMIN";
  joinedAt: string;
  invitedAt: string | null;
  acceptedAt: string | null;
  revokedAt: string | null;
  revokedReason: string | null;
  user: {
    id: string;
    email: string;
    nama: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
}

export interface PendingInviteRow {
  id: string;
  email: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  createdAt: string;
}

export interface DesaAdminRoster {
  active: DesaAdminRow[];   // LIMITED + VERIFIED
  history: DesaAdminRow[];  // REVOKED + EXPIRED
  pendingInvites: PendingInviteRow[];
  verifiedCount: number;
  limitedCount: number;
}

export async function getDesaAdminRoster(desaId: string): Promise<DesaAdminRoster> {
  if (!db) {
    return { active: [], history: [], pendingInvites: [], verifiedCount: 0, limitedCount: 0 };
  }

  const [members, invites] = await Promise.all([
    db.desaAdminMember.findMany({
      where: { desaId },
      orderBy: [{ status: "asc" }, { joinedAt: "asc" }],
      select: {
        id: true,
        userId: true,
        status: true,
        role: true,
        joinedAt: true,
        invitedAt: true,
        acceptedAt: true,
        revokedAt: true,
        revokedReason: true,
        user: {
          select: {
            id: true,
            email: true,
            nama: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    }),
    db.desaAdminInvite.findMany({
      where: { desaId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        email: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
    }),
  ]);

  const rows: DesaAdminRow[] = members.map((m) => ({
    id: m.id,
    userId: m.userId,
    status: m.status as DesaAdminRow["status"],
    role: m.role as DesaAdminRow["role"],
    joinedAt: m.joinedAt.toISOString(),
    invitedAt: m.invitedAt?.toISOString() ?? null,
    acceptedAt: m.acceptedAt?.toISOString() ?? null,
    revokedAt: m.revokedAt?.toISOString() ?? null,
    revokedReason: m.revokedReason,
    user: m.user,
  }));

  const active = rows.filter((r) => r.status === "LIMITED" || r.status === "VERIFIED");
  const history = rows.filter((r) => r.status === "REVOKED" || r.status === "EXPIRED");

  const pendingInvites: PendingInviteRow[] = invites.map((i) => ({
    id: i.id,
    email: i.email,
    status: i.status as PendingInviteRow["status"],
    expiresAt: i.expiresAt.toISOString(),
    createdAt: i.createdAt.toISOString(),
  }));

  return {
    active,
    history,
    pendingInvites,
    verifiedCount: active.filter((r) => r.status === "VERIFIED").length,
    limitedCount: active.filter((r) => r.status === "LIMITED").length,
  };
}

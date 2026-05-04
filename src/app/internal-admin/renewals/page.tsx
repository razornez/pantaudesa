import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getInternalAdminSession } from "@/lib/auth/internal-admin";
import {
  RENEWAL_REMINDER_DAYS,
  daysUntilRenewal,
  getRenewalState,
} from "@/lib/admin-claim/renewal";
import InternalRenewalQueue from "@/components/internal-admin/InternalRenewalQueue";

export const dynamic = "force-dynamic";

export default async function InternalAdminRenewalsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const session = await getInternalAdminSession();
  if (!session) redirect("/masuk?error=unauthorized");

  const params = await searchParams;
  const state = params.state === "OVERDUE" || params.state === "DUE_SOON" ? params.state : "ALL";

  if (!db) {
    return (
      <div className="notice-card notice-danger text-sm leading-relaxed">
        Database belum tersedia. Cek konfigurasi server sebelum melanjutkan review perpanjangan.
      </div>
    );
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + RENEWAL_REMINDER_DAYS * 86_400_000);

  const where = state === "OVERDUE"
    ? { status: "VERIFIED" as const, renewalDueAt: { lt: now } }
    : state === "DUE_SOON"
      ? { status: "VERIFIED" as const, renewalDueAt: { gte: now, lte: horizon } }
      : { status: "VERIFIED" as const, renewalDueAt: { not: null, lte: horizon } };

  const members = await db.desaAdminMember.findMany({
    where,
    orderBy: { renewalDueAt: "asc" },
    take: 100,
    select: {
      id: true,
      userId: true,
      desaId: true,
      status: true,
      renewalDueAt: true,
      joinedAt: true,
      desa: { select: { id: true, nama: true, kecamatan: true, kabupaten: true } },
      user: { select: { id: true, nama: true, username: true, email: true } },
    },
  });

  const serialized = members.map((item) => ({
    ...item,
    renewalDueAt: item.renewalDueAt?.toISOString() ?? null,
    joinedAt: item.joinedAt.toISOString(),
    renewalState: getRenewalState(item.renewalDueAt, now),
    daysUntilRenewal: daysUntilRenewal(item.renewalDueAt, now),
  }));

  return <InternalRenewalQueue members={serialized} stateFilter={state} />;
}

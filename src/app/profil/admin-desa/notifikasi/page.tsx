import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminDesaContext } from "@/lib/data/admin-desa-context";
import AdminDesaNotifikasiClient from "@/components/admin-desa/AdminDesaNotifikasiClient";

export const dynamic = "force-dynamic";

export default async function AdminDesaNotifikasiPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getAdminDesaContext(session.user.id);
  if (!ctx) redirect("/profil/klaim-admin-desa?error=admin_desa_only");

  const notifications = db
    ? await db.adminDesaNotification.findMany({
        where: { userId: session.user.id, channel: "in_app" },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          isRead: true,
          readAt: true,
          createdAt: true,
          desaId: true,
        },
      })
    : [];

  const serialized = notifications.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
    readAt: n.readAt?.toISOString() ?? null,
  }));

  const unreadCount = serialized.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-7">
      <header className="space-y-1.5">
        <p className="eyebrow text-[10px]">Tab</p>
        <h1 className="display text-[28px] sm:text-[32px] font-semibold text-slate-900 tracking-tight leading-tight">Notifikasi</h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
          Aktivitas dan pengingat terkait Admin Desa untuk {ctx.desa.nama}.
        </p>
      </header>

      <AdminDesaNotifikasiClient
        initialNotifications={serialized}
        initialUnread={unreadCount}
      />
    </div>
  );
}

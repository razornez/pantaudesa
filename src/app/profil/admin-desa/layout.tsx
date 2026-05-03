import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAdminDesaContext } from "@/lib/data/admin-desa-context";
import { getVisibleTabs } from "@/lib/admin-claim/profile-tabs";
import AdminDesaBadge from "@/components/admin-desa/AdminDesaBadge";
import AdminDesaTabNav from "@/components/admin-desa/AdminDesaTabNav";

export const dynamic = "force-dynamic";

export default async function AdminDesaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/profil/admin-desa");
  }

  const ctx = await getAdminDesaContext(session.user.id);

  // Only LIMITED / VERIFIED members can see the Admin Desa tabs.
  // PENDING / IN_REVIEW / REJECTED / no-claim → redirect to claim flow.
  if (!ctx) {
    redirect("/profil/klaim-admin-desa?error=admin_desa_only");
  }

  const visibleTabs = getVisibleTabs(ctx.member.status);

  return (
    <div className="min-h-screen">
      {/* Header — Quiet Luxury: glass surface, hairline border, generous breathing room */}
      <header className="bg-white/85 backdrop-blur-md ring-hair">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <AdminDesaBadge
              status={ctx.member.status}
              role={ctx.member.role}
              desaName={ctx.desa.nama}
              renewalDueAt={ctx.member.renewalDueAt}
              renewalState={ctx.renewal.state}
              daysUntilRenewal={ctx.renewal.daysUntil}
              avatarUrl={ctx.user.avatarUrl}
              displayName={ctx.user.nama ?? ctx.user.username ?? ctx.user.email}
            />
            <div className="min-w-0">
              <p className="eyebrow text-[10px]">Admin Desa</p>
              <p className="font-semibold text-slate-900 truncate text-[17px] tracking-tight mt-0.5">{ctx.desa.nama}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {ctx.desa.kecamatan}, {ctx.desa.kabupaten}, {ctx.desa.provinsi}
              </p>
            </div>
          </div>
          <Link
            href="/profil/saya"
            className="t-spring ml-auto text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1"
          >
            ← Kembali ke profil saya
          </Link>
        </div>

        <AdminDesaTabNav tabs={visibleTabs} />
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">{children}</main>
    </div>
  );
}

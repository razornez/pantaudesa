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
    <div className="min-h-screen bg-slate-50">
      {/* Header with badge + desa context */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
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
              <p className="text-sm text-slate-500">Admin Desa</p>
              <p className="font-semibold text-slate-900 truncate">{ctx.desa.nama}</p>
              <p className="text-xs text-slate-500 truncate">
                {ctx.desa.kecamatan}, {ctx.desa.kabupaten}, {ctx.desa.provinsi}
              </p>
            </div>
          </div>
          <Link
            href="/profil/saya"
            className="ml-auto text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Kembali ke profil saya
          </Link>
        </div>

        <AdminDesaTabNav tabs={visibleTabs} />
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

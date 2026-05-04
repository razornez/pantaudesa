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
  if (!ctx) {
    redirect("/profil/klaim-admin-desa?error=admin_desa_only");
  }

  const visibleTabs = getVisibleTabs(ctx.member.status);
  const isVerified = ctx.member.status === "VERIFIED";

  return (
    <div className="min-h-screen">
      <header className="pt-5 sm:pt-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="lux-panel overflow-hidden">
            <div className="px-5 sm:px-7 pt-6 pb-5 sm:pt-7 sm:pb-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4 min-w-0">
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
                  <div className="min-w-0 space-y-2">
                    <p className="eyebrow text-[10px]">Workspace Admin Desa</p>
                    <div>
                      <p className="display text-[24px] sm:text-[28px] font-semibold text-slate-900 tracking-tight leading-tight">
                        {ctx.desa.nama}
                      </p>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        {ctx.desa.kecamatan}, {ctx.desa.kabupaten}, {ctx.desa.provinsi}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${isVerified ? "pill-ok" : "pill-warn"}`}>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: isVerified ? "#10B981" : "#D97706" }}
                          aria-hidden
                        />
                        {isVerified ? "Admin VERIFIED" : "Admin LIMITED"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold pill-info">
                        {ctx.member.role === "VERIFIED_ADMIN" ? "Bisa kelola anggota" : "Kontributor desa"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                    <div className="metric-card min-w-[132px]">
                      <p className="metric-label">Status</p>
                      <p className="metric-value text-[1.35rem]">{isVerified ? "V" : "L"}</p>
                      <p className="metric-note">{isVerified ? "Terverifikasi" : "Terbatas"}</p>
                    </div>
                    <div className="metric-card min-w-[132px]">
                      <p className="metric-label">Perpanjangan</p>
                      <p className="metric-value text-[1.35rem]">{ctx.member.renewalDueAt ? "Aktif" : "-"}</p>
                      <p className="metric-note">
                        {ctx.member.renewalDueAt
                          ? ctx.renewal.daysUntil !== null
                            ? `${Math.abs(ctx.renewal.daysUntil)} hari`
                            : "Terjadwal"
                          : "Belum ada"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/profil/saya"
                    className="btn-lux btn-lux-secondary w-full lg:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    Kembali ke profil saya
                  </Link>
                </div>
              </div>
            </div>

            <AdminDesaTabNav tabs={visibleTabs} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">{children}</main>
    </div>
  );
}

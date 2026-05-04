import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAdminDesaContext } from "@/lib/data/admin-desa-context";
import { getVisibleTabs } from "@/lib/admin-claim/profile-tabs";
import { BACK_OFFICE_COPY } from "@/lib/back-office-copy";
import AdminDesaBadge from "@/components/admin-desa/AdminDesaBadge";
import AdminDesaTabNav from "@/components/admin-desa/AdminDesaTabNav";
import { BadgeCheck, Sparkles } from "lucide-react";

const COPY = BACK_OFFICE_COPY.adminDesa.shell;

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
  const membershipLabel = isVerified ? COPY.membership.verified : COPY.membership.limited;
  const roleLabel = ctx.member.role === "VERIFIED_ADMIN" ? COPY.role.verifiedAdmin : COPY.role.limitedAdmin;

  return (
    <div className="min-h-screen" data-testid="admin-desa-shell">
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
                    <p className="eyebrow text-[10px]">{COPY.eyebrow}</p>
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
                        {membershipLabel}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold pill-info">
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                    <div className="metric-card min-w-[132px] flex flex-col justify-between">
                      <p className="metric-label">{COPY.accountStatus.title}</p>
                      <div className="mt-3">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-semibold shadow-[0_14px_28px_-20px_rgba(15,23,42,0.35)] ${
                          isVerified
                            ? "bg-[linear-gradient(135deg,rgba(79,70,229,0.12),rgba(16,185,129,0.12))] text-slate-900 ring-1 ring-indigo-100"
                            : "bg-amber-50 text-amber-900 ring-1 ring-amber-100"
                        }`}>
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                            isVerified ? "bg-[#1877F2] text-white" : "bg-amber-500 text-white"
                          }`}>
                            {isVerified ? <BadgeCheck size={14} aria-hidden /> : <Sparkles size={13} aria-hidden />}
                          </span>
                          {isVerified ? COPY.accountStatus.verifiedBadge : COPY.accountStatus.limitedBadge}
                        </span>
                      </div>
                      <p className="metric-note mt-3">{isVerified ? COPY.accountStatus.verifiedNote : COPY.accountStatus.limitedNote}</p>
                    </div>
                    <div className="metric-card min-w-[132px]">
                      <p className="metric-label">{COPY.renewal.title}</p>
                      <p className="metric-value text-[1.35rem]">{ctx.member.renewalDueAt ? COPY.renewal.active : COPY.renewal.emptyValue}</p>
                      <p className="metric-note">
                        {ctx.member.renewalDueAt
                          ? ctx.renewal.daysUntil !== null
                            ? COPY.renewal.days(ctx.renewal.daysUntil)
                            : COPY.renewal.scheduled
                          : COPY.renewal.none}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/profil/saya"
                    className="btn-lux btn-lux-secondary w-full lg:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    {COPY.backToProfile}
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

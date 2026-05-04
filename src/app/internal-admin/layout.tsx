import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, FileText, RefreshCcw, UserCog } from "lucide-react";
import { getInternalAdminSession } from "@/lib/auth/internal-admin";

export default async function InternalAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getInternalAdminSession();
  if (!session) {
    redirect("/masuk?error=unauthorized");
  }

  const navItems = [
    { href: "/internal-admin/claims", label: "Review pengajuan", icon: UserCog },
    { href: "/internal-admin/documents", label: "Dokumen desa", icon: FileText },
    { href: "/internal-admin/renewals", label: "Perpanjangan", icon: RefreshCcw },
  ];

  return (
    <div className="min-h-screen" data-testid="internal-admin-shell">
      <header className="pt-5 sm:pt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="lux-panel overflow-hidden">
            <div className="px-5 sm:px-7 pt-6 pb-5 sm:pt-7 sm:pb-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4 min-w-0">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(79,70,229,0.12),rgba(16,185,129,0.12))] text-[#1E1B4B] shadow-[inset_0_0_0_1px_rgba(79,70,229,0.14),0_18px_34px_-28px_rgba(15,23,42,0.35)]">
                    <ShieldCheck size={24} aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <p className="eyebrow text-[10px]">Back Office PantauDesa</p>
                    <div>
                      <h1 className="display text-[24px] sm:text-[28px] font-semibold text-slate-900 tracking-tight leading-tight">
                        Internal Admin
                      </h1>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-2xl">
                        Area review operasional untuk pengajuan Admin Desa, dokumen desa, dan perpanjangan akses.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="pill-danger inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" aria-hidden />
                        Akses internal terbatas
                      </span>
                      <span className="pill-info inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold">
                        Keputusan terekam ke audit
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                  <div className="metric-card min-w-[148px]">
                    <p className="metric-label">Ruang kerja</p>
                    <p className="metric-value text-[1.15rem]">3 area</p>
                    <p className="metric-note">klaim, dokumen, perpanjangan</p>
                  </div>
                  <div className="metric-card min-w-[148px]">
                    <p className="metric-label">Arah kerja</p>
                    <p className="metric-value text-[1.15rem]">Review manual</p>
                    <p className="metric-note">hindari keputusan tergesa-gesa</p>
                  </div>
                </div>
              </div>
            </div>

            <nav
              aria-label="Internal admin navigation"
              className="overflow-x-auto no-scrollbar"
              style={{ borderTop: "1px solid var(--hair)" }}
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
                <div className="inline-flex min-w-max items-center gap-2 rounded-[1.35rem] bg-white/80 p-1.5 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06),0_18px_38px_-28px_rgba(15,23,42,0.28)]">
                  {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 t-spring hover:bg-white/70 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                      <Icon size={15} aria-hidden />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">{children}</main>
    </div>
  );
}

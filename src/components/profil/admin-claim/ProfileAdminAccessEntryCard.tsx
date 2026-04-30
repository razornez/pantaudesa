"use client";

import Link from "next/link";
import { ArrowRight, LifeBuoy, ShieldCheck } from "lucide-react";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";
import ClaimStatusBadge from "@/components/profil/admin-claim/ClaimStatusBadge";
import {
  getCurrentDataStatus,
  getCurrentStatusTone,
} from "@/components/profil/admin-claim/adminClaimCopy";
import { useAdminClaimProfile } from "@/components/profil/admin-claim/useAdminClaimProfile";
import type { AuthUser } from "@/lib/auth-context";

export default function ProfileAdminAccessEntryCard({
  user,
}: {
  user: Pick<AuthUser, "id" | "nama" | "username" | "email" | "role">;
}) {
  const { data, loading, loadError, isDemoAccount } = useAdminClaimProfile();
  const currentState = data?.currentState;
  const currentTone = currentState ? getCurrentStatusTone(currentState.status) : null;

  return (
    <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/30 to-sky-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700">
            <ShieldCheck size={13} />
            Akses Admin Desa
          </div>
          <h2 className="mt-3 text-base font-black text-slate-950">Kelola sumber dan dokumen desa lewat akses resmi.</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Jika kamu perwakilan desa, ajukan akses untuk mengelola informasi sumber dan dokumen desa.
          </p>
        </div>
        <DataStatusBadge status={getCurrentDataStatus(data)} size="xs" />
      </div>

      <div className="mt-4 rounded-2xl border border-white/70 bg-white/80 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status saat ini</p>
            {loading ? (
              <p className="mt-2 text-sm text-slate-500">Memuat status akses admin...</p>
            ) : loadError || !currentState ? (
              <p className="mt-2 text-sm text-slate-500">
                Status belum bisa dimuat sekarang. Kamu tetap bisa lanjut ke alur klaim atau hubungi kami.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm font-black text-slate-900">{currentTone?.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{currentTone?.note}</p>
              </>
            )}
          </div>
          {currentState ? <ClaimStatusBadge status={currentState.status} compact /> : null}
        </div>

        {currentState ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
              {currentState.desaName}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
              {currentState.roleLabel}
            </span>
            {isDemoAccount ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                Data contoh
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/profil/klaim-admin-desa"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
        >
          Klaim sebagai Admin Desa
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/hubungi-admin?source=%2Fprofil%2Fsaya"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
        >
          <LifeBuoy size={14} />
          Hubungi Admin
        </Link>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        {user.role === "DESA"
          ? "Role aplikasi DESA tetap perlu klaim resmi sebelum akses admin desa dibuka."
          : "Akses admin hanya dibuka lewat kanal resmi desa atau bantuan admin PantauDesa."}
      </p>
    </section>
  );
}

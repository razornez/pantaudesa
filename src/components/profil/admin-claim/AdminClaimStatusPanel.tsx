import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { DataStatusBadge } from "@/components/ui/DataStatusBadge";
import ClaimStatusBadge from "@/components/profil/admin-claim/ClaimStatusBadge";
import { getCurrentStatusTone } from "@/components/profil/admin-claim/adminClaimCopy";
import type {
  AdminClaimActiveClaim,
  AdminClaimActiveMember,
  AdminClaimStateCard,
} from "@/lib/data/admin-claim-read";

export default function AdminClaimStatusPanel({
  currentState,
  currentClaim,
  currentMember,
  showDemoLabel,
  selectedDesaName,
  onBack,
  onRestart,
}: {
  currentState: AdminClaimStateCard | null;
  currentClaim: AdminClaimActiveClaim | null;
  currentMember: AdminClaimActiveMember | null;
  showDemoLabel: boolean;
  selectedDesaName: string | null;
  onBack: () => void;
  onRestart: () => void;
}) {
  const tone = currentState ? getCurrentStatusTone(currentState.status) : null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-950">Lihat status</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Baca status klaimmu dengan tenang. Halaman ini hanya menampilkan status akun yang sedang tercatat.
        </p>
      </div>

      {currentState ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status akun</p>
              <p className="mt-1 text-lg font-black text-slate-950">{tone?.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{tone?.note}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ClaimStatusBadge status={currentState.status} />
              {showDemoLabel ? (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                  Data contoh
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
              {currentState.desaName}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
              {currentState.roleLabel}
            </span>
            {currentState.methodLabel ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                {currentState.methodLabel}
              </span>
            ) : null}
            <DataStatusBadge status={currentState.dataStatus} size="xs" />
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Catatan</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{currentState.note}</p>
            {currentClaim?.status === "PENDING" ? (
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Klaim aktif: {currentClaim.desaName}. Lanjutkan verifikasi dari langkah instruksi jika email belum masuk atau token website belum dicek.
              </p>
            ) : null}
            {currentMember?.status === "VERIFIED" ? (
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Hanya status admin desa yang terverifikasi. Data publik desa tetap mengikuti workflow review tersendiri.
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
          Status akun belum bisa dimuat saat ini.
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={14} />
          Kembali
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
        >
          <RefreshCcw size={14} />
          Ubah pilihan desa
        </button>
        <Link
          href="#hubungi-admin"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
        >
          Hubungi Admin
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-black text-slate-900">Butuh lihat profil lagi?</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Kamu bisa kembali ke profil untuk mengecek identitas akun atau status akses yang ringkas.
        </p>
        {currentState?.status === "verified" && selectedDesaName ? (
          <p className="mt-2 text-xs leading-relaxed text-emerald-700">
            Status untuk {selectedDesaName} sudah siap dipakai untuk alur admin desa lanjutan, termasuk undang admin bila kamu berstatus VERIFIED.
          </p>
        ) : null}
        <Link
          href="/profil/saya"
          className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
        >
          Kembali ke profil saya
        </Link>
      </div>
    </div>
  );
}

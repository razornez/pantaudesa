"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck, BadgeCheck, AlertTriangle } from "lucide-react";
import type { RenewalState } from "@/lib/admin-claim/renewal";

interface Props {
  status: "LIMITED" | "VERIFIED" | "REVOKED" | "EXPIRED";
  role: "LIMITED_ADMIN" | "VERIFIED_ADMIN";
  desaName: string;
  renewalDueAt: string | null;
  renewalState: RenewalState;
  daysUntilRenewal: number | null;
  avatarUrl: string | null;
  displayName: string;
}

export default function AdminDesaBadge({
  status,
  desaName,
  renewalDueAt,
  renewalState,
  daysUntilRenewal,
  avatarUrl,
  displayName,
}: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isVerified = status === "VERIFIED";
  const badgeColor = isVerified ? "bg-emerald-500" : "bg-amber-500";
  const badgeIcon = isVerified ? <ShieldCheck size={11} className="text-white" /> : <BadgeCheck size={11} className="text-white" />;

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Status Admin Desa: ${status}. Klik untuk detail.`}
        className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold text-sm">
            {displayName.slice(0, 2).toUpperCase()}
          </span>
        )}
        {/* Status badge — bottom-right */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${badgeColor} flex items-center justify-center border-2 border-white`}
          aria-hidden="true"
        >
          {badgeIcon}
        </span>
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Status Admin Desa"
          className="absolute left-0 sm:left-auto sm:right-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 space-y-3"
        >
          <div className="flex items-start gap-3">
            <span className={`${badgeColor} text-white rounded-full p-1.5 shrink-0`}>
              {isVerified ? <ShieldCheck size={16} /> : <BadgeCheck size={16} />}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm">
                Admin Desa {status}
              </p>
              <p className="text-xs text-slate-500 truncate">{desaName}</p>
            </div>
          </div>

          {isVerified ? (
            <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <li>✓ Dapat publish/update data desa setelah dokumen lolos review.</li>
              <li>✓ Dapat mengundang Admin Desa LIMITED.</li>
              <li>✓ Wajib memperpanjang verifikasi tiap 6 bulan.</li>
              <li>✗ Tidak dapat akses panel internal admin PantauDesa.</li>
            </ul>
          ) : (
            <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <li>✓ Diundang oleh Admin Desa VERIFIED.</li>
              <li>✓ Dapat lihat dan upload dokumen kontribusi.</li>
              <li>✗ Tidak dapat publish data desa.</li>
              <li>✗ Tidak dapat mengundang admin lain.</li>
            </ul>
          )}

          {/* Renewal indicator */}
          {isVerified && renewalDueAt && (
            <div
              className={`text-xs rounded-lg px-3 py-2 flex items-start gap-2 ${
                renewalState === "OVERDUE"
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : renewalState === "URGENT"
                  ? "bg-orange-50 border border-orange-200 text-orange-800"
                  : renewalState === "DUE_SOON"
                  ? "bg-amber-50 border border-amber-200 text-amber-800"
                  : "bg-slate-50 border border-slate-200 text-slate-600"
              }`}
            >
              {renewalState !== "OK" && <AlertTriangle size={14} className="shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className="font-medium">
                  {renewalState === "OVERDUE"
                    ? "Perpanjangan terlambat"
                    : renewalState === "URGENT"
                    ? "Segera perpanjang"
                    : renewalState === "DUE_SOON"
                    ? "Perpanjangan akan jatuh tempo"
                    : "Perpanjangan terjadwal"}
                </p>
                <p className="opacity-90">
                  {new Date(renewalDueAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
                  {daysUntilRenewal !== null && (
                    <> ({daysUntilRenewal >= 0 ? `${daysUntilRenewal} hari lagi` : `lewat ${Math.abs(daysUntilRenewal)} hari`})</>
                  )}
                </p>
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
            Status Admin Desa berbeda dari status data publik desa. Verifikasi admin tidak otomatis berarti data publik terverifikasi.
          </p>
        </div>
      )}
    </div>
  );
}

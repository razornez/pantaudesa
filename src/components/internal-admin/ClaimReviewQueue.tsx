"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ClaimRow = {
  id: string;
  status: string;
  method: string | null;
  officialEmail: string | null;
  websiteUrl: string | null;
  verifiedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  rejectCategory: string | null;
  rejectReason: string | null;
  rejectInstructions: string | null;
  reapplyAllowedAt: string | null;
  fraudCooldownUntil: string | null;
  supportSubmittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  desa: {
    id: string;
    nama: string;
    kecamatan: string;
    kabupaten: string;
    websiteUrl: string | null;
  };
  user: {
    id: string;
    nama: string | null;
    username: string | null;
    email: string;
  };
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800",
  IN_REVIEW: "bg-blue-100 text-blue-800",
  REJECTED:  "bg-red-100 text-red-800",
  APPROVED:  "bg-green-100 text-green-800",
};

const REASON_CATEGORIES = [
  { value: "WEBSITE_NOT_OFFICIAL",     label: "Website tidak resmi" },
  { value: "WEBSITE_MISMATCH",         label: "Website tidak cocok" },
  { value: "TOKEN_NOT_VALID",          label: "Token tidak valid" },
  { value: "EMAIL_NOT_CONVINCING",     label: "Email tidak meyakinkan" },
  { value: "DOCUMENT_NOT_SUFFICIENT",  label: "Dokumen tidak cukup" },
  { value: "SOURCE_CONFLICT",          label: "Konflik sumber data" },
  { value: "SUSPICIOUS_ACTIVITY",      label: "Aktivitas mencurigakan" },
  { value: "RENEWAL_FAILED",           label: "Perpanjangan gagal" },
  { value: "OTHER",                    label: "Lainnya" },
];

function RejectModal({
  claimId,
  desaName,
  userEmail,
  onClose,
  onDone,
}: {
  claimId: string;
  desaName: string;
  userEmail: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reasonCategory, setReasonCategory] = useState("EMAIL_NOT_CONVINCING");
  const [reasonText, setReasonText] = useState("");
  const [fixInstructions, setFixInstructions] = useState("");
  const [isFraud, setIsFraud] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reasonText.trim() || !fixInstructions.trim()) {
      setError("Alasan dan instruksi wajib diisi.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/internal-admin/claims/${claimId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reasonCategory, reasonText, fixInstructions, isFraud }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menolak klaim.");
        return;
      }
      onDone();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Tolak Klaim Admin Desa</h2>
        <p className="text-sm text-slate-600">
          <span className="font-medium">{desaName}</span> — {userEmail}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kategori penolakan <span className="text-red-500">*</span>
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              required
            >
              {REASON_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Alasan penolakan (ditampilkan ke pengaju) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Jelaskan mengapa klaim tidak bisa diterima..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm min-h-[80px]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Instruksi perbaikan (ditampilkan ke pengaju) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={fixInstructions}
              onChange={(e) => setFixInstructions(e.target.value)}
              placeholder="Apa yang perlu diperbaiki sebelum mengajukan ulang..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm min-h-[80px]"
              required
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFraud}
              onChange={(e) => setIsFraud(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-red-700 font-medium">
              Fraud/aktivitas mencurigakan — terapkan masa tunggu 3 hari
            </span>
          </label>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Tolak Klaim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClaimCard({ claim, onAction }: { claim: ClaimRow; onAction: () => void }) {
  const [approving, setApproving] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setApproving(true);
    setError(null);
    try {
      const res = await fetch(`/api/internal-admin/claims/${claim.id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyetujui klaim.");
        return;
      }
      onAction();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setApproving(false);
    }
  }

  const displayName = claim.user.nama ?? claim.user.username ?? claim.user.email;
  const statusColor = STATUS_COLORS[claim.status] ?? "bg-slate-100 text-slate-800";

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="font-medium text-slate-900 truncate">{claim.desa.nama}</p>
            <p className="text-sm text-slate-500">{claim.desa.kecamatan}, {claim.desa.kabupaten}</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${statusColor}`}>
            {claim.status}
          </span>
        </div>

        <div className="text-sm text-slate-700 space-y-1">
          <p><span className="text-slate-400">Pengaju:</span> {displayName} ({claim.user.email})</p>
          <p><span className="text-slate-400">Metode:</span> {claim.method ?? "—"}</p>
          {claim.officialEmail && (
            <p><span className="text-slate-400">Email desa:</span> {claim.officialEmail}</p>
          )}
          {claim.websiteUrl && (
            <p>
              <span className="text-slate-400">Website:</span>{" "}
              <a
                href={claim.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline truncate"
              >
                {claim.websiteUrl}
              </a>
            </p>
          )}
          {claim.supportSubmittedAt && (
            <div className={`mt-1 rounded-md px-2 py-1 text-xs ${
              claim.status === "REJECTED"
                ? "bg-amber-50 border border-amber-200 text-amber-800"
                : "bg-indigo-50 border border-indigo-200 text-indigo-800"
            }`}>
              <p className="font-medium">
                📝 {claim.status === "REJECTED" ? "Bukti tambahan masuk (perlu review ulang)" : "Bukti pengajuan diterima"}
              </p>
              <p className="text-[11px] opacity-80">
                {new Date(claim.supportSubmittedAt).toLocaleString("id-ID")}
              </p>
            </div>
          )}
          {claim.verifiedAt && (
            <p className="text-xs text-slate-400">Diverifikasi: {new Date(claim.verifiedAt).toLocaleString("id-ID")}</p>
          )}
          <p className="text-xs text-slate-400">
            Diperbarui: {new Date(claim.updatedAt).toLocaleString("id-ID")}
          </p>
        </div>

        {claim.status === "REJECTED" && (
          <div className="text-sm bg-red-50 rounded-lg p-3 space-y-1">
            {claim.rejectCategory && (
              <p className="text-red-700 font-medium text-xs">{claim.rejectCategory}</p>
            )}
            {claim.rejectReason && <p className="text-red-800">{claim.rejectReason}</p>}
            {claim.rejectInstructions && (
              <p className="text-slate-600 text-xs">{claim.rejectInstructions}</p>
            )}
            {claim.fraudCooldownUntil && (
              <p className="text-red-600 text-xs font-medium">
                Fraud cooldown: {new Date(claim.fraudCooldownUntil).toLocaleString("id-ID")}
              </p>
            )}
            {claim.reapplyAllowedAt && (
              <p className="text-slate-500 text-xs">
                Reapply tersedia: {new Date(claim.reapplyAllowedAt).toLocaleString("id-ID")}
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {claim.status === "IN_REVIEW" && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleApprove}
              disabled={approving}
              className="flex-1 bg-green-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {approving ? "Memproses..." : "Setujui → VERIFIED"}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="flex-1 border border-red-300 text-red-700 text-sm font-medium rounded-lg px-4 py-2 hover:bg-red-50 transition-colors"
            >
              Tolak
            </button>
          </div>
        )}

        {claim.status === "PENDING" && (
          <button
            onClick={() => setShowRejectModal(true)}
            className="w-full border border-red-300 text-red-700 text-sm font-medium rounded-lg px-4 py-2 hover:bg-red-50 transition-colors"
          >
            Tolak (PENDING)
          </button>
        )}
      </div>

      {showRejectModal && (
        <RejectModal
          claimId={claim.id}
          desaName={claim.desa.nama}
          userEmail={claim.user.email}
          onClose={() => setShowRejectModal(false)}
          onDone={() => {
            setShowRejectModal(false);
            onAction();
          }}
        />
      )}
    </>
  );
}

export default function ClaimReviewQueue({
  claims,
  total,
  page,
  pageSize,
  statusFilter,
}: {
  claims: ClaimRow[];
  total: number;
  page: number;
  pageSize: number;
  statusFilter: string;
}) {
  const router = useRouter();

  function refresh() {
    router.refresh();
  }

  const totalPages = Math.ceil(total / pageSize);

  const STATUS_TABS = [
    { value: "", label: "Semua" },
    { value: "PENDING", label: "Pending" },
    { value: "IN_REVIEW", label: "In Review" },
    { value: "REJECTED", label: "Ditolak" },
    { value: "APPROVED", label: "Disetujui" },
  ];

  function buildUrl(params: Record<string, string>) {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
      else url.searchParams.delete(k);
    });
    return url.pathname + url.search;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Admin Desa — Review Queue</h1>
        <span className="text-sm text-slate-500">{total} klaim</span>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab.value}
            href={buildUrl({ status: tab.value, page: "1" })}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              statusFilter === tab.value
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Tidak ada klaim dengan status ini.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {claims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} onAction={refresh} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={buildUrl({ page: String(p) })}
              className={`w-8 h-8 text-sm flex items-center justify-center rounded-lg border transition-colors ${
                p === page
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

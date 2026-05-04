"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, CheckCircle2 } from "lucide-react";
import { ToastContainer, useToast, type ToastType } from "@/components/ui/Toast";

type RenewalRow = {
  id: string;
  userId: string;
  desaId: string;
  status: string;
  renewalDueAt: string | null;
  joinedAt: string;
  renewalState: "OK" | "DUE_SOON" | "URGENT" | "OVERDUE" | "NO_DUE_DATE";
  daysUntilRenewal: number | null;
  desa: { id: string; nama: string; kecamatan: string; kabupaten: string };
  user: { id: string; nama: string | null; username: string | null; email: string };
};

const FILTERS = [
  { value: "ALL", label: "Semua" },
  { value: "DUE_SOON", label: "Segera jatuh tempo" },
  { value: "OVERDUE", label: "Sudah lewat" },
] as const;

const RENEWAL_COPY: Record<RenewalRow["renewalState"], { label: string; pill: string; note: string }> = {
  OK: { label: "Masih aman", pill: "pill-info", note: "Belum butuh tindakan segera." },
  DUE_SOON: { label: "Perlu disiapkan", pill: "pill-warn", note: "Masa aktif mendekati batas perpanjangan." },
  URGENT: { label: "Segera diputuskan", pill: "pill-danger", note: "Sisa waktu sangat mepet dan perlu keputusan cepat." },
  OVERDUE: { label: "Sudah lewat batas", pill: "pill-danger", note: "Akses berisiko berakhir jika tidak diputuskan." },
  NO_DUE_DATE: { label: "Belum terjadwal", pill: "pill-info", note: "Tanggal perpanjangan belum tercatat." },
};

function buildUrl(state: string) {
  const url = new URL(window.location.href);
  if (state && state !== "ALL") url.searchParams.set("state", state);
  else url.searchParams.delete("state");
  return url.pathname + url.search;
}

function DecisionModal({
  target,
  mode,
  onClose,
  onDone,
  onNotify,
}: {
  target: RenewalRow;
  mode: "approve" | "reject";
  onClose: () => void;
  onDone: () => void;
  onNotify: (message: string, type?: ToastType) => void;
}) {
  const [reason, setReason] = useState("");
  const [suspicious, setSuspicious] = useState(false);
  const [loading, setLoading] = useState(false);
  const isApprove = mode === "approve";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isApprove && !reason.trim()) {
      onNotify("Alasan penolakan wajib diisi agar pengguna tahu tindak lanjutnya.", "error");
      return;
    }
    setLoading(true);
    try {
      const endpoint = isApprove
        ? `/api/internal-admin/members/${target.id}/renewal/approve`
        : `/api/internal-admin/members/${target.id}/renewal/reject`;
      const body = isApprove ? undefined : JSON.stringify({ reason: reason.trim(), suspicious });
      const res = await fetch(endpoint, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error ?? "Aksi perpanjangan belum berhasil diproses.", "error");
        return;
      }
      onNotify(
        isApprove
          ? "Masa aktif admin berhasil diperpanjang dan notifikasi sudah dikirim."
          : "Akses admin ditandai berakhir. Pengguna akan menerima penjelasan lewat notifikasi.",
        "success",
      );
      onDone();
    } catch {
      onNotify("Koneksi bermasalah. Coba lagi beberapa saat.", "error");
    } finally {
      setLoading(false);
    }
  }

  const actorName = target.user.nama ?? target.user.username ?? target.user.email;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="lux-panel max-w-lg w-full p-5 sm:p-6 space-y-5">
        <div className="space-y-2">
          <p className="eyebrow text-[10px]">{isApprove ? "Setujui perpanjangan" : "Tolak perpanjangan"}</p>
          <h2 className="text-[20px] font-semibold text-slate-900 tracking-tight">
            {target.desa.nama}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {actorName} • {target.user.email}
          </p>
        </div>

        <div className={`notice-card ${isApprove ? "notice-ok" : "notice-danger"} text-sm leading-relaxed`}>
          {isApprove ? (
            <>
              Keputusan ini akan memperpanjang masa aktif admin untuk 6 bulan ke depan dan mencatat perubahan ke audit.
            </>
          ) : (
            <>
              Keputusan ini akan mengakhiri akses admin desa. Riwayat audit tetap tersimpan, tetapi status pengguna berubah menjadi berakhir.
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isApprove && (
            <>
              <div>
                <label className="field-label">Alasan penolakan</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Jelaskan apa yang belum sesuai dan apa yang perlu dilakukan pengguna."
                  className="textarea-lux"
                  required
                />
              </div>

              <label className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)] text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={suspicious}
                  onChange={(e) => setSuspicious(e.target.checked)}
                  className="mt-1 accent-[#1E1B4B]"
                />
                <span className="text-slate-700 leading-relaxed">
                  Tandai sebagai perlu perhatian khusus bila ada pola yang meragukan dan butuh pemeriksaan lanjutan.
                </span>
              </label>
            </>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-lux btn-lux-secondary flex-1">
              Batal
            </button>
            <button type="submit" disabled={loading} className={`btn-lux ${isApprove ? "btn-lux-success" : "btn-lux-danger"} flex-1`}>
              {loading ? "Memproses..." : isApprove ? "Setujui perpanjangan" : "Akhiri akses"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RenewalCard({
  item,
  onApprove,
  onReject,
}: {
  item: RenewalRow;
  onApprove: (target: RenewalRow) => void;
  onReject: (target: RenewalRow) => void;
}) {
  const copy = RENEWAL_COPY[item.renewalState];
  const name = item.user.nama ?? item.user.username ?? item.user.email;

  return (
    <article className="lux-card t-spring lift hover:shadow-lux-hover p-5 sm:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-semibold text-slate-900 text-[16px] tracking-tight leading-snug">{item.desa.nama}</p>
          <p className="text-sm text-slate-500">{item.desa.kecamatan}, {item.desa.kabupaten}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold shrink-0 ${copy.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${item.renewalState === "OVERDUE" || item.renewalState === "URGENT" ? "bg-rose-500" : "bg-amber-500"}`} aria-hidden />
          {copy.label}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        <div className="metric-card">
          <p className="metric-label">Admin desa</p>
          <p className="mt-2 text-slate-900 font-medium">{name}</p>
          <p className="metric-note">{item.user.email}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Jatuh tempo</p>
          <p className="mt-2 text-slate-900 font-medium">
            {item.renewalDueAt
              ? new Date(item.renewalDueAt).toLocaleDateString("id-ID", { dateStyle: "long" })
              : "Belum ada jadwal"}
          </p>
          <p className="metric-note">
            {item.daysUntilRenewal === null
              ? "Tanggal belum tersedia"
              : item.daysUntilRenewal >= 0
                ? `${item.daysUntilRenewal} hari lagi`
                : `Lewat ${Math.abs(item.daysUntilRenewal)} hari`}
          </p>
        </div>
      </div>

      <div className="notice-card notice-info text-sm leading-relaxed">
        <p className="font-semibold">Catatan review</p>
        <p className="mt-2 opacity-90">{copy.note}</p>
      </div>

      <div className="surface-divider pt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => onApprove(item)} className="btn-lux btn-lux-success !min-h-[40px] text-xs">
          <CheckCircle2 size={13} aria-hidden /> Setujui
        </button>
        <button type="button" onClick={() => onReject(item)} className="btn-lux btn-lux-danger !min-h-[40px] text-xs">
          <AlertTriangle size={13} aria-hidden /> Tolak
        </button>
      </div>
    </article>
  );
}

export default function InternalRenewalQueue({
  members,
  stateFilter,
}: {
  members: RenewalRow[];
  stateFilter: string;
}) {
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const [approveTarget, setApproveTarget] = useState<RenewalRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RenewalRow | null>(null);

  const summary = useMemo(() => {
    return members.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.renewalState === "OVERDUE") acc.overdue += 1;
        if (item.renewalState === "URGENT" || item.renewalState === "DUE_SOON") acc.soon += 1;
        return acc;
      },
      { total: 0, overdue: 0, soon: 0 },
    );
  }, [members]);

  const refresh = () => router.refresh();

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="eyebrow text-[10px]">Perpanjangan admin desa</p>
          <h1 className="display text-[30px] sm:text-[34px] font-semibold text-slate-900 tracking-tight leading-tight">
            Masa aktif yang perlu diputuskan
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Pantau admin desa yang mendekati jatuh tempo, lalu putuskan apakah masa aktifnya diperpanjang atau diakhiri.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="pill-info rounded-full px-3 py-1 text-[11px] font-semibold">{summary.total} kasus</span>
          {summary.soon > 0 && <span className="pill-warn rounded-full px-3 py-1 text-[11px] font-semibold">{summary.soon} perlu disiapkan</span>}
          {summary.overdue > 0 && <span className="pill-danger rounded-full px-3 py-1 text-[11px] font-semibold">{summary.overdue} lewat batas</span>}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="metric-card">
          <p className="metric-label">Total review</p>
          <p className="metric-value">{summary.total}</p>
          <p className="metric-note">anggota terdeteksi</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Perlu disiapkan</p>
          <p className="metric-value">{summary.soon}</p>
          <p className="metric-note">jatuh tempo dekat</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Lewat batas</p>
          <p className="metric-value">{summary.overdue}</p>
          <p className="metric-note">butuh keputusan cepat</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <a
            key={filter.value}
            href={buildUrl(filter.value)}
            className={`btn-lux ${stateFilter === filter.value || (filter.value === "ALL" && !stateFilter) ? "btn-lux-primary" : "btn-lux-ghost"} !min-h-[40px] text-xs`}
          >
            {filter.label}
          </a>
        ))}
      </div>

      {members.length === 0 ? (
        <div className="lux-card p-10 text-center space-y-3">
          <CalendarClock size={28} className="mx-auto text-slate-300" aria-hidden />
          <p className="text-sm text-slate-500">Tidak ada perpanjangan yang perlu ditinjau pada filter ini.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {members.map((item) => (
            <RenewalCard key={item.id} item={item} onApprove={setApproveTarget} onReject={setRejectTarget} />
          ))}
        </div>
      )}

      {approveTarget && (
        <DecisionModal
          target={approveTarget}
          mode="approve"
          onNotify={toast}
          onClose={() => setApproveTarget(null)}
          onDone={() => {
            setApproveTarget(null);
            refresh();
          }}
        />
      )}
      {rejectTarget && (
        <DecisionModal
          target={rejectTarget}
          mode="reject"
          onNotify={toast}
          onClose={() => setRejectTarget(null)}
          onDone={() => {
            setRejectTarget(null);
            refresh();
          }}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

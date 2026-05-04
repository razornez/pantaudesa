"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  FileText,
  Sparkles,
} from "lucide-react";
import { AI_MAPPABLE_DESA_FIELDS } from "@/lib/admin-claim/ai-mapping";
import { ToastContainer, useToast, type ToastType } from "@/components/ui/Toast";

type DocStatus = "WAITING_VERIFIED_APPROVAL" | "PROCESSING" | "PUBLISHED" | "FAILED";

interface DocRow {
  id: string;
  title: string;
  category: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: DocStatus;
  approvedAt: string | null;
  publishedAt: string | null;
  failedReason: string | null;
  aiMappingStatus: string | null;
  aiMappingResult: unknown;
  createdAt: string;
  updatedAt: string;
  desa: { id: string; nama: string; kecamatan: string; kabupaten: string };
  uploadedBy: { id: string; nama: string | null; username: string | null; email: string } | null;
}

const STATUS_META: Record<DocStatus, { label: string; pill: string; note: string }> = {
  WAITING_VERIFIED_APPROVAL: {
    label: "Menunggu persetujuan admin utama",
    pill: "pill-warn",
    note: "Dokumen baru tercatat tetapi masih menunggu persetujuan admin desa utama.",
  },
  PROCESSING: {
    label: "Sedang diproses PantauDesa",
    pill: "pill-info",
    note: "Dokumen siap dibaca, dipetakan, dan diputuskan untuk dipublikasikan atau ditolak.",
  },
  PUBLISHED: {
    label: "Sudah dipublikasikan",
    pill: "pill-ok",
    note: "Data hasil dokumen sudah diterapkan ke desa dan terekam di audit.",
  },
  FAILED: {
    label: "Gagal diproses",
    pill: "pill-danger",
    note: "Dokumen tidak bisa dipakai dan alasan kegagalannya perlu jelas untuk pengunggah.",
  },
};

const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "WAITING_VERIFIED_APPROVAL", label: "Menunggu admin utama" },
  { value: "PROCESSING", label: "Diproses PantauDesa" },
  { value: "PUBLISHED", label: "Sudah tayang" },
  { value: "FAILED", label: "Gagal diproses" },
] as const;

function buildUrl(params: Record<string, string>) {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => {
    if (v) url.searchParams.set(k, v);
    else url.searchParams.delete(k);
  });
  return url.pathname + url.search;
}

function PublishModal({
  doc,
  onClose,
  onDone,
  onNotify,
}: {
  doc: DocRow;
  onClose: () => void;
  onDone: () => void;
  onNotify: (message: string, type?: ToastType) => void;
}) {
  const initialDraft =
    doc.aiMappingResult && typeof doc.aiMappingResult === "object"
      ? (doc.aiMappingResult as { fields?: Record<string, string | number | null> })
      : null;

  const [fields, setFields] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const key of AI_MAPPABLE_DESA_FIELDS) {
      const value = initialDraft?.fields?.[key];
      out[key] = value === null || value === undefined ? "" : String(value);
    }
    return out;
  });
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    try {
      const payloadFields: Record<string, string | number | null> = {};
      for (const key of AI_MAPPABLE_DESA_FIELDS) {
        const value = fields[key]?.trim();
        if (!value) continue;
        if (key === "tahunData" || key === "jumlahPenduduk") {
          const numeric = Number(value);
          if (!Number.isFinite(numeric)) {
            onNotify(`Field ${key} harus berupa angka.`, "error");
            setLoading(false);
            return;
          }
          payloadFields[key] = numeric;
        } else {
          payloadFields[key] = value;
        }
      }

      const res = await fetch(`/api/internal-admin/documents/${doc.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: payloadFields, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error ?? "Dokumen belum berhasil dipublikasikan.", "error");
        return;
      }
      onNotify("Dokumen berhasil dipublikasikan dan perubahan desa sudah diterapkan.", "success");
      onDone();
    } catch {
      onNotify("Koneksi bermasalah. Coba lagi beberapa saat.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="lux-panel max-w-lg w-full p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="space-y-2">
          <p className="eyebrow text-[10px]">Publikasikan dokumen</p>
          <h2 className="text-[20px] font-semibold text-slate-900 tracking-tight">{doc.title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{doc.desa.nama}</p>
        </div>

        <div className="notice-card notice-warn text-sm leading-relaxed">
          Draft ini hanya memetakan field aman seperti profil desa, kontak, alamat, website, dan data ringkas lainnya. Field kosong tidak akan mengubah data publik.
        </div>

        <div className="space-y-3 text-sm">
          {AI_MAPPABLE_DESA_FIELDS.map((key) => (
            <div key={key}>
              <label className="field-label">{key}</label>
              <input
                type="text"
                value={fields[key]}
                onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder="Kosongkan jika tidak ingin mengubah field ini"
                className="field-lux"
              />
            </div>
          ))}

          <div>
            <label className="field-label">Catatan publish</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              className="textarea-lux"
              placeholder="Catatan singkat untuk audit internal."
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-lux btn-lux-secondary flex-1">
            Batal
          </button>
          <button type="button" onClick={handlePublish} disabled={loading} className="btn-lux btn-lux-success flex-1">
            {loading ? "Mempublikasikan..." : "Publikasikan sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MarkFailedModal({
  doc,
  onClose,
  onDone,
  onNotify,
}: {
  doc: DocRow;
  onClose: () => void;
  onDone: () => void;
  onNotify: (message: string, type?: ToastType) => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      onNotify("Alasan kegagalan wajib diisi agar pengunggah tahu yang perlu dibenahi.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/internal-admin/documents/${doc.id}/mark-failed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error ?? "Dokumen belum berhasil ditandai gagal.", "error");
        return;
      }
      onNotify("Dokumen ditandai gagal diproses dan alasan sudah tersimpan.", "success");
      onDone();
    } catch {
      onNotify("Koneksi bermasalah. Coba lagi beberapa saat.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="lux-panel max-w-md w-full p-5 sm:p-6 space-y-5">
        <div className="space-y-2">
          <p className="eyebrow text-[10px]">Tandai gagal diproses</p>
          <h2 className="text-[20px] font-semibold text-slate-900 tracking-tight">{doc.title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{doc.desa.nama}</p>
        </div>

        <div className="notice-card notice-danger text-sm leading-relaxed">
          Status ini memberi tahu pengunggah bahwa dokumen belum bisa dipakai. Jelaskan alasan dengan bahasa yang membantu mereka memperbaiki unggahan berikutnya.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Alasan yang terlihat oleh pengunggah</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Contoh: dokumen buram, lampiran tidak sesuai, atau informasi belum cukup."
              className="textarea-lux"
              required
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-lux btn-lux-secondary flex-1">
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn-lux btn-lux-danger flex-1">
              {loading ? "Menyimpan..." : "Tandai gagal diproses"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocCard({
  doc,
  onRefresh,
  onPublish,
  onMarkFailed,
  onNotify,
}: {
  doc: DocRow;
  onRefresh: () => void;
  onPublish: (doc: DocRow) => void;
  onMarkFailed: (doc: DocRow) => void;
  onNotify: (message: string, type?: ToastType) => void;
}) {
  const [busy, setBusy] = useState(false);
  const uploaderName = doc.uploadedBy?.nama ?? doc.uploadedBy?.username ?? doc.uploadedBy?.email ?? "—";
  const status = STATUS_META[doc.status];

  async function runDraftMapping() {
    setBusy(true);
    try {
      const res = await fetch(`/api/internal-admin/documents/${doc.id}/draft-mapping`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error ?? "Draft mapping belum berhasil dibuat.", "error");
        return;
      }
      onNotify("Draft mapping berhasil dibuat. Silakan cek dan publikasikan bila sudah sesuai.", "success");
      onRefresh();
    } catch {
      onNotify("Koneksi bermasalah. Coba lagi beberapa saat.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function openPreview() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin-claim/documents/${doc.id}/preview`);
      const data = await res.json();
      if (!res.ok || !data.signedUrl) {
        onNotify(data.error ?? "Preview dokumen belum bisa dibuka.", "error");
        return;
      }
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      onNotify("Koneksi bermasalah. Coba lagi beberapa saat.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="lux-card t-spring lift hover:shadow-lux-hover p-5 sm:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold text-slate-900 text-[16px] tracking-tight leading-snug">{doc.title}</p>
          <p className="text-sm text-slate-500">{doc.desa.nama} • {doc.desa.kecamatan}, {doc.desa.kabupaten}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold shrink-0 ${status.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${doc.status === "PUBLISHED" ? "bg-emerald-500" : doc.status === "FAILED" ? "bg-rose-500" : doc.status === "PROCESSING" ? "bg-indigo-500" : "bg-amber-500"}`} aria-hidden />
          {status.label}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        <div className="metric-card">
          <p className="metric-label">File</p>
          <p className="mt-2 text-slate-900 font-medium">{doc.fileName}</p>
          <p className="metric-note">{doc.fileType} • {formatBytes(doc.fileSize)}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Pengunggah</p>
          <p className="mt-2 text-slate-900 font-medium">{uploaderName}</p>
          <p className="metric-note">Diunggah {new Date(doc.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</p>
        </div>
      </div>

      <div className="notice-card notice-info text-sm leading-relaxed">
        <p className="font-semibold">Catatan status</p>
        <p className="mt-2 opacity-90">{status.note}</p>
      </div>

      {doc.aiMappingStatus && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="pill-info rounded-full px-3 py-1 font-semibold">Draft mapping: {doc.aiMappingStatus}</span>
          {doc.publishedAt && <span>Dipublikasikan {new Date(doc.publishedAt).toLocaleDateString("id-ID")}</span>}
        </div>
      )}

      {doc.status === "FAILED" && doc.failedReason && (
        <div className="notice-card notice-danger text-sm leading-relaxed">
          <p className="font-semibold">Alasan kegagalan</p>
          <p className="mt-2 opacity-90">{doc.failedReason}</p>
        </div>
      )}

      <div className="surface-divider pt-4 flex flex-wrap gap-2">
        <button type="button" onClick={openPreview} disabled={busy} className="btn-lux btn-lux-ghost !min-h-[40px] text-xs">
          <ExternalLink size={13} aria-hidden /> Buka preview
        </button>
        {doc.status === "PROCESSING" && (
          <>
            <button type="button" onClick={runDraftMapping} disabled={busy} className="btn-lux btn-lux-secondary !min-h-[40px] text-xs">
              <Sparkles size={13} aria-hidden /> Buat draft mapping
            </button>
            <button type="button" onClick={() => onPublish(doc)} disabled={busy} className="btn-lux btn-lux-success !min-h-[40px] text-xs">
              <Check size={13} aria-hidden /> Publikasikan
            </button>
            <button type="button" onClick={() => onMarkFailed(doc)} disabled={busy} className="btn-lux btn-lux-danger !min-h-[40px] text-xs">
              <AlertTriangle size={13} aria-hidden /> Tandai gagal
            </button>
          </>
        )}
        {doc.status === "WAITING_VERIFIED_APPROVAL" && (
          <button type="button" onClick={() => onMarkFailed(doc)} disabled={busy} className="btn-lux btn-lux-danger !min-h-[40px] text-xs">
            <AlertTriangle size={13} aria-hidden /> Tandai gagal
          </button>
        )}
      </div>
    </article>
  );
}

export default function InternalDocumentReviewQueue({
  documents,
  statusFilter,
}: {
  documents: DocRow[];
  statusFilter: string;
}) {
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const [publishTarget, setPublishTarget] = useState<DocRow | null>(null);
  const [failTarget, setFailTarget] = useState<DocRow | null>(null);

  const summary = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        acc.total += 1;
        if (doc.status === "WAITING_VERIFIED_APPROVAL") acc.waiting += 1;
        if (doc.status === "PROCESSING") acc.processing += 1;
        if (doc.status === "PUBLISHED") acc.published += 1;
        if (doc.status === "FAILED") acc.failed += 1;
        return acc;
      },
      { total: 0, waiting: 0, processing: 0, published: 0, failed: 0 },
    );
  }, [documents]);

  const refresh = () => router.refresh();

  return (
    <div className="space-y-7" data-testid="internal-documents-queue">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="eyebrow text-[10px]">Review dokumen desa</p>
          <h1 className="display text-[30px] sm:text-[34px] font-semibold text-slate-900 tracking-tight leading-tight">
            Antrean dokumen yang menunggu keputusan
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Baca dokumen, cek preview, susun draft mapping bila perlu, lalu putuskan apakah data layak dipublikasikan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="pill-info rounded-full px-3 py-1 text-[11px] font-semibold">{summary.total} dokumen</span>
          {summary.processing > 0 && <span className="pill-warn rounded-full px-3 py-1 text-[11px] font-semibold">{summary.processing} diproses</span>}
          {summary.failed > 0 && <span className="pill-danger rounded-full px-3 py-1 text-[11px] font-semibold">{summary.failed} gagal</span>}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="metric-card">
          <p className="metric-label">Total dokumen</p>
          <p className="metric-value">{summary.total}</p>
          <p className="metric-note">dalam filter aktif</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Menunggu admin utama</p>
          <p className="metric-value">{summary.waiting}</p>
          <p className="metric-note">belum masuk review internal</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Diproses PantauDesa</p>
          <p className="metric-value">{summary.processing}</p>
          <p className="metric-note">siap dipetakan</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Sudah tayang</p>
          <p className="metric-value">{summary.published}</p>
          <p className="metric-note">sudah masuk data desa</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab.value}
            href={buildUrl({ status: tab.value })}
            className={`btn-lux ${statusFilter === tab.value ? "btn-lux-primary" : "btn-lux-ghost"} !min-h-[40px] text-xs`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {documents.length === 0 ? (
        <div className="lux-card p-10 text-center space-y-3">
          <FileText size={28} className="mx-auto text-slate-300" aria-hidden />
          <p className="text-sm text-slate-500">Tidak ada dokumen pada filter ini.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {documents.map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              onRefresh={refresh}
              onPublish={setPublishTarget}
              onMarkFailed={setFailTarget}
              onNotify={toast}
            />
          ))}
        </div>
      )}

      {publishTarget && (
        <PublishModal
          doc={publishTarget}
          onNotify={toast}
          onClose={() => setPublishTarget(null)}
          onDone={() => {
            setPublishTarget(null);
            refresh();
          }}
        />
      )}
      {failTarget && (
        <MarkFailedModal
          doc={failTarget}
          onNotify={toast}
          onClose={() => setFailTarget(null)}
          onDone={() => {
            setFailTarget(null);
            refresh();
          }}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, AlertTriangle, ExternalLink } from "lucide-react";
import { AI_MAPPABLE_DESA_FIELDS } from "@/lib/admin-claim/ai-mapping";

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

const STATUS_PILL: Record<DocStatus, string> = {
  WAITING_VERIFIED_APPROVAL: "bg-amber-100 text-amber-800",
  PROCESSING:                "bg-blue-100 text-blue-800",
  PUBLISHED:                 "bg-emerald-100 text-emerald-800",
  FAILED:                    "bg-red-100 text-red-800",
};

const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "WAITING_VERIFIED_APPROVAL", label: "Menunggu" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PUBLISHED", label: "Published" },
  { value: "FAILED", label: "Failed" },
];

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
}: {
  doc: DocRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const initialDraft =
    doc.aiMappingResult && typeof doc.aiMappingResult === "object"
      ? (doc.aiMappingResult as { fields?: Record<string, string | number | null>; notes?: string })
      : null;

  const [fields, setFields] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const k of AI_MAPPABLE_DESA_FIELDS) {
      const v = initialDraft?.fields?.[k];
      out[k] = v === null || v === undefined ? "" : String(v);
    }
    return out;
  });
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    setLoading(true);
    setError(null);
    try {
      // Build payload: only non-empty fields are applied to the Desa record.
      const payloadFields: Record<string, string | number | null> = {};
      for (const k of AI_MAPPABLE_DESA_FIELDS) {
        const v = fields[k]?.trim();
        if (v === undefined || v === "") continue;
        // tahunData/jumlahPenduduk should be numbers; let server sanitize otherwise.
        if (k === "tahunData" || k === "jumlahPenduduk") {
          const n = Number(v);
          if (!Number.isFinite(n)) {
            setError(`Field ${k} harus berupa angka.`);
            setLoading(false);
            return;
          }
          payloadFields[k] = n;
        } else {
          payloadFields[k] = v;
        }
      }
      const res = await fetch(`/api/internal-admin/documents/${doc.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: payloadFields, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mempublikasikan.");
        return;
      }
      onDone();
    } catch {
      setError("Koneksi bermasalah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Publikasikan dokumen (mapping manual)</h2>
          <p className="text-xs text-slate-500 mt-0.5">{doc.title} — {doc.desa.nama}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
          <p className="font-semibold">AI provider belum dikonfigurasi — mapping manual.</p>
          <p className="mt-0.5">Baca dokumen, lalu isi field di bawah secara manual. Field kosong tidak akan mengubah data desa. Terbatas pada field aman: profil, kontak, alamat, website. APBDes/data sensitif tidak di-map.</p>
        </div>

        <div className="space-y-2 text-sm">
          {AI_MAPPABLE_DESA_FIELDS.map((k) => (
            <div key={k}>
              <label className="block text-xs font-medium text-slate-700">{k}</label>
              <input
                type="text"
                value={fields[k]}
                onChange={(e) => setFields((p) => ({ ...p, [k]: e.target.value }))}
                placeholder="kosongkan untuk tidak mengubah field"
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-slate-700">Catatan publish (opsional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm resize-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50">Batal</button>
          <button onClick={handlePublish} disabled={loading}
            className="flex-1 bg-emerald-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
            {loading ? "Mempublish..." : "Publish"}
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
}: {
  doc: DocRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Alasan wajib diisi.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/internal-admin/documents/${doc.id}/mark-failed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menandai FAILED.");
        return;
      }
      onDone();
    } catch {
      setError("Koneksi bermasalah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Tandai dokumen FAILED</h2>
        <p className="text-sm text-slate-600">{doc.title} — {doc.desa.nama}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Alasan kegagalan (akan ditampilkan ke uploader)"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none"
            required
          />
          {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-50">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-red-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              {loading ? "Memproses..." : "Tandai FAILED"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DocCard({
  doc,
  onAction,
  onPublish,
  onMarkFailed,
}: {
  doc: DocRow;
  onAction: () => void;
  onPublish: (doc: DocRow) => void;
  onMarkFailed: (doc: DocRow) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploaderName = doc.uploadedBy?.nama ?? doc.uploadedBy?.username ?? doc.uploadedBy?.email ?? "—";

  async function runDraftMapping() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/internal-admin/documents/${doc.id}/draft-mapping`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal generate draft."); return; }
      onAction();
    } catch { setError("Koneksi bermasalah."); }
    finally { setBusy(false); }
  }

  async function openPreview() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin-claim/documents/${doc.id}/preview`);
      const data = await res.json();
      if (res.ok && data.signedUrl) {
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        setError(data.error ?? "Gagal preview.");
      }
    } catch { setError("Koneksi bermasalah."); }
    finally { setBusy(false); }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 truncate">{doc.title}</p>
          <p className="text-xs text-slate-500">{doc.desa.nama} • {doc.desa.kecamatan}, {doc.desa.kabupaten}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_PILL[doc.status]}`}>
          {doc.status}
        </span>
      </div>

      <div className="text-xs text-slate-500 space-y-0.5">
        <p>{doc.fileName} • {doc.fileType}</p>
        <p>Uploader: {uploaderName}</p>
        <p>Diunggah: {new Date(doc.createdAt).toLocaleDateString("id-ID")}</p>
        {doc.aiMappingStatus && <p>AI mapping: <span className="text-slate-700 font-medium">{doc.aiMappingStatus}</span></p>}
      </div>

      {doc.status === "FAILED" && doc.failedReason && (
        <div className="text-xs bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2">
          <p className="font-medium flex items-center gap-1"><AlertTriangle size={12} /> Alasan</p>
          <p className="mt-0.5">{doc.failedReason}</p>
        </div>
      )}

      {error && (
        <p className="text-xs bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button onClick={openPreview} disabled={busy}
          className="text-xs font-medium text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 disabled:opacity-50">
          <ExternalLink size={12} /> Preview
        </button>
        {doc.status === "PROCESSING" && (
          <>
            <button onClick={runDraftMapping} disabled={busy}
              className="text-xs font-medium text-violet-700 hover:bg-violet-50 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 disabled:opacity-50">
              <Sparkles size={12} /> Buat Draft Manual
            </button>
            <button onClick={() => onPublish(doc)} disabled={busy}
              className="text-xs font-medium text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 disabled:opacity-50">
              <Check size={12} /> Publish
            </button>
            <button onClick={() => onMarkFailed(doc)} disabled={busy}
              className="text-xs font-medium text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 disabled:opacity-50">
              <AlertTriangle size={12} /> Mark FAILED
            </button>
          </>
        )}
        {doc.status === "WAITING_VERIFIED_APPROVAL" && (
          <button onClick={() => onMarkFailed(doc)} disabled={busy}
            className="text-xs font-medium text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 disabled:opacity-50">
            <AlertTriangle size={12} /> Mark FAILED
          </button>
        )}
      </div>
    </div>
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
  const [publishTarget, setPublishTarget] = useState<DocRow | null>(null);
  const [failTarget, setFailTarget] = useState<DocRow | null>(null);

  const refresh = () => router.refresh();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Dokumen Desa — Review Queue</h1>
        <span className="text-sm text-slate-500">{documents.length} dokumen</span>
      </header>

      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab.value}
            href={buildUrl({ status: tab.value })}
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

      {documents.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">Tidak ada dokumen dalam filter ini.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {documents.map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              onAction={refresh}
              onPublish={setPublishTarget}
              onMarkFailed={setFailTarget}
            />
          ))}
        </div>
      )}

      {publishTarget && (
        <PublishModal doc={publishTarget}
          onClose={() => setPublishTarget(null)}
          onDone={() => { setPublishTarget(null); refresh(); }} />
      )}
      {failTarget && (
        <MarkFailedModal doc={failTarget}
          onClose={() => setFailTarget(null)}
          onDone={() => { setFailTarget(null); refresh(); }} />
      )}
    </div>
  );
}

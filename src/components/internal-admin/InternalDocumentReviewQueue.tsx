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
  WAITING_VERIFIED_APPROVAL: { label: "Menunggu persetujuan", pill: "pill-warn", note: "Dokumen baru, menunggu persetujuan admin utama." },
  PROCESSING: { label: "Sedang diproses", pill: "pill-info", note: "Siap dibaca dan diputuskan untuk dipublikasikan." },
  PUBLISHED: { label: "Sudah tayang", pill: "pill-ok", note: "Data sudah diterapkan ke halaman desa." },
  FAILED: { label: "Gagal diproses", pill: "pill-danger", note: "Tidak bisa dipakai, perlu alasan jelas untuk pengunggah." },
};

const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "WAITING_VERIFIED_APPROVAL", label: "Menunggu" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "PUBLISHED", label: "Sudah tayang" },
  { value: "FAILED", label: "Gagal" },
] as const;

function buildUrl(params: Record<string, string>) {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); else url.searchParams.delete(k); });
  return url.pathname + url.search;
}
function formatBytes(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }

function PublishModal({ doc, onClose, onDone, onNotify }: { doc: DocRow; onClose: () => void; onDone: () => void; onNotify: (message: string, type?: ToastType) => void }) {
  const initialDraft = doc.aiMappingResult && typeof doc.aiMappingResult === "object" ? (doc.aiMappingResult as { fields?: Record<string, string | number | null> }) : null;
  const [fields, setFields] = useState<Record<string, string>>(() => { const out: Record<string, string> = {}; for (const key of AI_MAPPABLE_DESA_FIELDS) { const value = initialDraft?.fields?.[key]; out[key] = value === null || value === undefined ? "" : String(value); } return out; });
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  async function handlePublish() { setLoading(true); try { const payloadFields: Record<string, string | number | null> = {}; for (const key of AI_MAPPABLE_DESA_FIELDS) { const value = fields[key]?.trim(); if (!value) continue; if (key === "tahunData" || key === "jumlahPenduduk") { const numeric = Number(value); if (!Number.isFinite(numeric)) { onNotify(`Field ${key} harus angka.`, "error"); setLoading(false); return; } payloadFields[key] = numeric; } else { payloadFields[key] = value; } } const res = await fetch(`/api/internal-admin/documents/${doc.id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields: payloadFields, note: note || undefined }) }); const data = await res.json(); if (!res.ok) { onNotify(data.error ?? "Dokumen belum berhasil dipublikasikan.", "error"); return; } onNotify("Dokumen berhasil dipublikasikan.", "success"); onDone(); } catch { onNotify("Koneksi bermasalah. Coba lagi.", "error"); } finally { setLoading(false); } }
  return <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4"><div className="lux-panel max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"><div className="space-y-1"><p className="eyebrow text-[10px]">Publikasikan dokumen</p><h2 className="text-[18px] sm:text-[20px] font-semibold text-slate-900 tracking-tight">{doc.title}</h2><p className="text-xs text-slate-500">{doc.desa.nama}</p></div><div className="notice-card notice-warn text-xs">Field kosong tidak akan mengubah data publik yang sudah ada.</div><div className="space-y-2 text-sm max-h-[40vh] overflow-y-auto pr-1">{AI_MAPPABLE_DESA_FIELDS.map((key) => <div key={key}><label className="field-label text-xs">{key}</label><input type="text" value={fields[key]} onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))} placeholder="Kosongkan jika tidak diubah" className="field-lux text-sm" /></div>)}<div><label className="field-label text-xs">Catatan</label><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} className="textarea-lux text-sm" placeholder="Catatan singkat (opsional)." /></div></div><div className="flex gap-2"><button type="button" onClick={onClose} className="btn-lux btn-lux-secondary flex-1 text-sm">Batal</button><button type="button" onClick={handlePublish} disabled={loading} className="btn-lux btn-lux-success flex-1 text-sm">{loading ? "Mempublikasikan..." : "Publikasikan"}</button></div></div></div>;
}

function MarkFailedModal({ doc, onClose, onDone, onNotify }: { doc: DocRow; onClose: () => void; onDone: () => void; onNotify: (message: string, type?: ToastType) => void }) {
  const [reason, setReason] = useState(""); const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); if (!reason.trim()) { onNotify("Alasan kegagalan wajib diisi.", "error"); return; } setLoading(true); try { const res = await fetch(`/api/internal-admin/documents/${doc.id}/mark-failed`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: reason.trim() }) }); const data = await res.json(); if (!res.ok) { onNotify(data.error ?? "Dokumen belum berhasil ditandai gagal.", "error"); return; } onNotify("Dokumen ditandai gagal.", "success"); onDone(); } catch { onNotify("Koneksi bermasalah. Coba lagi.", "error"); } finally { setLoading(false); } }
  return <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4"><div className="lux-panel max-w-md w-full p-5 sm:p-6 space-y-4"><div className="space-y-1"><p className="eyebrow text-[10px]">Tandai gagal diproses</p><h2 className="text-[18px] sm:text-[20px] font-semibold text-slate-900 tracking-tight">{doc.title}</h2><p className="text-xs text-slate-500">{doc.desa.nama}</p></div><div className="notice-card notice-danger text-xs">Pengunggah akan lihat alasan ini. Jelaskan dengan jelas apa yang perlu diperbaiki.</div><form onSubmit={handleSubmit} className="space-y-3"><div><label className="field-label text-xs">Alasan untuk pengunggah</label><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={1000} placeholder="Contoh: dokumen buram, lampiran tidak sesuai." className="textarea-lux text-sm" required /></div><div className="flex gap-2"><button type="button" onClick={onClose} className="btn-lux btn-lux-secondary flex-1 text-sm">Batal</button><button type="submit" disabled={loading} className="btn-lux btn-lux-danger flex-1 text-sm">{loading ? "Menyimpan..." : "Tandai gagal"}</button></div></form></div></div>;
}

function DocCard({ doc, onRefresh, onPublish, onMarkFailed, onNotify }: { doc: DocRow; onRefresh: () => void; onPublish: (doc: DocRow) => void; onMarkFailed: (doc: DocRow) => void; onNotify: (message: string, type?: ToastType) => void }) {
  const [busy, setBusy] = useState(false); const uploaderName = doc.uploadedBy?.nama ?? doc.uploadedBy?.username ?? doc.uploadedBy?.email ?? "—"; const status = STATUS_META[doc.status];
  async function runDraftMapping() { setBusy(true); try { const res = await fetch(`/api/internal-admin/documents/${doc.id}/draft-mapping`, { method: "POST" }); const data = await res.json(); if (!res.ok) { onNotify(data.error ?? "Draft mapping belum berhasil dibuat.", "error"); return; } onNotify("Draft mapping berhasil dibuat.", "success"); onRefresh(); } catch { onNotify("Koneksi bermasalah. Coba lagi.", "error"); } finally { setBusy(false); } }
  async function openPreview() { setBusy(true); try { const res = await fetch(`/api/admin-claim/documents/${doc.id}/preview`); const data = await res.json(); if (!res.ok || !data.signedUrl) { onNotify(data.error ?? "Preview dokumen belum bisa dibuka.", "error"); return; } window.open(data.signedUrl, "_blank", "noopener,noreferrer"); } catch { onNotify("Koneksi bermasalah. Coba lagi.", "error"); } finally { setBusy(false); } }
  return <article className="lux-card t-spring p-4 sm:p-5 space-y-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900 text-[14px] sm:text-[15px] tracking-tight leading-snug">{doc.title}</p><p className="text-[11px] sm:text-xs text-slate-500">{doc.desa.nama}</p></div><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 ${status.pill}`}>{status.label}</span></div><div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600"><span>{uploaderName}</span><span className="text-slate-300">·</span><span>{doc.fileType} · {formatBytes(doc.fileSize)}</span><span className="text-slate-300">·</span><span>{new Date(doc.createdAt).toLocaleDateString("id-ID", { dateStyle: "short" })}</span></div>{doc.status === "FAILED" && doc.failedReason && <div className="notice-card notice-danger text-xs"><p className="font-semibold">Alasan:</p><p className="mt-1">{doc.failedReason}</p></div>}{doc.status === "PROCESSING" && <div className="flex flex-wrap gap-2"><button type="button" onClick={openPreview} disabled={busy} className="btn-lux btn-lux-ghost text-xs"><ExternalLink size={11} aria-hidden /> Preview</button><button type="button" onClick={runDraftMapping} disabled={busy} className="btn-lux btn-lux-secondary text-xs"><Sparkles size={11} aria-hidden /> Draft</button><button type="button" onClick={() => onPublish(doc)} disabled={busy} className="btn-lux btn-lux-success text-xs"><Check size={11} aria-hidden /> Publikasikan</button><button type="button" onClick={() => onMarkFailed(doc)} disabled={busy} className="btn-lux btn-lux-danger text-xs"><AlertTriangle size={11} aria-hidden /> Gagal</button></div>}{doc.status === "WAITING_VERIFIED_APPROVAL" && <div className="flex flex-wrap gap-2"><button type="button" onClick={openPreview} disabled={busy} className="btn-lux btn-lux-ghost text-xs"><ExternalLink size={11} aria-hidden /> Preview</button><button type="button" onClick={() => onMarkFailed(doc)} disabled={busy} className="btn-lux btn-lux-danger text-xs"><AlertTriangle size={11} aria-hidden /> Tandai gagal</button></div>}</article>;
}

export default function InternalDocumentReviewQueue({ documents, statusFilter }: { documents: DocRow[]; statusFilter: string }) {
  const router = useRouter(); const { toasts, toast, removeToast } = useToast(); const [publishTarget, setPublishTarget] = useState<DocRow | null>(null); const [failTarget, setFailTarget] = useState<DocRow | null>(null);
  const summary = useMemo(() => documents.reduce((acc, doc) => { acc.total += 1; if (doc.status === "WAITING_VERIFIED_APPROVAL") acc.waiting += 1; if (doc.status === "PROCESSING") acc.processing += 1; if (doc.status === "PUBLISHED") acc.published += 1; if (doc.status === "FAILED") acc.failed += 1; return acc; }, { total: 0, waiting: 0, processing: 0, published: 0, failed: 0 }), [documents]);
  const refresh = () => router.refresh();
  return <div className="space-y-5" data-testid="internal-documents-queue"><div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div className="space-y-1"><p className="eyebrow text-[10px]">Review dokumen desa</p><h1 className="display text-[22px] sm:text-[26px] font-semibold text-slate-900 tracking-tight">Antrean dokumen</h1></div><div className="flex flex-wrap gap-1.5"><span className="pill-info rounded-full px-2.5 py-0.5 text-[10px] font-semibold">{summary.total} dokumen</span>{summary.waiting > 0 && <span className="pill-warn rounded-full px-2.5 py-0.5 text-[10px] font-semibold">{summary.waiting} menunggu</span>}{summary.processing > 0 && <span className="pill-warn rounded-full px-2.5 py-0.5 text-[10px] font-semibold">{summary.processing} diproses</span>}{summary.published > 0 && <span className="pill-ok rounded-full px-2.5 py-0.5 text-[10px] font-semibold">{summary.published} tayang</span>}{summary.failed > 0 && <span className="pill-danger rounded-full px-2.5 py-0.5 text-[10px] font-semibold">{summary.failed} gagal</span>}</div></div><div className="flex flex-wrap gap-1.5">{STATUS_TABS.map((tab) => <a key={tab.value} href={buildUrl({ status: tab.value })} className={`btn-lux ${statusFilter === tab.value ? "btn-lux-primary" : "btn-lux-ghost"} !min-h-[36px] sm:!min-h-[40px] text-[11px] sm:text-xs`}>{tab.label}</a>)}</div>{documents.length === 0 ? <div className="lux-card p-8 text-center space-y-2"><FileText size={24} className="mx-auto text-slate-300" aria-hidden /><p className="text-sm text-slate-500">Tidak ada dokumen pada filter ini.</p></div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{documents.map((doc) => <DocCard key={doc.id} doc={doc} onRefresh={refresh} onPublish={setPublishTarget} onMarkFailed={setFailTarget} onNotify={toast} />)}</div>}{publishTarget && <PublishModal doc={publishTarget} onNotify={toast} onClose={() => setPublishTarget(null)} onDone={() => { setPublishTarget(null); refresh(); }} />}{failTarget && <MarkFailedModal doc={failTarget} onNotify={toast} onClose={() => setFailTarget(null)} onDone={() => { setFailTarget(null); refresh(); }} />}<ToastContainer toasts={toasts} onRemove={removeToast} /></div>;
}

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, ExternalLink, Check, X, AlertTriangle } from "lucide-react";

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
  rejectedReason: string | null;
  createdAt: string;
  uploadedById: string | null;
  uploadedBy: { id: string; nama: string | null; username: string | null; email: string } | null;
}

interface Props {
  currentUserId: string;
  memberStatus: "LIMITED" | "VERIFIED" | "REVOKED" | "EXPIRED";
  memberRole: "LIMITED_ADMIN" | "VERIFIED_ADMIN";
  documents: DocRow[];
  categories: ReadonlyArray<{ value: string; label: string }>;
  maxFileSizeMB: number;
  maxFilesPerUpload: number;
  allowedMimeTypes: string[];
  storageConfigured: boolean;
}

const STATUS_PILL: Record<DocStatus, { label: string; cls: string; dot: string }> = {
  WAITING_VERIFIED_APPROVAL: { label: "Menunggu Persetujuan VERIFIED", cls: "pill-warn",   dot: "#D97706" },
  PROCESSING:                { label: "Sedang Diproses",               cls: "pill-info",   dot: "#4F46E5" },
  PUBLISHED:                 { label: "Dipublikasikan",                cls: "pill-ok",     dot: "#10B981" },
  FAILED:                    { label: "Gagal",                         cls: "pill-danger", dot: "#F43F5E" },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocCard({
  doc,
  canApprove,
  onApprove,
  onPreview,
  busyId,
}: {
  doc: DocRow;
  canApprove: boolean;
  onApprove: (id: string) => void;
  onPreview: (id: string) => void;
  busyId: string | null;
}) {
  const status = STATUS_PILL[doc.status];
  const uploaderName = doc.uploadedBy?.nama ?? doc.uploadedBy?.username ?? doc.uploadedBy?.email ?? "—";

  return (
    <div className="lux-card t-spring lift hover:shadow-lux-hover p-7 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 text-[15px] tracking-tight truncate">{doc.title}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5 num">{doc.fileName} · {formatBytes(doc.fileSize)}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${status.cls}`}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} aria-hidden />
          {status.label}
        </span>
      </div>

      <div className="text-xs text-slate-500 space-y-1 pt-1">
        <p>Kategori: <span className="text-slate-700">{doc.category}</span></p>
        <p>Diunggah: <span className="text-slate-700">{new Date(doc.createdAt).toLocaleDateString("id-ID")}</span> · {uploaderName}</p>
        {doc.approvedAt && <p>Disetujui: <span className="text-slate-700">{new Date(doc.approvedAt).toLocaleDateString("id-ID")}</span></p>}
        {doc.publishedAt && <p>Dipublikasikan: <span className="text-slate-700">{new Date(doc.publishedAt).toLocaleDateString("id-ID")}</span></p>}
      </div>

      {doc.status === "FAILED" && doc.failedReason && (
        <div className="rounded-2xl px-4 py-3 text-xs leading-relaxed pill-danger" role="alert">
          <p className="font-semibold flex items-center gap-1.5"><AlertTriangle size={12} aria-hidden /> Alasan kegagalan</p>
          <p className="mt-1">{doc.failedReason}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1" style={{ borderTop: "1px solid var(--hair)", paddingTop: "0.75rem" }}>
        <button
          type="button"
          onClick={() => onPreview(doc.id)}
          disabled={busyId === doc.id}
          className="t-spring inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 px-3 py-1.5 rounded-xl disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <ExternalLink size={12} aria-hidden /> Buka Preview
        </button>
        {canApprove && doc.status === "WAITING_VERIFIED_APPROVAL" && (
          <button
            type="button"
            onClick={() => onApprove(doc.id)}
            disabled={busyId === doc.id}
            className="t-spring inline-flex items-center gap-1.5 text-xs font-medium text-white px-3.5 py-1.5 rounded-xl shadow-lux-1 hover:shadow-lux-2 hover:-translate-y-0.5 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            style={{ background: "linear-gradient(180deg, #047857 0%, #065F46 100%)" }}
          >
            <Check size={12} aria-hidden /> Setujui ke PROCESSING
          </button>
        )}
      </div>
    </div>
  );
}

function UploadForm({
  categories,
  maxFileSizeMB,
  maxFilesPerUpload,
  allowedMimeTypes,
  storageConfigured,
  onUploaded,
}: {
  categories: ReadonlyArray<{ value: string; label: string }>;
  maxFileSizeMB: number;
  maxFilesPerUpload: number;
  allowedMimeTypes: string[];
  storageConfigured: boolean;
  onUploaded: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]?.value ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [ack, setAck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle("");
    setCategory(categories[0]?.value ?? "");
    setFiles([]);
    setAck(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > maxFilesPerUpload) {
      setError(`Maksimal ${maxFilesPerUpload} file per unggah.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFiles([]);
      return;
    }
    setError(null);
    setFiles(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storageConfigured) {
      setError("Storage tidak terkonfigurasi. Hubungi admin PantauDesa.");
      return;
    }
    if (files.length === 0) {
      setError("Pilih minimal satu file.");
      return;
    }
    if (!ack) {
      setError("Centang pernyataan tanggung jawab sebelum unggah.");
      return;
    }
    for (const file of files) {
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        setError(`"${file.name}" melebihi batas ${maxFileSizeMB} MB.`);
        return;
      }
      if (!allowedMimeTypes.includes(file.type)) {
        setError(`"${file.name}": tipe file tidak diizinkan. Diizinkan: ${allowedMimeTypes.join(", ")}.`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const fd = new FormData();
      for (const file of files) fd.append("files", file);
      fd.append("title", title);
      fd.append("category", category);
      fd.append("responsibilityAck", "true");
      const res = await fetch("/api/admin-claim/documents/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        // Server-side failures (storage, validation, auth) — never show success.
        const detail = data.detail ? ` (${data.detail})` : "";
        setError(`${data.error ?? "Gagal mengunggah."}${detail}`);
        return;
      }
      // Only declare success when the server confirms documents were persisted.
      const persisted = Array.isArray(data.documents) ? data.documents.length : 0;
      if (persisted === 0) {
        setError("Server tidak mengembalikan konfirmasi dokumen tersimpan. Coba refresh halaman dan periksa daftar dokumen.");
        return;
      }
      setSuccess(`${data.message ?? "Dokumen berhasil diunggah."} (${persisted} dokumen tercatat di database)`);
      reset();
      onUploaded();
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="lux-card p-7 space-y-5">
      <div>
        <p className="eyebrow text-[10px]">Unggah dokumen</p>
        <h2 className="text-[17px] font-semibold text-slate-900 tracking-tight mt-1">Tambah dokumen ke desa</h2>
        <p className="text-xs text-slate-500 mt-1">
          Maks <span className="num">{maxFileSizeMB}</span> MB per file · maks <span className="num">{maxFilesPerUpload}</span> file per unggah. Tipe: {allowedMimeTypes.join(", ")}.
        </p>
      </div>

      {!storageConfigured && (
        <div className="rounded-2xl px-4 py-3 text-xs leading-relaxed pill-warn" role="status">
          <p className="font-semibold">Storage belum terkonfigurasi</p>
          <p className="mt-0.5">Unggah akan ditolak server-side. Hubungi admin PantauDesa untuk mengaktifkan konfigurasi storage.</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">Judul dokumen</label>
        <input type="text" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: APBDes 2026"
          className="w-full bg-slate-50 ring-hair rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          required />
        {files.length > 1 && (
          <p className="text-xs text-slate-500 mt-1.5">Judul akan ditambahkan &quot;(1/{files.length})&quot;, &quot;(2/{files.length})&quot;, dst. untuk setiap file.</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">Kategori</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-slate-50 ring-hair rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          required>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 tracking-wide">
          File <span className="text-slate-400 font-normal normal-case">(pilih hingga {maxFilesPerUpload} file sekaligus)</span>
        </label>
        <input ref={fileInputRef} type="file" multiple
          accept={allowedMimeTypes.join(",")}
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:px-4 file:py-2 file:font-semibold file:cursor-pointer"
          required />
        {files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {files.map((f, i) => (
              <li key={i} className="text-xs text-slate-500 num">{f.name} · {formatBytes(f.size)}</li>
            ))}
          </ul>
        )}
      </div>

      <label className="flex items-start gap-2.5 text-sm cursor-pointer pt-1">
        <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 accent-[#1E1B4B]" />
        <span className="text-slate-700 leading-relaxed">
          Saya menyatakan dokumen/data yang saya unggah benar dan dapat dipertanggungjawabkan.
        </span>
      </label>

      {error && (
        <div role="alert" className="rounded-2xl px-4 py-3 text-sm leading-relaxed pill-danger">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="rounded-2xl px-4 py-3 text-sm leading-relaxed pill-ok">
          {success}
        </div>
      )}

      <button type="submit" disabled={loading || !storageConfigured}
        className="t-spring w-full inline-flex items-center justify-center gap-2 text-white text-sm font-semibold rounded-2xl px-5 py-3 shadow-lux-2 hover:shadow-lux-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        style={{ background: loading || !storageConfigured ? "#94A3B8" : "#1E1B4B" }}>
        {loading ? "Mengunggah..." : <><Upload size={14} aria-hidden /> Unggah {files.length > 1 ? `${files.length} Dokumen` : "Dokumen"}</>}
      </button>
    </form>
  );
}

export default function AdminDesaDokumenClient(props: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const canUpload = props.memberStatus === "VERIFIED" || props.memberStatus === "LIMITED";
  const canApprove = props.memberStatus === "VERIFIED" && props.memberRole === "VERIFIED_ADMIN";

  async function handleApprove(id: string) {
    setBusyId(id);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/admin-claim/documents/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setActionMsg({ kind: "error", text: data.error ?? "Gagal menyetujui." });
        return;
      }
      setActionMsg({ kind: "ok", text: "Dokumen berhasil masuk PROCESSING." });
      router.refresh();
    } catch {
      setActionMsg({ kind: "error", text: "Koneksi bermasalah." });
    } finally {
      setBusyId(null);
    }
  }

  async function handlePreview(id: string) {
    setBusyId(id);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/admin-claim/documents/${id}/preview`);
      const data = await res.json();
      if (!res.ok || !data.signedUrl) {
        setActionMsg({ kind: "error", text: data.error ?? "Gagal membuat tautan preview." });
        return;
      }
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      setActionMsg({ kind: "error", text: "Koneksi bermasalah." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-7">
      <header className="space-y-1.5">
        <p className="eyebrow text-[10px]">Tab</p>
        <h1 className="display text-[28px] sm:text-[32px] font-semibold text-slate-900 tracking-tight leading-tight">Dokumen Desa</h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
          {props.memberStatus === "VERIFIED"
            ? "Unggah dokumen langsung masuk ke tahap PROCESSING dan dapat ditinjau tim PantauDesa."
            : "Unggah dokumen kontribusi — perlu persetujuan Admin Desa VERIFIED sebelum diproses."}
        </p>
      </header>

      {actionMsg && (
        <div
          role={actionMsg.kind === "error" ? "alert" : "status"}
          className={`rounded-2xl px-4 py-3.5 text-sm flex items-start gap-3 shadow-lux-1 ${
            actionMsg.kind === "ok" ? "pill-ok" : "pill-danger"
          }`}
        >
          <span className={`mt-0.5 inline-flex w-5 h-5 rounded-full items-center justify-center flex-shrink-0 ${
            actionMsg.kind === "ok" ? "bg-emerald-100" : "bg-rose-100"
          }`}>
            {actionMsg.kind === "ok" ? <Check size={12} aria-hidden /> : <X size={12} aria-hidden />}
          </span>
          <span className="leading-snug">{actionMsg.text}</span>
        </div>
      )}

      {canUpload && (
        <UploadForm
          categories={props.categories}
          maxFileSizeMB={props.maxFileSizeMB}
          maxFilesPerUpload={props.maxFilesPerUpload}
          allowedMimeTypes={props.allowedMimeTypes}
          storageConfigured={props.storageConfigured}
          onUploaded={() => router.refresh()}
        />
      )}

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="section-title flex items-center gap-2">
            <FileText size={13} aria-hidden /> Dokumen di desa ini
          </h2>
          {props.documents.length > 0 && (
            <span className="text-xs text-slate-400 num">{props.documents.length} dokumen</span>
          )}
        </div>
        {props.documents.length === 0 ? (
          <div className="lux-card p-10 text-center space-y-2">
            <p className="text-sm text-slate-500">Belum ada dokumen yang tercatat untuk desa ini.</p>
            <p className="text-xs text-slate-400">Mulai dengan menggunakan formulir unggah di atas.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {props.documents.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                canApprove={canApprove}
                onApprove={handleApprove}
                onPreview={handlePreview}
                busyId={busyId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

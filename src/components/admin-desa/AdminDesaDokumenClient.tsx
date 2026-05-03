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

const STATUS_PILL: Record<DocStatus, { label: string; cls: string }> = {
  WAITING_VERIFIED_APPROVAL: { label: "Menunggu Persetujuan VERIFIED", cls: "bg-amber-100 text-amber-800" },
  PROCESSING:                { label: "Sedang Diproses",               cls: "bg-blue-100 text-blue-800" },
  PUBLISHED:                 { label: "Dipublikasikan",                cls: "bg-emerald-100 text-emerald-800" },
  FAILED:                    { label: "Gagal",                         cls: "bg-red-100 text-red-800" },
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
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 truncate">{doc.title}</p>
          <p className="text-xs text-slate-500 truncate">{doc.fileName} • {formatBytes(doc.fileSize)}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${status.cls}`}>
          {status.label}
        </span>
      </div>

      <div className="text-xs text-slate-500 space-y-0.5">
        <p>Kategori: <span className="text-slate-700">{doc.category}</span></p>
        <p>Diunggah: {new Date(doc.createdAt).toLocaleDateString("id-ID")} oleh {uploaderName}</p>
        {doc.approvedAt && <p>Disetujui: {new Date(doc.approvedAt).toLocaleDateString("id-ID")}</p>}
        {doc.publishedAt && <p>Dipublikasikan: {new Date(doc.publishedAt).toLocaleDateString("id-ID")}</p>}
      </div>

      {doc.status === "FAILED" && doc.failedReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-800">
          <p className="font-medium flex items-center gap-1"><AlertTriangle size={12} /> Alasan kegagalan</p>
          <p className="mt-0.5">{doc.failedReason}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => onPreview(doc.id)}
          disabled={busyId === doc.id}
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg disabled:opacity-50"
        >
          <ExternalLink size={12} /> Buka Preview
        </button>
        {canApprove && doc.status === "WAITING_VERIFIED_APPROVAL" && (
          <button
            type="button"
            onClick={() => onApprove(doc.id)}
            disabled={busyId === doc.id}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg disabled:opacity-50"
          >
            <Check size={12} /> Setujui ke PROCESSING
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
        setError(data.error ?? "Gagal mengunggah.");
        return;
      }
      setSuccess(data.message ?? "Dokumen berhasil diunggah.");
      reset();
      onUploaded();
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Unggah Dokumen</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Maks {maxFileSizeMB} MB per file · maks {maxFilesPerUpload} file per unggah. Tipe: {allowedMimeTypes.join(", ")}.
        </p>
      </div>

      {!storageConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
          Storage belum terkonfigurasi di environment ini. Unggah akan ditolak server-side.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Judul dokumen</label>
        <input type="text" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: APBDes 2026"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required />
        {files.length > 1 && (
          <p className="text-xs text-slate-500 mt-1">Judul akan ditambahkan &quot;(1/{files.length})&quot;, &quot;(2/{files.length})&quot;, dst. untuk setiap file.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          File <span className="text-slate-400 font-normal">(pilih hingga {maxFilesPerUpload} file sekaligus)</span>
        </label>
        <input ref={fileInputRef} type="file" multiple
          accept={allowedMimeTypes.join(",")}
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:px-3 file:py-1.5 file:font-medium"
          required />
        {files.length > 0 && (
          <ul className="mt-1.5 space-y-0.5">
            {files.map((f, i) => (
              <li key={i} className="text-xs text-slate-500">{f.name} • {formatBytes(f.size)}</li>
            ))}
          </ul>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5" />
        <span className="text-slate-700">
          Saya menyatakan dokumen/data yang saya unggah benar dan dapat dipertanggungjawabkan.
        </span>
      </label>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>}

      <button type="submit" disabled={loading || !storageConfigured}
        className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? "Mengunggah..." : <><Upload size={14} /> Unggah {files.length > 1 ? `${files.length} Dokumen` : "Dokumen"}</>}
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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Dokumen</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {props.memberStatus === "VERIFIED"
            ? "Unggah dokumen langsung masuk ke tahap PROCESSING."
            : "Unggah dokumen kontribusi — perlu persetujuan Admin Desa VERIFIED sebelum diproses."}
        </p>
      </header>

      {actionMsg && (
        <div className={`rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${
          actionMsg.kind === "ok"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {actionMsg.kind === "ok" ? <Check size={14} /> : <X size={14} />}
          <span>{actionMsg.text}</span>
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

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <FileText size={16} /> Dokumen di desa ini
        </h2>
        {props.documents.length === 0 ? (
          <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-2xl p-5 text-center">
            Belum ada dokumen yang tercatat.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
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

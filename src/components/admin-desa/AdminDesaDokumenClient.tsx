"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ExternalLink,
  FileText,
  FolderKanban,
  ShieldAlert,
  Upload,
} from "lucide-react";
import type { StorageConfigurationStatus } from "@/lib/storage/supabase-storage";
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
  storageStatus: StorageConfigurationStatus;
}

const STATUS_PILL: Record<DocStatus, { label: string; cls: string; dot: string }> = {
  WAITING_VERIFIED_APPROVAL: { label: "Menunggu", cls: "pill-warn", dot: "#D97706" },
  PROCESSING: { label: "Diproses", cls: "pill-info", dot: "#4F46E5" },
  PUBLISHED: { label: "Sudah tayang", cls: "pill-ok", dot: "#10B981" },
  FAILED: { label: "Gagal", cls: "pill-danger", dot: "#F43F5E" },
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
  const uploaderName = doc.uploadedBy?.nama ?? doc.uploadedBy?.username ?? doc.uploadedBy?.email ?? "-";

  return (
    <article className="lux-card t-spring p-4 sm:p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-semibold text-slate-900 text-[14px] sm:text-[15px] tracking-tight leading-snug">{doc.title}</p>
          <p className="text-[11px] text-slate-500">{doc.fileType} · {formatBytes(doc.fileSize)}</p>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {/* Compact info row */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
        <span>{doc.category}</span>
        <span className="text-slate-300">·</span>
        <span>{uploaderName}</span>
        <span className="text-slate-300">·</span>
        <span>{new Date(doc.createdAt).toLocaleDateString("id-ID", { dateStyle: "short" })}</span>
      </div>

      {/* Failed reason */}
      {doc.status === "FAILED" && doc.failedReason && (
        <div className="notice-card notice-danger text-xs">
          <p className="font-semibold">Alasan:</p>
          <p className="mt-1">{doc.failedReason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPreview(doc.id)}
          disabled={busyId === doc.id}
          className="btn-lux btn-lux-ghost text-xs"
        >
          <ExternalLink size={11} aria-hidden /> Preview
        </button>
        {canApprove && doc.status === "WAITING_VERIFIED_APPROVAL" && (
          <button
            type="button"
            onClick={() => onApprove(doc.id)}
            disabled={busyId === doc.id}
            className="btn-lux btn-lux-success text-xs"
          >
            <Check size={11} aria-hidden /> Setujui
          </button>
        )}
      </div>
    </article>
  );
}

function UploadForm({
  categories,
  maxFileSizeMB,
  maxFilesPerUpload,
  allowedMimeTypes,
  storageStatus,
  onUploaded,
  onNotify,
}: {
  categories: ReadonlyArray<{ value: string; label: string }>;
  maxFileSizeMB: number;
  maxFilesPerUpload: number;
  allowedMimeTypes: string[];
  storageStatus: StorageConfigurationStatus;
  onUploaded: () => void;
  onNotify: (message: string, type?: ToastType) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]?.value ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [ack, setAck] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle("");
    setCategory(categories[0]?.value ?? "");
    setFiles([]);
    setAck(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > maxFilesPerUpload) {
      onNotify(`Maksimal ${maxFilesPerUpload} file per unggah.`, "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFiles([]);
      return;
    }
    setFiles(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storageStatus.configured) {
      const missing = storageStatus.missingEnvVars.join(", ");
      const invalid = storageStatus.invalidEnvVars.join(", ");
      const detail = missing ? `Env belum diisi: ${missing}.` : invalid ? `Format env tidak valid: ${invalid}.` : "Hubungi admin PantauDesa.";
      onNotify(`Storage belum siap. ${detail}`, "error");
      return;
    }
    if (files.length === 0) {
      onNotify("Pilih minimal satu file.", "error");
      return;
    }
    if (!ack) {
      onNotify("Centang pernyataan tanggung jawab sebelum unggah.", "error");
      return;
    }
    for (const file of files) {
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        onNotify(`"${file.name}" melebihi batas ${maxFileSizeMB} MB.`, "error");
        return;
      }
      if (!allowedMimeTypes.includes(file.type)) {
        onNotify(`"${file.name}": tipe file tidak diizinkan.`, "error");
        return;
      }
    }

    setLoading(true);
    try {
      const fd = new FormData();
      for (const file of files) fd.append("files", file);
      fd.append("title", title);
      fd.append("category", category);
      fd.append("responsibilityAck", "true");
      const res = await fetch("/api/admin-claim/documents/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.detail ? ` (${data.detail})` : "";
        onNotify(`${data.error ?? "Gagal mengunggah."}${detail}`, "error");
        return;
      }
      const persisted = Array.isArray(data.documents) ? data.documents.length : 0;
      if (persisted === 0) {
        onNotify("Server tidak mengembalikan konfirmasi. Coba refresh lalu cek daftar dokumen.", "error");
        return;
      }
      onNotify(`${persisted} dokumen berhasil diunggah.`, "success");
      reset();
      onUploaded();
    } catch {
      onNotify("Koneksi bermasalah. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form data-testid="document-upload-form" onSubmit={handleSubmit} className="lux-panel p-5 sm:p-6 space-y-4">
      <div className="space-y-1">
        <p className="eyebrow text-[10px]">Unggah dokumen</p>
        <h2 className="text-[18px] sm:text-[20px] font-semibold text-slate-900 tracking-tight">Tambah dokumen</h2>
        <p className="text-xs text-slate-500">Maks {maxFileSizeMB} MB/file, {maxFilesPerUpload} file/unduh. Format: {allowedMimeTypes.map(t => t.split("/")[1]?.toUpperCase()).join(", ")}.</p>
      </div>

      {!storageStatus.configured && (
        <div className="notice-card notice-warn text-xs" role="status">
          <p className="font-semibold">Storage belum terkonfigurasi</p>
          <p className="mt-1">Unggah dan preview akan ditolak. Hubungi admin PantauDesa.</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="field-label text-xs">Judul dokumen</label>
          <input
            type="text"
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: APBDes 2026"
            className="field-lux text-sm"
            required
          />
        </div>

        <div>
          <label className="field-label text-xs">Kategori</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="select-lux text-sm" required>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="field-label text-xs">Lampiran</label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedMimeTypes.join(",")}
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:px-4 file:py-2 file:font-semibold file:cursor-pointer"
            required
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid gap-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{f.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(f.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)] text-xs cursor-pointer">
        <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 accent-[#1E1B4B]" />
        <span className="text-slate-700 leading-relaxed">
          Saya menyatakan dokumen yang diunggah benar dan dapat dipertanggungjawabkan.
        </span>
      </label>

      <button type="submit" disabled={loading || !storageStatus.configured} className="btn-lux btn-lux-primary w-full text-sm">
        {loading ? "Mengunggah..." : <><Upload size={13} aria-hidden /> Unggah {files.length > 1 ? `${files.length} Dokumen` : "Dokumen"}</>}
      </button>
    </form>
  );
}

export default function AdminDesaDokumenClient(props: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toasts, toast, removeToast } = useToast();
  const canUpload = props.memberStatus === "VERIFIED" || props.memberStatus === "LIMITED";
  const canApprove = props.memberStatus === "VERIFIED" && props.memberRole === "VERIFIED_ADMIN";

  const summary = useMemo(() => {
    const counts = { total: props.documents.length, waiting: 0, processing: 0, published: 0, failed: 0 };
    for (const doc of props.documents) {
      if (doc.status === "WAITING_VERIFIED_APPROVAL") counts.waiting += 1;
      if (doc.status === "PROCESSING") counts.processing += 1;
      if (doc.status === "PUBLISHED") counts.published += 1;
      if (doc.status === "FAILED") counts.failed += 1;
    }
    return counts;
  }, [props.documents]);

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin-claim/documents/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Gagal.", "error"); return; }
      toast("Dokumen diteruskan ke PantauDesa.", "success");
      router.refresh();
    } catch {
      toast("Koneksi bermasalah.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handlePreview(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin-claim/documents/${id}/preview`);
      const data = await res.json();
      if (!res.ok || !data.signedUrl) { toast(data.error ?? "Gagal.", "error"); return; }
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast("Koneksi bermasalah.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="eyebrow text-[10px]">Arsip kerja</p>
          <h1 className="display text-[22px] sm:text-[26px] font-semibold text-slate-900 tracking-tight">
            Dokumen Desa
          </h1>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="pill-info rounded-full px-2.5 py-0.5 text-[10px] font-semibold">{summary.total} dokumen</span>
          {summary.waiting > 0 && <span className="pill-warn rounded-full px-2.5 py-0.5 text-[10px] font-semibold">{summary.waiting} menunggu</span>}
          {summary.processing > 0 && <span className="pill-info rounded-full px-2.5 py-0.5 text-[10px] font-semibold">{summary.processing} diproses</span>}
          {summary.published > 0 && <span className="pill-ok rounded-full px-2.5 py-0.5 text-[10px] font-semibold">{summary.published} tayang</span>}
        </div>
      </div>

      {/* Compact metric row */}
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="lux-card px-3 py-1.5">
          <span className="text-slate-500">Total: </span>
          <span className="font-semibold text-slate-900">{summary.total}</span>
        </span>
        <span className="lux-card px-3 py-1.5">
          <span className="text-slate-500">Menunggu: </span>
          <span className="font-semibold text-slate-900">{summary.waiting}</span>
        </span>
        <span className="lux-card px-3 py-1.5">
          <span className="text-slate-500">Tayang: </span>
          <span className="font-semibold text-slate-900">{summary.published}</span>
        </span>
      </div>

      {canUpload && (
        <UploadForm
          categories={props.categories}
          maxFileSizeMB={props.maxFileSizeMB}
          maxFilesPerUpload={props.maxFilesPerUpload}
          allowedMimeTypes={props.allowedMimeTypes}
          storageStatus={props.storageStatus}
          onUploaded={() => router.refresh()}
          onNotify={toast}
        />
      )}

      {!props.storageStatus.configured && (
        <div className="notice-card notice-warn text-xs">
          <div className="flex items-start gap-2">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
            <p>Storage belum siap. Hubungi admin PantauDesa untuk konfigurasi.</p>
          </div>
        </div>
      )}

      {/* Documents list */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <FolderKanban size={14} className="text-indigo-600" aria-hidden />
          <p className="text-[11px] font-semibold text-slate-600">Daftar dokumen</p>
        </div>

        {props.documents.length === 0 ? (
          <div className="lux-card p-8 text-center space-y-2">
            <FileText size={22} className="mx-auto text-slate-300" aria-hidden />
            <p className="text-sm text-slate-500">Belum ada dokumen.</p>
          </div>
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

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

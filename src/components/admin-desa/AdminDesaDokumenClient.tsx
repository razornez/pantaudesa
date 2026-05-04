"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  FileText,
  FolderKanban,
  ShieldAlert,
  Upload,
  X,
} from "lucide-react";
import type { StorageConfigurationStatus } from "@/lib/storage/supabase-storage";

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
  WAITING_VERIFIED_APPROVAL: { label: "Menunggu Persetujuan VERIFIED", cls: "pill-warn", dot: "#D97706" },
  PROCESSING: { label: "Sedang Diproses", cls: "pill-info", dot: "#4F46E5" },
  PUBLISHED: { label: "Dipublikasikan", cls: "pill-ok", dot: "#10B981" },
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
    <article className="lux-card t-spring lift hover:shadow-lux-hover p-6 sm:p-7 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold text-slate-900 text-[16px] tracking-tight leading-snug">{doc.title}</p>
          <p className="text-xs text-slate-500 num">{doc.fileName} · {formatBytes(doc.fileSize)}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${status.cls}`}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} aria-hidden />
          {status.label}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        <div className="metric-card">
          <p className="metric-label">Kategori</p>
          <p className="mt-2 text-slate-900 font-medium">{doc.category}</p>
          <p className="metric-note">Tipe arsip yang dipilih admin</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Pengunggah</p>
          <p className="mt-2 text-slate-900 font-medium">{uploaderName}</p>
          <p className="metric-note">{new Date(doc.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
        </div>
      </div>

      {(doc.approvedAt || doc.publishedAt) && (
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {doc.approvedAt && <span className="pill-info rounded-full px-3 py-1">Disetujui {new Date(doc.approvedAt).toLocaleDateString("id-ID")}</span>}
          {doc.publishedAt && <span className="pill-ok rounded-full px-3 py-1">Dipublikasikan {new Date(doc.publishedAt).toLocaleDateString("id-ID")}</span>}
        </div>
      )}

      {doc.status === "FAILED" && doc.failedReason && (
        <div className="notice-card notice-danger text-sm leading-relaxed" role="alert">
          <p className="font-semibold flex items-center gap-2"><AlertTriangle size={14} aria-hidden /> Alasan kegagalan</p>
          <p className="mt-2 opacity-90">{doc.failedReason}</p>
        </div>
      )}

      <div className="surface-divider pt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPreview(doc.id)}
          disabled={busyId === doc.id}
          className="btn-lux btn-lux-ghost !min-h-[40px] text-xs"
        >
          <ExternalLink size={13} aria-hidden /> Buka Preview
        </button>
        {canApprove && doc.status === "WAITING_VERIFIED_APPROVAL" && (
          <button
            type="button"
            onClick={() => onApprove(doc.id)}
            disabled={busyId === doc.id}
            className="btn-lux btn-lux-success !min-h-[40px] text-xs"
          >
            <Check size={13} aria-hidden /> Setujui ke PROCESSING
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
}: {
  categories: ReadonlyArray<{ value: string; label: string }>;
  maxFileSizeMB: number;
  maxFilesPerUpload: number;
  allowedMimeTypes: string[];
  storageStatus: StorageConfigurationStatus;
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
    if (!storageStatus.configured) {
      const missing = storageStatus.missingEnvVars.join(", ");
      const invalid = storageStatus.invalidEnvVars.join(", ");
      const detail = missing
        ? `Env yang belum diisi: ${missing}.`
        : invalid
          ? `Format env tidak valid: ${invalid}.`
          : "Hubungi admin PantauDesa.";
      setError(`Storage belum siap. ${detail}`);
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
        const detail = data.detail ? ` (${data.detail})` : "";
        setError(`${data.error ?? "Gagal mengunggah."}${detail}`);
        return;
      }
      const persisted = Array.isArray(data.documents) ? data.documents.length : 0;
      if (persisted === 0) {
        setError("Server tidak mengembalikan konfirmasi dokumen tersimpan. Coba refresh halaman lalu cek daftar dokumen.");
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
    <form onSubmit={handleSubmit} className="lux-panel p-6 sm:p-7 space-y-5">
      <div className="space-y-2">
        <p className="eyebrow text-[10px]">Unggah dokumen</p>
        <h2 className="text-[20px] font-semibold text-slate-900 tracking-tight">Tambah dokumen ke desa</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Maks {maxFileSizeMB} MB per file, hingga {maxFilesPerUpload} file per unggah. Format: {allowedMimeTypes.join(", ")}.
        </p>
      </div>

      {!storageStatus.configured && (
        <div className="notice-card notice-warn text-sm leading-relaxed" role="status">
          <p className="font-semibold">Storage belum terkonfigurasi</p>
          <p className="mt-2 opacity-90">
            Unggah dan preview akan ditolak server-side sampai konfigurasi Supabase Storage dilengkapi.
          </p>
          {storageStatus.missingEnvVars.length > 0 && (
            <p className="mt-2">Env belum diisi: <span className="font-semibold">{storageStatus.missingEnvVars.join(", ")}</span></p>
          )}
          {storageStatus.invalidEnvVars.length > 0 && (
            <p className="mt-2">Format env perlu dibetulkan: <span className="font-semibold">{storageStatus.invalidEnvVars.join(", ")}</span></p>
          )}
          <p className="mt-2">Pastikan bucket private <span className="font-semibold">{storageStatus.bucket}</span> sudah ada lalu redeploy aplikasi.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="field-label">Judul dokumen</label>
          <input
            type="text"
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: APBDes 2026"
            className="field-lux"
            required
          />
          {files.length > 1 && (
            <p className="text-xs text-slate-500 mt-2">Judul akan diberi penanda (1/{files.length}), (2/{files.length}), dan seterusnya untuk setiap file.</p>
          )}
        </div>

        <div>
          <label className="field-label">Kategori</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="select-lux" required>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Lampiran</label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedMimeTypes.join(",")}
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-2xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:px-4 file:py-2.5 file:font-semibold file:cursor-pointer"
            required
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid gap-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{f.name}</p>
                <p className="text-xs text-slate-500 num">{formatBytes(f.size)}</p>
              </div>
              <span className="pill-info rounded-full px-2.5 py-1 text-[11px] font-semibold">{f.type || "file"}</span>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)] text-sm cursor-pointer">
        <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-1 accent-[#1E1B4B]" />
        <span className="text-slate-700 leading-relaxed">
          Saya menyatakan dokumen dan data yang saya unggah benar, relevan, dan dapat dipertanggungjawabkan.
        </span>
      </label>

      {error && <div role="alert" className="notice-card notice-danger text-sm leading-relaxed">{error}</div>}
      {success && <div role="status" className="notice-card notice-ok text-sm leading-relaxed">{success}</div>}

      <button type="submit" disabled={loading || !storageStatus.configured} className="btn-lux btn-lux-primary w-full">
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

  const summary = useMemo(() => {
    const counts = {
      total: props.documents.length,
      waiting: 0,
      processing: 0,
      published: 0,
      failed: 0,
    };
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
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="eyebrow text-[10px]">Arsip kerja</p>
          <h1 className="display text-[30px] sm:text-[34px] font-semibold text-slate-900 tracking-tight leading-tight">
            Dokumen Desa
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            {props.memberStatus === "VERIFIED"
              ? "Upload langsung masuk ke tahap processing dan siap ditinjau tim PantauDesa."
              : "Upload berfungsi sebagai kontribusi kerja yang akan menunggu persetujuan Admin Desa VERIFIED."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="pill-info rounded-full px-3 py-1 text-[11px] font-semibold">{summary.total} dokumen</span>
          {summary.waiting > 0 && <span className="pill-warn rounded-full px-3 py-1 text-[11px] font-semibold">{summary.waiting} menunggu</span>}
          {summary.processing > 0 && <span className="pill-info rounded-full px-3 py-1 text-[11px] font-semibold">{summary.processing} diproses</span>}
          {summary.published > 0 && <span className="pill-ok rounded-full px-3 py-1 text-[11px] font-semibold">{summary.published} publish</span>}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="metric-card">
          <p className="metric-label">Total arsip</p>
          <p className="metric-value">{summary.total}</p>
          <p className="metric-note">dokumen tercatat</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Menunggu</p>
          <p className="metric-value">{summary.waiting}</p>
          <p className="metric-note">perlu approval</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Processing</p>
          <p className="metric-value">{summary.processing}</p>
          <p className="metric-note">sedang ditinjau</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Terbit</p>
          <p className="metric-value">{summary.published}</p>
          <p className="metric-note">siap tampil publik</p>
        </div>
      </section>

      {actionMsg && (
        <div
          role={actionMsg.kind === "error" ? "alert" : "status"}
          className={`notice-card ${actionMsg.kind === "ok" ? "notice-ok" : "notice-danger"} text-sm flex items-start gap-3`}
        >
          <span className={`mt-0.5 inline-flex w-8 h-8 rounded-2xl items-center justify-center ${actionMsg.kind === "ok" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
            {actionMsg.kind === "ok" ? <Check size={14} aria-hidden /> : <X size={14} aria-hidden />}
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
          storageStatus={props.storageStatus}
          onUploaded={() => router.refresh()}
        />
      )}

      {!props.storageStatus.configured && (
        <div className="notice-card notice-warn text-sm leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shrink-0">
              <ShieldAlert size={18} aria-hidden />
            </span>
            <div>
              <p className="font-semibold">Storage belum siap untuk flow dokumen</p>
              <p className="mt-1 opacity-90">
                Konfigurasi upload dan preview masih menunggu env server-side yang valid serta bucket private yang aktif.
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
            <FolderKanban size={18} aria-hidden />
          </span>
          <div>
            <p className="eyebrow text-[10px]">Daftar dokumen</p>
            <h2 className="text-[18px] font-semibold text-slate-900 mt-1">Riwayat arsip untuk desa ini</h2>
          </div>
        </div>

        {props.documents.length === 0 ? (
          <div className="lux-card p-10 text-center space-y-3">
            <FileText size={28} className="mx-auto text-slate-300" aria-hidden />
            <p className="text-sm text-slate-500">Belum ada dokumen yang tercatat untuk desa ini.</p>
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

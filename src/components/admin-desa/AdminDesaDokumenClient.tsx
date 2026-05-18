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
  X,
} from "lucide-react";
import type { StorageConfigurationStatus } from "@/lib/storage/supabase-storage";
import { ToastContainer, useToast, type ToastType } from "@/components/ui/Toast";
import {
  approveAdminDesaDocument,
  fetchAdminDesaDocumentPreviewUrl,
  rejectAdminDesaDocument,
  uploadAdminDesaDocuments,
} from "./api";
import {
  getAcceptedFileInputValue,
  getAllowedFormatLabels,
  validateUpload,
} from "@/lib/storage/upload-validation";
import { BACK_OFFICE_COPY } from "@/lib/back-office-copy";
import {
  canApproveAdminDesaDocuments,
  canRejectAdminDesaDocuments,
  canUploadAdminDesaDocuments,
  type AdminDesaDocumentStatus,
} from "@/lib/admin-desa/policy";

const COPY = BACK_OFFICE_COPY.adminDesa.documents;
const COMMON_COPY = BACK_OFFICE_COPY.adminDesa.common;

type DocStatus = AdminDesaDocumentStatus;

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

const STATUS_PILL: Record<DocStatus, { label: string; cls: string }> = {
  WAITING_VERIFIED_APPROVAL: { label: COPY.status.WAITING_VERIFIED_APPROVAL, cls: "pill-warn" },
  PROCESSING: { label: COPY.status.PROCESSING, cls: "pill-info" },
  PUBLISHED: { label: COPY.status.PUBLISHED, cls: "pill-ok" },
  REJECTED: { label: COPY.status.REJECTED, cls: "pill-danger" },
  FAILED: { label: COPY.status.FAILED, cls: "pill-danger" },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocCard({
  doc,
  canApprove,
  canReject,
  onApprove,
  onReject,
  onPreview,
  busyId,
}: {
  doc: DocRow;
  canApprove: boolean;
  canReject: boolean;
  onApprove: (id: string) => void;
  onReject: (doc: DocRow) => void;
  onPreview: (id: string) => void;
  busyId: string | null;
}) {
  const status = STATUS_PILL[doc.status];
  const uploaderName = doc.uploadedBy?.nama ?? doc.uploadedBy?.username ?? doc.uploadedBy?.email ?? "-";
  const showVerifiedActions = doc.status === "WAITING_VERIFIED_APPROVAL" && (canApprove || canReject);

  return (
    <article className="lux-card t-spring space-y-3 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-[14px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-[15px]">
            {doc.title}
          </p>
          <p className="text-[11px] text-slate-500">
            {doc.fileType} · {formatBytes(doc.fileSize)}
          </p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.cls}`}>
          {status.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
        <span>{doc.category}</span>
        <span className="text-slate-300">·</span>
        <span>{uploaderName}</span>
        <span className="text-slate-300">·</span>
        <span>{new Date(doc.createdAt).toLocaleDateString("id-ID", { dateStyle: "short" })}</span>
      </div>

      {doc.status === "REJECTED" && doc.rejectedReason ? (
        <div className="notice-card notice-danger text-xs">
          <p className="font-semibold">{COPY.rejectedReasonLabel}</p>
          <p className="mt-1">{doc.rejectedReason}</p>
        </div>
      ) : null}

      {doc.status === "FAILED" && doc.failedReason ? (
        <div className="notice-card notice-danger text-xs">
          <p className="font-semibold">{COPY.failedReasonLabel}</p>
          <p className="mt-1">{doc.failedReason}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPreview(doc.id)}
          disabled={busyId === doc.id}
          className="btn-lux btn-lux-ghost text-xs"
        >
          <ExternalLink size={11} aria-hidden /> {COPY.actions.preview}
        </button>

        {showVerifiedActions && canApprove ? (
          <button
            type="button"
            onClick={() => onApprove(doc.id)}
            disabled={busyId === doc.id}
            className="btn-lux btn-lux-success text-xs"
          >
            <Check size={11} aria-hidden /> {COPY.actions.approve}
          </button>
        ) : null}

        {showVerifiedActions && canReject ? (
          <button
            type="button"
            onClick={() => onReject(doc)}
            disabled={busyId === doc.id}
            className="btn-lux btn-lux-danger text-xs"
          >
            <X size={11} aria-hidden /> {COPY.actions.reject}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function RejectDialog({
  document,
  loading,
  onClose,
  onConfirm,
}: {
  document: DocRow | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!document) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextReason = reason.trim();
    if (!nextReason) {
      setError(COPY.rejectModal.required);
      return;
    }
    setError("");
    await onConfirm(nextReason);
    setReason("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <div className="space-y-1">
          <p className="eyebrow text-[10px]">{COPY.headingEyebrow}</p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">
            {COPY.rejectModal.title}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            {COPY.rejectModal.body}
          </p>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">{document.title}</p>
          <p className="mt-1 text-xs text-slate-500">{document.category}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="field-label text-xs">{COPY.rejectModal.reasonLabel}</label>
            <textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) setError("");
              }}
              rows={4}
              maxLength={2000}
              placeholder={COPY.rejectModal.reasonPlaceholder}
              className="field-lux min-h-[120px] resize-none text-sm"
            />
            {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setReason("");
                setError("");
                onClose();
              }}
              disabled={loading}
              className="btn-lux btn-lux-ghost text-sm"
            >
              {COPY.actions.closeReject}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-lux btn-lux-danger text-sm"
            >
              {loading ? COPY.rejectModal.submitting : COPY.rejectModal.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length > maxFilesPerUpload) {
      onNotify(COPY.upload.maxFilesError(maxFilesPerUpload), "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFiles([]);
      return;
    }
    setFiles(selected);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!storageStatus.configured) {
      const missing = storageStatus.missingEnvVars.join(", ");
      const invalid = storageStatus.invalidEnvVars.join(", ");
      const detail = missing
        ? COPY.upload.missingStorageDetail(missing)
        : invalid
          ? COPY.upload.invalidStorageDetail(invalid)
          : "Hubungi admin PantauDesa.";
      onNotify(COPY.upload.storageNotReady(detail), "error");
      return;
    }
    if (files.length === 0) {
      onNotify(COPY.upload.chooseFileError, "error");
      return;
    }
    if (!ack) {
      onNotify(COPY.upload.responsibilityError, "error");
      return;
    }

    for (const file of files) {
      const validation = validateUpload(file);
      if (!validation.ok) {
        if (validation.code === "FILE_TOO_LARGE") {
          onNotify(COPY.upload.fileTooLargeError(file.name, maxFileSizeMB), "error");
          return;
        }
        onNotify(COPY.upload.fileTypeError(file.name), "error");
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      for (const file of files) formData.append("files", file);
      formData.append("title", title);
      formData.append("category", category);
      formData.append("responsibilityAck", "true");
      const persisted = await uploadAdminDesaDocuments(formData);
      onNotify(COPY.upload.uploadSuccess(persisted), "success");
      reset();
      onUploaded();
    } catch (error) {
      onNotify(error instanceof Error ? error.message : COMMON_COPY.connectionError, "error");
    } finally {
      setLoading(false);
    }
  }

  const formats = getAllowedFormatLabels(allowedMimeTypes).join(", ");
  const acceptValue = getAcceptedFileInputValue(allowedMimeTypes);

  return (
    <form data-testid="document-upload-form" onSubmit={handleSubmit} className="lux-panel space-y-4 p-5 sm:p-6">
      <div className="space-y-1">
        <p className="eyebrow text-[10px]">{COPY.upload.eyebrow}</p>
        <h2 className="text-[18px] font-semibold tracking-tight text-slate-900 sm:text-[20px]">
          {COPY.upload.title}
        </h2>
        <p className="text-xs text-slate-500">
          {COPY.upload.helper(maxFileSizeMB, maxFilesPerUpload, formats)}
        </p>
      </div>

      {!storageStatus.configured ? (
        <div className="notice-card notice-warn text-xs" role="status">
          <p className="font-semibold">{COPY.upload.storageNotConfiguredTitle}</p>
          <p className="mt-1">{COPY.upload.storageNotConfiguredBody}</p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="field-label text-xs">{COPY.upload.titleLabel}</label>
          <input
            type="text"
            value={title}
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={COPY.upload.titlePlaceholder}
            className="field-lux text-sm"
            required
          />
        </div>

        <div>
          <label className="field-label text-xs">{COPY.upload.categoryLabel}</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="select-lux text-sm"
            required
          >
            {categories.map((categoryOption) => (
              <option key={categoryOption.value} value={categoryOption.value}>
                {categoryOption.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="field-label text-xs">{COPY.upload.attachmentLabel}</label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptValue}
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-semibold file:text-indigo-700"
            required
          />
        </div>
      </div>

      {files.length > 0 ? (
        <div className="grid gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
        <input
          type="checkbox"
          checked={ack}
          onChange={(event) => setAck(event.target.checked)}
          className="mt-0.5 accent-[#1E1B4B]"
        />
        <span className="leading-relaxed text-slate-700">{COPY.upload.responsibility}</span>
      </label>

      <button type="submit" disabled={loading || !storageStatus.configured} className="btn-lux btn-lux-primary w-full text-sm">
        {loading ? COPY.upload.uploading : (
          <>
            <Upload size={13} aria-hidden />{" "}
            {files.length > 1 ? COPY.upload.uploadMultipleDocuments(files.length) : COPY.upload.uploadDocument}
          </>
        )}
      </button>
    </form>
  );
}

export default function AdminDesaDokumenClient(props: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DocRow | null>(null);
  const { toasts, toast, removeToast } = useToast();
  const canUpload = canUploadAdminDesaDocuments(props.memberStatus);
  const canApprove = canApproveAdminDesaDocuments(props.memberStatus, props.memberRole);
  const canReject = canRejectAdminDesaDocuments(props.memberStatus, props.memberRole);

  const summary = useMemo(() => {
    const counts = { total: props.documents.length, waiting: 0, processing: 0, published: 0, failed: 0, rejected: 0 };
    for (const doc of props.documents) {
      if (doc.status === "WAITING_VERIFIED_APPROVAL") counts.waiting += 1;
      if (doc.status === "PROCESSING") counts.processing += 1;
      if (doc.status === "PUBLISHED") counts.published += 1;
      if (doc.status === "FAILED") counts.failed += 1;
      if (doc.status === "REJECTED") counts.rejected += 1;
    }
    return counts;
  }, [props.documents]);

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      await approveAdminDesaDocument(id);
      toast(COPY.actions.forwardedToPantauDesa, "success");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : COMMON_COPY.connectionError, "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(reason: string) {
    if (!rejectTarget) return;
    setBusyId(rejectTarget.id);
    try {
      await rejectAdminDesaDocument(rejectTarget.id, reason);
      toast(COPY.actions.rejectSuccess, "success");
      setRejectTarget(null);
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : COMMON_COPY.connectionError, "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handlePreview(id: string) {
    setBusyId(id);
    try {
      const signedUrl = await fetchAdminDesaDocumentPreviewUrl(id);
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast(error instanceof Error ? error.message : COMMON_COPY.connectionError, "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="eyebrow text-[10px]">{COPY.headingEyebrow}</p>
          <h1 className="display text-[22px] font-semibold tracking-tight text-slate-900 sm:text-[26px]">
            {COPY.headingTitle}
          </h1>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="pill-info rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
            {summary.total} {COPY.summary.documents}
          </span>
          {summary.waiting > 0 ? (
            <span className="pill-warn rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              {summary.waiting} {COPY.summary.waiting.toLowerCase()}
            </span>
          ) : null}
          {summary.processing > 0 ? (
            <span className="pill-info rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              {summary.processing} {COPY.status.PROCESSING.toLowerCase()}
            </span>
          ) : null}
          {summary.published > 0 ? (
            <span className="pill-ok rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              {summary.published} {COPY.summary.published.toLowerCase()}
            </span>
          ) : null}
          {summary.rejected > 0 ? (
            <span className="pill-danger rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              {summary.rejected} {COPY.status.REJECTED.toLowerCase()}
            </span>
          ) : null}
        </div>
      </div>

      {canUpload ? (
        <UploadForm
          categories={props.categories}
          maxFileSizeMB={props.maxFileSizeMB}
          maxFilesPerUpload={props.maxFilesPerUpload}
          allowedMimeTypes={props.allowedMimeTypes}
          storageStatus={props.storageStatus}
          onUploaded={() => router.refresh()}
          onNotify={toast}
        />
      ) : null}

      {!props.storageStatus.configured ? (
        <div className="notice-card notice-warn text-xs">
          <div className="flex items-start gap-2">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
            <p>{COPY.upload.storageNotReadyShort}</p>
          </div>
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <FolderKanban size={14} className="text-indigo-600" aria-hidden />
          <p className="text-[11px] font-semibold text-slate-600">{COPY.list.title}</p>
        </div>

        {props.documents.length === 0 ? (
          <div className="lux-card space-y-2 p-8 text-center">
            <FileText size={22} className="mx-auto text-slate-300" aria-hidden />
            <p className="text-sm text-slate-500">{COPY.list.empty}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {props.documents.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                canApprove={canApprove}
                canReject={canReject}
                onApprove={handleApprove}
                onReject={setRejectTarget}
                onPreview={handlePreview}
                busyId={busyId}
              />
            ))}
          </div>
        )}
      </section>

      <RejectDialog
        document={rejectTarget}
        loading={busyId === rejectTarget?.id}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

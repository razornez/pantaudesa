"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ExternalLink,
  FileText,
  Sparkles,
} from "lucide-react";
import {
  AI_MAPPABLE_DESA_FIELDS,
  readAiMappingDraft,
  type AiMappingDraft,
  type AiMappableDesaField,
} from "@/lib/admin-claim/ai-mapping";
import { ToastContainer, useToast, type ToastType } from "@/components/ui/Toast";
import { readVillageVersionCandidate } from "@/lib/versioning/desa-versioning";

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
  aiMappingResult?: unknown;
  createdAt: string;
  updatedAt: string;
  desa: { id: string; nama: string; kecamatan: string; kabupaten: string };
  uploadedBy: { id: string; nama: string | null; username: string | null; email: string } | null;
}

interface DraftApiPayload {
  ok: boolean;
  reused: boolean;
  aiMappingStatus: string | null;
  draft: AiMappingDraft;
}

interface PublishApiPayload {
  ok: boolean;
  documentId: string;
  newStatus: string;
  versionNumber?: number;
  appliedFields?: string[];
}

const STATUS_META: Record<DocStatus, { label: string; pill: string; note: string }> = {
  WAITING_VERIFIED_APPROVAL: {
    label: "Belum masuk review",
    pill: "pill-warn",
    note: "Dokumen masih menunggu persetujuan admin utama desa sebelum bisa direview internal.",
  },
  PROCESSING: {
    label: "Perlu review internal",
    pill: "pill-info",
    note: "Dokumen siap dicek, dilengkapi, lalu diputuskan untuk dipublish atau tidak.",
  },
  PUBLISHED: {
    label: "Sudah dipublikasikan",
    pill: "pill-ok",
    note: "Data dari dokumen ini sudah diterapkan ke halaman desa dan tidak perlu aksi lanjut.",
  },
  FAILED: {
    label: "Perlu unggahan ulang",
    pill: "pill-danger",
    note: "Dokumen tidak bisa dipakai dan pengunggah perlu menerima alasan yang jelas.",
  },
};

const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "WAITING_VERIFIED_APPROVAL", label: "Menunggu" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "PUBLISHED", label: "Sudah tayang" },
  { value: "FAILED", label: "Gagal" },
] as const;

const FIELD_LABELS: Record<(typeof AI_MAPPABLE_DESA_FIELDS)[number], string> = {
  websiteUrl: "Website resmi",
  kategori: "Kategori desa",
  tahunData: "Tahun data",
  jumlahPenduduk: "Jumlah penduduk",
  kecamatan: "Kecamatan",
  kabupaten: "Kabupaten/Kota",
  provinsi: "Provinsi",
};

function formatReviewStatusLabel(status: string | null) {
  if (!status) return null;
  if (status === "DRAFT_READY_REVIEW" || status === "DRAFT_PENDING_REVIEW") {
    return "Draft review tersedia";
  }
  if (status === "DONE") return "Review selesai";
  if (status === "FAILED") return "Review gagal";
  if (status === "PENDING") return "Menunggu dicek";
  return status;
}

function buildStatusHref(pathname: string, status: string) {
  if (!status) return pathname;
  return `${pathname}?status=${encodeURIComponent(status)}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCategory(category: string) {
  if (category === "intake_workbench") return "Intake Workbench";
  return category.replace(/[_-]+/g, " ");
}

function getUploaderName(doc: DocRow) {
  return doc.uploadedBy?.nama ?? doc.uploadedBy?.username ?? doc.uploadedBy?.email ?? "—";
}

function getDraftButtonLabel(doc: DocRow) {
  return readAiMappingDraft(doc.aiMappingResult) ? "Lanjut review data" : "Mulai review data";
}

function getDraftSummary(doc: DocRow) {
  const draft = readAiMappingDraft(doc.aiMappingResult);
  if (!draft) return null;

  const filledFields = AI_MAPPABLE_DESA_FIELDS.filter((field) => draft.fields[field] !== undefined);
  return {
    draft,
    filledCount: filledFields.length,
  };
}

function getVersionCandidateSummary(doc: DocRow) {
  const candidate = readVillageVersionCandidate(doc.aiMappingResult);
  if (!candidate) return null;

  return {
    candidate,
    changedCount: candidate.changedFields.length,
  };
}

function getNextStepCopy(doc: DocRow) {
  const draft = getDraftSummary(doc);
  const versionCandidate = getVersionCandidateSummary(doc);

  if (doc.status === "WAITING_VERIFIED_APPROVAL") {
    return {
      title: "Tunggu persetujuan admin utama",
      note: "Dokumen ini belum bisa direview internal sebelum lolos persetujuan admin utama desa.",
      tone: "warn" as const,
    };
  }

  if (doc.status === "PROCESSING" && draft) {
    return {
      title: "Lanjut cek draft review",
      note:
        draft.filledCount > 0
          ? `Draft review sudah punya ${draft.filledCount} field terisi. Buka review data untuk cek, koreksi, atau publish.`
          : "Draft review sudah dibuat, tetapi field penting masih perlu dilengkapi sebelum publish.",
      tone: "info" as const,
    };
  }

  if (doc.status === "PROCESSING") {
    return {
      title: "Mulai review data",
      note:
        versionCandidate && versionCandidate.changedCount > 0
          ? `Ada ${versionCandidate.changedCount} perubahan yang terdeteksi. Buka review data untuk memastikan semuanya benar.`
          : "Buka review data untuk mulai cek isi dokumen dan putuskan apakah bisa dipublish.",
      tone: "info" as const,
    };
  }

  if (doc.status === "PUBLISHED") {
    return {
      title: "Selesai dipublikasikan",
      note: "Dokumen ini sudah selesai. Buka hanya jika Anda perlu memastikan hasil publish sebelumnya.",
      tone: "ok" as const,
    };
  }

  return {
    title: "Minta pengunggah memperbaiki",
    note: "Dokumen ini sudah ditandai gagal. Langkah berikutnya adalah menunggu unggahan ulang atau perbaikan dari pengunggah.",
    tone: "danger" as const,
  };
}

function getNextStepClassName(tone: "warn" | "info" | "ok" | "danger") {
  switch (tone) {
    case "warn":
      return "border-amber-100 bg-amber-50/70 text-amber-900";
    case "ok":
      return "border-emerald-100 bg-emerald-50/70 text-emerald-900";
    case "danger":
      return "border-rose-100 bg-rose-50/70 text-rose-900";
    default:
      return "border-sky-100 bg-sky-50/70 text-sky-900";
  }
}

function toInputValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function formatReviewValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === ""
    ? "Belum ada nilai"
    : String(value);
}

function getFieldReviewContext(
  key: AiMappableDesaField,
  draft: AiMappingDraft | null,
  versionCandidate: ReturnType<typeof readVillageVersionCandidate>,
) {
  const publicValue = versionCandidate?.baseSnapshot[key];
  const draftValue = draft?.fields[key];
  const hasDraftValue = draftValue !== undefined;
  const isChangedFromPublic =
    hasDraftValue && toInputValue(draftValue) !== toInputValue(publicValue);

  return {
    publicValue,
    draftValue,
    hasDraftValue,
    isChangedFromPublic,
  };
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
  const normalizedDraft = readAiMappingDraft(doc.aiMappingResult);
  const versionCandidate = readVillageVersionCandidate(doc.aiMappingResult);
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const key of AI_MAPPABLE_DESA_FIELDS) {
      const value = normalizedDraft?.fields[key];
      out[key] = toInputValue(value);
    }
    return out;
  });
  const [note, setNote] = useState(normalizedDraft?.notes ?? "");
  const [loading, setLoading] = useState(false);

  function buildPayloadFields() {
    const payloadFields: Record<string, string | number | null> = {};

    for (const key of AI_MAPPABLE_DESA_FIELDS) {
      const value = fields[key]?.trim();
      if (!value) continue;

      if (key === "tahunData" || key === "jumlahPenduduk") {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
          onNotify(`Field ${FIELD_LABELS[key]} harus angka.`, "error");
          return null;
        }
        payloadFields[key] = numeric;
      } else {
        payloadFields[key] = value;
      }
    }

    return payloadFields;
  }

  async function handleSaveDraft() {
    const payloadFields = buildPayloadFields();
    if (!payloadFields) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/internal-admin/documents/${doc.id}/draft-mapping`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: payloadFields,
          notes: note || undefined,
        }),
      });
      const data = (await res.json()) as DraftApiPayload | { error?: string };

      if (!res.ok || !("ok" in data) || !data.ok) {
        const errorMessage =
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Draft review belum berhasil disimpan.";
        onNotify(errorMessage, "error");
        return;
      }

      onNotify("Draft review disimpan. Anda bisa lanjut lagi nanti.", "success");
      onDone();
    } catch {
      onNotify("Koneksi bermasalah. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    const payloadFields = buildPayloadFields();
    if (!payloadFields) return;

    setLoading(true);

    try {

      const res = await fetch(`/api/internal-admin/documents/${doc.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: payloadFields, note: note || undefined }),
      });
      const data = (await res.json()) as PublishApiPayload | { error?: string };

      if (!res.ok || !("ok" in data) || !data.ok) {
        const errorMessage =
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Dokumen belum berhasil dipublikasikan.";
        onNotify(errorMessage, "error");
        return;
      }

      const successNote =
        typeof data.versionNumber === "number"
          ? `Dokumen berhasil dipublikasikan sebagai versi ${data.versionNumber}.`
          : "Dokumen berhasil dipublikasikan.";
      onNotify(successNote, "success");
      onDone();
    } catch {
      onNotify("Koneksi bermasalah. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="lux-panel max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-5 sm:p-6">
        <div className="space-y-1">
          <p className="eyebrow text-[10px]">Review data dokumen</p>
          <h2 className="text-[18px] font-semibold tracking-tight text-slate-900 sm:text-[20px]">
            {doc.title}
          </h2>
          <p className="text-xs text-slate-500">{doc.desa.nama}</p>
        </div>

        {normalizedDraft?.notes ? (
          <div className="notice-card notice-info text-xs">{normalizedDraft.notes}</div>
        ) : null}

        <div className="notice-card notice-warn text-xs">
          Halaman ini dipakai untuk mengecek hasil otomatis, melengkapi field yang perlu, lalu
          memutuskan apakah mau disimpan dulu atau langsung dipublikasikan.
        </div>

        {versionCandidate ? (
          <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2 text-xs text-sky-900">
            Calon versi ini membawa {versionCandidate.changedFields.length} field berubah. Publish
            final akan membuat versi publik baru hanya dari field yang Anda konfirmasi di form ini.
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Cara pakai modal ini</p>
          <p className="mt-1">1. Lihat nilai publik saat ini pada setiap field.</p>
          <p>2. Bandingkan dengan isian draft hasil intake atau review sebelumnya.</p>
          <p>3. Ubah `Keputusan final admin` hanya untuk field yang memang ingin dipublish.</p>
          <p>4. Kosongkan field jika ingin mempertahankan nilai publik saat ini.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Legenda isi modal</p>
          <p className="mt-1">`Nilai publik saat ini` = data yang sedang tayang.</p>
          <p>`Isian draft saat ini` = hasil intake otomatis atau draft review yang terakhir disimpan.</p>
          <p>`Keputusan final admin` = isi yang benar-benar akan dipakai saat publish.</p>
        </div>

        <div className="max-h-[48vh] space-y-3 overflow-y-auto pr-1 text-sm">
          {AI_MAPPABLE_DESA_FIELDS.map((key) => {
            const fieldContext = getFieldReviewContext(key, normalizedDraft, versionCandidate);

            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <label className="field-label text-xs">{FIELD_LABELS[key]}</label>
                  {fieldContext.isChangedFromPublic ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      Ada perubahan draft
                    </span>
                  ) : fieldContext.hasDraftValue ? (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      Sama dengan publik
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      Belum ada draft
                    </span>
                  )}
                </div>

                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Nilai publik saat ini
                    </p>
                    <p className="mt-1 text-[11px] text-slate-800">
                      {formatReviewValue(fieldContext.publicValue)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-sky-100 bg-sky-50/70 px-2.5 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                      Isian draft saat ini
                    </p>
                    <p className="mt-1 text-[11px] text-sky-900">
                      {formatReviewValue(fieldContext.draftValue)}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="field-label text-xs">Keputusan final admin</label>
                  <input
                    type="text"
                    value={fields[key]}
                    onChange={(e) =>
                      setFields((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    placeholder="Kosongkan jika tidak ingin mengubah nilai publik"
                    className="field-lux text-sm"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {fieldContext.hasDraftValue ? (
                      <button
                        type="button"
                        onClick={() =>
                          setFields((prev) => ({
                            ...prev,
                            [key]: toInputValue(fieldContext.draftValue),
                          }))
                        }
                        className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-800 transition hover:bg-sky-100"
                      >
                        Pakai isi draft
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        setFields((prev) => ({
                          ...prev,
                          [key]: "",
                        }))
                      }
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Jangan ubah field ini
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Field kosong tidak ikut diubah saat publish. Jadi nilai publik saat ini akan tetap dipakai.
                  </p>
                </div>
              </div>
            );
          })}
          <div>
            <label className="field-label text-xs">Catatan</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              className="textarea-lux text-sm"
              placeholder="Catatan singkat (opsional)."
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="btn-lux btn-lux-secondary text-sm sm:flex-1"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={loading}
            className="btn-lux btn-lux-secondary text-sm sm:flex-1"
          >
            {loading ? "Menyimpan..." : "Simpan dulu"}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={loading}
            className="btn-lux btn-lux-success text-sm sm:flex-1"
          >
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
      onNotify("Alasan kegagalan wajib diisi.", "error");
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

      onNotify("Dokumen ditandai gagal.", "success");
      onDone();
    } catch {
      onNotify("Koneksi bermasalah. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="lux-panel w-full max-w-md space-y-4 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="eyebrow text-[10px]">Tandai gagal diproses</p>
          <h2 className="text-[18px] font-semibold tracking-tight text-slate-900 sm:text-[20px]">
            {doc.title}
          </h2>
          <p className="text-xs text-slate-500">{doc.desa.nama}</p>
        </div>

        <div className="notice-card notice-danger text-xs">
          Pengunggah akan lihat alasan ini. Jelaskan dengan jelas apa yang perlu diperbaiki.
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label text-xs">Alasan untuk pengunggah</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Contoh: dokumen buram, lampiran tidak sesuai."
              className="textarea-lux text-sm"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-lux btn-lux-secondary flex-1 text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-lux btn-lux-danger flex-1 text-sm"
            >
              {loading ? "Menyimpan..." : "Tandai gagal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DocCard({
  doc,
  onPublish,
  onMarkFailed,
  onNotify,
  isHighlighted,
}: {
  doc: DocRow;
  onPublish: (doc: DocRow) => void;
  onMarkFailed: (doc: DocRow) => void;
  onNotify: (message: string, type?: ToastType) => void;
  isHighlighted: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const status = STATUS_META[doc.status];
  const draftSummary = getDraftSummary(doc);
  const versionCandidateSummary = getVersionCandidateSummary(doc);
  const nextStep = getNextStepCopy(doc);

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
      onNotify("Koneksi bermasalah. Coba lagi.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function runDraftMapping() {
    const existingDraft = readAiMappingDraft(doc.aiMappingResult);
    if (existingDraft) {
      onNotify("Review data ini sudah pernah disimpan. Saya buka lagi sekarang.", "success");
      onPublish(doc);
      return;
    }

    setBusy(true);

    try {
      const res = await fetch(`/api/internal-admin/documents/${doc.id}/draft-mapping`, {
        method: "POST",
      });
      const data = (await res.json()) as DraftApiPayload | { error?: string };

      if (!res.ok || !("ok" in data) || !data.ok) {
        onNotify(
          ("error" in data && typeof data.error === "string"
            ? data.error
            : "Draft mapping belum berhasil dibuat."),
          "error",
        );
        return;
      }

      onNotify(
        data.reused ? "Draft review lama dibuka kembali." : "Review data siap diisi.",
        "success",
      );
      onPublish({
        ...doc,
        aiMappingStatus: data.aiMappingStatus,
        aiMappingResult: data.draft,
      });
    } catch {
      onNotify("Koneksi bermasalah. Coba lagi.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      id={`document-card-${doc.id}`}
      className="lux-card t-spring scroll-mt-24 space-y-3 p-4 sm:p-5"
      style={isHighlighted ? { animation: "intake-focus-flash 2200ms ease-out 1" } : undefined}
    >
      {isHighlighted ? (
        <div className="rounded-xl border border-emerald-200 bg-white/70 px-3 py-2 text-[11px] font-semibold text-emerald-900">
          Ini dokumen yang Anda buka dari riwayat intake.
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold leading-snug tracking-tight text-slate-900 sm:text-[15px]">
            {doc.title}
          </p>
          <p className="text-[11px] text-slate-500 sm:text-xs">{doc.desa.nama}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.pill}`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
        <span>{getUploaderName(doc)}</span>
        <span className="text-slate-300">·</span>
        <span>
          {doc.fileType} · {formatBytes(doc.fileSize)}
        </span>
        <span className="text-slate-300">·</span>
        <span>{new Date(doc.createdAt).toLocaleDateString("id-ID", { dateStyle: "short" })}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
          {formatCategory(doc.category)}
        </span>
        {formatReviewStatusLabel(doc.aiMappingStatus) ? (
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
            {formatReviewStatusLabel(doc.aiMappingStatus)}
          </span>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
        <p className="font-semibold text-slate-900">Arti status ini</p>
        <p className="mt-1">{status.note}</p>
      </div>

      {draftSummary ? (
        <div className="rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2 text-[11px] text-sky-800">
          Draft review tersedia dengan {draftSummary.filledCount} field terisi. Tombol `Review
          data` akan membuka isi review ini untuk dicek, dilengkapi, atau dipublikasikan.
        </div>
      ) : null}

      {versionCandidateSummary ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-[11px] text-emerald-900">
          Calon versi review siap: {versionCandidateSummary.changedCount} field berubah sejak data
          publik saat ini. Ini belum tayang sebelum tombol `Publikasikan sekarang` diselesaikan.
        </div>
      ) : null}

      <div
        className={`rounded-xl border px-3 py-2 text-[11px] ${getNextStepClassName(nextStep.tone)}`}
      >
        <p className="font-semibold">{nextStep.title}</p>
        <p className="mt-1">{nextStep.note}</p>
      </div>

      {doc.status === "FAILED" && doc.failedReason ? (
        <div className="notice-card notice-danger text-xs">
          <p className="font-semibold">Alasan:</p>
          <p className="mt-1">{doc.failedReason}</p>
        </div>
      ) : null}

      {doc.status === "PROCESSING" ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openPreview}
            disabled={busy}
            className="btn-lux btn-lux-ghost text-xs"
          >
            <ExternalLink size={11} aria-hidden /> Preview
          </button>
          <button
            type="button"
            onClick={runDraftMapping}
            disabled={busy}
            className="btn-lux btn-lux-success text-xs"
          >
            <Sparkles size={11} aria-hidden /> {getDraftButtonLabel(doc)}
          </button>
          <button
            type="button"
            onClick={() => onMarkFailed(doc)}
            disabled={busy}
            className="btn-lux btn-lux-danger text-xs"
          >
            <AlertTriangle size={11} aria-hidden /> Tidak bisa dipakai
          </button>
        </div>
      ) : null}

      {doc.status === "WAITING_VERIFIED_APPROVAL" ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openPreview}
            disabled={busy}
            className="btn-lux btn-lux-ghost text-xs"
          >
            <ExternalLink size={11} aria-hidden /> Preview
          </button>
          <button
            type="button"
            onClick={() => onMarkFailed(doc)}
            disabled={busy}
            className="btn-lux btn-lux-danger text-xs"
          >
            <AlertTriangle size={11} aria-hidden /> Tandai gagal
          </button>
        </div>
      ) : null}
    </article>
  );
}

export default function InternalDocumentReviewQueue({
  documents,
  statusFilter,
  focusDocumentId,
}: {
  documents: DocRow[];
  statusFilter: string;
  focusDocumentId?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const [publishTarget, setPublishTarget] = useState<DocRow | null>(null);
  const [failTarget, setFailTarget] = useState<DocRow | null>(null);

  const summary = useMemo(
    () =>
      documents.reduce(
        (acc, doc) => {
          acc.total += 1;
          if (doc.status === "WAITING_VERIFIED_APPROVAL") acc.waiting += 1;
          if (doc.status === "PROCESSING") acc.processing += 1;
          if (doc.status === "PUBLISHED") acc.published += 1;
          if (doc.status === "FAILED") acc.failed += 1;
          return acc;
        },
        { total: 0, waiting: 0, processing: 0, published: 0, failed: 0 },
      ),
    [documents],
  );

  const stageCards = [
    {
      label: "Belum masuk review",
      count: summary.waiting,
      note: "Masih menunggu persetujuan admin utama desa.",
      className: "border-amber-200 bg-amber-50 text-amber-900",
    },
    {
      label: "Perlu review internal",
      count: summary.processing,
      note: "Siap dicek, dilengkapi, lalu diputuskan.",
      className: "border-sky-200 bg-sky-50 text-sky-900",
    },
    {
      label: "Sudah dipublikasikan",
      count: summary.published,
      note: "Perubahan dari dokumen ini sudah tayang di data desa.",
      className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    },
    {
      label: "Perlu unggahan ulang",
      count: summary.failed,
      note: "Dokumen gagal dipakai dan menunggu perbaikan pengunggah.",
      className: "border-rose-200 bg-rose-50 text-rose-900",
    },
  ];

  const refresh = () => router.refresh();

  useEffect(() => {
    if (!focusDocumentId) return;

    const focusedDocument =
      documents.find((doc) => doc.id === focusDocumentId && doc.status === "PROCESSING") ?? null;

    const rafId = window.requestAnimationFrame(() => {
      const target = document.getElementById(`document-card-${focusDocumentId}`);
      target?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    const openTimerId = focusedDocument
      ? window.setTimeout(() => {
          setPublishTarget(focusedDocument);
        }, 900)
      : null;

    return () => {
      window.cancelAnimationFrame(rafId);
      if (openTimerId !== null) {
        window.clearTimeout(openTimerId);
      }
    };
  }, [documents, focusDocumentId]);

  return (
    <div className="space-y-5" data-testid="internal-documents-queue">
      <style jsx global>{`
        @keyframes intake-focus-flash {
          0% {
            background-color: rgba(220, 252, 231, 0.98);
            border-color: rgba(74, 222, 128, 0.92);
            box-shadow: 0 0 0 1px rgba(74, 222, 128, 0.28);
          }
          55% {
            background-color: rgba(220, 252, 231, 0.72);
            border-color: rgba(74, 222, 128, 0.7);
            box-shadow: 0 0 0 1px rgba(74, 222, 128, 0.16);
          }
          100% {
            background-color: rgba(255, 255, 255, 1);
            border-color: rgba(241, 245, 249, 1);
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
          }
        }
      `}</style>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="eyebrow text-[10px]">Review data desa</p>
          <h1 className="display text-[22px] font-semibold tracking-tight text-slate-900 sm:text-[26px]">
            Antrean review data
          </h1>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="pill-info rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
            {summary.total} dokumen
          </span>
          {summary.waiting > 0 ? (
            <span className="pill-warn rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              {summary.waiting} menunggu
            </span>
          ) : null}
          {summary.processing > 0 ? (
            <span className="pill-warn rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              {summary.processing} diproses
            </span>
          ) : null}
          {summary.published > 0 ? (
            <span className="pill-ok rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              {summary.published} tayang
            </span>
          ) : null}
          {summary.failed > 0 ? (
            <span className="pill-danger rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              {summary.failed} gagal
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">Cara pakai halaman ini</p>
        <p className="mt-1">1. Cari kartu dengan blok `Langkah berikutnya` yang sesuai kebutuhan Anda.</p>
        <p>2. Buka `Review data` untuk cek dan koreksi isi dokumen.</p>
        <p>3. Klik `Simpan dulu` jika belum final, atau `Publikasikan sekarang` jika sudah yakin.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stageCards.map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border px-3 py-3 text-xs ${item.className}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{item.label}</p>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-current">
                {item.count}
              </span>
            </div>
            <p className="mt-1 leading-relaxed">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildStatusHref(pathname || "/internal-admin/documents", tab.value)}
            prefetch={false}
            className={`btn-lux ${
              statusFilter === tab.value ? "btn-lux-primary" : "btn-lux-ghost"
            } !min-h-[36px] text-[11px] sm:!min-h-[40px] sm:text-xs`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {documents.length === 0 ? (
        <div className="lux-card space-y-2 p-8 text-center">
          <FileText size={24} className="mx-auto text-slate-300" aria-hidden />
          <p className="text-sm text-slate-500">Tidak ada dokumen pada filter ini.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              onPublish={setPublishTarget}
              onMarkFailed={setFailTarget}
              onNotify={toast}
              isHighlighted={focusDocumentId === doc.id}
            />
          ))}
        </div>
      )}

      {publishTarget ? (
        <PublishModal
          doc={publishTarget}
          onNotify={toast}
          onClose={() => setPublishTarget(null)}
          onDone={() => {
            setPublishTarget(null);
            refresh();
          }}
        />
      ) : null}

      {failTarget ? (
        <MarkFailedModal
          doc={failTarget}
          onNotify={toast}
          onClose={() => setFailTarget(null)}
          onDone={() => {
            setFailTarget(null);
            refresh();
          }}
        />
      ) : null}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

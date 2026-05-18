"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AI_MAPPABLE_DESA_FIELDS,
  readAiMappingDraft,
} from "@/lib/admin-claim/ai-mapping";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import {
  fetchTemplateRibbonInfo,
  markDocumentFailed,
  publishDocumentReview,
} from "@/components/internal-admin/review-queue/api";
import { FIELD_LABELS } from "@/components/internal-admin/review-queue/constants";
import { PublishCoverageNotices } from "@/components/internal-admin/review-queue/PublishCoverageNotices";
import type { TemplateRibbonInfo } from "@/components/internal-admin/review-queue/types";
import type { IntakeReviewDesa, IntakeReviewDocument } from "@/lib/internal-admin/intake-review-page";
import type { PipelineResult } from "./types";

interface IntakeFinalReviewSectionProps {
  document: IntakeReviewDocument;
  desa: IntakeReviewDesa;
  result: PipelineResult;
  onDone: (nextStatus?: string) => void;
}

function isEditableStatus(status: string) {
  return status === "PROCESSING" || status === "WAITING_VERIFIED_APPROVAL";
}

export function IntakeFinalReviewSection({
  document,
  desa,
  result,
  onDone,
}: IntakeFinalReviewSectionProps) {
  const { toasts, toast, removeToast } = useToast();
  const normalizedDraft = useMemo(() => readAiMappingDraft(result), [result]);
  const [templateInfo, setTemplateInfo] = useState<TemplateRibbonInfo | null>(null);
  const [failedReason, setFailedReason] = useState("");
  const [loading, setLoading] = useState<"publish" | "failed" | null>(null);
  const editable = isEditableStatus(document.status);

  useEffect(() => {
    let cancelled = false;
    fetchTemplateRibbonInfo(desa.id)
      .then((data) => {
        if (!cancelled) setTemplateInfo(data);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [desa.id]);

  function buildPayloadFields() {
    const payloadFields: Record<string, string | number | null> = {};

    for (const key of AI_MAPPABLE_DESA_FIELDS) {
      const value = normalizedDraft?.fields[key];
      if (value === undefined || value === null || value === "") continue;

      if (key === "tahunData" || key === "jumlahPenduduk") {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          toast(`Field ${FIELD_LABELS[key]} harus angka.`, "error");
          return null;
        }
        payloadFields[key] = numericValue;
      } else {
        payloadFields[key] = value;
      }
    }

    return payloadFields;
  }

  async function handlePublish() {
    const payloadFields = buildPayloadFields();
    if (!payloadFields) return;
    if (Object.keys(payloadFields).length === 0) {
      toast("Tidak ada nilai dari dokumen sumber yang bisa dipublish.", "error");
      return;
    }

    setLoading("publish");
    try {
      const data = await publishDocumentReview(document.id, {
        fields: payloadFields,
        note: normalizedDraft?.notes,
      });
      toast(
        typeof data.versionNumber === "number"
          ? `Dokumen berhasil dipublikasikan sebagai versi ${data.versionNumber}.`
          : "Dokumen berhasil dipublikasikan.",
        "success",
      );
      onDone(data.newStatus);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Koneksi bermasalah. Coba lagi.", "error");
    } finally {
      setLoading(null);
    }
  }

  async function handleMarkFailed() {
    const reason = failedReason.trim();
    if (!reason) {
      toast("Alasan reject wajib diisi.", "error");
      return;
    }

    setLoading("failed");
    try {
      await markDocumentFailed(document.id, reason);
      toast("Dokumen ditandai gagal.", "success");
      onDone("FAILED");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Koneksi bermasalah. Coba lagi.", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Final review dokumen
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Publish atau reject dari halaman ini
        </h2>
        <p className="text-sm text-slate-600">
          {desa.nama} - {desa.kecamatan}, {desa.kabupaten}. Setelah publish atau reject,
          halaman akan kembali ke antrean dokumen.
        </p>
      </div>

      <div className="mt-3 space-y-3">
        <PublishCoverageNotices templateInfo={templateInfo} />

        {!editable ? (
          <div className="notice-card notice-info text-sm">
            Dokumen berstatus {document.status}. Review ini ditampilkan read-only karena keputusan
            final sudah tercatat.
          </div>
        ) : (
          <>
            {document.status === "WAITING_VERIFIED_APPROVAL" ? (
              <div className="notice-card notice-warn text-sm">
                Admin verified desa tetap menjadi jalur utama, tetapi halaman ini bisa dipakai oleh
                admin internal sebagai fallback agar proses tidak macet.
              </div>
            ) : null}

            <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
              <label className="field-label text-xs text-rose-800">Alasan reject</label>
              <textarea
                value={failedReason}
                onChange={(event) => setFailedReason(event.target.value)}
                rows={2}
                maxLength={1000}
                placeholder="Isi jika dokumen harus ditolak / ditandai gagal."
                className="textarea-lux mt-1 text-sm"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleMarkFailed}
                disabled={loading !== null}
                className="btn-lux btn-lux-danger text-sm sm:flex-1"
              >
                {loading === "failed" ? "Menyimpan..." : "Reject / tandai gagal"}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={loading !== null}
                className="btn-lux btn-lux-success text-sm sm:flex-1"
              >
                {loading === "publish" ? "Mempublikasikan..." : "Publikasikan"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

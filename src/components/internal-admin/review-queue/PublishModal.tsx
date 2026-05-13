"use client";

import { useEffect, useState } from "react";
import {
  AI_MAPPABLE_DESA_FIELDS,
  readAiMappingDraft,
} from "@/lib/admin-claim/ai-mapping";
import { readVillageVersionCandidate } from "@/lib/versioning/desa-versioning";
import type { ToastType } from "@/components/ui/Toast";
import {
  fetchTemplateRibbonInfo,
  publishDocumentReview,
  saveDraftMapping,
} from "./api";
import type { DocRow, TemplateRibbonInfo } from "./types";
import { FIELD_LABELS } from "./constants";
import { toInputValue } from "./utils";
import { PublishCoverageNotices } from "./PublishCoverageNotices";
import { PublishFieldEditorList } from "./PublishFieldEditorList";

interface PublishModalProps {
  doc: DocRow;
  onClose: () => void;
  onDone: () => void;
  onNotify: (message: string, type?: ToastType) => void;
}

export function PublishModal({
  doc,
  onClose,
  onDone,
  onNotify,
}: PublishModalProps) {
  const normalizedDraft = readAiMappingDraft(doc.aiMappingResult);
  const versionCandidate = readVillageVersionCandidate(doc.aiMappingResult);
  const [templateInfo, setTemplateInfo] = useState<TemplateRibbonInfo | null>(null);
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const output: Record<string, string> = {};
    for (const key of AI_MAPPABLE_DESA_FIELDS) {
      output[key] = toInputValue(normalizedDraft?.fields[key]);
    }
    return output;
  });
  const [note, setNote] = useState(normalizedDraft?.notes ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doc.desa.id) return;

    let cancelled = false;
    fetchTemplateRibbonInfo(doc.desa.id)
      .then((data) => {
        if (!cancelled) setTemplateInfo(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [doc.desa.id]);

  function buildPayloadFields() {
    const payloadFields: Record<string, string | number | null> = {};

    for (const key of AI_MAPPABLE_DESA_FIELDS) {
      const value = fields[key]?.trim();
      if (!value) continue;

      if (key === "tahunData" || key === "jumlahPenduduk") {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          onNotify(`Field ${FIELD_LABELS[key]} harus angka.`, "error");
          return null;
        }
        payloadFields[key] = numericValue;
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
      await saveDraftMapping(doc.id, {
        fields: payloadFields,
        notes: note || undefined,
      });
      onNotify("Draft review disimpan. Anda bisa lanjut lagi nanti.", "success");
      onDone();
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Koneksi bermasalah. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    const payloadFields = buildPayloadFields();
    if (!payloadFields) return;

    setLoading(true);
    try {
      const data = await publishDocumentReview(doc.id, {
        fields: payloadFields,
        note: note || undefined,
      });
      onNotify(
        typeof data.versionNumber === "number"
          ? `Dokumen berhasil dipublikasikan sebagai versi ${data.versionNumber}.`
          : "Dokumen berhasil dipublikasikan.",
        "success",
      );
      onDone();
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Koneksi bermasalah. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="lux-panel max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-5 sm:p-6">
        <div className="space-y-1">
          <p className="eyebrow text-[10px]">Review data dokumen · sumber dari dokumen resmi</p>
          <h2 className="text-[18px] font-semibold tracking-tight text-slate-900 sm:text-[20px]">
            {doc.title}
          </h2>
          <p className="text-xs text-slate-500">
            {doc.desa.nama} · {doc.desa.kecamatan}, {doc.desa.kabupaten}
          </p>
        </div>

        <PublishCoverageNotices
          templateInfo={templateInfo}
          normalizedDraft={normalizedDraft}
          versionCandidate={versionCandidate}
          aiMappingResult={doc.aiMappingResult}
        />

        <PublishFieldEditorList
          fields={fields}
          note={note}
          normalizedDraft={normalizedDraft}
          versionCandidate={versionCandidate}
          onFieldChange={(key, value) =>
            setFields((current) => ({
              ...current,
              [key]: value,
            }))
          }
          onNoteChange={setNote}
        />

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

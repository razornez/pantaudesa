/**
 * Hook for Intake Pipeline - runs the intake process
 */

import { useCallback, useState } from "react";
import type {
  PipelineResult,
  SubmitReviewSuccess,
  IntakeMode,
} from "../types";
import { getPayloadError, readJsonLikeResponse } from "../utils";

interface UseIntakePipelineOptions {
  onSuccess?: (result: PipelineResult) => void;
}

export function useIntakePipeline(options: UseIntakePipelineOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);

  const runPipeline = useCallback(
    async (params: {
      mode: IntakeMode;
      selectedFile: File | null;
      textValue: string;
      desaIdValue: string;
      useAiMapping: boolean;
    }) => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        let data: PipelineResult;

        if (params.mode === "upload") {
          if (!params.selectedFile) {
            setError("Pilih file terlebih dahulu.");
            return null;
          }

          const formData = new FormData();
          formData.append("file", params.selectedFile);
          if (params.desaIdValue.trim())
            formData.append("desaId", params.desaIdValue.trim());
          if (params.useAiMapping)
            formData.append("useAiMapping", "true");

          const res = await fetch("/api/internal-admin/intake", {
            method: "POST",
            headers: { Accept: "application/json" },
            body: formData,
          });
          const payload = await readJsonLikeResponse<PipelineResult>(res);

          if (!res.ok || "error" in payload) {
            setError(getPayloadError(payload, "Pipeline gagal."));
            return null;
          }

          data = payload;
        } else {
          if (!params.textValue.trim()) {
            setError("Teks wajib diisi.");
            return null;
          }

          const res = await fetch("/api/internal-admin/intake", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: params.textValue,
              ...(params.desaIdValue.trim()
                ? { desaId: params.desaIdValue.trim() }
                : {}),
              ...(params.useAiMapping ? { useAiMapping: true } : {}),
            }),
          });
          const payload = await readJsonLikeResponse<PipelineResult>(res);

          if (!res.ok || "error" in payload) {
            setError(getPayloadError(payload, "Pipeline gagal."));
            return null;
          }

          data = payload;
        }

        setResult(data);
        options.onSuccess?.(data);
        return data;
      } catch {
        setError("Koneksi bermasalah. Coba lagi.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const submitToReview = useCallback(
    async (params: {
      mode: IntakeMode;
      selectedFile: File | null;
      textValue: string;
      desaIdValue: string;
      useAiMapping: boolean;
      reviewTitle: string;
    }): Promise<SubmitReviewSuccess | null> => {
      if (!params.textValue.trim() && !params.selectedFile) {
        setError("Tidak ada input yang dipilih.");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        let payload: SubmitReviewSuccess;

        if (params.mode === "upload") {
          if (!params.selectedFile) {
            setError("File asli tidak ditemukan lagi. Pilih ulang file lalu jalankan pipeline.");
            return null;
          }

          const formData = new FormData();
          formData.append("file", params.selectedFile);
          formData.append("desaId", params.desaIdValue.trim());
          if (params.useAiMapping)
            formData.append("useAiMapping", "true");
          if (params.reviewTitle.trim()) {
            formData.append("title", params.reviewTitle.trim());
          }

          const res = await fetch("/api/internal-admin/intake/submit-review", {
            method: "POST",
            headers: { Accept: "application/json" },
            body: formData,
          });
          const responsePayload = await readJsonLikeResponse<SubmitReviewSuccess>(res);

          if (!res.ok || "error" in responsePayload) {
            setError(getPayloadError(responsePayload, "Submit ke review gagal."));
            return null;
          }

          payload = responsePayload;
        } else {
          if (!params.textValue.trim()) {
            setError("Teks wajib diisi.");
            return null;
          }

          const res = await fetch("/api/internal-admin/intake/submit-review", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: params.textValue,
              desaId: params.desaIdValue.trim(),
              ...(params.useAiMapping ? { useAiMapping: true } : {}),
              ...(params.reviewTitle.trim() ? { title: params.reviewTitle.trim() } : {}),
            }),
          });
          const responsePayload = await readJsonLikeResponse<SubmitReviewSuccess>(res);

          if (!res.ok || "error" in responsePayload) {
            setError(getPayloadError(responsePayload, "Submit ke review gagal."));
            return null;
          }

          payload = responsePayload;
        }

        return payload;
      } catch {
        setError("Koneksi bermasalah. Coba lagi.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    result,
    runPipeline,
    submitToReview,
    reset,
  };
}

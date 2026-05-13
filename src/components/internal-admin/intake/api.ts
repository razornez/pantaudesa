import type {
  DesaOptionsResponse,
  DesaVersionHistoryResponse,
  IntakeHistoryResponse,
  IntakeMode,
  PipelineError,
  PipelineResult,
  SubmitReviewSuccess,
} from "./types";
import { readJsonLikeResponse } from "./utils";

export interface IntakeRequestParams {
  mode: IntakeMode;
  selectedFile: File | null;
  textValue: string;
  desaIdValue: string;
  useAiMapping: boolean;
}

export interface IntakeSubmitParams extends IntakeRequestParams {
  reviewTitle: string;
}

async function parseJsonResponse<T>(res: Response): Promise<T | PipelineError> {
  return readJsonLikeResponse<T>(res) as Promise<T | PipelineError>;
}

type InputRequestPayload =
  | {
      error: PipelineError;
      request?: never;
    }
  | {
      error?: never;
      request: {
        headers: HeadersInit;
        body: BodyInit;
      };
    };

function buildInputPayload(params: IntakeRequestParams): InputRequestPayload {
  if (params.mode === "upload") {
    if (!params.selectedFile) {
      return { error: { error: "Pilih file terlebih dahulu." } satisfies PipelineError };
    }

    const body = new FormData();
    body.append("file", params.selectedFile);
    if (params.desaIdValue.trim()) {
      body.append("desaId", params.desaIdValue.trim());
    }
    if (params.useAiMapping) {
      body.append("useAiMapping", "true");
    }

    return {
      request: {
        headers: { Accept: "application/json" },
        body,
      },
    };
  }

  if (!params.textValue.trim()) {
    return { error: { error: "Teks wajib diisi." } satisfies PipelineError };
  }

  return {
      request: {
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        text: params.textValue,
        ...(params.desaIdValue.trim() ? { desaId: params.desaIdValue.trim() } : {}),
        ...(params.useAiMapping ? { useAiMapping: true } : {}),
      }),
    },
  };
}

export async function requestIntakePipeline(
  params: IntakeRequestParams,
): Promise<PipelineResult | PipelineError> {
  const payload = buildInputPayload(params);
  if (payload.error) return payload.error;

  const res = await fetch("/api/internal-admin/intake", {
    method: "POST",
    ...payload.request,
  });
  return parseJsonResponse<PipelineResult>(res);
}

export async function requestSubmitReview(
  params: IntakeSubmitParams,
): Promise<SubmitReviewSuccess | PipelineError> {
  if (!params.desaIdValue.trim()) {
    return { error: "Pilih desa target sebelum submit ke review internal." };
  }

  if (params.mode === "upload") {
    if (!params.selectedFile) {
      return { error: "File asli tidak ditemukan lagi. Pilih ulang file lalu jalankan pipeline." };
    }

    const body = new FormData();
    body.append("file", params.selectedFile);
    body.append("desaId", params.desaIdValue.trim());
    if (params.useAiMapping) {
      body.append("useAiMapping", "true");
    }
    if (params.reviewTitle.trim()) {
      body.append("title", params.reviewTitle.trim());
    }

    const res = await fetch("/api/internal-admin/intake/submit-review", {
      method: "POST",
      headers: { Accept: "application/json" },
      body,
    });
    return parseJsonResponse<SubmitReviewSuccess>(res);
  }

  if (!params.textValue.trim()) {
    return { error: "Teks wajib diisi." };
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

  return parseJsonResponse<SubmitReviewSuccess>(res);
}

export async function requestDesaOptions(query: string): Promise<DesaOptionsResponse | PipelineError> {
  const suffix = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
  const res = await fetch(`/api/internal-admin/desa-options${suffix}`, {
    headers: { Accept: "application/json" },
  });
  return parseJsonResponse<DesaOptionsResponse>(res);
}

export async function requestIntakeHistory(): Promise<IntakeHistoryResponse | PipelineError> {
  const res = await fetch("/api/internal-admin/intake/history", {
    headers: { Accept: "application/json" },
  });
  return parseJsonResponse<IntakeHistoryResponse>(res);
}

export async function requestVersionHistory(
  desaId: string,
): Promise<DesaVersionHistoryResponse | PipelineError> {
  const res = await fetch(
    `/api/internal-admin/desa-version-history?desaId=${encodeURIComponent(desaId)}`,
    { headers: { Accept: "application/json" } },
  );
  return parseJsonResponse<DesaVersionHistoryResponse>(res);
}

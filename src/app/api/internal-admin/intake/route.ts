import { NextRequest, NextResponse } from "next/server";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { autoMapFromText } from "@/lib/intake/auto-mapping";
import { extractFromFile, extractFromText } from "@/lib/intake/extractors";
import { maybeMapWithOpenAI } from "@/lib/intake/openai-mapping";
import { buildIntakePipelineResult } from "@/lib/intake/pipeline";
import { perfLog, perfStart } from "@/lib/perf";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SCANNED_PDF_MIME = "application/pdf";

export const runtime = "nodejs";

function hasDraftContent(result: Awaited<ReturnType<typeof maybeMapWithOpenAI>>): boolean {
  return (
    Object.keys(result.knownPublishableFields).length > 0 ||
    result.detectedButNotPublishable.length > 0 ||
    result.unknownUsefulFields.length > 0
  );
}

export async function POST(req: NextRequest) {
  const sessionResult = await requireInternalAdminSession();
  if (sessionResult instanceof NextResponse) return sessionResult;

  const t = perfStart();

  try {
    const contentType = req.headers.get("content-type") ?? "";

    let inputSource: "file" | "paste" = "paste";
    let extractedText = "";
    let extractMeta: ReturnType<typeof extractFromText>["meta"];
    let desaId: string | undefined;
    let requestAiMapping = false;
    let fileName: string | undefined;
    let mimeType: string | undefined;
    let fileBuffer: Buffer | undefined;
    let extractFailed = false;
    let extractError: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      inputSource = "file";
      const formData = await req.formData();
      const file = formData.get("file");
      const rawDesaId = formData.get("desaId");
      const rawAiMapping = formData.get("useAiMapping");

      desaId =
        typeof rawDesaId === "string" && rawDesaId.trim() ? rawDesaId.trim() : undefined;
      requestAiMapping = rawAiMapping === "true";

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File terlalu besar (maks 10 MB)." }, { status: 422 });
      }

      fileName = file.name;
      mimeType = file.type || "application/octet-stream";
      fileBuffer = Buffer.from(await file.arrayBuffer());

      const extracted = await extractFromFile({
        buffer: fileBuffer,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      });

      extractMeta = extracted.meta;

      if (extracted.ok) {
        extractedText = extracted.text;
      } else {
        extractFailed = true;
        extractError = extracted.error ?? "Gagal membaca file.";
        const canContinueWithAi =
          Boolean(fileBuffer) &&
          (requestAiMapping ||
            mimeType.toLowerCase().startsWith("image/") ||
            mimeType.toLowerCase() === SCANNED_PDF_MIME);

        if (!canContinueWithAi) {
          return NextResponse.json(
            { error: extractError, meta: extracted.meta },
            { status: 422 },
          );
        }
      }
    } else if (contentType.includes("application/json")) {
      const body = (await req.json()) as {
        text?: unknown;
        desaId?: unknown;
        useAiMapping?: unknown;
      };
      const text = typeof body.text === "string" ? body.text : "";

      desaId =
        typeof body.desaId === "string" && body.desaId.trim() ? body.desaId.trim() : undefined;
      requestAiMapping = body.useAiMapping === true;

      if (!text.trim()) {
        return NextResponse.json({ error: "Teks wajib diisi." }, { status: 400 });
      }

      const extracted = extractFromText(text.trim());
      extractedText = extracted.text;
      extractMeta = extracted.meta;
    } else {
      return NextResponse.json(
        {
          error:
            "Content-Type tidak didukung. Gunakan multipart/form-data atau application/json.",
        },
        { status: 415 },
      );
    }

    perfLog("internal-admin.intake", "extract", t);

    const localMapping = autoMapFromText(extractedText);
    const heuristicConfidenceLow =
      localMapping.evidence.length < 2 && extractedText.trim().length > 0;

    const aiTimer = perfStart();
    const openaiResult = await maybeMapWithOpenAI({
      extractedText,
      fileName,
      mimeType,
      fileBuffer,
      explicitRequest: requestAiMapping,
      heuristicConfidenceLow,
      localExtractFailed: extractFailed,
    });
    perfLog("internal-admin.intake", "openai", aiTimer);

    const hasRecoverableOutput =
      extractedText.trim().length > 0 || hasDraftContent(openaiResult);

    if (!hasRecoverableOutput) {
      return NextResponse.json(
        {
          error:
            openaiResult.status === "missing_key"
              ? "Dokumen ini butuh bantuan AI untuk dibaca, tetapi OPENAI_API_KEY tidak tersedia. Coba tempel teks manual atau gunakan dokumen teks."
              : openaiResult.message || extractError || "Dokumen belum bisa dibaca.",
          meta: {
            parser: extractMeta.parser,
            ...(extractError ? { extractError } : {}),
            openaiStatus: openaiResult.status,
            ...(openaiResult.proof ? { openaiProof: openaiResult.proof } : {}),
          },
        },
        { status: 422 },
      );
    }

    const pipeline = await buildIntakePipelineResult({
      inputSource,
      extractedText,
      extractMeta,
      desaId,
      localMapping,
      openaiResult,
    });

    perfLog("internal-admin.intake", "full-pipeline", t);

    return NextResponse.json(pipeline);
  } catch (err) {
    console.error("[internal-admin][intake] unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan tak terduga saat memproses intake." },
      { status: 500 },
    );
  }
}

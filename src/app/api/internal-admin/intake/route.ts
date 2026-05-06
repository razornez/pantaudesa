/**
 * Sprint 05 Batch 3 - Intake API Route
 *
 * Single POST endpoint that:
 *  1. Accepts a file upload or pasted text,
 *  2. Extracts plain text from the file,
 *  3. Auto-maps extracted text to mappable fields,
 *  4. Validates the mapped fields,
 *  5. Optionally diffs the result against an existing Desa.
 *
 * All steps are read-only / preview. No DB writes.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireInternalAdminSession } from "@/lib/auth/internal-admin";
import { extractFromFile, extractFromText } from "@/lib/intake/extractors";
import { buildIntakePipelineResult } from "@/lib/intake/pipeline";
import { perfLog, perfStart } from "@/lib/perf";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const runtime = "nodejs";

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

    if (contentType.includes("multipart/form-data")) {
      inputSource = "file";
      const formData = await req.formData();
      const file = formData.get("file");
      const rawDesaId = formData.get("desaId");

      desaId =
        typeof rawDesaId === "string" && rawDesaId.trim() ? rawDesaId.trim() : undefined;

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File terlalu besar (maks 10 MB)." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await extractFromFile({
        buffer,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      });

      if (!result.ok) {
        return NextResponse.json(
          { error: result.error ?? "Gagal membaca file.", meta: result.meta },
          { status: 422 },
        );
      }

      extractedText = result.text;
      extractMeta = result.meta;
    } else if (contentType.includes("application/json")) {
      const body = (await req.json()) as { text?: unknown; desaId?: unknown };
      const text = typeof body.text === "string" ? body.text : "";

      desaId =
        typeof body.desaId === "string" && body.desaId.trim() ? body.desaId.trim() : undefined;

      if (!text.trim()) {
        return NextResponse.json({ error: "Teks wajib diisi." }, { status: 400 });
      }

      const result = extractFromText(text.trim());
      extractedText = result.text;
      extractMeta = result.meta;
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

    const pipeline = await buildIntakePipelineResult({
      inputSource,
      extractedText,
      extractMeta,
      desaId,
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

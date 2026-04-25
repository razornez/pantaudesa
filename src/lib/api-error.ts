import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { sendErrorAlert } from "@/lib/alert";

/**
 * Catches unexpected errors in API route handlers, reports to Sentry,
 * sends an email alert, and returns a safe generic message to the client.
 * Never leaks stack traces to the client.
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  const err     = error instanceof Error ? error : new Error(String(error));
  const label   = context ?? "API error";
  const preview = err.message.slice(0, 120);

  console.error(`[${label}]`, err);
  Sentry.captureException(err, { extra: { context: label } });

  sendErrorAlert({
    subject:  `API Error: ${label}`,
    title:    label,
    body:     preview,
    metadata: {
      type:  err.name,
      stack: err.stack?.split("\n")[1]?.trim(),
    },
  });

  return NextResponse.json(
    { error: "Terjadi kesalahan pada server. Silakan coba lagi." },
    { status: 500 }
  );
}

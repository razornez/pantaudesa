import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

/**
 * Catches unexpected errors in API route handlers, reports to Sentry,
 * and returns a safe generic message to the client — never leaks stack traces.
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  const message = context ?? "API error";

  // Report to Sentry with full details (server-side only)
  Sentry.captureException(error, { extra: { context: message } });

  // Log locally for Vercel function logs
  console.error(`[${message}]`, error);

  // Return a safe, vague message to the client
  return NextResponse.json(
    { error: "Terjadi kesalahan pada server. Silakan coba lagi." },
    { status: 500 }
  );
}

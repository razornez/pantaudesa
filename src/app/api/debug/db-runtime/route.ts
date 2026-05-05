import { NextResponse } from "next/server";
import { getPrismaRuntimeDebugInfo } from "@/lib/db";

// GET /api/debug/db-runtime
// Safe runtime visibility for DB path selection.
// Returns only sanitized host/port + selection flags. No secrets.

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    runtime: getPrismaRuntimeDebugInfo(),
  });
}

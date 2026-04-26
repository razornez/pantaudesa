import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/debug/health
// Cek semua dependency: DB, env vars, Resend.
// Hanya aktif di non-production atau dengan secret header.

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const results: Record<string, unknown> = {};

  // ── 1. Env vars ────────────────────────────────────────────────────────────
  results.env = {
    AUTH_SECRET:    !!process.env.AUTH_SECRET        ? "✓ set" : "✗ MISSING",
    AUTH_URL:       process.env.AUTH_URL              ?? "✗ MISSING",
    NEXTAUTH_URL:   process.env.NEXTAUTH_URL          ?? "✗ MISSING",
    DATABASE_URL:   !!process.env.DATABASE_URL        ? "✓ set" : "✗ MISSING",
    DIRECT_URL:     !!process.env.DIRECT_URL          ? "✓ set" : "✗ MISSING",
    RESEND_API_KEY: !!process.env.RESEND_API_KEY      ? "✓ set" : "✗ MISSING",
    RESEND_FROM:    process.env.RESEND_FROM           ?? "✗ MISSING",
    NODE_ENV:       process.env.NODE_ENV,
  };

  // ── 2. Database ────────────────────────────────────────────────────────────
  try {
    await db.$queryRaw`SELECT 1`;
    results.database = "✓ connected";
  } catch (err) {
    results.database = `✗ ERROR: ${(err as Error).message}`;
  }

  // ── 3. Prisma models ───────────────────────────────────────────────────────
  try {
    const userCount = await db.user.count();
    results.prismaModels = `✓ ok — ${userCount} users`;
  } catch (err) {
    results.prismaModels = `✗ ERROR: ${(err as Error).message}`;
  }

  // ── 4. Resend ──────────────────────────────────────────────────────────────
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    // Just validate key format — don't actually send
    if (!process.env.RESEND_API_KEY?.startsWith("re_")) {
      results.resend = "✗ API key format invalid (should start with re_)";
    } else {
      // Ping the API to check key validity
      const domains = await resend.domains.list();
      results.resend = domains.error
        ? `✗ API error: ${domains.error.message}`
        : `✓ ok — ${(domains.data?.data ?? []).length} domain(s)`;
    }
  } catch (err) {
    results.resend = `✗ ERROR: ${(err as Error).message}`;
  }

  // ── 5. NextAuth config ─────────────────────────────────────────────────────
  results.nextauth = {
    callbackUrl: `${process.env.AUTH_URL ?? process.env.NEXTAUTH_URL}/api/auth/callback/resend`,
    note: "This URL must be accessible from the internet",
  };

  const allOk = Object.values(results).every(v =>
    typeof v === "string" ? v.startsWith("✓") : true
  );

  return NextResponse.json(
    { ok: allOk, timestamp: new Date().toISOString(), results },
    { status: allOk ? 200 : 500 }
  );
}

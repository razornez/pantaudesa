import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type InternalAdminSession = {
  userId: string;
  email: string;
};

// Server-side check: is this userId an INTERNAL_ADMIN in the DB?
// Never trust client-side flags — always reads from DB.
export async function isInternalAdmin(userId: string): Promise<boolean> {
  if (!db) return false;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "INTERNAL_ADMIN";
}

// Get the current session and validate internal admin role server-side.
// Returns session data if valid, null if not authenticated or not internal admin.
export async function getInternalAdminSession(): Promise<InternalAdminSession | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;
  const admin = await isInternalAdmin(session.user.id);
  if (!admin) return null;
  return { userId: session.user.id, email: session.user.email };
}

// Standard 403 response for unauthorized internal admin access.
export function unauthorizedInternalAdmin(): NextResponse {
  return NextResponse.json(
    { error: "Internal admin access required" },
    { status: 403 },
  );
}

// Convenience: assert session is internal admin or return 401/403.
// Usage in route handlers:
//   const adminSession = await requireInternalAdminSession(req);
//   if (adminSession instanceof NextResponse) return adminSession;
export async function requireInternalAdminSession(): Promise<InternalAdminSession | NextResponse> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = await isInternalAdmin(session.user.id);
  if (!admin) {
    return unauthorizedInternalAdmin();
  }
  return { userId: session.user.id, email: session.user.email };
}

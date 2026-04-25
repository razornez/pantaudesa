import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// ─── POST /api/voices/[id]/helpful ───────────────────────────────────────────

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }

  const { id } = await params;

  const voice = await db.voice.findUnique({ where: { id } });
  if (!voice) {
    return NextResponse.json({ error: "Suara tidak ditemukan" }, { status: 404 });
  }

  // Idempotent — silently succeed if already marked helpful
  await db.voiceHelpful.upsert({
    where:  { voiceId_userId: { voiceId: id, userId: session.user.id } },
    update: {},
    create: { voiceId: id, userId: session.user.id },
  });

  const count = await db.voiceHelpful.count({ where: { voiceId: id } });
  return NextResponse.json({ helpful: count });
}

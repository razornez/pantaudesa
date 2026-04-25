import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
    }

    const { id } = await params;

    const voice = await db.voice.findUnique({ where: { id } });
    if (!voice) {
      return NextResponse.json({ error: "Suara tidak ditemukan" }, { status: 404 });
    }

    await db.voiceHelpful.upsert({
      where:  { voiceId_userId: { voiceId: id, userId: session.user.id } },
      update: {},
      create: { voiceId: id, userId: session.user.id },
    });

    const count = await db.voiceHelpful.count({ where: { voiceId: id } });
    return NextResponse.json({ helpful: count });
  } catch (error) {
    return handleApiError(error, "POST /api/voices/[id]/helpful");
  }
}

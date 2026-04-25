import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Login diperlukan untuk vote" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { type } = body;

    if (type !== "BENAR" && type !== "BOHONG") {
      return NextResponse.json({ error: "type harus 'BENAR' atau 'BOHONG'" }, { status: 400 });
    }

    const voice = await db.voice.findUnique({ where: { id } });
    if (!voice) {
      return NextResponse.json({ error: "Suara tidak ditemukan" }, { status: 404 });
    }

    await db.voiceVote.upsert({
      where:  { voiceId_userId: { voiceId: id, userId: session.user.id } },
      update: { type },
      create: { voiceId: id, userId: session.user.id, type },
    });

    const [benar, bohong] = await Promise.all([
      db.voiceVote.count({ where: { voiceId: id, type: "BENAR" } }),
      db.voiceVote.count({ where: { voiceId: id, type: "BOHONG" } }),
    ]);

    return NextResponse.json({ benar, bohong });
  } catch (error) {
    return handleApiError(error, "POST /api/voices/[id]/vote");
  }
}

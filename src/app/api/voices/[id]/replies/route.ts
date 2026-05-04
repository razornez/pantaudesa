import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";

interface Params {
  params: Promise<{ id: string }>;
}

function shapeReply(reply: {
  id: string;
  voiceId: string;
  isAnon: boolean;
  isOfficialDesa: boolean;
  text: string;
  createdAt: Date;
  author: { nama: string | null } | null;
}) {
  return {
    id: reply.id,
    voiceId: reply.voiceId,
    author: reply.isAnon ? "Anonim" : (reply.author?.nama ?? "Anonim"),
    isAnon: reply.isAnon,
    isOfficialDesa: reply.isOfficialDesa,
    text: reply.text,
    createdAt: reply.createdAt,
  };
}

export async function POST(req: Request, { params }: Params) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Layanan komentar belum siap" }, { status: 503 });
    }

    const { id } = await params;
    const session = await auth();
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const isAnon = body.isAnon ?? !session?.user?.id;

    if (!text) {
      return NextResponse.json({ error: "Komentar wajib diisi" }, { status: 400 });
    }
    if (text.length < 3) {
      return NextResponse.json({ error: "Komentar terlalu pendek" }, { status: 400 });
    }
    if (text.length > 300) {
      return NextResponse.json({ error: "Komentar terlalu panjang (maksimal 300 karakter)" }, { status: 400 });
    }

    // B6: fetch voice's desaId to check if replier is an admin for that desa
    const voice = await db.voice.findUnique({ where: { id }, select: { id: true, desaId: true } });
    if (!voice) {
      return NextResponse.json({ error: "Suara warga tidak ditemukan" }, { status: 404 });
    }

    // B6: auto-set isOfficialDesa if the logged-in user is a VERIFIED or LIMITED admin for this desa
    let isOfficialDesa = false;
    if (session?.user?.id) {
      const adminMember = await db.desaAdminMember.findFirst({
        where: {
          userId: session.user.id,
          desaId: voice.desaId,
          status: { in: ["VERIFIED", "LIMITED"] },
        },
        select: { id: true },
      });
      if (adminMember) {
        isOfficialDesa = true;
      }
    }

    const reply = await db.voiceReply.create({
      data: {
        voiceId: id,
        text,
        isAnon: isOfficialDesa ? false : isAnon,
        isOfficialDesa,
        authorId: session?.user?.id ?? null,
      },
      include: { author: { select: { nama: true } } },
    });

    return NextResponse.json(shapeReply(reply), { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/voices/[id]/replies");
  }
}

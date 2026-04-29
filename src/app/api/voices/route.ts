import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";
import type { VoiceCategory } from "@/lib/citizen-voice";

const VALID_CATEGORIES = ["infrastruktur", "bansos", "fasilitas", "anggaran", "lingkungan", "lainnya"];

function shapeVoice(v: {
  id: string; desaId: string; category: string; text: string;
  isAnon: boolean; authorId: string | null; createdAt: Date; resolvedAt: Date | null;
  status: string;
  author: { nama: string | null } | null;
  votes: { type: string }[];
  helpfuls: { userId: string }[];
  replies: {
    id: string; isAnon: boolean; isOfficialDesa: boolean; text: string; createdAt: Date;
    author: { nama: string | null } | null;
  }[];
}, desa?: { nama: string; kabupaten: string; slug: string }) {
  return {
    id:        v.id,
    desaId:    v.desaId,
    desaNama:  desa?.nama,
    desaKabupaten: desa?.kabupaten,
    desaSlug:  desa?.slug,
    category:  v.category as VoiceCategory,
    text:      v.text,
    author:    v.isAnon ? "Anonim" : (v.author?.nama ?? "Anonim"),
    authorId:  v.authorId,
    isAnon:    v.isAnon,
    createdAt: v.createdAt,
    helpful:   v.helpfuls.length,
    photos:    [] as string[],
    votes: {
      benar:  v.votes.filter(vote => vote.type === "BENAR").length,
      bohong: v.votes.filter(vote => vote.type === "BOHONG").length,
    },
    status:     v.status === "OPEN" ? "open" : v.status === "IN_PROGRESS" ? "in_progress" : "resolved",
    resolvedAt: v.resolvedAt ?? undefined,
    replies: v.replies.map(r => ({
      id:             r.id,
      voiceId:        v.id,
      author:         r.isAnon ? "Anonim" : (r.author?.nama ?? "Anonim"),
      isAnon:         r.isAnon,
      isOfficialDesa: r.isOfficialDesa,
      text:           r.text,
      createdAt:      r.createdAt,
    })),
  };
}

const VOICE_INCLUDE = {
  author:   { select: { id: true, nama: true, username: true, avatarUrl: true } },
  votes:    { select: { type: true } },
  helpfuls: { select: { userId: true } },
  replies: {
    orderBy: { createdAt: "asc" as const },
    include: { author: { select: { id: true, nama: true, username: true, avatarUrl: true } } },
  },
};

// ─── GET /api/voices?desaId=&limit=&cursor= ───────────────────────────────────

export async function GET(req: Request) {
  try {
    if (!db) return NextResponse.json([]);

    const { searchParams } = new URL(req.url);
    const desaId = searchParams.get("desaId");
    const limit  = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const cursor = searchParams.get("cursor") ?? undefined;

    const voices = await db.voice.findMany({
      where:   desaId ? { desaId } : undefined,
      orderBy: { createdAt: "desc" },
      take:    limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: VOICE_INCLUDE,
    });
    const desaIds = [...new Set(voices.map((voice) => voice.desaId))];
    const desaRows = desaIds.length > 0
      ? await db.desa.findMany({
        where: { OR: [{ id: { in: desaIds } }, { slug: { in: desaIds } }] },
        select: { id: true, slug: true, nama: true, kabupaten: true },
      })
      : [];
    const desaMap = new Map<string, { nama: string; kabupaten: string; slug: string }>();
    desaRows.forEach((desa) => {
      const value = { nama: desa.nama, kabupaten: desa.kabupaten, slug: desa.slug };
      desaMap.set(desa.id, value);
      desaMap.set(desa.slug, value);
    });

    return NextResponse.json(voices.map((voice) => shapeVoice(voice, desaMap.get(voice.desaId))));
  } catch (error) {
    return handleApiError(error, "GET /api/voices");
  }
}

// ─── POST /api/voices ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Layanan penyimpanan belum siap" }, { status: 503 });
    }

    const session = await auth();

    const body = await req.json();
    const { desaId, category, text, isAnon } = body;

    if (!desaId || !category || !text?.trim()) {
      return NextResponse.json({ error: "desaId, category, dan text wajib diisi" }, { status: 400 });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 });
    }
    if (text.trim().length < 10) {
      return NextResponse.json({ error: "Cerita terlalu pendek (minimal 10 karakter)" }, { status: 400 });
    }
    if (text.trim().length > 400) {
      return NextResponse.json({ error: "Cerita terlalu panjang (maksimal 400 karakter)" }, { status: 400 });
    }

    const voice = await db.voice.create({
      data: {
        desaId,
        category,
        text:     text.trim(),
        isAnon:   isAnon ?? !session?.user?.id,
        authorId: session?.user?.id ?? null,
      },
      include: VOICE_INCLUDE,
    });

    return NextResponse.json(shapeVoice(voice), { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/voices");
  }
}

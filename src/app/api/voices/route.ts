import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { VoiceCategory } from "@/lib/citizen-voice";

// ─── GET /api/voices?desaId=&limit=&cursor= ───────────────────────────���───────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const desaId = searchParams.get("desaId");
  const limit  = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const cursor = searchParams.get("cursor") ?? undefined;

  const voices = await db.voice.findMany({
    where:   desaId ? { desaId } : undefined,
    orderBy: { createdAt: "desc" },
    take:    limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      author: { select: { id: true, nama: true, username: true, avatarUrl: true } },
      votes:    { select: { type: true } },
      helpfuls: { select: { userId: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, nama: true, username: true, avatarUrl: true } },
        },
      },
    },
  });

  // Shape data to match the CitizenVoice interface used by UI components
  const shaped = voices.map(v => ({
    id:        v.id,
    desaId:    v.desaId,
    category:  v.category as VoiceCategory,
    text:      v.text,
    author:    v.isAnon ? "Anonim" : (v.author?.nama ?? "Anonim"),
    authorId:  v.authorId,
    isAnon:    v.isAnon,
    createdAt: v.createdAt,
    helpful:   v.helpfuls.length,
    photos:    [] as string[],
    votes: {
      benar:  v.votes.filter(v => v.type === "BENAR").length,
      bohong: v.votes.filter(v => v.type === "BOHONG").length,
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
  }));

  return NextResponse.json(shaped);
}

// ─── POST /api/voices ─────────────────────────────────────────────────────────

const VALID_CATEGORIES = ["infrastruktur", "bansos", "fasilitas", "anggaran", "lingkungan", "lainnya"];

export async function POST(req: Request) {
  const session = await auth();

  const body = await req.json();
  const { desaId, category, text, isAnon } = body;

  // Validate required fields
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
    include: {
      author:   { select: { id: true, nama: true, username: true, avatarUrl: true } },
      votes:    { select: { type: true } },
      helpfuls: { select: { userId: true } },
      replies:  true,
    },
  });

  return NextResponse.json({
    id:        voice.id,
    desaId:    voice.desaId,
    category:  voice.category as VoiceCategory,
    text:      voice.text,
    author:    voice.isAnon ? "Anonim" : (voice.author?.nama ?? "Anonim"),
    authorId:  voice.authorId,
    isAnon:    voice.isAnon,
    createdAt: voice.createdAt,
    helpful:   0,
    photos:    [] as string[],
    votes:     { benar: 0, bohong: 0 },
    status:    "open",
    replies:   [],
  }, { status: 201 });
}

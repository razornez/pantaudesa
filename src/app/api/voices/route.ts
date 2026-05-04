import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";
import type { VoiceCategory } from "@/lib/citizen-voice";

const VALID_CATEGORIES = ["infrastruktur", "bansos", "fasilitas", "anggaran", "lingkungan", "lainnya"];

// Trust score thresholds (mirrors user-profile.ts USER_BADGES)
const TRUST_TIERS = [
  { tier: 5 as const, minScore: 250 },
  { tier: 4 as const, minScore: 120 },
  { tier: 3 as const, minScore: 60  },
  { tier: 2 as const, minScore: 20  },
  { tier: 1 as const, minScore: 0   },
];

function computeTrustTier(voiceCount: number, helpfulCount: number, resolvedCount: number): 1 | 2 | 3 | 4 | 5 {
  const score = voiceCount * 5 + helpfulCount * 2 + resolvedCount * 10;
  for (const { tier, minScore } of TRUST_TIERS) {
    if (score >= minScore) return tier;
  }
  return 1;
}

function shapeVoice(
  v: {
    id: string; desaId: string; category: string; text: string;
    isAnon: boolean; authorId: string | null; createdAt: Date; resolvedAt: Date | null;
    status: string; photos: string[];
    author: { id: string; nama: string | null; username: string | null } | null;
    votes: { type: string }[];
    helpfuls: { userId: string }[];
    replies: {
      id: string; isAnon: boolean; isOfficialDesa: boolean; text: string; createdAt: Date;
      author: { nama: string | null; username: string | null } | null;
    }[];
  },
  desa?: { nama: string; kabupaten: string; slug: string },
  authorIsAdminDesa?: boolean,
  authorTrustTier?: 1 | 2 | 3 | 4 | 5,
) {
  const authorName = v.isAnon
    ? "Anonim"
    : (v.author?.nama ?? v.author?.username ?? "Anonim");

  return {
    id:           v.id,
    desaId:       v.desaId,
    desaNama:     desa?.nama,
    desaKabupaten: desa?.kabupaten,
    desaSlug:     desa?.slug,
    category:     v.category as VoiceCategory,
    text:         v.text,
    author:       authorName,
    authorId:     v.authorId,
    isAnon:       v.isAnon,
    authorIsAdminDesa: v.isAnon ? false : (authorIsAdminDesa ?? false),
    authorTrustTier:   v.isAnon ? undefined : authorTrustTier,
    createdAt:    v.createdAt,
    helpful:      v.helpfuls.length,
    photos:       v.photos,
    votes: {
      benar:  v.votes.filter(vote => vote.type === "BENAR").length,
      bohong: v.votes.filter(vote => vote.type === "BOHONG").length,
    },
    status:     v.status === "OPEN" ? "open" : v.status === "IN_PROGRESS" ? "in_progress" : "resolved",
    resolvedAt: v.resolvedAt ?? undefined,
    replies: v.replies.map(r => ({
      id:             r.id,
      voiceId:        v.id,
      author:         r.isAnon ? "Anonim" : (r.author?.nama ?? r.author?.username ?? "Anonim"),
      isAnon:         r.isAnon,
      isOfficialDesa: r.isOfficialDesa,
      text:           r.text,
      createdAt:      r.createdAt,
    })),
  } as const;
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

    // Resolve desa info
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

    // Batch-check which (authorId, desaId) pairs have an active admin membership
    const authorDesaPairs = voices
      .filter(v => !v.isAnon && v.authorId)
      .map(v => ({ authorId: v.authorId!, desaId: v.desaId }));

    const adminMembers = authorDesaPairs.length > 0
      ? await db.desaAdminMember.findMany({
          where: {
            OR: authorDesaPairs.map(p => ({ userId: p.authorId, desaId: p.desaId })),
            status: { in: ["VERIFIED", "LIMITED"] },
          },
          select: { userId: true, desaId: true },
        })
      : [];

    const adminSet = new Set(adminMembers.map(m => `${m.userId}:${m.desaId}`));

    // Batch-compute trust tiers for non-anon authors
    const authorIds = [...new Set(voices.filter(v => !v.isAnon && v.authorId).map(v => v.authorId!))];

    const [voiceCounts, helpfulCounts, resolvedCounts] = authorIds.length > 0
      ? await Promise.all([
          db.voice.groupBy({ by: ["authorId"], where: { authorId: { in: authorIds }, isAnon: false }, _count: { id: true } }),
          db.voiceHelpful.groupBy({ by: ["userId"], where: { voice: { authorId: { in: authorIds }, isAnon: false } }, _count: { id: true } }),
          db.voice.groupBy({ by: ["authorId"], where: { authorId: { in: authorIds }, isAnon: false, status: "RESOLVED" }, _count: { id: true } }),
        ])
      : [[], [], []] as const;

    const voiceCountMap = new Map<string, number>(voiceCounts.map(r => [r.authorId as string, r._count.id]));
    const helpfulCountMap = new Map<string, number>(helpfulCounts.map(r => [r.userId as string, r._count.id]));
    const resolvedCountMap = new Map<string, number>(resolvedCounts.map(r => [r.authorId as string, r._count.id]));

    return NextResponse.json(voices.map((voice) => {
      const isAdminDesa = !voice.isAnon && voice.authorId
        ? adminSet.has(`${voice.authorId}:${voice.desaId}`)
        : false;

      const trustTier = !voice.isAnon && voice.authorId
        ? computeTrustTier(
            voiceCountMap.get(voice.authorId) ?? 0,
            helpfulCountMap.get(voice.authorId) ?? 0,
            resolvedCountMap.get(voice.authorId) ?? 0,
          )
        : undefined;

      return shapeVoice(voice, desaMap.get(voice.desaId), isAdminDesa, trustTier);
    }));
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

    const effectiveIsAnon = isAnon ?? !session?.user?.id;
    const voice = await db.voice.create({
      data: {
        desaId,
        category,
        text:     text.trim(),
        isAnon:   effectiveIsAnon,
        authorId: session?.user?.id ?? null,
      },
      include: VOICE_INCLUDE,
    });

    // For the POST response, check admin and trust for the single author
    let isAdminDesa = false;
    let trustTier: 1 | 2 | 3 | 4 | 5 | undefined;

    if (!effectiveIsAnon && session?.user?.id) {
      const [adminMember, vcCount, hlCount, rvCount] = await Promise.all([
        db.desaAdminMember.findFirst({
          where: { userId: session.user.id, desaId, status: { in: ["VERIFIED", "LIMITED"] } },
          select: { id: true },
        }),
        db.voice.count({ where: { authorId: session.user.id, isAnon: false } }),
        db.voiceHelpful.count({ where: { voice: { authorId: session.user.id, isAnon: false } } }),
        db.voice.count({ where: { authorId: session.user.id, isAnon: false, status: "RESOLVED" } }),
      ]);
      isAdminDesa = !!adminMember;
      trustTier = computeTrustTier(vcCount, hlCount, rvCount);
    }

    return NextResponse.json(shapeVoice(voice, undefined, isAdminDesa, trustTier), { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/voices");
  }
}

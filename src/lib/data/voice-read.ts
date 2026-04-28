import { prisma } from "@/lib/prisma";
import type { CitizenVoice, VoiceStatus } from "@/lib/citizen-voice";

function mapStatus(status: string): VoiceStatus {
  if (status === "IN_PROGRESS") return "in_progress";
  if (status === "RESOLVED") return "resolved";
  return "open";
}

type VoiceRecord = Awaited<ReturnType<typeof fetchVoiceRecords>>[number];

function authorName(author: VoiceRecord["author"], isAnon: boolean) {
  if (isAnon || !author) return "Anonim";
  return author.nama ?? author.name ?? author.username ?? "Warga";
}

function mapVoice(record: VoiceRecord): CitizenVoice {
  const benar = record.votes.filter((vote) => vote.type === "BENAR").length;
  const bohong = record.votes.filter((vote) => vote.type === "BOHONG").length;

  return {
    id: record.id,
    desaId: record.desaId,
    category: record.category,
    text: record.text,
    author: authorName(record.author, record.isAnon),
    isAnon: record.isAnon,
    createdAt: record.createdAt,
    helpful: record.helpfuls.length,
    photos: [],
    votes: { benar, bohong },
    status: mapStatus(record.status),
    resolvedAt: record.resolvedAt ?? undefined,
    replies: record.replies.map((reply) => ({
      id: reply.id,
      voiceId: reply.voiceId,
      author: authorName(reply.author, reply.isAnon),
      isAnon: reply.isAnon,
      isOfficialDesa: reply.isOfficialDesa,
      text: reply.text,
      createdAt: reply.createdAt,
    })),
  };
}

async function fetchVoiceRecords(desaId?: string) {
  if (!prisma) return [];

  return prisma.voice.findMany({
    where: desaId ? { desaId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { nama: true, name: true, username: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { nama: true, name: true, username: true } } },
      },
      votes: { select: { type: true } },
      helpfuls: { select: { id: true } },
    },
  });
}

export async function getAllVoicesFromDb() {
  try {
    return (await fetchVoiceRecords()).map(mapVoice);
  } catch (error) {
    console.error("[voice-read] public voice read failed:", error);
    return [];
  }
}

export async function getVoicesForDesaFromDb(desaId: string) {
  try {
    return (await fetchVoiceRecords(desaId)).map(mapVoice);
  } catch (error) {
    console.error("[voice-read] public desa voice read failed:", error);
    return [];
  }
}

export type DesaVoicePreview = {
  total: number;
  preview: Array<Pick<CitizenVoice, "id" | "category" | "text" | "author">>;
};

export async function getVoicePreviewForDesaFromDb(desaId: string): Promise<DesaVoicePreview> {
  if (!prisma) return { total: 0, preview: [] };

  try {
    const [total, records] = await Promise.all([
      prisma.voice.count({ where: { desaId } }),
      prisma.voice.findMany({
        where: { desaId },
        orderBy: { createdAt: "desc" },
        take: 2,
        select: {
          id: true,
          category: true,
          text: true,
          isAnon: true,
          author: { select: { nama: true, name: true, username: true } },
        },
      }),
    ]);

    return {
      total,
      preview: records.map((record) => ({
        id: record.id,
        category: record.category,
        text: record.text,
        author: authorName(record.author, record.isAnon),
      })),
    };
  } catch (error) {
    console.error("[voice-read] public desa voice preview read failed:", error);
    return { total: 0, preview: [] };
  }
}

export function getVoiceStatsFromVoices(voices: CitizenVoice[]) {
  const total = voices.length;
  const resolved = voices.filter((voice) => voice.status === "resolved").length;
  const inProgress = voices.filter((voice) => voice.status === "in_progress").length;
  const open = voices.filter((voice) => voice.status === "open").length;
  const desaCount = new Set(voices.map((voice) => voice.desaId)).size;

  const resolvedWithDate = voices.filter((voice) => voice.status === "resolved" && voice.resolvedAt);
  const avgResolutionDays = resolvedWithDate.length
    ? Math.round(
        resolvedWithDate.reduce((acc, voice) => {
          return acc + (voice.resolvedAt!.getTime() - voice.createdAt.getTime()) / 86_400_000;
        }, 0) / resolvedWithDate.length
      )
    : null;

  return { total, resolved, inProgress, open, desaCount, avgResolutionDays };
}

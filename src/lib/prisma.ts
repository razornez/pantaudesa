import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient | null {
  const url = process.env.DATABASE_URL ?? "";
  const valid =
    url.startsWith("postgresql://") ||
    url.startsWith("postgres://") ||
    url.startsWith("prisma://") ||
    url.startsWith("prisma+postgres://");

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[prisma] DATABASE_URL missing or unsupported protocol; Prisma reads are disabled."
      );
    }
    return null;
  }

  try {
    return new PrismaClient();
  } catch (e) {
    console.error("[prisma] Failed to instantiate PrismaClient:", e);
    return null;
  }
}

export const prisma: PrismaClient | null =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (prisma) globalForPrisma.prisma = prisma;
}

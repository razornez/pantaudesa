import { PrismaClient } from "@/generated/prisma";
import { attachPrismaPerfLogging } from "@/lib/perf";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createClient(): PrismaClient | null {
  const url = process.env.DATABASE_URL ?? "";
  const valid =
    url.startsWith("postgresql://") ||
    url.startsWith("postgres://") ||
    url.startsWith("prisma://") ||
    url.startsWith("prisma+postgres://");

  if (!valid) return null;

  try {
    return new PrismaClient();
  } catch {
    return null;
  }
}

export const db: PrismaClient = (globalForPrisma.prisma ?? createClient()) as PrismaClient;

if (process.env.NODE_ENV !== "production" && db) globalForPrisma.prisma = db;

// Sprint 04-008H: Attach dev-only Prisma query event logging.
// Logs per-query duration without raw SQL values. Gate checked inside attachPrismaPerfLogging.
if (db) attachPrismaPerfLogging(db);

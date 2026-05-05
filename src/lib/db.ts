import { PrismaClient } from "@/generated/prisma";
import { attachPrismaPerfLogging } from "@/lib/perf";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrismaDatasourceUrl(): string {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const directUrl = process.env.DIRECT_URL ?? "";
  const isVercelPreview = process.env.VERCEL_ENV === "preview";
  const isThisAuditBranch =
    process.env.VERCEL_GIT_COMMIT_REF === "fix/mobile-suara-profile-admin-access-polish";

  if (isVercelPreview && isThisAuditBranch && directUrl) {
    return directUrl;
  }

  return databaseUrl;
}

function previewDirectUrlRuntimeEnabled(): boolean {
  return (
    process.env.VERCEL_ENV === "preview" &&
    process.env.VERCEL_GIT_COMMIT_REF === "fix/mobile-suara-profile-admin-access-polish" &&
    Boolean(process.env.DIRECT_URL)
  );
}

function createClient(): PrismaClient | null {
  const url = getPrismaDatasourceUrl();
  const valid =
    url.startsWith("postgresql://") ||
    url.startsWith("postgres://") ||
    url.startsWith("prisma://") ||
    url.startsWith("prisma+postgres://");

  if (!valid) return null;

  try {
    if (previewDirectUrlRuntimeEnabled()) {
      console.info("[perf][back-office] route=db step=previewDirectUrlRuntime enabled=true");
    }

    return new PrismaClient({
      datasources: {
        db: { url },
      },
    });
  } catch {
    return null;
  }
}

export const db: PrismaClient = (globalForPrisma.prisma ?? createClient()) as PrismaClient;

if (process.env.NODE_ENV !== "production" && db) globalForPrisma.prisma = db;

// Sprint 04-008H: Attach dev-only Prisma query event logging.
// Logs per-query duration without raw SQL values. Gate checked inside attachPrismaPerfLogging.
if (db) attachPrismaPerfLogging(db);

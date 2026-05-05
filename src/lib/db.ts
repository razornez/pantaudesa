import { PrismaClient } from "@/generated/prisma";
import { attachPrismaPerfLogging } from "@/lib/perf";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrismaDatasourceUrl(): string {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const directUrl = process.env.DIRECT_URL ?? "";
  const isVercelPreview = process.env.VERCEL_ENV === "preview";
  const isThisAuditBranch =
    process.env.VERCEL_GIT_COMMIT_REF === "fix/mobile-suara-profile-admin-access-polish";
  const isLocalRuntime = !process.env.VERCEL && !process.env.VERCEL_ENV;

  if (isVercelPreview && isThisAuditBranch && directUrl) {
    return directUrl;
  }

  if (isLocalRuntime && directUrl) {
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

function localDirectUrlRuntimeEnabled(): boolean {
  return !process.env.VERCEL && !process.env.VERCEL_ENV && Boolean(process.env.DIRECT_URL);
}

function getUrlDebugParts(
  url: string,
): { host: string | null; port: string | null; projectHint: string | null; databaseName: string | null } {
  if (!url) return { host: null, port: null, projectHint: null, databaseName: null };

  try {
    const parsed = new URL(url);
    const username = parsed.username || "";
    const projectHint = username.includes(".") ? username.split(".")[1] || null : null;
    const databaseName = parsed.pathname.replace(/^\/+/, "") || null;

    return {
      host: parsed.hostname || null,
      port: parsed.port || null,
      projectHint,
      databaseName,
    };
  } catch {
    return { host: "invalid", port: null, projectHint: null, databaseName: null };
  }
}

export function getPrismaRuntimeDebugInfo() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const directUrl = process.env.DIRECT_URL ?? "";
  const selectedUrl = getPrismaDatasourceUrl();
  const database = getUrlDebugParts(databaseUrl);
  const direct = getUrlDebugParts(directUrl);
  const selected = getUrlDebugParts(selectedUrl);

  return {
    vercelEnv: process.env.VERCEL_ENV ?? null,
    gitBranch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    usingPreviewDirect: previewDirectUrlRuntimeEnabled(),
    usingLocalDirect: localDirectUrlRuntimeEnabled(),
    databaseUrlHost: database.host,
    databaseUrlPort: database.port,
    databaseUrlProjectHint: database.projectHint,
    databaseUrlDatabaseName: database.databaseName,
    directUrlHost: direct.host,
    directUrlPort: direct.port,
    directUrlProjectHint: direct.projectHint,
    directUrlDatabaseName: direct.databaseName,
    selectedHost: selected.host,
    selectedPort: selected.port,
    selectedProjectHint: selected.projectHint,
    selectedDatabaseName: selected.databaseName,
  };
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
    if (localDirectUrlRuntimeEnabled()) {
      console.info("[perf][back-office] route=db step=localDirectUrlRuntime enabled=true");
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

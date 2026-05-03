import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client for storage operations.
// Uses service role key — NEVER import this file from a client component.

let _client: SupabaseClient | null = null;
let _bucket: string | null = null;

export const ADMIN_DESA_DOCUMENTS_BUCKET_DEFAULT = "admin-desa-documents";
export const SIGNED_URL_TTL_SECONDS_DEFAULT = 900; // 15 minutes

function getStorageClient(): { client: SupabaseClient; bucket: string } {
  if (_client && _bucket) return { client: _client, bucket: _bucket };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET_ADMIN_DESA_DOCUMENTS ?? ADMIN_DESA_DOCUMENTS_BUCKET_DEFAULT;

  if (!url) {
    throw new StorageNotConfiguredError("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!serviceRoleKey) {
    throw new StorageNotConfiguredError("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  _client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  _bucket = bucket;
  return { client: _client, bucket: _bucket };
}

export class StorageNotConfiguredError extends Error {
  code = "STORAGE_NOT_CONFIGURED" as const;
  constructor(message: string) {
    super(message);
    this.name = "StorageNotConfiguredError";
  }
}

export class StorageOperationError extends Error {
  code = "STORAGE_OPERATION_FAILED" as const;
  constructor(message: string) {
    super(message);
    this.name = "StorageOperationError";
  }
}

export function isStorageConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSignedUrlTtl(): number {
  const raw = process.env.SUPABASE_STORAGE_SIGNED_URL_TTL_SECONDS;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : SIGNED_URL_TTL_SECONDS_DEFAULT;
}

export interface UploadResult {
  storageKey: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Upload a buffer to the private bucket. The storageKey is the path within the
 * bucket — never expose this directly; always render via createSignedUrl.
 */
export async function uploadDocumentBuffer(
  storageKey: string,
  buffer: Buffer | Uint8Array,
  mimeType: string,
): Promise<UploadResult> {
  const { client, bucket } = getStorageClient();
  const { error } = await client.storage.from(bucket).upload(storageKey, buffer, {
    contentType: mimeType,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    throw new StorageOperationError(`Upload failed: ${error.message}`);
  }
  return { storageKey, fileSize: buffer.byteLength, mimeType };
}

/**
 * Create a short-lived signed URL for previewing a private object.
 * Default TTL: 15 minutes (configurable via SUPABASE_STORAGE_SIGNED_URL_TTL_SECONDS).
 */
export async function createDocumentSignedUrl(
  storageKey: string,
  ttlSeconds = getSignedUrlTtl(),
): Promise<string> {
  const { client, bucket } = getStorageClient();
  const { data, error } = await client.storage.from(bucket).createSignedUrl(storageKey, ttlSeconds);
  if (error || !data?.signedUrl) {
    throw new StorageOperationError(`Signed URL failed: ${error?.message ?? "no signedUrl returned"}`);
  }
  return data.signedUrl;
}

export async function deleteDocumentObject(storageKey: string): Promise<void> {
  const { client, bucket } = getStorageClient();
  const { error } = await client.storage.from(bucket).remove([storageKey]);
  if (error) {
    throw new StorageOperationError(`Delete failed: ${error.message}`);
  }
}

/**
 * Build a safe storage path: admin-desa/{desaId}/{yyyy}/{mm}/{documentId}-{safeFileName}
 */
export function buildDocumentStoragePath(desaId: string, documentId: string, fileName: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeName = sanitizeFileName(fileName);
  return `admin-desa/${desaId}/${yyyy}/${mm}/${documentId}-${safeName}`;
}

function sanitizeFileName(name: string): string {
  // Strip directory traversal, trim, allow only [A-Za-z0-9._-], collapse spaces, max 80 chars.
  const base = name.split(/[\\/]/).pop() ?? "file";
  return base
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "file";
}

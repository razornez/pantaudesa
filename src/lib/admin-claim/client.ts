export type ClaimMethod = "OFFICIAL_EMAIL" | "WEBSITE_TOKEN" | "SUPPORT_REVIEW";

export class AdminClaimClientError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json() as T & { error?: string; message?: string };
  if (!response.ok) {
    throw new AdminClaimClientError(payload.error ?? payload.message ?? "Request failed", response.status);
  }
  return payload;
}

export async function submitClaim(input: {
  desaId: string;
  method: ClaimMethod;
  officialEmail?: string;
  websiteUrl?: string;
}) {
  const response = await fetch("/api/admin-claim/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<{ claimId: string; status: string; method: ClaimMethod }>(response);
}

export async function generateEmailToken(input: { claimId: string; officialEmail: string }) {
  const response = await fetch("/api/admin-claim/generate-email-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<{ ok: boolean; expiresAt?: string }>(response);
}

export async function generateWebsiteToken(input: { claimId: string; websiteUrl: string }) {
  const response = await fetch("/api/admin-claim/generate-website-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<{ ok: boolean; rawToken: string; expiresAt?: string }>(response);
}

export async function checkWebsiteToken(input: { claimId: string; rawToken: string }) {
  const response = await fetch("/api/admin-claim/check-website-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<{ ok: boolean; found?: boolean; reason?: string }>(response);
}

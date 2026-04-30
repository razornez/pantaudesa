"use client";

import { useState } from "react";
import {
  checkWebsiteToken,
  generateEmailToken,
  generateWebsiteToken,
  submitClaim,
  type ClaimMethod,
} from "@/lib/admin-claim/client";

export function useAdminClaimFlow(onRefresh: () => Promise<void>) {
  const [claimId, setClaimId] = useState<string | null>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearNotice = () => {
    setFeedback(null);
    setError(null);
  };

  async function runSafely(fn: () => Promise<void>) {
    setBusy(true);
    clearNotice();
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  async function createClaim(input: { desaId: string; method: ClaimMethod; officialEmail?: string; websiteUrl?: string }) {
    await runSafely(async () => {
      const payload = await submitClaim(input);
      setClaimId(payload.claimId);
      setFeedback("Klaim berhasil dibuat. Lanjutkan verifikasi sesuai metode.");
      await onRefresh();
    });
  }

  async function sendEmailToken(officialEmail: string) {
    if (!claimId) return;
    await runSafely(async () => {
      await generateEmailToken({ claimId, officialEmail });
      setFeedback("Email verifikasi berhasil dikirim.");
      await onRefresh();
    });
  }

  async function regenWebsiteToken(websiteUrl: string) {
    if (!claimId) return;
    await runSafely(async () => {
      const payload = await generateWebsiteToken({ claimId, websiteUrl });
      setRawToken(payload.rawToken);
      setFeedback("Token website berhasil dibuat.");
    });
  }

  async function verifyWebsiteToken() {
    if (!claimId || !rawToken) return;
    await runSafely(async () => {
      const payload = await checkWebsiteToken({ claimId, rawToken });
      if (!payload.found) {
        throw new Error(`Token belum ditemukan (${payload.reason ?? "unknown"}).`);
      }
      setFeedback("Token ditemukan. Status diperbarui.");
      await onRefresh();
    });
  }

  return {
    claimId,
    rawToken,
    busy,
    feedback,
    error,
    createClaim,
    sendEmailToken,
    regenWebsiteToken,
    verifyWebsiteToken,
  };
}

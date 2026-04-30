"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminClaimProfileData } from "@/lib/data/admin-claim-read";
import {
  buildSupportMailto,
  getClientSupportEmail,
  getSelectedDesa,
  isDemoSession,
} from "@/components/profil/admin-claim/adminClaimCopy";

export function useAdminClaimProfile() {
  const [data, setData] = useState<AdminClaimProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [requestSeq, setRequestSeq] = useState(0);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setRequestSeq((value) => value + 1);
  }

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function load() {
    setLoading(true);
      try {
        const response = await fetch("/api/admin-claim/profile", { signal: controller.signal, cache: "no-store" });
        if (!response.ok) {
          throw new Error(`admin claim profile load failed: ${response.status}`);
        }
        const payload = await response.json() as AdminClaimProfileData;
        if (!mounted) return;
        setData(payload);
        setLoadError(false);
      } catch {
        if (!mounted || controller.signal.aborted) return;
        setLoadError(true);
        setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [requestSeq]);

  const supportEmail = data?.supportEmail ?? getClientSupportEmail();
  const defaultDesaId = data?.selectedDesaId ?? data?.desaOptions?.[0]?.id ?? null;
  const defaultDesa = useMemo(
    () => getSelectedDesa(data?.desaOptions ?? [], defaultDesaId),
    [data?.desaOptions, defaultDesaId],
  );
  const supportHref = supportEmail && defaultDesa
    ? buildSupportMailto(supportEmail, defaultDesa.nama)
    : undefined;

  return {
    data,
    loading,
    loadError,
    supportEmail,
    supportHref,
    defaultDesaId,
    isDemoAccount: isDemoSession(data),
    refresh,
  };
}

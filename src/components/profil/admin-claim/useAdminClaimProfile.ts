"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminClaimProfileData } from "@/lib/data/admin-claim-read";
import {
  getSelectedDesa,
  isDemoSession,
} from "@/components/profil/admin-claim/adminClaimCopy";

export function useAdminClaimProfile() {
  const [data, setData] = useState<AdminClaimProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [requestSeq, setRequestSeq] = useState(0);

  const refresh = useCallback(async () => {
    setRequestSeq((value) => value + 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    fetch("/api/admin-claim/profile", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`admin claim profile load failed: ${response.status}`);
        }
        const payload = (await response.json()) as AdminClaimProfileData;
        if (!mounted) return;
        setData(payload);
        setLoadError(false);
      })
      .catch(() => {
        if (!mounted || controller.signal.aborted) return;
        setLoadError(true);
        setData(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [requestSeq]);

  const defaultDesaId = data?.selectedDesaId ?? data?.desaOptions?.[0]?.id ?? null;
  const defaultDesa = useMemo(
    () => getSelectedDesa(data?.desaOptions ?? [], defaultDesaId),
    [data?.desaOptions, defaultDesaId],
  );

  return {
    data,
    loading,
    loadError,
    defaultDesaId,
    defaultDesa,
    isDemoAccount: isDemoSession(data),
    refresh,
  };
}

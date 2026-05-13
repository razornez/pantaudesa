"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminClaimProfileData } from "@/lib/data/admin-claim-read";
import {
  getSelectedDesa,
  isDemoSession,
} from "@/components/profil/admin-claim/adminClaimCopy";
import { fetchAdminClaimProfile } from "@/components/profil/admin-claim/api";

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

    fetchAdminClaimProfile(controller.signal)
      .then((payload) => {
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

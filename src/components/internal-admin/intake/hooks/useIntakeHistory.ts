/**
 * Hook for Intake History - fetch and manage history data
 */

import { useCallback, useEffect, useState } from "react";
import type {
  IntakeHistoryResponse,
  DesaVersionHistoryResponse,
} from "../types";
import { getPayloadError, readJsonLikeResponse } from "../utils";

// ============================================================================
// Intake History Hook
// ============================================================================

export function useIntakeHistory() {
  const [history, setHistory] = useState<IntakeHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestHistory = useCallback(async () => {
    const res = await fetch("/api/internal-admin/intake/history", {
      headers: { Accept: "application/json" },
    });
    const payload = await readJsonLikeResponse<IntakeHistoryResponse>(res);

    if (!res.ok || "error" in payload) {
      throw new Error(getPayloadError(payload, "Gagal memuat riwayat intake."));
    }

    return payload;
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await requestHistory();
      setHistory(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat riwayat intake.");
    } finally {
      setLoading(false);
    }
  }, [requestHistory]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialHistory = async () => {
      try {
        const payload = await requestHistory();
        if (!cancelled) {
          setHistory(payload);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memuat riwayat intake.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadInitialHistory();

    return () => {
      cancelled = true;
    };
  }, [requestHistory]);

  return {
    history,
    loading,
    error,
    fetchHistory,
    refetch: fetchHistory,
  };
}

// ============================================================================
// Version History Hook
// ============================================================================

export function useVersionHistory(selectedDesaId: string | null) {
  const [versionHistory, setVersionHistory] = useState<DesaVersionHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when selectedDesaId changes
    if (!selectedDesaId) {
      return;
    }

    let cancelled = false;

    const loadVersionHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/internal-admin/desa-version-history?desaId=${encodeURIComponent(selectedDesaId)}`,
          {
            headers: { Accept: "application/json" },
          }
        );
        const payload = await readJsonLikeResponse<DesaVersionHistoryResponse>(res);

        if (!res.ok || "error" in payload) {
          throw new Error(getPayloadError(payload, "Gagal memuat riwayat versi desa."));
        }

        if (!cancelled) {
          setVersionHistory(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memuat riwayat versi desa.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadVersionHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedDesaId]);

  const reset = useCallback(() => {
    setVersionHistory(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    versionHistory,
    loading,
    error,
    reset,
  };
}

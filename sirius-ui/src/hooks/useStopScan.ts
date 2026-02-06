// src/hooks/useStopScan.ts
import { useState, useCallback } from "react";
import { api } from "~/utils/api";

export interface StopScanResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Hook for stopping the currently running scan.
 * Provides loading state, error handling, and the stop function.
 */
export function useStopScan() {
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelScanMutation = api.scanner.cancelScan.useMutation({
    onSuccess: (data) => {
      if (!data.success) {
        setError(data.error || data.message);
      } else {
        setError(null);
      }
    },
    onError: (err) => {
      setError(err.message);
    },
    onSettled: () => {
      setIsStopping(false);
    },
  });

  const stopScan = useCallback(async (scanId?: string): Promise<StopScanResult> => {
    setIsStopping(true);
    setError(null);

    try {
      const result = await cancelScanMutation.mutateAsync(
        scanId ? { scanId } : undefined
      );

      return {
        success: result.success,
        message: result.message,
        error: result.error,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to stop scan";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }, [cancelScanMutation]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    stopScan,
    isStopping,
    error,
    clearError,
    isSuccess: cancelScanMutation.isSuccess && !error,
  };
}

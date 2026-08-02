// src/hooks/useStopScan.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "~/utils/api";

export interface StopScanResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Stop escalation stages:
 * - idle: No stop in progress
 * - stopping: Graceful stop sent, waiting for scanner to respond
 * - force_available: Graceful stop timed out (10s), force stop button shown
 * - force_stopping: Force stop sent, waiting for state reset
 * - reset_available: Force stop timed out (5s) or failed, reset button shown
 */
export type StopStage =
  | "idle"
  | "stopping"
  | "force_available"
  | "force_stopping"
  | "reset_available";

/** Timeout before escalating from graceful stop to force stop (ms) */
const GRACEFUL_STOP_TIMEOUT = 10_000;
/** Timeout before escalating from force stop to reset (ms) */
const FORCE_STOP_TIMEOUT = 5_000;

/**
 * Hook for stopping the caller's owned scan with three-tier escalation:
 *
 * Tier 1: Graceful stop (cancelOwnedScan) — exact-id cancel via RabbitMQ
 * Tier 2: Force stop — force_cancel + owned status/state update
 * Tier 3: Reset workspace — clears scan:latest pointer (blank slate)
 */
export function useStopScan() {
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stopStage, setStopStage] = useState<StopStage>("idle");

  const gracefulTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const forceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (gracefulTimeoutRef.current) clearTimeout(gracefulTimeoutRef.current);
      if (forceTimeoutRef.current) clearTimeout(forceTimeoutRef.current);
    };
  }, []);

  const cancelScanMutation = api.scanner.cancelOwnedScan.useMutation({
    onSuccess: (data) => {
      if (!data.success) {
        setError(data.error || data.message);
        setStopStage("force_available");
        setIsStopping(false);
      }
    },
    onError: (err) => {
      setError(err.message);
      setStopStage("force_available");
      setIsStopping(false);
    },
  });

  const forceStopMutation = api.scanner.forceStopOwnedScan.useMutation({
    onSuccess: (data) => {
      if (!data.success) {
        setError(data.error || data.message);
        setStopStage("reset_available");
      } else {
        setError(null);
        setStopStage("idle");
      }
      setIsStopping(false);
    },
    onError: (err) => {
      setError(err.message);
      setStopStage("reset_available");
      setIsStopping(false);
    },
  });

  const resetScanMutation = api.scanner.resetOwnedWorkspace.useMutation({
    onSuccess: (data) => {
      if (!data.success) {
        setError(data.error || data.message);
      } else {
        setError(null);
        setStopStage("idle");
      }
      setIsStopping(false);
    },
    onError: (err) => {
      setError(err.message);
      setIsStopping(false);
    },
  });

  const utils = api.useContext();

  const stopScan = useCallback(
    async (scanId?: string): Promise<StopScanResult> => {
      if (gracefulTimeoutRef.current) clearTimeout(gracefulTimeoutRef.current);
      if (forceTimeoutRef.current) clearTimeout(forceTimeoutRef.current);

      setIsStopping(true);
      setError(null);
      setStopStage("stopping");

      gracefulTimeoutRef.current = setTimeout(() => {
        setStopStage((current) => {
          if (current === "stopping") {
            return "force_available";
          }
          return current;
        });
      }, GRACEFUL_STOP_TIMEOUT);

      try {
        const result = await cancelScanMutation.mutateAsync(
          scanId ? { scanId } : undefined
        );
        await utils.scanner.getLatestOwnedScan.invalidate();

        return {
          success: result.success,
          message: result.message,
          error: result.error,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to stop scan";
        setError(errorMessage);
        setStopStage("force_available");
        setIsStopping(false);
        return {
          success: false,
          message: errorMessage,
          error: errorMessage,
        };
      }
    },
    [cancelScanMutation, utils.scanner.getLatestOwnedScan]
  );

  const forceStopScan = useCallback(
    async (scanId?: string): Promise<StopScanResult> => {
      if (gracefulTimeoutRef.current) clearTimeout(gracefulTimeoutRef.current);

      setIsStopping(true);
      setError(null);
      setStopStage("force_stopping");

      forceTimeoutRef.current = setTimeout(() => {
        setStopStage((current) => {
          if (current === "force_stopping") {
            return "reset_available";
          }
          return current;
        });
      }, FORCE_STOP_TIMEOUT);

      try {
        const result = await forceStopMutation.mutateAsync(
          scanId ? { scanId } : undefined
        );

        if (forceTimeoutRef.current) clearTimeout(forceTimeoutRef.current);

        if (!result.success) {
          try {
            await resetScanMutation.mutateAsync();
            await utils.scanner.getLatestOwnedScan.invalidate();
            setStopStage("idle");
            setError(null);
            setIsStopping(false);
            return { success: true, message: "Owned workspace reset (fallback)" };
          } catch {
            // Fall through
          }
        }

        await utils.scanner.getLatestOwnedScan.invalidate();

        return {
          success: result.success,
          message: result.message,
          error: result.error,
        };
      } catch (err) {
        if (forceTimeoutRef.current) clearTimeout(forceTimeoutRef.current);

        try {
          await resetScanMutation.mutateAsync();
          await utils.scanner.getLatestOwnedScan.invalidate();
          setStopStage("idle");
          setError(null);
          setIsStopping(false);
          return { success: true, message: "Owned workspace reset (fallback)" };
        } catch {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to force stop scan";
          setError(errorMessage);
          setStopStage("reset_available");
          setIsStopping(false);
          return {
            success: false,
            message: errorMessage,
            error: errorMessage,
          };
        }
      }
    },
    [forceStopMutation, resetScanMutation, utils.scanner.getLatestOwnedScan]
  );

  const resetScan = useCallback(async (): Promise<StopScanResult> => {
    if (gracefulTimeoutRef.current) clearTimeout(gracefulTimeoutRef.current);
    if (forceTimeoutRef.current) clearTimeout(forceTimeoutRef.current);

    setIsStopping(true);
    setError(null);

    try {
      const result = await resetScanMutation.mutateAsync();
      await utils.scanner.getLatestOwnedScan.invalidate();
      if (result.success) {
        setStopStage("idle");
      }
      setIsStopping(false);
      return {
        success: result.success,
        message: result.message,
        error: result.error,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reset scan state";
      setError(errorMessage);
      setIsStopping(false);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }, [resetScanMutation, utils.scanner.getLatestOwnedScan]);

  const handleScanStatusChange = useCallback(
    (status: string | undefined) => {
      if (
        stopStage !== "idle" &&
        status !== "running" &&
        status !== "cancelling"
      ) {
        if (gracefulTimeoutRef.current)
          clearTimeout(gracefulTimeoutRef.current);
        if (forceTimeoutRef.current) clearTimeout(forceTimeoutRef.current);
        setStopStage("idle");
        setIsStopping(false);
        setError(null);
      }
    },
    [stopStage]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    stopScan,
    forceStopScan,
    resetScan,
    stopStage,
    isStopping,
    error,
    clearError,
    handleScanStatusChange,
    isSuccess: cancelScanMutation.isSuccess && !error,
  };
}

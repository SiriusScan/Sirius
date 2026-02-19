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
 * Hook for stopping the currently running scan with three-tier escalation:
 *
 * Tier 1: Graceful stop (existing cancelScan) — sends cancel via RabbitMQ
 * Tier 2: Force stop — kills processes + directly resets ValKey state
 * Tier 3: Reset dashboard — purely clears ValKey state, no scanner interaction
 */
export function useStopScan() {
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stopStage, setStopStage] = useState<StopStage>("idle");

  const gracefulTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const forceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (gracefulTimeoutRef.current) clearTimeout(gracefulTimeoutRef.current);
      if (forceTimeoutRef.current) clearTimeout(forceTimeoutRef.current);
    };
  }, []);

  // --- Mutations ---

  const cancelScanMutation = api.scanner.cancelScan.useMutation({
    onSuccess: (data) => {
      if (!data.success) {
        setError(data.error || data.message);
        // If graceful stop failed, jump straight to force_available
        setStopStage("force_available");
        setIsStopping(false);
      }
      // On success, keep isStopping true — we're waiting for status polling
      // to confirm the scan actually stopped. The timeout handles escalation.
    },
    onError: (err) => {
      setError(err.message);
      // API call itself failed — escalate to force_available immediately
      setStopStage("force_available");
      setIsStopping(false);
    },
  });

  const forceStopMutation = api.scanner.forceStopScan.useMutation({
    onSuccess: (data) => {
      if (!data.success) {
        setError(data.error || data.message);
        setStopStage("reset_available");
      } else {
        // Force stop succeeded — state should update via polling
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

  const resetScanMutation = api.scanner.resetScanState.useMutation({
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

  // --- Tier 1: Graceful Stop ---

  const stopScan = useCallback(
    async (scanId?: string): Promise<StopScanResult> => {
      // Clear any previous timeouts
      if (gracefulTimeoutRef.current) clearTimeout(gracefulTimeoutRef.current);
      if (forceTimeoutRef.current) clearTimeout(forceTimeoutRef.current);

      setIsStopping(true);
      setError(null);
      setStopStage("stopping");

      // Start the escalation timeout
      gracefulTimeoutRef.current = setTimeout(() => {
        // If we're still in "stopping" stage after timeout, escalate
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
    [cancelScanMutation]
  );

  // --- Tier 2: Force Stop ---

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
          // Server-side force stop returned failure — fall back to full reset (del)
          try {
            await resetScanMutation.mutateAsync();
            setStopStage("idle");
            setError(null);
            setIsStopping(false);
            return { success: true, message: "Scan state reset (fallback)" };
          } catch {
            // Fall through to original error handling
          }
        }

        return {
          success: result.success,
          message: result.message,
          error: result.error,
        };
      } catch (err) {
        if (forceTimeoutRef.current) clearTimeout(forceTimeoutRef.current);

        // Server-side force stop threw — fall back to full reset (del)
        try {
          await resetScanMutation.mutateAsync();
          setStopStage("idle");
          setError(null);
          setIsStopping(false);
          return { success: true, message: "Scan state reset (fallback)" };
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
    [forceStopMutation, resetScanMutation]
  );

  // --- Tier 3: Reset Dashboard ---
  // Directly deletes the currentScan key from ValKey via scanner.resetScanState.
  // Guaranteed to work if ValKey is up.

  const resetScan = useCallback(async (): Promise<StopScanResult> => {
    if (gracefulTimeoutRef.current) clearTimeout(gracefulTimeoutRef.current);
    if (forceTimeoutRef.current) clearTimeout(forceTimeoutRef.current);

    setIsStopping(true);
    setError(null);

    try {
      const result = await resetScanMutation.mutateAsync();
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
  }, [resetScanMutation]);

  // --- Reset state when scan transitions away from cancelling ---

  const handleScanStatusChange = useCallback(
    (status: string | undefined) => {
      if (
        stopStage !== "idle" &&
        status !== "running" &&
        status !== "cancelling"
      ) {
        // Scan is no longer active — reset stop state
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
    // Tier 1: Graceful stop
    stopScan,
    // Tier 2: Force stop
    forceStopScan,
    // Tier 3: Reset dashboard
    resetScan,
    // State
    stopStage,
    isStopping,
    error,
    clearError,
    // Called by parent when scan status changes (from polling)
    handleScanStatusChange,
    isSuccess: cancelScanMutation.isSuccess && !error,
  };
}

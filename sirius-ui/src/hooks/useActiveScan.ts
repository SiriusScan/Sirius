// hooks/useActiveScan.ts
import { useMemo } from "react";
import { api } from "~/utils/api";
import { b64Decode } from "~/utils/std";
import {
  IDLE_SCAN,
  isScanActive,
  summarizeScan,
  type ActiveScan,
} from "~/components/shared/scanSummary";

export type { ActiveScan } from "~/components/shared/scanSummary";

/** Poll every 3s while a scan runs, every 15s otherwise. */
export const ACTIVE_SCAN_POLL_MS = 3_000;
export const IDLE_SCAN_POLL_MS = 15_000;
const ERROR_POLL_MS = 60_000;

function decode(raw: string | null | undefined) {
  if (!raw) return null;
  // b64Decode needs the browser's atob; guard server rendering.
  if (typeof atob !== "function") return null;
  return b64Decode(raw);
}

/**
 * The current scan, from the same ValKey `currentScan` record (tRPC
 * store.getValue) the Scanner page reads through useScanResults, so both
 * share one cached query. Returns an idle summary when no scan exists or the
 * record can't be read.
 */
export function useActiveScan(options: { enabled?: boolean } = {}): ActiveScan {
  const enabled = options.enabled ?? true;
  const query = api.store.getValue.useQuery(
    { key: "currentScan" },
    {
      enabled,
      retry: false,
      refetchOnWindowFocus: false,
      refetchInterval: (data, q) => {
        if (q.state.status === "error") return ERROR_POLL_MS;
        return isScanActive(decode(data)?.status) ? ACTIVE_SCAN_POLL_MS : IDLE_SCAN_POLL_MS;
      },
    },
  );

  const data = query.data;
  return useMemo(() => (data ? summarizeScan(decode(data)) : IDLE_SCAN), [data]);
}

export default useActiveScan;

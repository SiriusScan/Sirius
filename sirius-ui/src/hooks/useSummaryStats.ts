/**
 * useSummaryStats — the one source for every count a page shows (ADR-2).
 *
 * Wraps `statistics.getSummary`: hosts, open findings and unique CVEs by
 * severity, the riskiest hosts on the one risk scale (ADR-3), the last scan
 * and the top findings. Pages read counts from here instead of deriving them
 * from list queries. After a scan completes (or a host is added), call
 * `invalidateSummary(utils)` so every page shows the new numbers.
 */

import { api } from "~/utils/api";
import type { SummaryStats } from "~/types/riskSummary";

export type { SummaryStats };

/** Poll interval: the summary is cheap and pages stay current while open. */
export const SUMMARY_REFETCH_MS = 30_000;

export interface UseSummaryStatsOptions {
  /** Defaults to true. */
  enabled?: boolean;
}

export function useSummaryStats(options: UseSummaryStatsOptions = {}) {
  return api.statistics.getSummary.useQuery(undefined, {
    enabled: options.enabled ?? true,
    refetchInterval: SUMMARY_REFETCH_MS,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
    keepPreviousData: true,
  });
}

type TrpcUtils = ReturnType<typeof api.useContext>;

/**
 * Refetch the summary everywhere it is shown: after scan_completed,
 * host_created or vulnerabilities_found, or a host saved by hand.
 */
export function invalidateSummary(utils: TrpcUtils): Promise<void> {
  return utils.statistics.getSummary.invalidate();
}

export default useSummaryStats;

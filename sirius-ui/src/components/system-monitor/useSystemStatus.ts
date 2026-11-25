/**
 * useSystemStatus — the one query behind System Monitor's Services and
 * Resources tabs: tRPC `system.status`, which returns `loadSystemStatus()`
 * (container observation plus health probe per service, see ./systemStatus).
 *
 * The browser can't call the Go API's /api/v1/system/* routes itself: they
 * need the internal API key, which only the server holds. So the status goes
 * through a session-authenticated tRPC procedure, like the logs router does.
 *
 * Fresh observations age in the browser (`projectFreshness`): each one turns
 * stale on its own when its freshness window ends, and all of them do when a
 * refresh fails, so the page never shows an expired reading as current.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "~/utils/api";
import { projectFreshness } from "./systemStatus";

export const AUTO_REFRESH_MS = 5000;
export const AUTO_REFRESH_LABEL = "auto-refresh every 5 s";

export interface SystemStatusError {
  message: string;
}

/** Polls every 5 s while the page is visible; keeps the last answer while refetching. */
export function useSystemStatus(options: { enabled?: boolean } = {}) {
  const query = api.system.status.useQuery(undefined, {
    enabled: options.enabled ?? true,
    refetchInterval: AUTO_REFRESH_MS,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
    retry: 1,
  });
  const { data, dataUpdatedAt, isError } = query;
  // Bumped when the next fresh observation expires, to re-project.
  const [clock, setClock] = useState(0);
  const projected = useMemo(
    () => (data ? projectFreshness(data, dataUpdatedAt, Date.now(), isError) : undefined),
    // `clock` re-runs the projection at each expiry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, dataUpdatedAt, isError, clock],
  );
  const nextExpiry = projected?.nextExpiry ?? Infinity;
  useEffect(() => {
    if (!Number.isFinite(nextExpiry)) return;
    const timer = setTimeout(() => setClock(Date.now()), Math.max(0, nextExpiry - Date.now()));
    return () => clearTimeout(timer);
  }, [nextExpiry]);

  return { ...query, data: projected?.status };
}

/** Invalidates the status query (the page's Refresh). */
export function useInvalidateSystemStatus(): () => Promise<void> {
  const utils = api.useContext();
  return useCallback(
    () => utils.system.status.invalidate(),
    [utils],
  );
}

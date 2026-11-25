import { useEffect, useState } from "react";
import { api } from "~/utils/api";

export function useSystemResources(
  refetchInterval: number | false = 5000,
  enabled = true
) {
  const query = api.system.resources.useQuery(undefined, {
    enabled,
    refetchInterval,
    retry: false,
  });
  const [expiredSnapshot, setExpiredSnapshot] = useState<number>();
  const { data, dataUpdatedAt } = query;

  // The server's response clock establishes the remaining lifetime, so a
  // browser with a different wall-clock offset reports the same freshness.
  let expiresAt = Infinity;
  if (data) {
    const responseTime = Date.parse(data.timestamp);
    for (const row of data.containers) {
      if (row.telemetry_status === "fresh" && row.observed_at) {
        const remaining =
          Date.parse(row.observed_at) + data.freshness_seconds * 1000 - responseTime;
        expiresAt = Math.min(expiresAt, dataUpdatedAt + remaining);
      }
    }
  }
  useEffect(() => {
    if (!enabled || !Number.isFinite(expiresAt)) return;
    const timer = setTimeout(
      () => setExpiredSnapshot(dataUpdatedAt),
      Math.max(0, expiresAt - Date.now())
    );
    return () => clearTimeout(timer);
  }, [dataUpdatedAt, enabled, expiresAt]);

  const expired = !!data && (query.isError || expiredSnapshot === dataUpdatedAt || Date.now() >= expiresAt);
  const stale = expired || (!!data?.summary.stale_containers && !data.summary.fresh_containers);
  const observations = expired && data
    ? {
        ...data,
        containers: data.containers.map((row) =>
          row.telemetry_status === "fresh"
            ? { ...row, telemetry_status: "stale" as const }
            : row
        ),
      }
    : data;
  return {
    data: enabled ? observations : undefined,
    hasFresh: enabled && !stale && !!data?.summary.fresh_containers,
    loading: query.isInitialLoading,
    refreshing: query.isFetching,
    unavailable: query.isError || data?.availability === "unavailable",
    stale,
    refetch: query.refetch,
  };
}

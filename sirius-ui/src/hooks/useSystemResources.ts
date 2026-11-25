import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { projectSystemResources } from "~/utils/systemResourceObservations";

export function useSystemResources(
  refetchInterval: number | false = 5000,
  enabled = true
) {
  const query = api.system.resources.useQuery(undefined, {
    enabled,
    refetchInterval,
    retry: false,
  });
  const [, setClock] = useState(0);
  const { data, dataUpdatedAt } = query;
  const { containers, nextExpiry, ...projection } = projectSystemResources(
    enabled ? data : undefined, dataUpdatedAt, Date.now(), query.isError
  );
  useEffect(() => {
    if (!Number.isFinite(nextExpiry)) return;
    const timer = setTimeout(() => setClock(Date.now()), Math.max(0, nextExpiry - Date.now()));
    return () => clearTimeout(timer);
  }, [nextExpiry]);

  return {
    ...projection,
    data: enabled && data ? { ...data, containers } : undefined,
    loading: query.isInitialLoading,
    refreshing: query.isFetching,
    unavailable: query.isError || !projection.freshCount,
    refetch: query.refetch,
  };
}

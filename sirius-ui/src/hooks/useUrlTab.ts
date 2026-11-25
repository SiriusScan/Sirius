// hooks/useUrlTab.ts
import { useCallback } from "react";
import { useRouter } from "next/router";

/**
 * Keeps a page's active tab in the URL (`?tab=<id>` by default) so a tab can
 * be linked, restored with Back and shared. Switching tabs replaces the
 * current history entry shallowly: no data refetch, no extra Back step.
 */
export function useUrlTab<T extends string>(
  tabs: readonly T[],
  defaultTab: T,
  param = "tab",
): [T, (tab: T) => void] {
  const router = useRouter();
  const raw = router.query[param];
  const requested = Array.isArray(raw) ? raw[0] : raw;
  const active = (tabs as readonly string[]).includes(requested ?? "")
    ? (requested as T)
    : defaultTab;

  const setTab = useCallback(
    (tab: T) => {
      const query = { ...router.query, [param]: tab };
      void router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router, param],
  );

  return [active, setTab];
}

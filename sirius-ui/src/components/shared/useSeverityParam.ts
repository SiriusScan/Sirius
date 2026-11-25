/**
 * useSeverityParam — a severity filter held in the URL
 * (`?severity=critical,high`), like useUrlTab holds tabs, so a filtered list
 * can be linked and restored with Back.
 *
 *   const [severities, setSeverities, toggle] = useSeverityParam();
 *   <SeverityStrip variant="compact" counts={counts} selected={severities} onSelect={toggle} />
 *   <VulnTable preset="inventory" rows={rows} severityFilter={severities} />
 */

import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import {
  formatSeverityParam,
  parseSeverityParam,
  toggleSeverity,
  type Severity,
} from "./severity";

export function useSeverityParam(
  param = "severity",
): [Severity[], (next: readonly Severity[]) => void, (severity: Severity) => void] {
  const router = useRouter();
  const raw = router.query[param];
  const key = Array.isArray(raw) ? raw.join(",") : raw ?? "";
  const selected = useMemo(() => parseSeverityParam(key), [key]);

  const set = useCallback(
    (next: readonly Severity[]) => {
      const query = { ...router.query };
      const value = formatSeverityParam(next);
      if (value) query[param] = value;
      else delete query[param];
      void router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router, param],
  );

  const toggle = useCallback(
    (severity: Severity) => set(toggleSeverity(selected, severity)),
    [set, selected],
  );

  return [selected, set, toggle];
}

export default useSeverityParam;

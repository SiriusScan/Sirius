/**
 * useNewHosts — hosts a scan added since this viewer last acknowledged the
 * inventory (R04 banner, ADR-1).
 *
 * The marker is the newest first-seen time the viewer has seen, kept in
 * localStorage (`environment.lastSeenAt`): a per-browser convenience, not
 * shared state. On a first visit everything listed counts as seen, so the
 * banner only ever names hosts that arrived later. Dismissing moves the
 * marker to the newest host. Without storage (private window, blocked site
 * data) the marker starts fresh on every visit and the banner stays hidden.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LAST_SEEN_KEY,
  advanceMarker,
  initialMarker,
  newHostsSince,
  type HostRow,
} from "./hostsTableModel";

function readMarker(): string | null {
  try {
    const value = window.localStorage.getItem(LAST_SEEN_KEY);
    return value && Number.isFinite(Date.parse(value)) ? value : null;
  } catch {
    return null;
  }
}

function writeMarker(value: string): void {
  try {
    window.localStorage.setItem(LAST_SEEN_KEY, value);
  } catch {
    /* storage unavailable: the banner just won't persist */
  }
}

export interface NewHosts<T> {
  /** Hosts added by a scan after the marker, in the order given. */
  hosts: T[];
  /** The marker they are compared with (ISO), once read. */
  marker: string | null;
  /** Acknowledge them: the marker moves to the newest host listed. */
  dismiss: () => void;
}

/**
 * `rows` must be the loaded inventory (undefined while it loads or after an
 * error), so a failed request never resets the marker.
 */
export function useNewHosts<T extends HostRow>(rows: readonly T[] | undefined): NewHosts<T> {
  const [marker, setMarker] = useState<string | null>(null);

  useEffect(() => {
    if (!rows) return;
    const stored = readMarker();
    if (stored) {
      setMarker(stored);
      return;
    }
    const first = initialMarker(rows);
    writeMarker(first);
    setMarker(first);
  }, [rows]);

  const hosts = useMemo(() => (rows ? newHostsSince(rows, marker) : []), [rows, marker]);

  const dismiss = useCallback(() => {
    const next = advanceMarker(marker, rows ?? []);
    writeMarker(next);
    setMarker(next);
  }, [marker, rows]);

  return { hosts, marker, dismiss };
}

export default useNewHosts;

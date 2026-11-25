/**
 * scanSummary.ts — what the header needs to know about the current scan,
 * read from the same ValKey `currentScan` record the Scanner page shows.
 *
 * Pure, so it is tested without React (scanSummary.test.ts).
 */

import type { ScanResult, ScanStatus } from "~/types/scanTypes";

export interface ActiveScan {
  /** True while the scan waits to start, runs or is stopping. */
  active: boolean;
  /** The scan's status, or "idle" when there is no scan record. */
  status: ScanStatus | "idle";
  /** Targets as entered (an IP, a range or a CIDR each count as one). */
  targets: number;
  /** 0-100 from the scanner's own progress counters; absent until it reports any. */
  progress?: number;
  /** Units of work done and planned (hosts, plus agents for agent scans). */
  completed?: number;
  total?: number;
  scanId?: string;
  startedAt?: string;
}

export const IDLE_SCAN: ActiveScan = { active: false, status: "idle", targets: 0 };

/**
 * pending: the API admitted the scan and published it, and the scanner hasn't
 * started it yet. It already holds the one scan slot and can be stopped.
 */
const ACTIVE_STATUSES: ReadonlySet<string> = new Set(["pending", "running", "cancelling"]);

/** Same rule as the Scanner page: waiting to start, running or stopping. */
export function isScanActive(status: unknown): boolean {
  return typeof status === "string" && ACTIVE_STATUSES.has(status);
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

export function summarizeScan(scan: Partial<ScanResult> | null | undefined): ActiveScan {
  if (!scan || typeof scan !== "object" || typeof scan.status !== "string") return IDLE_SCAN;

  let completed = 0;
  let total = 0;
  for (const sub of Object.values(scan.sub_scans ?? {})) {
    if (!sub || sub.enabled === false) continue;
    const subTotal = count(sub.progress?.total);
    if (subTotal === 0) continue;
    total += subTotal;
    completed += Math.min(count(sub.progress?.completed), subTotal);
  }

  const summary: ActiveScan = {
    active: isScanActive(scan.status),
    status: scan.status,
    targets: Array.isArray(scan.targets) ? scan.targets.length : 0,
    scanId: typeof scan.id === "string" ? scan.id : undefined,
    startedAt: typeof scan.start_time === "string" ? scan.start_time : undefined,
  };
  if (total > 0) {
    summary.completed = completed;
    summary.total = total;
    summary.progress = Math.round((completed / total) * 100);
  }
  return summary;
}

/** "Scanning 1 target · 48%"; "Stopping scan" while it cancels. */
export function scanIndicatorLabel(scan: ActiveScan): string {
  if (scan.status === "cancelling") return "Stopping scan";
  if (scan.status === "pending") return "Starting scan";
  const targets = `${scan.targets} target${scan.targets === 1 ? "" : "s"}`;
  const head = scan.targets > 0 ? `Scanning ${targets}` : "Scanning";
  return scan.progress === undefined ? head : `${head} · ${scan.progress}%`;
}

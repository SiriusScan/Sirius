import type { ScanResult } from "~/types/scanTypes";

/** Legacy Community single-admin scratchpad (admin mirror only). */
export const CURRENT_SCAN_KEY = "currentScan";

/** Active statuses that block a second concurrent job for the same owner. */
export const ACTIVE_SCAN_STATUSES = new Set([
  "running",
  "dispatching",
  "cancelling",
]);

export function ownedLatestKey(ownerSubjectId: string): string {
  return `scan:latest:${ownerSubjectId}`;
}

export function ownedOwnerKey(scanId: string): string {
  return `scan:owner:${scanId}`;
}

export function ownedStateKey(scanId: string): string {
  return `scan:state:${scanId}`;
}

export function ownedStatusKey(scanId: string): string {
  return `scan:status:${scanId}`;
}

export function ownedConnectedAgentsKey(ownerSubjectId: string): string {
  return `agents:connected:${ownerSubjectId}`;
}

export function mintScanId(): string {
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function decodeScanState(raw: string): ScanResult {
  return JSON.parse(Buffer.from(raw, "base64").toString("utf-8")) as ScanResult;
}

export function encodeScanState(state: ScanResult): string {
  return Buffer.from(JSON.stringify(state)).toString("base64");
}

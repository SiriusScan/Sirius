// src/hooks/useScanResults.ts
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import {
  type ScanResult,
  type VulnerabilitySummary,
  type HostEntry,
} from "~/types/scanTypes";

function decodeScanResult(encoded: string): ScanResult | null {
  if (!encoded) return null;
  try {
    const decoded = atob(encoded);
    const parsed = JSON.parse(decoded) as ScanResult;
    return parsed;
  } catch (error) {
    console.error("Failed to decode scan result:", error);
    return null;
  }
}

export function useScanResults() {
  const scanStatusQuery = api.store.getValue.useQuery(
    { key: "currentScan" },
    { refetchInterval: 3000, refetchOnWindowFocus: false }
  );

  // New state for the decoded scan result
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [hosts, setHosts] = useState<HostEntry[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilitySummary[]>([]);

  useEffect(() => {
    const decoded = decodeScanResult(scanStatusQuery.data ?? "");
    setScanResult(decoded);
    if (!decoded) {
      setHosts([]);
      setVulnerabilities([]);
      return;
    }
    // Update only when there are live hosts reported.
    // Filter out host entries without a valid IP (defensive guard)
    const validHosts = (decoded.hosts ?? []).filter(
      (h: HostEntry) => h.ip && h.ip.trim() !== ""
    );
    if (validHosts.length === 0) {
      setHosts([]);
      setVulnerabilities([]);
    } else {
      setHosts(validHosts);
      setVulnerabilities(decoded.vulnerabilities);
    }
  }, [scanStatusQuery.data]);

  return { scanResult, hosts, vulnerabilities, scanStatusQuery };
}
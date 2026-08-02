// src/hooks/useScanResults.ts
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import {
  type ScanResult,
  type VulnerabilitySummary,
  type HostEntry,
} from "~/types/scanTypes";

/**
 * Polls the caller's latest owned scan workspace (scan:latest → scan:state).
 * New students with no latest pointer get a blank workspace (null).
 */
export function useScanResults() {
  const scanStatusQuery = api.scanner.getLatestOwnedScan.useQuery(undefined, {
    refetchInterval: 3000,
    refetchOnWindowFocus: false,
  });

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [hosts, setHosts] = useState<HostEntry[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<
    VulnerabilitySummary[]
  >([]);

  useEffect(() => {
    const payload = scanStatusQuery.data;
    const decoded = payload?.scan ?? null;

    // Prefer discrete scan:status when present so cancelling shows promptly.
    if (decoded && payload?.status && decoded.status !== payload.status) {
      setScanResult({
        ...decoded,
        status: payload.status as ScanResult["status"],
      });
    } else {
      setScanResult(decoded);
    }

    if (!decoded) {
      setHosts([]);
      setVulnerabilities([]);
      return;
    }

    const normalized = (decoded.hosts ?? []).map((h: HostEntry | string) => {
      if (typeof h === "string") {
        return { id: h, ip: h, hostname: h } as HostEntry;
      }
      return h;
    });

    const validHosts = normalized.filter(
      (h: HostEntry) => h.ip && h.ip.trim() !== ""
    );

    setHosts(validHosts);
    setVulnerabilities(decoded.vulnerabilities ?? []);
    if (validHosts.length === 0 && (decoded.vulnerabilities?.length ?? 0) > 0) {
      console.warn(
        "[useScanResults] No valid hosts in owned scan but vulnerabilities present; showing vulns anyway"
      );
    }
  }, [scanStatusQuery.data]);

  return { scanResult, hosts, vulnerabilities, scanStatusQuery };
}

// src/hooks/useScanResults.ts
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { b64Decode } from "~/utils/std";
import {
  type ScanResult,
  type VulnerabilitySummary,
  type HostEntry,
} from "~/types/scanTypes";

export function useScanResults() {
  const scanStatusQuery = api.store.getValue.useQuery(
    { key: "currentScan" },
    { refetchInterval: 3000, refetchOnWindowFocus: false }
  );

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [hosts, setHosts] = useState<HostEntry[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilitySummary[]>([]);

  useEffect(() => {
    const decoded = b64Decode(scanStatusQuery.data ?? "");
    // The packaged worker advances the network sub-scan before settling the
    // aggregate. Project the worker's start to the dashboard without a write.
    const network = decoded?.sub_scans?.network;
    setScanResult(
      decoded?.status === "pending" && network?.enabled && network.status === "running"
        ? { ...decoded, status: "running" }
        : decoded
    );
    if (!decoded) {
      setHosts([]);
      setVulnerabilities([]);
      return;
    }

    // Normalize hosts: backend may send plain IP strings or HostEntry objects
    const normalized = (decoded.hosts ?? []).map((h: HostEntry | string) => {
      if (typeof h === "string") {
        return { id: h, ip: h, hostname: h } as HostEntry;
      }
      return h;
    });

    const validHosts = normalized.filter(
      (h: HostEntry) => h.ip && h.ip.trim() !== ""
    );

    // Keep vulnerabilities even when host normalization is temporarily empty (e.g. decode/merge glitches).
    setHosts(validHosts);
    setVulnerabilities(decoded.vulnerabilities ?? []);
    if (validHosts.length === 0 && (decoded.vulnerabilities?.length ?? 0) > 0) {
      console.warn(
        "[useScanResults] No valid hosts in currentScan but vulnerabilities present; showing vulns anyway"
      );
    }
  }, [scanStatusQuery.data]);

  return { scanResult, hosts, vulnerabilities, scanStatusQuery };
}

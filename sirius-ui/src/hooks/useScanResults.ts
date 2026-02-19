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
    setScanResult(decoded);
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
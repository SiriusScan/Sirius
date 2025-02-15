// src/hooks/useScanResults.ts
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { type ScanResult, type Vulnerability } from "~/types/scanTypes";

function decodeScanResult(encoded: string): ScanResult | null {
  if (!encoded) return null;
  try {
    const decoded = atob(encoded);
    return JSON.parse(decoded) as ScanResult;
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
  const [hosts, setHosts] = useState<string[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);

  useEffect(() => {
    const decoded = decodeScanResult(scanStatusQuery.data ?? "");
    setScanResult(decoded);
    if (!decoded) {
      setHosts([]);
      setVulnerabilities([]);
      return;
    }
    // Update only when there are live hosts reported.
    if (decoded.hosts.length === 0) {
      setHosts([]);
      setVulnerabilities([]);
    } else {
      setHosts(decoded.hosts);
      setVulnerabilities(decoded.vulnerabilities);
    }
  }, [scanStatusQuery.data]);

  return { scanResult, hosts, vulnerabilities, scanStatusQuery };
}
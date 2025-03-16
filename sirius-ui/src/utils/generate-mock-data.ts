import { type Vulnerability } from "~/server/api/routers/host";
import { type HostVulnerabilityCounts } from "~/types/vulnerabilityTypes";

/**
 * Generate mock vulnerabilities for testing
 */
export function generateMockVulnerabilities(count: number): Vulnerability[] {
  const severities = [
    "critical",
    "high",
    "medium",
    "low",
    "informational",
  ] as const;
  const vulnerabilities: Vulnerability[] = [];

  for (let i = 0; i < count; i++) {
    const severityIndex = Math.floor(Math.random() * severities.length);
    const severity = severities[severityIndex];

    vulnerabilities.push({
      vid: `VID-${Math.floor(Math.random() * 10000)}`,
      riskScore:
        severity === "critical"
          ? 9.5
          : severity === "high"
          ? 7.5
          : severity === "medium"
          ? 5.5
          : severity === "low"
          ? 3.5
          : 1.5,
      cve: `CVE-${Math.floor(Math.random() * 10000)}-${Math.floor(
        Math.random() * 10000
      )}`,
      description: `This is a ${severity} vulnerability that affects system security.`,
      published: new Date().toISOString(),
      severity: severity, // This is guaranteed to be a non-undefined string
    });
  }

  return vulnerabilities;
}

/**
 * Create mock vulnerability counts for a host
 */
export function generateMockVulnerabilityCounts(): HostVulnerabilityCounts {
  // Create randomized counts
  const critical = Math.floor(Math.random() * 3); // 0-2 critical
  const high = Math.floor(Math.random() * 5); // 0-4 high
  const medium = Math.floor(Math.random() * 8); // 0-7 medium
  const low = Math.floor(Math.random() * 10); // 0-9 low
  const informational = Math.floor(Math.random() * 6); // 0-5 informational

  const total = critical + high + medium + low + informational;

  return {
    critical,
    high,
    medium,
    low,
    informational,
    total,
  };
}

/**
 * Create a mapping of hosts to mock vulnerability counts
 */
export function generateMockHostVulnerabilityMap(
  hostIPs: string[]
): Record<string, HostVulnerabilityCounts> {
  const result: Record<string, HostVulnerabilityCounts> = {};

  hostIPs.forEach((ip) => {
    result[ip] = generateMockVulnerabilityCounts();
  });

  return result;
}

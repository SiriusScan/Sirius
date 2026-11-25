import { riskScoreToSeverity } from "~/utils/riskScoreCalculator";
import type {
  DeduplicatedVulnerability,
  HostFindingObservation,
  HostFindingSnapshot,
  SeverityLevel,
  VulnerabilityWithSource,
} from "./types";

const severityLabels: Record<string, SeverityLevel> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
  info: "INFORMATIONAL",
};

export function observedTimestamp(value?: string | null): string | undefined {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
    value.startsWith("0001-01-01") ||
    !Number.isFinite(Date.parse(value))
  ) {
    return undefined;
  }
  return value;
}

function compareNewest(a?: string, b?: string): number {
  const aTime = a ? Date.parse(a) : Number.NEGATIVE_INFINITY;
  const bTime = b ? Date.parse(b) : Number.NEGATIVE_INFINITY;
  if (aTime === bTime) return 0;
  return aTime > bTime ? -1 : 1;
}

function newestFirst(
  a: HostFindingObservation,
  b: HostFindingObservation,
): number {
  return (
    compareNewest(a.lastSeen, b.lastSeen) ||
    compareNewest(a.firstSeen, b.firstSeen) ||
    (a.source ?? "").localeCompare(b.source ?? "")
  );
}

function readText(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() || undefined : undefined;
}

function readSnapshotEvidence(value: unknown): HostFindingSnapshot["evidence"] {
  const text = readText(value);
  if (text) return [{ label: "Evidence", text }];
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  const evidence: HostFindingSnapshot["evidence"] = [];
  const summary = "summary" in value ? readText(value.summary) : undefined;
  const path = "path" in value ? readText(value.path) : undefined;
  if (summary) evidence.push({ label: "Evidence summary", text: summary });
  if (path) evidence.push({ label: "Evidence path", text: path });
  return evidence;
}

function readSnapshotReferences(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const references = new Set<string>();
  for (const item of value as unknown[]) {
    const text = readText(item);
    if (!text) continue;
    try {
      const url = new URL(text);
      if (
        (url.protocol === "http:" || url.protocol === "https:") &&
        !url.username &&
        !url.password
      ) {
        references.add(url.href);
      }
    } catch {
      // Legacy references may contain arbitrary text instead of URLs.
    }
  }
  return Array.from(references);
}

function readSnapshot(
  finding: VulnerabilityWithSource["finding"],
): HostFindingSnapshot | undefined {
  if (!finding) return undefined;
  return {
    title: readText(finding.title),
    description: readText(finding.description),
    severity: readText(finding.severity),
    remediation: readText(finding.remediation),
    evidence: readSnapshotEvidence(finding.metadata?.evidence),
    references: readSnapshotReferences(finding.metadata?.references),
  };
}

export function normalizeHostFindings(
  rows?: readonly VulnerabilityWithSource[] | null,
  ip?: string,
): DeduplicatedVulnerability[] {
  type Observation = {
    evidence: HostFindingObservation;
    row: VulnerabilityWithSource;
  };
  const findings = new Map<string, Map<string, Observation>>();

  for (const [index, row] of (rows ?? []).entries()) {
    const id = row.VID?.trim();
    if (!id) continue;

    const source = row.source?.trim() || undefined;
    const key = source ? `source:${source}` : `unattributed:${index}`;
    const { confidence, port } = row;
    const evidence: HostFindingObservation = {
      key,
      source,
      version: row.source_version?.trim() || undefined,
      firstSeen: observedTimestamp(row.first_seen),
      lastSeen: observedTimestamp(row.last_seen),
      status: row.status?.trim() || undefined,
      confidence:
        Number.isFinite(confidence) && confidence >= 0 && confidence <= 1
          ? confidence
          : undefined,
      port:
        typeof port === "number" && Number.isInteger(port) && port > 0 && port <= 65535
          ? port
          : undefined,
      serviceInfo: row.service_info?.trim() || undefined,
      notes: row.notes?.trim() || undefined,
      snapshot: readSnapshot(row.finding),
    };

    const bySource = findings.get(id) ?? new Map<string, Observation>();
    const existing = bySource.get(key);
    if (!existing || newestFirst(evidence, existing.evidence) < 0) {
      bySource.set(key, { evidence, row });
    }
    findings.set(id, bySource);
  }

  const normalized: DeduplicatedVulnerability[] = [];
  for (const [cve, bySource] of findings) {
    const ordered = Array.from(bySource.values()).sort((a, b) =>
      newestFirst(a.evidence, b.evidence),
    );
    const latest = ordered[0]?.row;
    if (!latest) continue;

    const observations = ordered.map(({ evidence }) => evidence);
    const riskScore = latest.RiskScore;
    normalized.push({
      cve,
      severity: severityLabels[riskScoreToSeverity(riskScore)] ?? "INFORMATIONAL",
      description: latest.Description || "No description available",
      title: latest.Title || undefined,
      references: [],
      affectedHosts: ip ? [ip] : [],
      riskScore,
      sources: observations.flatMap(({ source }) => (source ? [source] : [])),
      observations,
    });
  }
  return normalized;
}

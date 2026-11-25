/**
 * hostModel.ts — the host page's pure parts (R05, R06): tab ids and links,
 * header labels, finding rows for VulnTable, the risk caption, data
 * freshness lines, software the scanner matched, agent data detection and
 * the findings CSV. Tested in hostModel.test.ts.
 *
 * Nothing here computes risk or severity counts: those come from the server
 * (ADR-3, ADR-2). These helpers only shape what the server returned.
 */

import type { HostFinding } from "~/server/api/routers/host";
import type { HostLastScan, OpenPort, SourceFreshness } from "~/types/riskSummary";
import {
  SEVERITIES,
  SEVERITY_LABELS,
  severityRank,
  type Severity,
} from "~/components/shared/severity";
import type { VulnRow } from "~/components/shared/vulnTableModel";
import { compactPortService, formatPortService } from "~/utils/portService";

// ─── Tabs and links (ADR-6) ─────────────────────────────────────────────────

export const HOST_TABS = ["overview", "vulnerabilities", "system", "network", "history"] as const;
export type HostTab = (typeof HOST_TABS)[number];
export const DEFAULT_HOST_TAB: HostTab = "overview";

/** System tab sections, held in `?sub=`. */
export const SYSTEM_SUB_TABS = ["overview", "software", "fingerprint", "users"] as const;
export type SystemSubTabId = (typeof SYSTEM_SUB_TABS)[number];
export const SYSTEM_SUB_PARAM = "sub";

const HOST_TAB_LABELS: Record<HostTab, string> = {
  overview: "Overview",
  vulnerabilities: "Vulnerabilities",
  system: "System",
  network: "Network",
  history: "History",
};

/** PageTabs entries; a count chip only when there is something to count. */
export function hostTabs(counts: { findings?: number; ports?: number }): {
  id: HostTab;
  label: string;
  count?: number;
}[] {
  return HOST_TABS.map((id) => {
    const count =
      id === "vulnerabilities" ? counts.findings : id === "network" ? counts.ports : undefined;
    return {
      id,
      label: HOST_TAB_LABELS[id],
      ...(typeof count === "number" && count > 0 ? { count } : {}),
    };
  });
}

/** "/host/<ip>?tab=vulnerabilities&severity=high". Overview is the bare URL. */
export function hostTabHref(
  ip: string,
  tab: HostTab = DEFAULT_HOST_TAB,
  extra: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  if (tab !== DEFAULT_HOST_TAB) params.set("tab", tab);
  for (const [key, value] of Object.entries(extra)) if (value) params.set(key, value);
  const query = params.toString();
  return `/host/${encodeURIComponent(ip)}${query ? `?${query}` : ""}`;
}

/** The Vulnerabilities tab filtered to one level (Open findings tiles). */
export function hostSeverityHref(ip: string, severity: Severity): string {
  return hostTabHref(ip, "vulnerabilities", { severity });
}

/** The Scanner, pre-filled with this host. */
export function rescanHref(ip: string): string {
  return `/scanner?target=${encodeURIComponent(ip)}`;
}

/** The operator console's Agent view, where the agent is set up. */
export const AGENT_HREF = "/terminal?view=agent";

// ─── Header labels ──────────────────────────────────────────────────────────

/** A stored value, or undefined for empty and "Unknown" placeholders. */
export function realText(value: string | null | undefined): string | undefined {
  const text = (value ?? "").trim();
  if (!text || /^(unknown|n\/a|none|-)$/i.test(text)) return undefined;
  return text;
}

const OS_NAMES: Record<string, string> = {
  linux: "Linux",
  windows: "Windows",
  macos: "macOS",
  "mac os": "macOS",
  darwin: "macOS",
  freebsd: "FreeBSD",
  openbsd: "OpenBSD",
  netbsd: "NetBSD",
  ios: "iOS",
  android: "Android",
};

/** Capitalise lowercase OS names the scanner stores ("linux" -> "Linux"). */
export function osName(os: string): string {
  const known = OS_NAMES[os.toLowerCase()];
  if (known) return known;
  return os === os.toLowerCase() ? os.charAt(0).toUpperCase() + os.slice(1) : os;
}

/**
 * The OS chip: "Linux · TTL 64, low confidence" from os "linux" and version
 * "TTL:64 (low confidence)"; "Ubuntu 22.04" for a plain version number.
 * undefined when nothing real is known.
 */
export function osLabel(os: string | null | undefined, osversion?: string | null): string | undefined {
  const name = realText(os);
  const rawVersion = realText(osversion);
  const version = rawVersion
    ?.replace(/\bTTL\s*:\s*/i, "TTL ")
    .replace(/\s*\(([^)]+)\)\s*$/, ", $1")
    .trim();
  if (!name) return version;
  if (!version) return osName(name);
  // A version number reads as one name ("Ubuntu 22.04"); a fingerprint note
  // is set apart ("Linux · TTL 64, low confidence").
  return /^\d/.test(version) ? `${osName(name)} ${version}` : `${osName(name)} · ${version}`;
}

// ─── Findings → VulnTable rows (ADR-4) ─────────────────────────────────────

/** "22 · openbsd openssh 10.0p2", or whichever half is known. */
export function portServiceLabel(
  finding: Pick<HostFinding, "port" | "serviceInfo" | "component">,
): string | undefined {
  return formatPortService({
    port: finding.port,
    serviceInfo: realText(finding.serviceInfo),
    fallback: finding.component?.label,
  });
}

/**
 * One VulnTable row (preset "host") from a server finding. The port/service
 * cell shows the compact "8080 · http"; the full label is its tooltip.
 */
export function findingToVulnRow(finding: HostFinding): VulnRow {
  const fullPortService = portServiceLabel(finding);
  const portService = fullPortService ? compactPortService(fullPortService) : undefined;
  return {
    id: finding.id,
    severity: finding.severity,
    cvss: finding.cvss,
    summary: finding.summary,
    ...(portService ? { portService } : {}),
    ...(fullPortService && fullPortService !== portService ? { portServiceDetail: fullPortService } : {}),
    sources: finding.sources,
    ...(finding.firstSeen ? { firstSeen: finding.firstSeen } : {}),
    ...(finding.lastSeen ? { lastSeen: finding.lastSeen } : {}),
  };
}

// ─── Risk caption (R05) ─────────────────────────────────────────────────────

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
}

export interface RiskCaption {
  text: string;
  /** The CVE that sets the score, for "Set by". */
  cve?: string;
}

/**
 * The line under the risk ring. The score is the server's (ADR-3); this
 * only says where it came from.
 */
export function riskCaption(host: {
  riskScore: number;
  riskCve?: string;
  openFindings: number;
  findings?: readonly Pick<HostFinding, "id" | "cvss">[];
}): RiskCaption {
  const n = host.openFindings;
  if (n <= 0) return { text: "No open findings" };
  const among = `among ${plural(n, "open finding")}`;
  if (!(host.riskScore > 0)) return { text: `No CVSS score ${among}` };
  const setter = host.riskCve ? host.findings?.find((f) => f.id === host.riskCve) : undefined;
  const text =
    setter && !(setter.cvss > 0)
      ? `Highest severity ${among}; no CVSS was reported`
      : `Highest CVSS ${among}`;
  return host.riskCve ? { text, cve: host.riskCve } : { text };
}

// ─── Data freshness (R05) ───────────────────────────────────────────────────

/** "quick" -> "Quick", "high-risk" -> "High risk". */
export function profileLabel(profile: string): string {
  const words = profile.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** "nmap 7.95 · Quick profile" for the last-scan line. */
export function lastScanDetail(scan: Pick<HostLastScan, "source" | "version" | "profile">): string {
  const source = [scan.source, scan.version].filter(Boolean).join(" ");
  return scan.profile ? `${source} · ${profileLabel(scan.profile)} profile` : source;
}

/** "nmap 7.95" for a source row. */
export function sourceName(source: Pick<SourceFreshness, "name" | "version">): string {
  return [source.name, source.version].filter(Boolean).join(" ");
}

// ─── Open ports with their services (Open ports card) ───────────────────────

/** A port's own service identification, as the scanner stores it. */
export type PortServiceMeta = Pick<OpenPort, "service" | "product" | "version" | "extraInfo">;

const sameText = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * One label from a port's service fields:
 *   http-proxy + Squid http proxy + 5.7     → "http-proxy (Squid http proxy 5.7)"
 *   rpcbind + rpcbind + 2-4                 → "rpcbind (2-4)"  (product repeats the name)
 *   ajp13 + Protocol v1.3 (extra info only) → "ajp13 (Protocol v1.3)"
 *   https                                   → "https"
 * Extra info is the detail only when there is no product or version, unless
 * `full` is set (the hover text), which appends it: "rpcbind (2-4, RPC #100000)".
 * With no service name, the product and version stand alone. undefined when
 * nothing real is recorded.
 */
export function formatPortServiceMeta(
  meta: PortServiceMeta,
  { full = false }: { full?: boolean } = {},
): string | undefined {
  const name = realText(meta.service);
  const rawProduct = realText(meta.product);
  const product = rawProduct && name && sameText(rawProduct, name) ? undefined : rawProduct;
  const version = realText(meta.version);
  const extra = realText(meta.extraInfo);
  const productVersion = [product, version].filter(Boolean).join(" ");
  const detail = productVersion
    ? full && extra
      ? `${productVersion}, ${extra}`
      : productVersion
    : extra;
  if (!name) return productVersion || undefined;
  return detail ? `${name} (${detail})` : name;
}

export type PortWithService<P extends OpenPort = OpenPort> = P & {
  /** "ssh (OpenSSH 10.0p2 Debian 7+deb13u4)", when a scan recorded one. */
  serviceLabel?: string;
  /** The full text for the hover, when it says more than the label. */
  serviceDetail?: string;
};

/**
 * Each open port with the service a scan recorded for it: the port's own
 * service metadata (service_name/product/version/extrainfo) first; only
 * when the port has none, the service the scanner's findings on that port
 * name (their structured `serviceInfo`; the most common one when they
 * differ). Nothing is parsed from free text.
 */
export function openPortServices<P extends OpenPort>(
  ports: readonly P[],
  findings: readonly Pick<HostFinding, "port" | "serviceInfo">[],
): PortWithService<P>[] {
  const byPort = new Map<number, Map<string, number>>();
  for (const f of findings) {
    const info = realText(f.serviceInfo);
    if (typeof f.port !== "number" || !info) continue;
    const counts = byPort.get(f.port) ?? new Map<string, number>();
    counts.set(info, (counts.get(info) ?? 0) + 1);
    byPort.set(f.port, counts);
  }
  return ports.map((p) => {
    const own = formatPortServiceMeta(p);
    if (own) {
      const full = formatPortServiceMeta(p, { full: true });
      return { ...p, serviceLabel: own, ...(full && full !== own ? { serviceDetail: full } : {}) };
    }
    let fromFindings: string | undefined;
    let best = 0;
    for (const [info, n] of byPort.get(p.port) ?? []) {
      if (n > best) {
        fromFindings = info;
        best = n;
      }
    }
    return fromFindings ? { ...p, serviceLabel: fromFindings } : { ...p };
  });
}

// ─── Software the scanner matched (Open ports card) ─────────────────────────

export interface MatchedSoftware {
  label: string;
  findings: number;
  /** The most severe level among those findings. */
  severity: Severity;
}

/**
 * Products named by the scanner's CPEs, with how many open findings each
 * carries, most findings first. Not every finding records a port, so this
 * is listed beside the ports rather than joined to them.
 */
export function matchedSoftware(
  findings: readonly Pick<HostFinding, "component" | "severity">[],
): MatchedSoftware[] {
  const byLabel = new Map<string, MatchedSoftware>();
  for (const f of findings) {
    const label = f.component?.label;
    if (!label) continue;
    const entry = byLabel.get(label);
    if (!entry) {
      byLabel.set(label, { label, findings: 1, severity: f.severity });
    } else {
      entry.findings += 1;
      if (severityRank(f.severity) > severityRank(entry.severity)) entry.severity = f.severity;
    }
  }
  return [...byLabel.values()].sort(
    (a, b) => b.findings - a.findings || a.label.localeCompare(b.label),
  );
}

// ─── Agent data (System card and tab) ───────────────────────────────────────

export interface AgentSnapshot {
  packages: number;
  users: number;
  services: { running: number; total: number };
  cpuCores?: number;
  memoryGb?: number;
  /** When the agent last collected data (ISO), when known. */
  collectedAt?: string;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

/**
 * What the agent has reported, from the packages and fingerprint
 * procedures; null when neither holds any agent data (a scan-only host).
 */
export function readAgentData(inventory: unknown, fingerprint: unknown): AgentSnapshot | null {
  const inv = asRecord(inventory);
  const fpResponse = asRecord(fingerprint);
  const fp = asRecord(fpResponse?.fingerprint);

  const rawPackages = inv?.packages;
  const packageList = Array.isArray(rawPackages) ? rawPackages : [];
  const packages = Math.max(num(inv?.total_count), num(inv?.package_count), packageList.length);
  const inventoryAt = text(inv?.collected_at);
  const fingerprintAt = text(fpResponse?.collected_at);
  const hasFingerprint = !!fp && Object.keys(fp).length > 0;

  if (packages === 0 && !inventoryAt && !hasFingerprint && !fingerprintAt) return null;

  const usersBlock = asRecord(fp?.users);
  const users = usersBlock?.users;
  const localUsers = usersBlock?.localUsers;
  const userList = Array.isArray(users) ? users : Array.isArray(localUsers) ? localUsers : [];
  const services = fp?.services;
  const serviceList: unknown[] = Array.isArray(services) ? services : [];
  const running = serviceList.filter((s) => {
    const status = text(asRecord(s)?.status)?.toLowerCase();
    return status === "running" || status === "active";
  }).length;
  const hardware = asRecord(fp?.hardware);
  const cpuCores = num(asRecord(hardware?.cpu)?.cores);
  const memoryGb = num(asRecord(hardware?.memory)?.total_gb);
  const collectedAt = [inventoryAt, fingerprintAt]
    .filter((t): t is string => !!t && Number.isFinite(Date.parse(t)))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];

  return {
    packages,
    users: userList.length,
    services: { running, total: serviceList.length },
    ...(cpuCores > 0 ? { cpuCores } : {}),
    ...(memoryGb > 0 ? { memoryGb } : {}),
    ...(collectedAt ? { collectedAt } : {}),
  };
}

export interface AgentInterface {
  name: string;
  mac?: string;
  ipv4: string[];
  ipv6: string[];
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.length > 0) : [];
}

/** Interfaces and DNS servers from the agent's fingerprint response. */
export function readAgentNetwork(fingerprint: unknown): {
  interfaces: AgentInterface[];
  dnsServers: string[];
} {
  const network = asRecord(asRecord(asRecord(fingerprint)?.fingerprint)?.network);
  const rawInterfaces = network?.interfaces;
  const interfaces: AgentInterface[] = (Array.isArray(rawInterfaces) ? rawInterfaces : [])
    .map(asRecord)
    .filter((i): i is Record<string, unknown> => !!i)
    .map((i) => {
      const mac = text(i.mac);
      return {
        name: text(i.name) ?? "—",
        ...(mac ? { mac } : {}),
        ipv4: strings(i.ipv4),
        ipv6: strings(i.ipv6),
      };
    });
  return { interfaces, dnsServers: strings(network?.dns_servers) };
}

// ─── Edit form ──────────────────────────────────────────────────────────────

/**
 * Host notes as the edit form's lines. The API sends notes as an array of
 * note records ({ Content }), a string, or nothing; the form joins lines.
 */
export function noteLines(notes: unknown): string[] | undefined {
  const list: unknown[] = Array.isArray(notes)
    ? notes
    : typeof notes === "string"
      ? notes.split(/\r?\n/)
      : [];
  const lines = list
    .map((n) => (typeof n === "string" ? n : text(asRecord(n)?.Content) ?? ""))
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : undefined;
}

// ─── CSV export (R06) ───────────────────────────────────────────────────────

/** One CSV field: quoted when needed; a leading formula character is escaped. */
export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const CSV_HEADERS = [
  "CVE",
  "Severity",
  "CVSS",
  "Summary",
  "Port / service",
  "Sources",
  "First seen",
  "Last seen",
] as const;

/**
 * The host's open findings as CSV, highest CVSS first, limited to the
 * selected levels when any are selected. Times stay ISO for other tools.
 */
export function hostFindingsCsv(
  findings: readonly HostFinding[],
  severities: readonly Severity[] = [],
): string {
  const rows = findings
    .filter((f) => severities.length === 0 || severities.includes(f.severity))
    .slice()
    .sort(
      (a, b) =>
        b.cvss - a.cvss || severityRank(b.severity) - severityRank(a.severity) || a.id.localeCompare(b.id),
    )
    .map((f) =>
      [
        f.id,
        SEVERITY_LABELS[f.severity],
        f.cvss > 0 ? f.cvss.toFixed(1) : "",
        f.summary,
        portServiceLabel(f) ?? "",
        f.sources.join(" "),
        f.firstSeen ?? "",
        f.lastSeen ?? "",
      ]
        .map(csvField)
        .join(","),
    );
  return [CSV_HEADERS.join(","), ...rows].join("\r\n") + "\r\n";
}

/** "192.0.2.12-high-vulnerabilities.csv" */
export function hostCsvFilename(ip: string, severities: readonly Severity[] = []): string {
  const safeIp = ip.replace(/[^0-9A-Za-z.:-]/g, "_").replace(/:/g, "-");
  const levels = SEVERITIES.filter((s) => severities.includes(s));
  return `${safeIp}${levels.length ? `-${levels.join("-")}` : ""}-vulnerabilities.csv`;
}

// ─── History timeline ───────────────────────────────────────────────────────

export interface HistoryEntry {
  /** Stable key (the journal entry id). */
  key: string;
  /** ISO time; null when the journal doesn't record a real time. */
  time: string | null;
  label: string;
  source?: string;
  details?: string;
  /**
   * An accepted report: how many items it submitted (null when unknown) and
   * the source version. Assessment coverage is always unknown: an empty
   * submission doesn't mean the host was assessed clean.
   */
  report?: { submittedItems: number | null; sourceVersion?: string };
}

/** One entry of GET /host/{ip}/history?view=accepted_reports. */
export interface AcceptedHistoryEvent {
  id: string;
  event_type: "host_discovery" | "report_accepted";
  timestamp: string | null;
  source: string;
  details: string;
  report?: {
    submitted_item_count: number | null;
    source_version: string;
    assessment_coverage: "unknown";
  };
}

const EVENT_LABELS: Record<string, string> = {
  host_discovery: "Host discovered",
  host_created: "Host added",
  host_updated: "Host updated",
  scan_completed: "Scan completed",
  vulnerability_found: "Vulnerability found",
  port_discovered: "Port discovered",
  software_installed: "Software installed",
  configuration_change: "Configuration changed",
};

/** "host_discovery" -> "Host discovered"; unknown types in sentence case. */
export function eventLabel(type: string): string {
  const known = EVENT_LABELS[type];
  if (known) return known;
  const words = type.replace(/[_-]+/g, " ").trim().toLowerCase();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Event";
}

/**
 * The History tab's timeline: the accepted reports in the journal's order
 * (newest first, page by page), then the host's discovery. Entries without a
 * real time keep their place and read "Time unknown".
 */
export function historyTimeline(events: readonly AcceptedHistoryEvent[]): HistoryEntry[] {
  const realTime = (iso: string | null): string | null => {
    if (!iso) return null;
    const t = Date.parse(iso);
    return Number.isFinite(t) && new Date(t).getUTCFullYear() >= 1971 ? iso : null;
  };
  const entry = (e: AcceptedHistoryEvent): HistoryEntry => ({
    key: e.id,
    time: realTime(e.timestamp),
    label: e.event_type === "report_accepted" ? "Report accepted" : eventLabel(e.event_type),
    ...(realText(e.source) ? { source: e.source } : {}),
    ...(e.event_type === "host_discovery" && realText(e.details) ? { details: e.details } : {}),
    ...(e.report
      ? {
          report: {
            submittedItems: e.report.submitted_item_count,
            ...(realText(e.report.source_version) ? { sourceVersion: e.report.source_version } : {}),
          },
        }
      : {}),
  });
  const reports = events.filter((e) => e.event_type === "report_accepted").map(entry);
  const discovery = events.find((e) => e.event_type === "host_discovery");
  return discovery ? [...reports, entry(discovery)] : reports;
}

/** "Submitted 1,234 items", "Submitted 1 item", "Submitted items unknown". */
export function submittedItemsLabel(count: number | null): string {
  if (count === null) return "Submitted items unknown";
  return `Submitted ${count.toLocaleString("en-US")} ${count === 1 ? "item" : "items"}`;
}

/** "104 items", "1 item", "items unknown" (a report's pill). */
export function itemsLabel(count: number | null): string {
  if (count === null) return "items unknown";
  return `${count.toLocaleString("en-US")} ${count === 1 ? "item" : "items"}`;
}

/** One scan run: accepted reports a few minutes apart, newest first. */
export interface HistoryRun {
  key: string;
  /** The newest report's time; null when none records a real time. */
  time: string | null;
  reports: HistoryEntry[];
}

/** Reports this close together belong to the same scan run. */
export const HISTORY_RUN_WINDOW_MS = 2 * 60 * 1000;

/**
 * Groups the timeline's accepted reports into scan runs: a report joins the
 * run before it when it is within `windowMs` of that run's last report
 * (nmap, naabu and ping++ report one run seconds apart). Reports with no
 * real time stay on their own. Other events (the discovery) are returned
 * apart, in order.
 */
export function historyRuns(
  timeline: readonly HistoryEntry[],
  windowMs: number = HISTORY_RUN_WINDOW_MS,
): { runs: HistoryRun[]; events: HistoryEntry[] } {
  const runs: HistoryRun[] = [];
  const events: HistoryEntry[] = [];
  let lastTime: number | null = null;
  for (const entry of timeline) {
    if (!entry.report) {
      events.push(entry);
      continue;
    }
    const t = entry.time ? Date.parse(entry.time) : NaN;
    const current = runs[runs.length - 1];
    if (current && Number.isFinite(t) && lastTime !== null && Math.abs(lastTime - t) <= windowMs) {
      current.reports.push(entry);
      lastTime = t;
      continue;
    }
    runs.push({ key: entry.key, time: Number.isFinite(t) ? entry.time : null, reports: [entry] });
    lastTime = Number.isFinite(t) ? t : null;
  }
  return { runs, events };
}

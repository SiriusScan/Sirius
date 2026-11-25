import assert from "node:assert/strict";
import type { HostFinding } from "~/server/api/routers/host";
import {
  csvField,
  eventLabel,
  historyRuns,
  historyTimeline,
  itemsLabel,
  submittedItemsLabel,
  findingToVulnRow,
  hostCsvFilename,
  hostFindingsCsv,
  hostSeverityHref,
  hostTabHref,
  hostTabs,
  lastScanDetail,
  matchedSoftware,
  noteLines,
  osLabel,
  plural,
  portServiceLabel,
  readAgentData,
  readAgentNetwork,
  realText,
  rescanHref,
  riskCaption,
  sourceName,
} from "./hostModel";

const APACHE = {
  cpe: "cpe:/a:apache:http_server:2.4.49",
  part: "a" as const,
  vendor: "apache",
  product: "http_server",
  version: "2.4.49",
  label: "apache http_server 2.4.49",
};
const OPENSSH = {
  cpe: "cpe:/a:openbsd:openssh:10.0p2",
  part: "a" as const,
  vendor: "openbsd",
  product: "openssh",
  version: "10.0p2",
  label: "openbsd openssh 10.0p2",
};

function finding(partial: Partial<HostFinding> & Pick<HostFinding, "id">): HostFinding {
  return {
    cvss: 0,
    severity: "info",
    summary: "",
    evidence: "",
    summarySource: "none",
    sources: ["nmap"],
    confidence: 1,
    ...partial,
  };
}

// ── Tabs and links ──────────────────────────────────────────────────────────
assert.deepEqual(hostTabs({ findings: 162, ports: 3 }), [
  { id: "overview", label: "Overview" },
  { id: "vulnerabilities", label: "Vulnerabilities", count: 162 },
  { id: "system", label: "System" },
  { id: "network", label: "Network", count: 3 },
  { id: "history", label: "History" },
]);
assert.equal(hostTabs({ findings: 0, ports: 0 })[1]?.count, undefined, "no chip for zero");
assert.equal(hostTabHref("192.0.2.12"), "/host/192.0.2.12");
assert.equal(hostTabHref("192.0.2.12", "overview"), "/host/192.0.2.12");
assert.equal(hostTabHref("192.0.2.12", "vulnerabilities"), "/host/192.0.2.12?tab=vulnerabilities");
assert.equal(hostSeverityHref("192.0.2.12", "high"), "/host/192.0.2.12?tab=vulnerabilities&severity=high");
assert.equal(rescanHref("192.0.2.12"), "/scanner?target=192.0.2.12");

// ── Header labels ───────────────────────────────────────────────────────────
assert.equal(realText("Unknown"), undefined);
assert.equal(realText("  "), undefined);
assert.equal(realText(null), undefined);
assert.equal(realText("web-01.example"), "web-01.example");
// Values captured from a live lab host.
assert.equal(osLabel("linux", "TTL:64 (low confidence)"), "Linux · TTL 64, low confidence");
assert.equal(osLabel("Ubuntu", "22.04"), "Ubuntu 22.04");
assert.equal(osLabel("windows", ""), "Windows");
assert.equal(osLabel("macos", undefined), "macOS");
assert.equal(osLabel("", ""), undefined);
assert.equal(osLabel("Unknown", "Unknown"), undefined);
assert.equal(osLabel("", "TTL:128 (low confidence)"), "TTL 128, low confidence");

// ── Rows ────────────────────────────────────────────────────────────────────
assert.equal(portServiceLabel({ component: APACHE }), "apache http_server 2.4.49");
assert.equal(portServiceLabel({ port: 22, component: OPENSSH }), "22 · openbsd openssh 10.0p2");
assert.equal(portServiceLabel({ port: 80, serviceInfo: "Apache httpd 2.4.49", component: APACHE }), "80 · Apache httpd 2.4.49");
assert.equal(portServiceLabel({ port: 0 }), undefined);
assert.equal(portServiceLabel({}), undefined);

assert.deepEqual(
  findingToVulnRow(
    finding({
      id: "CVE-2021-41773",
      cvss: 7.5,
      severity: "high",
      summary: "Affects apache http_server 2.4.49",
      component: APACHE,
      firstSeen: "2026-11-21T20:17:46.371Z",
      lastSeen: "2026-11-21T20:47:58.166Z",
    }),
  ),
  {
    id: "CVE-2021-41773",
    severity: "high",
    cvss: 7.5,
    summary: "Affects apache http_server 2.4.49",
    portService: "apache http_server 2.4.49",
    sources: ["nmap"],
    firstSeen: "2026-11-21T20:17:46.371Z",
    lastSeen: "2026-11-21T20:47:58.166Z",
  },
);
const bare = findingToVulnRow(finding({ id: "CVE-1" }));
assert.equal("portService" in bare, false);
assert.equal("firstSeen" in bare, false);

// ── Risk caption ────────────────────────────────────────────────────────────
assert.equal(plural(1, "open finding"), "1 open finding");
assert.equal(plural(1162, "open finding"), "1,162 open findings");
assert.deepEqual(riskCaption({ riskScore: 0, openFindings: 0 }), { text: "No open findings" });
assert.deepEqual(riskCaption({ riskScore: 0, openFindings: 4 }), { text: "No CVSS score among 4 open findings" });
assert.deepEqual(
  riskCaption({
    riskScore: 9.8,
    riskCve: "CVE-2022-23943",
    openFindings: 162,
    findings: [{ id: "CVE-2022-23943", cvss: 9.8 }],
  }),
  { text: "Highest CVSS among 162 open findings", cve: "CVE-2022-23943" },
);
assert.deepEqual(
  riskCaption({
    riskScore: 7,
    riskCve: "CVE-9",
    openFindings: 1,
    findings: [{ id: "CVE-9", cvss: 0 }],
  }),
  { text: "Highest severity among 1 open finding; no CVSS was reported", cve: "CVE-9" },
);

// ── Freshness ───────────────────────────────────────────────────────────────
assert.equal(lastScanDetail({ source: "nmap" }), "nmap");
assert.equal(lastScanDetail({ source: "nmap", version: "7.95", profile: "quick" }), "nmap 7.95 · Quick profile");
assert.equal(lastScanDetail({ source: "nmap", profile: "high-risk" }), "nmap · High risk profile");
assert.equal(sourceName({ name: "naabu" }), "naabu");
assert.equal(sourceName({ name: "nmap", version: "7.95" }), "nmap 7.95");

// ── Matched software ────────────────────────────────────────────────────────
assert.deepEqual(
  matchedSoftware([
    { component: APACHE, severity: "medium" },
    { component: OPENSSH, severity: "medium" },
    { component: APACHE, severity: "critical" },
    { severity: "high" },
  ]),
  [
    { label: "apache http_server 2.4.49", findings: 2, severity: "critical" },
    { label: "openbsd openssh 10.0p2", findings: 1, severity: "medium" },
  ],
);
assert.deepEqual(matchedSoftware([]), []);

// ── Agent data ──────────────────────────────────────────────────────────────
// What the API returns for a scan-only host (empty JSONB columns).
assert.equal(
  readAgentData(
    { host_ip: "192.0.2.12", packages: [], package_count: 0, total_count: 0, collected_at: "", source: "" },
    { host_ip: "192.0.2.12", fingerprint: {}, collected_at: "", source: "", platform: "" },
  ),
  null,
);
assert.equal(readAgentData(null, null), null);
assert.equal(readAgentData(undefined, { fingerprint: null }), null);
assert.deepEqual(
  readAgentData(
    { packages: [{ name: "a" }, { name: "b" }], package_count: 2, total_count: 812, collected_at: "2026-11-20T10:00:00Z" },
    {
      fingerprint: {
        users: { users: [{ username: "root" }, { username: "agi" }] },
        services: [{ status: "running" }, { status: "Active" }, { status: "stopped" }],
        hardware: { cpu: { cores: 8 }, memory: { total_gb: 31.2 } },
      },
      collected_at: "2026-11-21T10:00:00Z",
    },
  ),
  {
    packages: 812,
    users: 2,
    services: { running: 2, total: 3 },
    cpuCores: 8,
    memoryGb: 31.2,
    collectedAt: "2026-11-21T10:00:00Z",
  },
);

assert.deepEqual(readAgentNetwork(null), { interfaces: [], dnsServers: [] });
assert.deepEqual(readAgentNetwork({ fingerprint: {} }), { interfaces: [], dnsServers: [] });
assert.deepEqual(
  readAgentNetwork({
    fingerprint: {
      network: {
        interfaces: [{ name: "eth0", mac: "aa:bb", ipv4: ["192.0.2.12"], ipv6: [] }, null, { ipv4: "x" }],
        dns_servers: ["1.1.1.1", 3],
      },
    },
  }),
  {
    interfaces: [
      { name: "eth0", mac: "aa:bb", ipv4: ["192.0.2.12"], ipv6: [] },
      { name: "—", ipv4: [], ipv6: [] },
    ],
    dnsServers: ["1.1.1.1"],
  },
);

// ── Edit form notes ─────────────────────────────────────────────────────────
assert.equal(noteLines(null), undefined);
assert.equal(noteLines(""), undefined);
assert.deepEqual(noteLines("one\ntwo\n"), ["one", "two"]);
assert.deepEqual(noteLines([{ ID: 1, Content: "rack 4" }, { Content: " " }, "loose"]), ["rack 4", "loose"]);

// ── CSV ─────────────────────────────────────────────────────────────────────
assert.equal(csvField("plain"), "plain");
assert.equal(csvField('say "hi", ok'), '"say ""hi"", ok"');
assert.equal(csvField("=cmd()"), "'=cmd()");
assert.equal(csvField(undefined), "");
const findings = [
  finding({ id: "CVE-B", cvss: 5, severity: "medium", summary: "Medium one", component: OPENSSH, firstSeen: "2026-11-21T20:17:46.371Z" }),
  finding({ id: "CVE-A", cvss: 9.8, severity: "critical", summary: "Critical, quoted", component: APACHE, sources: ["nmap", "naabu"] }),
  finding({ id: "CVE-C", cvss: 0, severity: "info", summary: "" }),
];
assert.equal(
  hostFindingsCsv(findings),
  [
    "CVE,Severity,CVSS,Summary,Port / service,Sources,First seen,Last seen",
    'CVE-A,Critical,9.8,"Critical, quoted",apache http_server 2.4.49,nmap naabu,,',
    "CVE-B,Medium,5.0,Medium one,openbsd openssh 10.0p2,nmap,2026-11-21T20:17:46.371Z,",
    "CVE-C,Info,,,,nmap,,",
    "",
  ].join("\r\n"),
);
assert.equal(hostFindingsCsv(findings, ["medium"]).split("\r\n").length, 3, "header, one row, trailing newline");
assert.equal(hostCsvFilename("192.0.2.12"), "192.0.2.12-vulnerabilities.csv");
assert.equal(hostCsvFilename("192.0.2.12", ["high", "critical"]), "192.0.2.12-critical-high-vulnerabilities.csv");

// ── History ─────────────────────────────────────────────────────────────────
assert.equal(eventLabel("host_discovery"), "Host discovered");
assert.equal(eventLabel("AGENT_CHECK_IN"), "Agent check in");
assert.equal(eventLabel(""), "Event");
assert.deepEqual(
  historyTimeline([
    {
      id: "r2",
      event_type: "report_accepted",
      timestamp: "2026-11-21T20:47:58.166Z",
      source: "nmap",
      details: "Report accepted",
      report: { submitted_item_count: 0, source_version: "7.95", assessment_coverage: "unknown" },
    },
    {
      id: "d1",
      event_type: "host_discovery",
      timestamp: "2026-11-21T20:17:04.334Z",
      source: "initial",
      details: "Host first discovered",
    },
    {
      id: "r1",
      event_type: "report_accepted",
      timestamp: "0001-01-01T00:00:00Z",
      source: "naabu",
      details: "",
      report: { submitted_item_count: null, source_version: "", assessment_coverage: "unknown" },
    },
  ]),
  [
    // An empty submission stays a count of 0, never "assessed clean".
    { key: "r2", time: "2026-11-21T20:47:58.166Z", label: "Report accepted", source: "nmap", report: { submittedItems: 0, sourceVersion: "7.95" } },
    { key: "r1", time: null, label: "Report accepted", source: "naabu", report: { submittedItems: null } },
    { key: "d1", time: "2026-11-21T20:17:04.334Z", label: "Host discovered", source: "initial", details: "Host first discovered" },
  ],
);
assert.deepEqual(historyTimeline([]), []);
assert.equal(submittedItemsLabel(0), "Submitted 0 items");
assert.equal(submittedItemsLabel(1), "Submitted 1 item");
assert.equal(submittedItemsLabel(1234), "Submitted 1,234 items");
assert.equal(submittedItemsLabel(null), "Submitted items unknown");

// Scan runs: reports within two minutes of each other are one run.
{
  const report = (key: string, time: string | null, source: string, items: number | null) => ({
    key,
    time,
    label: "Report accepted",
    source,
    report: { submittedItems: items },
  });
  const discovery = { key: "d1", time: "2026-11-20T09:00:00Z", label: "Host discovered", source: "initial" };
  const { runs, events } = historyRuns([
    report("a", "2026-11-21T20:48:30Z", "ping++", 0),
    report("b", "2026-11-21T20:47:58Z", "naabu", 2),
    report("c", "2026-11-21T20:46:40Z", "nmap", 104),
    report("d", "2026-11-21T18:00:00Z", "nmap", 98),
    report("e", null, "naabu", null),
    discovery,
  ]);
  assert.deepEqual(
    runs.map((r) => [r.key, r.time, r.reports.map((x) => x.key)]),
    [
      ["a", "2026-11-21T20:48:30Z", ["a", "b", "c"]],
      ["d", "2026-11-21T18:00:00Z", ["d"]],
      ["e", null, ["e"]],
    ],
  );
  assert.deepEqual(events, [discovery]);
  assert.deepEqual(historyRuns([]), { runs: [], events: [] });
}
assert.equal(itemsLabel(104), "104 items");
assert.equal(itemsLabel(1), "1 item");
assert.equal(itemsLabel(null), "items unknown");

console.log("hostModel: all cases pass");

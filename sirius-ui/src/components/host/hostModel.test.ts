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
  formatPortServiceMeta,
  hostCsvFilename,
  hostFindingsCsv,
  hostSeverityHref,
  hostTabHref,
  hostTabs,
  lastScanDetail,
  noteLines,
  openPortServices,
  osLabel,
  plural,
  portServiceLabel,
  readAgentData,
  readAgentNetwork,
  realText,
  rescanHref,
  riskCaption,
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
// The port/service cell is compact; the full label is its tooltip.
const tomcat = findingToVulnRow(
  finding({ id: "CVE-2020-1938", port: 8080, serviceInfo: "http (Apache Tomcat 8.5.19)" }),
);
assert.equal(tomcat.portService, "8080 · http");
assert.equal(tomcat.portServiceDetail, "8080 · http (Apache Tomcat 8.5.19)");
const plainService = findingToVulnRow(finding({ id: "CVE-2", port: 80, serviceInfo: "Apache httpd 2.4.49" }));
assert.equal(plainService.portService, "80 · Apache httpd 2.4.49");
assert.equal("portServiceDetail" in plainService, false);
const bare = findingToVulnRow(finding({ id: "CVE-1" }));
assert.equal("portService" in bare, false);
assert.equal("firstSeen" in bare, false);

// ── Risk caption ────────────────────────────────────────────────────────────
assert.equal(plural(1, "open finding"), "1 open finding");
assert.equal(plural(1162, "open finding"), "1,162 open findings");
assert.equal(riskCaption({ riskScore: 0, openFindings: 0 }), "No open findings");
assert.equal(riskCaption({ riskScore: 0, openFindings: 4 }), "No CVSS score among 4 open findings");
assert.equal(
  riskCaption({
    riskScore: 9.8,
    riskCve: "CVE-2022-23943",
    openFindings: 162,
    findings: [{ id: "CVE-2022-23943", cvss: 9.8 }],
  }),
  "Highest CVSS among 162 open findings",
);
assert.equal(
  riskCaption({
    riskScore: 7,
    riskCve: "CVE-9",
    openFindings: 1,
    findings: [{ id: "CVE-9", cvss: 0 }],
  }),
  "Highest severity among 1 open finding; no CVSS was reported",
);

// ── Last scan ───────────────────────────────────────────────────────────────
assert.equal(lastScanDetail({ source: "nmap" }), "nmap");
assert.equal(lastScanDetail({ source: "nmap", version: "7.95", profile: "quick" }), "nmap 7.95 · Quick profile");
assert.equal(lastScanDetail({ source: "nmap", profile: "high-risk" }), "nmap · High risk profile");

// ── Open ports with their services ──────────────────────────────────────────
// Values captured from a live lab host (cogitator04).
assert.deepEqual(
  openPortServices(
    [
      { port: 22, protocol: "tcp", sources: ["naabu", "nmap"] },
      { port: 8009, protocol: "tcp", service: "ajp13", version: "Apache Jserv" },
      { port: 8080, protocol: "tcp" },
      { port: 9999, protocol: "udp" },
    ],
    [
      finding({ id: "CVE-A", port: 22, serviceInfo: "ssh (OpenSSH 10.0p2 Debian 7+deb13u4)" }),
      finding({ id: "CVE-B", port: 8080, serviceInfo: "http (Apache Tomcat 8.5.19)" }),
      finding({ id: "CVE-C", port: 8080, serviceInfo: "http (Apache Tomcat 8.5.19)" }),
      finding({ id: "CVE-D", port: 8080, serviceInfo: "http" }),
      finding({ id: "CVE-E", port: 8009, serviceInfo: "something else" }),
      finding({ id: "CVE-F", port: 9999, serviceInfo: "Unknown" }),
      finding({ id: "CVE-G", serviceInfo: "no port" }),
    ],
  ),
  [
    { port: 22, protocol: "tcp", sources: ["naabu", "nmap"], serviceLabel: "ssh (OpenSSH 10.0p2 Debian 7+deb13u4)" },
    { port: 8009, protocol: "tcp", service: "ajp13", version: "Apache Jserv", serviceLabel: "ajp13 (Apache Jserv)" },
    { port: 8080, protocol: "tcp", serviceLabel: "http (Apache Tomcat 8.5.19)" },
    { port: 9999, protocol: "udp" },
  ],
);
assert.deepEqual(openPortServices([], [finding({ id: "CVE-A", port: 22, serviceInfo: "ssh" })]), []);

// ── Port-level service metadata (host_ports service_* columns) ──────────────
// Values from the cogitator02 lab: ports with and without CVE findings.
assert.equal(
  formatPortServiceMeta({ service: "http-proxy", product: "Squid http proxy", version: "5.7" }),
  "http-proxy (Squid http proxy 5.7)",
);
// A product that repeats the name is not said twice.
assert.equal(
  formatPortServiceMeta({ service: "rpcbind", product: "rpcbind", version: "2-4", extraInfo: "RPC #100000" }),
  "rpcbind (2-4)",
);
assert.equal(
  formatPortServiceMeta(
    { service: "rpcbind", product: "RPCBind", version: "2-4", extraInfo: "RPC #100000" },
    { full: true },
  ),
  "rpcbind (2-4, RPC #100000)",
);
assert.equal(formatPortServiceMeta({ service: "rpcbind", product: "rpcbind" }), "rpcbind");
assert.equal(formatPortServiceMeta({ service: "ajp13", extraInfo: "Protocol v1.3" }), "ajp13 (Protocol v1.3)");
assert.equal(formatPortServiceMeta({ service: "rpcbind", version: "2-4" }), "rpcbind (2-4)");
assert.equal(formatPortServiceMeta({ service: "https" }), "https");
assert.equal(
  formatPortServiceMeta({ service: "https", product: "Proxmox Virtual Environment" }),
  "https (Proxmox Virtual Environment)",
);
assert.equal(
  formatPortServiceMeta({ service: "ssh", product: "OpenSSH", version: "10.0p2 Debian 7+deb13u4", extraInfo: "protocol 2.0" }),
  "ssh (OpenSSH 10.0p2 Debian 7+deb13u4)",
);
assert.equal(formatPortServiceMeta({ product: "Apache Tomcat", version: "8.5.19" }), "Apache Tomcat 8.5.19");
assert.equal(formatPortServiceMeta({ service: " ", product: "", version: undefined }), undefined);
assert.equal(formatPortServiceMeta({ service: "unknown" }), undefined);
assert.equal(formatPortServiceMeta({ extraInfo: "Protocol v1.3" }), undefined);

// Port-level metadata wins; finding serviceInfo is only the fallback.
assert.deepEqual(
  openPortServices(
    [
      { port: 22, protocol: "tcp", service: "ssh", product: "OpenSSH", version: "10.0p2 Debian 7+deb13u4" },
      { port: 111, protocol: "tcp", service: "rpcbind", product: "rpcbind", version: "2-4", extraInfo: "RPC #100000" },
      { port: 3128, protocol: "tcp", service: "http-proxy", product: "Squid http proxy", version: "5.7" },
      { port: 8009, protocol: "tcp", service: "ajp13", product: "Apache Jserv", extraInfo: "Protocol v1.3" },
      { port: 8080, protocol: "tcp" },
      { port: 9000, protocol: "tcp" },
    ],
    [
      finding({ id: "CVE-A", port: 22, serviceInfo: "ssh (finding text)" }),
      finding({ id: "CVE-B", port: 8080, serviceInfo: "http (Apache Tomcat 8.5.19)" }),
    ],
  ).map(({ port, serviceLabel, serviceDetail }) => ({ port, serviceLabel, serviceDetail })),
  [
    { port: 22, serviceLabel: "ssh (OpenSSH 10.0p2 Debian 7+deb13u4)", serviceDetail: undefined },
    { port: 111, serviceLabel: "rpcbind (2-4)", serviceDetail: "rpcbind (2-4, RPC #100000)" },
    { port: 3128, serviceLabel: "http-proxy (Squid http proxy 5.7)", serviceDetail: undefined },
    { port: 8009, serviceLabel: "ajp13 (Apache Jserv)", serviceDetail: "ajp13 (Apache Jserv, Protocol v1.3)" },
    { port: 8080, serviceLabel: "http (Apache Tomcat 8.5.19)", serviceDetail: undefined },
    { port: 9000, serviceLabel: undefined, serviceDetail: undefined },
  ],
);

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

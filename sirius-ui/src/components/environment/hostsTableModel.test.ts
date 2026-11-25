import assert from "node:assert/strict";
import {
  DEFAULT_HOST_SORT,
  EMPTY_INVENTORY_MARKER,
  OS_UNKNOWN,
  advanceMarker,
  compareIp,
  csvField,
  displayHostname,
  displayOs,
  filterHosts,
  findingsLabel,
  hostsCsv,
  hostsCsvFilename,
  hostsFooterLabel,
  initialMarker,
  latestFirstSeen,
  newHostsBannerText,
  newHostsSince,
  nextHostSort,
  osOptions,
  portLabel,
  portsTitle,
  sortHosts,
  sourceOptions,
  scanTimeForNewHosts,
  type HostRow,
} from "./hostsTableModel";

// Shapes as host.getEnvironmentSummary returns them on a live lab deployment.
const web01: HostRow = {
  ip: "192.0.2.12",
  hostname: "web-01.example",
  os: "linux",
  riskScore: 9.8,
  counts: { critical: 27, high: 45, medium: 28, low: 11, info: 51 },
  openFindings: 162,
  openPorts: [
    { port: 22, protocol: "tcp" },
    { port: 80, protocol: "tcp" },
    { port: 8080, protocol: "tcp" },
  ],
  sources: ["nmap", "naabu"],
  firstSeen: "2026-11-21T20:17:04.334Z",
  lastScan: { time: "2026-11-21T20:47:58.166Z", source: "nmap" },
};
const app01host: HostRow = {
  ip: "192.0.2.13",
  hostname: "Unknown",
  os: "Unknown",
  riskScore: 9.8,
  counts: { critical: 20, high: 30, medium: 30, low: 8, info: 10 },
  openFindings: 98,
  openPorts: [
    { port: 22, protocol: "tcp" },
    { port: 53, protocol: "udp" },
  ],
  sources: ["nmap"],
  firstSeen: "2026-11-21T21:35:28.959Z",
  lastScan: { time: "2026-11-21T21:37:37.488Z", source: "nmap" },
};
const db01: HostRow = {
  ip: "192.0.2.4",
  hostname: "db-01.example",
  os: "",
  riskScore: 7.5,
  counts: { critical: 0, high: 3, medium: 155, low: 4, info: 0 },
  openFindings: 162,
  openPorts: [],
  sources: ["naabu"],
  firstSeen: "2026-11-21T21:40:11.744Z",
  lastScan: { time: "2026-11-21T21:42:20.384Z", source: "naabu" },
};
const manual: HostRow = {
  ip: "10.0.0.2",
  hostname: "",
  os: "Windows",
  riskScore: 0,
  counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
  openFindings: 0,
  openPorts: [],
  sources: [],
  firstSeen: "2026-11-21T22:00:00.000Z",
  lastScan: null,
};
const rows = [manual, db01, app01host, web01];

// Placeholders read as absent.
assert.equal(displayHostname(app01host), undefined);
assert.equal(displayOs(app01host), undefined);
assert.equal(displayOs(db01), undefined);
assert.equal(displayHostname(web01), "web-01.example");

// Ports.
assert.equal(portLabel({ port: 22, protocol: "tcp" }), "22");
assert.equal(portLabel({ port: 53, protocol: "UDP" }), "53/udp");
assert.equal(portsTitle(app01host.openPorts), "22/tcp, 53/udp");

// Findings label: critical wins, else high, else just open.
assert.deepEqual(findingsLabel(db01), {
  open: "162 open",
  top: { severity: "high", count: 3, text: "3 high" },
});
assert.equal(findingsLabel(web01).top?.text, "27 critical");
assert.deepEqual(findingsLabel(manual), { open: "No open findings" });
assert.deepEqual(findingsLabel({ openFindings: 1200, counts: { critical: 0, high: 0, medium: 0, low: 1200, info: 0 } }), {
  open: "1,200 open",
});

// Search by hostname, IP or OS; placeholders don't match "unknown".
assert.deepEqual(filterHosts(rows, { search: "-01." }).map((r) => r.ip), [db01.ip, web01.ip]);
assert.deepEqual(filterHosts(rows, { search: "2.13" }).map((r) => r.ip), [app01host.ip]);
assert.deepEqual(filterHosts(rows, { search: "WIN" }).map((r) => r.ip), [manual.ip]);
assert.deepEqual(filterHosts(rows, { search: "unknown" }), []);
assert.equal(filterHosts(rows, { search: "  " }).length, 4);

// Severity: hosts with any open finding at a selected level.
assert.deepEqual(filterHosts(rows, { severities: ["critical"] }).map((r) => r.ip), [app01host.ip, web01.ip]);
assert.deepEqual(
  filterHosts(rows, { severities: ["critical", "high"] }).map((r) => r.ip),
  [db01.ip, app01host.ip, web01.ip],
);
assert.deepEqual(filterHosts(rows, { severities: ["info"] }).map((r) => r.ip), [app01host.ip, web01.ip]);

// OS and source filters.
assert.deepEqual(filterHosts(rows, { os: [OS_UNKNOWN] }).map((r) => r.ip), [db01.ip, app01host.ip]);
assert.deepEqual(filterHosts(rows, { os: ["linux", "Windows"] }).map((r) => r.ip), [manual.ip, web01.ip]);
assert.deepEqual(filterHosts(rows, { sources: ["naabu"] }).map((r) => r.ip), [db01.ip, web01.ip]);
assert.deepEqual(filterHosts(rows, { onlyIps: new Set([app01host.ip]) }).map((r) => r.ip), [app01host.ip]);
assert.deepEqual(
  filterHosts(rows, { onlyIps: new Set([app01host.ip, web01.ip]), severities: ["high"], search: "web-01" }).map((r) => r.ip),
  [web01.ip],
);

// Options: most hosts first, "Not identified" last.
assert.deepEqual(osOptions(rows), [
  { value: "linux", label: "linux", count: 1 },
  { value: "Windows", label: "Windows", count: 1 },
  { value: OS_UNKNOWN, label: "Not identified", count: 2 },
]);
assert.deepEqual(sourceOptions(rows), [
  { value: "naabu", label: "naabu", count: 2 },
  { value: "nmap", label: "nmap", count: 2 },
]);

// Default sort: server risk score desc, ties by critical then high, then IP.
assert.deepEqual(sortHosts(rows).map((r) => r.ip), [web01.ip, app01host.ip, db01.ip, manual.ip]);
assert.deepEqual(
  sortHosts(rows, { key: "risk", dir: "asc" }).map((r) => r.ip),
  [manual.ip, db01.ip, web01.ip, app01host.ip],
);
assert.deepEqual(
  sortHosts(rows, { key: "lastScan", dir: "desc" }).map((r) => r.ip),
  [db01.ip, app01host.ip, web01.ip, manual.ip], // never scanned goes last
);
assert.deepEqual(
  sortHosts(rows, { key: "lastScan", dir: "asc" }).map((r) => r.ip),
  [web01.ip, app01host.ip, db01.ip, manual.ip],
);
assert.deepEqual(sortHosts(rows, { key: "ports", dir: "desc" }).map((r) => r.ip), [web01.ip, app01host.ip, db01.ip, manual.ip]);
assert.deepEqual(sortHosts(rows, { key: "findings", dir: "desc" }).map((r) => r.ip), [web01.ip, db01.ip, app01host.ip, manual.ip]);
assert.notEqual(sortHosts(rows), rows, "sorts a copy");
assert.ok(compareIp("10.0.0.2", "10.0.0.10") < 0);
assert.ok(compareIp("192.0.2.4", "192.0.2.12") < 0);

assert.deepEqual(nextHostSort(DEFAULT_HOST_SORT, "risk"), { key: "risk", dir: "asc" });
assert.deepEqual(nextHostSort(DEFAULT_HOST_SORT, "lastScan"), { key: "lastScan", dir: "desc" });

assert.equal(hostsFooterLabel(1, DEFAULT_HOST_SORT), "1 host · sorted by risk score");
assert.equal(hostsFooterLabel(3, DEFAULT_HOST_SORT, 3), "3 hosts · sorted by risk score");
assert.equal(hostsFooterLabel(2, { key: "lastScan", dir: "asc" }, 40), "2 hosts of 40 · sorted by last scan, oldest first");
assert.equal(hostsFooterLabel(0, { key: "findings", dir: "asc" }), "0 hosts · sorted by open findings, lowest first");

// CSV: quoting, formula guard, placeholders dropped, ISO times kept.
assert.equal(csvField("a,b"), '"a,b"');
assert.equal(csvField('say "hi"'), '"say ""hi"""');
assert.equal(csvField("=HYPERLINK(1)"), "'=HYPERLINK(1)");
assert.equal(csvField("-1"), "'-1");
assert.equal(csvField(null), "");
assert.equal(csvField(0), "0");
const csv = hostsCsv([web01, app01host]).split("\r\n");
assert.equal(
  csv[0],
  "Hostname,IP,OS,Risk score,Open findings,Critical,High,Medium,Low,Info,Open ports,Last scan,Last scan source,Sources,First seen",
);
assert.equal(
  csv[1],
  'web-01.example,192.0.2.12,linux,9.8,162,27,45,28,11,51,"22/tcp, 80/tcp, 8080/tcp",2026-11-21T20:47:58.166Z,nmap,nmap naabu,2026-11-21T20:17:04.334Z',
);
assert.equal(csv[2], ',192.0.2.13,,9.8,98,20,30,30,8,10,"22/tcp, 53/udp",2026-11-21T21:37:37.488Z,nmap,nmap,2026-11-21T21:35:28.959Z');
assert.equal(csv[3], "");
assert.equal(hostsCsvFilename(new Date(2026, 10, 21, 9, 5)), "sirius-hosts-2026-11-21.csv");

// New hosts since the marker.
assert.equal(latestFirstSeen(rows), "2026-11-21T22:00:00.000Z");
assert.equal(latestFirstSeen([]), null);
assert.equal(initialMarker([]), EMPTY_INVENTORY_MARKER);
assert.equal(initialMarker([web01]), web01.firstSeen);

const marker = "2026-11-21T21:00:00.000Z";
// Hand-added hosts (no scan source) are not "added automatically".
assert.deepEqual(newHostsSince(rows, marker).map((r) => r.ip), [db01.ip, app01host.ip]);
assert.deepEqual(newHostsSince(rows, EMPTY_INVENTORY_MARKER).length, 3);
assert.deepEqual(newHostsSince(rows, null), []);
assert.deepEqual(newHostsSince(rows, "not a date"), []);
assert.deepEqual(newHostsSince(rows, initialMarker(rows)), []);

assert.equal(advanceMarker(marker, rows), "2026-11-21T22:00:00.000Z");
assert.equal(advanceMarker("2027-01-01T00:00:00.000Z", rows), "2027-01-01T00:00:00.000Z");
assert.equal(advanceMarker(null, []), EMPTY_INVENTORY_MARKER);
assert.equal(advanceMarker(EMPTY_INVENTORY_MARKER, []), EMPTY_INVENTORY_MARKER);

// Tie the new hosts to the last scan only when all fall inside it.
const scan = { startedAt: "2026-11-21T21:35:00.000Z", finishedAt: "2026-11-21T21:43:00.000Z" };
const fresh = newHostsSince(rows, marker);
assert.equal(scanTimeForNewHosts(fresh, scan), scan.finishedAt);
assert.equal(scanTimeForNewHosts(fresh, { startedAt: scan.startedAt }), scan.startedAt, "running scan");
assert.equal(scanTimeForNewHosts(fresh, { startedAt: "2026-11-21T21:38:00.000Z" }), null, "one host predates the scan");
assert.equal(scanTimeForNewHosts(fresh, { finishedAt: scan.finishedAt }), null, "no start time");
assert.equal(scanTimeForNewHosts(fresh, { startedAt: "2026-11-21T21:00:00.000Z", finishedAt: "2026-11-21T21:10:00.000Z" }), null);
assert.equal(scanTimeForNewHosts([], scan), null);
assert.equal(scanTimeForNewHosts(fresh, null), null);

const fmt = (iso: string) => `<${iso}>`;
assert.equal(
  newHostsBannerText(1, scan.finishedAt, marker, fmt),
  `1 new host from the scan at <${scan.finishedAt}> was added automatically.`,
);
assert.equal(
  newHostsBannerText(2, null, marker, fmt),
  `2 new hosts from scans since <${marker}> were added automatically.`,
);
assert.equal(newHostsBannerText(3, null, EMPTY_INVENTORY_MARKER, fmt), "3 new hosts from scans were added automatically.");
assert.equal(
  newHostsBannerText(1, "2026-11-21T17:04:00.000Z", marker, (iso) => new Date(iso).toISOString().slice(11, 16)),
  "1 new host from the scan at 17:04 was added automatically.",
);

console.log("hostsTableModel: all cases pass");

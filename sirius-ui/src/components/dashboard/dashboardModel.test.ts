import assert from "node:assert/strict";
import {
  hostLabel,
  isFirstRun,
  lastScanEndedAt,
  lastScanHeading,
  lastScanMeta,
  lastScanNote,
  plural,
  scanPhase,
  severityHref,
  shortScanId,
  targetsLabel,
  trendCollapsedText,
  trendState,
} from "./dashboardModel";
import { toSecurityEventRow } from "./securityEvents";
import { parseSeverityParam } from "~/components/shared/severity";
import type { SummaryLastScan } from "~/types/riskSummary";

const fmt = (v: unknown) => `<${String(v)}>`;
const UTC = { timeZone: "UTC", now: new Date("2026-11-21T00:00:00Z") };

/* ---- first run ---- */
const zero = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
assert.equal(isFirstRun({ hosts: { total: 0 }, findings: { open: 0, bySeverity: zero } }), true);
assert.equal(isFirstRun({ hosts: { total: 1 }, findings: { open: 0, bySeverity: zero } }), false);
assert.equal(isFirstRun({ hosts: { total: 0 }, findings: { open: 3, bySeverity: zero } }), false);

/* ---- wording ---- */
assert.equal(plural(1, "target"), "1 target");
assert.equal(plural(3, "target"), "3 targets");
assert.equal(plural(1204, "finding"), "1,204 findings");
assert.equal(plural(2, "vulnerability", "vulnerabilities"), "2 vulnerabilities");
assert.equal(shortScanId("eec1dfcc-2e64-4279-a938-d221f98e9286"), "eec1dfcc");
assert.equal(shortScanId("lab-target03-20261121"), "lab-target03-20261121");
assert.equal(shortScanId("a".repeat(40)), `${"a".repeat(23)}…`);
assert.equal(shortScanId(""), undefined);
assert.equal(shortScanId(undefined), undefined);
assert.equal(targetsLabel(["192.0.2.12"]), "192.0.2.12");
assert.equal(targetsLabel(["a", "b"]), "a, b");
assert.equal(targetsLabel(["a", "b", "c", "d"]), "a, b and 2 more");
assert.equal(targetsLabel([" ", ""]), undefined);
assert.equal(targetsLabel(undefined), undefined);

/* ---- last scan ---- */
const done: SummaryLastScan = {
  origin: "scanner",
  id: "21ee7efa-1111-4222-8333-444455556666",
  status: "completed",
  startedAt: "2026-11-21T11:58:00.000Z",
  finishedAt: "2026-11-21T12:04:00.000Z",
  targets: ["192.0.2.12"],
  hostsFound: 1,
  findings: 162,
};
assert.equal(scanPhase(done), "finished");
assert.equal(scanPhase({ status: "running" }), "running");
assert.equal(scanPhase({ status: "pending" }), "running");
assert.equal(scanPhase({ status: "cancelling" }), "running");
assert.equal(scanPhase({ status: "cancelled" }), "stopped");
assert.equal(scanPhase({ status: "failed" }), "failed");
assert.equal(scanPhase({ finishedAt: "2026-11-21T12:04:00Z" }), "finished");
assert.equal(scanPhase({}), "unknown");

assert.deepEqual(lastScanHeading(null), { title: "Inventory" });
assert.deepEqual(lastScanHeading(done, fmt), {
  title: "Since the last scan",
  when: "finished <2026-11-21T12:04:00.000Z>",
});
assert.deepEqual(
  lastScanHeading({ origin: "scanner", status: "running", startedAt: "2026-11-21T11:58:00Z" }, fmt),
  { title: "Scan in progress", when: "started <2026-11-21T11:58:00Z>" },
);
assert.deepEqual(lastScanHeading({ origin: "scanner", status: "running" }, fmt), {
  title: "Scan in progress",
});
assert.deepEqual(lastScanHeading({ origin: "scanner", status: "cancelled" }, fmt), {
  title: "Since the last scan",
  when: "stopped",
});
assert.deepEqual(
  lastScanHeading({ origin: "scanner", status: "failed", startedAt: "2026-11-21T11:58:00Z" }, fmt),
  { title: "Since the last scan", when: "failed <2026-11-21T11:58:00Z>" },
);
// Go zero time is "never", not a date.
assert.deepEqual(
  lastScanHeading({ origin: "events", status: "completed", finishedAt: "0001-01-01T00:00:00Z" }, fmt),
  { title: "Since the last scan", when: "finished" },
);

assert.equal(lastScanMeta(done), "Scan 21ee7efa · 1 target");
assert.equal(lastScanMeta({ origin: "events", targets: ["a", "b"] }), "2 targets");
assert.equal(lastScanMeta({ origin: "events" }), undefined);
assert.equal(lastScanMeta(null), undefined);

assert.equal(lastScanEndedAt(done), "2026-11-21T12:04:00.000Z");
assert.equal(lastScanEndedAt({ ...done, status: "running" }), undefined);
assert.equal(lastScanEndedAt({ origin: "events", status: "completed" }), undefined);
assert.equal(lastScanEndedAt(null), undefined);

assert.equal(lastScanNote(done, 1), "1 in the last scan");
assert.equal(lastScanNote(done, 0), "0 in the last scan");
assert.equal(lastScanNote({ ...done, status: "running" }, 4), "4 so far in this scan");
assert.equal(lastScanNote(done, undefined), undefined);
assert.equal(lastScanNote(null, 3), undefined);

/* ---- links ---- */
assert.equal(severityHref("high"), "/vulnerabilities?severity=high");
assert.equal(severityHref("info"), "/vulnerabilities?severity=info");
// The link round-trips through the kit's ?severity= reader.
assert.deepEqual(parseSeverityParam("critical"), ["critical"]);
assert.equal(hostLabel({ ip: "192.0.2.12", hostname: "web-01.example" }), "web-01.example");
assert.equal(hostLabel({ ip: "192.0.2.12", hostname: "Unknown" }), "192.0.2.12");
assert.equal(hostLabel({ ip: "192.0.2.12", hostname: "" }), "192.0.2.12");
assert.equal(hostLabel({ ip: "192.0.2.12" }), "192.0.2.12");

/* ---- trend ---- */
assert.deepEqual(trendState(undefined), { kind: "collapsed", count: 0 });
assert.deepEqual(trendState([]), { kind: "collapsed", count: 0 });
const one = trendState([{ timestamp: new Date("2026-11-21T12:04:00Z") }]);
assert.equal(one.kind, "collapsed");
assert.equal(
  one.kind === "collapsed" ? trendCollapsedText(one, UTC) : "",
  "The trend chart appears after the second snapshot. One snapshot so far (Nov 21, 12:04 PM).",
);
assert.equal(
  trendCollapsedText({ kind: "collapsed", count: 0 }),
  "The trend chart appears after the second snapshot. No snapshots yet.",
);
const undated = trendState([{ timestamp: "not a date" }]);
assert.equal(
  undated.kind === "collapsed" ? trendCollapsedText(undated) : "",
  "The trend chart appears after the second snapshot. One snapshot so far.",
);
assert.deepEqual(
  trendState([{ timestamp: "2026-11-20T12:00:00Z" }, { timestamp: "2026-11-21T12:00:00Z" }]),
  { kind: "chart", count: 2 },
);

/* ---- security events (shapes from the live events table) ---- */
const at = "2026-11-21T22:47:29.860Z";
assert.deepEqual(
  toSecurityEventRow({
    event_id: "e1",
    event_type: "scan_completed",
    title: "Scan eec1dfcc-2e64-4279-a938-d221f98e9286 completed",
    description: "Scan completed successfully",
    timestamp: at,
    entity_type: "scan",
    entity_id: "eec1dfcc-2e64-4279-a938-d221f98e9286",
    metadata: {
      context: { type: "event" },
      scan_id: "eec1dfcc-2e64-4279-a938-d221f98e9286",
      total_hosts: 1,
      hosts_completed: 1,
      hosts_discovered: 1,
      vulnerabilities_found: 102,
    },
  }),
  {
    id: "e1",
    timestamp: at,
    kind: "scan_completed",
    title: "Scan completed",
    detail: "Scan eec1dfcc · 1 host found · 102 findings",
  },
);
assert.deepEqual(
  toSecurityEventRow({
    event_id: "e2",
    event_type: "scan_started",
    title: "Scan eec1dfcc-2e64-4279-a938-d221f98e9286 started",
    description: "Started scan with 1 targets",
    timestamp: at,
    entity_type: "scan",
    entity_id: "eec1dfcc-2e64-4279-a938-d221f98e9286",
    metadata: { scan_id: "eec1dfcc-2e64-4279-a938-d221f98e9286", targets: ["192.0.2.12"], target_count: 1 },
  }).detail,
  "Scan eec1dfcc · 192.0.2.12",
);
assert.deepEqual(
  toSecurityEventRow({
    event_id: "e3",
    event_type: "host_discovered",
    title: "Host 192.0.2.12 discovered",
    description: "New host discovered during scan x",
    timestamp: at,
    entity_type: "host",
    entity_id: "192.0.2.12",
    metadata: { os: "", host_ip: "192.0.2.12", scan_id: "x", ports_found: 2 },
  }),
  {
    id: "e3",
    timestamp: at,
    kind: "host_discovered",
    title: "Host discovered",
    detail: "192.0.2.12 · 2 open ports",
    href: "/host/192.0.2.12",
  },
);
const vuln = toSecurityEventRow({
  event_id: "e4",
  event_type: "vulnerabilities_found",
  title: "Vulnerability CVE-2021-41773 found on 192.0.2.12",
  description: "Vulnerability with severity critical detected",
  timestamp: at,
  entity_type: "vulnerability",
  entity_id: "CVE-2021-41773",
  metadata: { vulnerability_id: "CVE-2021-41773", host_ip: "192.0.2.12" },
});
assert.equal(vuln.title, "Vulnerability found");
assert.equal(vuln.detail, "CVE-2021-41773 on 192.0.2.12");
assert.equal(vuln.href, "/vulnerability?id=CVE-2021-41773");
const batch = toSecurityEventRow({
  event_id: "e5",
  event_type: "vulnerabilities_found",
  title: "Vulnerabilities found",
  timestamp: at,
  metadata: { host_ip: "192.0.2.12", vulnerabilities: [{}, {}, {}] },
});
assert.equal(batch.title, "3 vulnerabilities found");
assert.equal(batch.detail, "192.0.2.12");
assert.equal(batch.href, "/host/192.0.2.12");
const created = toSecurityEventRow({
  event_id: "e6",
  event_type: "host_created",
  title: "Host created",
  description: "Host 10.0.0.5 created",
  timestamp: at,
  entity_type: "host",
  entity_id: "10.0.0.5",
});
assert.equal(created.title, "Host saved to inventory");
assert.equal(created.detail, "10.0.0.5");
assert.equal(created.href, "/host/10.0.0.5");
// No metadata at all: keep the event's own description.
assert.equal(
  toSecurityEventRow({
    event_id: "e7",
    event_type: "scan_completed",
    title: "Scan completed",
    description: "Scan completed successfully",
    timestamp: at,
  }).detail,
  "Scan completed successfully",
);
// Unknown types fall back to their own title and description.
assert.deepEqual(
  toSecurityEventRow({ event_id: "e8", event_type: "other", title: "Something", description: "Text", timestamp: at }),
  { id: "e8", timestamp: at, kind: "other", title: "Something", detail: "Text" },
);

console.log("dashboardModel: all cases pass");

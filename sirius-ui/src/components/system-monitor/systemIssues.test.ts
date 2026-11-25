import assert from "node:assert/strict";
import { groupSystemIssues, issueLabel, issueSeverity, normalizeRoute } from "./systemIssues";

// normalizeRoute
assert.equal(normalizeRoute("/host/192.0.2.12/sources"), "/host/{ip}/sources");
assert.equal(normalizeRoute("/api/v1/pro/workspaces/hosts/192.0.2.10"), "/api/v1/pro/workspaces/hosts/{ip}");
assert.equal(normalizeRoute("/vulnerability/CVE-2021-41773"), "/vulnerability/{cve}");
assert.equal(normalizeRoute("/host/fe80::1/sources"), "/host/{ip}/sources");
assert.equal(normalizeRoute("/host/fe80%3A%3A1"), "/host/{ip}");
assert.equal(normalizeRoute("/api/v1/logs/123?limit=5"), "/api/v1/logs/{id}");
assert.equal(normalizeRoute("/api/v1/events/evt_20261121_225942_284804"), "/api/v1/events/{id}");
assert.equal(normalizeRoute("/scan/0f8fad5b-d9cb-469f-a165-70867728950e"), "/scan/{id}");
assert.equal(normalizeRoute("/api/v1/system/health"), "/api/v1/system/health");

// issueLabel (titles as the API's http-middleware writes them)
assert.deepEqual(issueLabel("GET /host/127.0.0.1/sources - 404"), {
  label: "GET /host/{ip}/sources → 404",
  isRequest: true,
});
assert.deepEqual(issueLabel("post /api/v1/pro/workspaces/hosts - 400"), {
  label: "POST /api/v1/pro/workspaces/hosts → 400",
  isRequest: true,
});
const multiLine = issueLabel("Command execution failed: Add-Type -AssemblyName X\n$roots = '/opt'");
assert.equal(multiLine.label, "Command execution failed: Add-Type -AssemblyName X");
assert.equal(multiLine.isRequest, false);
assert.equal(issueLabel("x".repeat(200)).label.length, 120);
assert.equal(issueLabel("").label, "Untitled event");

// issueSeverity
assert.equal(issueSeverity("warning"), "warning");
assert.equal(issueSeverity("WARN"), "warning");
assert.equal(issueSeverity("Critical"), "critical");
assert.equal(issueSeverity("info"), null);
assert.equal(issueSeverity(undefined), null);

// groupSystemIssues
const events = [
  { service: "sirius-api", severity: "warning", title: "GET /host/127.0.0.1/sources - 404", timestamp: "2026-11-21T20:14:03Z" },
  { service: "sirius-api", severity: "warning", title: "GET /host/10.0.0.5/sources - 404", timestamp: "2026-11-21T20:16:03Z" },
  { service: "sirius-api", severity: "error", title: "GET /host/10.0.0.9/sources - 404", timestamp: "2026-11-21T20:15:03Z" },
  { service: "sirius-api", severity: "info", title: "GET /host/10.0.0.9/sources - 404", timestamp: "2026-11-21T23:00:00Z" },
  { service: "sirius-api", severity: "error", title: "GET /vulnerability/CVE-2021-41773 - 500", timestamp: "2026-11-21T22:47:04Z" },
  { service: "sirius-api", severity: "error", title: "GET /vulnerability/CVE-2017-0144 - 500", timestamp: "2026-11-21T17:34:56Z" },
  { service: "sirius-terminal", severity: "error", title: "GET /host/127.0.0.1/sources - 404", timestamp: "2026-11-21T10:00:00Z" },
  { service: "", severity: "critical", title: "Disk full", timestamp: "not a date" },
];
const groups = groupSystemIssues(events);
assert.deepEqual(
  groups.map((g) => [g.label, g.count, g.service, g.severity]),
  [
    ["GET /vulnerability/{cve} → 500", 2, "sirius-api", "error"],
    ["GET /host/{ip}/sources → 404", 3, "sirius-api", "error"],
    ["GET /host/{ip}/sources → 404", 1, "sirius-terminal", "error"],
    ["Disk full", 1, "unknown service", "critical"],
  ],
);
// The group keeps its newest time, not the first one seen.
assert.equal(groups[1]!.latest, "2026-11-21T20:16:03Z");
assert.equal(groups[0]!.latest, "2026-11-21T22:47:04Z");
assert.deepEqual(groupSystemIssues(null), []);
assert.deepEqual(groupSystemIssues([{ severity: "info", title: "ok" }]), []);

console.log("systemIssues: all cases pass");

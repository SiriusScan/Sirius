import assert from "node:assert/strict";
import {
  DEFAULT_VULN_SORT,
  VULN_PRESET_COLUMNS,
  filterVulnRows,
  nextSort,
  pageWindow,
  paginate,
  sortVulnRows,
  vulnerabilityHref,
  type VulnRow,
} from "./vulnTableModel";

const rows: VulnRow[] = [
  { id: "CVE-2026-35385", severity: "high", cvss: 7.5, summary: "In OpenSSH before 10.3, a file downloaded by scp may be installed setuid", portService: "22/tcp OpenSSH 10.0p2", hosts: 1, firstSeen: "2026-11-21T11:52:00Z" },
  { id: "CVE-2026-123158", severity: "high", cvss: 8.1, summary: "sshd in OpenSSH before 10.0p2 on Linux", portService: "22/tcp OpenSSH 10.0p2", hosts: 1, firstSeen: "2026-11-21T11:50:00Z" },
  { id: "CVE-2026-59999", severity: "medium", cvss: 5.9, summary: "In sshd in OpenSSH before 10.4, DisableForwarding", portService: "22/tcp OpenSSH 10.0p2", hosts: 3 },
  { id: "CVE-2021-41773", severity: "critical", cvss: 9.8, summary: "Path traversal in Apache HTTP Server 2.4.49", portService: "80/tcp Apache httpd 2.4.49", hosts: 2, firstSeen: "2026-11-20T09:00:00Z" },
  { id: "FINDING-7", severity: "info", cvss: 0, summary: "Service banner disclosed", portService: "8080/tcp http" },
];

// Presets.
assert.deepEqual([...VULN_PRESET_COLUMNS.scan], ["id", "severity", "cvss", "summary", "portService", "hosts"]);
assert.deepEqual([...VULN_PRESET_COLUMNS.host], ["id", "severity", "cvss", "summary", "portService", "sources", "firstSeen"]);
assert.deepEqual([...VULN_PRESET_COLUMNS.inventory], ["id", "severity", "cvss", "summary", "hosts", "sources", "firstSeen"]);

// Default sort: CVSS, highest first; unscored last.
assert.deepEqual(
  sortVulnRows(rows).map((r) => r.id),
  ["CVE-2021-41773", "CVE-2026-123158", "CVE-2026-35385", "CVE-2026-59999", "FINDING-7"],
);
assert.deepEqual(DEFAULT_VULN_SORT, { key: "cvss", dir: "desc" });
// Ascending CVSS still keeps unscored rows last.
assert.deepEqual(sortVulnRows(rows, { key: "cvss", dir: "asc" }).map((r) => r.id).slice(-1), ["FINDING-7"]);
// Hosts, most first; missing last; ties by severity then CVSS.
assert.deepEqual(
  sortVulnRows(rows, { key: "hosts", dir: "desc" }).map((r) => r.id),
  ["CVE-2026-59999", "CVE-2021-41773", "CVE-2026-123158", "CVE-2026-35385", "FINDING-7"],
);
// Dates, newest first; missing last.
assert.deepEqual(
  sortVulnRows(rows, { key: "firstSeen", dir: "desc" }).map((r) => r.id).slice(0, 3),
  ["CVE-2026-35385", "CVE-2026-123158", "CVE-2021-41773"],
);
// Ids sort numerically.
assert.deepEqual(
  sortVulnRows(rows, { key: "id", dir: "asc" }).map((r) => r.id).slice(0, 4),
  ["CVE-2021-41773", "CVE-2026-35385", "CVE-2026-59999", "CVE-2026-123158"],
);
// Sorting does not mutate the input.
assert.equal(rows[0]!.id, "CVE-2026-35385");

assert.deepEqual(nextSort(DEFAULT_VULN_SORT, "cvss"), { key: "cvss", dir: "asc" });
assert.deepEqual(nextSort(DEFAULT_VULN_SORT, "id"), { key: "id", dir: "asc" });
assert.deepEqual(nextSort(DEFAULT_VULN_SORT, "hosts"), { key: "hosts", dir: "desc" });

// Search over id, summary and port/service; severity filter.
assert.deepEqual(filterVulnRows(rows, { search: "cve-2021" }).map((r) => r.id), ["CVE-2021-41773"]);
assert.deepEqual(filterVulnRows(rows, { search: "  SCP " }).map((r) => r.id), ["CVE-2026-35385"]);
assert.equal(filterVulnRows(rows, { search: "22/tcp" }).length, 3);
assert.deepEqual(filterVulnRows(rows, { severities: ["critical", "medium"] }).map((r) => r.id), ["CVE-2026-59999", "CVE-2021-41773"]);
assert.equal(filterVulnRows(rows, { severities: ["high"], search: "linux" }).length, 1);
assert.equal(filterVulnRows(rows).length, rows.length);

// Pagination.
const many = Array.from({ length: 162 }, (_, i) => i);
const first = paginate(many, 1, 10);
assert.equal(first.rows.length, 10);
assert.deepEqual([first.from, first.to, first.total, first.pageCount], [1, 10, 162, 17]);
const last = paginate(many, 99, 10);
assert.deepEqual([last.page, last.from, last.to, last.rows.length], [17, 161, 162, 2]);
const empty = paginate([], 3, 25);
assert.deepEqual([empty.page, empty.pageCount, empty.from, empty.to], [1, 1, 0, 0]);

// Page buttons.
assert.deepEqual(pageWindow(1, 5), [1, 2, 3, 4, 5]);
assert.deepEqual(pageWindow(1, 17), [1, 2, 3, 4, 5, "gap", 17]);
assert.deepEqual(pageWindow(9, 17), [1, "gap", 7, 8, 9, 10, 11, "gap", 17]);
assert.deepEqual(pageWindow(17, 17), [1, "gap", 13, 14, 15, 16, 17]);

assert.equal(vulnerabilityHref("CVE-2021-41773"), "/vulnerability?id=CVE-2021-41773");
assert.equal(vulnerabilityHref("a b&c"), "/vulnerability?id=a%20b%26c");

console.log("vulnTableModel: all cases pass");

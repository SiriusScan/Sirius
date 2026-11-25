import assert from "node:assert/strict";
import {
  cleanFindingSummary,
  looksLikeScannerText,
  parseFindingComponent,
  summaryFor,
} from "./findingSummary";

// Real descriptions from a live inventory (vulnerabilities.description and
// host_vulnerabilities.finding->>'description'): nmap vulners lines.
const live = [
  "cpe:/a:openbsd:openssh:10.0p2 CVE-2026-60002\t9.4\thttps://vulners.com/cve/CVE-2026-60002",
  "cpe:/a:openbsd:openssh:10.0p2 CVE-2026-106586\t4.3\thttps://vulners.com/cve/CVE-2026-106586",
  "cpe:/a:apache:http_server:2.4.49 CVE-2021-41773\t9.8\thttps://vulners.com/cve/CVE-2021-41773",
  "cpe:/a:apache:http_server:2.2.22 MEND:CVE-2024-42516\t8.7\thttps://vulners.com/mend/MEND:CVE-2024-42516",
  "cpe:/a:apache:tomcat:8.5.19 MEND:CVE-2025-24813\t10.0\thttps://vulners.com/mend/MEND:CVE-2025-24813",
  "cpe:/a:apache:tomcat:8.5.19 CVE-2021-43980\t3.7\thttps://vulners.com/cve/CVE-2021-43980",
  // The audit's example, space separated with a trailing colon on the CPE.
  "cpe:/a:openbsd:openssh:10.0p2: CVE-2026-123158 9.4 https://vulners.com/cve/CVE-2026-123158",
  // Vulners exploit marker.
  "cpe:/a:apache:http_server:2.4.49 CVE-2021-42013\t9.8\thttps://vulners.com/cve/CVE-2021-42013\t*EXPLOIT*",
];
for (const text of live) {
  assert.equal(cleanFindingSummary(text), "", `nothing meaningful: ${text}`);
  assert.ok(looksLikeScannerText(text), `scanner text: ${text}`);
}

// Empty input.
assert.equal(cleanFindingSummary(""), "");
assert.equal(cleanFindingSummary(null), "");
assert.equal(cleanFindingSummary(undefined), "");

// Prose survives, with the noise around it removed.
assert.equal(
  cleanFindingSummary(
    "cpe:/a:apache:http_server:2.4.49 CVE-2021-41773 9.8 Path traversal in Apache HTTP Server 2.4.49 https://httpd.apache.org/security/vulnerabilities_24.html",
  ),
  "Path traversal in Apache HTTP Server 2.4.49",
);
assert.equal(
  cleanFindingSummary("VULNERABLE: Apache byterange filter DoS State: VULNERABLE IDs: CVE:CVE-2011-3192 BID:49303"),
  "Apache byterange filter DoS",
);
assert.equal(
  cleanFindingSummary("|   State: LIKELY VULNERABLE\n|   IDs:  CVE:CVE-2014-0160"),
  "",
);
assert.equal(
  cleanFindingSummary("  Remote   code\texecution in   widget  "),
  "Remote code execution in widget",
);
assert.equal(cleanFindingSummary("https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-0160"), "");
assert.equal(cleanFindingSummary("9.4"), "");

// Products named by the CPE.
assert.deepEqual(parseFindingComponent(live[0]), {
  cpe: "cpe:/a:openbsd:openssh:10.0p2",
  part: "a",
  vendor: "openbsd",
  product: "openssh",
  version: "10.0p2",
  label: "openbsd openssh 10.0p2",
});
assert.equal(parseFindingComponent(live[2])?.label, "apache http server 2.4.49");
assert.equal(parseFindingComponent(live[6])?.cpe, "cpe:/a:openbsd:openssh:10.0p2");
assert.equal(
  parseFindingComponent("cpe:2.3:a:apache:tomcat:8.5.19:*:*:*:*:*:*:*")?.label,
  "apache tomcat 8.5.19",
);
assert.equal(parseFindingComponent("cpe:/a:nginx:nginx")?.label, "nginx");
assert.equal(parseFindingComponent("no cpe here"), undefined);

// summaryFor: NVD/catalog prose first.
const nvd =
  "In OpenSSH before 10.3, a file downloaded by scp may be installed setuid or setgid, see CVE-2026-35385.";
let s = summaryFor({ description: live[0], catalogDescription: nvd });
assert.equal(s.summary, nvd, "catalog prose kept verbatim, CVE ids included");
assert.equal(s.summarySource, "catalog");
assert.equal(s.evidence, live[0], "evidence is the raw scanner text");
assert.equal(s.component?.label, "openbsd openssh 10.0p2");

s = summaryFor({ description: live[0], nvdDescription: nvd, catalogDescription: live[0] });
assert.equal(s.summarySource, "catalog");

// Catalog that is itself scanner noise (true for every row on a live inventory today):
// fall back to the product the scanner matched.
s = summaryFor({ description: live[3], catalogDescription: live[3] });
assert.equal(s.summary, "Affects apache http server 2.2.22");
assert.equal(s.summarySource, "component");
assert.equal(s.evidence, live[3]);

// The finding's own prose (agent template, manual entry) is used as is.
s = summaryFor({ description: "Weak SSH ciphers enabled (arcfour)." });
assert.equal(s.summary, "Weak SSH ciphers enabled (arcfour).");
assert.equal(s.summarySource, "scanner");

// Scanner text with real words left after cleaning.
s = summaryFor({
  description: "VULNERABLE: Apache byterange filter DoS State: VULNERABLE IDs: CVE:CVE-2011-3192",
});
assert.equal(s.summary, "Apache byterange filter DoS");
assert.equal(s.summarySource, "scanner");

// Nothing known at all.
s = summaryFor({ description: "CVE-2026-10001 9.4 https://vulners.com/cve/CVE-2026-10001" });
assert.deepEqual(s, {
  summary: "",
  evidence: "CVE-2026-10001 9.4 https://vulners.com/cve/CVE-2026-10001",
  summarySource: "none",
});
assert.deepEqual(summaryFor({}), { summary: "", evidence: "", summarySource: "none" });

// Prose is not mistaken for scanner output.
assert.equal(looksLikeScannerText(nvd), false);
assert.equal(looksLikeScannerText(""), false);

console.log("findingSummary: all cases pass");

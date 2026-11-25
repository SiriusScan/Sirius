import assert from "node:assert/strict";
import {
  formatNsePortRule,
  isPlaceholderDescription,
  parseNseAuthor,
  parseNseCategories,
  parseNseDescription,
  parseNsePortRule,
} from "./nseScriptMeta";
import {
  AGENT_SCAN_SETTINGS_KEY,
  DEFAULT_AGENT_SCAN_SETTINGS,
  displayRepositoryUrl,
  filterRows,
  manifestRepositoryCounts,
  nextRepositoryPriority,
  parseAgentScanSettings,
  parseNseManifest,
  profileChecks,
  repositoryRows,
  scriptRow,
  serializeAgentScanSettings,
  sortProfiles,
  templateRow,
  toAgentScanConfig,
  validateAgentScanDraft,
  validateRepositoryInput,
} from "./scanningModel";

// Script heads copied from the sirius-nse repository as a live scanner
// synced it (ValKey nse:script:<id>).
const ACARSD = `local shortport = require "shortport"
description = [[
Retrieves information from a listening acarsd daemon. Acarsd decodes
ACARS (Aircraft Communication Addressing and Reporting System) data in
real time.
]]

---
-- @usage
-- nmap --script acarsd-info --script-args "acarsd-info.timeout=10,acarsd-info.bytes=512" -p <port> <host>
-- portrule = shortport.http
author = "Brendan Coles"
license = "Same as Nmap--See https://nmap.org/book/man-legal.html"
categories = {"safe","discovery"}

portrule = shortport.port_or_service (2202, "acarsd", {"tcp"})
`;
const NTP = `author = "Richard Sammet"
categories = {"default", "discovery", "safe"}
portrule = shortport.port_or_service(123, "ntp", {"udp", "tcp"})`;
const IMAP = `author = "Brandon Enright"
categories = {"default", "safe"}
portrule = shortport.port_or_service({143, 993}, {"imap", "imaps"})`;
const SMTP_EXIM = `author = "Djalal Harouni"
categories = {"intrusive", "vuln"}
portrule = function (host, port)
  if port.version.product ~= nil and port.version.product ~= "Exim smtpd" then
     return false
  end
  return shortport.port_or_service({25, 465, 587},
              {"smtp", "smtps", "submission"})(host, port)
end
`;
const HEARTBLEED = `author = "Patrik Karlsson <patrik@cqure.net>"
categories = { "vuln", "safe" }
portrule = function(host, port)
  return port.protocol == "tcp" and (shortport.ssl(host, port) or sslcert.getPrepareTLSWithoutReconnect(port))
end
`;
const MYSQL = `author = "Kris Katterjohn"
categories = { "default", "discovery", "safe" }
portrule = function(host, port)
  local extra = port.version.extrainfo

  return (port.number == 3306 or port.service == "mysql")
    and port.protocol == "tcp"
    and port.state == "open"
end
`;
const WHOIS = `author = "jah"
categories = {"discovery", "external", "safe"}
hostrule = function( host )
  return not is_private
end
`;
const DHCP = `author = "Patrik Karlsson"
categories = {"broadcast", "safe"}
prerule = function()
  return true
end
`;
const IRC = `author = {"Doug Hoyte", "Patrick Donnelly"}
categories = {"default", "discovery", "safe"}
portrule = irc.portrule`;
const QUAKE3 = `author = "Toni Ruottu"
categories = {"default", "discovery", "safe", "version"}
portrule = shortport.version_port_or_service(range(27960, 27970), {'quake3'}, 'udp')`;
const BACKORIFICE = `author = "Gorjan Petrovski"
categories = {"intrusive", "brute"}
portrule = function(host, port)
  local ports = stdnse.get_script_args(SCRIPT_NAME .. ".ports")
  return port.protocol == "udp" and shortport.port_range(ports)(host, port) and
    not(shortport.port_is_excluded(port.number,port.protocol))
end
`;
const HTTP_TITLE = `categories = {"default", "discovery", "safe"}
portrule = shortport.http`;
const TFTP = `categories = {"default", "safe"}
portrule = shortport.portnumber(69, "udp")`;

// Categories, author and description come from the code.
assert.deepEqual(parseNseCategories(ACARSD), ["safe", "discovery"]);
assert.deepEqual(parseNseCategories(HEARTBLEED), ["vuln", "safe"]);
assert.deepEqual(parseNseCategories("no categories here"), []);
assert.equal(parseNseAuthor(ACARSD), "Brendan Coles");
assert.equal(parseNseAuthor(IRC), "Doug Hoyte, Patrick Donnelly");
assert.equal(
  parseNseDescription(ACARSD),
  "Retrieves information from a listening acarsd daemon. Acarsd decodes ACARS (Aircraft Communication Addressing and Reporting System) data in real time.",
);
assert.equal(parseNseDescription(`description = "One line."`), "One line.");
assert.ok(isPlaceholderDescription("NSE script for * protocol"));
assert.ok(isPlaceholderDescription("NSE script for http protocol"));
assert.ok(isPlaceholderDescription("No description available"));
assert.ok(!isPlaceholderDescription("Checks for a format string vulnerability."));

// Port rules → the Port column. A commented-out rule never counts.
const label = (code: string) => formatNsePortRule(parseNsePortRule(code)).label;
assert.equal(label(ACARSD), "2202/tcp");
assert.equal(label(NTP), "123/udp, 123/tcp");
assert.equal(label(IMAP), "143/tcp, 993/tcp");
assert.equal(label(SMTP_EXIM), "25/tcp, 465/tcp +1");
assert.equal(label(HEARTBLEED), "ssl");
assert.equal(label(MYSQL), "3306/tcp");
assert.equal(label(WHOIS), "Per host");
assert.equal(label(DHCP), "Before scan");
assert.equal(label(IRC), "irc");
assert.equal(label(QUAKE3), "27960-27970/udp");
assert.equal(label(BACKORIFICE), "Any udp port");
assert.equal(label(HTTP_TITLE), "http");
assert.equal(label(TFTP), "69/udp");
assert.equal(label(""), "—");
assert.equal(
  formatNsePortRule(parseNsePortRule(ACARSD)).title,
  "Default port 2202/tcp, or any port running acarsd",
);
assert.equal(formatNsePortRule(parseNsePortRule(MYSQL)).title, "Default port 3306/tcp");
assert.equal(formatNsePortRule(parseNsePortRule(WHOIS)).isPort, false);

// Manifest: repository per script, custom scripts flagged.
const manifestRaw = JSON.stringify({
  name: "sirius-nse",
  scripts: {
    "acarsd-info": { name: "acarsd-info", path: "scripts/acarsd-info.nse", protocol: "*", source: { type: "repository", repository: "sirius-nse" } },
    "ntp-info": { name: "ntp-info", path: "scripts/ntp-info.nse", protocol: "ntp", source: { type: "repository", repository: "sirius-nse" } },
    "my-check": { name: "my-check", path: "scripts/custom/my-check.nse", protocol: "*" },
  },
});
const manifest = parseNseManifest(manifestRaw);
assert.equal(manifest.size, 3);
assert.equal(manifest.get("acarsd-info")?.repository, "sirius-nse");
assert.equal(manifest.get("my-check")?.custom, true);
assert.deepEqual(Array.from(manifestRepositoryCounts(manifest)), [["sirius-nse", 2]]);
assert.equal(parseNseManifest("not json").size, 0);
assert.equal(parseNseManifest(null).size, 0);
assert.equal(parseNseManifest(JSON.stringify({ scripts: ["scripts/a.nse", { id: "b", path: "scripts/b.nse" }] })).size, 2);

// Library rows fix the "* protocol" stand-ins.
const acarsd = scriptRow(
  { id: "acarsd-info", name: "acarsd-info", author: "System", tags: ["*"], description: "NSE script for * protocol", code: ACARSD, protocol: "*" },
  manifest,
);
assert.equal(acarsd.port, "2202/tcp");
assert.deepEqual(acarsd.categories, ["safe", "discovery"]);
assert.equal(acarsd.repository, "sirius-nse");
assert.equal(acarsd.author, "Brendan Coles");
assert.ok(acarsd.description.startsWith("Retrieves information from a listening acarsd daemon."));
const custom = scriptRow(
  { id: "my-check", name: "my-check", author: "Ana", tags: ["discovery", "*"], description: "Mine.", code: "action = function() end", protocol: "*", path: "scripts/custom/my-check.nse" },
  manifest,
);
assert.equal(custom.repository, "Custom");
assert.deepEqual(custom.categories, ["discovery"], "tags stand in when the code has no categories");
assert.equal(custom.description, "Mine.");
assert.equal(custom.author, "Ana");
assert.equal(scriptRow({ id: "x", name: "x" }).repository, "", "unknown repository stays empty");

// Search: name, port or tag, every word must match.
const rows = [acarsd, scriptRow({ id: "ntp-info", name: "ntp-info", code: NTP }, manifest), custom];
assert.deepEqual(filterRows(rows, "2202").map((r) => r.id), ["acarsd-info"]);
assert.deepEqual(filterRows(rows, "123/udp").map((r) => r.id), ["ntp-info"]);
assert.deepEqual(filterRows(rows, "discovery").map((r) => r.id), ["acarsd-info", "ntp-info", "my-check"]);
assert.deepEqual(filterRows(rows, "safe ntp").map((r) => r.id), ["ntp-info"]);
assert.equal(filterRows(rows, "   ").length, 3);

// Agent templates.
const tpl = templateRow({ id: "SSH-001", name: "SSH Root Login Enabled", type: "repository", severity: "high", platforms: ["linux", "darwin"] });
assert.deepEqual(tpl.platforms, ["Linux", "macOS"]);
assert.equal(tpl.source, "Repository");
assert.equal(templateRow({ id: "c", name: "c", type: "custom" }).source, "Custom");
assert.equal(templateRow({ id: "c", name: "c", type: "repository", source: { type: "repository", name: "Sirius Official" } }).source, "Sirius Official");
assert.deepEqual(filterRows([tpl], "macos").length, 1);

// Profiles: the Checks column, from live default profiles.
const available = ["vulners", "banner", "http-title", "ssl-cert", "smb-os-discovery", "ftp-anon"];
assert.equal(profileChecks({ id: "quick", name: "Quick Scan", enabled_scripts: available }, available).label, "6 scripts");
assert.equal(
  profileChecks({ id: "agent-only", name: "Agent Only Scan", enabled_scripts: [], scan_options: { scan_types: [], agent_scan: { enabled: true } } }).label,
  "Agent templates",
);
assert.equal(
  profileChecks({ id: "full-scan", name: "Full Scan", enabled_scripts: ["vulners", "banner"], scan_options: { agent_scan: { enabled: true } } }, available).label,
  "2 scripts + templates",
);
const missing = profileChecks({ id: "c", name: "c", enabled_scripts: ["vulners", "gone-script"] }, available);
assert.equal(missing.label, "1 script");
assert.equal(missing.missing, 1);
assert.equal(profileChecks({ id: "c", name: "c", enabled_scripts: ["vulners", "gone-script"] }).label, "2 scripts", "before the library loads");
assert.equal(profileChecks({ id: "e", name: "e", enabled_scripts: [] }).label, "No scripts");
assert.deepEqual(
  sortProfiles([
    { id: "z", name: "Zed", type: "custom" },
    { id: "high-risk", name: "High Risk Scan", type: "system" },
    { id: "a", name: "Alpha", type: "custom" },
    { id: "all", name: "All Scripts Scan", type: "system" },
  ]).map((p) => p.id),
  ["high-risk", "all", "a", "z"],
);

// Repositories: one table, nothing invented for script repositories.
const repos = repositoryRows(
  [{ name: "sirius-nse", url: "https://github.com/SiriusScan/sirius-nse.git" }, { name: "new-nse", url: "https://example.com/x.git" }],
  new Map([["sirius-nse", 612]]),
  [
    { id: "default-sirius-official", name: "Sirius Official", url: "https://github.com/SiriusScan/sirius-agent-modules", branch: "main", priority: 1, enabled: true, last_sync: "2026-11-21T22:46:35Z", template_count: 21, status: "synced", error_message: null },
  ],
);
assert.equal(repos.length, 3);
assert.deepEqual(
  repos.map((r) => [r.kind, r.name, r.status, r.items, r.branch ?? null, r.lastSync, r.enabled]),
  [
    ["network", "sirius-nse", "synced", 612, null, null, null],
    ["network", "new-nse", "not_synced", 0, null, null, null],
    ["agent", "Sirius Official", "synced", 21, "main", "2026-11-21T22:46:35Z", true],
  ],
);
assert.equal(repositoryRows([{ name: "a", url: "u" }], null, null)[0]?.items, null, "unknown until the manifest loads");
assert.equal(repositoryRows(null, null, [{ id: "x", name: "x", url: "u", status: "weird" }])[0]?.status, "never_synced");
assert.equal(displayRepositoryUrl("https://github.com/SiriusScan/sirius-nse.git"), "github.com/SiriusScan/sirius-nse");
assert.equal(displayRepositoryUrl("git@github.com:org/repo.git"), "github.com/org/repo");
assert.equal(nextRepositoryPriority([{ priority: 1 }, { priority: 3 }]), 4);
assert.equal(nextRepositoryPriority([]), 1);
assert.deepEqual(validateRepositoryInput({ kind: "network", name: "n", url: "https://github.com/o/r.git", branch: "" }), {});
assert.ok(validateRepositoryInput({ kind: "agent", name: "n", url: "https://github.com/o/r", branch: " " }).branch);
assert.ok(validateRepositoryInput({ kind: "network", name: "", url: "github.com/o/r", branch: "" }).url);

// Agent scanning settings.
assert.equal(AGENT_SCAN_SETTINGS_KEY.startsWith("agent_scan:"), true, "the store only writes allowed prefixes");
assert.equal(parseAgentScanSettings(null), null);
assert.equal(parseAgentScanSettings("{oops"), null);
assert.deepEqual(parseAgentScanSettings(serializeAgentScanSettings({ enabled: true, mode: "templates-only", timeout: 120, concurrency: 4 })), {
  enabled: true,
  mode: "templates-only",
  timeout: 120,
  concurrency: 4,
});
assert.deepEqual(parseAgentScanSettings(JSON.stringify({ enabled: "yes", mode: "custom", timeout: 99999, concurrency: 0 })), {
  enabled: false,
  mode: "comprehensive",
  timeout: 600,
  concurrency: 1,
});
assert.deepEqual(validateAgentScanDraft({ timeout: "300", concurrency: "3" }), {});
assert.ok(validateAgentScanDraft({ timeout: "5", concurrency: "3" }).timeout);
assert.ok(validateAgentScanDraft({ timeout: "300", concurrency: "2.5" }).concurrency);
assert.equal(toAgentScanConfig(null), undefined);
assert.equal(toAgentScanConfig(DEFAULT_AGENT_SCAN_SETTINGS), undefined, "off by default: scans unchanged");
assert.deepEqual(toAgentScanConfig({ enabled: true, mode: "comprehensive", timeout: 300, concurrency: 3 }), {
  enabled: true,
  mode: "comprehensive",
  agent_ids: [],
  timeout: 300,
  concurrency: 3,
});

console.log("scanningModel: all cases pass");

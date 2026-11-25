import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ScanStatus } from "~/components/scanner/ScanStatusPanel";
import type { ScanResult } from "~/types/scanTypes";
import {
  createLiveScanExport,
  liveScanExportFields,
  projectNetworkInventory,
  type NetworkInventoryStatus,
} from "~/utils/networkInventory";
import { generateVulnerabilityReportHtml } from "~/utils/reportGenerator";
import { serializeTableExport } from "~/utils/tableExport";

const fixtures = JSON.parse(
  readFileSync("../sirius-api/handlers/testdata/network_inventory.json", "utf8"),
) as { name: string; scan: ScanResult | null; expected: NetworkInventoryStatus | null }[];

for (const fixture of fixtures) {
  test(fixture.name, () => {
    assert.deepEqual(projectNetworkInventory(fixture.scan), fixture.expected);
  });
}

test("dashboard and exports keep evidence and disclose incomplete network inventory", () => {
  const fixture = fixtures.find(({ name }) => name === "mixed and agent completed");
  assert.ok(fixture?.scan);
  const { scan } = fixture;
  const liveScan = createLiveScanExport(scan);
  const status = renderToStaticMarkup(<ScanStatus results={scan} />);
  assert.match(status, /Network inventory incomplete/);
  assert.match(status, /5 attempted, 2 accepted, 1 rejected, 2 unconfirmed/);
  assert.match(status, /Inventory API rejection/);
  assert.match(status, /Agent Scan/);
  assert.equal(scan.sub_scans?.agent?.status, "completed");

  const report = generateVulnerabilityReportHtml(
    [{ cve: "FIXTURE-1", severity: "medium", description: "Synthetic live finding" }],
    { liveScan, targetsList: "unrelated editable targets" },
  );
  assert.match(report, /Live scan results/);
  assert.match(report, /Synthetic live finding/);
  assert.match(report, /203\.0\.113\.10, fixture\.example/);
  assert.doesNotMatch(report, /unrelated editable targets/);
  assert.match(report, /Network inventory incomplete/);
  assert.match(report, /5 attempted, 2 accepted, 1 rejected, 2 unconfirmed/);
  assert.doesNotMatch(report, /synthetic private response/);
  assert.doesNotMatch(status, /synthetic private response/);

  const rows = [{ cve: "FIXTURE-1", description: 'Synthetic, "live" finding' }];
  const fields = liveScanExportFields(liveScan);
  const json = serializeTableExport("json", rows, { metadata: fields });
  assert.deepEqual(JSON.parse(json), [{ ...rows[0], ...fields }]);
  assert.equal(fields.data_source, "live_scan");
  assert.equal(fields.scan_id, scan.id);
  assert.equal(fields.network_inventory_status, "incomplete");
  assert.equal(fields.network_inventory_rejected, 1);
  const csv = serializeTableExport("csv", rows, { metadata: fields });
  assert.match(csv, /^cve,description,data_source,scan_id,network_inventory_status,/);
  assert.match(csv, /FIXTURE-1,"Synthetic, ""live"" finding",live_scan,fixture-mixed,incomplete,/);
  assert.doesNotMatch(csv + json, /synthetic private response/);
});

test("a legacy snapshot includes no inventory counts from an earlier run", () => {
  const fixture = fixtures.find(({ name }) => name === "legacy no subscans");
  assert.ok(fixture?.scan);
  const liveScan = createLiveScanExport(fixture.scan);
  const fields = liveScanExportFields(liveScan);
  assert.deepEqual(fields, {
    data_source: "live_scan",
    scan_id: "fixture-legacy",
    network_inventory_status: "untracked",
  });
  const status = renderToStaticMarkup(<ScanStatus results={fixture.scan} />);
  const report = generateVulnerabilityReportHtml([], { liveScan });
  assert.match(status, /Network inventory persistence untracked/);
  assert.match(report, /Network inventory persistence untracked/);
  assert.match(report, /0 vulnerabilities/);
  assert.match(report, /fixture-legacy/);
  assert.doesNotMatch(report, /network inventory incomplete/i);
});

test("a malformed scan ID does not escape into export metadata", () => {
  const fixture = fixtures.find(({ name }) => name === "malformed scan ID");
  assert.ok(fixture?.scan);
  const liveScan = createLiveScanExport(fixture.scan);
  assert.equal(liveScan.scanId, undefined);
  assert.equal(liveScanExportFields(liveScan).scan_id, undefined);
  const report = generateVulnerabilityReportHtml([], { liveScan });
  assert.match(report, /Live scan results/);
  assert.doesNotMatch(report, /<dt>Scan ID<\/dt>/);
});

test("the common encoder retains the JSON array and quotes regular CSV cells", () => {
  const rows = [{ ip: "203.0.113.10", hostname: 'Example, "test"' }];
  assert.deepEqual(JSON.parse(serializeTableExport("json", rows)), rows);
  assert.equal(serializeTableExport("json", []), "[]");
  assert.equal(
    serializeTableExport("csv", rows),
    'ip,hostname\n203.0.113.10,"Example, ""test"""',
  );
});

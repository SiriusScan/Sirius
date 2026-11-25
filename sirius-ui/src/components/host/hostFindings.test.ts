import assert from "node:assert/strict";
import test from "node:test";
import { normalizeHostFindings, observedTimestamp } from "./hostFindings";
import type { VulnerabilityWithSource } from "./types";

const earlier = "2026-11-14T17:00:00Z";
const later = "2026-11-24T17:30:00Z";
const zeroTime = "0001-01-01T00:00:00Z";

function row(fields: Partial<VulnerabilityWithSource> = {}): VulnerabilityWithSource {
  return {
    ID: 1,
    CreatedAt: earlier,
    UpdatedAt: earlier,
    DeletedAt: null,
    VID: "FIXTURE-1",
    Description: "Recorded description",
    Title: "Fixture finding",
    Hosts: null,
    HostVulnerabilities: null,
    RiskScore: 6,
    source: "network-fixture",
    source_version: "1",
    first_seen: earlier,
    last_seen: earlier,
    status: "active",
    confidence: 0.9,
    ...fields,
  };
}

test("keeps the newest observation and independent status for each source", () => {
  const input = [
    row({
      last_seen: later,
      source_version: "2",
      confidence: 0.4,
      status: "resolved",
      port: 443,
      service_info: "https",
    }),
    row({ source: "agent-fixture", status: "active", confidence: 0 }),
    row({ confidence: 1, port: 80 }),
    row({ source_version: "undated", last_seen: zeroTime }),
    row({ VID: "FIXTURE-2" }),
  ];
  const findings = normalizeHostFindings(input, "192.0.2.1");
  assert.equal(findings.length, 2);
  const [finding] = findings;
  assert.ok(finding);
  assert.deepEqual(finding.sources, ["network-fixture", "agent-fixture"]);
  assert.deepEqual(finding.affectedHosts, ["192.0.2.1"]);
  assert.deepEqual(
    finding.observations.map(({ source, version, firstSeen, lastSeen, status, confidence, port, serviceInfo }) =>
      ({ source, version, firstSeen, lastSeen, status, confidence, port, serviceInfo })),
    [
      {
        source: "network-fixture",
        version: "2",
        firstSeen: earlier,
        lastSeen: later,
        status: "resolved",
        confidence: 0.4,
        port: 443,
        serviceInfo: "https",
      },
      {
        source: "agent-fixture",
        version: "1",
        firstSeen: earlier,
        lastSeen: earlier,
        status: "active",
        confidence: 0,
        port: undefined,
        serviceInfo: undefined,
      },
    ],
  );
  assert.deepEqual(normalizeHostFindings([...input].reverse(), "192.0.2.1").find(
    ({ cve }) => cve === "FIXTURE-1",
  ), finding);
});

test("preserves unknown times and unattributed observations", () => {
  const [finding] = normalizeHostFindings([
    row({ source: "", first_seen: zeroTime, last_seen: "invalid timestamp" }),
    row({ source: "", first_seen: "", last_seen: "", port: 0 }),
  ]);
  assert.ok(finding);
  assert.deepEqual(finding.sources, []);
  assert.equal(finding.observations.length, 2);
  for (const observation of finding.observations) {
    assert.equal(observation.source, undefined);
    assert.equal(observation.firstSeen, undefined);
    assert.equal(observation.lastSeen, undefined);
    assert.equal(observation.port, undefined);
  }
  assert.equal(observedTimestamp("2026-11-24T17:30:00.123456+00:00"), "2026-11-24T17:30:00.123456+00:00");
  assert.equal(observedTimestamp(null), undefined);
  assert.deepEqual(normalizeHostFindings(null), []);
});

test("keeps independent source snapshots and allowlists evidence and web references", () => {
  const [finding] = normalizeHostFindings([
    row({
      source: "network-fixture",
      last_seen: later,
      finding: {
        title: "Network source title",
        description: "<b>Stored as text</b>",
        remediation: "Upgrade network component",
        severity: "high",
        metadata: {
          evidence: {
            path: "/fixture",
            summary: "Network observation",
            internal: "ignore this field",
          },
          references: [
            "https://fixture.invalid/advisory",
            "http://fixture.invalid/legacy",
            "https://fixture.invalid/advisory",
            "ftp://fixture.invalid/file",
            "https://account@fixture.invalid/ignored",
            "/relative",
            { url: "https://fixture.invalid/untyped" },
          ],
        },
      },
    }),
    row({
      source: "agent-fixture",
      finding: {
        title: "Agent source title",
        remediation: "Upgrade agent component",
        metadata: { evidence: "Agent text evidence" },
      },
    }),
    row({ source: "legacy-fixture" }),
  ]);
  assert.ok(finding);
  const [network, agent, legacy] = finding.observations;
  assert.deepEqual(network?.snapshot, {
    title: "Network source title",
    description: "<b>Stored as text</b>",
    remediation: "Upgrade network component",
    severity: "high",
    evidence: [
      { label: "Evidence summary", text: "Network observation" },
      { label: "Evidence path", text: "/fixture" },
    ],
    references: ["https://fixture.invalid/advisory", "http://fixture.invalid/legacy"],
  });
  assert.equal(agent?.snapshot?.title, "Agent source title");
  assert.equal(agent?.snapshot?.remediation, "Upgrade agent component");
  assert.deepEqual(agent?.snapshot?.evidence, [
    { label: "Evidence", text: "Agent text evidence" },
  ]);
  assert.equal(legacy?.snapshot, undefined);
});

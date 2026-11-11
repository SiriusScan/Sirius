import { safeErrorForLogging } from "~/server/safeErrorForLogging";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isIP } from "node:net";
import test from "node:test";
import { Script } from "node:vm";
import { initTRPC } from "@trpc/server";
import ts from "typescript";
import { z } from "zod";
import type { hostRouter, HostStatistics, SiriusHost } from "./host";

// Exercise the real router with in-memory HTTP only. Never import production
// authentication, Prisma, or API connections, or create real host records.
const source = ts.transpileModule(
  readFileSync(new URL("./host.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }
).outputText;

type Caller = ReturnType<typeof hostRouter.createCaller>;
const methods = [
  "getHostList",
  "getAllHosts",
  "getEnvironmentSummary",
] as const;

function host(ip: string, overrides: Partial<SiriusHost> = {}): SiriusHost {
  return {
    hid: `id-${ip}`,
    ip,
    hostname: "test-host",
    os: "Linux",
    osversion: "",
    asset_type: "server",
    tags: ["test"],
    vulnerabilities: [],
    ports: [],
    services: [],
    ...overrides,
  };
}

function fixture(
  hosts: unknown,
  options: {
    statistics?: Record<string, HostStatistics>;
    failStatistics?: boolean;
    failHostList?: boolean;
  } = {}
) {
  const calls: string[] = [];
  const t = initTRPC.create();
  const exports: { hostRouter?: { createCaller: (ctx: object) => Caller } } =
    {};
  new Script(source, { filename: "host.ts" }).runInNewContext({
    exports,
    console: {
      log: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    },
    require: (name: string): unknown => {
      if (name === "~/server/safeErrorForLogging") return { safeErrorForLogging };
      if (name === "node:net") return { isIP };
      if (name === "zod") return { z };
      if (name === "~/server/api/trpc")
        return { createTRPCRouter: t.router, protectedProcedure: t.procedure };
      if (name === "~/server/api/shared/apiClient")
        return {
          apiClient: {
            get: (path: string) => {
              calls.push(path);
              if (path === "host/") {
                if (options.failHostList)
                  return Promise.reject(new Error("Host API unavailable"));
                return Promise.resolve({ data: hosts });
              }
              const prefix = "host/statistics/";
              assert.ok(path.startsWith(prefix));
              if (options.failStatistics)
                return Promise.reject(new Error("Statistics unavailable"));
              const hid = path.slice(prefix.length);
              return Promise.resolve({
                data: options.statistics?.[hid] ?? null,
              });
            },
          },
        };
      throw new Error(`Unexpected production dependency: ${name}`);
    },
  });
  assert.ok(exports.hostRouter);
  return { caller: exports.hostRouter.createCaller({}), calls };
}

const validAddresses = [
  "192.0.2.1",
  "0.0.0.0",
  "255.255.255.255",
  "2001:db8::1",
  "2001:0DB8:0000:0000:0000:0000:0000:0001",
  "::1",
  "::",
  "fe80::abcd",
  "::ffff:192.0.2.1",
  "2001:db8::192.0.2.1",
  " 192.0.2.2 ",
  " 2001:db8::2 ",
];

const invalidAddresses = [
  "",
  "   ",
  "192.0.2.0/24",
  "2001:db8::/64",
  "192.0.2.1-192.0.2.10",
  "192.0.2.1-10",
  "2001:db8::1-2001:db8::2",
  "example.test",
  "https://example.test",
  "http://[::1]",
  "256.1.2.3",
  "1.2.3",
  "1.2.3.4.5",
  "192.00.2.1",
  "192.0.2.1:80",
  "192.0.2.1\n192.0.2.2",
  "192.0.2.*",
  "2001:::1",
  "2001:db8::1::2",
  "2001:db8:0:0:0:0:0:0:1",
  "gggg::1",
  "12345::1",
  "::ffff:256.0.2.1",
  "[2001:db8::1]",
  "[2001:db8::1]:443",
  // Node accepts zone identifiers, but the Go API's net.ParseIP rejects them.
  "fe80::1%eth0",
  "fe80::1%1",
];

for (const method of methods) {
  void test(`${method}: includes IPv4 and IPv6 without changing host identities`, async () => {
    const hosts = validAddresses.map((ip) => host(ip));
    const before = structuredClone(hosts);
    const f = fixture(hosts);
    const rows = structuredClone(await f.caller[method]());
    assert.deepEqual(
      rows.map((row) => row.ip),
      validAddresses
    );
    assert.deepEqual(hosts, before);
    assert.equal(f.calls[0], "host/");
    if (method === "getEnvironmentSummary") {
      assert.deepEqual(
        f.calls.slice(1),
        hosts.map(({ hid }) => `host/statistics/${hid}`)
      );
    } else {
      assert.equal(f.calls.length, 1);
    }
  });

  void test(`${method}: excludes targets and malformed addresses without dropping valid hosts`, async () => {
    const accepted = host("2001:db8::42");
    const f = fixture([
      host("192.0.2.42"),
      ...invalidAddresses.map((ip) => host(ip)),
      accepted,
    ]);
    const rows = structuredClone(await f.caller[method]());
    assert.deepEqual(
      rows.map((row) => row.ip),
      ["192.0.2.42", accepted.ip]
    );
    if (method === "getEnvironmentSummary") {
      assert.deepEqual(f.calls, [
        "host/",
        "host/statistics/id-192.0.2.42",
        `host/statistics/${accepted.hid}`,
      ]);
    }
  });

  void test(`${method}: malformed rows do not discard the rest of the inventory`, async () => {
    const f = fixture([
      host("192.0.2.1"),
      null,
      undefined,
      {},
      { ip: null },
      { ip: 123 },
      { ip: true },
      { ip: ["192.0.2.1"] },
      { ip: {} },
      host("2001:db8::1"),
    ]);
    const rows = structuredClone(await f.caller[method]());
    assert.deepEqual(
      rows.map((row) => row.ip),
      ["192.0.2.1", "2001:db8::1"]
    );
  });

  void test(`${method}: preserves empty and unavailable inventory behavior`, async () => {
    for (const hosts of [undefined, null, {}, [], "invalid"]) {
      const f = fixture(hosts);
      assert.deepEqual(structuredClone(await f.caller[method]()), []);
      assert.deepEqual(f.calls, ["host/"]);
    }
    const f = fixture([], { failHostList: true });
    assert.deepEqual(structuredClone(await f.caller[method]()), []);
  });
}

void test("IPv6 selectors, inventory, and summaries preserve metadata and statistics", async () => {
  const ipv6 = host("2001:db8::7", {
    hid: "stable-hid",
    hostname: "ipv6-server",
    tags: ["prod", "ipv6"],
    vulnerabilities: [
      {
        vid: "CVE-test",
        riskScore: 8.5,
        description: "test vulnerability",
        published: "2026-11-08T00:00:00Z",
        severity: "high",
      },
    ],
  });
  const f = fixture([ipv6], {
    statistics: {
      "stable-hid": {
        vulnerabilityCount: 3,
        totalRiskScore: 22,
        averageRiskScore: 22 / 3,
        hostSeverityCounts: {
          critical: 0,
          high: 3,
          medium: 0,
          low: 0,
          informational: 0,
        },
      },
    },
  });
  assert.deepEqual(structuredClone(await f.caller.getHostList()), [
    {
      ip: ipv6.ip,
      hostname: ipv6.hostname,
      os: ipv6.os,
      vulnCount: 1,
    },
  ]);
  const expected = {
    hid: ipv6.hid,
    hostname: ipv6.hostname,
    ip: ipv6.ip,
    os: ipv6.os,
    vulnerabilityCount: 1,
    groups: ipv6.tags,
    tags: ipv6.tags,
    vulnerabilities: ipv6.vulnerabilities,
  };
  assert.deepEqual(structuredClone(await f.caller.getAllHosts()), [expected]);
  assert.deepEqual(structuredClone(await f.caller.getEnvironmentSummary()), [
    { ...expected, vulnerabilityCount: 3 },
  ]);
  assert.ok(f.calls.includes("host/statistics/stable-hid"));
});

void test("IPv6 summary retains hosts when statistics fail or the HID is absent", async () => {
  const hosts = [host("2001:db8::1"), host("2001:db8::2", { hid: "" })];
  const f = fixture(hosts, { failStatistics: true });
  const inventory = structuredClone(await f.caller.getAllHosts());
  const summary = structuredClone(await f.caller.getEnvironmentSummary());
  assert.deepEqual(summary, inventory);
  assert.equal(summary[0]?.hid, "id-2001:db8::1");
  assert.equal(summary[1]?.hid, "host-2001:db8::2");
  assert.deepEqual(f.calls, [
    "host/",
    "host/",
    "host/statistics/id-2001:db8::1",
  ]);
});

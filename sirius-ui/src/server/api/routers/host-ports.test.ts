import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { PortWithSource } from "./host";

test("open ports carry port-level service metadata, preferring nmap over empty naabu rows", async (t) => {
  // Importing the router builds its API client; no request is made here.
  const dir = mkdtempSync(join(tmpdir(), "host-ports-test-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const keyFile = join(dir, "api-key");
  writeFileSync(keyFile, "offline-host-ports-test");
  process.env.SIRIUS_API_KEY_FILE = keyFile;
  process.env.SKIP_ENV_VALIDATION = "1";
  process.env.NEXTAUTH_SECRET = "offline-host-ports-test";
  const { openPortsForHost, openPortsFromSources } = await import("./host");

  const row = (n: number, source: string, extra: Partial<PortWithSource> = {}): PortWithSource => ({
    ID: n,
    Number: n,
    CreatedAt: "",
    UpdatedAt: "",
    DeletedAt: null,
    Protocol: "tcp",
    State: "open",
    source,
    source_version: "",
    first_seen: "",
    last_seen: "",
    status: "active",
    ...extra,
  });

  assert.deepEqual(
    openPortsFromSources([
      row(111, "naabu", { service_name: "", service_product: "" }),
      row(111, "nmap", {
        service_name: "rpcbind",
        service_product: "rpcbind",
        service_version: "2-4",
        service_extrainfo: "RPC #100000",
      }),
      row(3128, "nmap", { service_name: "http-proxy", service_product: "Squid http proxy", service_version: "5.7" }),
      row(3128, "naabu"),
      row(3128, "manual", { service_name: "squid" }),
      row(8080, "naabu"),
    ]),
    [
      {
        port: 111,
        protocol: "tcp",
        state: "open",
        sources: ["naabu", "nmap"],
        service: "rpcbind",
        product: "rpcbind",
        version: "2-4",
        extraInfo: "RPC #100000",
      },
      {
        port: 3128,
        protocol: "tcp",
        state: "open",
        sources: ["nmap", "naabu", "manual"],
        service: "http-proxy",
        product: "Squid http proxy",
        version: "5.7",
      },
      { port: 8080, protocol: "tcp", state: "open", sources: ["naabu"] },
    ],
  );

  assert.deepEqual(
    openPortsForHost({
      ports: [
        { number: 8009, protocol: "TCP", state: "open" },
        { number: 8009, protocol: "tcp", state: "open", service_name: "ajp13", service_extrainfo: "Protocol v1.3" },
        { number: 8006, protocol: "tcp", state: "open", service_name: "https", service_product: " " },
        { number: 25, protocol: "tcp", state: "closed", service_name: "smtp" },
      ],
    }),
    [
      { port: 8006, protocol: "tcp", state: "open", service: "https" },
      { port: 8009, protocol: "tcp", state: "open", service: "ajp13", extraInfo: "Protocol v1.3" },
    ],
  );
});

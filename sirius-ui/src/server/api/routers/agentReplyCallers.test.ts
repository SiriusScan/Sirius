import { safeErrorForLogging } from "~/server/safeErrorForLogging";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import test from "node:test";
import { initTRPC, TRPCError } from "@trpc/server";
import ts from "typescript";
import { z } from "zod";
import * as terminalHistory from "../../terminalHistory";

type Caller = {
  executeCommand: (input: {
    command: string;
    target: { type: "agent" | "engine"; id?: string };
  }) => Promise<{ success: boolean; output: string }>;
  listAgentsWithHosts: () => Promise<{ id: string }[]>;
  getTemplates: () => Promise<unknown[]>;
  discoverTemplates: () => Promise<unknown>;
};
function fixture(router: "agent" | "terminal", response: unknown) {
  const source = ts.transpileModule(
    readFileSync(new URL(`./${router}.ts`, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }
  ).outputText;
  const requests: Record<string, unknown>[] = [];
  const legacy: string[] = [];
  const t = initTRPC.create();
  const exports: Record<string, { createCaller: (ctx: unknown) => Caller }> =
    {};
  new Script(source, { filename: `${router}.ts` }).runInNewContext({
    exports,
    Error,
    console: {
      log: () => undefined,
      error: () => undefined,
      warn: () => undefined,
    },
    require: (name: string): unknown => {
      if (name === "~/server/safeErrorForLogging") return { safeErrorForLogging };
      if (name === "zod") return { z };
      if (name === "@trpc/server") return { TRPCError };
      if (name === "~/server/api/trpc")
        return { createTRPCRouter: t.router, protectedProcedure: t.procedure };
      if (name === "~/server/terminalHistory") return terminalHistory;
      if (name === "~/server/api/shared/apiClient")
        return { apiClient: { get: () => Promise.resolve({ data: [] }) } };
      if (name === "~/server/valkey")
        return {
          valkey: {
            get: (key: string) =>
              Promise.resolve(
                key === "connected_agents"
                  ? null
                  : JSON.stringify({
                      status: "completed",
                      output: "agent output",
                    })
              ),
          },
        };
      if (name === "./queue")
        return {
          requestAgentResponse: (message: Record<string, unknown>) => {
            requests.push(message);
            return Promise.resolve(JSON.stringify(response));
          },
          handleSendMsg: (queue: string) => {
            legacy.push(queue);
            return Promise.resolve();
          },
          waitForResponse: (queue: string) => {
            legacy.push(queue);
            return Promise.resolve("engine output");
          },
        };
      throw new Error(`Unexpected production dependency: ${name}`);
    },
  });
  const exported = exports[`${router}Router`];
  assert.ok(exported);
  return {
    caller: exported.createCaller({ session: { user: { id: "user" } } }),
    requests,
    legacy,
  };
}

void test("agent terminal execution uses private ACK while final output still comes from Valkey", async () => {
  const f = fixture("terminal", { success: true });
  const result = await f.caller.executeCommand({
    command: "whoami",
    target: { type: "agent", id: "a" },
  });
  assert.equal(result.output, "agent output");
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0]?.command, "whoami");
  assert.equal(f.legacy.length, 0);
});

void test("engine terminal keeps its existing queue protocol", async () => {
  const f = fixture("terminal", { success: true });
  assert.equal(
    (
      await f.caller.executeCommand({
        command: "help",
        target: { type: "engine" },
      })
    ).output,
    "engine output"
  );
  assert.equal(f.requests.length, 0);
  assert.deepEqual(f.legacy, ["terminal", "terminal_response"]);
});

void test("agent list fallback uses private RPC and preserves array payload", async () => {
  const f = fixture("agent", ["a", "b"]);
  assert.deepEqual(
    Array.from(await f.caller.listAgentsWithHosts(), (agent) => agent.id),
    ["a", "b"]
  );
  assert.equal(f.requests[0]?.action, "list_agents");
  assert.equal(f.legacy.length, 0);
});

void test("legacy template list/discovery actions use private replies too", async () => {
  const f = fixture("agent", { success: true, message: "[]" });
  assert.equal((await f.caller.getTemplates()).length, 0);
  await f.caller.discoverTemplates();
  assert.deepEqual(
    f.requests.map((request) => request.action),
    ["list_templates", "discover_templates"]
  );
  assert.equal(f.legacy.length, 0);
});

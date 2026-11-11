import { safeErrorForLogging } from "~/server/safeErrorForLogging";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import test from "node:test";
import { initTRPC } from "@trpc/server";
import ts from "typescript";
import { z } from "zod";

// Exercise the actual tRPC procedure with mocked HTTP, never live API calls.
const source = ts.transpileModule(
  readFileSync(new URL("./agent-templates.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }
).outputText;

type TestInput = { templateId: string; agentId: string };
type Caller = { testTemplate: (input: TestInput) => Promise<unknown> };

function fixture(ok = true) {
  const calls: { url: string; method: string; body: string }[] = [];
  const t = initTRPC.create();
  const exports: {
    agentTemplatesRouter?: { createCaller: (ctx: object) => Caller };
  } = {};
  new Script(source, { filename: "agent-templates.ts" }).runInNewContext({
    exports,
    Error,
    console: { error: () => undefined },
    require: (name: string): unknown => {
      if (name === "~/server/safeErrorForLogging") return { safeErrorForLogging };
      if (name === "zod") return { z };
      if (name === "~/server/api/trpc")
        return { createTRPCRouter: t.router, protectedProcedure: t.procedure };
      if (name === "~/server/api/shared/apiClient")
        return {
          API_BASE_URL: "http://api.invalid",
          apiFetch: (url: string, init: { method: string; body: string }) => {
            calls.push({ url, ...init });
            return Promise.resolve({
              ok,
              json: () =>
                Promise.resolve(
                  ok
                    ? {
                        message: "Template test initiated",
                        agent_id: "agent-one",
                      }
                    : { error: "Requested agent is not connected" }
                ),
            });
          },
        };
      throw new Error(`Unexpected production dependency: ${name}`);
    },
  });
  assert.ok(exports.agentTemplatesRouter);
  return { caller: exports.agentTemplatesRouter.createCaller({}), calls };
}

void test("testTemplate sends the selected agent using the Go camelCase contract", async () => {
  const f = fixture();
  await f.caller.testTemplate({
    templateId: "fixture-template",
    agentId: " agent-one ",
  });
  assert.equal(f.calls.length, 1);
  assert.equal(
    f.calls[0]?.url,
    "http://api.invalid/api/agent-templates/fixture-template/test"
  );
  assert.equal(f.calls[0]?.method, "POST");
  assert.deepEqual(JSON.parse(f.calls[0]?.body ?? "null"), {
    agentId: "agent-one",
  });
});

void test("testTemplate rejects blank and oversized agent IDs before HTTP", async () => {
  for (const agentId of ["", "   ", "x".repeat(129)]) {
    const f = fixture();
    await assert.rejects(
      f.caller.testTemplate({ templateId: "fixture-template", agentId })
    );
    assert.equal(f.calls.length, 0);
  }
});

void test("testTemplate preserves backend disconnection failures", async () => {
  const f = fixture(false);
  await assert.rejects(
    f.caller.testTemplate({
      templateId: "fixture-template",
      agentId: "agent-one",
    }),
    /Requested agent is not connected/
  );
  assert.equal(f.calls.length, 1);
});

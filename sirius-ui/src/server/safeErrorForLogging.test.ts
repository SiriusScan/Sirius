import assert from "node:assert/strict";
import { Console } from "node:console";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Writable } from "node:stream";
import test from "node:test";
import { inspect } from "node:util";
import { Script } from "node:vm";
import axios, { AxiosError, type AxiosInstance } from "axios";
import { initTRPC } from "@trpc/server";
import ts from "typescript";
import { z } from "zod";
import { safeErrorForLogging } from "./safeErrorForLogging";

const secret = "synthetic-log-test-key-not-a-real-credential";

function captureConsole() {
  let output = "";
  const sink = new Writable({
    write(chunk: Buffer, _encoding, done) {
      output += chunk.toString();
      done();
    },
  });
  return {
    console: new Console({ stdout: sink, stderr: sink }),
    output: () => output,
  };
}

void test("summaries omit every nested credential copy without mutating errors", () => {
  const config = {
    headers: { "X-API-Key": secret, authorization: secret, Cookie: secret },
    auth: { username: secret, password: secret },
    url: `https://example.invalid/?token=${secret}`,
    data: secret,
  };
  const error = Object.assign(new Error(secret), {
    name: secret,
    code: "ERR_BAD_RESPONSE",
    config,
    response: { status: 503, config, data: secret },
    request: { _header: `X-API-Key: ${secret}`, socket: { secret } },
    cause: { message: secret, config },
  });
  error.cause = error;
  Object.defineProperty(error, "toJSON", {
    value: () => {
      throw new Error("Must not serialize errors");
    },
  });
  Object.defineProperty(error, inspect.custom, {
    value: () => {
      throw new Error("Must not inspect errors");
    },
  });
  const summary = safeErrorForLogging(error);
  assert.deepEqual(summary, {
    name: "Error",
    code: "ERR_BAD_RESPONSE",
    status: 503,
  });
  const capture = captureConsole();
  capture.console.error("Operation failed:", summary);
  assert.equal(capture.output().includes(secret), false);
  assert.equal(JSON.stringify(summary).includes(secret), false);
  assert.equal(error.config.headers["X-API-Key"], secret);
  assert.equal(error.response.config, config);
  assert.equal(error.cause, error);
  assert.equal(error.message, secret);
});

void test("unknown strings, codes, getters and unusual thrown values fail closed", () => {
  let gettersCalled = 0;
  const error = { name: secret, code: secret, status: secret, message: secret };
  assert.deepEqual(safeErrorForLogging(error), { name: "UnknownError" });
  const accessor = Object.defineProperties(
    {},
    {
      code: {
        get: () => {
          gettersCalled++;
          return secret;
        },
      },
      status: {
        get: () => {
          gettersCalled++;
          return 503;
        },
      },
      response: {
        get: () => {
          gettersCalled++;
          return { status: 503 };
        },
      },
    }
  );
  assert.deepEqual(safeErrorForLogging(accessor), { name: "UnknownError" });
  assert.equal(gettersCalled, 0);
  const proxy = Proxy.revocable({}, {});
  proxy.revoke();
  for (const value of [secret, null, undefined, Symbol(secret), proxy.proxy]) {
    assert.deepEqual(safeErrorForLogging(value), { name: "UnknownError" });
  }
  for (const status of [0, 99, 600, Infinity, NaN, 503.5, secret]) {
    assert.equal(safeErrorForLogging({ status }).status, undefined);
  }
});

function evaluate(
  file: string,
  dependencies: Record<string, unknown>,
  output: Console
) {
  const compiled = ts.transpileModule(
    readFileSync(new URL(file, import.meta.url), "utf8"),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    }
  ).outputText;
  const exports: Record<string, unknown> = {};
  new Script(compiled, { filename: file }).runInNewContext({
    exports,
    Error,
    console: output,
    require: (name: string): unknown => {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected production dependency: ${name}`);
    },
  });
  return exports;
}

void test("development tRPC errors do not re-log sensitive exception messages", () => {
  const capture = captureConsole();
  const handler = evaluate(
    "../pages/api/trpc/[trpc].ts",
    {
      "@trpc/server/adapters/next": {
        createNextApiHandler: (options: unknown) => options,
      },
      "~/env.mjs": { env: { NODE_ENV: "development" } },
      "~/server/api/root": { appRouter: {} },
      "~/server/api/trpc": { createTRPCContext: () => ({}) },
      "~/server/safeErrorForLogging": { safeErrorForLogging },
    },
    capture.console
  ) as {
    default: { onError: (input: { path: string; error: Error }) => void };
  };
  const error = Object.assign(new Error(secret), {
    code: "INTERNAL_SERVER_ERROR",
    cause: { config: { headers: { "X-API-Key": secret } } },
  });
  handler.default.onError({ path: "statistics.listSnapshots", error });
  assert.match(capture.output(), /statistics.listSnapshots/);
  assert.match(capture.output(), /INTERNAL_SERVER_ERROR/);
  assert.equal(capture.output().includes(secret), false);
});

void test("actual API client and statistics catch never log the injected API key", async () => {
  const capture = captureConsole();
  const shared = evaluate(
    "./api/shared/apiClient.ts",
    {
      axios,
      "~/env.mjs": {
        env: {
          SIRIUS_API_KEY: secret,
          SIRIUS_API_URL: "http://synthetic.invalid",
        },
      },
    },
    capture.console
  ) as { apiClient: AxiosInstance };
  let failedRequest: AxiosError | undefined;
  shared.apiClient.defaults.adapter = (config) => {
    assert.equal(config.headers["X-API-Key"], secret);
    failedRequest = new AxiosError(
      secret,
      "ERR_BAD_RESPONSE",
      config,
      {
        _header: `X-API-Key: ${secret}`,
      },
      {
        status: 503,
        statusText: secret,
        headers: { authorization: secret },
        config,
        data: { error: "Temporarily unavailable", diagnostic: secret },
      }
    );
    failedRequest.cause = new Error(secret);
    return Promise.reject(failedRequest);
  };
  const t = initTRPC.create();
  const routers = evaluate(
    "./api/routers/statistics.ts",
    {
      axios,
      zod: { z },
      "~/server/api/trpc": {
        createTRPCRouter: t.router,
        protectedProcedure: t.procedure,
      },
      "~/server/api/shared/apiClient": shared,
      "~/server/safeErrorForLogging": { safeErrorForLogging },
    },
    capture.console
  ) as {
    statisticsRouter: {
      createCaller: (ctx: object) => { listSnapshots: () => Promise<unknown> };
    };
  };
  await assert.rejects(
    routers.statisticsRouter.createCaller({}).listSnapshots(),
    /Temporarily unavailable/
  );
  assert.match(capture.output(), /Error listing snapshots/);
  assert.match(capture.output(), /ERR_BAD_RESPONSE/);
  assert.match(capture.output(), /503/);
  assert.equal(capture.output().includes(secret), false);
  assert.equal(capture.output().includes("X-API-Key"), false);
  assert.equal(failedRequest?.config?.headers["X-API-Key"], secret);
  // The same fixture is sensitive to the original unsafe console call.
  const unsafe = captureConsole();
  unsafe.console.error("Baseline:", failedRequest);
  assert.equal(unsafe.output().includes(secret), true);
});

void test("server catch logs always summarize exceptions before passing them to console", () => {
  const violations: string[] = [];
  const serverRoot = new URL("./", import.meta.url);
  function files(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? files(join(dir, entry.name))
        : [join(dir, entry.name)]
    );
  }
  for (const file of files(serverRoot.pathname)) {
    if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
    const source = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true
    );
    function visit(node: ts.Node, caught: string[]) {
      if (ts.isCatchClause(node) && node.variableDeclaration) {
        caught = [...caught, node.variableDeclaration.name.getText(source)];
      }
      if (
        ts.isCallExpression(node) &&
        /^console\.(error|warn|log|info|debug|trace)$/.test(
          node.expression.getText(source)
        )
      ) {
        function check(argument: ts.Node) {
          if (
            ts.isCallExpression(argument) &&
            argument.expression.getText(source) === "safeErrorForLogging"
          )
            return;
          if (ts.isIdentifier(argument) && caught.includes(argument.text)) {
            violations.push(
              `${file}:${
                source.getLineAndCharacterOfPosition(argument.getStart(source))
                  .line + 1
              }`
            );
          }
          ts.forEachChild(argument, check);
        }
        node.arguments.forEach(check);
      }
      ts.forEachChild(node, (child) => visit(child, caught));
    }
    visit(source, []);
  }
  assert.deepEqual(violations, []);
});

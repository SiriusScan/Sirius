import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import test from "node:test";
import ts from "typescript";
import type { StopScanResult, useStopScan } from "./useStopScan";

const source = ts.transpileModule(
  readFileSync(new URL("./useStopScan.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }
).outputText;

function fixture(force: () => Promise<StopScanResult>) {
  let resets = 0;
  const state: unknown[] = [];
  const exports: { useStopScan?: typeof useStopScan } = {};
  const mutation = (run: () => Promise<StopScanResult>) => ({
    useMutation: (options: {
      onSuccess: (result: StopScanResult) => void;
      onError: (error: Error) => void;
    }) => ({
      mutateAsync: async () => {
        try {
          const result = await run();
          options.onSuccess(result);
          return result;
        } catch (error) {
          options.onError(error as Error);
          throw error;
        }
      },
    }),
  });
  const ok = () => Promise.resolve({ success: true, message: "OK" });
  new Script(source, { filename: "useStopScan.ts" }).runInNewContext({
    exports,
    setTimeout: () => 1,
    clearTimeout: () => undefined,
    require: (name: string): unknown => {
      if (name === "react")
        return {
          useState: (initial: unknown) => {
            const index = state.push(initial) - 1;
            return [
              initial,
              (next: unknown) => {
                state[index] = next;
              },
            ];
          },
          useRef: (current: unknown) => ({ current }),
          useCallback: (fn: unknown) => fn,
          useEffect: () => undefined,
        };
      if (name === "~/utils/api")
        return {
          api: {
            scanner: {
              cancelScan: mutation(ok),
              forceStopScan: mutation(force),
              resetScanState: mutation(() => {
                resets++;
                return ok();
              }),
            },
          },
        };
      throw new Error(`Unexpected production dependency: ${name}`);
    },
  });
  assert.ok(exports.useStopScan);
  return { hook: exports.useStopScan(), resets: () => resets, state };
}

void test("force-stop conflict never automatically resets a replacement scan", async () => {
  const f = fixture(() =>
    Promise.resolve({
      success: false,
      message: "Requested scan is not the current scan",
    })
  );
  assert.equal((await f.hook.forceStopScan("old")).success, false);
  assert.equal(f.resets(), 0);
  assert.equal(f.state[2], "reset_available");
});

void test("force-stop transport error never automatically resets current state", async () => {
  const f = fixture(() => Promise.reject(new Error("Connection lost")));
  assert.equal((await f.hook.forceStopScan("old")).success, false);
  assert.equal(f.resets(), 0);
  assert.equal(f.state[2], "reset_available");
});

void test("repeated failed force-stop attempts do not escalate to deletion", async () => {
  const f = fixture(() =>
    Promise.resolve({ success: false, message: "State changed" })
  );
  await f.hook.forceStopScan("old");
  await f.hook.forceStopScan("old");
  assert.equal(f.resets(), 0);
});

void test("dashboard reset remains an explicit separate action", async () => {
  const f = fixture(() =>
    Promise.resolve({ success: false, message: "State changed" })
  );
  await f.hook.forceStopScan("old");
  assert.equal(f.resets(), 0);
  assert.equal((await f.hook.resetScan()).success, true);
  assert.equal(f.resets(), 1);
});

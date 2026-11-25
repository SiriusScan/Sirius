import assert from "node:assert/strict";
import test from "node:test";
import type { ScanResult } from "~/types/scanTypes";

test("scanner cancellation reports the state the dashboard can confirm", async (t) => {
  delete process.env.SIRIUS_API_KEY_FILE;
  process.env.SKIP_ENV_VALIDATION = "1";
  process.env.NEXTAUTH_SECRET = "offline-scanner-cancellation-test";

  const [{ createInnerTRPCContext, createTRPCRouter }, { createCancelScanProcedure }] =
    await Promise.all([import("../trpc"), import("./scanner-cancellation")]);

  const scanId = "scan-1234-abcd";
  const pendingScan: ScanResult = {
    id: scanId,
    status: "pending",
    targets: [],
    hosts: [],
    hosts_completed: 0,
    vulnerabilities: [],
    start_time: "2026-11-25T00:00:00Z",
  };
  const runningScan: ScanResult = { ...pendingScan, status: "running" };
  const awaitingWorker = {
    success: true,
    message: "Scan cancellation requested. Waiting for scanner confirmation.",
  };

  interface FixtureOptions {
    loadError?: Error;
    publishError?: Error;
    markError?: Error;
    replaceAfterPublish?: ScanResult;
  }

  function cancellationFixture(initial: ScanResult | null, options: FixtureOptions = {}) {
    const commands: string[] = [];
    const updates: ScanResult[] = [];
    const snapshot = (scan: ScanResult) => ({ raw: JSON.stringify(scan), scan });
    let current = initial ? snapshot(initial) : null;
    const router = createTRPCRouter({
      scanner: createTRPCRouter({
        cancelScan: createCancelScanProcedure({
          loadScan: () => options.loadError ? Promise.reject(options.loadError) : Promise.resolve(current),
          publishCancel: (message) => {
            commands.push(message);
            if (options.publishError) return Promise.reject(options.publishError);
            if (options.replaceAfterPublish) current = snapshot(options.replaceAfterPublish);
            return Promise.resolve();
          },
          markCancelling: (expected, scan) => {
            if (options.markError) return Promise.reject(options.markError);
            if (current?.raw !== expected) return Promise.resolve(false);
            updates.push(scan);
            current = snapshot(scan);
            return Promise.resolve(true);
          },
        }),
      }),
    });
    const caller = router.createCaller(createInnerTRPCContext({
      session: { expires: "2099-01-01T00:00:00Z", user: { id: "test-user" } },
      principal: {
        subjectId: "test-user",
        displayName: null,
        capabilities: ["api.scan_control"],
      },
    }));
    return { cancelScan: caller.scanner.cancelScan, commands, updates, getScan: () => current?.scan };
  }

  await t.test("a pending scan sends an exact-ID request and awaits the worker", async () => {
    const { cancelScan, commands, updates } = cancellationFixture(pendingScan);
    assert.deepEqual(await cancelScan({ scanId }), awaitingWorker);
    assert.equal(commands.length, 1);
    assert.match(commands[0] ?? "", /"action":"cancel","scan_id":"scan-1234-abcd"/);
    assert.deepEqual(updates, []);
  });

  await t.test("the implicit ID still resolves for a running scan", async () => {
    const { cancelScan, commands, updates } = cancellationFixture(runningScan);
    const result = await cancelScan();
    assert.equal(result.success, true);
    assert.equal(result.status, "cancelling");
    assert.equal(commands.length, 1);
    assert.match(commands[0] ?? "", /"scan_id":"scan-1234-abcd"/);
    assert.deepEqual(updates, [{ ...runningScan, status: "cancelling" }]);
  });

  await t.test("a worker update or replacement after publication survives cancellation", async () => {
    const afterPublish = [
      { ...runningScan, status: "cancelled" } satisfies ScanResult,
      { ...runningScan, hosts_completed: 1 },
      { ...pendingScan, id: "scan-1235-efgh" },
    ];
    for (const newer of afterPublish) {
      const { cancelScan, commands, updates, getScan } = cancellationFixture(runningScan, {
        replaceAfterPublish: newer,
      });
      assert.deepEqual(await cancelScan({ scanId }), awaitingWorker);
      assert.equal(commands.length, 1);
      assert.match(commands[0] ?? "", /"scan_id":"scan-1234-abcd"/);
      assert.deepEqual(updates, []);
      assert.deepEqual(getScan(), newer);
    }
  });

  await t.test("store and broker errors are reported without leaking connection details", async (testContext) => {
    const log = testContext.mock.method(console, "error", () => {});
    const secret = "synthetic-private-credential";
    const loadError = new Error(`redis://user:${secret}@store.example.invalid`);
    const publishError = new Error(`amqp://user:${secret}@broker.example.invalid`);

    const before = cancellationFixture(pendingScan, { loadError });
    const notSent = await before.cancelScan({ scanId });
    assert.deepEqual(notSent, {
      success: false,
      message: "Could not read the current scan. No cancellation request was sent.",
    });
    assert.deepEqual(before.commands, []);

    const during = cancellationFixture(pendingScan, { publishError });
    const unconfirmed = await during.cancelScan({ scanId });
    assert.deepEqual(unconfirmed, {
      success: false,
      message: "Could not confirm whether the cancellation request was sent.",
    });
    assert.equal(during.commands.length, 1);
    assert.deepEqual(during.updates, []);

    const after = cancellationFixture(runningScan, { markError: loadError });
    const requested = await after.cancelScan({ scanId });
    assert.deepEqual(requested, awaitingWorker);
    assert.equal(after.commands.length, 1);
    assert.deepEqual(after.updates, []);

    const loggedValues = log.mock.calls.flatMap((call) => call.arguments.map(String));
    const output = JSON.stringify({ notSent, unconfirmed, requested, loggedValues });
    assert.equal(output.includes(secret), false);
  });

  await t.test("a missing ID and missing scan produce no request", async () => {
    const { cancelScan, commands, updates } = cancellationFixture(null);
    assert.deepEqual(await cancelScan(), { success: false, message: "No scan to stop" });
    assert.deepEqual(commands, []);
    assert.deepEqual(updates, []);
  });
});

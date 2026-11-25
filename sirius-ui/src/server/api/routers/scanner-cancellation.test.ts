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

  function cancellationFixture(current: ScanResult | null, publishError?: Error) {
    const commands: string[] = [];
    const writes: ScanResult[] = [];
    const router = createTRPCRouter({
      scanner: createTRPCRouter({
        cancelScan: createCancelScanProcedure({
          loadScan: () => Promise.resolve(current),
          publishCancel: (message) => {
            commands.push(message);
            return publishError ? Promise.reject(publishError) : Promise.resolve();
          },
          writeScan: (scan) => {
            writes.push(scan);
            return Promise.resolve();
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
    return { cancelScan: caller.scanner.cancelScan, commands, writes };
  }

  await t.test("pending scans send an exact-ID request without asserting a state change", async () => {
    const { cancelScan, commands, writes } = cancellationFixture(pendingScan);
    assert.deepEqual(await cancelScan({ scanId }), {
      success: true,
      message: "Scan cancellation requested. Waiting for scanner confirmation.",
    });
    assert.equal(commands.length, 1);
    assert.match(commands[0] ?? "", /"action":"cancel","scan_id":"scan-1234-abcd"/);
    assert.deepEqual(writes, []);
  });

  await t.test("an unavailable broker leaves the pending state to the worker", async () => {
    const { cancelScan, writes } = cancellationFixture(pendingScan, new Error("offline"));
    assert.deepEqual(await cancelScan({ scanId }), {
      success: false,
      message: "Failed to cancel scan",
      error: "offline",
    });
    assert.deepEqual(writes, []);
  });

  await t.test("the implicit ID still resolves for a running scan", async () => {
    const { cancelScan, commands, writes } = cancellationFixture({
      ...pendingScan,
      status: "running",
    });
    const result = await cancelScan();
    assert.equal(result.success, true);
    assert.equal(result.status, "cancelling");
    assert.equal(commands.length, 1);
    assert.match(commands[0] ?? "", /"scan_id":"scan-1234-abcd"/);
    assert.deepEqual(writes, [{ ...pendingScan, status: "cancelling" }]);
  });

  await t.test("a missing ID and missing scan produce no request", async () => {
    const { cancelScan, commands, writes } = cancellationFixture(null);
    assert.deepEqual(await cancelScan(), { success: false, message: "No scan to stop" });
    assert.deepEqual(commands, []);
    assert.deepEqual(writes, []);
  });
});

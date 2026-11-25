import assert from "node:assert/strict";
import test from "node:test";
import { inspect } from "node:util";
import { AxiosError } from "axios";
import {
  apiErrorDiagnostics,
  readApiJson,
  requireApiOk,
  toApiRequestError,
} from "./apiErrors";

const fixture = "offline-fixture-marker";

test("keeps allowlisted transport codes and drops upstream details", () => {
  for (const code of ["ECONNABORTED", "ETIMEDOUT", "ECONNREFUSED", "ERR_NETWORK"]) {
    const upstream = new AxiosError(fixture, code);
    const error = toApiRequestError(upstream);
    assert.deepEqual(apiErrorDiagnostics(error), { code, status: undefined });
    assert.equal(error.message, "Sirius API request failed");
    assert.doesNotMatch(inspect(error), /offline-fixture-marker/);
  }
});

test("keeps an HTTP status and discards unrecognized codes and nested causes", () => {
  const upstream = Object.assign(new AxiosError(fixture, fixture), {
    cause: new Error(fixture),
    config: { headers: { "x-api-key": fixture } },
    request: { headers: { "X-API-Key": fixture } },
    response: { status: 503, data: { error: fixture } },
  });
  const error = toApiRequestError(upstream);
  assert.deepEqual(apiErrorDiagnostics(error), { code: "HTTP_ERROR", status: 503 });
  assert.equal(error.message, "Sirius API request failed (HTTP 503)");
  assert.doesNotMatch(inspect(error), /offline-fixture-marker/);
});

test("keeps a recognized native fetch cause code without retaining the cause", () => {
  const cause = Object.assign(new Error(fixture), { code: "UND_ERR_CONNECT_TIMEOUT" });
  const error = toApiRequestError(new TypeError(fixture, { cause }));
  assert.deepEqual(apiErrorDiagnostics(error), {
    code: "UND_ERR_CONNECT_TIMEOUT",
    status: undefined,
  });
  assert.doesNotMatch(inspect(error), /offline-fixture-marker/);
});

test("HTTP failures and invalid JSON are safe for caller handling", async () => {
  const response = new Response(fixture, { status: 403, statusText: fixture });
  assert.throws(
    () => requireApiOk(response, "Failed to load"),
    (error: unknown) => {
      assert.deepEqual(apiErrorDiagnostics(error), {
        code: "HTTP_ERROR",
        status: 403,
      });
      assert.ok(error instanceof Error);
      assert.equal(error.message, "Failed to load (HTTP 403)");
      assert.doesNotMatch(inspect(error), /offline-fixture-marker/);
      return true;
    },
  );

  await assert.rejects(readApiJson(new Response(fixture)), (error: unknown) => {
    assert.deepEqual(apiErrorDiagnostics(error), {
      code: "INVALID_UPSTREAM_RESPONSE",
      status: 200,
    });
    assert.doesNotMatch(inspect(error), /offline-fixture-marker/);
    return true;
  });
});

test("successful JSON responses retain their original data", async () => {
  const payload = { status: "available" };
  const response = new Response(JSON.stringify(payload));
  assert.doesNotThrow(() => requireApiOk(response, "Failed to load"));
  assert.deepEqual(await readApiJson(response), payload);
});

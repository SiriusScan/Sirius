/**
 * Zero-overlay baseline: a Community build must be unaffected by the existence
 * of the extension surface. Run by `scripts/contract-harness.mjs` before any
 * overlay is applied.
 */
import assert from "node:assert/strict";
import { appRouter } from "~/server/api/root";
import { communityServerExtension, serverExtensionRegistry } from "..";
import { registeredServerExtensions } from "../registered";
import { registeredServerRouters } from "../registered-routers";

assert.deepEqual(
  registeredServerExtensions,
  [],
  "Community must ship no registered server extensions",
);
assert.deepEqual(
  Object.keys(registeredServerRouters),
  [],
  "Community must ship no registered server routers",
);

const composed = [
  ...new Set(
    Object.keys(appRouter._def.procedures).map((path) => path.split(".")[0]),
  ),
].sort();
const declared = (communityServerExtension.routerNamespaces ?? [])
  .map((entry) => entry.namespace)
  .sort();

assert.deepEqual(
  composed,
  declared,
  "the Community router must expose exactly the namespaces Community declares",
);
assert.equal(
  serverExtensionRegistry.principalResolver.id,
  "community",
  "Community must fall back to the Community principal resolver",
);
assert.deepEqual(
  serverExtensionRegistry.sessionEnrichers,
  [],
  "Community must register no session enrichers",
);

console.log(
  `Community baseline: ${composed.length} namespaces, resolver ${serverExtensionRegistry.principalResolver.id}, no overlays`,
);
process.exit(0);

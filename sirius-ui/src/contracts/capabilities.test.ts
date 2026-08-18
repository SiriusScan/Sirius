import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  COMMUNITY_CAPABILITIES,
  anonymousPrincipal,
  communityPrincipal,
  hasRequiredCapabilities,
  missingCapabilities,
} from "./capabilities";

const EDITION_BOUNDARY = path.join(
  __dirname,
  "../../../documentation/product/edition-boundary.yaml",
);

/**
 * Reads the community capability names out of the edition boundary file.
 *
 * The file is a flat two-level map, so this stays a deliberately small reader
 * rather than pulling a YAML parser into the UI dependency tree.
 */
function communityCapabilitiesFromEditionBoundary(): readonly string[] {
  const lines = readFileSync(EDITION_BOUNDARY, "utf8").split("\n");
  const capabilities: string[] = [];
  let inCapabilities = false;
  let currentCapability: string | null = null;

  for (const line of lines) {
    if (/^capabilities:\s*$/.test(line)) {
      inCapabilities = true;
      continue;
    }

    if (!inCapabilities) {
      continue;
    }

    if (/^\S/.test(line)) {
      break;
    }

    const capabilityMatch = /^ {2}([A-Za-z0-9_.]+):\s*$/.exec(line);
    if (capabilityMatch) {
      currentCapability = capabilityMatch[1] ?? null;
      continue;
    }

    if (
      currentCapability !== null &&
      /^ {4}edition:\s*community\s*$/.test(line)
    ) {
      capabilities.push(currentCapability);
      currentCapability = null;
    }
  }

  return capabilities;
}

const documented = communityCapabilitiesFromEditionBoundary();

assert.ok(
  documented.length > 0,
  "failed to read community capabilities from the edition boundary file",
);
assert.deepEqual(
  [...COMMUNITY_CAPABILITIES].sort(),
  [...documented].sort(),
  "COMMUNITY_CAPABILITIES has drifted from documentation/product/edition-boundary.yaml",
);
assert.deepEqual(communityPrincipal.capabilities, COMMUNITY_CAPABILITIES);

assert.deepEqual(anonymousPrincipal.capabilities, []);
assert.equal(hasRequiredCapabilities(anonymousPrincipal.capabilities, []), true);
assert.equal(
  hasRequiredCapabilities(anonymousPrincipal.capabilities, ["api.hosts"]),
  false,
);
assert.deepEqual(missingCapabilities(null, ["api.hosts", "api.events"]), [
  "api.hosts",
  "api.events",
]);
assert.deepEqual(missingCapabilities(communityPrincipal, ["api.hosts"]), []);
assert.deepEqual(
  missingCapabilities(communityPrincipal, [
    "api.hosts",
    "reporting.enterprise",
  ]),
  ["reporting.enterprise"],
);

console.log("Capability contract tests passed");

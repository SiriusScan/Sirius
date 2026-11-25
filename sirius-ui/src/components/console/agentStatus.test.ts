import assert from "node:assert/strict";
import {
  AGENT_DOWNLOAD_URL,
  agentCounterDetail,
  agentCounterLabel,
  agentCounterTone,
  countAgents,
  formatLastSeen,
  getAgentFreshness,
} from "./agentStatus";

const NOW = Date.parse("2026-11-22T12:00:00Z");
const ago = (minutes: number) => new Date(NOW - minutes * 60_000).toISOString();

// Freshness: status first, then heartbeat age.
assert.equal(getAgentFreshness({ status: "online", lastSeen: ago(1) }, NOW), "online");
assert.equal(getAgentFreshness({ status: "ONLINE", lastSeen: ago(1) }, NOW), "online");
assert.equal(getAgentFreshness({ status: "online", lastSeen: null }, NOW), "online");
assert.equal(getAgentFreshness({ status: "online", lastSeen: "not a date" }, NOW), "online");
assert.equal(getAgentFreshness({ status: "online", lastSeen: ago(10) }, NOW), "stale");
assert.equal(getAgentFreshness({ status: "online", lastSeen: ago(31) }, NOW), "offline");
assert.equal(getAgentFreshness({ status: "offline", lastSeen: ago(0) }, NOW), "offline");
assert.equal(getAgentFreshness({ status: null }, NOW), "offline");
assert.equal(getAgentFreshness({}, NOW), "offline");

// Counts.
const none = countAgents([], NOW);
assert.deepEqual(none, { total: 0, online: 0, stale: 0, offline: 0 });
const mixed = countAgents(
  [
    { status: "online", lastSeen: ago(1) },
    { status: "online", lastSeen: ago(1) },
    { status: "online", lastSeen: ago(10) },
    { status: "offline" },
  ],
  NOW,
);
assert.deepEqual(mixed, { total: 4, online: 2, stale: 1, offline: 1 });

// One counter, plain copy.
assert.equal(agentCounterLabel(none), "0 agents online");
assert.equal(agentCounterLabel({ total: 1, online: 1, stale: 0, offline: 0 }), "1 agent online");
assert.equal(agentCounterLabel({ total: 3, online: 3, stale: 0, offline: 0 }), "3 agents online");
assert.equal(agentCounterLabel(mixed), "2 of 4 agents online");
assert.equal(agentCounterLabel({ total: 1, online: 0, stale: 0, offline: 1 }), "0 of 1 agent online");

assert.equal(agentCounterDetail(none), "No agents have connected yet");
assert.equal(agentCounterDetail(mixed), "2 online, 1 stale, 1 offline");
assert.equal(agentCounterDetail({ total: 2, online: 2, stale: 0, offline: 0 }), "2 online");

assert.equal(agentCounterTone(none), "none");
assert.equal(agentCounterTone(mixed), "online");
assert.equal(agentCounterTone({ total: 2, online: 0, stale: 1, offline: 1 }), "away");

// Last seen: relative for a day, then the shared date format.
assert.equal(formatLastSeen(null, NOW), "unknown");
assert.equal(formatLastSeen("", NOW), "unknown");
assert.equal(formatLastSeen("garbage", NOW), "unknown");
assert.equal(formatLastSeen("0001-01-01T00:00:00Z", NOW), "unknown");
assert.equal(formatLastSeen(new Date(NOW - 42_000).toISOString(), NOW), "42s ago");
assert.equal(formatLastSeen(new Date(NOW + 5_000).toISOString(), NOW), "0s ago");
assert.equal(formatLastSeen(ago(5), NOW), "5m ago");
assert.equal(formatLastSeen(ago(180), NOW), "3h ago");
const older = formatLastSeen(ago(3 * 24 * 60), NOW);
assert.match(older, /^Nov (19|20), \d{1,2}:\d{2} (AM|PM)$/); // local zone

// Same download page as the Scanner's "Get the agent".
assert.equal(AGENT_DOWNLOAD_URL, "https://sirius.opensecurity.com/get-started/downloads");

console.log("agentStatus: all cases pass");

import assert from "node:assert/strict";
import {
  DEFAULT_CONSOLE_VIEW,
  consoleViewHistoryState,
  readConsoleView,
  resolveConsoleView,
  withConsoleView,
  type ConsoleViewInput,
} from "./consoleView";

const BUILT_INS = ["terminal", "history", "agent"] as const;
const CHAT = { id: "ext.chat", initial: true };

function resolve(overrides: Partial<ConsoleViewInput>): string | null {
  return resolveConsoleView({
    requested: undefined,
    builtIns: BUILT_INS,
    registered: [],
    allowed: [],
    routerReady: true,
    capabilitiesLoading: false,
    ...overrides,
  });
}

// Community with no contributions: terminal by default, built-ins from the URL.
assert.equal(DEFAULT_CONSOLE_VIEW, "terminal");
assert.equal(resolve({}), "terminal");
assert.equal(resolve({ requested: "agent" }), "agent");
assert.equal(resolve({ requested: "history" }), "history");
assert.equal(resolve({ requested: "terminal" }), "terminal");
assert.equal(resolve({ requested: ["agent", "history"] }), "agent");
assert.equal(resolve({ requested: "" }), "terminal");
assert.equal(resolve({ requested: "bogus" }), "terminal");
// A contributed id means nothing without the contribution.
assert.equal(resolve({ requested: "ext.chat" }), "terminal");

// An initial extension view opens first; every mode is addressable.
const extended = { registered: [CHAT], allowed: ["ext.chat"] };
assert.equal(resolve(extended), "ext.chat");
assert.equal(resolve({ ...extended, requested: "ext.chat" }), "ext.chat");
assert.equal(resolve({ ...extended, requested: "terminal" }), "terminal");
assert.equal(resolve({ ...extended, requested: "agent" }), "agent");
assert.equal(resolve({ ...extended, requested: "bogus" }), "ext.chat");

// A viewer without the contributed view's capability falls back to terminal.
const denied = { registered: [CHAT], allowed: [] };
assert.equal(resolve(denied), "terminal");
assert.equal(resolve({ ...denied, requested: "ext.chat" }), "terminal");
assert.equal(resolve({ ...denied, requested: "history" }), "history");

// Undecided while the URL or the capabilities that filter views are loading.
assert.equal(resolve({ routerReady: false }), null);
assert.equal(resolve({ ...extended, routerReady: false, requested: "agent" }), null);
assert.equal(resolve({ ...denied, capabilitiesLoading: true }), null);
assert.equal(resolve({ ...denied, capabilitiesLoading: true, requested: "ext.chat" }), null);
// Built-ins never wait on capabilities.
assert.equal(resolve({ ...denied, capabilitiesLoading: true, requested: "agent" }), "agent");
// Without contributions nothing waits on capabilities.
assert.equal(resolve({ capabilitiesLoading: true }), "terminal");
// A non-initial contribution doesn't hold up the default.
assert.equal(
  resolve({ registered: [{ id: "x.notes" }], allowed: [], capabilitiesLoading: true }),
  "terminal",
);

// Reading ?view= from what Next reports and what the address bar holds.
assert.equal(readConsoleView("/terminal?view=agent"), "agent");
assert.equal(readConsoleView("/terminal?c=1&view=ext.chat#x"), "ext.chat");
assert.equal(readConsoleView("?view=history"), "history");
assert.equal(readConsoleView("/terminal"), undefined);
assert.equal(readConsoleView("/terminal?view="), undefined);
assert.equal(readConsoleView("/terminal#view=agent"), undefined);

// The new search keeps what views wrote into the address bar, with view first.
assert.equal(withConsoleView("", "agent"), "?view=agent");
assert.equal(withConsoleView("?view=ext.chat&c=abc", "terminal"), "?view=terminal&c=abc");
assert.equal(withConsoleView("?c=abc&view=history", "agent"), "?view=agent&c=abc");
assert.equal(withConsoleView("?t=1&t=2", "agent"), "?view=agent&t=1&t=2");
assert.equal(withConsoleView("?view=a&view=b", "ext.chat"), "?view=ext.chat");
assert.equal(readConsoleView(withConsoleView("?c=1", "ext.chat")), "ext.chat");

// History entries keep Next's shape so Back/Forward route correctly.
const kept = consoleViewHistoryState(
  { __N: true, url: "/terminal", as: "/terminal", options: { locale: undefined }, key: "k1" },
  "/terminal?view=agent",
);
assert.deepEqual(kept, {
  __N: true,
  url: "/terminal?view=agent",
  as: "/terminal?view=agent",
  options: { locale: undefined },
  key: "k1",
});
const fresh = consoleViewHistoryState(null, "/terminal?view=history");
assert.equal(fresh.__N, true);
assert.equal(fresh.as, "/terminal?view=history");
assert.equal(fresh.url, "/terminal?view=history");
assert.deepEqual(fresh.options, {});
assert.equal(typeof fresh.key, "string");

console.log("consoleView: all cases pass");

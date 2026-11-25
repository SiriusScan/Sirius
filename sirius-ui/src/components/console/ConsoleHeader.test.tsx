import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ConsoleHeader } from "./ConsoleHeader";
import type { SiriusConsoleView } from "~/ui/extensions/types";

const Icon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} />
);
const view = (
  id: string,
  label: string,
  placement?: "start" | "end",
): SiriusConsoleView => ({ id, label, icon: Icon, component: () => null, placement });

function render(props: Partial<React.ComponentProps<typeof ConsoleHeader>>) {
  return renderToStaticMarkup(
    <ConsoleHeader
      activeView="terminal"
      onViewChange={() => undefined}
      agentCounts={null}
      {...props}
    />,
  );
}

/** The <nav> that holds the view tabs, as browser tests find it. */
function tabNames(html: string): string[] {
  const nav = /<nav[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? "";
  return [...nav.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) =>
    m[1]!.replace(/<[^>]+>/g, "").trim(),
  );
}

// Community without contributions: exactly Terminal, History, Agent.
const community = render({});
assert.deepEqual(tabNames(community), ["Terminal", "History", "Agent"]);
// Plain buttons (browser tests read them with getByRole("button")).
assert.doesNotMatch(community, /role="tab/);
assert.match(community, /aria-current="page"[^>]*>[\s\S]*?Terminal<\/button>/);
assert.match(community, /<h1[^>]*>Operator Console<\/h1>/);

// An extension view placed at the start reads Chat, Terminal, History, Agent.
const extended = render({ activeView: "ext.chat", extraViews: [view("ext.chat", "Chat", "start")] });
assert.deepEqual(tabNames(extended), ["Chat", "Terminal", "History", "Agent"]);
assert.match(extended, /aria-current="page"[^>]*>[\s\S]*?Chat<\/button>/);
assert.equal((extended.match(/aria-current=/g) ?? []).length, 1);

// End placement is the default.
assert.deepEqual(tabNames(render({ extraViews: [view("x.notes", "Notes")] })), [
  "Terminal",
  "History",
  "Agent",
  "Notes",
]);

// Undecided view: no tab is current.
assert.equal((render({ activeView: null }).match(/aria-current=/g) ?? []).length, 0);

// One agent counter, beside the title; hidden while unknown.
const counted = render({ agentCounts: { total: 3, online: 2, stale: 1, offline: 0 } });
assert.equal((counted.match(/data-agent-counter/g) ?? []).length, 1);
assert.match(counted, />2 of 3 agents online<\/span>/);
assert.match(counted, /title="2 online, 1 stale"/);
assert.match(render({ agentCounts: { total: 0, online: 0, stale: 0, offline: 0 } }), />0 agents online</);
assert.doesNotMatch(community, /data-agent-counter/);
// The counter is not a tab.
assert.deepEqual(tabNames(counted), ["Terminal", "History", "Agent"]);

console.log("ConsoleHeader: all cases pass");

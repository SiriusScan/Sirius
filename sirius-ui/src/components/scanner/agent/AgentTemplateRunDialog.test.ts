import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import test from "node:test";
import ts from "typescript";

// A small hook harness executes the actual component and its event handlers.
// Query/mutation hooks and dialog primitives are isolated, with no browser or API.
interface Element {
  type: string;
  props: Record<string, unknown> & { children: unknown[] };
}
const source = ts.transpileModule(
  readFileSync(
    new URL("./AgentTemplateRunDialog.tsx", import.meta.url),
    "utf8"
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }
).outputText;

function fixture() {
  const states: unknown[] = [];
  let cursor = 0;
  let closes = 0;
  const sent: { templateId: string; agentId: string }[] = [];
  const alerts: string[] = [];
  const agents = {
    data: [
      { id: "agent-one", host: null },
      { id: "agent-two", host: null },
    ],
    isLoading: false,
    isError: false,
  };
  const hooks = { dispatch: () => Promise.resolve<unknown>({}) };
  const mutation = {
    isLoading: false,
    mutateAsync: async (input: { templateId: string; agentId: string }) => {
      sent.push(input);
      mutation.isLoading = true;
      try {
        return await hooks.dispatch();
      } finally {
        mutation.isLoading = false;
      }
    },
  };
  const React = {
    createElement: (
      type: string,
      props: object | null,
      ...children: unknown[]
    ): Element => ({ type, props: { ...props, children } }),
    useState: (initial: unknown) => {
      const i = cursor++;
      if (!(i in states)) states[i] = initial;
      return [
        states[i],
        (value: unknown) => {
          states[i] = value;
        },
      ];
    },
    useRef: (initial: unknown) => {
      const i = cursor++;
      if (!(i in states)) states[i] = { current: initial };
      return states[i];
    },
  };
  const exports: { AgentTemplateRunDialog?: (props: object) => Element } = {};
  new Script(source, {
    filename: "AgentTemplateRunDialog.tsx",
  }).runInNewContext({
    exports,
    Error,
    alert: (message: string) => alerts.push(message),
    require: (name: string): unknown => {
      if (name === "react")
        return { __esModule: true, default: React, ...React };
      if (name === "~/utils/api")
        return {
          api: {
            agent: { listAgentsWithHosts: { useQuery: () => agents } },
            agentTemplates: { testTemplate: { useMutation: () => mutation } },
          },
        };
      if (name === "~/components/lib/ui/button") return { Button: "Button" };
      if (name === "~/components/lib/ui/dialog")
        return Object.fromEntries(
          [
            "Dialog",
            "DialogContent",
            "DialogDescription",
            "DialogFooter",
            "DialogHeader",
            "DialogTitle",
          ].map((key) => [key, key])
        );
      throw new Error(`Unexpected production dependency: ${name}`);
    },
  });
  assert.ok(exports.AgentTemplateRunDialog);
  const render = () => {
    cursor = 0;
    return exports.AgentTemplateRunDialog!({
      template: { id: "fixture-template", name: "Fixture" },
      onClose: () => {
        closes++;
      },
    });
  };
  return {
    render,
    sent,
    alerts,
    agents,
    mutation,
    hooks,
    closes: () => closes,
  };
}

function elements(root: unknown): Element[] {
  if (Array.isArray(root)) return root.flatMap(elements);
  if (!root || typeof root !== "object" || !("props" in root)) return [];
  const node = root as Element;
  return [node, ...elements(node.props.children)];
}
function select(root: Element, agentId: string) {
  const node = elements(root).find((node) => node.type === "select");
  assert.ok(node);
  (node.props.onChange as (event: unknown) => void)({
    target: { value: agentId },
  });
}
function runButton(root: Element) {
  const button = elements(root).filter((node) => node.type === "Button")[1];
  assert.ok(button);
  return button;
}
function click(button: Element): Promise<void> {
  (button.props.onClick as () => void)();
  return new Promise((resolve) => setImmediate(resolve));
}

void test("Run requires explicit selection and sends only that agent once", async () => {
  const f = fixture();
  let root = f.render();
  assert.equal(runButton(root).props.disabled, true);
  await click(runButton(root));
  assert.equal(f.sent.length, 0);
  select(root, "agent-two");
  root = f.render();
  assert.equal(runButton(root).props.disabled, false);
  let finish!: () => void;
  f.hooks.dispatch = () =>
    new Promise<void>((resolve) => {
      finish = resolve;
    });
  const first = click(runButton(root));
  await click(runButton(root));
  assert.equal(f.sent.length, 1);
  assert.equal(f.sent[0]?.agentId, "agent-two");
  assert.equal(f.sent[0]?.templateId, "fixture-template");
  assert.equal(runButton(f.render()).props.disabled, true);
  finish();
  await new Promise((resolve) => setImmediate(resolve));
  await first;
  assert.equal(f.closes(), 1);
  assert.match(f.alerts[0] ?? "", /agent-two/);
  assert.doesNotMatch(f.alerts[0] ?? "", /all agents/);
});

void test("Cancel and dialog dismissal never dispatch", async () => {
  const f = fixture();
  const root = f.render();
  const cancel = elements(root).find((node) => node.type === "Button");
  assert.ok(cancel);
  await click(cancel);
  (root.props.onOpenChange as (open: boolean) => void)(false);
  assert.equal(f.sent.length, 0);
  assert.equal(f.closes(), 2);
  assert.equal(runButton(fixture().render()).props.disabled, true);
});

void test("No agents, query failure, and a disconnected selection disable dispatch", async () => {
  for (const failure of ["empty", "query", "disconnected"] as const) {
    const f = fixture();
    select(f.render(), "agent-two");
    if (failure === "query") f.agents.isError = true;
    else
      f.agents.data =
        failure === "empty" ? [] : [{ id: "agent-one", host: null }];
    const root = f.render();
    assert.equal(runButton(root).props.disabled, true);
    await click(runButton(root));
    assert.equal(f.sent.length, 0);
  }
});

void test("A failed dispatch keeps the dialog open, shows the error, and permits retry", async () => {
  const f = fixture();
  select(f.render(), "agent-one");
  f.hooks.dispatch = () =>
    Promise.reject(new Error("Requested agent is not connected"));
  await click(runButton(f.render()));
  const root = f.render();
  assert.equal(f.closes(), 0);
  assert.equal(f.alerts.length, 0);
  assert.ok(
    elements(root).some(
      (node) =>
        node.props.role === "alert" &&
        node.props.children.includes("Requested agent is not connected")
    )
  );
  f.hooks.dispatch = () => Promise.resolve({});
  await click(runButton(root));
  assert.equal(f.sent.length, 2);
  assert.equal(f.closes(), 1);
});

import { safeErrorForLogging } from "~/server/safeErrorForLogging";
import assert from "node:assert/strict";
import amqp from "amqplib";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import test from "node:test";
import { initTRPC } from "@trpc/server";
import ts from "typescript";
import { z } from "zod";

const source = ts.transpileModule(
  readFileSync(new URL("./queue.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }
).outputText;
interface Request {
  correlationId: string;
  responseQueue: string;
  noReply: boolean;
  command?: string;
  action?: string;
}
interface Delivery {
  content: Buffer;
}
function fixture() {
  const requests: Request[] = [];
  const sharedReplies = ['{"success":true,"message":"stale template ACK"}'];
  const consumers = new Map<string, (message: Delivery | null) => void>();
  const timers = new Set<() => void>();
  const declarations: { name: string; options: unknown }[] = [];
  const channels: FakeChannel[] = [];
  const connections: EventEmitter[] = [];
  let closedConnections = 0;
  const hooks: {
    publish?: (request: Request) => void;
    declare?: (name: string) => void;
    consume?: () => void | Promise<void>;
  } = {};
  class FakeChannel extends EventEmitter {
    owned = new Set<string>();
    closed = false;
    acknowledgements = 0;
    assertQueue(name: string, options: unknown) {
      hooks.declare?.(name);
      declarations.push({ name, options });
      if (name.startsWith("agent_response.rpc.")) this.owned.add(name);
      return Promise.resolve({ queue: name });
    }
    consume(name: string, callback: (message: Delivery | null) => void) {
      assert.ok(
        name.startsWith("agent_response.rpc."),
        "Never consume shared ACKs"
      );
      const ready = hooks.consume?.();
      consumers.set(name, callback);
      return Promise.resolve(ready).then(() => ({ consumerTag: name }));
    }
    sendToQueue(name: string, content: Buffer) {
      assert.equal(name, "agent_commands");
      const request = JSON.parse(content.toString()) as Request;
      assert.ok(
        consumers.has(request.responseQueue),
        "Reply consumer must exist before publish"
      );
      requests.push(request);
      hooks.publish?.(request);
      return true;
    }
    ack() {
      this.acknowledgements++;
    }
    close() {
      this.closed = true;
      for (const queue of this.owned) consumers.delete(queue);
      this.emit("close");
      return Promise.resolve();
    }
  }
  const t = initTRPC.create();
  const exports: {
    requestAgentResponse?: (
      message: Record<string, unknown>
    ) => Promise<string>;
  } = {};
  new Script(source, { filename: "queue.ts" }).runInNewContext({
    exports,
    Buffer,
    Error,
    console,
    process: { env: {} },
    setTimeout: (run: () => void) => {
      timers.add(run);
      return run;
    },
    clearTimeout: (run: () => void) => timers.delete(run),
    require: (name: string): unknown => {
      if (name === "~/server/safeErrorForLogging") return { safeErrorForLogging };
      if (name === "node:crypto") return { randomUUID };
      if (name === "zod") return { z };
      if (name === "~/server/api/trpc")
        return { createTRPCRouter: t.router, protectedProcedure: t.procedure };
      if (name === "amqplib")
        return {
          default: {
            connect: () => {
              const connection = new EventEmitter();
              connections.push(connection);
              return Promise.resolve(
                Object.assign(connection, {
                  createChannel: () => {
                    const channel = new FakeChannel();
                    channels.push(channel);
                    return Promise.resolve(channel);
                  },
                  close: () => {
                    closedConnections++;
                    return Promise.resolve();
                  },
                })
              );
            },
          },
        };
      throw new Error(`Unexpected production dependency: ${name}`);
    },
  });
  assert.ok(exports.requestAgentResponse);
  const deliver = (request: Request, envelope: unknown) =>
    consumers.get(request.responseQueue)?.({
      content: Buffer.from(JSON.stringify(envelope)),
    });
  return {
    run: exports.requestAgentResponse,
    requests,
    sharedReplies,
    hooks,
    declarations,
    timers,
    channels,
    connections,
    consumers,
    closedConnections: () => closedConnections,
    reply: (request: Request, response: unknown) =>
      deliver(request, { correlationId: request.correlationId, response }),
    deliver,
  };
}
async function turn() {
  await new Promise<void>((resolve) => setImmediate(resolve));
}

void test("stale template ACK stays unread while scan receives its own rejection", async () => {
  const f = fixture();
  f.hooks.publish = (request) =>
    f.reply(request, { success: false, error: "Agent offline" });
  const response = JSON.parse(await f.run({ command: "scan" })) as {
    success: boolean;
    error: string;
  };
  assert.deepEqual(response, { success: false, error: "Agent offline" });
  assert.equal(f.sharedReplies.length, 1);
  assert.equal(f.requests[0]?.noReply, false);
  assert.equal(f.closedConnections(), 1);
  assert.equal(f.consumers.size, 0);
  assert.equal(f.timers.size, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(f.declarations[1]?.options)), {
    durable: false,
    autoDelete: true,
    exclusive: true,
  });
});

void test("concurrent commands receive only their own out-of-order ACKs", async () => {
  const f = fixture();
  const first = f.run({ command: "first" });
  const second = f.run({ command: "second" });
  await turn();
  assert.equal(f.requests.length, 2);
  const [a, b] = f.requests;
  assert.ok(a && b);
  assert.notEqual(a.responseQueue, b.responseQueue);
  assert.notEqual(a.correlationId, b.correlationId);
  f.reply(b, { success: false, error: "second failed" });
  f.reply(a, { success: true });
  assert.deepEqual(JSON.parse(await first), { success: true });
  assert.deepEqual(JSON.parse(await second), {
    success: false,
    error: "second failed",
  });
  assert.equal(f.closedConnections(), 2);
});

void test("foreign or malformed responses cannot complete a private request", async () => {
  const f = fixture();
  let settled = false;
  const result = f.run({ command: "scan" }).then((value) => {
    settled = true;
    return value;
  });
  await turn();
  const request = f.requests[0]!;
  f.deliver(request, { correlationId: "wrong", response: { success: true } });
  f.deliver(request, ["agent-a"]);
  f.deliver(request, { success: true });
  await turn();
  assert.equal(settled, false);
  f.reply(request, { success: false, error: "right response" });
  assert.deepEqual(JSON.parse(await result), {
    success: false,
    error: "right response",
  });
});

void test("agent-list arrays preserve the legacy payload inside the correlated wrapper", async () => {
  const f = fixture();
  f.hooks.publish = (request) => f.reply(request, ["a", "b"]);
  assert.deepEqual(JSON.parse(await f.run({ action: "list_agents" })), [
    "a",
    "b",
  ]);
});

void test("timeout removes private consumer and prevents stale reply reuse", async () => {
  const f = fixture();
  const pending = f.run({ command: "old" });
  const rejected = assert.rejects(pending, /acknowledgement timed out/);
  await turn();
  const old = f.requests[0]!;
  for (const timer of f.timers) timer();
  await rejected;
  assert.equal(f.consumers.size, 0);
  assert.equal(f.closedConnections(), 1);
  f.reply(old, { success: true });
  f.hooks.publish = (request) =>
    f.reply(request, { success: false, error: "new rejection" });
  assert.deepEqual(JSON.parse(await f.run({ command: "new" })), {
    success: false,
    error: "new rejection",
  });
  assert.notEqual(f.requests[0]?.responseQueue, f.requests[1]?.responseQueue);
});

void test("publish failure closes channel and connection without a fallback consumer", async () => {
  const f = fixture();
  f.hooks.publish = () => {
    throw new Error("Publish failed");
  };
  await assert.rejects(f.run({ command: "scan" }), /Publish failed/);
  assert.equal(f.closedConnections(), 1);
  assert.equal(f.consumers.size, 0);
  assert.equal(f.timers.size, 0);
});

void test("consumer cancellation rejects and cleans up", async () => {
  const f = fixture();
  f.hooks.publish = (request) => f.consumers.get(request.responseQueue)?.(null);
  await assert.rejects(f.run({ command: "scan" }), /consumer cancelled/);
  assert.equal(f.closedConnections(), 1);
  assert.equal(f.timers.size, 0);
});

void test("matching but invalid envelope rejects instead of treating missing payload as success", async () => {
  const f = fixture();
  f.hooks.publish = (request) =>
    f.deliver(request, { correlationId: request.correlationId });
  await assert.rejects(f.run({ command: "scan" }), /Invalid correlated/);
  assert.equal(f.closedConnections(), 1);
});

void test("queue setup failure closes resources before publication", async () => {
  const f = fixture();
  f.hooks.declare = (name) => {
    if (name.startsWith("agent_response.rpc."))
      throw new Error("Declare failed");
  };
  await assert.rejects(f.run({ command: "scan" }), /Declare failed/);
  assert.equal(f.requests.length, 0);
  assert.equal(f.closedConnections(), 1);
});

void test("timed-out consumer setup cannot publish a command later", async () => {
  const f = fixture();
  let ready!: () => void;
  f.hooks.consume = () =>
    new Promise<void>((resolve) => {
      ready = resolve;
    });
  const pending = f.run({ command: "never publish" });
  const rejected = assert.rejects(pending, /acknowledgement timed out/);
  await turn();
  for (const timer of f.timers) timer();
  await rejected;
  ready();
  await turn();
  assert.equal(f.requests.length, 0);
  assert.equal(f.closedConnections(), 1);
});

void test(
  "real broker routes concurrent private replies and deletes exclusive queues",
  {
    skip: process.env.SIRIUS_TEST_RABBITMQ !== "1",
  },
  async () => {
    const url =
      process.env.SIRIUS_TEST_RABBITMQ_URL ??
      "amqp://guest:guest@127.0.0.1:15673/";
    const commandQueue = `test.agent-rpc.${randomUUID()}`;
    const server = await amqp.connect(url);
    const channel = await server.createChannel();
    const observed: Request[] = [];
    try {
      await channel.assertQueue(commandQueue, {
        durable: false,
        autoDelete: false,
        exclusive: false,
      });
      await channel.consume(commandQueue, (message) => {
        if (!message) return;
        const request = JSON.parse(message.content.toString()) as Request;
        observed.push(request);
        channel.ack(message);
        if (observed.length !== 2) return;
        // Direct publishing from another connection must work without declaring
        // the requesting connection's exclusive reply queue. Reverse ACK order.
        for (const request of [...observed].reverse()) {
          channel.sendToQueue(
            request.responseQueue,
            Buffer.from(
              JSON.stringify({
                correlationId: request.correlationId,
                response: {
                  success: request.command === "accepted",
                  message: request.command,
                },
              })
            )
          );
        }
      });
      const t = initTRPC.create();
      const exports: {
        requestAgentResponse?: (
          message: Record<string, unknown>
        ) => Promise<string>;
      } = {};
      new Script(source, { filename: "queue.ts" }).runInNewContext({
        exports,
        Buffer,
        Error,
        console,
        setTimeout,
        clearTimeout,
        process: { env: { RABBITMQ_URL: url } },
        require: (name: string): unknown => {
          if (name === "~/server/safeErrorForLogging") return { safeErrorForLogging };
          if (name === "node:crypto") return { randomUUID };
          if (name === "zod") return { z };
          if (name === "~/server/api/trpc")
            return {
              createTRPCRouter: t.router,
              protectedProcedure: t.procedure,
            };
          if (name === "amqplib")
            return {
              default: {
                connect: async () => {
                  const client = await amqp.connect(url);
                  return {
                    on: (
                      event: string,
                      listener: (...args: unknown[]) => void
                    ) => client.on(event, listener),
                    close: () => client.close(),
                    createChannel: async () => {
                      const real = await client.createChannel();
                      // Only the command queue name is redirected. The real reply queue
                      // options, correlation, consume order and cleanup run unchanged.
                      // This test can NEVER publish to the live agent_commands queue.
                      return new Proxy(real, {
                        get: (target, property) => {
                          if (property === "assertQueue")
                            return (
                              name: string,
                              options: Parameters<typeof real.assertQueue>[1]
                            ) =>
                              real.assertQueue(
                                name === "agent_commands" ? commandQueue : name,
                                options
                              );
                          if (property === "sendToQueue")
                            return (name: string, content: Buffer) => {
                              assert.equal(name, "agent_commands");
                              return real.sendToQueue(commandQueue, content);
                            };
                          const value: unknown = Reflect.get(target, property);
                          return typeof value === "function"
                            ? (value.bind(real) as unknown)
                            : value;
                        },
                      });
                    },
                  };
                },
              },
            };
          throw new Error(`Unexpected production dependency: ${name}`);
        },
      });
      assert.ok(exports.requestAgentResponse);
      const [accepted, rejected] = await Promise.all([
        exports.requestAgentResponse({ command: "accepted" }),
        exports.requestAgentResponse({ command: "rejected" }),
      ]);
      assert.deepEqual(JSON.parse(accepted), {
        success: true,
        message: "accepted",
      });
      assert.deepEqual(JSON.parse(rejected), {
        success: false,
        message: "rejected",
      });
      assert.equal(observed.length, 2);
      for (const request of observed) {
        const probe = await server.createChannel();
        probe.on("error", () => undefined);
        await assert.rejects(
          probe.checkQueue(request.responseQueue),
          /NOT_FOUND/
        );
        try {
          await probe.close();
        } catch {
          /* checkQueue closes absent queue's channel */
        }
      }
    } finally {
      await channel.deleteQueue(commandQueue);
      await channel.close();
      await server.close();
    }
  }
);

void test("connection errors reject private requests without uncaught error events", async () => {
  const f = fixture();
  const pending = f.run({ command: "scan" });
  const rejected = assert.rejects(pending, /Socket lost/);
  await turn();
  f.connections[0]!.emit("error", new Error("Socket lost"));
  await rejected;
  assert.equal(f.closedConnections(), 1);
  assert.equal(f.consumers.size, 0);
  assert.equal(f.timers.size, 0);
});

void test("connection errors during queue setup are handled before any publication", async () => {
  const f = fixture();
  f.hooks.declare = () => {
    f.connections[0]!.emit("error", new Error("Setup socket lost"));
  };
  await assert.rejects(f.run({ command: "scan" }), /Setup socket lost/);
  assert.equal(f.requests.length, 0);
  assert.equal(f.closedConnections(), 1);
});

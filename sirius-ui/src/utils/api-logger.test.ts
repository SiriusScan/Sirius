import assert from "node:assert/strict";
import test from "node:test";
import { createTRPCProxyClient, type TRPCLink } from "@trpc/client";
import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { skipTerminalLogging } from "./api-logger";

test("terminal requests bypass the tRPC logger and keep their original payload", async () => {
  const t = initTRPC.create();
  const query = t.procedure.query(() => "");
  const fixture = t.router({
    terminal: t.router({
      executeCommand: t.procedure.input(z.string()).mutation(() => ""),
      getHistory: query,
    }),
    status: query,
  });
  const logged: string[] = [];
  const forwarded: { path: string; input: unknown }[] = [];
  const logger: TRPCLink<typeof fixture> = () => ({ op, next }) => {
    logged.push(op.path);
    return next(op);
  };
  const transport: TRPCLink<typeof fixture> = () => ({ op }) =>
    observable((observer) => {
      forwarded.push({ path: op.path, input: op.input });
      observer.next({ result: { data: "synthetic response" } });
      observer.complete();
    });
  const client = createTRPCProxyClient<typeof fixture>({
    links: [skipTerminalLogging(logger), transport],
  });

  assert.equal(
    await client.terminal.executeCommand.mutate("synthetic input"),
    "synthetic response",
  );
  assert.equal(await client.terminal.getHistory.query(), "synthetic response");
  assert.equal(await client.status.query(), "synthetic response");

  assert.deepEqual(forwarded, [
    { path: "terminal.executeCommand", input: "synthetic input" },
    { path: "terminal.getHistory", input: undefined },
    { path: "status", input: undefined },
  ]);
  assert.deepEqual(logged, ["status"]);
});

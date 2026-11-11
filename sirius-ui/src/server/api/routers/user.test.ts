import { safeErrorForLogging } from "~/server/safeErrorForLogging";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import test from "node:test";
import { initTRPC, TRPCError } from "@trpc/server";
import ts from "typescript";
import { z } from "zod";
import type { userRouter } from "./user";

// Exercise the real router with in-memory I/O only. Do not import production
// Prisma/auth connections or change any real account.
const source = ts.transpileModule(
  readFileSync(new URL("./user.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }
).outputText;

type Caller = ReturnType<typeof userRouter.createCaller>;
type Method = "getProfile" | "updateProfile" | "changePassword";
type Context = { session: { user?: { id?: unknown } } | null; prisma: object };
type StoredUser = {
  id: number;
  email: string;
  name: string;
  password: string;
  privateMetadata: string;
};
type DatabaseArgs = {
  where: { id: number };
  data?: { name?: string; password?: string };
  select?: Partial<Record<keyof StoredUser, boolean>>;
};

function fixture(session: Context["session"] = { user: { id: "7" } }) {
  const users = new Map<number, StoredUser>([
    [
      7,
      {
        id: 7,
        email: "self@example.test",
        name: "Self",
        password: "test-hash",
        privateMetadata: "private",
      },
    ],
    [
      8,
      {
        id: 8,
        email: "other@example.test",
        name: "Other",
        password: "other-test-hash",
        privateMetadata: "other-private",
      },
    ],
  ]);
  const calls: { method: "findUnique" | "update"; args: DatabaseArgs }[] = [];
  const comparisons: { password: string; hash: string }[] = [];
  const hashes: { password: string; rounds: number }[] = [];
  const selectUser = (args: DatabaseArgs) => {
    const user = users.get(args.where.id);
    if (!user) return null;
    if (!args.select) return { ...user };
    return Object.fromEntries(
      Object.entries(user).filter(
        ([key]) => args.select?.[key as keyof StoredUser]
      )
    );
  };
  const prisma = {
    user: {
      findUnique: (args: DatabaseArgs) => {
        calls.push({ method: "findUnique", args: structuredClone(args) });
        return Promise.resolve(selectUser(args));
      },
      update: (args: DatabaseArgs) => {
        calls.push({ method: "update", args: structuredClone(args) });
        const user = users.get(args.where.id);
        if (!user) throw new Error("User not found");
        Object.assign(user, args.data);
        return Promise.resolve(selectUser(args));
      },
    },
  };
  const t = initTRPC.context<Context>().create();
  // Preserve the protected-procedure authentication contract in this isolated
  // fixture. Session ID validation and ownership checks run in the real router.
  const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next();
  });
  const exports: { userRouter?: { createCaller: (ctx: Context) => Caller } } =
    {};
  new Script(source, { filename: "user.ts" }).runInNewContext({
    exports,
    Error,
    console: { error: () => undefined },
    require: (name: string): unknown => {
      if (name === "~/server/safeErrorForLogging") return { safeErrorForLogging };
      if (name === "zod") return { z };
      if (name === "@trpc/server") return { TRPCError };
      if (name === "~/server/api/trpc")
        return { createTRPCRouter: t.router, protectedProcedure };
      if (name === "bcrypt")
        return {
          compare: (password: string, hash: string) => {
            comparisons.push({ password, hash });
            return Promise.resolve(password === "correct-current-password");
          },
          hash: (password: string, rounds: number) => {
            hashes.push({ password, rounds });
            return Promise.resolve("new-test-hash");
          },
        };
      throw new Error(`Unexpected production dependency: ${name}`);
    },
  });
  assert.ok(exports.userRouter);
  return {
    caller: exports.userRouter.createCaller({ session, prisma }),
    users,
    calls,
    comparisons,
    hashes,
  };
}

function invoke(caller: Caller, method: Method, userId = 7) {
  if (method === "getProfile") return caller.getProfile({ userId });
  if (method === "updateProfile")
    return caller.updateProfile({ userId, displayName: "Updated" });
  return caller.changePassword({
    userId,
    currentPassword: "correct-current-password",
    newPassword: "new-test-password",
    confirmPassword: "new-test-password",
  });
}

for (const method of [
  "getProfile",
  "updateProfile",
  "changePassword",
] as const) {
  void test(`${method}: rejects another user's ID before database or password access`, async () => {
    const f = fixture();
    await assert.rejects(
      invoke(f.caller, method, 8),
      (error: unknown) =>
        error instanceof TRPCError && error.code === "FORBIDDEN"
    );
    assert.equal(f.calls.length, 0);
    assert.equal(f.comparisons.length, 0);
    assert.equal(f.hashes.length, 0);
    assert.equal(f.users.get(8)?.name, "Other");
  });

  for (const [label, session] of [
    ["no session", null],
    ["no user", {}],
    ["missing ID", { user: {} }],
    ...[
      null,
      true,
      7,
      "",
      " ",
      "invalid",
      "0",
      "-1",
      "7.5",
      "7junk",
      "7e0",
      "9007199254740993",
    ].map((id) => [`invalid ID ${String(id)}`, { user: { id } }] as const),
  ] as const) {
    void test(`${method}: fails closed for ${label}`, async () => {
      const f = fixture(session);
      await assert.rejects(
        invoke(f.caller, method),
        (error: unknown) =>
          error instanceof TRPCError && error.code === "UNAUTHORIZED"
      );
      assert.equal(f.calls.length, 0);
      assert.equal(f.comparisons.length, 0);
      assert.equal(f.hashes.length, 0);
    });
  }

  void test(`${method}: accepts the existing matching numeric or coerced-string payload`, async () => {
    for (const id of [7, "7" as unknown as number]) {
      const f = fixture();
      await invoke(f.caller, method, id);
      assert.ok(f.calls.length > 0);
      assert.ok(f.calls.every(({ args }) => args.where.id === 7));
      assert.equal(f.users.get(8)?.name, "Other");
      assert.equal(f.users.get(8)?.password, "other-test-hash");
    }
  });
}

void test("updateProfile: selects and returns only the safe profile fields", async () => {
  const f = fixture();
  const result = await f.caller.updateProfile({
    userId: 7,
    displayName: "Updated",
  });
  assert.equal(result.success, true);
  assert.deepEqual(result.user, {
    id: 7,
    email: "self@example.test",
    name: "Updated",
  });
  assert.deepEqual(f.calls, [
    {
      method: "update",
      args: {
        where: { id: 7 },
        data: { name: "Updated" },
        select: { id: true, email: true, name: true },
      },
    },
  ]);
  assert.equal(f.users.get(7)?.password, "test-hash");
});

void test("getProfile: selects and returns only the current user's safe profile fields", async () => {
  const f = fixture();
  assert.deepEqual(await f.caller.getProfile({ userId: 7 }), {
    id: 7,
    email: "self@example.test",
    name: "Self",
  });
  assert.deepEqual(f.calls[0]?.args.select, {
    id: true,
    email: true,
    name: true,
  });
});

void test("changePassword: verifies the current password before updating the current user", async () => {
  const f = fixture();
  assert.deepEqual(structuredClone(await invoke(f.caller, "changePassword")), {
    success: true,
  });
  assert.deepEqual(f.comparisons, [
    { password: "correct-current-password", hash: "test-hash" },
  ]);
  assert.deepEqual(f.hashes, [{ password: "new-test-password", rounds: 10 }]);
  assert.equal(f.users.get(7)?.password, "new-test-hash");
  assert.deepEqual(f.calls[0]?.args.select, { id: true, password: true });
  assert.deepEqual(f.calls[1]?.args, {
    where: { id: 7 },
    data: { password: "new-test-hash" },
  });
});

void test("changePassword: incorrect current password cannot trigger a write", async () => {
  const f = fixture();
  await assert.rejects(
    f.caller.changePassword({
      userId: 7,
      currentPassword: "incorrect",
      newPassword: "new-test-password",
      confirmPassword: "new-test-password",
    }),
    /Current password is incorrect/
  );
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0]?.method, "findUnique");
  assert.equal(f.hashes.length, 0);
  assert.equal(f.users.get(7)?.password, "test-hash");
});

void test("input validation still rejects blank names and mismatched passwords before I/O", async () => {
  const f = fixture();
  await assert.rejects(f.caller.updateProfile({ userId: 7, displayName: "" }));
  await assert.rejects(
    f.caller.changePassword({
      userId: 7,
      currentPassword: "correct-current-password",
      newPassword: "new-test-password",
      confirmPassword: "different",
    })
  );
  assert.equal(f.calls.length, 0);
});

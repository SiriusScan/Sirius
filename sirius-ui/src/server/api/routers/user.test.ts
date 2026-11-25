import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { Session } from "next-auth";
import type { SiriusPrincipal } from "~/contracts/capabilities";

test("local profile procedures enforce session policy and project safe fields", async (t) => {
  // Load the real tRPC middleware without reading a mounted service secret.
  delete process.env.SIRIUS_API_KEY_FILE;
  process.env.SKIP_ENV_VALIDATION = "1";
  process.env.NEXTAUTH_SECRET = "offline-profile-test";

  const [{ createTRPCRouter }, { userRouter }] = await Promise.all([
    import("../trpc"),
    import("./user"),
  ]);
  // Keep the real namespace because capability checks use the procedure path.
  const router = createTRPCRouter({ user: userRouter });
  const session: Session = {
    expires: "2099-01-01T00:00:00Z",
    user: { id: "17" },
  };
  const principal: SiriusPrincipal = {
    subjectId: "17",
    displayName: null,
    capabilities: ["auth.local_users"],
  };

  const safeProfile = {
    id: 17,
    email: "operator@example.invalid",
    name: "new-name",
  };
  let calls = 0;
  const prisma = {
    user: {
      findUnique(args: Prisma.UserFindUniqueArgs) {
        calls++;
        assert.deepEqual(args, {
          where: { id: 17 },
          select: { id: true, email: true, name: true },
        });
        return Promise.resolve(safeProfile);
      },
      update(args: Prisma.UserUpdateArgs) {
        calls++;
        assert.deepEqual(args, {
          where: { id: 17 },
          data: { name: "new-name" },
          select: { id: true, email: true, name: true },
        });
        return Promise.resolve(safeProfile);
      },
    },
  } as unknown as PrismaClient;
  const input = { userId: 17, displayName: "new-name" };

  await t.test("returns the safe profile and preserves the sign-in name field", async () => {
    const caller = router.createCaller({ session, principal, prisma });
    assert.deepEqual(await caller.user.updateProfile(input), {
      success: true,
      user: safeProfile,
    });
    assert.deepEqual(await caller.user.getProfile({ userId: 17 }), safeProfile);
    assert.equal(calls, 2);
  });

  calls = 0;
  const errorCode = (code: TRPCError["code"]) => (error: unknown) =>
    error instanceof TRPCError && error.code === code;

  await t.test("rejects unauthenticated callers before accessing the database", async () => {
    const caller = router.createCaller({ session: null, principal: null, prisma });
    await assert.rejects(caller.user.updateProfile(input), errorCode("UNAUTHORIZED"));
    assert.equal(calls, 0);
  });

  await t.test("requires the local-users capability before accessing the database", async () => {
    const denied = { ...principal, capabilities: [] };
    const caller = router.createCaller({ session, principal: denied, prisma });
    await assert.rejects(caller.user.updateProfile(input), errorCode("FORBIDDEN"));
    assert.equal(calls, 0);
  });

  await t.test("rejects a missing local account identity before accessing the database", async () => {
    const caller = router.createCaller({
      session: { ...session, user: { id: "" } },
      principal,
      prisma,
    });
    await assert.rejects(caller.user.updateProfile(input), errorCode("UNAUTHORIZED"));
    assert.equal(calls, 0);
  });

  await t.test("requires the submitted identity to match the session", async () => {
    const caller = router.createCaller({ session, principal, prisma });
    await assert.rejects(caller.user.getProfile({ userId: 18 }), errorCode("FORBIDDEN"));
    assert.equal(calls, 0);
  });
});

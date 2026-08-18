/**
 * Overlay proof: with the synthetic extension registered through the public
 * slots, prove composition, authorization, and fail-closed semantics.
 *
 * Run by `scripts/contract-harness.mjs` after it overlays the registration
 * modules. Procedures are called through a structural cast because the harness
 * sources must also compile in a Community checkout, where the synthetic
 * namespaces do not exist; the generated inference fixture covers the typed
 * view of the same procedures.
 */
import assert from "node:assert/strict";
import type { Session } from "next-auth";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import type { SiriusPrincipal } from "~/contracts/capabilities";
import {
  assertPrincipalCapabilities,
  communityServerExtension,
  createServerExtensionRegistry,
  resolvePrincipal,
  serverExtensionRegistry,
} from "..";
import {
  SYNTHETIC_ADMIN,
  SYNTHETIC_READ,
  administratorPrincipal,
  deactivatedPrincipal,
  failingResolver,
  memberPrincipal,
  syntheticExtension,
  syntheticResolver,
} from "./synthetic";

type Caller = Record<
  string,
  Record<string, (input?: unknown) => Promise<unknown>>
>;

function sessionFor(name: string): Session {
  return {
    expires: "2099-01-01T00:00:00.000Z",
    user: { id: name, name, email: `${name}@example.test` },
  } as Session;
}

function callerFor(principal: SiriusPrincipal | null, name: string): Caller {
  return appRouter.createCaller(
    createInnerTRPCContext({ session: sessionFor(name), principal }),
  ) as unknown as Caller;
}

async function denied(
  run: () => Promise<unknown>,
  label: string,
): Promise<void> {
  try {
    await run();
  } catch (error) {
    const { code, message } = error as { code?: string; message?: string };
    assert.equal(code, "FORBIDDEN", `${label}: expected FORBIDDEN, got ${code}`);
    assert.match(
      message ?? "",
      /Missing required capabilities/,
      `${label}: expected a capability message`,
    );
    return;
  }

  assert.fail(`${label}: expected the request to be denied`);
}

async function silenceErrors<T>(run: () => Promise<T>): Promise<T> {
  const original = console.error;
  console.error = () => undefined;

  try {
    return await run();
  } finally {
    console.error = original;
  }
}

const communityNamespaces = (
  communityServerExtension.routerNamespaces ?? []
).map((entry) => entry.namespace);

function assertOverlayComposes(): void {
  const composed = new Set(
    Object.keys(appRouter._def.procedures).map((path) => path.split(".")[0]),
  );

  assert.ok(composed.has("syntheticWidgets"), "overlay namespace must compose");
  assert.ok(
    composed.has("syntheticWidgetAdmin"),
    "second overlay namespace must compose",
  );
  assert.equal(
    composed.size,
    communityNamespaces.length + 2,
    "overlay must add namespaces without removing Community namespaces",
  );
  for (const namespace of communityNamespaces) {
    assert.ok(composed.has(namespace), `Community namespace ${namespace} lost`);
  }

  assert.equal(
    serverExtensionRegistry.principalResolver.id,
    "synthetic.identity",
    "the overlay resolver must replace the Community fallback",
  );
  assert.deepEqual(
    serverExtensionRegistry.getRequiredCapabilitiesForProcedure("host.getAllHosts"),
    ["api.hosts"],
    "Community capability requirements must be unchanged by the overlay",
  );
}

async function assertAuthorization(): Promise<void> {
  const administrator = await syntheticResolver.resolve({
    session: sessionFor("administrator"),
  });
  const member = await syntheticResolver.resolve({
    session: sessionFor("member"),
  });

  assert.equal(administrator?.subjectId, administratorPrincipal.subjectId);
  assert.equal(member?.subjectId, memberPrincipal.subjectId);
  assert.notEqual(
    administrator?.subjectId,
    member?.subjectId,
    "distinct subjects must resolve distinctly",
  );

  const administratorCaller = callerFor(administrator, "administrator");
  const memberCaller = callerFor(member, "member");

  assert.deepEqual(
    await administratorCaller.syntheticWidgetAdmin!.rename!({ name: "renamed" }),
    { subjectId: administratorPrincipal.subjectId, name: "renamed" },
    "an administrator must reach the administrator procedure",
  );
  assert.deepEqual(
    await memberCaller.syntheticWidgets!.list!({ limit: 3 }),
    { subjectId: memberPrincipal.subjectId, limit: 3 },
    "a member must reach the member procedure",
  );

  await denied(
    () => memberCaller.syntheticWidgetAdmin!.rename!({ name: "nope" }),
    "member calling an administrator procedure",
  );
}

async function assertFailClosed(): Promise<void> {
  const unresolved = await silenceErrors(() =>
    resolvePrincipal(failingResolver, { session: sessionFor("administrator") }),
  );
  assert.equal(unresolved, null, "a failing resolver must yield no principal");
  await denied(
    () => callerFor(unresolved, "administrator").syntheticWidgets!.list!({}),
    "resolver failure",
  );

  await denied(
    () => callerFor(deactivatedPrincipal, "deactivated").syntheticWidgets!.list!({}),
    "authenticated but inactive subject",
  );

  const unknownCapability: SiriusPrincipal = {
    subjectId: "subject:unknown",
    displayName: null,
    capabilities: ["synthetic.widgets.does_not_exist"],
  };
  await denied(
    () => callerFor(unknownCapability, "unknown").syntheticWidgets!.list!({}),
    "unknown capability",
  );

  assert.throws(
    () => assertPrincipalCapabilities(null, [SYNTHETIC_READ]),
    /Missing required capabilities/,
  );
  assert.doesNotThrow(() =>
    assertPrincipalCapabilities(administratorPrincipal, [
      SYNTHETIC_READ,
      SYNTHETIC_ADMIN,
    ]),
  );
}

function assertStartupFailures(): void {
  assert.throws(
    () =>
      createServerExtensionRegistry([
        communityServerExtension,
        syntheticExtension,
        {
          id: "synthetic.duplicate",
          version: "1.0.0",
          routerNamespaces: [{ namespace: "syntheticWidgets" }],
        },
      ]),
    /Duplicate router namespace: syntheticWidgets/,
    "a duplicate overlay namespace must fail at startup",
  );

  const registry = createServerExtensionRegistry([
    communityServerExtension,
    syntheticExtension,
  ]);
  const declared = registry.routerNamespaces.map((entry) => entry.namespace);

  assert.throws(
    () => registry.assertRouterNamespaces([...declared, "syntheticUndeclared"]),
    /is not declared by any server extension/,
    "a contributed router with no declaration must fail at startup",
  );
  assert.throws(
    () =>
      registry.assertRouterNamespaces(
        declared.filter((namespace) => namespace !== "syntheticWidgets"),
      ),
    /is missing from the application router/,
    "a declaration with no router must fail at startup",
  );
}

async function main(): Promise<void> {
  assertOverlayComposes();
  await assertAuthorization();
  await assertFailClosed();
  assertStartupFailures();

  console.log(
    "Synthetic overlay: composed, resolver replaced, authorization enforced, fail-closed verified",
  );
  process.exit(0);
}

void main().catch((cause: unknown) => {
  console.error(cause);
  process.exit(1);
});

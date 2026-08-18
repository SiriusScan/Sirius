import assert from "node:assert/strict";
import type { Session } from "next-auth";
import { COMMUNITY_CAPABILITIES } from "~/contracts/capabilities";
import { communityServerExtension } from "./community";
import {
  SiriusCapabilityError,
  applySessionEnrichers,
  assertPrincipalCapabilities,
  communityPrincipalResolver,
  resolvePrincipal,
} from "./principal";
import { createServerExtensionRegistry } from "./registry";
import type { SiriusPrincipalResolver, SiriusServerExtension } from "./types";

function sessionFor(user: Session["user"] | undefined): Session {
  return { expires: "2099-01-01T00:00:00.000Z", user } as Session;
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

const reporting: SiriusServerExtension = {
  id: "reporting.server",
  version: "1.0.0",
  routerNamespaces: [
    { namespace: "reports", requiredCapabilities: ["reporting.enterprise"] },
  ],
};

const registry = createServerExtensionRegistry([
  reporting,
  communityServerExtension,
]);

// Community sorts first because it declares an explicit order.
assert.deepEqual(
  registry.extensions.map((extension) => extension.id),
  ["community.server", "reporting.server"],
);

assert.deepEqual(registry.getRequiredCapabilitiesForNamespace("host"), [
  "api.hosts",
]);
assert.deepEqual(
  registry.getRequiredCapabilitiesForProcedure("host.getAllHosts"),
  ["api.hosts"],
);
assert.deepEqual(registry.getRequiredCapabilitiesForProcedure("reports.list"), [
  "reporting.enterprise",
]);
assert.deepEqual(registry.getRequiredCapabilitiesForProcedure("unknown.x"), []);
assert.equal(registry.principalResolver.id, "community");
assert.deepEqual(registry.sessionEnrichers, []);

// Every namespace Community declares must be reachable by the Community
// principal, otherwise the deployment would deny its own procedures.
for (const namespace of communityServerExtension.routerNamespaces ?? []) {
  for (const capability of namespace.requiredCapabilities ?? []) {
    assert.ok(
      COMMUNITY_CAPABILITIES.includes(capability),
      `Community namespace ${namespace.namespace} requires unknown capability ${capability}`,
    );
  }
}

assert.throws(
  () =>
    createServerExtensionRegistry([
      communityServerExtension,
      { ...reporting, id: "community.server" },
    ]),
  /Duplicate server extension id: community\.server/,
);

assert.throws(
  () =>
    createServerExtensionRegistry([
      communityServerExtension,
      {
        ...reporting,
        routerNamespaces: [{ namespace: "host" }],
      },
    ]),
  /Duplicate router namespace: host/,
);

assert.throws(
  () =>
    createServerExtensionRegistry([
      {
        ...reporting,
        principalResolver: {
          id: "reporting",
          resolve: () => Promise.resolve(null),
        },
      },
      {
        id: "identity.server",
        version: "1.0.0",
        principalResolver: {
          id: "identity",
          resolve: () => Promise.resolve(null),
        },
      },
    ]),
  /Only one principal resolver may be registered in a build/,
);

assert.throws(
  () =>
    createServerExtensionRegistry([
      {
        ...reporting,
        sessionEnrichers: [
          { id: "shared", enrich: (session) => session },
          { id: "shared", enrich: (session) => session },
        ],
      },
    ]),
  /Duplicate session enricher id: shared/,
);

// The composed application router and the declared namespaces must agree.
const declaredNamespaces = registry.routerNamespaces.map(
  (entry) => entry.namespace,
);
registry.assertRouterNamespaces(declaredNamespaces);
assert.throws(
  () => registry.assertRouterNamespaces([...declaredNamespaces, "undeclared"]),
  /Router namespace undeclared is not declared by any server extension/,
);
assert.throws(
  () => registry.assertRouterNamespaces(declaredNamespaces.slice(1)),
  /Declared router namespace .* is missing from the application router/,
);

// A build-selected resolver replaces the Community fallback while Community
// namespace declarations remain present. This is the actual Pro composition.
const overlayResolver: SiriusPrincipalResolver = {
  id: "overlay",
  resolve: () =>
    Promise.resolve({
      subjectId: "subject-1",
      displayName: "Subject One",
      capabilities: ["reporting.enterprise"],
    }),
};
const overlayRegistry = createServerExtensionRegistry([
  communityServerExtension,
  { ...reporting, principalResolver: overlayResolver },
]);
assert.equal(overlayRegistry.principalResolver.id, "overlay");
assert.deepEqual(
  overlayRegistry.getRequiredCapabilitiesForProcedure("host.getAllHosts"),
  ["api.hosts"],
);
assert.deepEqual(
  overlayRegistry.getRequiredCapabilitiesForProcedure("reports.list"),
  ["reporting.enterprise"],
);

async function assertCommunityResolverBehavior(): Promise<void> {
  assert.equal(
    await communityPrincipalResolver.resolve({ session: null }),
    null,
    "an unauthenticated request must not resolve a principal",
  );
  assert.equal(
    await communityPrincipalResolver.resolve({
      session: sessionFor(undefined),
    }),
    null,
    "a session without a user must not resolve a principal",
  );

  const principal = await communityPrincipalResolver.resolve({
    session: sessionFor({ id: "1", name: "admin", email: "admin@sirius.local" }),
  });
  assert.equal(principal?.subjectId, "1");
  assert.deepEqual(principal?.capabilities, COMMUNITY_CAPABILITIES);
}

async function assertPrincipalResolutionFailsClosed(): Promise<void> {
  const failingResolver: SiriusPrincipalResolver = {
    id: "failing",
    resolve: () => Promise.reject(new Error("entitlement service unreachable")),
  };

  const principal = await silenceErrors(() =>
    resolvePrincipal(failingResolver, {
      session: sessionFor({ id: "1", name: "admin", email: "a@b.c" }),
    }),
  );

  assert.equal(
    principal,
    null,
    "a failing resolver must not inherit another edition's capabilities",
  );
  assert.throws(
    () => assertPrincipalCapabilities(principal, ["api.hosts"]),
    (error: unknown) =>
      error instanceof SiriusCapabilityError &&
      error.code === "CAPABILITY_REQUIRED" &&
      error.missing.length === 1 &&
      error.missing[0] === "api.hosts",
  );
  assert.doesNotThrow(() => assertPrincipalCapabilities(principal, []));
}

async function assertCommunityPrincipalCannotReachOverlayNamespace(): Promise<void> {
  const principal = await communityPrincipalResolver.resolve({
    session: sessionFor({ id: "1", name: "admin", email: "a@b.c" }),
  });

  assert.doesNotThrow(() =>
    assertPrincipalCapabilities(
      principal,
      registry.getRequiredCapabilitiesForProcedure("host.getAllHosts"),
    ),
  );
  assert.throws(
    () =>
      assertPrincipalCapabilities(
        principal,
        registry.getRequiredCapabilitiesForProcedure("reports.list"),
      ),
    SiriusCapabilityError,
  );
}

async function assertSessionEnrichmentIsIsolated(): Promise<void> {
  const session = sessionFor({ id: "1", name: "admin", email: "a@b.c" });
  const enriched = await silenceErrors(() =>
    applySessionEnrichers(
      [
        {
          id: "failing",
          enrich: () => {
            throw new Error("enricher exploded");
          },
        },
        {
          id: "tagging",
          enrich: (current, principal) => ({
            ...current,
            user: { ...current.user, name: principal?.displayName ?? "" },
          }),
        },
      ],
      session,
      { subjectId: "1", displayName: "Enriched", capabilities: [] },
    ),
  );

  assert.equal(
    enriched.user.name,
    "Enriched",
    "a failing enricher must not stop later enrichers",
  );
  assert.equal(session.user.name, "admin", "enrichment must not mutate input");
}

async function runAsyncAssertions(): Promise<void> {
  await assertCommunityResolverBehavior();
  await assertPrincipalResolutionFailsClosed();
  await assertCommunityPrincipalCannotReachOverlayNamespace();
  await assertSessionEnrichmentIsIsolated();
}

runAsyncAssertions()
  .then(() => {
    console.log("Server extension contract tests passed");
  })
  .catch((cause: unknown) => {
    console.error(cause);
    process.exit(1);
  });

import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CapabilityGate,
  SiriusCapabilityProvider,
  createApiCapabilityProvider,
  createUIExtensionRegistry,
  hasRequiredCapabilities,
  loadCapabilitySnapshot,
} from "./index";
import type {
  SiriusCapabilityProviderDefinition,
  SiriusNavigationIcon,
  SiriusUIExtension,
} from "./types";

const TestIcon: SiriusNavigationIcon = () => null;

const community: SiriusUIExtension = {
  id: "community",
  version: "1.0.0",
  order: 0,
  navigation: [
    {
      id: "community.dashboard",
      label: "Dashboard",
      href: "/dashboard",
      matchPaths: ["/dashboard"],
      icon: TestIcon,
      order: 10,
    },
  ],
  routes: [
    {
      id: "community.dashboard",
      path: "/dashboard",
      requiredCapabilities: ["ui.dashboard_shell"],
    },
  ],
};

const reporting: SiriusUIExtension = {
  id: "reporting",
  version: "1.0.0",
  navigation: [
    {
      id: "reporting.reports",
      label: "Reports",
      href: "/reports",
      matchPaths: ["/reports"],
      icon: TestIcon,
      requiredCapabilities: ["reporting.enterprise"],
    },
  ],
  routes: [
    {
      id: "reporting.reports",
      path: "/reports",
      requiredCapabilities: ["reporting.enterprise"],
    },
  ],
};

const registry = createUIExtensionRegistry([reporting, community]);

assert.deepEqual(
  registry.extensions.map((extension) => extension.id),
  ["community", "reporting"],
);
assert.deepEqual(
  registry.navigationItems.map((item) => item.id),
  ["community.dashboard", "reporting.reports"],
);
assert.deepEqual(
  registry.getRequiredCapabilitiesForPath("/reports/quarterly"),
  ["reporting.enterprise"],
);
assert.equal(registry.getRouteForPath("/unknown"), undefined);

assert.equal(
  hasRequiredCapabilities(["reporting.enterprise"], [
    "reporting.enterprise",
  ]),
  true,
);
assert.equal(
  hasRequiredCapabilities(["reporting.enterprise"], [
    "reporting.enterprise",
    "reporting.scheduled",
  ]),
  false,
);
assert.equal(hasRequiredCapabilities([], []), true);

const fakeCapabilityProvider: SiriusCapabilityProviderDefinition = {
  id: "test",
  initialSnapshot: {
    principal: {
      subjectId: "test-subject",
      displayName: "Test",
      capabilities: ["reporting.enterprise"],
    },
    source: "test",
  },
};

const visibleGatedPage = renderToStaticMarkup(
  React.createElement(
    SiriusCapabilityProvider,
    { definition: fakeCapabilityProvider },
    React.createElement(
      CapabilityGate,
      {
        requiredCapabilities: ["reporting.enterprise"],
        fallback: React.createElement("span", null, "hidden"),
      },
      React.createElement("span", null, "visible"),
    ),
  ),
);
assert.match(visibleGatedPage, /visible/);
assert.doesNotMatch(visibleGatedPage, /hidden/);

const hiddenGatedPage = renderToStaticMarkup(
  React.createElement(
    SiriusCapabilityProvider,
    {
      definition: {
        ...fakeCapabilityProvider,
        initialSnapshot: {
          ...fakeCapabilityProvider.initialSnapshot,
          principal: {
            ...fakeCapabilityProvider.initialSnapshot.principal,
            capabilities: [],
          },
        },
      },
    },
    React.createElement(
      CapabilityGate,
      {
        requiredCapabilities: ["reporting.enterprise"],
        fallback: React.createElement("span", null, "hidden"),
      },
      React.createElement("span", null, "visible"),
    ),
  ),
);
assert.match(hiddenGatedPage, /hidden/);
assert.doesNotMatch(hiddenGatedPage, /visible/);

const apiCapabilityProvider = createApiCapabilityProvider({
  endpoint: "/api/capabilities",
});
assert.equal(apiCapabilityProvider.initialSnapshot.principal.subjectId, "");
assert.deepEqual(apiCapabilityProvider.initialSnapshot.principal.capabilities, []);

const apiProviderFailClosedPage = renderToStaticMarkup(
  React.createElement(
    SiriusCapabilityProvider,
    { definition: apiCapabilityProvider },
    React.createElement(
      CapabilityGate,
      {
        requiredCapabilities: ["reporting.enterprise"],
        fallback: React.createElement("span", null, "hidden"),
      },
      React.createElement("span", null, "visible"),
    ),
  ),
);
assert.match(apiProviderFailClosedPage, /hidden/);
assert.doesNotMatch(apiProviderFailClosedPage, /visible/);

async function assertFailedCapabilityRequestDeniesContributions(
  label: string,
  fetchImplementation: typeof fetch,
): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchImplementation;

  try {
    const result = await loadCapabilitySnapshot(
      createApiCapabilityProvider({ endpoint: "/api/capabilities" }),
    );

    assert.ok(result.error instanceof Error, `${label}: expected an error`);
    assert.deepEqual(
      result.snapshot.principal.capabilities,
      [],
      `${label}: expected an empty capability set`,
    );
    assert.equal(
      hasRequiredCapabilities(result.snapshot.principal.capabilities, [
        "reporting.enterprise",
      ]),
      false,
      `${label}: expected the capability check to deny`,
    );

    const deniedPage = renderToStaticMarkup(
      React.createElement(
        SiriusCapabilityProvider,
        { definition: { id: "api-failure", initialSnapshot: result.snapshot } },
        React.createElement(
          CapabilityGate,
          {
            requiredCapabilities: ["reporting.enterprise"],
            fallback: React.createElement("span", null, "hidden"),
          },
          React.createElement("span", null, "visible"),
        ),
      ),
    );

    assert.match(deniedPage, /hidden/, `${label}: expected the fallback`);
    assert.doesNotMatch(
      deniedPage,
      /visible/,
      `${label}: expected no gated content`,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function assertApiCapabilityProviderFailsClosed(): Promise<void> {
  await assertFailedCapabilityRequestDeniesContributions("network failure", () =>
    Promise.reject(new Error("network unreachable")),
  );

  await assertFailedCapabilityRequestDeniesContributions("HTTP error", () =>
    Promise.resolve(new Response("nope", { status: 503 })),
  );

  await assertFailedCapabilityRequestDeniesContributions(
    "malformed payload",
    () =>
      Promise.resolve(
        new Response(JSON.stringify({ principal: { subjectId: 42 } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
  );
}

assert.throws(
  () =>
    createUIExtensionRegistry([
      community,
      {
        ...reporting,
        id: "duplicate",
        navigation: [
          {
            ...reporting.navigation![0]!,
            id: "community.dashboard",
          },
        ],
      },
    ]),
  /Duplicate navigation contribution id: community\.dashboard/,
);

assert.throws(
  () =>
    createUIExtensionRegistry([
      community,
      {
        ...reporting,
        id: "duplicate-path",
        routes: [
          {
            ...reporting.routes![0]!,
            id: "duplicate-path.route",
            path: "/dashboard",
          },
        ],
      },
    ]),
  /Duplicate UI route path: \/dashboard/,
);

assertApiCapabilityProviderFailsClosed()
  .then(() => {
    console.log("UI extension registry contract tests passed");
  })
  .catch((cause: unknown) => {
    console.error(cause);
    process.exit(1);
  });

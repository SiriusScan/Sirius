import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CapabilityGate,
  SiriusCapabilityProvider,
  createApiCapabilityProvider,
  createUIExtensionRegistry,
  hasRequiredCapabilities,
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

console.log("UI extension registry contract tests passed");

/**
 * Synthetic extension declarations for the contract compatibility harness.
 *
 * This stands in for a private build so public CI can prove the extension
 * surface still composes without reaching a private repository. It uses durable
 * product vocabulary (subject, administrator, member) and deliberately trivial
 * resources: the point is to exercise composition, authorization, and
 * fail-closed behavior, not to model a product.
 *
 * Like any declaration module, this must not import `~/server/api/trpc`; the
 * routers live in `synthetic-routers.ts`.
 */
import type { SiriusCapability, SiriusPrincipal } from "~/contracts/capabilities";
import type { SiriusPrincipalResolver, SiriusServerExtension } from "../types";

export const SYNTHETIC_READ: SiriusCapability = "synthetic.widgets.read";
export const SYNTHETIC_ADMIN: SiriusCapability = "synthetic.widgets.admin";

/** A private role maps to capabilities here; Core never sees the role. */
export const administratorPrincipal: SiriusPrincipal = {
  subjectId: "subject:administrator",
  displayName: "Administrator",
  capabilities: [SYNTHETIC_READ, SYNTHETIC_ADMIN, "api.hosts"],
};

export const memberPrincipal: SiriusPrincipal = {
  subjectId: "subject:member",
  displayName: "Member",
  capabilities: [SYNTHETIC_READ, "api.hosts"],
};

/** A subject that authenticated but is no longer active holds nothing. */
export const deactivatedPrincipal: SiriusPrincipal = {
  subjectId: "subject:deactivated",
  displayName: "Deactivated",
  capabilities: [],
};

export const syntheticResolver: SiriusPrincipalResolver = {
  id: "synthetic.identity",
  resolve: ({ session }) => {
    const name = session?.user?.name;

    if (!name) {
      return Promise.resolve(null);
    }

    if (name === "administrator") {
      return Promise.resolve(administratorPrincipal);
    }

    if (name === "deactivated") {
      return Promise.resolve(deactivatedPrincipal);
    }

    return Promise.resolve(memberPrincipal);
  },
};

export const failingResolver: SiriusPrincipalResolver = {
  id: "synthetic.failing",
  resolve: () => Promise.reject(new Error("synthetic identity service unreachable")),
};

export const syntheticExtension: SiriusServerExtension = {
  id: "synthetic.server",
  version: "1.0.0",
  order: 100,
  principalResolver: syntheticResolver,
  routerNamespaces: [
    { namespace: "syntheticWidgets", requiredCapabilities: [SYNTHETIC_READ] },
    { namespace: "syntheticWidgetAdmin", requiredCapabilities: [SYNTHETIC_ADMIN] },
  ],
};

export const syntheticServerExtensions: readonly SiriusServerExtension[] = [
  syntheticExtension,
];

import type { Session } from "next-auth";
import type { SiriusCapability, SiriusPrincipal } from "~/contracts/capabilities";

/**
 * A tRPC namespace claimed by an extension.
 *
 * The namespace is the top-level key under which the contribution's router is
 * merged into the application router, which is also the first path segment of
 * every procedure it serves (`host.getHosts` belongs to namespace `host`).
 * Declaring the namespace here lets Core enforce the contribution's capability
 * requirements without knowing anything about the router itself.
 */
export interface SiriusServerRouterNamespace {
  namespace: string;
  requiredCapabilities?: readonly SiriusCapability[];
}

export interface SiriusPrincipalResolutionInput {
  session: Session | null;
}

/**
 * Establishes the calling subject and its capabilities.
 *
 * Community resolves an authenticated session to the static Community
 * capability catalog. A private build may resolve the same session against its
 * own identity and authorization policy. Returning `null` means no principal
 * could be established, which denies every gated procedure.
 */
export interface SiriusPrincipalResolver {
  id: string;
  resolve: (
    input: SiriusPrincipalResolutionInput,
  ) => Promise<SiriusPrincipal | null>;
}

/**
 * Adds edition-specific data to the session NextAuth returns to the browser.
 *
 * Community contributes no enricher. The hook exists so a private build can
 * publish its own principal data without forking `auth.ts`.
 */
export interface SiriusSessionEnricher {
  id: string;
  enrich: (
    session: Session,
    principal: SiriusPrincipal | null,
  ) => Session | Promise<Session>;
}

export interface SiriusCredentialGateInput {
  /** Opaque Core account id of the record whose password already verified. */
  accountId: string;
  /** Login name on that account record, for the gate's own records only. */
  accountName: string | null;
}

/**
 * Final sign-in decision for the local credentials provider.
 *
 * Core verifies the password first; a registered gate may then refuse the
 * sign-in (for example because the calling edition deactivated the account).
 * Returning `false` or throwing denies the sign-in. Community registers no
 * gate, so its sign-in behavior is unchanged. The gate receives only the
 * matched account's opaque id and name; authorization stays with the
 * principal resolver, which runs per request.
 */
export interface SiriusCredentialGate {
  id: string;
  check: (input: SiriusCredentialGateInput) => Promise<boolean>;
}

/**
 * A compile-time server extension contribution.
 *
 * This mirrors `SiriusUIExtension` on the browser side: Community registers its
 * own declarations and a private build overlays `registered.ts`. The registry is
 * assembled during module evaluation; no runtime plugin loading is involved.
 */
export interface SiriusServerExtension {
  id: string;
  version: string;
  order?: number;
  routerNamespaces?: readonly SiriusServerRouterNamespace[];
  principalResolver?: SiriusPrincipalResolver;
  sessionEnrichers?: readonly SiriusSessionEnricher[];
  credentialGate?: SiriusCredentialGate;
  /** Overrides the session lifetime (seconds) for this build, if set. */
  sessionMaxAgeSeconds?: number;
}

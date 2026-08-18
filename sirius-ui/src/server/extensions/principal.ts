import {
  COMMUNITY_CAPABILITIES,
  missingCapabilities,
} from "~/contracts/capabilities";
import type { SiriusCapability, SiriusPrincipal } from "~/contracts/capabilities";
import type {
  SiriusPrincipalResolutionInput,
  SiriusPrincipalResolver,
  SiriusSessionEnricher,
} from "./types";
import type { Session } from "next-auth";

/**
 * Raised when the resolved principal does not hold every required capability.
 *
 * The structured `code` and `missing` fields let transport layers translate the
 * denial without re-deriving it. Licensing denials are a separate concern and
 * will carry their own code once the entitlement provider lands.
 */
export class SiriusCapabilityError extends Error {
  readonly code = "CAPABILITY_REQUIRED";
  readonly missing: readonly SiriusCapability[];

  constructor(missing: readonly SiriusCapability[]) {
    super(`Missing required capabilities: ${missing.join(", ")}`);
    this.name = "SiriusCapabilityError";
    this.missing = missing;
  }
}

/**
 * Community's resolver: any authenticated session holds the Community catalog,
 * and an unauthenticated request holds nothing.
 *
 * Community is a single-operator deployment, so it does not differentiate
 * subjects. The subject id is still carried through so that shared code paths
 * behave identically once a private resolver supplies real subjects.
 */
export const communityPrincipalResolver: SiriusPrincipalResolver = {
  id: "community",
  resolve: ({ session }: SiriusPrincipalResolutionInput) => {
    const user = session?.user;

    if (!user) {
      return Promise.resolve(null);
    }

    return Promise.resolve({
      subjectId: user.id ?? "",
      displayName: user.name ?? null,
      capabilities: COMMUNITY_CAPABILITIES,
    });
  },
};

/**
 * Resolves the calling principal, failing closed.
 *
 * A resolver that throws yields no principal rather than falling back to
 * another edition's capability set, so an unreachable identity or entitlement
 * service denies gated work instead of granting it.
 */
export async function resolvePrincipal(
  resolver: SiriusPrincipalResolver,
  input: SiriusPrincipalResolutionInput,
): Promise<SiriusPrincipal | null> {
  try {
    return await resolver.resolve(input);
  } catch (cause) {
    console.error(
      `Capability principal resolver ${resolver.id} failed; denying capabilities`,
      cause,
    );
    return null;
  }
}

/**
 * Throws a `SiriusCapabilityError` unless the principal holds every required
 * capability. An empty requirement list is always satisfied.
 */
export function assertPrincipalCapabilities(
  principal: SiriusPrincipal | null,
  requiredCapabilities: readonly SiriusCapability[] = [],
): void {
  const missing = missingCapabilities(principal, requiredCapabilities);

  if (missing.length > 0) {
    throw new SiriusCapabilityError(missing);
  }
}

/**
 * Applies session enrichers in registry order. An enricher that throws is
 * skipped so a failing extension cannot break authentication for the base
 * session.
 */
export async function applySessionEnrichers(
  enrichers: readonly SiriusSessionEnricher[],
  session: Session,
  principal: SiriusPrincipal | null,
): Promise<Session> {
  let enriched = session;

  for (const enricher of enrichers) {
    try {
      enriched = await enricher.enrich(enriched, principal);
    } catch (cause) {
      console.error(`Session enricher ${enricher.id} failed`, cause);
    }
  }

  return enriched;
}

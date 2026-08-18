import type { SiriusServerExtension } from "./types";

/**
 * Build-time server extension slot.
 *
 * Community intentionally keeps this empty. A private build overlays this module
 * so it can declare tRPC namespaces, a principal resolver, and session
 * enrichment without editing the canonical registry, `root.ts`, `trpc.ts`, or
 * `auth.ts`.
 *
 * These are declarations only. The routers themselves are contributed through
 * `registered-routers.ts`, and `root.ts` cross-checks the two, so an overlay that
 * adds a router without declaring its namespace (or the reverse) fails at
 * startup.
 *
 * A module reachable from here must not import `~/server/api/trpc`: `trpc.ts`
 * imports this registry to enforce capabilities, so doing so would form an
 * import cycle. Keep router construction in `registered-routers.ts`.
 */
export const registeredServerExtensions: readonly SiriusServerExtension[] = [];

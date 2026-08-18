import type { SiriusServerExtension } from "./types";

/**
 * Build-time server extension slot.
 *
 * Community intentionally keeps both exports empty. A private build overlays
 * this module so it can add tRPC namespaces, a principal resolver, and session
 * enrichment without editing the canonical registry, `root.ts`, `trpc.ts`, or
 * `auth.ts`.
 *
 * The two exports are deliberately separate:
 *
 * - `registeredServerExtensions` carries the runtime declarations the registry
 *   validates and enforces.
 * - `registeredServerRouters` carries the routers themselves as an object
 *   literal, so spreading it into the application router preserves tRPC's
 *   client-side type inference.
 *
 * `root.ts` cross-checks the two, so an overlay that adds a router without
 * declaring its namespace (or the reverse) fails at startup.
 */
export const registeredServerExtensions: readonly SiriusServerExtension[] = [];

export const registeredServerRouters = {};

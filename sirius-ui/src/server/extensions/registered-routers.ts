/**
 * Build-time tRPC router slot.
 *
 * Community intentionally keeps this empty. A private build overlays this module
 * with its routers so `root.ts` can spread them into the application router;
 * because they are an object literal, tRPC keeps inferring client types for the
 * contributed namespaces.
 *
 * This lives apart from `registered.ts` on purpose. Router modules import
 * `createTRPCRouter`/`protectedProcedure` from `~/server/api/trpc`, which itself
 * imports the extension registry to enforce capabilities. Declarations and
 * routers therefore cannot share a module: only `root.ts` imports this one, so
 * the router modules load after `trpc.ts` has finished initializing.
 */
export const registeredServerRouters = {};

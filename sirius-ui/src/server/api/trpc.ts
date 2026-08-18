/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import superjson from "superjson";
import { ZodError } from "zod";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import type { SiriusCapability, SiriusPrincipal } from "~/contracts/capabilities";
import {
  SiriusCapabilityError,
  assertPrincipalCapabilities,
  resolvePrincipal,
  serverExtensionRegistry,
} from "~/server/extensions";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  session: Session | null;
  principal?: SiriusPrincipal | null;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    principal: opts.principal ?? null,
    prisma,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  // The registered principal resolver decides which subject is calling and
  // which capabilities it holds. It fails closed, so an unresolved principal
  // reaches the procedures with no capabilities at all.
  const principal = await resolvePrincipal(
    serverExtensionRegistry.principalResolver,
    { session },
  );

  return {
    session,
    principal,
    prisma,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

function assertCapabilities(
  principal: SiriusPrincipal | null,
  requiredCapabilities: readonly SiriusCapability[],
): void {
  try {
    assertPrincipalCapabilities(principal, requiredCapabilities);
  } catch (cause) {
    if (cause instanceof SiriusCapabilityError) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: cause.message,
        cause,
      });
    }

    throw cause;
  }
}

/**
 * Enforces the capabilities the registry declares for the procedure's
 * namespace. Community declares its own namespaces, so a Community operator is
 * unaffected, while a namespace contributed by an extension is authorized
 * without that extension patching Core procedures.
 */
const enforceNamespaceCapabilities = t.middleware(({ ctx, path, next }) => {
  assertCapabilities(
    ctx.principal,
    serverExtensionRegistry.getRequiredCapabilitiesForProcedure(path),
  );

  return next();
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null. It also enforces the
 * capabilities declared for the procedure's namespace.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(enforceUserIsAuthed)
  .use(enforceNamespaceCapabilities);

/**
 * Protected procedure with additional explicit capability requirements, for
 * procedures that need more than their namespace declares.
 */
export const capabilityProcedure = (
  ...requiredCapabilities: SiriusCapability[]
) =>
  protectedProcedure.use(({ ctx, next }) => {
    assertCapabilities(ctx.principal, requiredCapabilities);
    return next();
  });

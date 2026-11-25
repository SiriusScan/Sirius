import { createNextApiHandler } from "@trpc/server/adapters/next";
import { env } from "~/env.mjs";
import { appRouter } from "~/server/api/root";
import { apiErrorDiagnostics } from "~/server/api/shared/apiErrors";
import { createTRPCContext } from "~/server/api/trpc";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error, type }) => {
          const operation =
            path && Object.hasOwn(appRouter._def.procedures, path) ? path : undefined;
          console.error("tRPC request failed", {
            operation,
            type,
            trpcCode: error.code,
            ...apiErrorDiagnostics(error.cause),
          });
        }
      : undefined,
});

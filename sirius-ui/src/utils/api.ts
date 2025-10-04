/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import { type AppRouter } from "~/server/api/root";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  // Use SIRIUS_API_URL for internal Docker network communication
  if (process.env.SIRIUS_API_URL) return process.env.SIRIUS_API_URL;
  return `http://localhost:${process.env.PORT ?? 3000}`; // fallback for localhost
};

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      /**
       * Transformer used for data de-serialization from the server.
       *
       * @see https://trpc.io/docs/data-transformers
       */
      transformer: superjson,

      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          // Add fetch configuration with longer timeout for terminal operations
          fetch(url, options) {
            // Create abort controller with timeout only if supported
            const controller = new AbortController();
            let timeoutId: NodeJS.Timeout | undefined;

            // Set different timeouts based on the endpoint
            if (typeof window !== "undefined") {
              // Check if this is a terminal operation (scan, long-running commands)
              const isTerminalOperation = url.includes(
                "terminal.executeCommand"
              );
              const isAgentOperation = url.includes("agent.");

              // Use longer timeouts for operations that might take time
              const timeout = isTerminalOperation
                ? 300000 // 5 minutes for terminal commands (like scan)
                : isAgentOperation
                ? 30000 // 30 seconds for agent operations
                : 15000; // 15 seconds for general operations (increased from 8)

              timeoutId = setTimeout(() => controller.abort(), timeout);
            }

            return fetch(url, {
              ...options,
              signal: controller.signal,
            }).finally(() => {
              if (timeoutId) {
                clearTimeout(timeoutId);
              }
            });
          },
        }),
      ],

      /**
       * Query client configuration optimized for terminal operations
       */
      queryClientConfig: {
        defaultOptions: {
          queries: {
            // Prevent queries from blocking navigation
            staleTime: 30 * 1000, // 30 seconds
            retry: (failureCount, error) => {
              // Don't retry timeout errors from long-running operations
              if (
                error?.message?.includes("aborted") ||
                error?.message?.includes("signal")
              ) {
                return false;
              }
              // Don't retry if navigation is happening
              if (error?.message?.includes("fetch")) {
                return false;
              }
              return failureCount < 2;
            },
            retryDelay: 1000,
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            // Disable automatic refetching during navigation
            refetchOnReconnect: "always",
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry timeout errors from long-running operations
              if (
                error?.message?.includes("aborted") ||
                error?.message?.includes("signal")
              ) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      },
    };
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
});

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

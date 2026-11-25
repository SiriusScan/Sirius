import type { TRPCLink } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";

/** Keep terminal requests, responses, and history out of the generic tRPC logger. */
export function skipTerminalLogging<Router extends AnyRouter>(
  link: TRPCLink<Router>,
): TRPCLink<Router> {
  return (runtime) => {
    const log = link(runtime);
    return (options) => {
      if (options.op.path.startsWith("terminal.")) return options.next(options.op);
      return log(options);
    };
  };
}

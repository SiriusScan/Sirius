import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { handleSendMsg, waitForResponse } from "./queue";

// Mock responses for common commands
const MOCK_RESPONSES = {
  ls: "Documents  Downloads  Pictures  agent.exe",
  pwd: "/home/sirius",
  whoami: "sirius-agent",
  ps: "PID   TTY    TIME     CMD\r\n123   pts/0  00:00:01 bash\r\n456   pts/0  00:00:00 ps",
  date: () => new Date().toLocaleString(),
  echo: (args: string) => args,
} as const;

export const terminalRouter = createTRPCRouter({
  executeCommand: protectedProcedure
    .input(z.object({ command: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        console.log("[Terminal] Executing command:", input.command);

        const message = JSON.stringify({
          command: input.command,
          userId: ctx.session.user.id,
          timestamp: new Date().toISOString(),
          responseQueue: "terminal_response",
        });

        console.log("[Terminal] Sending message:", message);
        await handleSendMsg("terminal", message);
        console.log("[Terminal] Message sent, waiting for response");

        const response = await waitForResponse("terminal_response");
        console.log("[Terminal] Got response:", response);

        return {
          success: true,
          output: response,
        };
      } catch (error) {
        console.error("[Terminal] Failed to execute command:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to execute command",
        });
      }
    }),

  initializeSession: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const sessionId = crypto.randomUUID();

      const message = JSON.stringify({
        action: "initialize",
        sessionId,
        userId: ctx.session.user.id,
        timestamp: new Date().toISOString(),
      });

      await handleSendMsg("terminal", message);

      return {
        sessionId,
        startTime: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to initialize session:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to initialize terminal session",
      });
    }
  }),
});

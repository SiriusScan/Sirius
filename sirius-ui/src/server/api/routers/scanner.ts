import { safeErrorForLogging } from "~/server/safeErrorForLogging";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { handleSendMsg } from "~/server/api/routers/queue";
import { valkey } from "~/server/valkey";

const CURRENT_SCAN_KEY = "currentScan";

// Compare the exact bytes read, not just the scan ID: progress may have changed
// while RabbitMQ was awaited or while this caller prepared its update.
const COMPARE_AND_SET_SCAN = `
if redis.call("GET", KEYS[1]) ~= ARGV[1] then return 0 end
redis.call("SET", KEYS[1], ARGV[2], "KEEPTTL")
return 1
`;
const MAX_UPDATE_ATTEMPTS = 8;
const scanStateSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .refine((id) => id.trim().length > 0),
    status: z.enum([
      "pending",
      "running",
      "cancelling",
      "cancelled",
      "completed",
      "failed",
    ]),
    sub_scans: z
      .record(z.object({ status: z.string() }).passthrough())
      .nullish(),
  })
  .passthrough();
type ScanState = z.infer<typeof scanStateSchema>;

function decodeScanState(raw: string): ScanState {
  return scanStateSchema.parse(
    JSON.parse(Buffer.from(raw, "base64").toString("utf-8"))
  );
}

function encodeScanState(state: ScanState): string {
  return Buffer.from(JSON.stringify(state)).toString("base64");
}

async function getCurrentScan() {
  const raw = await valkey.get(CURRENT_SCAN_KEY);
  if (raw === null) return null;
  return { raw, state: decodeScanState(raw) };
}

function isTerminal(state: ScanState): boolean {
  return ["completed", "failed", "cancelled"].includes(state.status);
}

async function updateStoppedScan(scanId: string, force: boolean) {
  for (let attempt = 0; attempt < MAX_UPDATE_ATTEMPTS; attempt++) {
    const current = await getCurrentScan();
    if (!current || current.state.id !== scanId) {
      throw new Error("Current scan changed; its state was not modified");
    }
    const { state, raw } = current;
    // A worker may have finished while we waited for the queue. Never revive or
    // relabel terminal results, and keep repeated graceful requests idempotent.
    if (isTerminal(state) || (!force && state.status === "cancelling")) {
      return state.status;
    }
    state.status = force ? "cancelled" : "cancelling";
    if (force) {
      state.end_time = new Date().toISOString();
      if (state.sub_scans) {
        for (const sub of Object.values(state.sub_scans)) {
          if (sub.status === "running" || sub.status === "dispatching") {
            sub.status = "failed";
          }
        }
      }
    }
    const changed = await valkey.eval(
      COMPARE_AND_SET_SCAN,
      1,
      CURRENT_SCAN_KEY,
      raw,
      encodeScanState(state)
    );
    if (changed === 1) return state.status;
    // Retry from the latest state to preserve concurrent progress and fields.
  }
  throw new Error(
    "Scan state kept changing; dashboard state was not overwritten"
  );
}

async function requestScanStop(
  scanId: string | undefined,
  force: boolean
): Promise<CancelScanResponse> {
  const current = await getCurrentScan();
  if (!current) throw new Error("No current scan found");
  if (scanId !== undefined && scanId !== current.state.id) {
    throw new Error("Requested scan is not the current scan");
  }
  if (isTerminal(current.state)) {
    return {
      success: true,
      message: `Scan is already ${current.state.status}`,
      status: current.state.status,
    };
  }

  // Always address the captured ID. Publishing and Valkey updates are not one
  // transaction; the scanner must also reject commands for superseded scans.
  const cancelCommand = JSON.stringify({
    action: force ? "force_cancel" : "cancel",
    scan_id: current.state.id,
    timestamp: new Date().toISOString(),
  });
  let commandSent = true;
  try {
    await handleSendMsg("scan_control", cancelCommand);
  } catch (error) {
    if (!force) throw error;
    // Preserve the explicit Tier 2 fallback for an unresponsive scanner/queue.
    commandSent = false;
    console.warn(
      "Force-stop command could not be sent:",
      safeErrorForLogging(error)
    );
  }
  const status = await updateStoppedScan(current.state.id, force);
  return {
    success: true,
    message: !commandSent
      ? `Scan state is ${status}; force-stop command could not be sent`
      : status === "cancelling"
      ? "Scan cancellation requested"
      : `Scan state is ${status}`,
    status,
  };
}

export interface CancelScanResponse {
  success: boolean;
  message: string;
  status?: string;
  error?: string;
}

export interface ForceStopResponse {
  success: boolean;
  message: string;
  status?: string;
  error?: string;
}

export interface ResetScanResponse {
  success: boolean;
  message: string;
  status?: string;
  error?: string;
}

export const scannerRouter = createTRPCRouter({
  cancelScan: protectedProcedure
    .input(
      z
        .object({
          scanId: z
            .string()
            .min(1)
            .refine((id) => id.trim().length > 0)
            .optional(),
        })
        .optional()
    )
    .mutation(async ({ input }): Promise<CancelScanResponse> => {
      try {
        return await requestScanStop(input?.scanId, false);
      } catch (error) {
        console.error("Error cancelling scan:", safeErrorForLogging(error));
        return {
          success: false,
          message: "Failed to cancel scan",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  forceStopScan: protectedProcedure
    .input(
      z
        .object({
          scanId: z
            .string()
            .min(1)
            .refine((id) => id.trim().length > 0)
            .optional(),
        })
        .optional()
    )
    .mutation(async ({ input }): Promise<ForceStopResponse> => {
      try {
        return await requestScanStop(input?.scanId, true);
      } catch (error) {
        console.error("Error force stopping scan:", safeErrorForLogging(error));
        return {
          success: false,
          message: "Failed to force stop scan",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Reset scan dashboard state - Tier 3 last resort: directly clears ValKey
  resetScanState: protectedProcedure.mutation(
    async (): Promise<ResetScanResponse> => {
      try {
        await valkey.del(CURRENT_SCAN_KEY);

        return {
          success: true,
          message: "Scan state reset",
          status: "idle",
        };
      } catch (error) {
        console.error(
          "Error resetting scan state:",
          safeErrorForLogging(error)
        );
        return {
          success: false,
          message: "Failed to reset scan state",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  ),
});

/** Only fixed error categories/codes and numeric HTTP statuses may reach logs. */
export type SafeErrorSummary = {
  name: "Error" | "UnknownError";
  code?: string;
  status?: number;
};

const SAFE_ERROR_CODES = new Set([
  // Axios and common transport failures.
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL",
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EPIPE",
  "ENETUNREACH",
  "EHOSTUNREACH",
  // tRPC and local capability failures.
  "PARSE_ERROR",
  "BAD_REQUEST",
  "INTERNAL_SERVER_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "METHOD_NOT_SUPPORTED",
  "TIMEOUT",
  "CONFLICT",
  "PRECONDITION_FAILED",
  "PAYLOAD_TOO_LARGE",
  "UNPROCESSABLE_CONTENT",
  "TOO_MANY_REQUESTS",
  "CLIENT_CLOSED_REQUEST",
  "CAPABILITY_REQUIRED",
]);

function ownDataProperty(value: unknown, key: string): unknown {
  if (typeof value !== "object" || value === null) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  // Do not invoke getters or error-specific serializers while logging.
  return descriptor && "value" in descriptor ? descriptor.value : undefined;
}

/**
 * Return a fresh allowlisted summary, never the original error or its payloads.
 * Axios retains credentials in config.headers, response.config, request._header,
 * causes, and even free-form messages/stacks. Redacting a few header keys does
 * not cover those copies. Keep operation context at the call site instead.
 *
 * This function deliberately does not mutate the exception: callers can still
 * inspect status/body fields and rethrow it with their original semantics.
 */
export function safeErrorForLogging(error: unknown): SafeErrorSummary {
  const summary: SafeErrorSummary = { name: "UnknownError" };
  try {
    if (error instanceof Error) summary.name = "Error";
    const code = ownDataProperty(error, "code");
    if (typeof code === "string" && SAFE_ERROR_CODES.has(code)) {
      summary.code = code;
    }
    const status =
      ownDataProperty(error, "status") ??
      ownDataProperty(ownDataProperty(error, "response"), "status");
    if (
      typeof status === "number" &&
      Number.isInteger(status) &&
      status >= 100 &&
      status <= 599
    ) {
      summary.status = status;
    }
  } catch {
    // Unusual thrown values (for example a revoked Proxy) must fail closed.
  }
  return summary;
}

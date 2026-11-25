import { isAxiosError } from "axios";

const transportCodes = new Set([
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "EAI_AGAIN",
  "ENOTFOUND",
  "ETIMEDOUT",
  "ERR_BAD_REQUEST",
  "ERR_BAD_RESPONSE",
  "ERR_CANCELED",
  "ERR_NETWORK",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);

class ApiRequestError extends Error {
  constructor(
    readonly code: string,
    readonly status?: number,
    message = "Sirius API request failed",
  ) {
    super(status === undefined ? message : `${message} (HTTP ${status})`);
    this.name = "ApiRequestError";
  }
}

function readTransportCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }
  return typeof error.code === "string" && transportCodes.has(error.code)
    ? error.code
    : undefined;
}

/** Discard upstream messages and the original Error before it reaches callers. */
export function toApiRequestError(error: unknown): Error {
  if (error instanceof ApiRequestError) return error;

  const status: unknown = isAxiosError(error) ? error.response?.status : undefined;
  const httpStatus =
    typeof status === "number" &&
    Number.isInteger(status) &&
    status >= 100 &&
    status <= 599
      ? status
      : undefined;
  const code =
    readTransportCode(error) ??
    readTransportCode(error instanceof Error ? error.cause : undefined) ??
    (httpStatus === undefined ? "UPSTREAM_REQUEST_FAILED" : "HTTP_ERROR");
  return new ApiRequestError(code, httpStatus);
}

/** Keep diagnostics independent of request config, URLs, bodies, and causes. */
export function apiErrorDiagnostics(error: unknown) {
  if (!(error instanceof ApiRequestError)) return {};
  return { code: error.code, status: error.status };
}

export function requireApiOk(response: Response, message: string): void {
  if (!response.ok) {
    throw new ApiRequestError("HTTP_ERROR", response.status, message);
  }
}

export function readApiJson(response: Response): ReturnType<Response["json"]> {
  return response.json().catch(() => {
    throw new ApiRequestError("INVALID_UPSTREAM_RESPONSE", response.status);
  });
}

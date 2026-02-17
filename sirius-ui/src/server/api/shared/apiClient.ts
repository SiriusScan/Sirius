import axios from "axios";
import { env } from "~/env.mjs";

/** Shared Go API base URL used by all TRPC routers. */
export const API_BASE_URL = env.SIRIUS_API_URL || "http://localhost:9001";

/**
 * Shared, authenticated axios instance for server-side (TRPC router) calls to
 * the Go API.  The X-API-Key header is injected automatically from the
 * SIRIUS_API_KEY environment variable so every outbound request is authorised.
 *
 * Import this instead of creating per-router axios instances.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    ...(env.SIRIUS_API_KEY ? { "X-API-Key": env.SIRIUS_API_KEY } : {}),
  },
});

/**
 * Drop-in replacement for `fetch()` that automatically injects the X-API-Key
 * header.  Use this in routers that still rely on the native Fetch API.
 */
export async function apiFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (env.SIRIUS_API_KEY) {
    headers.set("X-API-Key", env.SIRIUS_API_KEY);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers });
}

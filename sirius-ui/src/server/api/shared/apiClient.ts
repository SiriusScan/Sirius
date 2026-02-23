import axios from "axios";
import { env } from "~/env.mjs";

/** Shared Go API base URL used by all TRPC routers. */
export const API_BASE_URL = env.SIRIUS_API_URL || "http://localhost:9001";

function getRequiredApiKey(): string {
  const key = env.SIRIUS_API_KEY?.trim();
  if (!key) {
    throw new Error("SIRIUS_API_KEY is missing; outbound API requests are blocked");
  }
  return key;
}

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
    "X-API-Key": getRequiredApiKey(),
  },
});

apiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers["X-API-Key"] = getRequiredApiKey();
  return config;
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
  headers.set("X-API-Key", getRequiredApiKey());
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers });
}

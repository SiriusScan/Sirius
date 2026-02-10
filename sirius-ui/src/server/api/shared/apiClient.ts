import { env } from "~/env.mjs";

/** Shared Go API base URL used by all scanner-related tRPC routers. */
export const API_BASE_URL = env.SIRIUS_API_URL || "http://localhost:9001";

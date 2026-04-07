import { existsSync, readFileSync } from "fs";

/** Prefer SIRIUS_API_KEY_FILE (Docker secret mount), then SIRIUS_API_KEY. */
function resolveInternalSiriusAPIKey() {
  const file = process.env.SIRIUS_API_KEY_FILE?.trim();
  if (file && existsSync(file)) {
    try {
      const k = readFileSync(file, "utf8").trim();
      if (k) return k;
    } catch {
      /* fall through */
    }
  }
  return (process.env.SIRIUS_API_KEY || "").trim();
}

// Simple environment object - no validation needed for Docker compose setup
export const env = {
  NODE_ENV: process.env.NODE_ENV || "production",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "dummy_client_id",
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || "dummy_client_secret",
  SIRIUS_API_URL: process.env.SIRIUS_API_URL || "http://localhost:9001",
  NEXT_PUBLIC_SIRIUS_API_URL: process.env.NEXT_PUBLIC_SIRIUS_API_URL || "http://localhost:9001",
  // Internal service credential for TRPC → Go API (file mount preferred).
  SIRIUS_API_KEY: resolveInternalSiriusAPIKey(),
  SIRIUS_API_KEY_FILE: process.env.SIRIUS_API_KEY_FILE || "",
};

const skipValidation = process.env.SKIP_ENV_VALIDATION === "1";
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const isDockerBuildStage = process.env.SIRIUS_BUILD_STAGE === "docker-build";

if (
  !skipValidation &&
  !isBuildPhase &&
  !isDockerBuildStage &&
  !env.SIRIUS_API_KEY.trim()
) {
  throw new Error(
    "Internal API key required at runtime: set SIRIUS_API_KEY_FILE to a readable secret file and/or SIRIUS_API_KEY",
  );
}

if (!isBuildPhase && !isDockerBuildStage && !env.NEXTAUTH_SECRET.trim()) {
  throw new Error("NEXTAUTH_SECRET is required at runtime");
}

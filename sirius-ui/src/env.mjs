// Simple environment object - no validation needed for Docker compose setup
export const env = {
  NODE_ENV: process.env.NODE_ENV || "production",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "dummy_client_id",
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || "dummy_client_secret",
  SIRIUS_API_URL: process.env.SIRIUS_API_URL || "http://localhost:9001",
  NEXT_PUBLIC_SIRIUS_API_URL: process.env.NEXT_PUBLIC_SIRIUS_API_URL || "http://localhost:9001",
  // API key for authenticating TRPC backend → Go API requests.
  // Injected as a service credential for UI backend → Go API requests.
  SIRIUS_API_KEY: process.env.SIRIUS_API_KEY || "",
};

const skipValidation = process.env.SKIP_ENV_VALIDATION === "1";
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

if (!skipValidation && !isBuildPhase && env.NODE_ENV === "production" && !env.SIRIUS_API_KEY.trim()) {
  throw new Error("SIRIUS_API_KEY is required in production");
}

if (!skipValidation && !isBuildPhase && env.NODE_ENV === "production" && !env.NEXTAUTH_SECRET.trim()) {
  throw new Error("NEXTAUTH_SECRET is required in production");
}

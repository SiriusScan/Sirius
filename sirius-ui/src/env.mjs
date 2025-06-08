// Simple environment object - no validation needed for Docker compose setup
export const env = {
  NODE_ENV: process.env.NODE_ENV || "production",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "change-this-secret-in-production-please",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "dummy_client_id",
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || "dummy_client_secret",
  SIRIUS_API_URL: process.env.SIRIUS_API_URL || "http://localhost:9001",
  NEXT_PUBLIC_SIRIUS_API_URL: process.env.NEXT_PUBLIC_SIRIUS_API_URL || "http://localhost:9001",
};

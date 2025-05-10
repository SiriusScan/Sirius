import Valkey from "iovalkey";

// Initialize Valkey client
const valkey = new Valkey({
  host: process.env.VALKEY_HOST || "sirius-valkey",
  port: parseInt(process.env.VALKEY_PORT || "6379"),
});

export { valkey };

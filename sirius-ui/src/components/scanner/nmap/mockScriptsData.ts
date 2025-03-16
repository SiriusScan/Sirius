// Import the NmapScript type from the store router
import { type NmapScript } from "~/server/api/routers/store";

// Re-export the NmapScript type for use in components
export type { NmapScript };

// Export a backup set of mock scripts in case Redis connection fails
export const fallbackScripts: NmapScript[] = [
  {
    id: "ssl-enum-ciphers",
    name: "ssl-enum-ciphers",
    author: "Fyodor",
    tags: ["ssl", "tls", "encryption", "discovery"],
    description:
      "This script enumerates the SSL ciphers supported by a server. It tests each cipher individually and reports information about the supported ciphers, including their strength and the protocols they support.",
    code: `portrule = function(host, port)\n  return shortport.ssl(host, port) or sslcert.getPrepareTLSWithoutReconnect(port)\nend\n\naction = function(host, port)\n  -- implementation details\n  return report\nend`,
  },
  // Include other fallback scripts from the original mockScriptsData.ts
];

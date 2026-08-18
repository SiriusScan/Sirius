import { communityServerExtension } from "./community";
import { registeredServerExtensions } from "./registered";
import { createServerExtensionRegistry } from "./registry";

export * from "./principal";
export * from "./registry";
export * from "./types";
export { communityServerExtension } from "./community";

export const serverExtensionRegistry = createServerExtensionRegistry([
  communityServerExtension,
  ...registeredServerExtensions,
]);

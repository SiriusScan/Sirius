import { communityUIExtension } from "./community";
import { registeredUIExtensions } from "./registered";
import { createUIExtensionRegistry } from "./registry";

export * from "./capabilities";
export * from "./registry";
export * from "./types";

export const uiExtensionRegistry = createUIExtensionRegistry([
  communityUIExtension,
  ...registeredUIExtensions,
]);

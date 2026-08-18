import type { SiriusUIExtension } from "./types";

/**
 * Build-time extension slot.
 *
 * Community intentionally keeps this empty. A private build can overlay this
 * module with a list of proprietary contributions without editing the
 * canonical registry, Sidebar, Layout, or the Community declarations.
 */
export const registeredUIExtensions: readonly SiriusUIExtension[] = [];

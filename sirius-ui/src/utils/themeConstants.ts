/**
 * themeConstants.ts — Centralized layout and typography constants.
 *
 * Import these constants instead of repeating Tailwind class strings
 * across pages and components. This ensures visual consistency and
 * makes future theme changes single-point updates.
 */

/* ------------------------------------------------------------------ */
/*  Page layout                                                        */
/* ------------------------------------------------------------------ */

/**
 * Root wrapper classes for page content alignment.
 * Applied to the outermost `<div>` inside every page component.
 * The `-mt-20` aligns the content with the main Header component.
 */
export const PAGE_ROOT_WRAPPER = "relative z-20 -mt-20";

/**
 * Sticky header classes for page-level sticky bars.
 * The negative margins + padding pattern ensures the sticky bar
 * bleeds edge-to-edge within the page container.
 */
export const STICKY_HEADER = "sticky top-2 z-30 -mx-4 md:-mx-6 px-4 md:px-6";

/* ------------------------------------------------------------------ */
/*  Section typography                                                 */
/* ------------------------------------------------------------------ */

/**
 * Canonical section header typography.
 * Used for all section titles (e.g. "SCAN TARGETS", "SEVERITY BREAKDOWN").
 */
export const SECTION_HEADER = "text-xs font-semibold uppercase tracking-wider text-gray-400";

/* ------------------------------------------------------------------ */
/*  Scanner section (CSS-class based — see globals.css)                 */
/* ------------------------------------------------------------------ */

/**
 * Standard scanner section wrapper.
 * Combines the CSS class with optional padding.
 */
export const SCANNER_SECTION = "scanner-section";
export const SCANNER_SECTION_PADDED = "scanner-section scanner-section-padding";
export const SCANNER_SECTION_PRIMARY = "scanner-section-primary";

/* ------------------------------------------------------------------ */
/*  Common border patterns                                             */
/* ------------------------------------------------------------------ */

/** Standard subtle border color used across v0.4 components. */
export const BORDER_SUBTLE = "border-violet-500/20";

/** Divider class for horizontal rules inside scanner sections. */
export const SCANNER_DIVIDER = "scanner-divider";

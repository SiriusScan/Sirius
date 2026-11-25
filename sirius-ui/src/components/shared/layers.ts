/**
 * layers.ts — the one z-index scale, for code that needs the number rather
 * than the Tailwind class (inline styles, third-party components).
 *
 * Mirrors `theme.extend.zIndex` in tailwind.config.ts (`z-header`,
 * `z-dropdown`, `z-overlay`, `z-toast`); layers.test.ts keeps them equal.
 *
 * - header 30: the app header (account menu, scan indicator). Page content
 *   sits at z-20 inside Layout's frames, so the header floats above it.
 * - dropdown 40: popups rendered in place (tooltips, page-local menus).
 * - overlay 50: dialogs and sheets, and portaled menus (dropdown menu,
 *   select, popover, context menu). A menu opened inside a dialog portals to
 *   <body> after the dialog, so at the same layer it still opens above it.
 * - toast 60: toasts stay readable above an open dialog.
 */

export const Z_INDEX = {
  header: 30,
  dropdown: 40,
  overlay: 50,
  toast: 60,
} as const;

export type Layer = keyof typeof Z_INDEX;

export default Z_INDEX;

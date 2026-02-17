/**
 * theme.ts — Dark-only theme initializer (v0.4).
 *
 * The application uses a dark-only design system. This initializer
 * ensures the `dark` class is always present on `<html>`, which
 * activates the `.dark` CSS variable block in globals.css.
 */
export const initializeTheme = () => {
  document.documentElement.classList.add("dark");
  return true;
};

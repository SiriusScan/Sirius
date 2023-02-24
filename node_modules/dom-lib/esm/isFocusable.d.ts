/**
 * Checks whether `element` is focusable or not.
 *
 * ```typescript
 * isFocusable(document.querySelector("input")); // true
 * isFocusable(document.querySelector("input[tabindex='-1']")); // true
 * isFocusable(document.querySelector("input[hidden]")); // false
 * isFocusable(document.querySelector("input:disabled")); // false
 * ```
 */
declare function isFocusable(element: Element): boolean;
export default isFocusable;

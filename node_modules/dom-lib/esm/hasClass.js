/**
 * Check whether an element has a specific class
 *
 * @param target The element to be checked
 * @param className The class to be checked
 *
 * @returns `true` if the element has the class, `false` otherwise
 */
export default function hasClass(target, className) {
  if (target.classList) {
    return !!className && target.classList.contains(className);
  }

  return (" " + target.className + " ").indexOf(" " + className + " ") !== -1;
}
/**
 * Remove a class from a given element
 *
 * @param target The element to remove the class from
 * @param className The class to be removed
 *
 * @returns The target element
 */
export default function removeClass(target, className) {
  if (className) {
    if (target.classList) {
      target.classList.remove(className);
    } else {
      target.className = target.className.replace(new RegExp("(^|\\s)" + className + "(?:\\s|$)", 'g'), '$1').replace(/\s+/g, ' ') // multiple spaces to one
      .replace(/^\s*|\s*$/g, ''); // trim the ends
    }
  }

  return target;
}
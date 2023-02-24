"use strict";

exports.__esModule = true;
exports["default"] = hasClass;

/**
 * Check whether an element has a specific class
 *
 * @param target The element to be checked
 * @param className The class to be checked
 *
 * @returns `true` if the element has the class, `false` otherwise
 */
function hasClass(target, className) {
  if (target.classList) {
    return !!className && target.classList.contains(className);
  }

  return (" " + target.className + " ").indexOf(" " + className + " ") !== -1;
}

module.exports = exports.default;
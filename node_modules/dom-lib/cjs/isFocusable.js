"use strict";

exports.__esModule = true;
exports["default"] = void 0;
var selector = "input:not([type='hidden']):not([disabled]), \nselect:not([disabled]), textarea:not([disabled]), a[href], \nbutton:not([disabled]),[tabindex],iframe,object, embed, area[href], \naudio[controls],video[controls],[contenteditable]:not([contenteditable='false'])";

function isVisible(element) {
  var htmlElement = element;
  return htmlElement.offsetWidth > 0 || htmlElement.offsetHeight > 0 || element.getClientRects().length > 0;
}
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


function isFocusable(element) {
  return isVisible(element) && (element === null || element === void 0 ? void 0 : element.matches(selector));
}

var _default = isFocusable;
exports["default"] = _default;
module.exports = exports.default;
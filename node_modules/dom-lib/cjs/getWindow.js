"use strict";

exports.__esModule = true;
exports["default"] = getWindow;

/**
 * Get the Window object of browser
 * @param node The DOM element
 * @returns The Window object of browser
 */
function getWindow(node) {
  if (node === (node === null || node === void 0 ? void 0 : node.window)) {
    return node;
  }

  return (node === null || node === void 0 ? void 0 : node.nodeType) === 9 ? (node === null || node === void 0 ? void 0 : node.defaultView) || (node === null || node === void 0 ? void 0 : node.parentWindow) : null;
}

module.exports = exports.default;
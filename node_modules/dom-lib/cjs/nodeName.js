"use strict";

exports.__esModule = true;
exports["default"] = nodeName;

/**
 * Get the name of the DOM element
 * @param node The DOM element
 * @returns The name of the DOM element
 */
function nodeName(node) {
  var _node$nodeName;

  return (node === null || node === void 0 ? void 0 : node.nodeName) && (node === null || node === void 0 ? void 0 : (_node$nodeName = node.nodeName) === null || _node$nodeName === void 0 ? void 0 : _node$nodeName.toLowerCase());
}

module.exports = exports.default;
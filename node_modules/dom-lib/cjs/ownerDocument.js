"use strict";

exports.__esModule = true;
exports["default"] = ownerDocument;

/**
 * Returns the top-level document object of the node.
 * @param node The DOM element
 * @returns The top-level document object of the node
 */
function ownerDocument(node) {
  return node && node.ownerDocument || document;
}

module.exports = exports.default;
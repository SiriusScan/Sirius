"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _default = function _default(node) {
  if (!node) {
    throw new TypeError('No Element passed to `getComputedStyle()`');
  }

  var doc = node.ownerDocument;

  if ('defaultView' in doc) {
    if (doc.defaultView.opener) {
      return node.ownerDocument.defaultView.getComputedStyle(node, null);
    }

    return window.getComputedStyle(node, null);
  }

  return null;
};

exports["default"] = _default;
module.exports = exports.default;
"use strict";

exports.__esModule = true;
exports["default"] = removeStyle;

function _removeStyle(node, key) {
  var _style, _style$removeProperty;

  (_style = node.style) === null || _style === void 0 ? void 0 : (_style$removeProperty = _style.removeProperty) === null || _style$removeProperty === void 0 ? void 0 : _style$removeProperty.call(_style, key);
}
/**
 * Remove a style property from a DOM element
 * @param node The DOM element
 * @param keys key(s) typeof [string , array]
 */


function removeStyle(node, keys) {
  if (typeof keys === 'string') {
    _removeStyle(node, keys);
  } else if (Array.isArray(keys)) {
    keys.forEach(function (key) {
      return _removeStyle(node, key);
    });
  }
}

module.exports = exports.default;
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _shallowEqual = _interopRequireDefault(require("./shallowEqual"));

function shallowEqualArray(a, b) {
  if (a === b) {
    return true;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (var i = 0; i < a.length; i += 1) {
    if (!(0, _shallowEqual.default)(a[i], b[i])) {
      return false;
    }
  }

  return true;
}

var _default = shallowEqualArray;
exports.default = _default;
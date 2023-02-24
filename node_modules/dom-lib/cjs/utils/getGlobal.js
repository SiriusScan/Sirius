"use strict";

exports.__esModule = true;
exports["default"] = void 0;

// the only reliable means to get the global object is
// `Function('return this')()`
// However, this causes CSP violations in Chrome apps.
// https://github.com/tc39/proposal-global
function getGlobal() {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }

  if (typeof self !== 'undefined') {
    return self;
  }

  if (typeof window !== 'undefined') {
    return window;
  }

  throw new Error('unable to locate global object');
}

var _default = getGlobal;
exports["default"] = _default;
module.exports = exports.default;
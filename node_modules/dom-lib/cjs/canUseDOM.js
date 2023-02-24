"use strict";

exports.__esModule = true;
exports["default"] = void 0;

/**
 * Checks if the current environment is in the browser and can access and modify the DOM.
 */
var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
var _default = canUseDOM;
exports["default"] = _default;
module.exports = exports.default;
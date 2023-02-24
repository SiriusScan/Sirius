"use strict";

exports.__esModule = true;
exports["default"] = on;

/**
 * Unbind `target` event `eventName`'s callback `listener`.
 * @param target The DOM element
 * @param eventName The event name
 * @param listener  The event listener
 * @param options The event options
 */
function on(target, eventName, listener, options) {
  if (options === void 0) {
    options = false;
  }

  target.removeEventListener(eventName, listener, options);
}

module.exports = exports.default;
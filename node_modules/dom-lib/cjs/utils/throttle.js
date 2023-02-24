"use strict";

exports.__esModule = true;
exports["default"] = throttle;

/**
 * @author {@link https://github.com/jashkenas/underscore underscorejs}.
 * @version 1.7.0
 * @see {@link http://underscorejs.org/#throttle underscore.throttle(function, wait, [immediate])}
 * @param func
 * @param wait
 * @param options
 * @returns {throttled}
 */

/* eslint-disable */
function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;

  var _now = Date.now || function () {
    return new Date().getTime();
  };

  if (!options) {
    options = {};
  }

  var later = function later() {
    previous = options.leading === false ? 0 : _now();
    timeout = null;
    result = func.apply(context, args);

    if (!timeout) {
      context = args = null;
    }
  };

  return function () {
    var now = _now();

    if (!previous && options.leading === false) {
      previous = now;
    }

    var remaining = wait - (now - previous);
    context = this;
    args = arguments;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previous = now;
      result = func.apply(context, args);

      if (!timeout) {
        context = args = null;
      }
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }

    return result;
  };
}

module.exports = exports.default;
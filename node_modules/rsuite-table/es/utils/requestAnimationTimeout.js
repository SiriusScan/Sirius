import requestAnimationFramePolyfill from 'dom-lib/requestAnimationFramePolyfill';
import cancelAnimationFramePolyfill from 'dom-lib/cancelAnimationFramePolyfill';
export var cancelAnimationTimeout = function cancelAnimationTimeout(frame) {
  return cancelAnimationFramePolyfill(frame.id);
};
/**
 * Recursively calls requestAnimationFrame until a specified delay has been met or exceeded.
 * When the delay time has been reached the function you're timing out will be called.
 *
 * Credit: Joe Lambert (https://gist.github.com/joelambert/1002116#file-requesttimeout-js)
 */

export var requestAnimationTimeout = function requestAnimationTimeout(callback, delay) {
  var start; // wait for end of processing current event handler, because event handler may be long

  Promise.resolve().then(function () {
    start = Date.now();
  });
  var frame = {};

  var timeout = function timeout() {
    if (Date.now() - start >= delay) {
      callback.call(null);
    } else {
      frame.id = requestAnimationFramePolyfill(timeout);
    }
  };

  frame = {
    id: requestAnimationFramePolyfill(timeout)
  };
  return frame;
};
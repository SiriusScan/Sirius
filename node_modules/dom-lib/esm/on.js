/**
 * Bind `target` event `eventName`'s callback `listener`.
 * @param target The DOM element
 * @param eventType The event name
 * @param listener  The event listener
 * @param options   The event options
 * @returns   The event listener
 */
export default function on(target, eventType, listener, options) {
  if (options === void 0) {
    options = false;
  }

  target.addEventListener(eventType, listener, options);
  return {
    off: function off() {
      target.removeEventListener(eventType, listener, options);
    }
  };
}
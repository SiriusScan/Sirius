/**
 * Unbind `target` event `eventName`'s callback `listener`.
 * @param target The DOM element
 * @param eventName The event name
 * @param listener  The event listener
 * @param options The event options
 */
export default function on(target, eventName, listener, options) {
  if (options === void 0) {
    options = false;
  }

  target.removeEventListener(eventName, listener, options);
}
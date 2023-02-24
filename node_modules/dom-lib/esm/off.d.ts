export interface CustomEventListener<T = any> {
    (evt: T): void;
}
/**
 * Unbind `target` event `eventName`'s callback `listener`.
 * @param target The DOM element
 * @param eventName The event name
 * @param listener  The event listener
 * @param options The event options
 */
export default function on<K extends keyof DocumentEventMap>(target: Element | Window | Document | EventTarget, eventName: K, listener: EventListenerOrEventListenerObject | CustomEventListener, options?: boolean | AddEventListenerOptions): void;

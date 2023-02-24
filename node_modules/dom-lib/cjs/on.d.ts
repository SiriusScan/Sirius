export interface CustomEventListener<T = any> {
    (evt: T): void;
}
/**
 * Bind `target` event `eventName`'s callback `listener`.
 * @param target The DOM element
 * @param eventType The event name
 * @param listener  The event listener
 * @param options   The event options
 * @returns   The event listener
 */
export default function on<K extends keyof DocumentEventMap>(target: Element | Window | Document | EventTarget, eventType: K, listener: EventListenerOrEventListenerObject | CustomEventListener, options?: boolean | AddEventListenerOptions): {
    off: () => void;
};

/**
 * Force React to flush any updates inside the provided callback synchronously.
 * This ensures that the DOM is updated immediately.
 */
declare const flushSync: (callback: any) => void;
export default flushSync;

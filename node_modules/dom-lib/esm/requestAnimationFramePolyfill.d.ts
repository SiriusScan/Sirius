/// <reference types="node" />
declare function _setTimeout(callback: (t: number) => void): NodeJS.Timeout;
/**
 * @deprecated Use `requestAnimationFrame` instead.
 */
declare const requestAnimationFramePolyfill: typeof requestAnimationFrame | typeof _setTimeout;
export default requestAnimationFramePolyfill;

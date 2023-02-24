export declare const cancelAnimationTimeout: (frame: KeyframeAnimationOptions) => void;
/**
 * Recursively calls requestAnimationFrame until a specified delay has been met or exceeded.
 * When the delay time has been reached the function you're timing out will be called.
 *
 * Credit: Joe Lambert (https://gist.github.com/joelambert/1002116#file-requesttimeout-js)
 */
export declare const requestAnimationTimeout: (callback: () => void, delay: number) => KeyframeAnimationOptions;

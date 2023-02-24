/**
 * Source code reference from:
 * https://github.com/facebook/fbjs/blob/master/packages/fbjs/src/dom/DOMMouseMoveTracker.js
 */
/**
 * Mouse drag tracker, get the coordinate value where the mouse moves in time.
 *
 * ```typescript
 * const tracker = new DOMMouseMoveTracker(
 *   onMove:(deltaX: number, deltaY: number, moveEvent: Object) => void,
 *   onMoveEnd:() => void,
 *   container: HTMLElement
 * );
 * ```
 */
declare class DOMMouseMoveTracker {
    isDraggingStatus: boolean;
    animationFrameID: any;
    domNode: Element;
    onMove: any;
    onMoveEnd: any;
    eventMoveToken: any;
    eventUpToken: any;
    moveEvent: any;
    deltaX: number;
    deltaY: number;
    x: number;
    y: number;
    /**
     * onMove is the callback that will be called on every mouse move.
     * onMoveEnd is called on mouse up when movement has ended.
     */
    constructor(onMove: (x: number, y: number, e: any) => void, onMoveEnd: (e: any) => void, domNode: Element);
    /**
     * This is to set up the listeners for listening to mouse move
     * and mouse up signaling the movement has ended. Please note that these
     * listeners are added at the document.body level. It takes in an event
     * in order to grab inital state.
     */
    captureMouseMoves(event: any): void;
    /**
     * These releases all of the listeners on document.body.
     */
    releaseMouseMoves(): void;
    /**
     * Returns whether or not if the mouse movement is being tracked.
     */
    isDragging: () => boolean;
    /**
     * Calls onMove passed into constructor and updates internal state.
     */
    onMouseMove: (event: any) => void;
    didMouseMove: () => void;
    /**
     * Calls onMoveEnd passed into constructor and updates internal state.
     */
    onMouseUp: (event: any) => void;
}
export default DOMMouseMoveTracker;

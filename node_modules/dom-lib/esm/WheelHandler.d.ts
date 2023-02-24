/**
 * Used to handle scrolling trackpad and mouse wheel events.
 */
declare class WheelHandler {
    animationFrameID: any;
    deltaX: number;
    deltaY: number;
    handleScrollX: any;
    handleScrollY: any;
    stopPropagation: any;
    onWheelCallback: any;
    constructor(onWheel: any, handleScrollX: any, handleScrollY: any, stopPropagation: any);
    /**
     * Binds the wheel handler.
     * @param event The wheel event.
     */
    onWheel(event: any): void;
    /**
     * Fires a callback if the wheel event has changed.
     */
    didWheel(): void;
}
export default WheelHandler;

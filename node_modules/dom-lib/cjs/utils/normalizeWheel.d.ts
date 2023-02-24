declare function normalizeWheel(event: any): {
    spinX: number;
    spinY: number;
    pixelX: number;
    pixelY: number;
};
declare namespace normalizeWheel {
    var getEventType: () => "wheel" | "DOMMouseScroll" | "mousewheel";
}
export default normalizeWheel;

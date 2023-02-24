export declare type Offset = {
    top: number;
    left: number;
    height: number;
    width: number;
};
/**
 * Get the offset of a DOM element
 * @param node The DOM element
 * @returns The offset of the DOM element
 */
export default function getOffset(node: Element | null): Offset | DOMRect | null;

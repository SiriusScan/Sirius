import { Offset } from './getOffset';
/**
 * Get the position of a DOM element
 * @param node  The DOM element
 * @param offsetParent  The offset parent of the DOM element
 * @param calcMargin  Whether to calculate the margin
 * @returns  The position of the DOM element
 */
export default function getPosition(node: Element, offsetParent?: Element, calcMargin?: boolean): Offset | DOMRect | null;

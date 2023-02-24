/**
 * Get a DOM container
 * @param container
 * @param defaultContainer
 * @returns
 */
export default function getContainer(container: Element | null | (() => Element | null), defaultContainer?: Element): Element;

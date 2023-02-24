export interface CSSProperty {
    [key: string]: string | number;
}
/**
 * Apply a single CSS style rule to a given element
 *
 * @param node The element to add styles to
 * @param property The style property to be added
 * @param value The style value to be added
 */
declare function addStyle(node: Element, property: string, value: string | number): void;
/**
 * Apply multiple CSS style rules to a given element
 *
 * @param node The element to add styles to
 * @param properties The key-value object of style properties to be added
 */
declare function addStyle(node: Element, properties: Partial<CSSProperty>): void;
export default addStyle;

/**
 * @param {string} property Name of a css property to check for.
 * @return {?string} property name supported in the browser, or null if not
 * supported.
 */
declare function getVendorPrefixedName(property: string): any;
export default getVendorPrefixedName;

/**
 * From: https://github.com/facebook/fbjs/blob/master/packages/fbjs/src/core/shallowEqual.js
 * @providesModule shallowEqual
 * @typechecks
 * @flow
 */
/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
declare function shallowEqual(objA: any, objB: any): boolean;
export default shallowEqual;

/**
 * placementPolyfill('bottomLeft');
 * output 'bottomStart'
 */
declare function placementPolyfill<T = string>(placement: T, rtl?: boolean): T;
export default placementPolyfill;

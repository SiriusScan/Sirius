/**
 * 根据条件，选择性调用 a 与 b 其中一个方法。
 * @param a
 * @param b
 */
declare function toggle(a: any, b: any): (target: HTMLElement, value: any[]) => (condition: any) => void;
export default toggle;

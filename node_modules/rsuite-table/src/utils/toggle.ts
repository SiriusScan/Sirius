/**
 * 根据条件，选择性调用 a 与 b 其中一个方法。
 * @param a
 * @param b
 */
function toggle(a: any, b: any) {
  return (target: HTMLElement, value: any[]) => {
    const options = [target, ...value];
    return condition => {
      if (condition) {
        a(...options);
      } else {
        b(...options);
      }
    };
  };
}

export default toggle;

/**
 * 根据条件，选择性调用 a 与 b 其中一个方法。
 * @param a
 * @param b
 */
function toggle(a, b) {
  return function (target, value) {
    var options = [target].concat(value);
    return function (condition) {
      if (condition) {
        a.apply(void 0, options);
      } else {
        b.apply(void 0, options);
      }
    };
  };
}

export default toggle;
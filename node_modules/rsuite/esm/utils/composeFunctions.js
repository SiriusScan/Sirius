export default (function () {
  for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return function (first) {
    return fns.reduce(function (previousValue, fn) {
      return fn(previousValue);
    }, first);
  };
});
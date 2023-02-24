import { useEffect, useCallback, useRef } from 'react';
/**
 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
 * @param {function} fn
 */

export default function useEventCallback(fn) {
  var ref = useRef(fn);
  useEffect(function () {
    ref.current = fn;
  });
  return useCallback(function () {
    var _ref$current;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return (_ref$current = ref.current) === null || _ref$current === void 0 ? void 0 : _ref$current.call.apply(_ref$current, [ref].concat(args));
  }, []);
}
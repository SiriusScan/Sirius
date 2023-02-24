"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = useWillUnmount;

var _useUpdatedRef = _interopRequireDefault(require("./useUpdatedRef"));

var _react = require("react");

/**
 * Attach a callback that fires when a component unmounts
 *
 * @param fn Handler to run when the component unmounts
 * @category effects
 */
function useWillUnmount(fn) {
  var onUnmount = (0, _useUpdatedRef.default)(fn); // eslint-disable-next-line react-hooks/exhaustive-deps

  (0, _react.useEffect)(function () {
    return function () {
      return onUnmount.current();
    };
  }, []);
}
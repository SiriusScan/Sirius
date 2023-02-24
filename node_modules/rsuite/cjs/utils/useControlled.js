"use strict";

exports.__esModule = true;
exports.default = void 0;

var _react = require("react");

function useControlled(controlledValue, defaultValue) {
  var controlledRef = (0, _react.useRef)(false);
  controlledRef.current = controlledValue !== undefined;

  var _useState = (0, _react.useState)(defaultValue),
      uncontrolledValue = _useState[0],
      setUncontrolledValue = _useState[1]; // If it is controlled, this directly returns the attribute value.


  var value = controlledRef.current ? controlledValue : uncontrolledValue;
  var setValue = (0, _react.useCallback)(function (nextValue) {
    // Only update the value in state when it is not under control.
    if (!controlledRef.current) {
      setUncontrolledValue(nextValue);
    }
  }, [controlledRef]);
  return [value, setValue, controlledRef.current];
}

var _default = useControlled;
exports.default = _default;
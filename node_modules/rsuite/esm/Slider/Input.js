import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
var rangeStyles = {
  position: 'absolute',
  overflow: 'hidden',
  width: '100%',
  height: '100%',
  clip: 'rect(0, 0, 0, 0)'
};
var Input = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var style = props.style,
      rest = _objectWithoutPropertiesLoose(props, ["style"]);

  return /*#__PURE__*/React.createElement("input", _extends({
    type: "range",
    readOnly: true,
    ref: ref,
    style: _extends({}, rangeStyles, style)
  }, rest));
});
Input.displayName = 'Input';
export default Input;
import _extends from "@babel/runtime/helpers/esm/extends";
import React from 'react';
import TextMask from './TextMask';
import Input from '../Input';
var MaskedInput = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      inputAs = _props$as === void 0 ? TextMask : _props$as;
  return /*#__PURE__*/React.createElement(Input, _extends({}, props, {
    as: inputAs,
    ref: ref
  }));
});
export default MaskedInput;
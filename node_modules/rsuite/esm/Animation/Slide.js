import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import Transition from './Transition';
import { useClassNames } from '../utils';
var Slide = /*#__PURE__*/React.forwardRef(function (_ref, ref) {
  var _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? 300 : _ref$timeout,
      _ref$placement = _ref.placement,
      placement = _ref$placement === void 0 ? 'right' : _ref$placement,
      props = _objectWithoutPropertiesLoose(_ref, ["timeout", "placement"]);

  var _useClassNames = useClassNames('anim'),
      prefix = _useClassNames.prefix;

  var enterClassName = prefix('slide-in', placement);
  var exitClassName = prefix('slide-out', placement);
  return /*#__PURE__*/React.createElement(Transition, _extends({}, props, {
    ref: ref,
    animation: true,
    timeout: timeout,
    enteringClassName: enterClassName,
    enteredClassName: enterClassName,
    exitingClassName: exitClassName,
    exitedClassName: exitClassName
  }));
});
Slide.displayName = 'Slide';
export default Slide;
import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import Transition from './Transition';
import { useClassNames } from '../utils';
var Fade = /*#__PURE__*/React.forwardRef(function (_ref, ref) {
  var _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? 300 : _ref$timeout,
      className = _ref.className,
      props = _objectWithoutPropertiesLoose(_ref, ["timeout", "className"]);

  var _useClassNames = useClassNames('anim'),
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge;

  return /*#__PURE__*/React.createElement(Transition, _extends({}, props, {
    ref: ref,
    timeout: timeout,
    className: merge(className, prefix('fade')),
    enteredClassName: prefix('in'),
    enteringClassName: prefix('in')
  }));
});
Fade.displayName = 'Fade';
export default Fade;
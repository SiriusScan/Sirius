import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import Transition from './Transition';
import { useClassNames } from '../utils';
var Bounce = /*#__PURE__*/React.forwardRef(function (_ref, ref) {
  var _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? 300 : _ref$timeout,
      props = _objectWithoutPropertiesLoose(_ref, ["timeout"]);

  var _useClassNames = useClassNames('anim'),
      prefix = _useClassNames.prefix;

  return /*#__PURE__*/React.createElement(Transition, _extends({}, props, {
    ref: ref,
    animation: true,
    timeout: timeout,
    enteringClassName: prefix('bounce-in'),
    enteredClassName: prefix('bounce-in'),
    exitingClassName: prefix('bounce-out'),
    exitedClassName: prefix('bounce-out')
  }));
});
Bounce.displayName = 'Bounce';
export default Bounce;
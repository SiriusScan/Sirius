import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
import Button from '../Button';
var IconButton = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var icon = props.icon,
      _props$placement = props.placement,
      placement = _props$placement === void 0 ? 'left' : _props$placement,
      children = props.children,
      circle = props.circle,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'btn-icon' : _props$classPrefix,
      className = props.className,
      rest = _objectWithoutPropertiesLoose(props, ["icon", "placement", "children", "circle", "classPrefix", "className"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix("placement-" + placement, {
    circle: circle,
    'with-text': typeof children !== 'undefined'
  }));
  return /*#__PURE__*/React.createElement(Button, _extends({}, rest, {
    ref: ref,
    className: classes
  }), icon, children);
});
IconButton.displayName = 'IconButton';
IconButton.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.any,
  classPrefix: PropTypes.string,
  circle: PropTypes.bool,
  children: PropTypes.node,
  placement: PropTypes.oneOf(['left', 'right'])
};
export default IconButton;
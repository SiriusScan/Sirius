import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import { useClassNames } from '../utils';
import useToggleCaret from '../utils/useToggleCaret';
var DropdownToggle = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? Button : _props$as,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'dropdown-toggle' : _props$classPrefix,
      renderToggle = props.renderToggle,
      children = props.children,
      icon = props.icon,
      noCaret = props.noCaret,
      _props$placement = props.placement,
      placement = _props$placement === void 0 ? 'bottomStart' : _props$placement,
      rest = _objectWithoutPropertiesLoose(props, ["as", "className", "classPrefix", "renderToggle", "children", "icon", "noCaret", "placement"]);

  var _useClassNames = useClassNames(classPrefix),
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    'no-caret': noCaret
  })); // Caret icon is down by default, when Dropdown is used in Sidenav.

  var Caret = useToggleCaret(placement);
  var toggle = /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), icon && /*#__PURE__*/React.cloneElement(icon, {
    className: prefix('icon')
  }), children, noCaret ? null : /*#__PURE__*/React.createElement(Caret, {
    className: prefix('caret')
  }));
  return renderToggle ? renderToggle(rest, ref) : toggle;
});
DropdownToggle.displayName = 'DropdownToggle';
DropdownToggle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.node,
  classPrefix: PropTypes.string,
  noCaret: PropTypes.bool,
  as: PropTypes.elementType,
  renderToggle: PropTypes.func,
  placement: PropTypes.oneOf(['bottomStart', 'bottomEnd', 'topStart', 'topEnd', 'leftStart', 'rightStart', 'leftEnd', 'rightEnd'])
};
export default DropdownToggle;
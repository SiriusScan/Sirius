import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
var DropdownMenuItem = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      active = props.active,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'dropdown-menu-item' : _props$classPrefix,
      children = props.children,
      className = props.className,
      disabled = props.disabled,
      focus = props.focus,
      value = props.value,
      onKeyDown = props.onKeyDown,
      onSelect = props.onSelect,
      renderItem = props.renderItem,
      rest = _objectWithoutPropertiesLoose(props, ["as", "active", "classPrefix", "children", "className", "disabled", "focus", "value", "onKeyDown", "onSelect", "renderItem"]);

  var handleClick = useCallback(function (event) {
    event.preventDefault();

    if (!disabled) {
      onSelect === null || onSelect === void 0 ? void 0 : onSelect(value, event);
    }
  }, [onSelect, disabled, value]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = withClassPrefix({
    active: active,
    focus: focus,
    disabled: disabled
  });
  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "option",
    "aria-selected": active,
    "aria-disabled": disabled,
    "data-key": value
  }, rest, {
    ref: ref,
    className: className,
    tabIndex: -1,
    onKeyDown: disabled ? null : onKeyDown,
    onClick: handleClick
  }), /*#__PURE__*/React.createElement("span", {
    className: classes
  }, renderItem ? renderItem(value) : children));
});
DropdownMenuItem.displayName = 'DropdownMenuItem';
DropdownMenuItem.propTypes = {
  classPrefix: PropTypes.string,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.any,
  onSelect: PropTypes.func,
  onKeyDown: PropTypes.func,
  focus: PropTypes.bool,
  title: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  as: PropTypes.elementType
};
export default DropdownMenuItem;
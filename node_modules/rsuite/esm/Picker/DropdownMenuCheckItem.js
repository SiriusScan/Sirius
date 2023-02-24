import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
import Checkbox from '../Checkbox';
var DropdownMenuCheckItem = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$active = props.active,
      active = _props$active === void 0 ? false : _props$active,
      _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$checkboxAs = props.checkboxAs,
      CheckboxItem = _props$checkboxAs === void 0 ? Checkbox : _props$checkboxAs,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'check-item' : _props$classPrefix,
      _props$checkable = props.checkable,
      checkable = _props$checkable === void 0 ? true : _props$checkable,
      disabled = props.disabled,
      value = props.value,
      focus = props.focus,
      children = props.children,
      className = props.className,
      indeterminate = props.indeterminate,
      onKeyDown = props.onKeyDown,
      onSelect = props.onSelect,
      onCheck = props.onCheck,
      onSelectItem = props.onSelectItem,
      rest = _objectWithoutPropertiesLoose(props, ["active", "as", "checkboxAs", "classPrefix", "checkable", "disabled", "value", "focus", "children", "className", "indeterminate", "onKeyDown", "onSelect", "onCheck", "onSelectItem"]);

  var handleChange = useCallback(function (value, checked, event) {
    onSelect === null || onSelect === void 0 ? void 0 : onSelect(value, event, checked);
  }, [onSelect]);
  var handleCheck = useCallback(function (event) {
    if (!disabled) {
      onCheck === null || onCheck === void 0 ? void 0 : onCheck(value, event, !active);
    }
  }, [value, disabled, onCheck, active]);
  var handleSelectItem = useCallback(function (event) {
    if (!disabled) {
      onSelectItem === null || onSelectItem === void 0 ? void 0 : onSelectItem(value, event, !active);
    }
  }, [value, disabled, onSelectItem, active]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix;

  var checkboxItemClasses = withClassPrefix({
    focus: focus
  });
  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "option",
    "aria-selected": active,
    "aria-disabled": disabled,
    "data-key": value
  }, rest, {
    ref: ref,
    className: className,
    tabIndex: -1
  }), /*#__PURE__*/React.createElement(CheckboxItem, {
    value: value,
    role: "checkbox",
    disabled: disabled,
    checked: active,
    checkable: checkable,
    indeterminate: indeterminate,
    className: checkboxItemClasses,
    onKeyDown: disabled ? null : onKeyDown,
    onChange: handleChange,
    onClick: handleSelectItem,
    onCheckboxClick: handleCheck
  }, children));
});
DropdownMenuCheckItem.displayName = 'DropdownMenuCheckItem';
DropdownMenuCheckItem.propTypes = {
  classPrefix: PropTypes.string,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  checkable: PropTypes.bool,
  indeterminate: PropTypes.bool,
  value: PropTypes.any,
  onSelect: PropTypes.func,
  onCheck: PropTypes.func,
  onSelectItem: PropTypes.func,
  onKeyDown: PropTypes.func,
  focus: PropTypes.bool,
  title: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  as: PropTypes.elementType,
  checkboxAs: PropTypes.elementType
};
export default DropdownMenuCheckItem;
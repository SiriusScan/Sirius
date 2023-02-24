"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _Checkbox = _interopRequireDefault(require("../Checkbox"));

var DropdownMenuCheckItem = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$active = props.active,
      active = _props$active === void 0 ? false : _props$active,
      _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$checkboxAs = props.checkboxAs,
      CheckboxItem = _props$checkboxAs === void 0 ? _Checkbox.default : _props$checkboxAs,
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
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["active", "as", "checkboxAs", "classPrefix", "checkable", "disabled", "value", "focus", "children", "className", "indeterminate", "onKeyDown", "onSelect", "onCheck", "onSelectItem"]);
  var handleChange = (0, _react.useCallback)(function (value, checked, event) {
    onSelect === null || onSelect === void 0 ? void 0 : onSelect(value, event, checked);
  }, [onSelect]);
  var handleCheck = (0, _react.useCallback)(function (event) {
    if (!disabled) {
      onCheck === null || onCheck === void 0 ? void 0 : onCheck(value, event, !active);
    }
  }, [value, disabled, onCheck, active]);
  var handleSelectItem = (0, _react.useCallback)(function (event) {
    if (!disabled) {
      onSelectItem === null || onSelectItem === void 0 ? void 0 : onSelectItem(value, event, !active);
    }
  }, [value, disabled, onSelectItem, active]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix;

  var checkboxItemClasses = withClassPrefix({
    focus: focus
  });
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "option",
    "aria-selected": active,
    "aria-disabled": disabled,
    "data-key": value
  }, rest, {
    ref: ref,
    className: className,
    tabIndex: -1
  }), /*#__PURE__*/_react.default.createElement(CheckboxItem, {
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
  classPrefix: _propTypes.default.string,
  active: _propTypes.default.bool,
  disabled: _propTypes.default.bool,
  checkable: _propTypes.default.bool,
  indeterminate: _propTypes.default.bool,
  value: _propTypes.default.any,
  onSelect: _propTypes.default.func,
  onCheck: _propTypes.default.func,
  onSelectItem: _propTypes.default.func,
  onKeyDown: _propTypes.default.func,
  focus: _propTypes.default.bool,
  title: _propTypes.default.string,
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  as: _propTypes.default.elementType,
  checkboxAs: _propTypes.default.elementType
};
var _default = DropdownMenuCheckItem;
exports.default = _default;
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

var DropdownMenuItem = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
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
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "active", "classPrefix", "children", "className", "disabled", "focus", "value", "onKeyDown", "onSelect", "renderItem"]);
  var handleClick = (0, _react.useCallback)(function (event) {
    event.preventDefault();

    if (!disabled) {
      onSelect === null || onSelect === void 0 ? void 0 : onSelect(value, event);
    }
  }, [onSelect, disabled, value]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = withClassPrefix({
    active: active,
    focus: focus,
    disabled: disabled
  });
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
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
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: classes
  }, renderItem ? renderItem(value) : children));
});

DropdownMenuItem.displayName = 'DropdownMenuItem';
DropdownMenuItem.propTypes = {
  classPrefix: _propTypes.default.string,
  active: _propTypes.default.bool,
  disabled: _propTypes.default.bool,
  value: _propTypes.default.any,
  onSelect: _propTypes.default.func,
  onKeyDown: _propTypes.default.func,
  focus: _propTypes.default.bool,
  title: _propTypes.default.string,
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  as: _propTypes.default.elementType
};
var _default = DropdownMenuItem;
exports.default = _default;
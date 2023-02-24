"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var Tooltip = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'tooltip' : _props$classPrefix,
      children = props.children,
      style = props.style,
      visible = props.visible,
      _props$arrow = props.arrow,
      arrow = _props$arrow === void 0 ? true : _props$arrow,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "classPrefix", "children", "style", "visible", "arrow"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix({
    arrow: arrow
  }));
  var styles = (0, _extends2.default)({
    opacity: visible ? 1 : undefined
  }, style);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "tooltip"
  }, rest, {
    ref: ref,
    className: classes,
    style: styles
  }), children);
});

Tooltip.displayName = 'Tooltip';
Tooltip.propTypes = {
  visible: _propTypes.default.bool,
  classPrefix: _propTypes.default.string,
  className: _propTypes.default.string,
  style: _propTypes.default.object,
  children: _propTypes.default.node,
  arrow: _propTypes.default.bool
};
var _default = Tooltip;
exports.default = _default;
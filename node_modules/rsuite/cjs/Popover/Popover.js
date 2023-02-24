"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _taggedTemplateLiteralLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteralLoose"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _templateObject, _templateObject2, _templateObject3;

var Popover = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'popover' : _props$classPrefix,
      title = props.title,
      children = props.children,
      style = props.style,
      visible = props.visible,
      className = props.className,
      full = props.full,
      _props$arrow = props.arrow,
      arrow = _props$arrow === void 0 ? true : _props$arrow,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "title", "children", "style", "visible", "className", "full", "arrow"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix({
    full: full
  }));
  var styles = (0, _extends2.default)({
    display: 'block',
    opacity: visible ? 1 : undefined
  }, style);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "dialog"
  }, rest, {
    ref: ref,
    className: classes,
    style: styles
  }), arrow && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix(_templateObject || (_templateObject = (0, _taggedTemplateLiteralLoose2.default)(["arrow"]))),
    "aria-hidden": true
  }), title && /*#__PURE__*/_react.default.createElement("h3", {
    className: prefix(_templateObject2 || (_templateObject2 = (0, _taggedTemplateLiteralLoose2.default)(["title"])))
  }, title), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix(_templateObject3 || (_templateObject3 = (0, _taggedTemplateLiteralLoose2.default)(["content"])))
  }, children));
});

Popover.displayName = 'Popover';
Popover.propTypes = {
  as: _propTypes.default.elementType,
  classPrefix: _propTypes.default.string,
  children: _propTypes.default.node,
  title: _propTypes.default.node,
  style: _propTypes.default.object,
  visible: _propTypes.default.bool,
  className: _propTypes.default.string,
  full: _propTypes.default.bool,
  arrow: _propTypes.default.bool
};
var _default = Popover;
exports.default = _default;
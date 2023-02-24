"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _taggedTemplateLiteralLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteralLoose"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _CloseButton = _interopRequireDefault(require("../CloseButton"));

var _templateObject, _templateObject2;

var Tag = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'tag' : _props$classPrefix,
      _props$size = props.size,
      size = _props$size === void 0 ? 'md' : _props$size,
      _props$color = props.color,
      color = _props$color === void 0 ? 'default' : _props$color,
      children = props.children,
      closable = props.closable,
      className = props.className,
      onClose = props.onClose,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "size", "color", "children", "closable", "className", "onClose"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix(size, color, {
    closable: closable
  }));
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix(_templateObject || (_templateObject = (0, _taggedTemplateLiteralLoose2.default)(["text"])))
  }, children), closable && /*#__PURE__*/_react.default.createElement(_CloseButton.default, {
    className: prefix(_templateObject2 || (_templateObject2 = (0, _taggedTemplateLiteralLoose2.default)(["icon-close"]))),
    onClick: onClose
  }));
});

Tag.displayName = 'Tag';
Tag.propTypes = {
  closable: _propTypes.default.bool,
  classPrefix: _propTypes.default.string,
  onClose: _propTypes.default.func,
  children: _propTypes.default.node,
  className: _propTypes.default.string,
  as: _propTypes.default.elementType
};
var _default = Tag;
exports.default = _default;
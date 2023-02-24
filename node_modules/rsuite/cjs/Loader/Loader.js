"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var Loader = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'loader' : _props$classPrefix,
      className = props.className,
      inverse = props.inverse,
      backdrop = props.backdrop,
      _props$speed = props.speed,
      speed = _props$speed === void 0 ? 'normal' : _props$speed,
      center = props.center,
      vertical = props.vertical,
      content = props.content,
      size = props.size,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "inverse", "backdrop", "speed", "center", "vertical", "content", "size"]);
  var hasContent = !!content;

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var classes = merge(className, prefix('wrapper', "speed-" + speed, size, {
    'backdrop-wrapper': backdrop,
    'has-content': hasContent,
    vertical: vertical,
    inverse: inverse,
    center: center
  }));
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "progressbar"
  }, rest, {
    ref: ref,
    className: classes
  }), backdrop && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('backdrop')
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: withClassPrefix()
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('spin')
  }), hasContent && /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('content')
  }, content)));
});

Loader.displayName = 'Loader';
Loader.propTypes = {
  as: _propTypes.default.elementType,
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  center: _propTypes.default.bool,
  backdrop: _propTypes.default.bool,
  inverse: _propTypes.default.bool,
  vertical: _propTypes.default.bool,
  content: _propTypes.default.node,
  size: _propTypes.default.oneOf(['lg', 'md', 'sm', 'xs']),
  speed: _propTypes.default.oneOf(['normal', 'fast', 'slow'])
};
var _default = Loader;
exports.default = _default;
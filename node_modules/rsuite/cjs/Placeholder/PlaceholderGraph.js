"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var PlaceholderGraph = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      width = props.width,
      _props$height = props.height,
      height = _props$height === void 0 ? 200 : _props$height,
      style = props.style,
      active = props.active,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'placeholder' : _props$classPrefix,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "width", "height", "style", "active", "classPrefix"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix('graph', {
    active: active
  }));
  var styles = (0, _extends2.default)({
    width: width || '100%',
    height: height
  }, style);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes,
    style: styles
  }));
});

PlaceholderGraph.displayName = 'PlaceholderGraph';
PlaceholderGraph.propTypes = {
  className: _propTypes.default.string,
  style: _propTypes.default.object,
  classPrefix: _propTypes.default.string,
  width: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),
  height: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),
  active: _propTypes.default.bool
};
var _default = PlaceholderGraph;
exports.default = _default;
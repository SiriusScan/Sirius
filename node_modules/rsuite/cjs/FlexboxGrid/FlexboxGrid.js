"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _FlexboxGridItem = _interopRequireDefault(require("./FlexboxGridItem"));

var FlexboxGrid = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'flex-box-grid' : _props$classPrefix,
      _props$align = props.align,
      align = _props$align === void 0 ? 'top' : _props$align,
      _props$justify = props.justify,
      justify = _props$justify === void 0 ? 'start' : _props$justify,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "classPrefix", "align", "justify"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix(align, justify));
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }));
});

FlexboxGrid.Item = _FlexboxGridItem.default;
FlexboxGrid.displayName = 'FlexboxGrid';
FlexboxGrid.propTypes = {
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  align: _propTypes.default.oneOf(['top', 'middle', 'bottom']),
  justify: _propTypes.default.oneOf(['start', 'end', 'center', 'space-around', 'space-between'])
};
var _default = FlexboxGrid;
exports.default = _default;
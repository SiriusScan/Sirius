"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var Divider = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'divider' : _props$classPrefix,
      children = props.children,
      vertical = props.vertical,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "classPrefix", "children", "vertical"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix(vertical ? 'vertical' : 'horizontal', {
    'with-text': children
  }));
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "separator"
  }, rest, {
    ref: ref,
    className: classes,
    "aria-orientation": vertical ? 'vertical' : 'horizontal'
  }), children && /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('inner-text')
  }, children));
});

Divider.displayName = 'Divider';
Divider.propTypes = {
  as: _propTypes.default.elementType,
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  children: _propTypes.default.node,
  vertical: _propTypes.default.bool
};
var _default = Divider;
exports.default = _default;
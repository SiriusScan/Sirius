"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var Row = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'row' : _props$classPrefix,
      className = props.className,
      gutter = props.gutter,
      children = props.children,
      style = props.style,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "gutter", "children", "style"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix());
  var cols = children;
  var rowStyles = style;

  if (typeof gutter !== 'undefined') {
    var padding = gutter / 2;
    cols = _utils.ReactChildren.mapCloneElement(children, function (child) {
      return (0, _extends2.default)({}, child.props, {
        style: (0, _extends2.default)({}, child.props.style, {
          paddingLeft: padding,
          paddingRight: padding
        })
      });
    });
    rowStyles = (0, _extends2.default)({}, style, {
      marginLeft: -padding,
      marginRight: -padding
    });
  }

  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "row"
  }, rest, {
    ref: ref,
    className: classes,
    style: rowStyles
  }), cols);
});

Row.displayName = 'Row';
Row.propTypes = {
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  gutter: _propTypes.default.number,
  style: _propTypes.default.any,
  as: _propTypes.default.elementType,
  children: _propTypes.default.node
};
var _default = Row;
exports.default = _default;
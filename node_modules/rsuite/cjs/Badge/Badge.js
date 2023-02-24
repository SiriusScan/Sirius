"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var Badge = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      contentText = props.content,
      color = props.color,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'badge' : _props$classPrefix,
      children = props.children,
      _props$maxCount = props.maxCount,
      maxCount = _props$maxCount === void 0 ? 99 : _props$maxCount,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "content", "color", "className", "classPrefix", "children", "maxCount"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge;

  var dot = contentText === undefined || contentText === null;
  var classes = merge(className, withClassPrefix(color, {
    independent: !children,
    wrapper: children,
    dot: dot
  }));

  if (contentText === false) {
    return /*#__PURE__*/_react.default.cloneElement(children, {
      ref: ref
    });
  }

  var content = typeof contentText === 'number' && contentText > maxCount ? maxCount + "+" : contentText;

  if (!children) {
    return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
      ref: ref,
      className: classes
    }), content);
  }

  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), children, /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('content')
  }, content));
});

Badge.displayName = 'Badge';
Badge.propTypes = {
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  children: _propTypes.default.node,
  as: _propTypes.default.elementType,
  content: _propTypes.default.oneOfType([_propTypes.default.node, _propTypes.default.bool]),
  maxCount: _propTypes.default.number,
  color: _propTypes.default.oneOf(['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'])
};
var _default = Badge;
exports.default = _default;
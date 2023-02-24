"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var TimelineItem = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'li' : _props$as,
      children = props.children,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'timeline-item' : _props$classPrefix,
      last = props.last,
      className = props.className,
      dot = props.dot,
      time = props.time,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "children", "classPrefix", "last", "className", "dot", "time"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix({
    last: last
  }));
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('tail')
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('dot', {
      'custom-dot': dot
    })
  }, dot), time && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('time')
  }, time), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('content')
  }, children));
});

TimelineItem.displayName = 'TimelineItem';
TimelineItem.propTypes = {
  last: _propTypes.default.bool,
  dot: _propTypes.default.node,
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  classPrefix: _propTypes.default.string,
  as: _propTypes.default.elementType
};
var _default = TimelineItem;
exports.default = _default;
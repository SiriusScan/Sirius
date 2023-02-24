"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _some = _interopRequireDefault(require("lodash/some"));

var _TimelineItem = _interopRequireDefault(require("./TimelineItem"));

var _utils = require("../utils");

var Timeline = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var children = props.children,
      _props$as = props.as,
      Component = _props$as === void 0 ? 'ul' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'timeline' : _props$classPrefix,
      className = props.className,
      _props$align = props.align,
      align = _props$align === void 0 ? 'left' : _props$align,
      endless = props.endless,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["children", "as", "classPrefix", "className", "align", "endless"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var count = _react.default.Children.count(children);

  var withTime = (0, _some.default)(_react.default.Children.toArray(children), function (item) {
    var _item$props;

    return item === null || item === void 0 ? void 0 : (_item$props = item.props) === null || _item$props === void 0 ? void 0 : _item$props.time;
  });
  var classes = merge(className, withClassPrefix("align-" + align, {
    endless: endless,
    'with-time': withTime
  }));
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), _utils.ReactChildren.mapCloneElement(children, function (_child, index) {
    return {
      last: index + 1 === count,
      align: align
    };
  }));
});

Timeline.Item = _TimelineItem.default;
Timeline.displayName = 'Timeline';
Timeline.propTypes = {
  as: _propTypes.default.elementType,
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  children: _propTypes.default.node,
  align: _propTypes.default.oneOf(['left', 'right', 'alternate']),
  endless: _propTypes.default.bool
};
var _default = Timeline;
exports.default = _default;
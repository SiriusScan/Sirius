"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _StepItem = _interopRequireDefault(require("./StepItem"));

var Steps = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'steps' : _props$classPrefix,
      className = props.className,
      children = props.children,
      vertical = props.vertical,
      small = props.small,
      _props$current = props.current,
      current = _props$current === void 0 ? 0 : _props$current,
      _props$currentStatus = props.currentStatus,
      currentStatus = _props$currentStatus === void 0 ? 'process' : _props$currentStatus,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "children", "vertical", "small", "current", "currentStatus"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix;

  var horizontal = !vertical;
  var classes = merge(className, withClassPrefix({
    small: small,
    vertical: vertical,
    horizontal: !vertical
  }));

  var count = _react.default.Children.count(children);

  var items = _utils.ReactChildren.mapCloneElement(children, function (item, index) {
    var itemStyles = {
      flexBasis: index < count - 1 ? 100 / (count - 1) + "%" : undefined,
      maxWidth: index === count - 1 ? 100 / count + "%" : undefined
    };
    var itemProps = (0, _extends2.default)({
      stepNumber: index + 1,
      status: 'wait',
      style: horizontal ? itemStyles : undefined
    }, item.props); // fix tail color

    if (currentStatus === 'error' && index === current - 1) {
      itemProps.className = prefix('next-error');
    }

    if (!item.props.status) {
      if (index === current) {
        itemProps.status = currentStatus;
        itemProps.className = merge(itemProps.className, prefix('item-active'));
      } else if (index < current) {
        itemProps.status = 'finish';
      }
    }

    return itemProps;
  });

  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), items);
});

Steps.Item = _StepItem.default;
Steps.displayName = 'Steps';
Steps.propTypes = {
  classPrefix: _propTypes.default.string,
  vertical: _propTypes.default.bool,
  small: _propTypes.default.bool,
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  current: _propTypes.default.number,
  currentStatus: _propTypes.default.oneOf(['finish', 'wait', 'process', 'error'])
};
var _default = Steps;
exports.default = _default;
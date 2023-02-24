"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.AvatarGroupContext = void 0;

var _extends3 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var AvatarGroupContext = /*#__PURE__*/_react.default.createContext({});

exports.AvatarGroupContext = AvatarGroupContext;

var AvatarGroup = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'avatar-group' : _props$classPrefix,
      spacing = props.spacing,
      className = props.className,
      children = props.children,
      stack = props.stack,
      size = props.size,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "spacing", "className", "children", "stack", "size"]);

  var _useCustom = (0, _utils.useCustom)('AvatarGroup'),
      rtl = _useCustom.rtl;

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    stack: stack
  }));
  var contextValue = (0, _react.useMemo)(function () {
    return {
      size: size
    };
  }, [size]);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends3.default)({}, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/_react.default.createElement(AvatarGroupContext.Provider, {
    value: contextValue
  }, spacing ? _react.default.Children.map(children, function (child) {
    var _extends2;

    return /*#__PURE__*/_react.default.cloneElement(child, {
      style: (0, _extends3.default)((_extends2 = {}, _extends2[rtl ? 'marginLeft' : 'marginRight'] = spacing, _extends2), child.props.style)
    });
  }) : children));
});

AvatarGroup.displayName = 'AvatarGroup';
AvatarGroup.propTypes = {
  as: _propTypes.default.elementType,
  classPrefix: _propTypes.default.string,
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  stack: _propTypes.default.bool,
  spacing: _propTypes.default.number,
  size: _propTypes.default.oneOf(['lg', 'md', 'sm', 'xs'])
};
var _default = AvatarGroup;
exports.default = _default;
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Slide = _interopRequireDefault(require("../Animation/Slide"));

var _Modal = _interopRequireDefault(require("../Modal"));

var _utils = require("../utils");

var _deprecateComponent = _interopRequireDefault(require("../utils/deprecateComponent"));

var DrawerBody = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  return /*#__PURE__*/_react.default.createElement(_Modal.default.Body, (0, _extends2.default)({
    classPrefix: "drawer-body"
  }, props, {
    ref: ref
  }));
});

var DrawerHeader = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  return /*#__PURE__*/_react.default.createElement(_Modal.default.Header, (0, _extends2.default)({
    classPrefix: "drawer-header"
  }, props, {
    ref: ref
  }));
});

var DrawerActions = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  return /*#__PURE__*/_react.default.createElement(_Modal.default.Footer, (0, _extends2.default)({
    classPrefix: "drawer-actions"
  }, props, {
    ref: ref
  }));
});

var DrawerFooter = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  return /*#__PURE__*/_react.default.createElement(_Modal.default.Footer, (0, _extends2.default)({
    classPrefix: "drawer-footer"
  }, props, {
    ref: ref
  }));
});

var DrawerTitle = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  return /*#__PURE__*/_react.default.createElement(_Modal.default.Title, (0, _extends2.default)({
    classPrefix: "drawer-title"
  }, props, {
    ref: ref
  }));
});

var Drawer = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var className = props.className,
      _props$placement = props.placement,
      placement = _props$placement === void 0 ? 'right' : _props$placement,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'drawer' : _props$classPrefix,
      _props$animation = props.animation,
      animation = _props$animation === void 0 ? _Slide.default : _props$animation,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["className", "placement", "classPrefix", "animation"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var classes = merge(className, prefix(placement));
  var animationProps = {
    placement: placement
  };
  return /*#__PURE__*/_react.default.createElement(_Modal.default, (0, _extends2.default)({}, rest, {
    ref: ref,
    drawer: true,
    classPrefix: classPrefix,
    className: classes,
    animation: animation,
    animationProps: animationProps
  }));
});

DrawerBody.displayName = 'DrawerBody';
DrawerHeader.displayName = 'DrawerHeader';
DrawerActions.displayName = 'DrawerActions';
DrawerFooter.displayName = 'DrawerFooter';
DrawerTitle.displayName = 'DrawerTitle';
Drawer.Body = DrawerBody;
Drawer.Header = DrawerHeader;
Drawer.Actions = DrawerActions;
Drawer.Footer = (0, _deprecateComponent.default)(DrawerFooter, '<Drawer.Footer> has been deprecated, use <Drawer.Actions> instead.');
Drawer.Title = DrawerTitle;
Drawer.displayName = 'Drawer';
Drawer.propTypes = {
  classPrefix: _propTypes.default.string,
  placement: _propTypes.default.oneOf(['top', 'right', 'bottom', 'left']),
  children: _propTypes.default.node,
  className: _propTypes.default.string
};
var _default = Drawer;
exports.default = _default;
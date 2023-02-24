"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.NavbarContext = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _NavbarBody = _interopRequireDefault(require("./NavbarBody"));

var _NavbarHeader = _interopRequireDefault(require("./NavbarHeader"));

var _NavbarBrand = _interopRequireDefault(require("./NavbarBrand"));

var _utils = require("../utils");

var NavbarContext = /*#__PURE__*/_react.default.createContext(false);

exports.NavbarContext = NavbarContext;

var Navbar = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var className = props.className,
      _props$as = props.as,
      Component = _props$as === void 0 ? 'nav' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'navbar' : _props$classPrefix,
      _props$appearance = props.appearance,
      appearance = _props$appearance === void 0 ? 'default' : _props$appearance,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["className", "as", "classPrefix", "appearance"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix(appearance));
  return /*#__PURE__*/_react.default.createElement(NavbarContext.Provider, {
    value: true
  }, /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  })));
});

Navbar.Header = _NavbarHeader.default;
Navbar.Body = _NavbarBody.default;
Navbar.Brand = _NavbarBrand.default;
Navbar.displayName = 'Navbar';
var _default = Navbar;
exports.default = _default;
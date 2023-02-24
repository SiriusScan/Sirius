"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.NavMenuActionType = exports.NavMenuContext = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _NavDropdown = _interopRequireDefault(require("./NavDropdown"));

var _NavDropdownMenu = _interopRequireDefault(require("./NavDropdownMenu"));

var _Sidenav = require("../Sidenav/Sidenav");

var _SidenavDropdown = _interopRequireDefault(require("../Sidenav/SidenavDropdown"));

var _Navbar = require("../Navbar");

var _NavbarDropdown = _interopRequireDefault(require("../Navbar/NavbarDropdown"));

var _NavbarDropdownMenu = _interopRequireDefault(require("../Navbar/NavbarDropdownMenu"));

var _SidenavDropdownMenu = _interopRequireDefault(require("../Sidenav/SidenavDropdownMenu"));

var NavMenuContext = /*#__PURE__*/_react.default.createContext(null);

exports.NavMenuContext = NavMenuContext;
NavMenuContext.displayName = 'NavMenu.Context';
var NavMenuActionType;
exports.NavMenuActionType = NavMenuActionType;

(function (NavMenuActionType) {
  NavMenuActionType[NavMenuActionType["RegisterItem"] = 0] = "RegisterItem";
  NavMenuActionType[NavMenuActionType["UnregisterItem"] = 1] = "UnregisterItem";
})(NavMenuActionType || (exports.NavMenuActionType = NavMenuActionType = {}));

var initilNavMenuState = {
  items: []
};

var reducer = function reducer(state, action) {
  switch (action.type) {
    case NavMenuActionType.RegisterItem:
      return (0, _extends2.default)({}, state, {
        items: [].concat(state.items.filter(function (item) {
          return item._id !== action.payload._id;
        }), [action.payload])
      });

    case NavMenuActionType.UnregisterItem:
      return (0, _extends2.default)({}, state, {
        items: state.items.filter(function (item) {
          return item._id !== action.payload._id;
        })
      });

    default:
      throw new Error('Unrecognizable action type: ' + action.type);
  }
};
/**
 * The <Nav.Menu> API
 * When used as direct child of <Nav>, render the NavDropdown
 * When used within another <Nav.Menu>, render the NavDropdownMenu
 */


var NavMenu = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var parentNavMenu = (0, _react.useContext)(NavMenuContext);
  var navMenuContext = (0, _react.useReducer)(reducer, initilNavMenuState);
  var navbar = (0, _react.useContext)(_Navbar.NavbarContext);
  var sidenav = (0, _react.useContext)(_Sidenav.SidenavContext);

  if (!parentNavMenu) {
    if (navbar) {
      return /*#__PURE__*/_react.default.createElement(NavMenuContext.Provider, {
        value: navMenuContext
      }, /*#__PURE__*/_react.default.createElement(_NavbarDropdown.default, (0, _extends2.default)({
        ref: ref
      }, props)));
    }

    if (sidenav) {
      return /*#__PURE__*/_react.default.createElement(NavMenuContext.Provider, {
        value: navMenuContext
      }, /*#__PURE__*/_react.default.createElement(_SidenavDropdown.default, (0, _extends2.default)({
        ref: ref
      }, props)));
    }

    return /*#__PURE__*/_react.default.createElement(NavMenuContext.Provider, {
      value: navMenuContext
    }, /*#__PURE__*/_react.default.createElement(_NavDropdown.default, (0, _extends2.default)({
      ref: ref
    }, props)));
  }

  if (navbar) {
    return /*#__PURE__*/_react.default.createElement(_NavbarDropdownMenu.default, (0, _extends2.default)({
      ref: ref
    }, props));
  }

  if (sidenav) {
    return /*#__PURE__*/_react.default.createElement(_SidenavDropdownMenu.default, (0, _extends2.default)({
      ref: ref
    }, props));
  }

  return /*#__PURE__*/_react.default.createElement(_NavDropdownMenu.default, (0, _extends2.default)({
    ref: ref
  }, props));
});

NavMenu.displayName = 'Nav.Menu';
var _default = NavMenu;
exports.default = _default;
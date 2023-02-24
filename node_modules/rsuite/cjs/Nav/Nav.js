"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _NavItem = _interopRequireDefault(require("./NavItem"));

var _utils = require("../utils");

var _Navbar = require("../Navbar/Navbar");

var _Sidenav = require("../Sidenav/Sidenav");

var _NavContext = _interopRequireDefault(require("./NavContext"));

var _useEnsuredRef = _interopRequireDefault(require("../utils/useEnsuredRef"));

var _Menubar = _interopRequireDefault(require("../Menu/Menubar"));

var _NavDropdown = _interopRequireDefault(require("./NavDropdown"));

var _NavMenu = _interopRequireWildcard(require("./NavMenu"));

var _deprecateComponent = _interopRequireDefault(require("../utils/deprecateComponent"));

var _NavDropdownItem = _interopRequireDefault(require("./NavDropdownItem"));

var _NavDropdownMenu = _interopRequireDefault(require("./NavDropdownMenu"));

var _NavbarDropdownItem = _interopRequireDefault(require("../Navbar/NavbarDropdownItem"));

var _SidenavDropdownItem = _interopRequireDefault(require("../Sidenav/SidenavDropdownItem"));

var _NavbarItem = _interopRequireDefault(require("../Navbar/NavbarItem"));

var _SidenavItem = _interopRequireDefault(require("../Sidenav/SidenavItem"));

var _useInternalId = _interopRequireDefault(require("../utils/useInternalId"));

var Nav = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'nav' : _props$classPrefix,
      _props$appearance = props.appearance,
      appearance = _props$appearance === void 0 ? 'default' : _props$appearance,
      vertical = props.vertical,
      justified = props.justified,
      reversed = props.reversed,
      pullRight = props.pullRight,
      className = props.className,
      children = props.children,
      activeKeyProp = props.activeKey,
      onSelectProp = props.onSelect,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "appearance", "vertical", "justified", "reversed", "pullRight", "className", "children", "activeKey", "onSelect"]);
  var sidenav = (0, _react.useContext)(_Sidenav.SidenavContext); // Whether inside a <Navbar>

  var navbar = (0, _react.useContext)(_Navbar.NavbarContext);
  var menubarRef = (0, _useEnsuredRef.default)(ref);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge,
      rootPrefix = _useClassNames.rootPrefix,
      prefix = _useClassNames.prefix;

  var classes = merge(className, rootPrefix({
    'navbar-nav': navbar,
    'navbar-right': pullRight,
    'sidenav-nav': sidenav
  }), withClassPrefix(appearance, {
    horizontal: navbar || !vertical && !sidenav,
    vertical: vertical || sidenav,
    justified: justified,
    reversed: reversed
  }));

  var _ref = sidenav || {},
      activeKeyFromSidenav = _ref.activeKey,
      _ref$onSelect = _ref.onSelect,
      onSelectFromSidenav = _ref$onSelect === void 0 ? onSelectProp : _ref$onSelect;

  var activeKey = activeKeyProp !== null && activeKeyProp !== void 0 ? activeKeyProp : activeKeyFromSidenav;
  var contextValue = (0, _react.useMemo)(function () {
    return {
      activeKey: activeKey,
      onSelect: onSelectProp !== null && onSelectProp !== void 0 ? onSelectProp : onSelectFromSidenav
    };
  }, [activeKey, onSelectFromSidenav, onSelectProp]);

  if (sidenav !== null && sidenav !== void 0 && sidenav.expanded) {
    return /*#__PURE__*/_react.default.createElement(_NavContext.default.Provider, {
      value: contextValue
    }, /*#__PURE__*/_react.default.createElement("ul", (0, _extends2.default)({
      ref: ref,
      className: classes
    }, rest), children));
  }

  var hasWaterline = appearance !== 'default'; // If inside a collapsed <Sidenav>, render an ARIA `menubar` (vertical)

  if (sidenav) {
    return /*#__PURE__*/_react.default.createElement(_NavContext.default.Provider, {
      value: contextValue
    }, /*#__PURE__*/_react.default.createElement(_Menubar.default, {
      vertical: !!sidenav
    }, function (menubar, ref) {
      return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
        ref: ref
      }, rest, {
        className: classes
      }, menubar), children);
    }));
  }

  return /*#__PURE__*/_react.default.createElement(_NavContext.default.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: menubarRef,
    className: classes
  }), children, hasWaterline && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('bar')
  })));
});

var DeprecatedNavDropdown = (0, _deprecateComponent.default)(_NavDropdown.default, '<Nav.Dropdown> is deprecated, use <Nav.Menu> instead.');
DeprecatedNavDropdown.Menu = (0, _deprecateComponent.default)(_NavDropdownMenu.default, '<Nav.Dropdown.Menu> is deprecated, use <Nav.Menu> instead');
DeprecatedNavDropdown.Item = (0, _deprecateComponent.default)(_NavDropdownItem.default, '<Nav.Dropdown.Item> is deprecated, use <Nav.Item> instead');
Nav.Dropdown = DeprecatedNavDropdown;
/**
 * The <Nav.Item> API
 * When used as direct child of <Nav>, render the NavItem
 * When used within a <Nav.Menu>, render the NavDropdownItem
 */

Nav.Item = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var nav = (0, _react.useContext)(_NavContext.default);

  if (!nav) {
    throw new Error('<Nav.Item> must be rendered within a <Nav> component.');
  }

  var parentNavMenu = (0, _react.useContext)(_NavMenu.NavMenuContext);
  var navbar = (0, _react.useContext)(_Navbar.NavbarContext);
  var sidenav = (0, _react.useContext)(_Sidenav.SidenavContext);

  var _ref2 = parentNavMenu !== null && parentNavMenu !== void 0 ? parentNavMenu : [],
      dispatch = _ref2[1];

  var _id = (0, _useInternalId.default)('Nav.Item');

  (0, _react.useEffect)(function () {
    if (dispatch) {
      var _props$active;

      dispatch({
        type: _NavMenu.NavMenuActionType.RegisterItem,
        payload: {
          _id: _id,
          eventKey: props.eventKey,
          active: (_props$active = props.active) !== null && _props$active !== void 0 ? _props$active : false
        }
      });
      return function () {
        dispatch({
          type: _NavMenu.NavMenuActionType.UnregisterItem,
          payload: {
            _id: _id
          }
        });
      };
    }
  }, [dispatch, _id, props.eventKey, props.active]);

  if (parentNavMenu) {
    if (navbar) {
      return /*#__PURE__*/_react.default.createElement(_NavbarDropdownItem.default, (0, _extends2.default)({
        ref: ref
      }, props));
    }

    if (sidenav) {
      return /*#__PURE__*/_react.default.createElement(_SidenavDropdownItem.default, (0, _extends2.default)({
        ref: ref
      }, props));
    }

    return /*#__PURE__*/_react.default.createElement(_NavDropdownItem.default, (0, _extends2.default)({
      ref: ref
    }, props));
  }

  if (navbar) {
    return /*#__PURE__*/_react.default.createElement(_NavbarItem.default, (0, _extends2.default)({
      ref: ref
    }, props));
  }

  if (sidenav) {
    return /*#__PURE__*/_react.default.createElement(_SidenavItem.default, (0, _extends2.default)({
      ref: ref
    }, props));
  }

  return /*#__PURE__*/_react.default.createElement(_NavItem.default, (0, _extends2.default)({
    ref: ref
  }, props));
});
Nav.Item.displayName = 'Nav.Item';
Nav.Menu = _NavMenu.default;
Nav.displayName = 'Nav';
Nav.propTypes = {
  classPrefix: _propTypes.default.string,
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  appearance: _propTypes.default.oneOf(['default', 'subtle', 'tabs']),
  // Reverse Direction of tabs/subtle
  reversed: _propTypes.default.bool,
  justified: _propTypes.default.bool,
  vertical: _propTypes.default.bool,
  pullRight: _propTypes.default.bool,
  activeKey: _propTypes.default.any,
  onSelect: _propTypes.default.func
};
var _default = Nav;
exports.default = _default;
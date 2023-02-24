import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import NavItem from './NavItem';
import { useClassNames } from '../utils';
import { NavbarContext } from '../Navbar/Navbar';
import { SidenavContext } from '../Sidenav/Sidenav';
import NavContext from './NavContext';
import useEnsuredRef from '../utils/useEnsuredRef';
import Menubar from '../Menu/Menubar';
import NavDropdown from './NavDropdown';
import NavMenu, { NavMenuActionType, NavMenuContext } from './NavMenu';
import deprecateComponent from '../utils/deprecateComponent';
import NavDropdownItem from './NavDropdownItem';
import NavDropdownMenu from './NavDropdownMenu';
import NavbarDropdownItem from '../Navbar/NavbarDropdownItem';
import SidenavDropdownItem from '../Sidenav/SidenavDropdownItem';
import NavbarItem from '../Navbar/NavbarItem';
import SidenavItem from '../Sidenav/SidenavItem';
import useInternalId from '../utils/useInternalId';
var Nav = /*#__PURE__*/React.forwardRef(function (props, ref) {
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
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "appearance", "vertical", "justified", "reversed", "pullRight", "className", "children", "activeKey", "onSelect"]);

  var sidenav = useContext(SidenavContext); // Whether inside a <Navbar>

  var navbar = useContext(NavbarContext);
  var menubarRef = useEnsuredRef(ref);

  var _useClassNames = useClassNames(classPrefix),
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
  var contextValue = useMemo(function () {
    return {
      activeKey: activeKey,
      onSelect: onSelectProp !== null && onSelectProp !== void 0 ? onSelectProp : onSelectFromSidenav
    };
  }, [activeKey, onSelectFromSidenav, onSelectProp]);

  if (sidenav !== null && sidenav !== void 0 && sidenav.expanded) {
    return /*#__PURE__*/React.createElement(NavContext.Provider, {
      value: contextValue
    }, /*#__PURE__*/React.createElement("ul", _extends({
      ref: ref,
      className: classes
    }, rest), children));
  }

  var hasWaterline = appearance !== 'default'; // If inside a collapsed <Sidenav>, render an ARIA `menubar` (vertical)

  if (sidenav) {
    return /*#__PURE__*/React.createElement(NavContext.Provider, {
      value: contextValue
    }, /*#__PURE__*/React.createElement(Menubar, {
      vertical: !!sidenav
    }, function (menubar, ref) {
      return /*#__PURE__*/React.createElement(Component, _extends({
        ref: ref
      }, rest, {
        className: classes
      }, menubar), children);
    }));
  }

  return /*#__PURE__*/React.createElement(NavContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: menubarRef,
    className: classes
  }), children, hasWaterline && /*#__PURE__*/React.createElement("div", {
    className: prefix('bar')
  })));
});
var DeprecatedNavDropdown = deprecateComponent(NavDropdown, '<Nav.Dropdown> is deprecated, use <Nav.Menu> instead.');
DeprecatedNavDropdown.Menu = deprecateComponent(NavDropdownMenu, '<Nav.Dropdown.Menu> is deprecated, use <Nav.Menu> instead');
DeprecatedNavDropdown.Item = deprecateComponent(NavDropdownItem, '<Nav.Dropdown.Item> is deprecated, use <Nav.Item> instead');
Nav.Dropdown = DeprecatedNavDropdown;
/**
 * The <Nav.Item> API
 * When used as direct child of <Nav>, render the NavItem
 * When used within a <Nav.Menu>, render the NavDropdownItem
 */

Nav.Item = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var nav = useContext(NavContext);

  if (!nav) {
    throw new Error('<Nav.Item> must be rendered within a <Nav> component.');
  }

  var parentNavMenu = useContext(NavMenuContext);
  var navbar = useContext(NavbarContext);
  var sidenav = useContext(SidenavContext);

  var _ref2 = parentNavMenu !== null && parentNavMenu !== void 0 ? parentNavMenu : [],
      dispatch = _ref2[1];

  var _id = useInternalId('Nav.Item');

  useEffect(function () {
    if (dispatch) {
      var _props$active;

      dispatch({
        type: NavMenuActionType.RegisterItem,
        payload: {
          _id: _id,
          eventKey: props.eventKey,
          active: (_props$active = props.active) !== null && _props$active !== void 0 ? _props$active : false
        }
      });
      return function () {
        dispatch({
          type: NavMenuActionType.UnregisterItem,
          payload: {
            _id: _id
          }
        });
      };
    }
  }, [dispatch, _id, props.eventKey, props.active]);

  if (parentNavMenu) {
    if (navbar) {
      return /*#__PURE__*/React.createElement(NavbarDropdownItem, _extends({
        ref: ref
      }, props));
    }

    if (sidenav) {
      return /*#__PURE__*/React.createElement(SidenavDropdownItem, _extends({
        ref: ref
      }, props));
    }

    return /*#__PURE__*/React.createElement(NavDropdownItem, _extends({
      ref: ref
    }, props));
  }

  if (navbar) {
    return /*#__PURE__*/React.createElement(NavbarItem, _extends({
      ref: ref
    }, props));
  }

  if (sidenav) {
    return /*#__PURE__*/React.createElement(SidenavItem, _extends({
      ref: ref
    }, props));
  }

  return /*#__PURE__*/React.createElement(NavItem, _extends({
    ref: ref
  }, props));
});
Nav.Item.displayName = 'Nav.Item';
Nav.Menu = NavMenu;
Nav.displayName = 'Nav';
Nav.propTypes = {
  classPrefix: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  appearance: PropTypes.oneOf(['default', 'subtle', 'tabs']),
  // Reverse Direction of tabs/subtle
  reversed: PropTypes.bool,
  justified: PropTypes.bool,
  vertical: PropTypes.bool,
  pullRight: PropTypes.bool,
  activeKey: PropTypes.any,
  onSelect: PropTypes.func
};
export default Nav;
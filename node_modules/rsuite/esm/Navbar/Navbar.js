import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import NavbarBody from './NavbarBody';
import NavbarHeader from './NavbarHeader';
import NavbarBrand from './NavbarBrand';
import { useClassNames } from '../utils';
export var NavbarContext = /*#__PURE__*/React.createContext(false);
var Navbar = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var className = props.className,
      _props$as = props.as,
      Component = _props$as === void 0 ? 'nav' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'navbar' : _props$classPrefix,
      _props$appearance = props.appearance,
      appearance = _props$appearance === void 0 ? 'default' : _props$appearance,
      rest = _objectWithoutPropertiesLoose(props, ["className", "as", "classPrefix", "appearance"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix(appearance));
  return /*#__PURE__*/React.createElement(NavbarContext.Provider, {
    value: true
  }, /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  })));
});
Navbar.Header = NavbarHeader;
Navbar.Body = NavbarBody;
Navbar.Brand = NavbarBrand;
Navbar.displayName = 'Navbar';
export default Navbar;
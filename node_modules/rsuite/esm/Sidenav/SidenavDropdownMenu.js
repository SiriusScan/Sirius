import _taggedTemplateLiteralLoose from "@babel/runtime/helpers/esm/taggedTemplateLiteralLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";

var _templateObject, _templateObject2;

import React, { useCallback, useContext } from 'react';
import omit from 'lodash/omit';
import Menu from '../Menu/Menu';
import MenuItem from '../Menu/MenuItem';
import { mergeRefs, useClassNames } from '../utils';
import PropTypes from 'prop-types';
import { SidenavContext } from './Sidenav';
import ArrowLeftLine from '@rsuite/icons/ArrowLeftLine';
import ArrowRightLine from '@rsuite/icons/ArrowRightLine';
import useCustom from '../utils/useCustom';
import ExpandedSidenavDropdownMenu from './ExpandedSidenavDropdownMenu';
import NavContext from '../Nav/NavContext';

/**
 * @private this component is not supposed to be used directly
 *          Instead it's rendered by a <Nav.Menu> within a <Sidenav>
 *
 * <Sidenav>
 *   <Nav>
 *     <Nav.Menu>
 *       <Nav.Menu></Nav.Menu> -> This submenu will render <SidenavDropdownMenu> component
 *     </Nav.Menu>
 *   </Nav>
 * </Sidenav>
 */
var SidenavDropdownMenu = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var sidenav = useContext(SidenavContext);
  var nav = useContext(NavContext);

  if (!sidenav || !nav) {
    throw new Error('<Sidenav.Dropdown.Menu> must be rendered within a <Nav> within a <Sidenav> component.');
  }

  var onToggle = props.onToggle,
      eventKey = props.eventKey,
      title = props.title,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'dropdown-menu' : _props$classPrefix,
      children = props.children,
      rest = _objectWithoutPropertiesLoose(props, ["onToggle", "eventKey", "title", "classPrefix", "children"]);

  var _useCustom = useCustom('DropdownMenu'),
      rtl = _useCustom.rtl;

  var handleToggleSubmenu = useCallback(function (open, event) {
    onToggle === null || onToggle === void 0 ? void 0 : onToggle(open, eventKey, event);
  }, [eventKey, onToggle]);

  var _useClassNames = useClassNames(classPrefix),
      prefix = _useClassNames.prefix;

  var _useClassNames2 = useClassNames('dropdown-menu'),
      withMenuClassPrefix = _useClassNames2.withClassPrefix,
      mergeMenuClassName = _useClassNames2.merge;

  var _useClassNames3 = useClassNames('dropdown-item'),
      mergeItemClassNames = _useClassNames3.merge,
      withItemClassPrefix = _useClassNames3.withClassPrefix,
      prefixItemClassName = _useClassNames3.prefix;

  if (sidenav.expanded) {
    return /*#__PURE__*/React.createElement(ExpandedSidenavDropdownMenu, _extends({
      ref: ref
    }, omit(props, 'classPrefix')));
  } // Parent menu exists. This is a submenu.
  // Should render a `menuitem` that controls this submenu.


  var _omit = omit(rest, ['trigger']),
      icon = _omit.icon,
      className = _omit.className,
      disabled = _omit.disabled,
      menuProps = _objectWithoutPropertiesLoose(_omit, ["icon", "className", "disabled"]);

  var Icon = rtl ? ArrowLeftLine : ArrowRightLine;
  return /*#__PURE__*/React.createElement(Menu, {
    openMenuOn: ['mouseover', 'click'],
    renderMenuButton: function renderMenuButton(_ref, buttonRef) {
      var open = _ref.open,
          menuButtonProps = _objectWithoutPropertiesLoose(_ref, ["open"]);

      return /*#__PURE__*/React.createElement(MenuItem, {
        disabled: disabled
      }, function (_ref2, menuitemRef) {
        var selected = _ref2.selected,
            active = _ref2.active,
            menuitem = _objectWithoutPropertiesLoose(_ref2, ["selected", "active"]);

        var classes = mergeItemClassNames(className, prefixItemClassName(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["toggle"]))), withItemClassPrefix({
          'with-icon': icon,
          open: open,
          active: selected,
          disabled: disabled,
          focus: active
        }));
        return /*#__PURE__*/React.createElement("div", _extends({
          ref: mergeRefs(buttonRef, menuitemRef),
          className: classes,
          "data-event-key": eventKey,
          "data-event-key-type": typeof eventKey
        }, menuitem, omit(menuButtonProps, ['role'])), icon && /*#__PURE__*/React.cloneElement(icon, {
          className: prefix('menu-icon')
        }), title, /*#__PURE__*/React.createElement(Icon, {
          className: prefix(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["toggle-icon"])))
        }));
      });
    },
    renderMenuPopup: function renderMenuPopup(_ref3, popupRef) {
      var open = _ref3.open,
          popupProps = _objectWithoutPropertiesLoose(_ref3, ["open"]);

      var menuClassName = mergeMenuClassName(className, withMenuClassPrefix());
      return /*#__PURE__*/React.createElement("ul", _extends({
        ref: popupRef,
        className: menuClassName,
        hidden: !open
      }, popupProps, menuProps), children);
    },
    onToggleMenu: handleToggleSubmenu
  }, function (_ref4, menuContainerRef) {
    var open = _ref4.open,
        menuContainer = _objectWithoutPropertiesLoose(_ref4, ["open"]);

    var classes = mergeItemClassNames(className, withItemClassPrefix({
      disabled: disabled,
      open: open,
      submenu: true
    }));
    return /*#__PURE__*/React.createElement("li", _extends({
      ref: mergeRefs(ref, menuContainerRef),
      className: classes
    }, menuContainer));
  });
});
SidenavDropdownMenu.displayName = 'Sidenav.Dropdown.Menu';
SidenavDropdownMenu.propTypes = {
  active: PropTypes.bool,
  activeKey: PropTypes.any,
  className: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.any,
  classPrefix: PropTypes.string,
  pullLeft: PropTypes.bool,
  title: PropTypes.node,
  open: PropTypes.bool,
  eventKey: PropTypes.any,
  expanded: PropTypes.bool,
  collapsible: PropTypes.bool,
  onToggle: PropTypes.func
};
export default SidenavDropdownMenu;
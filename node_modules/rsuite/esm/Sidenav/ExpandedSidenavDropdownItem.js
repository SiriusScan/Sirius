import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback, useContext } from 'react';
import isNil from 'lodash/isNil';
import { createChainedFunction, shallowEqual, useClassNames } from '../utils';
import { SidenavContext } from './Sidenav';
import PropTypes from 'prop-types';
import Ripple from '../Ripple';
import SafeAnchor from '../SafeAnchor';
import NavContext from '../Nav/NavContext';
import { useRenderDropdownItem } from '../Dropdown/useRenderDropdownItem';

/**
 * Tree View Node
 * @see https://www.w3.org/TR/wai-aria-practices-1.2/#TreeView
 */
var ExpandedSidenavDropdownItem = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var sidenav = useContext(SidenavContext);
  var nav = useContext(NavContext);

  if (!sidenav || !nav) {
    throw new Error('<SidenavDropdownItem> component is not supposed to be used standalone. Use <Nav.Item> within <Sidenav> instead.');
  }

  var _props$as = props.as,
      Component = _props$as === void 0 ? 'li' : _props$as,
      activeProp = props.active,
      children = props.children,
      disabled = props.disabled,
      divider = props.divider,
      panel = props.panel,
      className = props.className,
      style = props.style,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'dropdown-item' : _props$classPrefix,
      icon = props.icon,
      eventKey = props.eventKey,
      onClick = props.onClick,
      onSelect = props.onSelect,
      rest = _objectWithoutPropertiesLoose(props, ["as", "active", "children", "disabled", "divider", "panel", "className", "style", "classPrefix", "icon", "eventKey", "onClick", "onSelect"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var selected = activeProp !== null && activeProp !== void 0 ? activeProp : !isNil(eventKey) && (shallowEqual(eventKey, sidenav.activeKey) || shallowEqual(nav.activeKey, eventKey));
  var classes = merge(className, withClassPrefix({
    'with-icon': icon,
    active: selected,
    disabled: disabled
  }));
  var handleClick = useCallback(function (event) {
    var _nav$onSelect, _sidenav$onSelect;

    if (disabled) return;
    onSelect === null || onSelect === void 0 ? void 0 : onSelect(eventKey, event);
    (_nav$onSelect = nav.onSelect) === null || _nav$onSelect === void 0 ? void 0 : _nav$onSelect.call(nav, eventKey, event);
    (_sidenav$onSelect = sidenav.onSelect) === null || _sidenav$onSelect === void 0 ? void 0 : _sidenav$onSelect.call(sidenav, eventKey, event);
  }, [disabled, onSelect, sidenav, eventKey, nav]);
  var menuitemEventHandlers = {
    onClick: createChainedFunction(handleClick, onClick)
  };
  var renderDropdownItem = useRenderDropdownItem(Component);

  if (divider) {
    return renderDropdownItem(_extends({
      ref: ref,
      role: 'separator',
      style: style,
      className: merge(prefix('divider'), className)
    }, rest));
  }

  if (panel) {
    return renderDropdownItem(_extends({
      ref: ref,
      role: 'none presentation',
      style: style,
      className: merge(prefix('panel'), className)
    }, rest, {
      children: children
    }));
  }

  return renderDropdownItem(_extends({
    ref: ref
  }, rest, {
    style: style,
    className: classes,
    'aria-current': selected || undefined
  }, menuitemEventHandlers, {
    children: /*#__PURE__*/React.createElement(React.Fragment, null, icon && /*#__PURE__*/React.cloneElement(icon, {
      className: prefix('menu-icon')
    }), children, /*#__PURE__*/React.createElement(Ripple, null))
  }), SafeAnchor);
});
ExpandedSidenavDropdownItem.displayName = 'Sidenav.Dropdown.Item';
ExpandedSidenavDropdownItem.propTypes = {
  as: PropTypes.elementType,
  expanded: PropTypes.bool,
  active: PropTypes.bool,
  divider: PropTypes.bool,
  panel: PropTypes.bool,
  disabled: PropTypes.bool,
  submenu: PropTypes.element,
  onSelect: PropTypes.func,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  eventKey: PropTypes.any,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  classPrefix: PropTypes.string,
  tabIndex: PropTypes.number,
  title: PropTypes.node,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func
};
export default ExpandedSidenavDropdownItem;
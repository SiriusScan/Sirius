import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { SidenavContext } from './Sidenav';
import deprecatePropType from '../utils/deprecatePropType';
import MenuItem from '../Menu/MenuItem';
import isNil from 'lodash/isNil';
import { mergeRefs, shallowEqual, useClassNames } from '../utils';
import NavContext from '../Nav/NavContext';
import { useRenderDropdownItem } from '../Dropdown/useRenderDropdownItem';
import ExpandedSidenavDropdownItem from './ExpandedSidenavDropdownItem';

/**
 * @private this component is not supposed to be used directly
 *          Instead it's rendered by a <Nav.Item> within a <Sidenav>
 *
 * <Sidenav>
 *   <Nav>
 *     <Nav.Menu>
 *       <Nav.Item></Nav.Item> -> This will render <SidenavDropdownItem> component
 *     </Nav.Menu>
 *   </Nav>
 * </Sidenav>
 */
var SidenavDropdownItem = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var sidenav = useContext(SidenavContext);
  var nav = useContext(NavContext);

  if (!sidenav || !nav) {
    throw new Error('<Sidenav.Dropdown.Item> must be used within a <Nav> within a <Sidenav> component.');
  }

  var _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'dropdown-item' : _props$classPrefix,
      className = props.className,
      activeProp = props.active,
      eventKey = props.eventKey,
      onSelect = props.onSelect,
      icon = props.icon,
      _props$as = props.as,
      Component = _props$as === void 0 ? 'li' : _props$as,
      divider = props.divider,
      panel = props.panel,
      children = props.children,
      disabled = props.disabled,
      restProps = _objectWithoutPropertiesLoose(props, ["classPrefix", "className", "active", "eventKey", "onSelect", "icon", "as", "divider", "panel", "children", "disabled"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var handleSelectItem = useCallback(function (event) {
    var _nav$onSelect;

    onSelect === null || onSelect === void 0 ? void 0 : onSelect(eventKey, event);
    (_nav$onSelect = nav.onSelect) === null || _nav$onSelect === void 0 ? void 0 : _nav$onSelect.call(nav, eventKey, event);
  }, [onSelect, eventKey, nav]);
  var selected = activeProp || !isNil(eventKey) && shallowEqual(nav === null || nav === void 0 ? void 0 : nav.activeKey, eventKey);
  var renderDropdownItem = useRenderDropdownItem(Component);

  if (sidenav.expanded) {
    return /*#__PURE__*/React.createElement(ExpandedSidenavDropdownItem, _extends({
      ref: ref
    }, props));
  }

  if (divider) {
    return renderDropdownItem(_extends({
      ref: ref,
      role: 'separator',
      className: merge(prefix('divider'), className)
    }, restProps));
  }

  if (panel) {
    return renderDropdownItem(_extends({
      ref: ref,
      className: merge(prefix('panel'), className),
      children: children
    }, restProps));
  }

  return /*#__PURE__*/React.createElement(MenuItem, {
    selected: selected,
    disabled: disabled,
    onActivate: handleSelectItem
  }, function (_ref, menuitemRef) {
    var selected = _ref.selected,
        active = _ref.active,
        menuitem = _objectWithoutPropertiesLoose(_ref, ["selected", "active"]);

    var classes = merge(className, withClassPrefix({
      'with-icon': icon,
      active: selected,
      disabled: disabled,
      focus: active,
      divider: divider,
      panel: panel
    }));
    var dataAttributes = {
      'data-event-key': eventKey
    };

    if (!isNil(eventKey) && typeof eventKey !== 'string') {
      dataAttributes['data-event-key-type'] = typeof eventKey;
    }

    return renderDropdownItem(_extends({
      ref: mergeRefs(ref, menuitemRef),
      className: classes
    }, menuitem, dataAttributes, restProps, {
      children: /*#__PURE__*/React.createElement(React.Fragment, null, icon && /*#__PURE__*/React.cloneElement(icon, {
        className: prefix('menu-icon')
      }), children)
    }));
  });
});
SidenavDropdownItem.displayName = 'Sidenav.Dropdown.Item';
SidenavDropdownItem.propTypes = {
  as: PropTypes.elementType,
  divider: PropTypes.bool,
  panel: PropTypes.bool,
  trigger: PropTypes.oneOfType([PropTypes.array, PropTypes.oneOf(['click', 'hover'])]),
  open: deprecatePropType(PropTypes.bool),
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  pullLeft: deprecatePropType(PropTypes.bool),
  submenu: PropTypes.element,
  onSelect: PropTypes.func,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  eventKey: PropTypes.any,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  classPrefix: PropTypes.string,
  tabIndex: PropTypes.number
};
export default SidenavDropdownItem;
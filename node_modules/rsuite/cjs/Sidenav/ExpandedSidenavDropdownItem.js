"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _isNil = _interopRequireDefault(require("lodash/isNil"));

var _utils = require("../utils");

var _Sidenav = require("./Sidenav");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Ripple = _interopRequireDefault(require("../Ripple"));

var _SafeAnchor = _interopRequireDefault(require("../SafeAnchor"));

var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));

var _useRenderDropdownItem = require("../Dropdown/useRenderDropdownItem");

/**
 * Tree View Node
 * @see https://www.w3.org/TR/wai-aria-practices-1.2/#TreeView
 */
var ExpandedSidenavDropdownItem = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var sidenav = (0, _react.useContext)(_Sidenav.SidenavContext);
  var nav = (0, _react.useContext)(_NavContext.default);

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
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "active", "children", "disabled", "divider", "panel", "className", "style", "classPrefix", "icon", "eventKey", "onClick", "onSelect"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var selected = activeProp !== null && activeProp !== void 0 ? activeProp : !(0, _isNil.default)(eventKey) && ((0, _utils.shallowEqual)(eventKey, sidenav.activeKey) || (0, _utils.shallowEqual)(nav.activeKey, eventKey));
  var classes = merge(className, withClassPrefix({
    'with-icon': icon,
    active: selected,
    disabled: disabled
  }));
  var handleClick = (0, _react.useCallback)(function (event) {
    var _nav$onSelect, _sidenav$onSelect;

    if (disabled) return;
    onSelect === null || onSelect === void 0 ? void 0 : onSelect(eventKey, event);
    (_nav$onSelect = nav.onSelect) === null || _nav$onSelect === void 0 ? void 0 : _nav$onSelect.call(nav, eventKey, event);
    (_sidenav$onSelect = sidenav.onSelect) === null || _sidenav$onSelect === void 0 ? void 0 : _sidenav$onSelect.call(sidenav, eventKey, event);
  }, [disabled, onSelect, sidenav, eventKey, nav]);
  var menuitemEventHandlers = {
    onClick: (0, _utils.createChainedFunction)(handleClick, onClick)
  };
  var renderDropdownItem = (0, _useRenderDropdownItem.useRenderDropdownItem)(Component);

  if (divider) {
    return renderDropdownItem((0, _extends2.default)({
      ref: ref,
      role: 'separator',
      style: style,
      className: merge(prefix('divider'), className)
    }, rest));
  }

  if (panel) {
    return renderDropdownItem((0, _extends2.default)({
      ref: ref,
      role: 'none presentation',
      style: style,
      className: merge(prefix('panel'), className)
    }, rest, {
      children: children
    }));
  }

  return renderDropdownItem((0, _extends2.default)({
    ref: ref
  }, rest, {
    style: style,
    className: classes,
    'aria-current': selected || undefined
  }, menuitemEventHandlers, {
    children: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, icon && /*#__PURE__*/_react.default.cloneElement(icon, {
      className: prefix('menu-icon')
    }), children, /*#__PURE__*/_react.default.createElement(_Ripple.default, null))
  }), _SafeAnchor.default);
});

ExpandedSidenavDropdownItem.displayName = 'Sidenav.Dropdown.Item';
ExpandedSidenavDropdownItem.propTypes = {
  as: _propTypes.default.elementType,
  expanded: _propTypes.default.bool,
  active: _propTypes.default.bool,
  divider: _propTypes.default.bool,
  panel: _propTypes.default.bool,
  disabled: _propTypes.default.bool,
  submenu: _propTypes.default.element,
  onSelect: _propTypes.default.func,
  onClick: _propTypes.default.func,
  icon: _propTypes.default.node,
  eventKey: _propTypes.default.any,
  className: _propTypes.default.string,
  style: _propTypes.default.object,
  children: _propTypes.default.node,
  classPrefix: _propTypes.default.string,
  tabIndex: _propTypes.default.number,
  title: _propTypes.default.node,
  onMouseOver: _propTypes.default.func,
  onMouseOut: _propTypes.default.func
};
var _default = ExpandedSidenavDropdownItem;
exports.default = _default;
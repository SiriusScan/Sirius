"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _deprecatePropType = _interopRequireDefault(require("../utils/deprecatePropType"));

var _isNil = _interopRequireDefault(require("lodash/isNil"));

var _utils = require("../utils");

var _Navbar = require("./Navbar");

var _DisclosureContext = _interopRequireWildcard(require("../Disclosure/DisclosureContext"));

var _useRenderDropdownItem = require("../Dropdown/useRenderDropdownItem");

var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));

/**
 * @private
 */
var NavbarDropdownItem = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var navbar = (0, _react.useContext)(_Navbar.NavbarContext);
  var nav = (0, _react.useContext)(_NavContext.default);

  if (!navbar || !nav) {
    throw new Error('<Navbar.Dropdown.Item> must be rendered within a <Nav> component within a <Navbar> component.');
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
      restProps = (0, _objectWithoutPropertiesLoose2.default)(props, ["classPrefix", "className", "active", "eventKey", "onSelect", "icon", "as", "divider", "panel", "children", "disabled"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var handleSelectItem = (0, _react.useCallback)(function (event) {
    var _nav$onSelect;

    onSelect === null || onSelect === void 0 ? void 0 : onSelect(eventKey, event);
    (_nav$onSelect = nav.onSelect) === null || _nav$onSelect === void 0 ? void 0 : _nav$onSelect.call(nav, eventKey, event);
  }, [onSelect, eventKey, nav]);
  var disclosure = (0, _react.useContext)(_DisclosureContext.default);

  var _ref = disclosure !== null && disclosure !== void 0 ? disclosure : [],
      dispatchDisclosure = _ref[1];

  var handleClickNavbarDropdownItem = (0, _react.useCallback)(function (event) {
    dispatchDisclosure === null || dispatchDisclosure === void 0 ? void 0 : dispatchDisclosure({
      type: _DisclosureContext.DisclosureActionTypes.Hide,
      cascade: true
    });
    handleSelectItem === null || handleSelectItem === void 0 ? void 0 : handleSelectItem(event);
  }, [dispatchDisclosure, handleSelectItem]);
  var selected = activeProp || !(0, _isNil.default)(eventKey) && (0, _utils.shallowEqual)(nav.activeKey, eventKey);
  var renderDropdownItem = (0, _useRenderDropdownItem.useRenderDropdownItem)(Component);

  if (divider) {
    return renderDropdownItem((0, _extends2.default)({
      ref: ref,
      role: 'separator',
      className: merge(prefix('divider'), className)
    }, restProps));
  }

  if (panel) {
    return renderDropdownItem((0, _extends2.default)({
      ref: ref,
      className: merge(prefix('panel'), className),
      children: children
    }, restProps));
  }

  var classes = merge(className, withClassPrefix({
    'with-icon': icon,
    disabled: disabled,
    divider: divider,
    panel: panel,
    active: selected
  }));
  var dataAttributes = {
    'data-event-key': eventKey
  };

  if (!(0, _isNil.default)(eventKey) && typeof eventKey !== 'string') {
    dataAttributes['data-event-key-type'] = typeof eventKey;
  }

  return renderDropdownItem((0, _extends2.default)({
    ref: ref,
    className: classes,
    'aria-current': selected || undefined
  }, dataAttributes, restProps, {
    onClick: (0, _utils.createChainedFunction)(handleClickNavbarDropdownItem, restProps.onClick),
    children: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, icon && /*#__PURE__*/_react.default.cloneElement(icon, {
      className: prefix('menu-icon')
    }), children)
  }));
});

NavbarDropdownItem.displayName = 'Navbar.Dropdown.Item';
NavbarDropdownItem.propTypes = {
  as: _propTypes.default.elementType,
  divider: _propTypes.default.bool,
  panel: _propTypes.default.bool,
  trigger: _propTypes.default.oneOfType([_propTypes.default.array, _propTypes.default.oneOf(['click', 'hover'])]),
  open: (0, _deprecatePropType.default)(_propTypes.default.bool),
  active: _propTypes.default.bool,
  disabled: _propTypes.default.bool,
  pullLeft: (0, _deprecatePropType.default)(_propTypes.default.bool),
  submenu: _propTypes.default.element,
  onSelect: _propTypes.default.func,
  onClick: _propTypes.default.func,
  icon: _propTypes.default.node,
  eventKey: _propTypes.default.any,
  className: _propTypes.default.string,
  style: _propTypes.default.object,
  children: _propTypes.default.node,
  classPrefix: _propTypes.default.string,
  tabIndex: _propTypes.default.number
};
var _default = NavbarDropdownItem;
exports.default = _default;
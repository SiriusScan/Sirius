"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _ArrowDownLine = _interopRequireDefault(require("@rsuite/icons/ArrowDownLine"));

var _utils = require("../utils");

var _NavbarItem = _interopRequireDefault(require("./NavbarItem"));

/**
 * @private this component is not supposed to be used directly
 *          Instead it's rendered by a <Nav.Menu> call
 *
 * <Nav>
 *   <Nav.Menu> -> This will render <NavDropdown> component that renders a <NavDropdownToggle>
 *   </Nav.Menu>
 * </Nav>
 */
var NavbarDropdownToggle = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? _NavbarItem.default : _props$as,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'navbar-item' : _props$classPrefix,
      renderToggle = props.renderToggle,
      children = props.children,
      noCaret = props.noCaret,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "classPrefix", "renderToggle", "children", "noCaret"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    'no-caret': noCaret
  }));

  var toggle = /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), children, !noCaret && /*#__PURE__*/_react.default.createElement(_ArrowDownLine.default, {
    className: prefix('caret')
  }));

  return renderToggle ? renderToggle(rest, ref) : toggle;
});

NavbarDropdownToggle.displayName = 'Navbar.Dropdown.Toggle';
NavbarDropdownToggle.propTypes = {
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  classPrefix: _propTypes.default.string,
  noCaret: _propTypes.default.bool,
  as: _propTypes.default.elementType,
  renderToggle: _propTypes.default.func,
  placement: _propTypes.default.oneOf(['bottomStart', 'bottomEnd', 'topStart', 'topEnd', 'leftStart', 'rightStart', 'leftEnd', 'rightEnd'])
};
var _default = NavbarDropdownToggle;
exports.default = _default;
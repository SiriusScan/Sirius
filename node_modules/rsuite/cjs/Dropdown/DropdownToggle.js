"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Button = _interopRequireDefault(require("../Button"));

var _utils = require("../utils");

var _useToggleCaret = _interopRequireDefault(require("../utils/useToggleCaret"));

var DropdownToggle = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? _Button.default : _props$as,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'dropdown-toggle' : _props$classPrefix,
      renderToggle = props.renderToggle,
      children = props.children,
      icon = props.icon,
      noCaret = props.noCaret,
      _props$placement = props.placement,
      placement = _props$placement === void 0 ? 'bottomStart' : _props$placement,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "classPrefix", "renderToggle", "children", "icon", "noCaret", "placement"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    'no-caret': noCaret
  })); // Caret icon is down by default, when Dropdown is used in Sidenav.

  var Caret = (0, _useToggleCaret.default)(placement);

  var toggle = /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), icon && /*#__PURE__*/_react.default.cloneElement(icon, {
    className: prefix('icon')
  }), children, noCaret ? null : /*#__PURE__*/_react.default.createElement(Caret, {
    className: prefix('caret')
  }));

  return renderToggle ? renderToggle(rest, ref) : toggle;
});

DropdownToggle.displayName = 'DropdownToggle';
DropdownToggle.propTypes = {
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  icon: _propTypes.default.node,
  classPrefix: _propTypes.default.string,
  noCaret: _propTypes.default.bool,
  as: _propTypes.default.elementType,
  renderToggle: _propTypes.default.func,
  placement: _propTypes.default.oneOf(['bottomStart', 'bottomEnd', 'topStart', 'topEnd', 'leftStart', 'rightStart', 'leftEnd', 'rightEnd'])
};
var _default = DropdownToggle;
exports.default = _default;
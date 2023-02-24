"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _Button = _interopRequireDefault(require("../Button"));

var IconButton = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var icon = props.icon,
      _props$placement = props.placement,
      placement = _props$placement === void 0 ? 'left' : _props$placement,
      children = props.children,
      circle = props.circle,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'btn-icon' : _props$classPrefix,
      className = props.className,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["icon", "placement", "children", "circle", "classPrefix", "className"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix("placement-" + placement, {
    circle: circle,
    'with-text': typeof children !== 'undefined'
  }));
  return /*#__PURE__*/_react.default.createElement(_Button.default, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), icon, children);
});

IconButton.displayName = 'IconButton';
IconButton.propTypes = {
  className: _propTypes.default.string,
  icon: _propTypes.default.any,
  classPrefix: _propTypes.default.string,
  circle: _propTypes.default.bool,
  children: _propTypes.default.node,
  placement: _propTypes.default.oneOf(['left', 'right'])
};
var _default = IconButton;
exports.default = _default;
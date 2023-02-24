"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _Close = _interopRequireDefault(require("@rsuite/icons/Close"));

var _utils = require("../utils");

/**
 * Close button for components such as Message and Notification.
 */
var CloseButton = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'span' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'btn-close' : _props$classPrefix,
      className = props.className,
      overrideLocale = props.locale,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "locale"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var _useCustom = (0, _utils.useCustom)('CloseButton', overrideLocale),
      locale = _useCustom.locale;

  var classes = merge(className, withClassPrefix());
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "button"
  }, rest, {
    ref: ref,
    className: classes,
    title: locale === null || locale === void 0 ? void 0 : locale.closeLabel,
    "aria-label": locale === null || locale === void 0 ? void 0 : locale.closeLabel
  }), /*#__PURE__*/_react.default.createElement(_Close.default, null));
});

CloseButton.displayName = 'CloseButton';
var _default = CloseButton;
exports.default = _default;
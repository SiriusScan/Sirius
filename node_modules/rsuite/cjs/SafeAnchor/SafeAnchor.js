"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function isTrivialHref(href) {
  return !href || href.trim() === '#';
}

var SafeAnchor = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'a' : _props$as,
      href = props.href,
      disabled = props.disabled,
      onClick = props.onClick,
      restProps = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "href", "disabled", "onClick"]);
  var handleClick = (0, _react.useCallback)(function (event) {
    if (disabled || isTrivialHref(href)) {
      event.preventDefault();
    }

    if (disabled) {
      event.stopPropagation();
      return;
    }

    onClick === null || onClick === void 0 ? void 0 : onClick(event);
  }, [disabled, href, onClick]); // There are default role and href attributes on the node to ensure Focus management and keyboard interactions.

  var trivialProps = isTrivialHref(href) ? {
    role: 'button',
    href: '#'
  } : null;

  if (disabled) {
    restProps.tabIndex = -1;
    restProps['aria-disabled'] = true;
  }

  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    ref: ref,
    href: href
  }, trivialProps, restProps, {
    onClick: handleClick
  }));
});

SafeAnchor.displayName = 'SafeAnchor';
SafeAnchor.propTypes = {
  href: _propTypes.default.string,
  disabled: _propTypes.default.bool,
  as: _propTypes.default.elementType
};
var _default = SafeAnchor;
exports.default = _default;
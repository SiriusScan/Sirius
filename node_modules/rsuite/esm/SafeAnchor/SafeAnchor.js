import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

function isTrivialHref(href) {
  return !href || href.trim() === '#';
}

var SafeAnchor = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'a' : _props$as,
      href = props.href,
      disabled = props.disabled,
      onClick = props.onClick,
      restProps = _objectWithoutPropertiesLoose(props, ["as", "href", "disabled", "onClick"]);

  var handleClick = useCallback(function (event) {
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

  return /*#__PURE__*/React.createElement(Component, _extends({
    ref: ref,
    href: href
  }, trivialProps, restProps, {
    onClick: handleClick
  }));
});
SafeAnchor.displayName = 'SafeAnchor';
SafeAnchor.propTypes = {
  href: PropTypes.string,
  disabled: PropTypes.bool,
  as: PropTypes.elementType
};
export default SafeAnchor;
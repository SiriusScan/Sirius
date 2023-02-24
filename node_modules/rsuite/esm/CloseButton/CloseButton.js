import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import Close from '@rsuite/icons/Close';
import { useClassNames, useCustom } from '../utils';

/**
 * Close button for components such as Message and Notification.
 */
var CloseButton = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'span' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'btn-close' : _props$classPrefix,
      className = props.className,
      overrideLocale = props.locale,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "locale"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var _useCustom = useCustom('CloseButton', overrideLocale),
      locale = _useCustom.locale;

  var classes = merge(className, withClassPrefix());
  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "button"
  }, rest, {
    ref: ref,
    className: classes,
    title: locale === null || locale === void 0 ? void 0 : locale.closeLabel,
    "aria-label": locale === null || locale === void 0 ? void 0 : locale.closeLabel
  }), /*#__PURE__*/React.createElement(Close, null));
});
CloseButton.displayName = 'CloseButton';
export default CloseButton;
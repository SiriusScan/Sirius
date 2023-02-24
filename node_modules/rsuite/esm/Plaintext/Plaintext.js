import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import { useClassNames, useCustom } from '../utils';

/**
 *  Make the component display in plain text, and display default characters when there is no children.
 */
var Plaintext = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _useCustom = useCustom('Plaintext'),
      locale = _useCustom.locale;

  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'plaintext' : _props$classPrefix,
      className = props.className,
      children = props.children,
      _props$localeKey = props.localeKey,
      localeKey = _props$localeKey === void 0 ? '' : _props$localeKey,
      _props$placeholder = props.placeholder,
      placeholder = _props$placeholder === void 0 ? locale[localeKey] : _props$placeholder,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "children", "localeKey", "placeholder"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    empty: !children
  }));
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), children ? children : placeholder);
});
Plaintext.displayName = 'Plaintext';
export default Plaintext;
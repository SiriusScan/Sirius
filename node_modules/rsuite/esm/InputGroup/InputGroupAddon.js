import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
var InputGroupAddon = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'span' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'input-group-addon' : _props$classPrefix,
      className = props.className,
      disabled = props.disabled,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "disabled"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    disabled: disabled
  }));
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }));
});
InputGroupAddon.displayName = 'InputGroupAddon';
InputGroupAddon.propTypes = {
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  disabled: PropTypes.bool
};
export default InputGroupAddon;
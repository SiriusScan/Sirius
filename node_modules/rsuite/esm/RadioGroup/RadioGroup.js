import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useClassNames, useControlled } from '../utils';
import Plaintext from '../Plaintext';
export var RadioContext = /*#__PURE__*/React.createContext({});
var RadioGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      inline = props.inline,
      children = props.children,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'radio-group' : _props$classPrefix,
      valueProp = props.value,
      defaultValue = props.defaultValue,
      _props$appearance = props.appearance,
      appearance = _props$appearance === void 0 ? 'default' : _props$appearance,
      name = props.name,
      plaintext = props.plaintext,
      disabled = props.disabled,
      readOnly = props.readOnly,
      onChange = props.onChange,
      rest = _objectWithoutPropertiesLoose(props, ["as", "className", "inline", "children", "classPrefix", "value", "defaultValue", "appearance", "name", "plaintext", "disabled", "readOnly", "onChange"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix(appearance, {
    inline: inline
  }));

  var _useControlled = useControlled(valueProp, defaultValue),
      value = _useControlled[0],
      setValue = _useControlled[1],
      isControlled = _useControlled[2];

  var handleChange = useCallback(function (nextValue, event) {
    setValue(nextValue);
    onChange === null || onChange === void 0 ? void 0 : onChange(nextValue !== null && nextValue !== void 0 ? nextValue : '', event);
  }, [onChange, setValue]);
  var contextValue = useMemo(function () {
    return {
      inline: inline,
      name: name,
      value: typeof value === 'undefined' ? null : value,
      controlled: isControlled,
      plaintext: plaintext,
      disabled: disabled,
      readOnly: readOnly,
      onChange: handleChange
    };
  }, [disabled, handleChange, inline, isControlled, name, plaintext, readOnly, value]);
  return /*#__PURE__*/React.createElement(RadioContext.Provider, {
    value: contextValue
  }, plaintext ? /*#__PURE__*/React.createElement(Plaintext, _extends({
    ref: ref,
    localeKey: "notSelected"
  }, rest), value ? children : null) : /*#__PURE__*/React.createElement(Component, _extends({
    role: "radiogroup"
  }, rest, {
    ref: ref,
    className: classes
  }), children));
});
RadioGroup.displayName = 'RadioGroup';
RadioGroup.propTypes = {
  appearance: PropTypes.oneOf(['default', 'picker']),
  name: PropTypes.string,
  inline: PropTypes.bool,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  children: PropTypes.node,
  onChange: PropTypes.func,
  plaintext: PropTypes.bool
};
export default RadioGroup;
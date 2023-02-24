import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';
import remove from 'lodash/remove';
import { useClassNames, useControlled, shallowEqual } from '../utils';
import Plaintext from '../Plaintext';
import { CheckboxGroupContext } from './CheckboxGroupContext';
var CheckboxGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      inline = props.inline,
      children = props.children,
      name = props.name,
      valueProp = props.value,
      defaultValue = props.defaultValue,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'checkbox-group' : _props$classPrefix,
      disabled = props.disabled,
      readOnly = props.readOnly,
      plaintext = props.plaintext,
      onChange = props.onChange,
      rest = _objectWithoutPropertiesLoose(props, ["as", "className", "inline", "children", "name", "value", "defaultValue", "classPrefix", "disabled", "readOnly", "plaintext", "onChange"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix({
    inline: inline
  }));

  var _useControlled = useControlled(valueProp, defaultValue),
      value = _useControlled[0],
      setValue = _useControlled[1],
      isControlled = _useControlled[2];

  var handleChange = useCallback(function (itemValue, itemChecked, event) {
    var nextValue = cloneDeep(value) || [];

    if (itemChecked) {
      nextValue.push(itemValue);
    } else {
      remove(nextValue, function (i) {
        return shallowEqual(i, itemValue);
      });
    }

    setValue(nextValue);
    onChange === null || onChange === void 0 ? void 0 : onChange(nextValue, event);
  }, [onChange, setValue, value]);
  var contextValue = useMemo(function () {
    return {
      inline: inline,
      name: name,
      value: value,
      readOnly: readOnly,
      disabled: disabled,
      plaintext: plaintext,
      controlled: isControlled,
      onChange: handleChange
    };
  }, [disabled, handleChange, inline, isControlled, name, plaintext, readOnly, value]);
  return /*#__PURE__*/React.createElement(CheckboxGroupContext.Provider, {
    value: contextValue
  }, plaintext ? /*#__PURE__*/React.createElement(Plaintext, _extends({
    ref: ref,
    localeKey: "notSelected"
  }, rest), value !== null && value !== void 0 && value.length ? children : null) : /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    role: "group",
    className: classes
  }), children));
});
CheckboxGroup.displayName = 'CheckboxGroup';
CheckboxGroup.propTypes = {
  as: PropTypes.elementType,
  name: PropTypes.string,
  className: PropTypes.string,
  inline: PropTypes.bool,
  value: PropTypes.array,
  defaultValue: PropTypes.array,
  onChange: PropTypes.func,
  children: PropTypes.array,
  classPrefix: PropTypes.string,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  plaintext: PropTypes.bool
};
export default CheckboxGroup;
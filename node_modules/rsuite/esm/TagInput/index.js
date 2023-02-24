import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useMemo } from 'react';
import InputPicker, { InputPickerContext } from '../InputPicker/InputPicker';
var TagInput = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$tagProps = props.tagProps,
      tagProps = _props$tagProps === void 0 ? {} : _props$tagProps,
      _props$trigger = props.trigger,
      trigger = _props$trigger === void 0 ? 'Enter' : _props$trigger,
      value = props.value,
      defaultValue = props.defaultValue,
      rest = _objectWithoutPropertiesLoose(props, ["tagProps", "trigger", "value", "defaultValue"]);

  var contextValue = useMemo(function () {
    return {
      multi: true,
      disabledOptions: true,
      trigger: trigger,
      tagProps: tagProps
    };
  }, [tagProps, trigger]);
  var data = useMemo(function () {
    return (value || defaultValue || []).map(function (v) {
      return {
        value: v,
        label: v
      };
    });
  }, [defaultValue, value]);
  return /*#__PURE__*/React.createElement(InputPickerContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(InputPicker, _extends({}, rest, {
    value: value,
    defaultValue: defaultValue,
    data: data,
    placement: undefined,
    creatable: true,
    ref: ref
  })));
});
TagInput.displayName = 'TagInput';
export default TagInput;
import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useMemo } from 'react';
import InputPicker, { InputPickerContext } from '../InputPicker/InputPicker';
var TagPicker = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$tagProps = props.tagProps,
      tagProps = _props$tagProps === void 0 ? {} : _props$tagProps,
      _props$trigger = props.trigger,
      trigger = _props$trigger === void 0 ? 'Enter' : _props$trigger,
      rest = _objectWithoutPropertiesLoose(props, ["tagProps", "trigger"]);

  var contextValue = useMemo(function () {
    return {
      multi: true,
      trigger: trigger,
      tagProps: tagProps
    };
  }, [tagProps, trigger]);
  return /*#__PURE__*/React.createElement(InputPickerContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(InputPicker, _extends({}, rest, {
    ref: ref
  })));
});
TagPicker.displayName = 'TagPicker';
export default TagPicker;
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _cloneDeep = _interopRequireDefault(require("lodash/cloneDeep"));

var _remove = _interopRequireDefault(require("lodash/remove"));

var _utils = require("../utils");

var _Plaintext = _interopRequireDefault(require("../Plaintext"));

var _CheckboxGroupContext = require("./CheckboxGroupContext");

var CheckboxGroup = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
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
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "inline", "children", "name", "value", "defaultValue", "classPrefix", "disabled", "readOnly", "plaintext", "onChange"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix({
    inline: inline
  }));

  var _useControlled = (0, _utils.useControlled)(valueProp, defaultValue),
      value = _useControlled[0],
      setValue = _useControlled[1],
      isControlled = _useControlled[2];

  var handleChange = (0, _react.useCallback)(function (itemValue, itemChecked, event) {
    var nextValue = (0, _cloneDeep.default)(value) || [];

    if (itemChecked) {
      nextValue.push(itemValue);
    } else {
      (0, _remove.default)(nextValue, function (i) {
        return (0, _utils.shallowEqual)(i, itemValue);
      });
    }

    setValue(nextValue);
    onChange === null || onChange === void 0 ? void 0 : onChange(nextValue, event);
  }, [onChange, setValue, value]);
  var contextValue = (0, _react.useMemo)(function () {
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
  return /*#__PURE__*/_react.default.createElement(_CheckboxGroupContext.CheckboxGroupContext.Provider, {
    value: contextValue
  }, plaintext ? /*#__PURE__*/_react.default.createElement(_Plaintext.default, (0, _extends2.default)({
    ref: ref,
    localeKey: "notSelected"
  }, rest), value !== null && value !== void 0 && value.length ? children : null) : /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    role: "group",
    className: classes
  }), children));
});

CheckboxGroup.displayName = 'CheckboxGroup';
CheckboxGroup.propTypes = {
  as: _propTypes.default.elementType,
  name: _propTypes.default.string,
  className: _propTypes.default.string,
  inline: _propTypes.default.bool,
  value: _propTypes.default.array,
  defaultValue: _propTypes.default.array,
  onChange: _propTypes.default.func,
  children: _propTypes.default.array,
  classPrefix: _propTypes.default.string,
  readOnly: _propTypes.default.bool,
  disabled: _propTypes.default.bool,
  plaintext: _propTypes.default.bool
};
var _default = CheckboxGroup;
exports.default = _default;
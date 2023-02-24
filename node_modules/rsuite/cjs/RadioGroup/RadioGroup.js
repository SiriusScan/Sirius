"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.RadioContext = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _Plaintext = _interopRequireDefault(require("../Plaintext"));

var RadioContext = /*#__PURE__*/_react.default.createContext({});

exports.RadioContext = RadioContext;

var RadioGroup = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
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
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "inline", "children", "classPrefix", "value", "defaultValue", "appearance", "name", "plaintext", "disabled", "readOnly", "onChange"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix(appearance, {
    inline: inline
  }));

  var _useControlled = (0, _utils.useControlled)(valueProp, defaultValue),
      value = _useControlled[0],
      setValue = _useControlled[1],
      isControlled = _useControlled[2];

  var handleChange = (0, _react.useCallback)(function (nextValue, event) {
    setValue(nextValue);
    onChange === null || onChange === void 0 ? void 0 : onChange(nextValue !== null && nextValue !== void 0 ? nextValue : '', event);
  }, [onChange, setValue]);
  var contextValue = (0, _react.useMemo)(function () {
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
  return /*#__PURE__*/_react.default.createElement(RadioContext.Provider, {
    value: contextValue
  }, plaintext ? /*#__PURE__*/_react.default.createElement(_Plaintext.default, (0, _extends2.default)({
    ref: ref,
    localeKey: "notSelected"
  }, rest), value ? children : null) : /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "radiogroup"
  }, rest, {
    ref: ref,
    className: classes
  }), children));
});

RadioGroup.displayName = 'RadioGroup';
RadioGroup.propTypes = {
  appearance: _propTypes.default.oneOf(['default', 'picker']),
  name: _propTypes.default.string,
  inline: _propTypes.default.bool,
  value: _propTypes.default.any,
  defaultValue: _propTypes.default.any,
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  children: _propTypes.default.node,
  onChange: _propTypes.default.func,
  plaintext: _propTypes.default.bool
};
var _default = RadioGroup;
exports.default = _default;
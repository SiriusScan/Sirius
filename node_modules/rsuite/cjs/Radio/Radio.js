"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _RadioGroup = require("../RadioGroup/RadioGroup");

var _utils = require("../utils");

var Radio = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _useContext = (0, _react.useContext)(_RadioGroup.RadioContext),
      groupValue = _useContext.value,
      controlled = _useContext.controlled,
      inlineContext = _useContext.inline,
      nameContext = _useContext.name,
      disabledContext = _useContext.disabled,
      readOnlyContext = _useContext.readOnly,
      plaintextContext = _useContext.plaintext,
      onGroupChange = _useContext.onChange;

  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      title = props.title,
      className = props.className,
      children = props.children,
      checkedProp = props.checked,
      defaultChecked = props.defaultChecked,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'radio' : _props$classPrefix,
      _props$tabIndex = props.tabIndex,
      tabIndex = _props$tabIndex === void 0 ? 0 : _props$tabIndex,
      inputRef = props.inputRef,
      inputProps = props.inputProps,
      _props$disabled = props.disabled,
      disabled = _props$disabled === void 0 ? disabledContext : _props$disabled,
      _props$readOnly = props.readOnly,
      readOnly = _props$readOnly === void 0 ? readOnlyContext : _props$readOnly,
      _props$plaintext = props.plaintext,
      plaintext = _props$plaintext === void 0 ? plaintextContext : _props$plaintext,
      _props$inline = props.inline,
      inline = _props$inline === void 0 ? inlineContext : _props$inline,
      _props$name = props.name,
      name = _props$name === void 0 ? nameContext : _props$name,
      value = props.value,
      onChange = props.onChange,
      onClick = props.onClick,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "title", "className", "children", "checked", "defaultChecked", "classPrefix", "tabIndex", "inputRef", "inputProps", "disabled", "readOnly", "plaintext", "inline", "name", "value", "onChange", "onClick"]);

  var _useControlled = (0, _utils.useControlled)(typeof groupValue !== 'undefined' ? groupValue === value : checkedProp, defaultChecked || false),
      checked = _useControlled[0],
      setChecked = _useControlled[1];

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix({
    inline: inline,
    disabled: disabled,
    checked: checked
  }));

  var _partitionHTMLProps = (0, _utils.partitionHTMLProps)(rest),
      htmlInputProps = _partitionHTMLProps[0],
      restProps = _partitionHTMLProps[1];

  var handleChange = (0, _react.useCallback)(function (event) {
    if (disabled || readOnly) {
      return;
    }

    setChecked(true);
    onGroupChange === null || onGroupChange === void 0 ? void 0 : onGroupChange(value, event);
    onChange === null || onChange === void 0 ? void 0 : onChange(value, true, event);
  }, [disabled, onChange, onGroupChange, readOnly, setChecked, value]);

  if (typeof controlled !== 'undefined') {
    // In uncontrolled situations, use defaultChecked instead of checked
    htmlInputProps[controlled ? 'checked' : 'defaultChecked'] = checked;
  }

  var input = /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('wrapper')
  }, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({}, htmlInputProps, inputProps, {
    ref: inputRef,
    type: "radio",
    name: name,
    value: value,
    tabIndex: tabIndex,
    disabled: disabled,
    onChange: handleChange,
    onClick: (0, _react.useCallback)(function (event) {
      return event.stopPropagation();
    }, [])
  })), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('inner'),
    "aria-hidden": true
  }));

  if (plaintext) {
    return checked ? /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, restProps, {
      ref: ref,
      className: classes
    }), children) : null;
  }

  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, restProps, {
    ref: ref,
    onClick: onClick,
    className: classes,
    "aria-checked": checked,
    "aria-disabled": disabled
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('checker')
  }, children ? /*#__PURE__*/_react.default.createElement("label", {
    title: title
  }, input, children) : input));
});

Radio.displayName = 'Radio';
Radio.propTypes = {
  id: _propTypes.default.string,
  name: _propTypes.default.string,
  inline: _propTypes.default.bool,
  title: _propTypes.default.string,
  disabled: _propTypes.default.bool,
  checked: _propTypes.default.bool,
  defaultChecked: _propTypes.default.bool,
  inputProps: _propTypes.default.any,
  children: _propTypes.default.node,
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  value: _propTypes.default.any,
  inputRef: _utils.TypeChecker.refType,
  onChange: _propTypes.default.func,
  onClick: _propTypes.default.func,
  tabIndex: _propTypes.default.number
};
var _default = Radio;
exports.default = _default;
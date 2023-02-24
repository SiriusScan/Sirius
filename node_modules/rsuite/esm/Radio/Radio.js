import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { RadioContext } from '../RadioGroup/RadioGroup';
import { useClassNames, useControlled, partitionHTMLProps, TypeChecker } from '../utils';
var Radio = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _useContext = useContext(RadioContext),
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
      rest = _objectWithoutPropertiesLoose(props, ["as", "title", "className", "children", "checked", "defaultChecked", "classPrefix", "tabIndex", "inputRef", "inputProps", "disabled", "readOnly", "plaintext", "inline", "name", "value", "onChange", "onClick"]);

  var _useControlled = useControlled(typeof groupValue !== 'undefined' ? groupValue === value : checkedProp, defaultChecked || false),
      checked = _useControlled[0],
      setChecked = _useControlled[1];

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix({
    inline: inline,
    disabled: disabled,
    checked: checked
  }));

  var _partitionHTMLProps = partitionHTMLProps(rest),
      htmlInputProps = _partitionHTMLProps[0],
      restProps = _partitionHTMLProps[1];

  var handleChange = useCallback(function (event) {
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

  var input = /*#__PURE__*/React.createElement("span", {
    className: prefix('wrapper')
  }, /*#__PURE__*/React.createElement("input", _extends({}, htmlInputProps, inputProps, {
    ref: inputRef,
    type: "radio",
    name: name,
    value: value,
    tabIndex: tabIndex,
    disabled: disabled,
    onChange: handleChange,
    onClick: useCallback(function (event) {
      return event.stopPropagation();
    }, [])
  })), /*#__PURE__*/React.createElement("span", {
    className: prefix('inner'),
    "aria-hidden": true
  }));

  if (plaintext) {
    return checked ? /*#__PURE__*/React.createElement(Component, _extends({}, restProps, {
      ref: ref,
      className: classes
    }), children) : null;
  }

  return /*#__PURE__*/React.createElement(Component, _extends({}, restProps, {
    ref: ref,
    onClick: onClick,
    className: classes,
    "aria-checked": checked,
    "aria-disabled": disabled
  }), /*#__PURE__*/React.createElement("div", {
    className: prefix('checker')
  }, children ? /*#__PURE__*/React.createElement("label", {
    title: title
  }, input, children) : input));
});
Radio.displayName = 'Radio';
Radio.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  inline: PropTypes.bool,
  title: PropTypes.string,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  inputProps: PropTypes.any,
  children: PropTypes.node,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  value: PropTypes.any,
  inputRef: TypeChecker.refType,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  tabIndex: PropTypes.number
};
export default Radio;
import _taggedTemplateLiteralLoose from "@babel/runtime/helpers/esm/taggedTemplateLiteralLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";

var _templateObject, _templateObject2, _templateObject3;

import React, { useContext, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useControlled, partitionHTMLProps, useClassNames, TypeChecker } from '../utils';
import { CheckboxGroupContext } from '../CheckboxGroup';
var Checkbox = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var checkboxGroupContext = useContext(CheckboxGroupContext);

  var _ref = checkboxGroupContext !== null && checkboxGroupContext !== void 0 ? checkboxGroupContext : {},
      inlineContext = _ref.inline,
      nameContext = _ref.name,
      disabledContext = _ref.disabled,
      readOnlyContext = _ref.readOnly,
      plaintextContext = _ref.plaintext,
      onGroupChange = _ref.onChange;

  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      controlledChecked = props.checked,
      className = props.className,
      children = props.children,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'checkbox' : _props$classPrefix,
      _props$checkable = props.checkable,
      checkable = _props$checkable === void 0 ? true : _props$checkable,
      _props$defaultChecked = props.defaultChecked,
      defaultChecked = _props$defaultChecked === void 0 ? false : _props$defaultChecked,
      title = props.title,
      inputRef = props.inputRef,
      inputProps = props.inputProps,
      indeterminate = props.indeterminate,
      _props$tabIndex = props.tabIndex,
      tabIndex = _props$tabIndex === void 0 ? 0 : _props$tabIndex,
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
      onClick = props.onClick,
      onCheckboxClick = props.onCheckboxClick,
      onChange = props.onChange,
      rest = _objectWithoutPropertiesLoose(props, ["as", "checked", "className", "children", "classPrefix", "checkable", "defaultChecked", "title", "inputRef", "inputProps", "indeterminate", "tabIndex", "disabled", "readOnly", "plaintext", "inline", "name", "value", "onClick", "onCheckboxClick", "onChange"]);

  var _useControlled = useControlled(controlledChecked, defaultChecked),
      selfChecked = _useControlled[0],
      setSelfChecked = _useControlled[1],
      selfControlled = _useControlled[2]; // Either <Checkbox> is checked itself or by parent <CheckboxGroup>


  var checked = useMemo(function () {
    var _checkboxGroupContext, _checkboxGroupContext2;

    if (!checkboxGroupContext) {
      return selfChecked;
    } // fixme value from group should not be nullable


    return (_checkboxGroupContext = (_checkboxGroupContext2 = checkboxGroupContext.value) === null || _checkboxGroupContext2 === void 0 ? void 0 : _checkboxGroupContext2.some(function (checkedValue) {
      return checkedValue === value;
    })) !== null && _checkboxGroupContext !== void 0 ? _checkboxGroupContext : false;
  }, [checkboxGroupContext, selfChecked, value]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix({
    inline: inline,
    indeterminate: indeterminate,
    disabled: disabled,
    checked: checked
  }));

  var _partitionHTMLProps = partitionHTMLProps(rest),
      htmlInputProps = _partitionHTMLProps[0],
      restProps = _partitionHTMLProps[1]; // If <Checkbox> is within a <CheckboxGroup>, it's bound to be controlled
  // because its checked state is inferred from group's value, not retrieved from the DOM


  var controlled = checkboxGroupContext ? true : selfControlled;

  if (typeof controlled !== 'undefined') {
    // In uncontrolled situations, use defaultChecked instead of checked
    htmlInputProps[controlled ? 'checked' : 'defaultChecked'] = checked;
  }

  var handleChange = useCallback(function (event) {
    var nextChecked = event.target.checked;

    if (disabled || readOnly) {
      return;
    }

    setSelfChecked(nextChecked);
    onChange === null || onChange === void 0 ? void 0 : onChange(value, nextChecked, event);
    onGroupChange === null || onGroupChange === void 0 ? void 0 : onGroupChange(value, nextChecked, event);
  }, [disabled, readOnly, setSelfChecked, onChange, value, onGroupChange]);

  if (plaintext) {
    return checked ? /*#__PURE__*/React.createElement(Component, _extends({}, restProps, {
      ref: ref,
      className: classes
    }), children) : null;
  }

  var input = /*#__PURE__*/React.createElement("span", {
    className: prefix(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["wrapper"]))),
    onClick: onCheckboxClick,
    "aria-disabled": disabled
  }, /*#__PURE__*/React.createElement("input", _extends({}, htmlInputProps, inputProps, {
    name: name,
    value: value,
    type: "checkbox",
    ref: inputRef,
    tabIndex: tabIndex,
    readOnly: readOnly,
    disabled: disabled,
    "aria-disabled": disabled,
    "aria-checked": indeterminate ? 'mixed' : checked,
    onClick: function onClick(event) {
      return event.stopPropagation();
    },
    onChange: handleChange
  })), /*#__PURE__*/React.createElement("span", {
    className: prefix(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["inner"]))),
    "aria-hidden": true,
    role: "presentation"
  }));
  return /*#__PURE__*/React.createElement(Component, _extends({}, restProps, {
    ref: ref,
    onClick: onClick,
    className: classes
  }), /*#__PURE__*/React.createElement("div", {
    className: prefix(_templateObject3 || (_templateObject3 = _taggedTemplateLiteralLoose(["checker"])))
  }, /*#__PURE__*/React.createElement("label", {
    title: title
  }, checkable ? input : null, children)));
});
Checkbox.displayName = 'Checkbox';
Checkbox.propTypes = {
  as: PropTypes.elementType,
  title: PropTypes.string,
  className: PropTypes.string,
  inline: PropTypes.bool,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  inputProps: PropTypes.any,
  inputRef: TypeChecker.refType,
  value: PropTypes.any,
  children: PropTypes.node,
  classPrefix: PropTypes.string,
  tabIndex: PropTypes.number,
  checkable: PropTypes.bool,
  onCheckboxClick: PropTypes.func
};
export default Checkbox;
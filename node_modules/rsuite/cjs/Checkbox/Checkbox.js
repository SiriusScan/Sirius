"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.default = void 0;

var _taggedTemplateLiteralLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteralLoose"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _CheckboxGroup = require("../CheckboxGroup");

var _templateObject, _templateObject2, _templateObject3;

var Checkbox = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var checkboxGroupContext = (0, _react.useContext)(_CheckboxGroup.CheckboxGroupContext);

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
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "checked", "className", "children", "classPrefix", "checkable", "defaultChecked", "title", "inputRef", "inputProps", "indeterminate", "tabIndex", "disabled", "readOnly", "plaintext", "inline", "name", "value", "onClick", "onCheckboxClick", "onChange"]);

  var _useControlled = (0, _utils.useControlled)(controlledChecked, defaultChecked),
      selfChecked = _useControlled[0],
      setSelfChecked = _useControlled[1],
      selfControlled = _useControlled[2]; // Either <Checkbox> is checked itself or by parent <CheckboxGroup>


  var checked = (0, _react.useMemo)(function () {
    var _checkboxGroupContext, _checkboxGroupContext2;

    if (!checkboxGroupContext) {
      return selfChecked;
    } // fixme value from group should not be nullable


    return (_checkboxGroupContext = (_checkboxGroupContext2 = checkboxGroupContext.value) === null || _checkboxGroupContext2 === void 0 ? void 0 : _checkboxGroupContext2.some(function (checkedValue) {
      return checkedValue === value;
    })) !== null && _checkboxGroupContext !== void 0 ? _checkboxGroupContext : false;
  }, [checkboxGroupContext, selfChecked, value]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix({
    inline: inline,
    indeterminate: indeterminate,
    disabled: disabled,
    checked: checked
  }));

  var _partitionHTMLProps = (0, _utils.partitionHTMLProps)(rest),
      htmlInputProps = _partitionHTMLProps[0],
      restProps = _partitionHTMLProps[1]; // If <Checkbox> is within a <CheckboxGroup>, it's bound to be controlled
  // because its checked state is inferred from group's value, not retrieved from the DOM


  var controlled = checkboxGroupContext ? true : selfControlled;

  if (typeof controlled !== 'undefined') {
    // In uncontrolled situations, use defaultChecked instead of checked
    htmlInputProps[controlled ? 'checked' : 'defaultChecked'] = checked;
  }

  var handleChange = (0, _react.useCallback)(function (event) {
    var nextChecked = event.target.checked;

    if (disabled || readOnly) {
      return;
    }

    setSelfChecked(nextChecked);
    onChange === null || onChange === void 0 ? void 0 : onChange(value, nextChecked, event);
    onGroupChange === null || onGroupChange === void 0 ? void 0 : onGroupChange(value, nextChecked, event);
  }, [disabled, readOnly, setSelfChecked, onChange, value, onGroupChange]);

  if (plaintext) {
    return checked ? /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, restProps, {
      ref: ref,
      className: classes
    }), children) : null;
  }

  var input = /*#__PURE__*/_react.default.createElement("span", {
    className: prefix(_templateObject || (_templateObject = (0, _taggedTemplateLiteralLoose2.default)(["wrapper"]))),
    onClick: onCheckboxClick,
    "aria-disabled": disabled
  }, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({}, htmlInputProps, inputProps, {
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
  })), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix(_templateObject2 || (_templateObject2 = (0, _taggedTemplateLiteralLoose2.default)(["inner"]))),
    "aria-hidden": true,
    role: "presentation"
  }));

  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, restProps, {
    ref: ref,
    onClick: onClick,
    className: classes
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix(_templateObject3 || (_templateObject3 = (0, _taggedTemplateLiteralLoose2.default)(["checker"])))
  }, /*#__PURE__*/_react.default.createElement("label", {
    title: title
  }, checkable ? input : null, children)));
});

Checkbox.displayName = 'Checkbox';
Checkbox.propTypes = {
  as: _propTypes.default.elementType,
  title: _propTypes.default.string,
  className: _propTypes.default.string,
  inline: _propTypes.default.bool,
  disabled: _propTypes.default.bool,
  checked: _propTypes.default.bool,
  defaultChecked: _propTypes.default.bool,
  indeterminate: _propTypes.default.bool,
  onChange: _propTypes.default.func,
  onClick: _propTypes.default.func,
  inputProps: _propTypes.default.any,
  inputRef: _utils.TypeChecker.refType,
  value: _propTypes.default.any,
  children: _propTypes.default.node,
  classPrefix: _propTypes.default.string,
  tabIndex: _propTypes.default.number,
  checkable: _propTypes.default.bool,
  onCheckboxClick: _propTypes.default.func
};
var _default = Checkbox;
exports.default = _default;
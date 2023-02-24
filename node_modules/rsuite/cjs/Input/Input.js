"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _FormGroup = require("../FormGroup/FormGroup");

var _InputGroup = require("../InputGroup/InputGroup");

var _Plaintext = _interopRequireDefault(require("../Plaintext"));

var _utils = require("../utils");

var Input = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'input' : _props$classPrefix,
      _props$as = props.as,
      Component = _props$as === void 0 ? 'input' : _props$as,
      _props$type = props.type,
      type = _props$type === void 0 ? 'text' : _props$type,
      disabled = props.disabled,
      value = props.value,
      defaultValue = props.defaultValue,
      inputRef = props.inputRef,
      id = props.id,
      size = props.size,
      plaintext = props.plaintext,
      readOnly = props.readOnly,
      onPressEnter = props.onPressEnter,
      onFocus = props.onFocus,
      onBlur = props.onBlur,
      onKeyDown = props.onKeyDown,
      onChange = props.onChange,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["className", "classPrefix", "as", "type", "disabled", "value", "defaultValue", "inputRef", "id", "size", "plaintext", "readOnly", "onPressEnter", "onFocus", "onBlur", "onKeyDown", "onChange"]);
  var handleKeyDown = (0, _react.useCallback)(function (event) {
    if (event.key === _utils.KEY_VALUES.ENTER) {
      onPressEnter === null || onPressEnter === void 0 ? void 0 : onPressEnter(event);
    }

    onKeyDown === null || onKeyDown === void 0 ? void 0 : onKeyDown(event);
  }, [onPressEnter, onKeyDown]);
  var handleChange = (0, _react.useCallback)(function (event) {
    var _event$target;

    onChange === null || onChange === void 0 ? void 0 : onChange((_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.value, event);
  }, [onChange]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix(size, {
    plaintext: plaintext
  }));
  var inputGroupContext = (0, _react.useContext)(_InputGroup.InputGroupContext);
  var formGroupContext = (0, _react.useContext)(_FormGroup.FormGroupContext); // Make the Input component display in plain text,
  // and display default characters when there is no value.

  if (plaintext) {
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, {
      ref: ref,
      localeKey: "unfilled"
    }, typeof value === 'undefined' ? defaultValue : value);
  }

  var operable = !disabled && !readOnly;
  var eventProps = {};

  if (operable) {
    eventProps.onChange = handleChange;
    eventProps.onKeyDown = handleKeyDown;
    eventProps.onFocus = (0, _utils.createChainedFunction)(onFocus, inputGroupContext === null || inputGroupContext === void 0 ? void 0 : inputGroupContext.onFocus);
    eventProps.onBlur = (0, _utils.createChainedFunction)(onBlur, inputGroupContext === null || inputGroupContext === void 0 ? void 0 : inputGroupContext.onBlur);
  }

  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, eventProps, {
    ref: (0, _utils.mergeRefs)(ref, inputRef),
    className: classes,
    type: type,
    id: id || (formGroupContext === null || formGroupContext === void 0 ? void 0 : formGroupContext.controlId),
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    readOnly: readOnly
  }));
});

Input.displayName = 'Input';
Input.propTypes = {
  type: _propTypes.default.string,
  as: _propTypes.default.elementType,
  id: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  className: _propTypes.default.string,
  disabled: _propTypes.default.bool,
  value: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),
  defaultValue: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),
  size: _propTypes.default.oneOf(['lg', 'md', 'sm', 'xs']),
  inputRef: _utils.TypeChecker.refType,
  onChange: _propTypes.default.func,
  onFocus: _propTypes.default.func,
  onBlur: _propTypes.default.func,
  onKeyDown: _propTypes.default.func,
  onPressEnter: _propTypes.default.func
};
var _default = Input;
exports.default = _default;
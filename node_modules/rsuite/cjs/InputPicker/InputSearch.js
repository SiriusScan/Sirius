"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _taggedTemplateLiteralLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteralLoose"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _templateObject;

var InputSearch = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'input' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'picker-search' : _props$classPrefix,
      children = props.children,
      className = props.className,
      value = props.value,
      inputRef = props.inputRef,
      style = props.style,
      readOnly = props.readOnly,
      onChange = props.onChange,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "children", "className", "value", "inputRef", "style", "readOnly", "onChange"]);
  var handleChange = (0, _react.useCallback)(function (event) {
    var _event$target;

    onChange === null || onChange === void 0 ? void 0 : onChange(event === null || event === void 0 ? void 0 : (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.value, event);
  }, [onChange]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix());
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: ref,
    className: classes,
    style: style
  }, /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: inputRef,
    readOnly: readOnly,
    className: prefix(_templateObject || (_templateObject = (0, _taggedTemplateLiteralLoose2.default)(["input"]))),
    value: value,
    onChange: handleChange
  })), children);
});

InputSearch.displayName = 'InputSearch';
InputSearch.propTypes = {
  classPrefix: _propTypes.default.string,
  value: _propTypes.default.string,
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  style: _propTypes.default.object,
  inputRef: _utils.TypeChecker.refType,
  as: _propTypes.default.elementType,
  onChange: _propTypes.default.func
};
var _default = InputSearch;
exports.default = _default;
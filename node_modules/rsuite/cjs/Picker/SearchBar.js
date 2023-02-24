"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _get = _interopRequireDefault(require("lodash/get"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Search = _interopRequireDefault(require("@rsuite/icons/legacy/Search"));

var _utils = require("../utils");

var SearchBar = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'picker-search-bar' : _props$classPrefix,
      value = props.value,
      children = props.children,
      className = props.className,
      placeholder = props.placeholder,
      inputRef = props.inputRef,
      onChange = props.onChange,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "value", "children", "className", "placeholder", "inputRef", "onChange"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix());
  var handleChange = (0, _react.useCallback)(function (event) {
    onChange === null || onChange === void 0 ? void 0 : onChange((0, _get.default)(event, 'target.value'), event);
  }, [onChange]);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "searchbox"
  }, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/_react.default.createElement("input", {
    className: prefix('input'),
    value: value,
    onChange: handleChange,
    placeholder: placeholder,
    ref: inputRef
  }), /*#__PURE__*/_react.default.createElement(_Search.default, {
    className: prefix('search-icon')
  }), children);
});

SearchBar.displayName = 'SearchBar';
SearchBar.propTypes = {
  as: _propTypes.default.elementType,
  classPrefix: _propTypes.default.string,
  value: _propTypes.default.string,
  placeholder: _propTypes.default.string,
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  onChange: _propTypes.default.func
};
var _default = SearchBar;
exports.default = _default;
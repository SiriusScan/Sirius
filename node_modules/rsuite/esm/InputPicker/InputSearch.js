import _extends from "@babel/runtime/helpers/esm/extends";
import _taggedTemplateLiteralLoose from "@babel/runtime/helpers/esm/taggedTemplateLiteralLoose";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";

var _templateObject;

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { TypeChecker, useClassNames } from '../utils';
var InputSearch = /*#__PURE__*/React.forwardRef(function (props, ref) {
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
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "children", "className", "value", "inputRef", "style", "readOnly", "onChange"]);

  var handleChange = useCallback(function (event) {
    var _event$target;

    onChange === null || onChange === void 0 ? void 0 : onChange(event === null || event === void 0 ? void 0 : (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.value, event);
  }, [onChange]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix());
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: classes,
    style: style
  }, /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: inputRef,
    readOnly: readOnly,
    className: prefix(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["input"]))),
    value: value,
    onChange: handleChange
  })), children);
});
InputSearch.displayName = 'InputSearch';
InputSearch.propTypes = {
  classPrefix: PropTypes.string,
  value: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object,
  inputRef: TypeChecker.refType,
  as: PropTypes.elementType,
  onChange: PropTypes.func
};
export default InputSearch;
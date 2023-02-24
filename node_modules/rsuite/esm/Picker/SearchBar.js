import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import Search from '@rsuite/icons/legacy/Search';
import { useClassNames } from '../utils';
var SearchBar = /*#__PURE__*/React.forwardRef(function (props, ref) {
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
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "value", "children", "className", "placeholder", "inputRef", "onChange"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix());
  var handleChange = useCallback(function (event) {
    onChange === null || onChange === void 0 ? void 0 : onChange(get(event, 'target.value'), event);
  }, [onChange]);
  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "searchbox"
  }, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/React.createElement("input", {
    className: prefix('input'),
    value: value,
    onChange: handleChange,
    placeholder: placeholder,
    ref: inputRef
  }), /*#__PURE__*/React.createElement(Search, {
    className: prefix('search-icon')
  }), children);
});
SearchBar.displayName = 'SearchBar';
SearchBar.propTypes = {
  as: PropTypes.elementType,
  classPrefix: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  onChange: PropTypes.func
};
export default SearchBar;
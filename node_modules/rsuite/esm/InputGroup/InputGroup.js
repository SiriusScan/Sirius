import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import InputGroupAddon from './InputGroupAddon';
import InputGroupButton from './InputGroupButton';
import { useClassNames } from '../utils';
export var InputGroupContext = /*#__PURE__*/React.createContext(null);
var InputGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'input-group' : _props$classPrefix,
      className = props.className,
      disabled = props.disabled,
      inside = props.inside,
      size = props.size,
      children = props.children,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "disabled", "inside", "size", "children"]);

  var _useState = useState(false),
      focus = _useState[0],
      setFocus = _useState[1];

  var handleFocus = useCallback(function () {
    setFocus(true);
  }, []);
  var handleBlur = useCallback(function () {
    setFocus(false);
  }, []);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix(size, {
    inside: inside,
    focus: focus,
    disabled: disabled
  }));

  var disabledChildren = function disabledChildren() {
    return React.Children.map(children, function (item) {
      if ( /*#__PURE__*/React.isValidElement(item)) {
        return /*#__PURE__*/React.cloneElement(item, {
          disabled: true
        });
      }

      return item;
    });
  };

  var contextValue = useMemo(function () {
    return {
      onFocus: handleFocus,
      onBlur: handleBlur
    };
  }, [handleFocus, handleBlur]);
  return /*#__PURE__*/React.createElement(InputGroupContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), disabled ? disabledChildren() : children));
});
InputGroup.displayName = 'InputGroup';
InputGroup.propTypes = {
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  inside: PropTypes.bool,
  size: PropTypes.oneOf(['lg', 'md', 'sm', 'xs'])
};
InputGroup.Addon = InputGroupAddon;
InputGroup.Button = InputGroupButton;
export default InputGroup;
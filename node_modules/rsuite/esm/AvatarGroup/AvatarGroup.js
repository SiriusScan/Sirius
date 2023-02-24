import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useClassNames, useCustom } from '../utils';
export var AvatarGroupContext = /*#__PURE__*/React.createContext({});
var AvatarGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'avatar-group' : _props$classPrefix,
      spacing = props.spacing,
      className = props.className,
      children = props.children,
      stack = props.stack,
      size = props.size,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "spacing", "className", "children", "stack", "size"]);

  var _useCustom = useCustom('AvatarGroup'),
      rtl = _useCustom.rtl;

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    stack: stack
  }));
  var contextValue = useMemo(function () {
    return {
      size: size
    };
  }, [size]);
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/React.createElement(AvatarGroupContext.Provider, {
    value: contextValue
  }, spacing ? React.Children.map(children, function (child) {
    var _extends2;

    return /*#__PURE__*/React.cloneElement(child, {
      style: _extends((_extends2 = {}, _extends2[rtl ? 'marginLeft' : 'marginRight'] = spacing, _extends2), child.props.style)
    });
  }) : children));
});
AvatarGroup.displayName = 'AvatarGroup';
AvatarGroup.propTypes = {
  as: PropTypes.elementType,
  classPrefix: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  stack: PropTypes.bool,
  spacing: PropTypes.number,
  size: PropTypes.oneOf(['lg', 'md', 'sm', 'xs'])
};
export default AvatarGroup;
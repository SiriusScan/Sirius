import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
import ButtonGroupContext from './ButtonGroupContext';
var ButtonGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'btn-group' : _props$classPrefix,
      _props$role = props.role,
      role = _props$role === void 0 ? 'group' : _props$role,
      className = props.className,
      children = props.children,
      block = props.block,
      vertical = props.vertical,
      justified = props.justified,
      size = props.size,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "role", "className", "children", "block", "vertical", "justified", "size"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix(size, {
    block: block,
    vertical: vertical,
    justified: justified
  }));
  var contextValue = useMemo(function () {
    return {
      size: size
    };
  }, [size]);
  return /*#__PURE__*/React.createElement(ButtonGroupContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    role: role,
    ref: ref,
    className: classes
  }), children));
});
ButtonGroup.displayName = 'ButtonGroup';
ButtonGroup.propTypes = {
  className: PropTypes.string,
  as: PropTypes.elementType,
  classPrefix: PropTypes.string,
  children: PropTypes.node,
  block: PropTypes.bool,
  vertical: PropTypes.bool,
  justified: PropTypes.bool,
  role: PropTypes.string,
  size: PropTypes.oneOf(['lg', 'md', 'sm', 'xs'])
};
export default ButtonGroup;
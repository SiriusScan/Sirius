import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
var Divider = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'divider' : _props$classPrefix,
      children = props.children,
      vertical = props.vertical,
      rest = _objectWithoutPropertiesLoose(props, ["as", "className", "classPrefix", "children", "vertical"]);

  var _useClassNames = useClassNames(classPrefix),
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix(vertical ? 'vertical' : 'horizontal', {
    'with-text': children
  }));
  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "separator"
  }, rest, {
    ref: ref,
    className: classes,
    "aria-orientation": vertical ? 'vertical' : 'horizontal'
  }), children && /*#__PURE__*/React.createElement("span", {
    className: prefix('inner-text')
  }, children));
});
Divider.displayName = 'Divider';
Divider.propTypes = {
  as: PropTypes.elementType,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  children: PropTypes.node,
  vertical: PropTypes.bool
};
export default Divider;
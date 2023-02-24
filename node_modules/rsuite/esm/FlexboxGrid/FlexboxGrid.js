import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
import FlexboxGridItem from './FlexboxGridItem';
var FlexboxGrid = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'flex-box-grid' : _props$classPrefix,
      _props$align = props.align,
      align = _props$align === void 0 ? 'top' : _props$align,
      _props$justify = props.justify,
      justify = _props$justify === void 0 ? 'start' : _props$justify,
      rest = _objectWithoutPropertiesLoose(props, ["as", "className", "classPrefix", "align", "justify"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix(align, justify));
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }));
});
FlexboxGrid.Item = FlexboxGridItem;
FlexboxGrid.displayName = 'FlexboxGrid';
FlexboxGrid.propTypes = {
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  align: PropTypes.oneOf(['top', 'middle', 'bottom']),
  justify: PropTypes.oneOf(['start', 'end', 'center', 'space-around', 'space-between'])
};
export default FlexboxGrid;
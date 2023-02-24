import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { ReactChildren, useClassNames } from '../utils';
var Row = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'row' : _props$classPrefix,
      className = props.className,
      gutter = props.gutter,
      children = props.children,
      style = props.style,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "gutter", "children", "style"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix());
  var cols = children;
  var rowStyles = style;

  if (typeof gutter !== 'undefined') {
    var padding = gutter / 2;
    cols = ReactChildren.mapCloneElement(children, function (child) {
      return _extends({}, child.props, {
        style: _extends({}, child.props.style, {
          paddingLeft: padding,
          paddingRight: padding
        })
      });
    });
    rowStyles = _extends({}, style, {
      marginLeft: -padding,
      marginRight: -padding
    });
  }

  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "row"
  }, rest, {
    ref: ref,
    className: classes,
    style: rowStyles
  }), cols);
});
Row.displayName = 'Row';
Row.propTypes = {
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  gutter: PropTypes.number,
  style: PropTypes.any,
  as: PropTypes.elementType,
  children: PropTypes.node
};
export default Row;
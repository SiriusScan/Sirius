import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
var Grid = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'grid-container' : _props$classPrefix,
      className = props.className,
      fluid = props.fluid,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "fluid"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge;

  var classes = merge(className, fluid ? prefix({
    fluid: fluid
  }) : withClassPrefix());
  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "grid"
  }, rest, {
    ref: ref,
    className: classes
  }));
});
Grid.displayName = 'Grid';
Grid.propTypes = {
  className: PropTypes.string,
  fluid: PropTypes.bool,
  classPrefix: PropTypes.string,
  as: PropTypes.elementType
};
export default Grid;
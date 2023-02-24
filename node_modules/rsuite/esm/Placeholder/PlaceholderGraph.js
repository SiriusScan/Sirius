import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
var PlaceholderGraph = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      width = props.width,
      _props$height = props.height,
      height = _props$height === void 0 ? 200 : _props$height,
      style = props.style,
      active = props.active,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'placeholder' : _props$classPrefix,
      rest = _objectWithoutPropertiesLoose(props, ["as", "className", "width", "height", "style", "active", "classPrefix"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix('graph', {
    active: active
  }));

  var styles = _extends({
    width: width || '100%',
    height: height
  }, style);

  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes,
    style: styles
  }));
});
PlaceholderGraph.displayName = 'PlaceholderGraph';
PlaceholderGraph.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  classPrefix: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  active: PropTypes.bool
};
export default PlaceholderGraph;
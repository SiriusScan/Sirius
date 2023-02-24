import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
var Loader = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'loader' : _props$classPrefix,
      className = props.className,
      inverse = props.inverse,
      backdrop = props.backdrop,
      _props$speed = props.speed,
      speed = _props$speed === void 0 ? 'normal' : _props$speed,
      center = props.center,
      vertical = props.vertical,
      content = props.content,
      size = props.size,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "inverse", "backdrop", "speed", "center", "vertical", "content", "size"]);

  var hasContent = !!content;

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var classes = merge(className, prefix('wrapper', "speed-" + speed, size, {
    'backdrop-wrapper': backdrop,
    'has-content': hasContent,
    vertical: vertical,
    inverse: inverse,
    center: center
  }));
  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "progressbar"
  }, rest, {
    ref: ref,
    className: classes
  }), backdrop && /*#__PURE__*/React.createElement("div", {
    className: prefix('backdrop')
  }), /*#__PURE__*/React.createElement("div", {
    className: withClassPrefix()
  }, /*#__PURE__*/React.createElement("span", {
    className: prefix('spin')
  }), hasContent && /*#__PURE__*/React.createElement("span", {
    className: prefix('content')
  }, content)));
});
Loader.displayName = 'Loader';
Loader.propTypes = {
  as: PropTypes.elementType,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  center: PropTypes.bool,
  backdrop: PropTypes.bool,
  inverse: PropTypes.bool,
  vertical: PropTypes.bool,
  content: PropTypes.node,
  size: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']),
  speed: PropTypes.oneOf(['normal', 'fast', 'slow'])
};
export default Loader;
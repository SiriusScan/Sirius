import _extends from "@babel/runtime/helpers/esm/extends";
import _taggedTemplateLiteralLoose from "@babel/runtime/helpers/esm/taggedTemplateLiteralLoose";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";

var _templateObject;

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
import { AvatarGroupContext } from '../AvatarGroup/AvatarGroup';
var Avatar = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'avatar' : _props$classPrefix,
      _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      sizeProp = props.size,
      className = props.className,
      children = props.children,
      src = props.src,
      srcSet = props.srcSet,
      sizes = props.sizes,
      imgProps = props.imgProps,
      circle = props.circle,
      alt = props.alt,
      rest = _objectWithoutPropertiesLoose(props, ["classPrefix", "as", "size", "className", "children", "src", "srcSet", "sizes", "imgProps", "circle", "alt"]);

  var _useContext = useContext(AvatarGroupContext),
      size = _useContext.size;

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix(sizeProp || size, {
    circle: circle
  }));
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), src || srcSet ? /*#__PURE__*/React.createElement("img", _extends({}, imgProps, {
    className: prefix(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["image"]))),
    src: src,
    sizes: sizes,
    srcSet: srcSet,
    alt: alt
  })) : children);
});
Avatar.displayName = 'Avatar';
Avatar.propTypes = {
  as: PropTypes.elementType,
  classPrefix: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']),
  src: PropTypes.string,
  sizes: PropTypes.string,
  srcSet: PropTypes.string,
  imgProps: PropTypes.object,
  circle: PropTypes.bool,
  alt: PropTypes.string
};
export default Avatar;
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _taggedTemplateLiteralLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteralLoose"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _AvatarGroup = require("../AvatarGroup/AvatarGroup");

var _templateObject;

var Avatar = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
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
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["classPrefix", "as", "size", "className", "children", "src", "srcSet", "sizes", "imgProps", "circle", "alt"]);

  var _useContext = (0, _react.useContext)(_AvatarGroup.AvatarGroupContext),
      size = _useContext.size;

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix(sizeProp || size, {
    circle: circle
  }));
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), src || srcSet ? /*#__PURE__*/_react.default.createElement("img", (0, _extends2.default)({}, imgProps, {
    className: prefix(_templateObject || (_templateObject = (0, _taggedTemplateLiteralLoose2.default)(["image"]))),
    src: src,
    sizes: sizes,
    srcSet: srcSet,
    alt: alt
  })) : children);
});

Avatar.displayName = 'Avatar';
Avatar.propTypes = {
  as: _propTypes.default.elementType,
  classPrefix: _propTypes.default.string,
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  size: _propTypes.default.oneOf(['lg', 'md', 'sm', 'xs']),
  src: _propTypes.default.string,
  sizes: _propTypes.default.string,
  srcSet: _propTypes.default.string,
  imgProps: _propTypes.default.object,
  circle: _propTypes.default.bool,
  alt: _propTypes.default.string
};
var _default = Avatar;
exports.default = _default;
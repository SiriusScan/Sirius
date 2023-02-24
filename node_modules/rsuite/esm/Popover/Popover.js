import _taggedTemplateLiteralLoose from "@babel/runtime/helpers/esm/taggedTemplateLiteralLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";

var _templateObject, _templateObject2, _templateObject3;

import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
var Popover = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'popover' : _props$classPrefix,
      title = props.title,
      children = props.children,
      style = props.style,
      visible = props.visible,
      className = props.className,
      full = props.full,
      _props$arrow = props.arrow,
      arrow = _props$arrow === void 0 ? true : _props$arrow,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "title", "children", "style", "visible", "className", "full", "arrow"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix({
    full: full
  }));

  var styles = _extends({
    display: 'block',
    opacity: visible ? 1 : undefined
  }, style);

  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "dialog"
  }, rest, {
    ref: ref,
    className: classes,
    style: styles
  }), arrow && /*#__PURE__*/React.createElement("div", {
    className: prefix(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["arrow"]))),
    "aria-hidden": true
  }), title && /*#__PURE__*/React.createElement("h3", {
    className: prefix(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["title"])))
  }, title), /*#__PURE__*/React.createElement("div", {
    className: prefix(_templateObject3 || (_templateObject3 = _taggedTemplateLiteralLoose(["content"])))
  }, children));
});
Popover.displayName = 'Popover';
Popover.propTypes = {
  as: PropTypes.elementType,
  classPrefix: PropTypes.string,
  children: PropTypes.node,
  title: PropTypes.node,
  style: PropTypes.object,
  visible: PropTypes.bool,
  className: PropTypes.string,
  full: PropTypes.bool,
  arrow: PropTypes.bool
};
export default Popover;
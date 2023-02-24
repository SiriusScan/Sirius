import _extends from "@babel/runtime/helpers/esm/extends";
import _taggedTemplateLiteralLoose from "@babel/runtime/helpers/esm/taggedTemplateLiteralLoose";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";

var _templateObject, _templateObject2;

import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
import ArrowDown from '@rsuite/icons/legacy/ArrowDown';
var DropdownMenuGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'dropdown-menu-group' : _props$classPrefix,
      children = props.children,
      className = props.className,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "children", "className"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix());
  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "group"
  }, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/React.createElement("div", {
    className: prefix(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["title"]))),
    tabIndex: -1
  }, /*#__PURE__*/React.createElement("span", null, children), /*#__PURE__*/React.createElement(ArrowDown, {
    "aria-hidden": true,
    className: prefix(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["caret"])))
  })));
});
DropdownMenuGroup.displayName = 'DropdownMenuGroup';
DropdownMenuGroup.propTypes = {
  classPrefix: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node
};
export default DropdownMenuGroup;
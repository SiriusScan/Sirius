import _extends from "@babel/runtime/helpers/esm/extends";
import _taggedTemplateLiteralLoose from "@babel/runtime/helpers/esm/taggedTemplateLiteralLoose";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";

var _templateObject, _templateObject2;

import React from 'react';
import PropTypes from 'prop-types';
import kebabCase from 'lodash/kebabCase';
import { placementPolyfill, useClassNames } from '../utils';
var FormErrorMessage = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _prefix;

  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'form-error-message' : _props$classPrefix,
      className = props.className,
      show = props.show,
      children = props.children,
      placement = props.placement,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "show", "children", "placement"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge;

  var classes = withClassPrefix('show');
  var wrapperClasses = merge(className, prefix('wrapper', (_prefix = {}, _prefix["placement-" + kebabCase(placementPolyfill(placement))] = placement, _prefix)));

  if (!show) {
    return null;
  }

  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: wrapperClasses
  }), /*#__PURE__*/React.createElement("span", {
    className: classes
  }, /*#__PURE__*/React.createElement("span", {
    className: prefix(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["arrow"])))
  }), /*#__PURE__*/React.createElement("span", {
    className: prefix(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["inner"])))
  }, children)));
});
FormErrorMessage.displayName = 'FormErrorMessage';
FormErrorMessage.propTypes = {
  show: PropTypes.bool,
  classPrefix: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  placement: PropTypes.oneOf(['bottomStart', 'bottomEnd', 'topStart', 'topEnd', 'leftStart', 'rightStart', 'leftEnd', 'rightEnd'])
};
export default FormErrorMessage;
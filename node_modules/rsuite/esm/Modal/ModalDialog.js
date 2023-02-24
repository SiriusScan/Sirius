import _taggedTemplateLiteralLoose from "@babel/runtime/helpers/esm/taggedTemplateLiteralLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";

var _templateObject;

import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames, SIZE } from '../utils';
export var modalDialogPropTypes = {
  size: PropTypes.oneOf(SIZE),
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  dialogClassName: PropTypes.string,
  style: PropTypes.object,
  dialogStyle: PropTypes.object,
  children: PropTypes.node
};
var ModalDialog = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      style = props.style,
      children = props.children,
      dialogClassName = props.dialogClassName,
      dialogStyle = props.dialogStyle,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'modal' : _props$classPrefix,
      className = props.className,
      size = props.size,
      rest = _objectWithoutPropertiesLoose(props, ["as", "style", "children", "dialogClassName", "dialogStyle", "classPrefix", "className", "size"]);

  var modalStyle = _extends({
    display: 'block'
  }, style);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix(size));
  var dialogClasses = merge(dialogClassName, prefix('dialog'));
  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "dialog",
    "aria-modal": true
  }, rest, {
    ref: ref,
    className: classes,
    style: modalStyle
  }), /*#__PURE__*/React.createElement("div", {
    role: "document",
    className: dialogClasses,
    style: dialogStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: prefix(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["content"])))
  }, children)));
});
ModalDialog.displayName = 'ModalDialog';
ModalDialog.propTypes = modalDialogPropTypes;
export default ModalDialog;
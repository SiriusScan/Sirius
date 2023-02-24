import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { createChainedFunction, useClassNames } from '../utils';
import { ModalContext } from './ModalContext';
import CloseButton from '../CloseButton';
import Close from '@rsuite/icons/Close';
import IconButton from '../IconButton';
var ModalHeader = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'modal-header' : _props$classPrefix,
      className = props.className,
      _props$closeButton = props.closeButton,
      closeButton = _props$closeButton === void 0 ? true : _props$closeButton,
      children = props.children,
      onClose = props.onClose,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "closeButton", "children", "onClose"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix());
  var context = useContext(ModalContext);
  var buttonElement = !(context !== null && context !== void 0 && context.isDrawer) ? /*#__PURE__*/React.createElement(CloseButton, {
    className: prefix('close'),
    onClick: createChainedFunction(onClose, context === null || context === void 0 ? void 0 : context.onModalClose)
  }) : /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Close, null),
    appearance: "subtle",
    size: "sm",
    className: prefix('close'),
    onClick: createChainedFunction(onClose, context === null || context === void 0 ? void 0 : context.onModalClose)
  });
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), closeButton && buttonElement, children);
});
ModalHeader.displayName = 'ModalHeader';
ModalHeader.propTypes = {
  as: PropTypes.elementType,
  classPrefix: PropTypes.string,
  className: PropTypes.string,
  closeButton: PropTypes.bool,
  children: PropTypes.node,
  onHide: PropTypes.func
};
export default ModalHeader;
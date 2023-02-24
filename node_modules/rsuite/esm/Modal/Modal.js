import _extends from "@babel/runtime/helpers/esm/extends";
import _taggedTemplateLiteralLoose from "@babel/runtime/helpers/esm/taggedTemplateLiteralLoose";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";

var _templateObject, _templateObject2;

import React, { useRef, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import on from 'dom-lib/on';
import getAnimationEnd from 'dom-lib/getAnimationEnd';
import BaseModal, { modalPropTypes } from '../Overlay/Modal';
import Bounce from '../Animation/Bounce';
import { useClassNames, mergeRefs, useWillUnmount } from '../utils';
import ModalDialog, { modalDialogPropTypes } from './ModalDialog';
import { ModalContext } from './ModalContext';
import ModalBody from './ModalBody';
import ModalHeader from './ModalHeader';
import ModalTitle from './ModalTitle';
import ModalFooter from './ModalFooter';
import { useBodyStyles } from './utils';
import useUniqueId from '../utils/useUniqueId';
import deprecatePropType from '../utils/deprecatePropType';
var modalSizes = ['xs', 'sm', 'md', 'lg', 'full'];
var Modal = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var className = props.className,
      children = props.children,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'modal' : _props$classPrefix,
      dialogClassName = props.dialogClassName,
      backdropClassName = props.backdropClassName,
      _props$backdrop = props.backdrop,
      backdrop = _props$backdrop === void 0 ? true : _props$backdrop,
      dialogStyle = props.dialogStyle,
      _props$animation = props.animation,
      animation = _props$animation === void 0 ? Bounce : _props$animation,
      open = props.open,
      _props$size = props.size,
      size = _props$size === void 0 ? 'sm' : _props$size,
      full = props.full,
      _props$dialogAs = props.dialogAs,
      Dialog = _props$dialogAs === void 0 ? ModalDialog : _props$dialogAs,
      animationProps = props.animationProps,
      _props$animationTimeo = props.animationTimeout,
      animationTimeout = _props$animationTimeo === void 0 ? 300 : _props$animationTimeo,
      _props$overflow = props.overflow,
      overflow = _props$overflow === void 0 ? true : _props$overflow,
      _props$drawer = props.drawer,
      drawer = _props$drawer === void 0 ? false : _props$drawer,
      onClose = props.onClose,
      onEntered = props.onEntered,
      onEntering = props.onEntering,
      onExited = props.onExited,
      _props$role = props.role,
      role = _props$role === void 0 ? 'dialog' : _props$role,
      idProp = props.id,
      ariaLabelledby = props['aria-labelledby'],
      ariaDescribedby = props['aria-describedby'],
      rest = _objectWithoutPropertiesLoose(props, ["className", "children", "classPrefix", "dialogClassName", "backdropClassName", "backdrop", "dialogStyle", "animation", "open", "size", "full", "dialogAs", "animationProps", "animationTimeout", "overflow", "drawer", "onClose", "onEntered", "onEntering", "onExited", "role", "id", "aria-labelledby", "aria-describedby"]);

  var inClass = {
    in: open && !animation
  };

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var _useState = useState(false),
      shake = _useState[0],
      setShake = _useState[1];

  var classes = merge(className, prefix(size, {
    full: full
  }));
  var dialogRef = useRef(null);
  var transitionEndListener = useRef(); // The style of the Modal body will be updated with the size of the window or container.

  var _useBodyStyles = useBodyStyles(dialogRef, {
    overflow: overflow,
    drawer: drawer,
    prefix: prefix
  }),
      bodyStyles = _useBodyStyles[0],
      onChangeBodyStyles = _useBodyStyles[1],
      onDestroyEvents = _useBodyStyles[2];

  var dialogId = useUniqueId('dialog-', idProp);
  var modalContextValue = useMemo(function () {
    return {
      dialogId: dialogId,
      onModalClose: onClose,
      getBodyStyles: function getBodyStyles() {
        return bodyStyles;
      },
      isDrawer: drawer
    };
  }, [dialogId, onClose, bodyStyles, drawer]);
  var handleExited = useCallback(function (node) {
    var _transitionEndListene;

    onExited === null || onExited === void 0 ? void 0 : onExited(node);
    onDestroyEvents();
    (_transitionEndListene = transitionEndListener.current) === null || _transitionEndListene === void 0 ? void 0 : _transitionEndListene.off();
    transitionEndListener.current = null;
  }, [onDestroyEvents, onExited]);
  var handleEntered = useCallback(function (node) {
    onEntered === null || onEntered === void 0 ? void 0 : onEntered(node);
    onChangeBodyStyles();
  }, [onChangeBodyStyles, onEntered]);
  var handleEntering = useCallback(function (node) {
    onEntering === null || onEntering === void 0 ? void 0 : onEntering(node);
    onChangeBodyStyles(true);
  }, [onChangeBodyStyles, onEntering]);
  var handleBackdropClick = useCallback(function (e) {
    if (e.target !== e.currentTarget) {
      return;
    } // When the value of `backdrop` is `static`, a jitter animation will be added to the dialog when clicked.


    if (backdrop === 'static') {
      setShake(true);

      if (!transitionEndListener.current && dialogRef.current) {
        //fix: https://github.com/rsuite/rsuite/blob/a93d13c14fb20cc58204babe3331d3c3da3fe1fd/src/Modal/styles/index.less#L59
        transitionEndListener.current = on(dialogRef.current, getAnimationEnd(), function () {
          setShake(false);
        });
      }

      return;
    }

    onClose === null || onClose === void 0 ? void 0 : onClose(e);
  }, [backdrop, onClose]);
  var handleClick = useCallback(function (e) {
    if (dialogRef.current && e.target !== dialogRef.current) {
      handleBackdropClick(e);
    }
  }, [handleBackdropClick]);
  useWillUnmount(function () {
    var _transitionEndListene2;

    (_transitionEndListene2 = transitionEndListener.current) === null || _transitionEndListene2 === void 0 ? void 0 : _transitionEndListene2.off();
  });
  return /*#__PURE__*/React.createElement(ModalContext.Provider, {
    value: modalContextValue
  }, /*#__PURE__*/React.createElement(BaseModal, _extends({}, rest, {
    ref: ref,
    backdrop: backdrop,
    open: open,
    onClose: onClose,
    className: prefix(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["wrapper"]))),
    onEntered: handleEntered,
    onEntering: handleEntering,
    onExited: handleExited,
    backdropClassName: merge(prefix(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["backdrop"]))), backdropClassName, inClass),
    containerClassName: prefix({
      open: open,
      'has-backdrop': backdrop
    }),
    transition: animation ? animation : undefined,
    animationProps: animationProps,
    dialogTransitionTimeout: animationTimeout,
    backdropTransitionTimeout: 150,
    onClick: backdrop ? handleClick : undefined
  }), function (transitionProps, transitionRef) {
    var transitionClassName = transitionProps.className,
        transitionRest = _objectWithoutPropertiesLoose(transitionProps, ["className"]);

    return /*#__PURE__*/React.createElement(Dialog, _extends({
      role: role,
      id: dialogId,
      "aria-labelledby": ariaLabelledby !== null && ariaLabelledby !== void 0 ? ariaLabelledby : dialogId + "-title",
      "aria-describedby": ariaDescribedby
    }, transitionRest, pick(rest, Object.keys(modalDialogPropTypes)), {
      ref: mergeRefs(dialogRef, transitionRef),
      classPrefix: classPrefix,
      className: merge(classes, transitionClassName, prefix({
        shake: shake
      })),
      dialogClassName: dialogClassName,
      dialogStyle: dialogStyle
    }), children);
  }));
});
Modal.Body = ModalBody;
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Footer = ModalFooter;
Modal.Dialog = ModalDialog;
Modal.displayName = 'Modal';
Modal.propTypes = _extends({}, modalPropTypes, {
  animation: PropTypes.any,
  animationTimeout: PropTypes.number,
  classPrefix: PropTypes.string,
  dialogClassName: PropTypes.string,
  size: PropTypes.oneOf(modalSizes),
  dialogStyle: PropTypes.object,
  dialogAs: PropTypes.elementType,
  full: deprecatePropType(PropTypes.bool, 'Use size="full" instead.'),
  overflow: PropTypes.bool,
  drawer: PropTypes.bool
});
export default Modal;
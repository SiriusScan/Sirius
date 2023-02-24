import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
import React from 'react';
import PropTypes from 'prop-types';
import Slide from '../Animation/Slide';
import Modal from '../Modal';
import { useClassNames } from '../utils';
import deprecateComponent from '../utils/deprecateComponent';
var DrawerBody = /*#__PURE__*/React.forwardRef(function (props, ref) {
  return /*#__PURE__*/React.createElement(Modal.Body, _extends({
    classPrefix: "drawer-body"
  }, props, {
    ref: ref
  }));
});
var DrawerHeader = /*#__PURE__*/React.forwardRef(function (props, ref) {
  return /*#__PURE__*/React.createElement(Modal.Header, _extends({
    classPrefix: "drawer-header"
  }, props, {
    ref: ref
  }));
});
var DrawerActions = /*#__PURE__*/React.forwardRef(function (props, ref) {
  return /*#__PURE__*/React.createElement(Modal.Footer, _extends({
    classPrefix: "drawer-actions"
  }, props, {
    ref: ref
  }));
});
var DrawerFooter = /*#__PURE__*/React.forwardRef(function (props, ref) {
  return /*#__PURE__*/React.createElement(Modal.Footer, _extends({
    classPrefix: "drawer-footer"
  }, props, {
    ref: ref
  }));
});
var DrawerTitle = /*#__PURE__*/React.forwardRef(function (props, ref) {
  return /*#__PURE__*/React.createElement(Modal.Title, _extends({
    classPrefix: "drawer-title"
  }, props, {
    ref: ref
  }));
});
var Drawer = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var className = props.className,
      _props$placement = props.placement,
      placement = _props$placement === void 0 ? 'right' : _props$placement,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'drawer' : _props$classPrefix,
      _props$animation = props.animation,
      animation = _props$animation === void 0 ? Slide : _props$animation,
      rest = _objectWithoutPropertiesLoose(props, ["className", "placement", "classPrefix", "animation"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var classes = merge(className, prefix(placement));
  var animationProps = {
    placement: placement
  };
  return /*#__PURE__*/React.createElement(Modal, _extends({}, rest, {
    ref: ref,
    drawer: true,
    classPrefix: classPrefix,
    className: classes,
    animation: animation,
    animationProps: animationProps
  }));
});
DrawerBody.displayName = 'DrawerBody';
DrawerHeader.displayName = 'DrawerHeader';
DrawerActions.displayName = 'DrawerActions';
DrawerFooter.displayName = 'DrawerFooter';
DrawerTitle.displayName = 'DrawerTitle';
Drawer.Body = DrawerBody;
Drawer.Header = DrawerHeader;
Drawer.Actions = DrawerActions;
Drawer.Footer = deprecateComponent(DrawerFooter, '<Drawer.Footer> has been deprecated, use <Drawer.Actions> instead.');
Drawer.Title = DrawerTitle;
Drawer.displayName = 'Drawer';
Drawer.propTypes = {
  classPrefix: PropTypes.string,
  placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  children: PropTypes.node,
  className: PropTypes.string
};
export default Drawer;
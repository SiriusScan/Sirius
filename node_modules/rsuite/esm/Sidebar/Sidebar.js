import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
import { ContainerContext } from '../Container/Container';
var Sidebar = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'aside' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'sidebar' : _props$classPrefix,
      className = props.className,
      collapsible = props.collapsible,
      _props$width = props.width,
      width = _props$width === void 0 ? 260 : _props$width,
      style = props.style,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "collapsible", "width", "style"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    collapse: collapsible
  }));

  var _useContext = useContext(ContainerContext),
      setHasSidebar = _useContext.setHasSidebar;

  useEffect(function () {
    /** Notify the Container that the Sidebar is in the child node of the Container. */
    setHasSidebar === null || setHasSidebar === void 0 ? void 0 : setHasSidebar(true);
  }, [setHasSidebar]);

  var styles = _extends({
    flex: "0 0 " + width + "px",
    width: width
  }, style);

  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes,
    style: styles
  }));
});
Sidebar.displayName = 'Sidebar';
Sidebar.propTypes = {
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  collapsible: PropTypes.bool,
  style: PropTypes.object
};
export default Sidebar;
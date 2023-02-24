import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
export var ContainerContext = /*#__PURE__*/React.createContext({});
var Container = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'section' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'container' : _props$classPrefix,
      className = props.className,
      children = props.children,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "children"]);

  var _useState = useState(false),
      hasSidebar = _useState[0],
      setHasSidebar = _useState[1];

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    'has-sidebar': hasSidebar
  }));
  var contextValue = useMemo(function () {
    return {
      setHasSidebar: setHasSidebar
    };
  }, [setHasSidebar]);
  return /*#__PURE__*/React.createElement(ContainerContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), children));
});
Container.displayName = 'Container';
Container.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  classPrefix: PropTypes.string
};
export default Container;
import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import kebabCase from 'lodash/kebabCase';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';

/**
 * Create a component with `classPrefix` and `as` attributes.
 */
function createComponent(_ref) {
  var name = _ref.name,
      componentAs = _ref.componentAs,
      componentClassPrefix = _ref.componentClassPrefix,
      defaultProps = _objectWithoutPropertiesLoose(_ref, ["name", "componentAs", "componentClassPrefix"]);

  var Component = /*#__PURE__*/React.forwardRef(function (props, ref) {
    var _props$as = props.as,
        Component = _props$as === void 0 ? componentAs || 'div' : _props$as,
        _props$classPrefix = props.classPrefix,
        classPrefix = _props$classPrefix === void 0 ? componentClassPrefix || kebabCase(name) : _props$classPrefix,
        className = props.className,
        role = props.role,
        rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "role"]);

    var _useClassNames = useClassNames(classPrefix),
        withClassPrefix = _useClassNames.withClassPrefix,
        merge = _useClassNames.merge;

    var classes = merge(className, withClassPrefix());
    return /*#__PURE__*/React.createElement(Component, _extends({}, defaultProps, rest, {
      role: role,
      ref: ref,
      className: classes
    }));
  });
  Component.displayName = name;
  Component.propTypes = {
    as: PropTypes.elementType,
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    children: PropTypes.node
  };
  return Component;
}

export default createComponent;
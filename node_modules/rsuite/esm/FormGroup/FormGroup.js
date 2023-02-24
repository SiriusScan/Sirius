import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
export var FormGroupContext = /*#__PURE__*/React.createContext({});
var FormGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'form-group' : _props$classPrefix,
      controlId = props.controlId,
      className = props.className,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "controlId", "className"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix());
  var contextValue = useMemo(function () {
    return {
      controlId: controlId
    };
  }, [controlId]);
  return /*#__PURE__*/React.createElement(FormGroupContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes,
    role: "group"
  })));
});
FormGroup.displayName = 'FormGroup';
FormGroup.propTypes = {
  controlId: PropTypes.string,
  className: PropTypes.string,
  classPrefix: PropTypes.string
};
export default FormGroup;
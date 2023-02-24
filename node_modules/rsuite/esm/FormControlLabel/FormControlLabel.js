import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
import { FormGroupContext } from '../FormGroup/FormGroup';
var FormControlLabel = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'label' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'form-control-label' : _props$classPrefix,
      htmlFor = props.htmlFor,
      className = props.className,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "htmlFor", "className"]);

  var _useContext = useContext(FormGroupContext),
      controlId = _useContext.controlId;

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix());
  return /*#__PURE__*/React.createElement(Component, _extends({
    id: controlId ? controlId + "-control-label" : null,
    htmlFor: htmlFor || controlId
  }, rest, {
    ref: ref,
    className: classes
  }));
});
FormControlLabel.displayName = 'FormControlLabel';
FormControlLabel.propTypes = {
  className: PropTypes.string,
  htmlFor: PropTypes.string,
  classPrefix: PropTypes.string
};
export default FormControlLabel;
import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Tooltip from '../Tooltip';
import Whisper from '../Whisper';
import { useClassNames } from '../utils';
import { FormGroupContext } from '../FormGroup/FormGroup';
import HelpO from '@rsuite/icons/legacy/HelpO';
var FormHelpText = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'span' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'form-help-text' : _props$classPrefix,
      className = props.className,
      tooltip = props.tooltip,
      children = props.children,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "tooltip", "children"]);

  var _useContext = useContext(FormGroupContext),
      controlId = _useContext.controlId;

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    tooltip: tooltip
  }));

  if (tooltip) {
    return /*#__PURE__*/React.createElement(Whisper, {
      ref: ref,
      placement: "topEnd",
      speaker: /*#__PURE__*/React.createElement(Tooltip, rest, children)
    }, /*#__PURE__*/React.createElement(Component, {
      className: classes
    }, /*#__PURE__*/React.createElement(HelpO, null)));
  }

  return /*#__PURE__*/React.createElement(Component, _extends({
    id: controlId ? controlId + "-help-text" : null
  }, rest, {
    ref: ref,
    className: classes
  }), children);
});
FormHelpText.displayName = 'FormHelpText';
FormHelpText.propTypes = {
  className: PropTypes.string,
  tooltip: PropTypes.bool,
  children: PropTypes.node,
  classPrefix: PropTypes.string
};
export default FormHelpText;
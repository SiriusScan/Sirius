"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Tooltip = _interopRequireDefault(require("../Tooltip"));

var _Whisper = _interopRequireDefault(require("../Whisper"));

var _utils = require("../utils");

var _FormGroup = require("../FormGroup/FormGroup");

var _HelpO = _interopRequireDefault(require("@rsuite/icons/legacy/HelpO"));

var FormHelpText = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'span' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'form-help-text' : _props$classPrefix,
      className = props.className,
      tooltip = props.tooltip,
      children = props.children,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "tooltip", "children"]);

  var _useContext = (0, _react.useContext)(_FormGroup.FormGroupContext),
      controlId = _useContext.controlId;

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    tooltip: tooltip
  }));

  if (tooltip) {
    return /*#__PURE__*/_react.default.createElement(_Whisper.default, {
      ref: ref,
      placement: "topEnd",
      speaker: /*#__PURE__*/_react.default.createElement(_Tooltip.default, rest, children)
    }, /*#__PURE__*/_react.default.createElement(Component, {
      className: classes
    }, /*#__PURE__*/_react.default.createElement(_HelpO.default, null)));
  }

  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    id: controlId ? controlId + "-help-text" : null
  }, rest, {
    ref: ref,
    className: classes
  }), children);
});

FormHelpText.displayName = 'FormHelpText';
FormHelpText.propTypes = {
  className: _propTypes.default.string,
  tooltip: _propTypes.default.bool,
  children: _propTypes.default.node,
  classPrefix: _propTypes.default.string
};
var _default = FormHelpText;
exports.default = _default;
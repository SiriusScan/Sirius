"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _FormGroup = require("../FormGroup/FormGroup");

var FormControlLabel = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'label' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'form-control-label' : _props$classPrefix,
      htmlFor = props.htmlFor,
      className = props.className,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "htmlFor", "className"]);

  var _useContext = (0, _react.useContext)(_FormGroup.FormGroupContext),
      controlId = _useContext.controlId;

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix());
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    id: controlId ? controlId + "-control-label" : null,
    htmlFor: htmlFor || controlId
  }, rest, {
    ref: ref,
    className: classes
  }));
});

FormControlLabel.displayName = 'FormControlLabel';
FormControlLabel.propTypes = {
  className: _propTypes.default.string,
  htmlFor: _propTypes.default.string,
  classPrefix: _propTypes.default.string
};
var _default = FormControlLabel;
exports.default = _default;
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _taggedTemplateLiteralLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteralLoose"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _kebabCase = _interopRequireDefault(require("lodash/kebabCase"));

var _utils = require("../utils");

var _templateObject, _templateObject2;

var FormErrorMessage = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _prefix;

  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'form-error-message' : _props$classPrefix,
      className = props.className,
      show = props.show,
      children = props.children,
      placement = props.placement,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "show", "children", "placement"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge;

  var classes = withClassPrefix('show');
  var wrapperClasses = merge(className, prefix('wrapper', (_prefix = {}, _prefix["placement-" + (0, _kebabCase.default)((0, _utils.placementPolyfill)(placement))] = placement, _prefix)));

  if (!show) {
    return null;
  }

  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: wrapperClasses
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: classes
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: prefix(_templateObject || (_templateObject = (0, _taggedTemplateLiteralLoose2.default)(["arrow"])))
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix(_templateObject2 || (_templateObject2 = (0, _taggedTemplateLiteralLoose2.default)(["inner"])))
  }, children)));
});

FormErrorMessage.displayName = 'FormErrorMessage';
FormErrorMessage.propTypes = {
  show: _propTypes.default.bool,
  classPrefix: _propTypes.default.string,
  children: _propTypes.default.node,
  className: _propTypes.default.string,
  placement: _propTypes.default.oneOf(['bottomStart', 'bottomEnd', 'topStart', 'topEnd', 'leftStart', 'rightStart', 'leftEnd', 'rightEnd'])
};
var _default = FormErrorMessage;
exports.default = _default;
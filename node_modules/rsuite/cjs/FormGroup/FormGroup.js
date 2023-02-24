"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.FormGroupContext = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var FormGroupContext = /*#__PURE__*/_react.default.createContext({});

exports.FormGroupContext = FormGroupContext;

var FormGroup = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'form-group' : _props$classPrefix,
      controlId = props.controlId,
      className = props.className,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "controlId", "className"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix());
  var contextValue = (0, _react.useMemo)(function () {
    return {
      controlId: controlId
    };
  }, [controlId]);
  return /*#__PURE__*/_react.default.createElement(FormGroupContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes,
    role: "group"
  })));
});

FormGroup.displayName = 'FormGroup';
FormGroup.propTypes = {
  controlId: _propTypes.default.string,
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string
};
var _default = FormGroup;
exports.default = _default;
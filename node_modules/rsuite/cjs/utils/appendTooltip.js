"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = appendTooltip;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _Tooltip = _interopRequireDefault(require("../Tooltip"));

var _Whisper = _interopRequireDefault(require("../Whisper"));

function appendTooltip(_ref) {
  var message = _ref.message,
      ref = _ref.ref,
      rest = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["message", "ref"]);
  return /*#__PURE__*/_react.default.createElement(_Whisper.default, (0, _extends2.default)({
    ref: ref,
    speaker: /*#__PURE__*/_react.default.createElement(_Tooltip.default, null, message)
  }, rest));
}
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _TextMask = _interopRequireDefault(require("./TextMask"));

var _Input = _interopRequireDefault(require("../Input"));

var MaskedInput = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      inputAs = _props$as === void 0 ? _TextMask.default : _props$as;
  return /*#__PURE__*/_react.default.createElement(_Input.default, (0, _extends2.default)({}, props, {
    as: inputAs,
    ref: ref
  }));
});

var _default = MaskedInput;
exports.default = _default;
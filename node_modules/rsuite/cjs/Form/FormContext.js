"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.FormPlaintextContext = exports.FormValueContext = exports.FormContext = void 0;

var _react = _interopRequireDefault(require("react"));

var FormContext = /*#__PURE__*/_react.default.createContext({});

exports.FormContext = FormContext;

var FormValueContext = /*#__PURE__*/_react.default.createContext({});

exports.FormValueContext = FormValueContext;

var FormPlaintextContext = /*#__PURE__*/_react.default.createContext(false);

exports.FormPlaintextContext = FormPlaintextContext;
var _default = FormContext;
exports.default = _default;
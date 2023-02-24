"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var React = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function CopyO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 14 14",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13 4h-3V1H6c-.395 0-1 .599-1 1H4c0-.966 1.065-2 2-2h5l3 3v7c0 .966-1.065 2-2 2H9l.833-1H12c.395 0 1-.599 1-1V4zm-.414-1L11 1.414V3h1.586z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.586 3l2.707 2.707L10 5 7 2H2c-.935 0-2 1.033-2 2v8c0 .966 1.065 2 2 2h6c.935 0 2-1.033 2-2V8.125H9V12c0 .401-.605 1-1 1H2c-.395 0-1-.599-1-1V4c0-.401.605-1 1-1h4.586zm0 0l2.707 2.707L10 5 7 2H2c-.935 0-2 1.033-2 2v8c0 .966 1.065 2 2 2h6c.935 0 2-1.033 2-2V8.125H9V12c0 .401-.605 1-1 1H2c-.395 0-1-.599-1-1V4c0-.401.605-1 1-1h4.586zM7 5h3v1H6V2h1v3z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CopyO);
var _default = ForwardRef;
exports["default"] = _default;
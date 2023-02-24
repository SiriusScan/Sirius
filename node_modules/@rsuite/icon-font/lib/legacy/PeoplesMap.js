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

function PeoplesMap(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 14 14",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.938 7.875a1.313 1.313 0 100-2.626 1.313 1.313 0 000 2.626zm0 .875a2.188 2.188 0 110-4.376 2.188 2.188 0 010 4.376z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.938 8.75a2.188 2.188 0 00-2.188 2.188v2.188h4.375v-2.188a2.188 2.188 0 00-2.188-2.188zm0-.875a3.063 3.063 0 013.063 3.063v2.188a.875.875 0 01-.875.875H8.751a.875.875 0 01-.875-.875v-2.188a3.063 3.063 0 013.063-3.063zM6.125 9.625V8.75A2.625 2.625 0 003.5 11.375v1.75c0 .483.392.875.875.875h1.75v-.875h-1.75v-1.75c0-.966.784-1.75 1.75-1.75z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11.375 2.625H10.5V1.75a.875.875 0 00-.875-.875H1.75a.875.875 0 00-.875.875v8.75c0 .483.392.875.875.875v.875A1.75 1.75 0 010 10.5V1.75C0 .784.784 0 1.75 0h7.875c.966 0 1.75.784 1.75 1.75v.875z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.125 8.75a.875.875 0 100-1.75.875.875 0 000 1.75zm0 .875a1.75 1.75 0 11.001-3.501 1.75 1.75 0 01-.001 3.501z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PeoplesMap);
var _default = ForwardRef;
exports["default"] = _default;
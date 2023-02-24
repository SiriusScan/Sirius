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

function Deaf(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.857 14.857c0 .625.518 1.143 1.143 1.143s1.143-.518 1.143-1.143c0-3.464-2.821-6.286-6.286-6.286s-6.286 2.821-6.286 6.286c0 .625.518 1.143 1.143 1.143s1.143-.518 1.143-1.143c0-2.214 1.804-4 4-4s4 1.786 4 4zM14.911 4.571c-5.679 0-10.286 4.607-10.286 10.286 0 .625.518 1.143 1.143 1.143s1.143-.518 1.143-1.143c0-4.411 3.589-8 8-8s8 3.589 8 8c0 2.107-.946 3.196-2.054 4.464-1.196 1.375-2.571 2.946-2.571 5.821a4.58 4.58 0 01-4.571 4.571c-.625 0-1.143.518-1.143 1.143s.518 1.143 1.143 1.143a6.858 6.858 0 006.857-6.857c0-2.018.893-3.036 2.018-4.321 1.214-1.411 2.607-3 2.607-5.964 0-5.679-4.607-10.286-10.286-10.286zm-4.357 12.84l4.036 4.036L4.251 31.786a.733.733 0 01-1.036 0l-3-3a.733.733 0 010-1.036zM28.786.214l3 3a.755.755 0 010 1.054l-4.161 4.161-.464.446-1.268 1.268a12.053 12.053 0 00-3.482-4.607L27.732.215a.755.755 0 011.054 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Deaf);
var _default = ForwardRef;
exports["default"] = _default;
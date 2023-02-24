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

function Cc(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M14.018 18h3.696c-.339 3.768-2.5 6.054-5.589 6.054-3.857 0-6.196-2.964-6.196-7.714 0-4.714 2.571-7.661 5.821-7.661 3.571 0 5.571 2.214 5.875 5.964H14c-.125-1.518-.875-2.393-2.089-2.393-1.339 0-2.143 1.429-2.143 4.25 0 2.054.357 3.982 2.304 3.982 1.232 0 1.804-1.071 1.946-2.482zm12.714 0h3.679c-.339 3.768-2.482 6.054-5.571 6.054-3.857 0-6.196-2.964-6.196-7.714 0-4.714 2.571-7.661 5.821-7.661 3.571 0 5.571 2.214 5.875 5.964h-3.643c-.107-1.518-.875-2.393-2.071-2.393-1.339 0-2.143 1.429-2.143 4.25 0 2.054.339 3.982 2.286 3.982 1.232 0 1.821-1.071 1.964-2.482zm6.411-2.125c0-4.786-.25-6.857-1.357-8.357-.232-.304-.607-.5-.911-.714-1.125-.821-6.357-1.125-12.446-1.125S6.858 5.983 5.75 6.804c-.321.232-.714.411-.946.714C3.697 9 3.465 11.089 3.465 15.875c0 4.804.25 6.875 1.339 8.357.25.339.625.482.946.732 1.107.821 6.589 1.161 12.679 1.161s11.321-.321 12.446-1.161c.304-.232.696-.375.911-.732 1.125-1.464 1.357-3.554 1.357-8.357zm3.428-13.589v27.429H0V2.286h36.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Cc);
var _default = ForwardRef;
exports["default"] = _default;
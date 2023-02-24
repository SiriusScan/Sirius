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

function FutbolO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.875 14.571L16 10.857l5.125 3.714-1.946 6H12.84zM16 0c8.839 0 16 7.161 16 16s-7.161 16-16 16S0 24.839 0 16 7.161 0 16 0zm11.054 24.107A13.607 13.607 0 0029.715 16v-.054l-1.821 1.589-4.286-4 1.125-5.768 2.393.214c-1.696-2.339-4.125-4.143-6.946-5.036l.946 2.214-5.125 2.839-5.125-2.839.946-2.214a13.737 13.737 0 00-6.946 5.036l2.411-.214 1.107 5.768-4.286 4-1.821-1.589V16c0 3.036.982 5.821 2.661 8.107l.536-2.357 5.821.714 2.482 5.321-2.071 1.232c1.339.446 2.786.696 4.286.696s2.946-.25 4.286-.696l-2.071-1.232 2.482-5.321 5.821-.714z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FutbolO);
var _default = ForwardRef;
exports["default"] = _default;
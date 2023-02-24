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

function Thermometer3(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 18 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.429 24a3.43 3.43 0 01-6.858 0c0-1.429.893-2.732 2.286-3.232V9.143h2.286v11.625A3.436 3.436 0 0111.429 24zm2.285 0a5.697 5.697 0 00-2.286-4.571V5.715a3.43 3.43 0 00-6.858 0v13.714A5.699 5.699 0 002.284 24c0 3.161 2.554 5.714 5.714 5.714S13.712 27.16 13.712 24zM16 24c0 4.411-3.589 8-8 8s-8-3.589-8-8a7.97 7.97 0 012.286-5.589V5.715C2.286 2.554 4.84.001 8 .001s5.714 2.554 5.714 5.714v12.696A7.972 7.972 0 0116 24zm2.286-10.286V16h-3.429v-2.286h3.429zm0-4.571v2.286h-3.429V9.143h3.429zm0-4.572v2.286h-3.429V4.571h3.429z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Thermometer3);
var _default = ForwardRef;
exports["default"] = _default;
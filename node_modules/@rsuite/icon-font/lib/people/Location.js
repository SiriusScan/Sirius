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

function Location(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8 3a3 3 0 110 6 3 3 0 010-6zm0 1a2 2 0 10-.001 3.999A2 2 0 008 4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 0c3 0 6 2.195 6 6.172 0 2.402-1.642 5.443-4.927 9.122l-.313.347a1.028 1.028 0 01-1.521 0C3.746 11.806 2 8.649 2 6.172 2 2.195 5 0 8 0zm0 1C5.217 1 3 3.061 3 6.172c0 2.167 1.639 5.128 4.979 8.796a.029.029 0 00.027.009l.013-.007C11.361 11.3 13 8.339 13 6.172 13 3.062 10.783 1 8 1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 8c2.064 0 3.413.91 3.93 2.673l.056.207.12.485-.971.24-.12-.485C10.661 9.686 9.701 9 8 9c-1.626 0-2.575.627-2.965 1.937l-.05.183-.12.485-.971-.24.12-.485C4.483 8.981 5.856 8 7.999 8z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Location);
var _default = ForwardRef;
exports["default"] = _default;
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

function TagDate(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M1 6.293V1.5a.5.5 0 01.5-.5h4.793l3.354 3.354a.5.5 0 00.707-.707L6.708.001H1.501a1.5 1.5 0 00-1.5 1.5v5.207l2.646 2.646a.5.5 0 00.707-.707L1 6.293z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 4a1 1 0 11-2 0 1 1 0 012 0zM12.5 5a.5.5 0 01.5.5V6h1a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2h1v-.5a.5.5 0 011 0V6h3v-.5a.5.5 0 01.5-.5zM15 9H6v5a1 1 0 00.883.993L7 15h7a1 1 0 00.993-.883L15 14V9zm-3-2H9v1h3V7zM8 7H7a1 1 0 00-.993.883L6 8h2V7zm6 0h-1v1h2a1 1 0 00-.883-.993L14 7z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 11h1a.5.5 0 010 1h-1a.5.5 0 010-1zM8.5 13h1a.5.5 0 010 1h-1a.5.5 0 010-1zM11.5 11h1a.5.5 0 010 1h-1a.5.5 0 010-1zM11.5 13h1a.5.5 0 010 1h-1a.5.5 0 010-1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(TagDate);
var _default = ForwardRef;
exports["default"] = _default;
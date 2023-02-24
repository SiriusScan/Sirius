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

function SearchPeople(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M7 13A6 6 0 107 1a6 6 0 000 12zm0 1A7 7 0 117 0a7 7 0 010 14z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 8a2 2 0 10.001-3.999A2 2 0 007 8zm0 1a3 3 0 110-6 3 3 0 010 6z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 12.5v-.49A3 3 0 007 9c-1.654 0-3 1.349-3 3.01v.49H3v-.49A4.007 4.007 0 017 8a4 4 0 014 4.01v.49h-1zm0 0v-.49A3 3 0 007 9c-1.654 0-3 1.349-3 3.01v.49H3v-.49A4.007 4.007 0 017 8a4 4 0 014 4.01v.49h-1zm5.854 2.646a.5.5 0 01-.707.707l-3.5-3.5a.5.5 0 01.707-.707l3.5 3.5z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SearchPeople);
var _default = ForwardRef;
exports["default"] = _default;
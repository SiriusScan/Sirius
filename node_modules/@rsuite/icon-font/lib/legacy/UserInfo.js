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

function UserInfo(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.586 15l3.707-3.707L14 12l-4 4H3a2 2 0 01-2-2V2a2 2 0 012-2h9a2 2 0 012 2v7h-1V2a1 1 0 00-1-1H3a1 1 0 00-1 1v12a1 1 0 001 1h6.586z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 16a.5.5 0 00.5-.5v-4a.5.5 0 00-1 0v4a.5.5 0 00.5.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 12H14v-1H9.5a.5.5 0 000 1zM7.5 7a1.5 1.5 0 10-.001-3.001A1.5 1.5 0 007.5 7zm0 1a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 11.714V10c0-1.098 1.22-2 2.5-2 1.316 0 2.5.861 2.5 2h1c0-2-2-3-3.5-3S4 8.067 4 10v2l1-.286zm0 0V10c0-1.098 1.22-2 2.5-2 1.316 0 2.5.861 2.5 2h1c0-2-2-3-3.5-3S4 8.067 4 10v2l1-.286z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 11h1v1H4v-1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(UserInfo);
var _default = ForwardRef;
exports["default"] = _default;
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

function TagNumber(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M1 6.293V1.5a.5.5 0 01.5-.5h4.793l3.884 3.884a.5.5 0 00.707-.707L6.707 0H1.5A1.5 1.5 0 000 1.5v5.207l.646.646a.5.5 0 00.707-.707l-.354-.354z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 4a1 1 0 11-2 0 1 1 0 012 0zM8 7a2 2 0 012 2v2a.5.5 0 01-.108.31l-.06.063-2.329 2.07a1.5 1.5 0 00-.495.962l-.008.16v.436L10 15v1H6v-1.435a2.5 2.5 0 01.699-1.734l.14-.134L9 10.775V9.001c0-.5-.5-1-1-1-.464 0-.929.431-.993.893L7 9.001v1H6v-1l.005-.149a2.001 2.001 0 011.838-1.845L8 7.001zM4 7v9H3V9H2V8h1V7zM15 12a1 1 0 011 1v1l-.005.149a2.001 2.001 0 01-1.838 1.845L14 16a2 2 0 01-2-2v-1h1v1c0 .464.431.929.893.993L14 15c.464 0 .929-.431.993-.893L15 14v-2zm0-1v1h-2v-1h2zm0-2c0-.5-.5-1-1-1-.464 0-.929.431-.993.893L13 9v1h-1V9l.005-.149a2.001 2.001 0 011.838-1.845L14 7a2 2 0 012 2v1a1 1 0 01-1 1V9z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(TagNumber);
var _default = ForwardRef;
exports["default"] = _default;
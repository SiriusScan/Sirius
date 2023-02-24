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

function PeoplesUploaded(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12.5 8a2.5 2.5 0 011.625 4.4A3.5 3.5 0 0116 15.5v.5H9v-.5c0-1.347.76-2.516 1.875-3.101A2.5 2.5 0 0112.5 8zm0 5a2.502 2.502 0 00-2.45 2h4.9l-.038-.161A2.501 2.501 0 0012.5 13zm0-4a1.5 1.5 0 10.001 3.001A1.5 1.5 0 0012.5 9zM7 10a2 2 0 110 4c-1.052 0-2 1.084-2 2H4c0-.99.644-2.036 1.578-2.594A2 2 0 017 10zm0 1a1 1 0 100 2 1 1 0 000-2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2.5 12A1.5 1.5 0 011 10.5v-8A1.5 1.5 0 012.5 1h8A1.5 1.5 0 0112 2.5v3a.5.5 0 001 0v-3A2.5 2.5 0 0010.5 0h-8A2.5 2.5 0 000 2.5v8A2.5 2.5 0 002.5 13a.5.5 0 000-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.146 6.146l3-3a.5.5 0 01.707 0l3 3a.5.5 0 01-.707.707L7 4.707v3.792a.5.5 0 01-1 0V4.707L3.854 6.853a.5.5 0 01-.707-.707z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PeoplesUploaded);
var _default = ForwardRef;
exports["default"] = _default;
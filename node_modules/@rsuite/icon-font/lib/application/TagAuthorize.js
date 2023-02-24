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

function TagAuthorize(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5 4a1 1 0 11-2 0 1 1 0 012 0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.5 0a.5.5 0 01.293.095l.06.051 5 5a.5.5 0 01-.638.765l-.069-.058L6.293.999H1.5a.5.5 0 00-.492.41L1 1.499v4.793l4.854 4.853a.5.5 0 01.058.638l-.058.069a.5.5 0 01-.638.058l-.069-.058-5-5a.495.495 0 01-.14-.275l-.006-.079v-5A1.5 1.5 0 011.357.005l.144-.007h5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 9a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-2h-1v2H9V9h7z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.175 10.12a.5.5 0 01.651.759l-3.5 3a.5.5 0 01-.741-.102l-1-1.5a.5.5 0 11.832-.554l.687 1.03 3.072-2.633z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(TagAuthorize);
var _default = ForwardRef;
exports["default"] = _default;
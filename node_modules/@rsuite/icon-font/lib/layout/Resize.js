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

function Resize(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6 8a2 2 0 012 2v4a2 2 0 01-2 2H2a2 2 0 01-2-2v-4a2 2 0 012-2h4zm0 1H2a1 1 0 00-.993.883L1 10v4a1 1 0 00.883.993L2 15h4a1 1 0 00.993-.883L7 14v-4a1 1 0 00-.883-.993L6 9zM10 3h3v3zM8 5l3 3H8zM15 14v-1h1v1a2 2 0 01-2 2h-1v-1h1a1 1 0 001-1zM15 2v1h1V2a2 2 0 00-2-2h-1v1h1a1 1 0 011 1zM1 2v1H0V2a2 2 0 012-2h1v1H2a1 1 0 00-1 1zM15 10h1v2h-1v-2zM15 4h1v2h-1V4zM10 0h2v1h-2V0zM10 15h2v1h-2v-1zM7 0h2v1H7V0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 15h2v1H7v-1zM4 0h2v1H4V0zM15 7h1v2h-1V7zM0 7h1v2H0V7zM0 4h1v2H0V4z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Resize);
var _default = ForwardRef;
exports["default"] = _default;
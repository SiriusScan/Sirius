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

function Crosshairs(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M21.375 18.286h-1.946a1.151 1.151 0 01-1.143-1.143v-2.286c0-.625.518-1.143 1.143-1.143h1.946A8.032 8.032 0 0016 8.339v1.946c0 .625-.518 1.143-1.143 1.143h-2.286a1.151 1.151 0 01-1.143-1.143V8.339a8.032 8.032 0 00-5.375 5.375h1.946c.625 0 1.143.518 1.143 1.143v2.286c0 .625-.518 1.143-1.143 1.143H6.053a8.032 8.032 0 005.375 5.375v-1.946c0-.625.518-1.143 1.143-1.143h2.286c.625 0 1.143.518 1.143 1.143v1.946a8.032 8.032 0 005.375-5.375zm6.054-3.429v2.286c0 .625-.518 1.143-1.143 1.143h-2.554A10.294 10.294 0 0116 26.018v2.554c0 .625-.518 1.143-1.143 1.143h-2.286a1.151 1.151 0 01-1.143-1.143v-2.554a10.294 10.294 0 01-7.732-7.732H1.142a1.151 1.151 0 01-1.143-1.143v-2.286c0-.625.518-1.143 1.143-1.143h2.554a10.294 10.294 0 017.732-7.732V3.428c0-.625.518-1.143 1.143-1.143h2.286c.625 0 1.143.518 1.143 1.143v2.554a10.294 10.294 0 017.732 7.732h2.554c.625 0 1.143.518 1.143 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Crosshairs);
var _default = ForwardRef;
exports["default"] = _default;
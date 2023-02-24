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

function QuoteLeft(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13.714 17.143V24a3.43 3.43 0 01-3.429 3.429H3.428A3.43 3.43 0 01-.001 24V11.429c0-5.036 4.107-9.143 9.143-9.143h1.143c.625 0 1.143.518 1.143 1.143v2.286c0 .625-.518 1.143-1.143 1.143H9.142a4.58 4.58 0 00-4.571 4.571V12c0 .946.768 1.714 1.714 1.714h4a3.43 3.43 0 013.429 3.429zm16 0V24a3.43 3.43 0 01-3.429 3.429h-6.857A3.43 3.43 0 0115.999 24V11.429c0-5.036 4.107-9.143 9.143-9.143h1.143c.625 0 1.143.518 1.143 1.143v2.286c0 .625-.518 1.143-1.143 1.143h-1.143a4.58 4.58 0 00-4.571 4.571V12c0 .946.768 1.714 1.714 1.714h4a3.43 3.43 0 013.429 3.429z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(QuoteLeft);
var _default = ForwardRef;
exports["default"] = _default;
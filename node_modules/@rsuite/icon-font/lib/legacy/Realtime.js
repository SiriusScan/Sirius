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

function Realtime(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M3.643 11.005a284.93 284.93 0 00-.186-.863C2.974 7.944 2.552 6.999 1.5 6.999H0v1h1.5c.292 0 .628.751.98 2.357.036.164.16.746.186.861.376 1.722.595 2.281 1.334 2.281.639 0 .866-.616 1.246-2.346a58.4 58.4 0 00.397-2.02c.086-.469.385-2.151.411-2.296C6.71 3.19 7.31.997 7.499.997c.365 0 .858 2.218 1.504 7.066.854 6.402 1.194 7.934 2.496 7.934 1.047 0 1.324-.888 1.959-4.324l.016-.085c.457-2.475.809-3.591 1.025-3.591h1.5v-1h-1.5c-1.073 0-1.365.927-2.008 4.409l-.016.085c-.445 2.41-.788 3.505-.976 3.505-.365 0-.858-2.218-1.504-7.066C9.141 1.528 8.801-.004 7.499-.004c-1.081 0-1.519 1.602-2.43 6.661-.027.147-.326 1.827-.411 2.294a56.765 56.765 0 01-.39 1.984c-.118.537-.227.953-.327 1.248-.069-.251-.183-.649-.3-1.182z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 5a1 1 0 11-2 0 1 1 0 012 0zM11 12a1 1 0 11-2 0 1 1 0 012 0zM4 10a1 1 0 11-2 0 1 1 0 012 0zM14 11a1 1 0 11-2 0 1 1 0 012 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Realtime);
var _default = ForwardRef;
exports["default"] = _default;
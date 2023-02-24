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

function ShoppingBag(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M31.375 25.143L32 30.732c.036.321-.071.643-.286.893a1.19 1.19 0 01-.857.375H1.143a1.19 1.19 0 01-.857-.375A1.18 1.18 0 010 30.732l.625-5.589h30.75zm-1.661-14.982L31.25 24H.75l1.536-13.839a1.158 1.158 0 011.143-1.018H8v2.286c0 1.268 1.018 2.286 2.286 2.286s2.286-1.018 2.286-2.286V9.143h6.857v2.286c0 1.268 1.018 2.286 2.286 2.286s2.286-1.018 2.286-2.286V9.143h4.571c.589 0 1.071.446 1.143 1.018zm-6.857-3.304v4.571c0 .625-.518 1.143-1.143 1.143s-1.143-.518-1.143-1.143V6.857c0-2.518-2.054-4.571-4.571-4.571s-4.571 2.054-4.571 4.571v4.571c0 .625-.518 1.143-1.143 1.143s-1.143-.518-1.143-1.143V6.857C9.143 3.071 12.214 0 16 0s6.857 3.071 6.857 6.857z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ShoppingBag);
var _default = ForwardRef;
exports["default"] = _default;
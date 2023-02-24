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

function Wpbeginner(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.857 14.857h2.857v-4H6.857v4zm14.947 5.929v-1.643c-1.536.536-2.804.661-4.339.679-3.446.018-6.5-1.411-8.571-3.018l.018 1.714c1.946 1.768 4.929 3.161 8.643 3.143 1.554 0 3.018-.321 4.25-.875zm-10.375-5.929h11.429v-4H11.429v4zM32 14.286c0 2.268-.643 4.411-1.768 6.286 1 1.143 1.589 2.554 1.589 4.089 0 3.732-3.536 6.768-7.911 6.768-2.964 0-5.536-1.393-6.893-3.446-.339.018-.679.018-1.018.018s-.679 0-1.018-.018c-1.357 2.054-3.929 3.446-6.893 3.446-4.375 0-7.911-3.036-7.911-6.768 0-1.536.589-2.946 1.589-4.089-1.125-1.875-1.768-4.018-1.768-6.286 0-7.571 7.161-13.714 16-13.714s16 6.143 16 13.714z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Wpbeginner);
var _default = ForwardRef;
exports["default"] = _default;
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

function LogoMobile(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M30.025 7.641a1.976 1.976 0 00-1.973 1.975c0 .256.057.498.146.722l-5.774 6.242c-.183-.055-.363-.114-.565-.114-.279 0-.542.059-.782.165l-.834-.731V4.929c0-2.025-1.609-3.675-3.586-3.675H3.587c-1.979 0-3.589 1.648-3.589 3.675v22.144c0 2.027 1.609 3.675 3.589 3.675h13.07c1.977 0 3.586-1.65 3.586-3.675v-7.566c.352.535.928.907 1.618.907a1.976 1.976 0 001.973-1.975c0-.256-.055-.498-.146-.725l5.776-6.242c.183.055.363.114.565.114 1.088.002 1.97-.882 1.97-1.973s-.882-1.973-1.975-1.973zM10.121 28.814a1.529 1.529 0 110-3.058 1.529 1.529 0 010 3.058zm-6.802-4.599V4.928c0-.153.119-.279.267-.279h13.07c.149 0 .272.123.272.279v8.082l-1.051-.919c.043-.162.101-.325.101-.503a1.974 1.974 0 10-3.948 0c0 .215.057.411.121.606L7.6 16.601a1.914 1.914 0 00-.677-.137 1.974 1.974 0 101.973 1.975c0-.215-.057-.414-.121-.608l4.551-4.407c.213.078.439.137.679.137.279 0 .542-.059.782-.165l2.142 1.867v8.951H3.32z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(LogoMobile);
var _default = ForwardRef;
exports["default"] = _default;
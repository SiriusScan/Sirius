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

function Stumbleupon(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.964 12.714v-2.107c0-1-.821-1.821-1.821-1.821s-1.821.821-1.821 1.821v10.929c0 4.179-3.464 7.554-7.661 7.554A7.66 7.66 0 010 21.429v-4.75h5.857v4.679c0 1.018.821 1.821 1.821 1.821s1.821-.804 1.821-1.821V10.287c0-4.089 3.5-7.375 7.643-7.375 4.161 0 7.643 3.304 7.643 7.429v2.429l-3.482 1.036zm9.465 3.965h5.857v4.75a7.66 7.66 0 01-7.661 7.661c-4.214 0-7.661-3.393-7.661-7.589v-4.786l2.339 1.089 3.482-1.036v4.821c0 1 .821 1.804 1.821 1.804s1.821-.804 1.821-1.804v-4.911z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Stumbleupon);
var _default = ForwardRef;
exports["default"] = _default;
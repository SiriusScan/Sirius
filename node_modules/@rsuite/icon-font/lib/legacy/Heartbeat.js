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

function Heartbeat(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.857 18.286h5.446c-.214.232-.357.357-.393.393L16.785 29.393c-.214.214-.5.321-.786.321s-.571-.107-.786-.321L4.07 18.643c-.036-.018-.179-.143-.375-.357h6.589c.518 0 .982-.357 1.107-.857l1.25-5.018 3.393 11.911c.143.482.589.821 1.107.821.5 0 .946-.339 1.089-.821l2.607-8.661 1 2a1.16 1.16 0 001.018.625zM32 10.643c0 2.054-.893 3.929-1.839 5.357h-6.589l-1.982-3.946a1.148 1.148 0 00-1.107-.625c-.482.054-.875.357-1 .821l-2.304 7.679-3.5-12.25a1.157 1.157 0 00-1.125-.821c-.518 0-.964.357-1.089.857l-2.071 8.286H1.84C.894 14.572.001 12.697.001 10.644c0-5.232 3.196-8.357 8.536-8.357 3.125 0 6.054 2.464 7.464 3.857 1.411-1.393 4.339-3.857 7.464-3.857 5.339 0 8.536 3.125 8.536 8.357z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Heartbeat);
var _default = ForwardRef;
exports["default"] = _default;
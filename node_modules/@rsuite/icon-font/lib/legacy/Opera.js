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

function Opera(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.661 4.071c-1.875-1.25-4.071-1.964-6.411-1.964-3.804 0-7.161 1.946-9.518 4.875-1.714 2.143-2.911 5.179-3 8.643v.75c.089 3.464 1.286 6.5 3 8.643 2.357 2.929 5.714 4.875 9.518 4.875 2.339 0 4.536-.714 6.411-1.964A15.908 15.908 0 0116 32c-.25 0-.518 0-.768-.018C6.75 31.589 0 24.589 0 16 0 7.161 7.161 0 16 0h.054a15.989 15.989 0 0110.607 4.071zM32 16c0 4.661-2 8.839-5.179 11.768-1.214.732-2.554 1.125-3.964 1.125-1.643 0-3.196-.536-4.554-1.5 3.625-1.321 6.304-5.911 6.304-11.393 0-5.464-2.661-10.054-6.286-11.393 1.357-.946 2.893-1.482 4.536-1.482 1.446 0 2.804.411 4.036 1.161C30.036 7.215 32 11.375 32 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Opera);
var _default = ForwardRef;
exports["default"] = _default;
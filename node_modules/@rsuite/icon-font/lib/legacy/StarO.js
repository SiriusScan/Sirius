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

function StarO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M20.304 17.929l5.464-5.304-7.536-1.107-3.375-6.821-3.375 6.821-7.536 1.107 5.464 5.304-1.304 7.518 6.75-3.554 6.732 3.554zm9.41-6.375c0 .321-.232.625-.464.857l-6.482 6.321 1.536 8.929c.018.125.018.232.018.357 0 .482-.214.893-.732.893-.25 0-.5-.089-.714-.214l-8.018-4.214-8.018 4.214c-.232.125-.464.214-.714.214-.518 0-.75-.429-.75-.893 0-.125.018-.232.036-.357l1.536-8.929-6.5-6.321c-.214-.232-.446-.536-.446-.857 0-.536.554-.75 1-.821l8.964-1.304 4.018-8.125c.161-.339.464-.732.875-.732s.714.393.875.732l4.018 8.125 8.964 1.304c.429.071 1 .286 1 .821z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(StarO);
var _default = ForwardRef;
exports["default"] = _default;
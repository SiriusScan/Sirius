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

function Behance(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M33 6.054h-9.125v2.214H33V6.054zm-4.5 7.607c-2.143 0-3.571 1.339-3.714 3.482h7.286c-.196-2.161-1.321-3.482-3.571-3.482zm.286 10.446c1.357 0 3.107-.732 3.536-2.125h3.946c-1.214 3.732-3.732 5.482-7.625 5.482-5.143 0-8.339-3.482-8.339-8.554 0-4.893 3.375-8.625 8.339-8.625 5.107 0 7.929 4.018 7.929 8.839 0 .286-.018.571-.036.839h-11.75c0 2.607 1.375 4.143 4 4.143zm-23.84-.893h5.286c2.018 0 3.661-.714 3.661-2.982 0-2.304-1.375-3.214-3.554-3.214H4.946v6.196zm0-9.589h5.018c1.768 0 3.018-.768 3.018-2.679 0-2.071-1.607-2.571-3.393-2.571H4.946v5.25zM0 4.536h10.607c3.857 0 7.196 1.089 7.196 5.571 0 2.268-1.054 3.732-3.071 4.696 2.768.786 4.107 2.875 4.107 5.696 0 4.571-3.839 6.536-7.929 6.536H-.001v-22.5z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Behance);
var _default = ForwardRef;
exports["default"] = _default;
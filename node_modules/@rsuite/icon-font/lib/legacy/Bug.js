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

function Bug(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M29.143 17.143c0 .625-.518 1.143-1.143 1.143h-4c0 2.232-.482 3.911-1.196 5.179l3.714 3.732a1.132 1.132 0 010 1.607c-.214.232-.518.339-.804.339s-.589-.107-.804-.339l-3.536-3.518s-2.339 2.143-5.375 2.143v-16h-2.286v16c-3.232 0-5.589-2.357-5.589-2.357l-3.268 3.696a1.171 1.171 0 01-1.625.089 1.171 1.171 0 01-.089-1.625l3.607-4.054c-.625-1.232-1.036-2.821-1.036-4.893h-4c-.625 0-1.143-.518-1.143-1.143s.518-1.143 1.143-1.143h4v-5.25L2.624 7.66c-.446-.446-.446-1.161 0-1.607s1.161-.446 1.607 0L7.32 9.142h15.071l3.089-3.089c.446-.446 1.161-.446 1.607 0s.446 1.161 0 1.607l-3.089 3.089v5.25h4c.625 0 1.143.518 1.143 1.143zM20.571 6.857H9.142c0-3.161 2.554-5.714 5.714-5.714s5.714 2.554 5.714 5.714z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Bug);
var _default = ForwardRef;
exports["default"] = _default;
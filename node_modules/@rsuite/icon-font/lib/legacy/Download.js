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

function Download(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.857 24c0-.625-.518-1.143-1.143-1.143s-1.143.518-1.143 1.143.518 1.143 1.143 1.143 1.143-.518 1.143-1.143zm4.572 0c0-.625-.518-1.143-1.143-1.143s-1.143.518-1.143 1.143.518 1.143 1.143 1.143 1.143-.518 1.143-1.143zm2.285-4v5.714c0 .946-.768 1.714-1.714 1.714H1.714A1.715 1.715 0 010 25.714V20c0-.946.768-1.714 1.714-1.714h8.304l2.411 2.429c.661.643 1.518 1 2.429 1s1.768-.357 2.429-1l2.429-2.429h8.286c.946 0 1.714.768 1.714 1.714zM23.911 9.839c.179.429.089.929-.25 1.25l-8 8c-.214.232-.518.339-.804.339s-.589-.107-.804-.339l-8-8a1.123 1.123 0 01-.25-1.25 1.156 1.156 0 011.054-.696h4.571v-8c0-.625.518-1.143 1.143-1.143h4.571c.625 0 1.143.518 1.143 1.143v8h4.571c.464 0 .875.286 1.054.696z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Download);
var _default = ForwardRef;
exports["default"] = _default;
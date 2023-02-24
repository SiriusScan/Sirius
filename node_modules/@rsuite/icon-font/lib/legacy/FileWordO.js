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

function FileWordO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.214 6.786c.661.661 1.214 1.982 1.214 2.929v20.571c0 .946-.768 1.714-1.714 1.714h-24A1.715 1.715 0 010 30.286V1.715C0 .769.768.001 1.714.001h16c.946 0 2.268.554 2.929 1.214zm-7.928-4.357v6.714H25c-.107-.304-.268-.607-.393-.732l-5.589-5.589c-.125-.125-.429-.286-.732-.393zm6.857 27.285V11.428h-7.429A1.715 1.715 0 0116 9.714V2.285H2.286v27.429h22.857zm-20.982-16v1.911h1.25L8.34 27.429h2.839l2.286-8.661c.089-.268.143-.536.179-.821.018-.143.036-.286.036-.429h.071l.054.429c.054.25.071.536.161.821l2.286 8.661h2.839l2.929-11.804h1.25v-1.911h-5.357v1.911h1.607l-1.768 7.821a5.185 5.185 0 00-.125.821l-.036.375h-.071c0-.107-.036-.25-.054-.375-.054-.232-.089-.536-.161-.821l-2.571-9.732h-2.036l-2.571 9.732c-.071.286-.089.589-.143.821l-.071.375h-.071l-.036-.375a5.168 5.168 0 00-.125-.821l-1.768-7.821H9.52v-1.911H4.163z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FileWordO);
var _default = ForwardRef;
exports["default"] = _default;
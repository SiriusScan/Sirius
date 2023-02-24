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

function SnowflakeO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27.964 19.946l-2.982.589 3.321 1.911c.536.304.732 1.018.411 1.554s-1.018.732-1.554.411l-3.321-1.893.982 2.857c.5 1.429-1.679 2.161-2.161.75l-1.821-5.357L16 17.982v5.589l3.714 4.25c1 1.125-.732 2.643-1.714 1.5l-2-2.286v3.821c0 .625-.518 1.143-1.143 1.143s-1.143-.518-1.143-1.143v-3.821l-2 2.286c-.982 1.143-2.714-.375-1.714-1.5l3.714-4.25v-5.589l-4.839 2.786-1.821 5.357c-.482 1.411-2.661.679-2.161-.75l.982-2.857-3.321 1.893c-.536.321-1.232.125-1.554-.411s-.125-1.25.411-1.554l3.321-1.911-2.982-.589c-1.482-.304-1.036-2.536.446-2.25l5.536 1.107 4.839-2.804-4.839-2.804-5.536 1.107c-.071.018-.161.018-.232.018-1.357 0-1.554-2-.214-2.268l2.982-.589-3.321-1.911A1.137 1.137 0 011 7.998a1.125 1.125 0 011.554-.411L5.875 9.48l-.982-2.857c-.5-1.429 1.679-2.161 2.161-.75l1.821 5.357 4.839 2.786V8.427L10 4.177c-1-1.125.732-2.643 1.714-1.5l2 2.286V1.142c0-.625.518-1.143 1.143-1.143S16 .517 16 1.142v3.821l2-2.286c.982-1.143 2.714.375 1.714 1.5L16 8.427v5.589l4.839-2.786 1.821-5.357c.482-1.411 2.661-.679 2.161.75l-.982 2.857 3.321-1.893c.536-.321 1.232-.125 1.554.411s.125 1.25-.411 1.554l-3.321 1.911 2.982.589c1.339.268 1.143 2.268-.214 2.268-.071 0-.161 0-.232-.018l-5.536-1.107-4.839 2.804 4.839 2.804 5.536-1.107c1.482-.286 1.929 1.946.446 2.25z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SnowflakeO);
var _default = ForwardRef;
exports["default"] = _default;
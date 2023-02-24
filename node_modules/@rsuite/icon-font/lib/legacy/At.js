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

function At(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M17.357 13.839c0-2.571-1.339-4.107-3.589-4.107-2.964 0-6.143 2.946-6.143 7.714 0 2.661 1.321 4.179 3.643 4.179 3.589 0 6.089-4.107 6.089-7.786zM27.429 16c0 5.554-3.964 7.643-7.357 7.75-.232 0-.321.018-.571.018-1.107 0-1.982-.321-2.536-.946-.339-.393-.536-.893-.589-1.482-1.107 1.393-3.036 2.75-5.446 2.75-3.839 0-6.036-2.375-6.036-6.518 0-5.696 3.946-10.321 8.768-10.321 2.089 0 3.768.893 4.661 2.411l.036-.339.196-1c.018-.143.143-.321.268-.321h2.107c.089 0 .179.125.232.196.054.054.071.196.054.286l-2.143 10.964a4.012 4.012 0 00-.089.857c0 .964.286 1.161 1.018 1.161 1.214-.036 5.143-.536 5.143-5.464 0-6.946-4.482-11.429-11.429-11.429-6.304 0-11.429 5.125-11.429 11.429s5.125 11.429 11.429 11.429c2.625 0 5.196-.911 7.232-2.571a.553.553 0 01.804.071l.732.875a.611.611 0 01.125.429.62.62 0 01-.214.393 13.786 13.786 0 01-8.679 3.089C6.162 29.717.002 23.556.002 16.003S6.163 2.289 13.716 2.289c8.196 0 13.714 5.518 13.714 13.714z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(At);
var _default = ForwardRef;
exports["default"] = _default;
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

function Pagelines(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.036 19.696c-3.589 8.911-12.196 3.518-12.196 3.518-2.643 5.339-7 8.768-12.036 8.786C.358 32 0 31.643 0 31.196s.357-.786.804-.786c4.196-.018 7.857-2.786 10.25-7.179-2.679 1.036-7.732 1.821-10.536-5.357 7.107-2.929 10.375.732 11.625 2.964.643-1.589 1.107-3.321 1.411-5.196 0 0-9.107 1.429-9.75-6.393 7.768-3.125 9.946 5 9.946 5 .107-1.089.214-3.429.214-3.482 0 0-6.929-4.804-2.482-10.768 8.125 2.804 4 10.589 4 10.589.036.107.036 1.554 0 2.179 0 0 2.946-5.804 8.893-3.75-.268 8.732-9.25 6.929-9.25 6.929A27.537 27.537 0 0113.821 21s5.411-5.982 11.214-1.304z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Pagelines);
var _default = ForwardRef;
exports["default"] = _default;
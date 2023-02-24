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

function Skyatlas(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.536 10.411s-.018-.018 0 0zm4.643 3.643c3.464 0 6.393 2.589 6.393 6.125 0 3.768-3 6.536-6.714 6.536-9.482 0-11.232-14.268-20.554-14.268-3.607 0-6.232 2.304-6.232 6 0 3.821 2.857 6.125 6.554 6.125 2.429 0 5.196-1.018 7.161-2.429.321-.232.964-.929 1.304-.929s.625.286.625.625c0 .446-.75 1.089-1.071 1.375-2.339 2.036-5.732 3.5-8.839 3.5-4.768 0-8.804-3.375-8.804-8.286S3.859 9.91 8.734 9.91c10.589 0 12.714 14.054 20.679 14.054 2.393 0 4.196-1.554 4.196-4 0-2.268-1.75-3.982-4-3.982-1 0-2 .661-2.679.661-.482 0-.911-.411-.911-.893 0-.661.304-1.357.304-2.071 0-3.804-2.911-6.554-6.679-6.554-3.036 0-4.571 2.107-5.071 2.107a.64.64 0 01-.643-.643c0-.321.232-.589.446-.821 1.446-1.643 3.696-2.5 5.875-2.5 4.536 0 7.946 3.339 7.946 7.875a8.8 8.8 0 01-.071 1.179 8.09 8.09 0 012.054-.268z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Skyatlas);
var _default = ForwardRef;
exports["default"] = _default;
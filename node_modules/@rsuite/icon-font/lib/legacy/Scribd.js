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

function Scribd(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.786 27.661c0 2.125-1.714 3.857-3.857 3.857s-3.875-1.732-3.875-3.857c0-2.143 1.732-3.875 3.875-3.875s3.857 1.732 3.857 3.875zm-4.161-5.018a5.552 5.552 0 00-4.821 5.5c0 .875.214 1.732.589 2.464-1.607.857-3.786 1.393-6.768 1.393-9.5 0-10.982-6.714-10.982-7.607 0-.911.536-3.893 3.893-3.893s3.821 2.875 3.821 3.464c0 0 0 .607-.411 1.446 1.143 1.071 3.839 1.071 3.839 1.071 2.696 0 4.732-1.321 4.732-3.286 0-1.982-2.286-2.946-7.5-5.393-5.214-2.464-7.179-4.268-7.179-8.75 0-4.5 3-9.054 10.482-9.054s10.304 4.196 10.304 7.071-2.446 3.589-3.357 3.589c-.893 0-4.196.304-4.196-4.661-.589-.661-3.161-.661-3.161-.661-2.589 0-3.732 1.964-3.732 3.161 0 1.214.482 2.714 5.875 4.5 8.268 2.75 8.571 6.339 8.571 9.643z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Scribd);
var _default = ForwardRef;
exports["default"] = _default;
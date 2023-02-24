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

function CommentO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16 6.857C8.571 6.857 2.286 11.036 2.286 16c0 2.661 1.786 5.196 4.875 6.946l1.554.893-.482 1.714a12.855 12.855 0 01-1.25 3.071 17.698 17.698 0 004.911-3.054l.768-.679 1.018.107c.768.089 1.554.143 2.321.143 7.429 0 13.714-4.179 13.714-9.143s-6.286-9.143-13.714-9.143zM32 16c0 6.321-7.161 11.429-16 11.429-.875 0-1.75-.054-2.589-.143-2.339 2.071-5.125 3.536-8.214 4.321-.643.179-1.339.304-2.036.393h-.089c-.357 0-.679-.286-.768-.679v-.018c-.089-.446.214-.714.482-1.036 1.125-1.268 2.411-2.339 3.25-5.321C2.357 22.857 0 19.625 0 16 0 9.679 7.161 4.571 16 4.571S32 9.678 32 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CommentO);
var _default = ForwardRef;
exports["default"] = _default;
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

function TwitterSquare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.857 10.893c-.679.304-1.393.5-2.161.607a3.79 3.79 0 001.661-2.089 7.465 7.465 0 01-2.393.911 3.721 3.721 0 00-2.732-1.179 3.75 3.75 0 00-3.75 3.75c0 .286.018.589.089.857a10.655 10.655 0 01-7.75-3.929 3.811 3.811 0 00-.518 1.893c0 1.304.607 2.446 1.625 3.125-.625-.018-1.214-.196-1.786-.464v.036c0 1.821 1.375 3.339 3.089 3.679-.321.089-.571.143-.911.143-.232 0-.464-.036-.696-.071a3.773 3.773 0 003.5 2.607 7.553 7.553 0 01-5.554 1.553 10.686 10.686 0 005.75 1.679c6.893 0 10.679-5.714 10.679-10.679 0-.161 0-.321-.018-.482a7.226 7.226 0 001.875-1.946zm4.572-3.464v17.143a5.145 5.145 0 01-5.143 5.143H5.143A5.145 5.145 0 010 24.572V7.429a5.145 5.145 0 015.143-5.143h17.143a5.145 5.145 0 015.143 5.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(TwitterSquare);
var _default = ForwardRef;
exports["default"] = _default;
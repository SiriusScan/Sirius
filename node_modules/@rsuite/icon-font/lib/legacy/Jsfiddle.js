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

function Jsfiddle(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M32.143 13.786c2.589 1.071 4.429 3.607 4.429 6.554 0 3.911-3.232 7.089-7.196 7.089-.143 0-.268-.018-.393-.018H7.251c-4-.232-7.25-3.286-7.25-7.25 0-2.661 1.446-4.982 3.607-6.25a4.914 4.914 0 01-.214-1.464c0-2.732 2.232-4.946 5.018-4.946 1.143 0 2.214.393 3.071 1.036a10.864 10.864 0 019.804-6.107c6.018 0 10.875 4.804 10.875 10.714 0 .214-.018.429-.018.643zm-23.786 4.75c0 3.018 2.375 4.714 5.214 4.714 1.75 0 3.018-.554 4.286-1.768-.518-.643-1.089-1.268-1.625-1.911-.732.714-1.536 1.161-2.571 1.161-1.268 0-2.357-.839-2.357-2.161 0-1.304 1.089-2.161 2.321-2.161 3.929 0 4.768 6.857 10.482 6.857 2.786 0 5.143-1.75 5.143-4.679 0-2.964-2.375-4.696-5.196-4.696-1.75 0-3.054.5-4.304 1.732.571.625 1.107 1.286 1.661 1.929.714-.696 1.518-1.143 2.536-1.143 1.179 0 2.357.839 2.357 2.089 0 1.375-1 2.25-2.339 2.25-3.804 0-4.821-6.857-10.393-6.857-2.768 0-5.214 1.696-5.214 4.643z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Jsfiddle);
var _default = ForwardRef;
exports["default"] = _default;
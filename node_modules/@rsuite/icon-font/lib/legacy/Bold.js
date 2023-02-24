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

function Bold(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.911 27.161c.786.339 1.643.571 2.5.571 4.071 0 6.714-1.625 6.714-5.982 0-1.107-.143-2.268-.732-3.214-1.661-2.679-4.054-2.821-6.929-2.821-.536 0-1.304 0-1.804.179 0 1.893-.018 3.786-.018 5.661 0 1.232-.161 4.571.268 5.607zm-.25-13.322c.643.107 1.304.125 1.946.125 3.679 0 6.304-1.036 6.304-5.161 0-3.482-3.089-4.679-6.071-4.679-.786 0-1.554.107-2.321.232 0 1.804.143 3.607.143 5.411 0 .946-.018 1.893-.018 2.839 0 .411 0 .821.018 1.232zM0 29.714l.036-1.679c1.143-.286 2.304-.304 3.411-.768.625-1.054.536-2.911.536-4.107 0-.393.036-17.464-.393-18.304-.268-.518-2.893-.643-3.482-.714L.037 2.66c4.25-.071 8.5-.375 12.732-.375.804 0 1.625.018 2.429.018 4.036 0 8.482 1.929 8.482 6.571 0 3.196-2.429 4.393-4.946 5.536 3.393.768 6.411 3.071 6.411 6.821 0 6.143-5.589 8.179-10.821 8.179-1.571 0-3.143-.107-4.714-.107-3.196 0-6.429.286-9.607.411z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Bold);
var _default = ForwardRef;
exports["default"] = _default;
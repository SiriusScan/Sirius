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

function Dribbble(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.286 26.786c-.179-1.036-.857-4.607-2.5-8.893-.018 0-.054.018-.071.018 0 0-6.946 2.429-9.196 7.321a3.821 3.821 0 00-.268-.196c2.036 1.661 4.625 2.679 7.464 2.679 1.625 0 3.161-.339 4.571-.929zm-3.304-10.84a33.62 33.62 0 00-.946-1.982C8 15.768 2.215 15.625 2.018 15.625 2 15.75 2 15.875 2 16c0 3 1.143 5.75 3 7.821 3.196-5.696 9.518-7.732 9.518-7.732.161-.054.321-.089.464-.143zm-1.911-3.785a70.736 70.736 0 00-4.357-6.75A11.734 11.734 0 002.25 13.59c.304 0 5.196.054 10.821-1.429zm12.215 5.696c-.25-.071-3.518-1.107-7.304-.518 1.536 4.232 2.161 7.679 2.286 8.375a11.762 11.762 0 005.018-7.857zM10.911 4.625c-.018 0-.018 0-.036.018 0 0 .018-.018.036-.018zm10.535 2.589a11.628 11.628 0 00-7.732-2.929c-.946 0-1.875.125-2.768.339.179.232 2.393 3.143 4.393 6.821 4.411-1.643 6.071-4.179 6.107-4.232zm3.983 8.661a11.74 11.74 0 00-2.661-7.321c-.036.036-1.911 2.75-6.536 4.643.268.554.536 1.125.786 1.696.089.196.161.411.25.607 4.036-.518 8.018.357 8.161.375zm2 .125c0 7.571-6.143 13.714-13.714 13.714S.001 23.571.001 16 6.144 2.286 13.715 2.286 27.429 8.429 27.429 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Dribbble);
var _default = ForwardRef;
exports["default"] = _default;
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

function Steam(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M28.25 10.393a4.363 4.363 0 01-4.357 4.357c-2.411 0-4.357-1.946-4.357-4.357s1.946-4.357 4.357-4.357a4.363 4.363 0 014.357 4.357zM14.5 23.643a4.443 4.443 0 00-4.464-4.464c-.321 0-.643.036-.964.107l1.857.75c1.821.732 2.714 2.786 1.982 4.607s-2.804 2.714-4.625 1.964c-.732-.286-1.464-.589-2.196-.875a4.463 4.463 0 003.946 2.375 4.443 4.443 0 004.464-4.464zm14.821-13.232c0-3-2.446-5.446-5.446-5.446-3.018 0-5.464 2.446-5.464 5.446 0 3.018 2.446 5.446 5.464 5.446 3 0 5.446-2.429 5.446-5.446zm2.679 0a8.12 8.12 0 01-8.125 8.125l-7.804 5.696c-.286 3.071-2.893 5.482-6.036 5.482-2.893 0-5.339-2.054-5.929-4.786l-4.107-1.643v-7.661l6.946 2.804a5.905 5.905 0 013.714-.821l5.071-7.268c.036-4.446 3.679-8.054 8.143-8.054 4.482 0 8.125 3.643 8.125 8.125z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Steam);
var _default = ForwardRef;
exports["default"] = _default;
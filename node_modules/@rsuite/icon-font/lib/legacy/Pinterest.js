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

function Pinterest(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27.429 16c0 7.571-6.143 13.714-13.714 13.714-1.357 0-2.643-.196-3.893-.571.518-.821 1.107-1.875 1.393-2.929 0 0 .161-.607.964-3.768.464.911 1.857 1.714 3.339 1.714 4.411 0 7.411-4.018 7.411-9.411 0-4.054-3.446-7.857-8.696-7.857-6.5 0-9.786 4.679-9.786 8.571 0 2.357.893 4.464 2.804 5.25.304.125.589 0 .679-.357.071-.232.214-.839.286-1.089.089-.357.054-.464-.196-.768-.554-.661-.911-1.5-.911-2.696 0-3.464 2.589-6.571 6.75-6.571 3.679 0 5.714 2.25 5.714 5.268 0 3.946-1.75 7.286-4.357 7.286-1.429 0-2.5-1.179-2.161-2.643.411-1.732 1.214-3.607 1.214-4.857 0-1.125-.607-2.071-1.857-2.071-1.464 0-2.643 1.518-2.643 3.554 0 0 0 1.304.446 2.179-1.5 6.357-1.768 7.464-1.768 7.464-.25 1.036-.268 2.196-.232 3.161C3.376 26.448.001 21.627.001 16.002c0-7.571 6.143-13.714 13.714-13.714s13.714 6.143 13.714 13.714z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Pinterest);
var _default = ForwardRef;
exports["default"] = _default;
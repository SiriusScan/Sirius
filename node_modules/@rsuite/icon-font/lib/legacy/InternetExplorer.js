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

function InternetExplorer(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M32 16.732c0 .625-.036 1.25-.125 1.857H11.321c0 3.554 3.125 6.125 6.554 6.125 2.321 0 4.554-1.143 5.75-3.161h7.554a14.405 14.405 0 01-13.554 9.571 14.51 14.51 0 01-6.357-1.482c-2 1.018-4.804 2.071-7.036 2.071-3 0-4.232-1.839-4.232-4.696 0-1.661.357-3.321.804-4.911.286-1.036 1.429-3.143 1.946-4.089 2.196-3.982 5.089-7.804 8.482-10.821-2.732 1.179-5.696 4.143-7.625 6.321A14.382 14.382 0 0117.625 2.356c.268 0 .536 0 .804.018C20.643 1.356 23.733.285 26.161.285c2.893 0 5.375 1.107 5.375 4.375 0 1.714-.661 3.571-1.339 5.107a14.4 14.4 0 011.804 6.964zM30.75 5.304c0-2-1.429-3.232-3.393-3.232-1.5 0-3.196.607-4.536 1.25a14.497 14.497 0 017.018 5.839c.446-1.179.911-2.607.911-3.857zM2.286 27.393c0 2.071 1.232 3.196 3.268 3.196 1.589 0 3.357-.714 4.75-1.482a14.384 14.384 0 01-6.268-7.643c-.821 1.714-1.75 4-1.75 5.929zm9-12.732h13c-.125-3.446-3.161-5.929-6.5-5.929-3.357 0-6.375 2.482-6.5 5.929z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(InternetExplorer);
var _default = ForwardRef;
exports["default"] = _default;
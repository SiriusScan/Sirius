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

function FlagO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 33 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M29.714 18.661v-11c-1.429.768-3.429 1.625-5.464 1.625-.946 0-1.821-.179-2.589-.571-1.911-.946-3.982-1.857-6.464-1.857-2.304 0-5.125 1.125-7.196 2.268v10.696c2.357-1.089 5.357-2.018 7.732-2.018 2.75 0 4.536.911 6.446 1.857l.5.25c.5.25 1.107.393 1.804.393 1.982 0 4.125-1.054 5.232-1.643zm-24-14.09c0 .839-.464 1.571-1.143 1.964v22.607c0 .321-.25.571-.571.571H2.857a.564.564 0 01-.571-.571V6.535a2.274 2.274 0 01-1.143-1.964c0-1.268 1.018-2.286 2.286-2.286s2.286 1.018 2.286 2.286zM32 5.714v13.625c0 .429-.25.821-.625 1.018-.071.036-.179.089-.304.161-1.143.607-3.839 2.071-6.589 2.071-1.054 0-2-.214-2.821-.625l-.5-.25c-1.804-.911-3.232-1.625-5.429-1.625-2.571 0-6.196 1.339-8.286 2.607a1.174 1.174 0 01-1.16.018 1.16 1.16 0 01-.571-1V8.464c0-.393.214-.768.554-.982 1.143-.679 5.179-2.911 8.929-2.911 2.982 0 5.411 1.089 7.464 2.089.464.232 1 .339 1.589.339 2.107 0 4.429-1.339 5.536-2 .232-.125.429-.232.554-.304a1.157 1.157 0 011.107.036c.339.214.554.589.554.982z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FlagO);
var _default = ForwardRef;
exports["default"] = _default;
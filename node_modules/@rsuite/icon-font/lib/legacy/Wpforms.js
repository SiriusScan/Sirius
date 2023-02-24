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

function Wpforms(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.196 16.268v2.286h-4.5v-2.286h4.5zm0-4.554v2.268h-4.5v-2.268h4.5zm13.536 9.125v2.286h-6.089v-2.286h6.089zm0-4.571v2.286h-12v-2.286h12zm0-4.554v2.268h-12v-2.268h12zm2.411 15.357V4.928a.359.359 0 00-.357-.357h-.571l-6.75 4.571-3.75-3.054-3.75 3.054-6.75-4.571h-.571a.359.359 0 00-.357.357v22.143c0 .196.161.357.357.357h22.143a.359.359 0 00.357-.357zM9.875 7.25l3.304-2.679h-7.25zm7.679 0L21.5 4.571h-7.25zm9.875-2.321v22.143a2.637 2.637 0 01-2.643 2.643H2.643A2.637 2.637 0 010 27.072V4.929a2.637 2.637 0 012.643-2.643h22.143a2.637 2.637 0 012.643 2.643z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Wpforms);
var _default = ForwardRef;
exports["default"] = _default;
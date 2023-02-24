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

function Target(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 14 14",
    width: "1em",
    height: "1em",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M14 6.7h-.9C13 3.6 10.4 1 7.3.9V0h-.6v.9C3.6 1 1 3.6.9 6.7H0v.5h.9c.1 3.2 2.7 5.8 5.8 5.9v.9h.5v-.9c3.2-.1 5.7-2.7 5.9-5.9h.9v-.5zm-1.7 0h-2.1c-.1-1.6-1.4-2.9-3-3v-2c2.8.1 5 2.3 5.1 5zM9 7.3c-.1.9-.8 1.6-1.7 1.7v-.2h-.6V9c-.9-.1-1.6-.8-1.7-1.7h.2v-.6H5c.1-.9.8-1.6 1.7-1.7v.2h.5V5c1 .1 1.7.8 1.8 1.7h-.2v.5H9zM6.7 1.7v2.1c-1.6.1-2.9 1.4-3 3h-2c.1-2.8 2.3-5 5-5.1zm-5 5.6h2.1c.1 1.6 1.4 2.9 3 3v2.1c-2.8-.2-5-2.4-5.1-5.1zm5.6 5v-2.1c1.6-.1 2.9-1.4 3-3h2.1c-.2 2.8-2.4 5-5.1 5.1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Target);
var _default = ForwardRef;
exports["default"] = _default;
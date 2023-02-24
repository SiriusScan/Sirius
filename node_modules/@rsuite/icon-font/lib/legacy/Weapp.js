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

function Weapp(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 14 14",
    width: "1em",
    height: "1em",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M7 0C3.1 0 0 3.1 0 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm4.1 6.4c-.3.5-.8.9-1.4 1.1h-.3c-.4 0-.7-.3-.5-.6.1-.3.3-.5.6-.6.5-.2.8-.6.8-1 0-.6-.6-1.1-1.3-1.1-.7 0-1.3.5-1.3 1.1v3.4c0 .8-.5 1.5-1.2 1.9-.5.3-.9.4-1.4.4-1.4 0-2.5-1-2.5-2.3 0-.4.1-.8.3-1.1.3-.5.8-.9 1.4-1.1.1 0 .2-.1.3-.1.4 0 .7.3.5.6 0 .4-.2.6-.5.7h-.1c-.5.2-.8.6-.8 1 0 .6.6 1.1 1.3 1.1.7 0 1.3-.5 1.3-1.1V5.3c0-.8.5-1.5 1.2-1.9.5-.3.9-.4 1.4-.4 1.4 0 2.5 1 2.5 2.3 0 .4-.1.8-.3 1.1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Weapp);
var _default = ForwardRef;
exports["default"] = _default;
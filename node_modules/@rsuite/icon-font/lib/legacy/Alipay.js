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

function Alipay(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 14 14",
    width: "1em",
    height: "1em",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.4 9c-1.1-.5-2.1-1.2-3.3-1.2-.5 0-.9 0-1.4.3C1 8.4.6 8.8.5 9.5c-.1.6.5 1.4 1 1.6.1 0 .2.2.8.2 1.7.2 3.3-.8 4.1-2.3zm7.6 3.7c-1.1-.5-2.2-1-3.3-1.6-.7-.3-2.9-1.4-2.9-1.4l-.4.4c-1.1 1.3-2.2 2-3.8 2.3-.7.1-1.2 0-2-.3C.7 11.9 0 11 0 9.9c0-1.2.5-2.2 1.4-2.7 1-.6 2.3-.4 3.4-.1.7.2 2.5.7 2.5.7s.3-.9.4-1.1c.1-.2.4-1 .4-1H2.4V5h3V3.9H1.8v-.7h3.6V1.3H7v2h3.6V4H7v1h3c-.3 1.2-.8 2.2-1.2 3.3 1.6.8 3.5 1.4 5.2 1.9v2.5z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Alipay);
var _default = ForwardRef;
exports["default"] = _default;
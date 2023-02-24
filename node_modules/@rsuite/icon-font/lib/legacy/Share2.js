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

function Share2(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.667 22.229c0-1.223-.434-2.27-1.303-3.145s-1.913-1.312-3.136-1.312a4.23 4.23 0 00-3.022 1.209l-5.022-2.501c.027-.222.041-.382.041-.478s-.014-.256-.041-.478l5.022-2.501a4.237 4.237 0 003.022 1.207c1.223 0 2.267-.437 3.136-1.312s1.303-1.922 1.303-3.145-.434-2.267-1.303-3.136-1.913-1.303-3.136-1.303-2.27.434-3.145 1.303-1.312 1.913-1.312 3.136c0 .096.014.256.041.478l-5.022 2.501c-.862-.791-1.867-1.189-3.022-1.189-1.223 0-2.267.434-3.136 1.303s-1.303 1.913-1.303 3.136.434 2.267 1.303 3.136 1.913 1.303 3.136 1.303c1.152 0 2.16-.395 3.022-1.189l5.022 2.501a4.569 4.569 0 00-.041.478c0 1.223.437 2.267 1.312 3.136s1.922 1.303 3.145 1.303 2.267-.434 3.136-1.303 1.303-1.913 1.303-3.136v-.002zM32 6v20c0 1.653-.587 3.065-1.76 4.24S27.653 32 26 32H6c-1.653 0-3.065-.587-4.24-1.76S0 27.653 0 26V6c0-1.653.587-3.065 1.76-4.24S4.347 0 6 0h20c1.653 0 3.065.587 4.24 1.76S32 4.347 32 6z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Share2);
var _default = ForwardRef;
exports["default"] = _default;
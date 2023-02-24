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

function WechatOutline(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6 1c2.994 0 5.475 2.01 5.927 4.637l-.986.169C10.569 3.644 8.489 1.999 6 1.999c-2.78 0-5 2.035-5 4.5 0 1.16.49 2.253 1.363 3.086l.421.402-.285 1.142h.002l.001.002 1.216-.608.405.148a5.463 5.463 0 001.878.328 5.61 5.61 0 001.08-.105l.194.981a6.584 6.584 0 01-3.495-.265l-2.779 1.389.673-2.69C.638 9.321.001 7.978.001 6.499c0-3.038 2.686-5.5 6-5.5zM4.5 4a.5.5 0 110 1 .5.5 0 010-1zm4 0a.5.5 0 110 1 .5.5 0 010-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.321 12.406l.471-.402C14.564 11.345 15 10.45 15 9.5 15 7.592 13.231 6 11 6S7 7.592 7 9.5 8.769 13 11 13c.439 0 .867-.062 1.273-.181l.378-.111.852.426-.182-.727zM11 5c2.761 0 5 2.015 5 4.5 0 1.285-.599 2.445-1.559 3.265L15 15l-2.444-1.222A5.515 5.515 0 0111 14c-2.761 0-5-2.015-5-4.5S8.239 5 11 5zM9.5 8a.5.5 0 100 1 .5.5 0 000-1zm3 0a.5.5 0 100 1 .5.5 0 000-1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(WechatOutline);
var _default = ForwardRef;
exports["default"] = _default;
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

function WechatTemplate(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M14 1a2 2 0 012 2v7h-1V5H5v6.5a.5.5 0 01-1 0V5H1v7a1 1 0 001 1h6v1H2a2 2 0 01-2-2V3a2 2 0 012-2h12zm0 1H2a1 1 0 00-1 1v1h14V3a1 1 0 00-1-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.321 13.406l.471-.402C14.564 12.345 15 11.45 15 10.5 15 8.592 13.231 7 11 7s-4 1.592-4 3.5S8.769 14 11 14c.439 0 .867-.062 1.273-.181l.378-.111.852.426-.182-.727zM15 16l-2.444-1.222A5.515 5.515 0 0111 15c-2.761 0-5-2.015-5-4.5S8.239 6 11 6s5 2.015 5 4.5c0 1.285-.599 2.445-1.559 3.265L15 16zm-5.5-6a.5.5 0 110-1 .5.5 0 010 1zm3 0a.5.5 0 110-1 .5.5 0 010 1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(WechatTemplate);
var _default = ForwardRef;
exports["default"] = _default;